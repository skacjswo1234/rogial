// 로지알 실시간 상담 채팅

// 고유 세션 ID 생성 (고객별 채팅방 구분용)
function generateSessionId() {
  // localStorage에서 기존 세션 ID 확인
  let sessionId = localStorage.getItem('chatSessionId');
  if (!sessionId) {
    // 새 세션 ID 생성: 타임스탬프 + 랜덤 문자열
    sessionId = 'chat_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
    localStorage.setItem('chatSessionId', sessionId);
  }
  return sessionId;
}

// 현재 채팅 세션 정보
let chatSession = {
  customerName: null,
  customerPhone: null,
  inquiryId: null,
  sessionId: generateSessionId(), // 고객별 고유 세션 ID
  lastMessageId: 0
};

// 실시간 메시지 스트림 연결
let messageEventSource = null;

// 실시간 메시지 전송
async function sendChatbotMessage() {
  const input = document.getElementById('chatbot-input');
  const message = input.value.trim();
  
  if (!message) return;
  
  // 사용자 메시지 표시
  addMessage(message, 'user');
  input.value = '';
  
  // 입력 비활성화
  const sendButton = document.getElementById('chatbot-send');
  sendButton.disabled = true;
  sendButton.innerHTML = '<svg class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>';
  
  try {
    // 실시간 메시지 전송
    // inquiry_id가 없으면 sessionId를 사용하여 고객별 채팅방 구분
    const response = await fetch('/api/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inquiry_id: chatSession.inquiryId || chatSession.sessionId, // inquiry_id가 없으면 sessionId 사용
        sender_type: 'customer',
        sender_name: chatSession.customerName || '고객',
        message: message
      }),
    });

    const result = await response.json();
    
    if (result.success) {
      chatSession.lastMessageId = Math.max(chatSession.lastMessageId, result.data.id);
      
      // 첫 메시지인 경우 상담원 연결 안내 (이미 메시지가 있으면 표시하지 않음)
      const messagesContainer = document.getElementById('chatbot-messages');
      if (!chatSession.customerName && messagesContainer && messagesContainer.children.length <= 1) {
        setTimeout(() => {
          addMessage('상담원이 연결되었습니다. 잠시만 기다려 주세요...', 'bot', '상담원');
      }, 1000);
      }
    } else {
      addMessage('메시지 전송에 실패했습니다. 잠시 후 다시 시도해 주세요.', 'bot', '시스템');
    }
  } catch (error) {
    console.error('메시지 전송 오류:', error);
    addMessage('메시지 전송 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.', 'bot', '시스템');
  } finally {
    sendButton.disabled = false;
    sendButton.innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>';
  }
}

// 메시지 추가
function addMessage(text, type, senderName = null) {
  const messagesContainer = document.getElementById('chatbot-messages');
  const messageDiv = document.createElement('div');
  messageDiv.className = `flex items-start gap-3 ${type === 'user' ? 'flex-row-reverse' : ''}`;
  
  const time = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  
  if (type === 'user') {
    messageDiv.innerHTML = `
      <div class="flex-1">
        <div class="bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl rounded-tr-none p-4 shadow-sm">
          <p class="text-sm whitespace-pre-wrap">${escapeHtml(text)}</p>
        </div>
        <p class="text-xs text-gray-500 mt-1 mr-2 text-right">${time}</p>
      </div>
    `;
  } else {
    const displayName = senderName || '상담원';
    messageDiv.innerHTML = `
      <div class="w-8 h-8 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
        <img src="./images/ai.png" alt="상담원" class="w-full h-full object-contain p-1.5" />
      </div>
      <div class="flex-1">
        <div class="bg-white rounded-2xl rounded-tl-none p-4 shadow-sm border border-gray-200">
          <p class="text-gray-800 text-sm whitespace-pre-wrap">${escapeHtml(text)}</p>
        </div>
        <p class="text-xs text-gray-500 mt-1 ml-2">${displayName} · ${time}</p>
      </div>
    `;
  }
  
  messagesContainer.appendChild(messageDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// HTML 이스케이프
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// 실시간 메시지 스트림 연결 (SSE)
function connectMessageStream() {
  // 기존 연결이 있으면 닫기
  if (messageEventSource) {
    messageEventSource.close();
  }

  // SSE 연결
  // inquiry_id가 없으면 sessionId 사용
  const inquiryId = chatSession.inquiryId || chatSession.sessionId;
  const streamUrl = `/api/messages/stream?last_message_id=${chatSession.lastMessageId}${inquiryId ? `&inquiry_id=${inquiryId}` : ''}`;
  messageEventSource = new EventSource(streamUrl);

  messageEventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      
      if (data.type === 'message' && data.data) {
        const message = data.data;
        chatSession.lastMessageId = Math.max(chatSession.lastMessageId, message.id);
        
        // 챗봇 창이 열려있고, 상담원 메시지인 경우에만 표시
        const chatbotWindow = document.getElementById('chatbot-window');
        if (chatbotWindow && !chatbotWindow.classList.contains('hidden')) {
          if (message.sender_type === 'admin') {
            addMessage(message.message, 'bot', message.sender_name || '상담원');
          }
        }
      } else if (data.type === 'connected') {
        console.log('실시간 메시지 스트림 연결됨');
      } else if (data.type === 'error') {
        console.error('메시지 스트림 오류:', data.error);
      }
    } catch (error) {
      console.error('메시지 파싱 오류:', error);
    }
  };

  messageEventSource.onerror = (error) => {
    console.error('SSE 연결 오류:', error);
    // 5초 후 재연결 시도
    setTimeout(() => {
      if (messageEventSource && messageEventSource.readyState === EventSource.CLOSED) {
        connectMessageStream();
      }
    }, 5000);
  };
}

// 기존 메시지 로드
async function loadChatHistory() {
  try {
    // inquiry_id가 없으면 sessionId 사용
    const inquiryId = chatSession.inquiryId || chatSession.sessionId;
    const url = `/api/messages?limit=50${inquiryId ? `&inquiry_id=${inquiryId}` : ''}`;
    const response = await fetch(url);
    const result = await response.json();
    
    const messagesContainer = document.getElementById('chatbot-messages');
    
    if (result.success && result.data && result.data.length > 0) {
      // 기존 메시지가 있으면 초기 안내 메시지 제거하고 메시지 표시
      messagesContainer.innerHTML = '';
      
      // 기존 메시지 표시
      result.data.forEach(message => {
        chatSession.lastMessageId = Math.max(chatSession.lastMessageId, message.id);
        const type = message.sender_type === 'customer' ? 'user' : 'bot';
        addMessage(message.message, type, message.sender_name);
      });
    } else {
      // 메시지가 없으면 초기 안내 메시지만 표시 (이전 대화 숨김)
      if (messagesContainer) {
        // 기존 메시지를 모두 제거하고 안내 메시지만 표시
        messagesContainer.innerHTML = `
          <div class="flex items-start gap-3">
            <div class="w-8 h-8 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
              <img src="./images/ai.png" alt="AI" class="w-full h-full object-contain p-1.5" />
            </div>
            <div class="flex-1">
              <div class="bg-white rounded-2xl rounded-tl-none p-4 shadow-sm border border-gray-200">
                <p class="text-gray-800 text-sm">안녕하세요! 로지알 상담입니다. 👋<br>무엇이든 편하게 물어보세요. 상담원이 실시간으로 답변해드립니다.</p>
              </div>
              <p class="text-xs text-gray-500 mt-1 ml-2">방금</p>
            </div>
          </div>
        `;
      }
    }
  } catch (error) {
    console.error('메시지 로드 오류:', error);
    // 에러 발생 시에도 초기 안내 메시지만 표시
    const messagesContainer = document.getElementById('chatbot-messages');
    if (messagesContainer) {
      messagesContainer.innerHTML = `
        <div class="flex items-start gap-3">
          <div class="w-8 h-8 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
            <img src="./images/ai.png" alt="AI" class="w-full h-full object-contain p-1.5" />
          </div>
          <div class="flex-1">
            <div class="bg-white rounded-2xl rounded-tl-none p-4 shadow-sm border border-gray-200">
              <p class="text-gray-800 text-sm">안녕하세요! 로지알 상담입니다. 👋<br>무엇이든 편하게 물어보세요. 상담원이 실시간으로 답변해드립니다.</p>
            </div>
            <p class="text-xs text-gray-500 mt-1 ml-2">방금</p>
          </div>
        </div>
      `;
    }
  }
}

// 모바일 키보드 대응: 챗봇 창 높이 조정
function adjustChatbotHeight() {
  const chatbotWindow = document.getElementById('chatbot-window');
  const chatbotInput = document.getElementById('chatbot-input');
  
  // 챗봇 창이 없거나 숨겨져 있으면 처리하지 않음
  if (!chatbotWindow || chatbotWindow.classList.contains('hidden') || window.innerWidth >= 768) return;
  
  // 모바일에서만 처리
  if (window.visualViewport) {
    // visualViewport 사용 (모던 브라우저)
    const viewportHeight = window.visualViewport.height;
    const windowHeight = window.innerHeight;
    const keyboardHeight = windowHeight - viewportHeight;
    
    if (keyboardHeight > 150) {
      // 키보드가 올라온 경우
      const newHeight = viewportHeight - 100; // 상단 여백 100px
      chatbotWindow.style.height = `${newHeight}px`;
      chatbotWindow.style.maxHeight = `${newHeight}px`;
    } else {
      // 키보드가 내려간 경우
      chatbotWindow.style.height = '';
      chatbotWindow.style.maxHeight = '';
    }
  } else {
    // visualViewport 미지원 브라우저: 더 작은 높이 사용
    chatbotWindow.style.height = 'calc(100dvh - 200px)';
    chatbotWindow.style.maxHeight = 'calc(100dvh - 200px)';
  }
  
  // 입력 필드가 보이도록 스크롤
  if (chatbotInput && document.activeElement === chatbotInput) {
    setTimeout(() => {
      chatbotInput.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 300);
  }
}

// 챗봇 초기화
document.addEventListener('DOMContentLoaded', () => {
  const toggleButton = document.getElementById('chatbot-toggle');
  const chatbotWindow = document.getElementById('chatbot-window');
  const chatbotIcon = document.getElementById('chatbot-icon');
  const chatbotCloseIcon = document.getElementById('chatbot-close-icon');
  const minimizeButton = document.getElementById('chatbot-minimize');
  const chatbotInput = document.getElementById('chatbot-input');
  
  // 초기 상태 확인: 챗봇 창이 숨겨져 있는지 확인
  if (chatbotWindow) {
    chatbotWindow.classList.add('hidden');
  }
  
  // 모바일 키보드 이벤트 처리 (챗봇이 열려있을 때만)
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', () => {
      if (chatbotWindow && !chatbotWindow.classList.contains('hidden')) {
        adjustChatbotHeight();
      }
    });
    window.visualViewport.addEventListener('scroll', () => {
      if (chatbotWindow && !chatbotWindow.classList.contains('hidden')) {
        adjustChatbotHeight();
      }
    });
  }
  
  // 입력 필드 포커스/블러 이벤트 (챗봇이 열려있을 때만)
  if (chatbotInput) {
    chatbotInput.addEventListener('focus', () => {
      if (chatbotWindow && !chatbotWindow.classList.contains('hidden')) {
        setTimeout(adjustChatbotHeight, 300);
      }
    });
    chatbotInput.addEventListener('blur', () => {
      if (chatbotWindow && !chatbotWindow.classList.contains('hidden')) {
        setTimeout(adjustChatbotHeight, 300);
      }
    });
  }
  
  if (toggleButton && chatbotWindow) {
    toggleButton.addEventListener('click', () => {
      const isHidden = chatbotWindow.classList.contains('hidden');
      
      if (isHidden) {
        chatbotWindow.classList.remove('hidden');
        chatbotIcon.classList.add('hidden');
        chatbotCloseIcon.classList.remove('hidden');
        
        // 챗봇 열 때 스트림 연결
        connectMessageStream();
        
        // 기존 메시지 로드 (메시지가 없으면 안내 메시지만 표시)
        loadChatHistory();
        
        // 높이 조정
        setTimeout(adjustChatbotHeight, 100);
      } else {
        chatbotWindow.classList.add('hidden');
        chatbotIcon.classList.remove('hidden');
        chatbotCloseIcon.classList.add('hidden');
        
        // 스트림 연결 종료
        if (messageEventSource) {
          messageEventSource.close();
          messageEventSource = null;
        }
      }
    });
  }
  
  if (minimizeButton && chatbotWindow) {
    minimizeButton.addEventListener('click', () => {
      chatbotWindow.classList.add('hidden');
      chatbotIcon.classList.remove('hidden');
      chatbotCloseIcon.classList.add('hidden');
      
      // 스트림 연결 종료
      if (messageEventSource) {
        messageEventSource.close();
        messageEventSource = null;
      }
      
      // 높이 초기화
      chatbotWindow.style.height = '';
      chatbotWindow.style.maxHeight = '';
    });
  }
  
  // 전역 함수로 등록
  window.sendChatbotMessage = sendChatbotMessage;
});
