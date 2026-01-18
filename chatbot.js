// 로지알 AI 챗봇 - 규칙 기반 FAQ 챗봇

// FAQ 데이터베이스
const faqDatabase = {
  // 재료비/보증금 관련
  '재료비': {
    answer: '아닙니다. 재료는 창고에서 미리 준비한 것을 무료로 발송해 드리며, 별도의 재료비·보증금을 요구하지 않습니다. 다만 고의적인 분실·파손이 반복될 경우에는 배상 규정을 사전에 안내드립니다.',
    keywords: ['재료비', '보증금', '선입금', '비용', '돈', '무료', '무료배송']
  },
  '보증금': {
    answer: '재료비나 보증금은 전혀 필요하지 않습니다. 재료는 무료로 배송해 드리며, 별도의 보증금이나 선입금을 요구하지 않습니다.',
    keywords: ['보증금', '재료비', '선입금', '입금', '보증']
  },
  
  // 불량 관련
  '불량': {
    answer: '작업 초반에는 샘플 검수 기간을 두어 최대한 불이익 없이 피드백을 드립니다. 이후에도 안내된 기준에서 크게 벗어나는 불량분은 정산에서 제외될 수 있으며, 기준은 항상 사전에 공유해 드립니다.',
    keywords: ['불량', '잘못', '실수', '오류', '수당', '깎', '차감', '정산']
  },
  
  // 거리/배송 관련
  '거리': {
    answer: '저희는 전용차로 배송 및 수거를 진행합니다. 작업 완료 후 급여 지급이 완료됩니다. 거리가 멀어도 참여하실 수 있습니다.',
    keywords: ['거리', '멀', '배송', '수거', '택배', '지역', '위치', '도시']
  },
  '배송': {
    answer: '재료는 무료로 배송해 드리며, 완성품은 전용차로 수거해 갑니다. 거리와 상관없이 전국 어디서나 참여 가능합니다.',
    keywords: ['배송', '수거', '택배', '배달', '전용차', '무료배송']
  },
  
  // 육아 관련
  '아이': {
    answer: '많은 분들이 육아와 병행하고 계십니다. 다만 작은 부품이 있는 작업의 경우 아이 손이 닿지 않는 안전한 공간에서만 진행해 주셔야 합니다.',
    keywords: ['아이', '육아', '아기', '자녀', '어린이', '임신', '출산']
  },
  '육아': {
    answer: '육아와 병행하시는 분들이 많이 계십니다. 집에서 여유 시간에 맞춰 작업하실 수 있어 육아와 함께 하기 좋은 부업입니다.',
    keywords: ['육아', '아이', '아기', '자녀', '엄마', '주부']
  },
  
  // 중단/위약금 관련
  '그만': {
    answer: '네. 진행 중인 작업을 마무리하고 검수·정산까지 끝낸 뒤에는 언제든 중단하실 수 있습니다. 별도의 위약금이나 가입비는 없습니다.',
    keywords: ['그만', '중단', '그만두', '위약금', '가입비', '비용', '나가', '탈퇴']
  },
  '위약금': {
    answer: '위약금이나 가입비는 전혀 없습니다. 언제든지 자유롭게 중단하실 수 있으며, 진행 중인 작업만 마무리해 주시면 됩니다.',
    keywords: ['위약금', '가입비', '비용', '중단', '그만']
  },
  
  // 작업 종류 관련
  '작업': {
    answer: '팔찌, 인형 포장, 볼펜 조립, 스티커, 뜨개질 가방 등 다양한 수공예 작업을 하실 수 있습니다. 장난감 부품 버클캡, 폰케이스 스티커, 단추부자재, 머리핀, 커넥터, 꽃꽂이, 열쇠고리, 스티커 등 8가지 작업 종류가 있습니다.',
    keywords: ['작업', '일', '종류', '어떤', '무엇', '제품', '상품']
  },
  '단가': {
    answer: '작업 종류에 따라 단가가 다릅니다. 장난감 부품 버클캡 100원, 폰케이스 스티커 1,000원, 단추부자재 300원, 머리핀 200원, 커넥터 400원, 꽃꽂이 200원, 열쇠고리 200원, 스티커 100원 등입니다. 실제 배정 시기·난이도·브랜드에 따라 달라질 수 있습니다.',
    keywords: ['단가', '가격', '돈', '수당', '급여', '정산', '얼마', '비용']
  },
  '수익': {
    answer: '하루 2~3시간, 주 3~4회 진행 시 월 20만~40만원 수준을 목표로 할 수 있습니다. 개인 능력·시간에 따라 실제 금액은 달라질 수 있습니다.',
    keywords: ['수익', '수입', '급여', '정산', '돈', '얼마', '월급', '부수입']
  },
  
  // 진행 순서 관련
  '순서': {
    answer: '1) 무료 상담 신청 2) 작업 안내 & 일정 조율 3) 재료 발송 & 교육 4) 집에서 제작·포장 5) 완성품 수거·검수 6) 작업비 정산 순서로 진행됩니다.',
    keywords: ['순서', '절차', '과정', '진행', '방법', '어떻게', '시작']
  },
  '시작': {
    answer: '아래 "무료 상담·신청하기" 버튼을 눌러 성함, 연락처, 거주 지역, 가능 시간대를 남겨 주시면 담당자가 순차적으로 연락을 드립니다.',
    keywords: ['시작', '신청', '참여', '가입', '어떻게', '방법', '절차']
  },
  
  // 시간 관련
  '시간': {
    answer: '여유 시간에 맞춰 집에서 편하게 작업하실 수 있습니다. 하루 2~3시간, 주 3~4회 정도 진행하시면 됩니다. 자유로운 일정으로 진행 가능합니다.',
    keywords: ['시간', '일정', '언제', '몇시', '자유', '여유', '언제든']
  },
  '기간': {
    answer: '안내받은 기간(보통 7~15일) 안에 여유 시간에 맞춰 작업해 주시면 됩니다. 중간에 진행 상황을 사진으로 보내 주시면 검수에 도움이 됩니다.',
    keywords: ['기간', '일정', '언제까지', '몇일', '기한', '마감']
  },
  
  // 문의/연락 관련
  '연락': {
    answer: '카카오톡 채널을 통해 문의하시거나, 하단 문의 폼을 작성해 주시면 담당자가 연락을 드립니다. 상담 시간은 10:00 ~ 20:00 (연중무휴)입니다.',
    keywords: ['연락', '문의', '상담', '전화', '카톡', '연락처', '이메일']
  },
  '상담': {
    answer: '무료 상담을 받으실 수 있습니다. 카카오톡 채널이나 하단 문의 폼을 통해 신청해 주시면 담당자가 순차적으로 연락을 드립니다. 상담 시간은 10:00 ~ 20:00 (연중무휴)입니다.',
    keywords: ['상담', '문의', '연락', '신청', '무료상담']
  },
  
  // 일반 인사
  '안녕': {
    answer: '안녕하세요! 로지알 AI 상담입니다. 수공예 손부업에 대해 궁금한 점을 물어보세요!',
    keywords: ['안녕', '하이', '헬로', '반가', '시작']
  },
  '도움': {
    answer: '수공예 손부업에 대한 모든 질문에 답변해 드립니다. 재료비, 불량, 거리, 육아, 작업 종류, 수익, 진행 순서 등 무엇이든 물어보세요!',
    keywords: ['도움', '도와', '질문', '궁금', '알려', '설명']
  }
};

// 키워드 매칭 함수
function findAnswer(userMessage) {
  const lowerMessage = userMessage.toLowerCase();
  
  // 정확한 키워드 매칭
  for (const [key, data] of Object.entries(faqDatabase)) {
    for (const keyword of data.keywords) {
      if (lowerMessage.includes(keyword.toLowerCase())) {
        return data.answer;
      }
    }
  }
  
  // 부분 매칭 (더 유연한 검색)
  const words = lowerMessage.split(/\s+/);
  for (const word of words) {
    for (const [key, data] of Object.entries(faqDatabase)) {
      for (const keyword of data.keywords) {
        if (word.includes(keyword.toLowerCase()) || keyword.toLowerCase().includes(word)) {
          return data.answer;
        }
      }
    }
  }
  
  // 기본 응답
  return '죄송합니다. 질문을 정확히 이해하지 못했습니다. 좀 더 구체적으로 질문해 주시거나 아래와 같이 질문해 보세요:\n\n• 재료비나 보증금이 필요한가요?\n• 어떤 작업을 하나요?\n• 수익은 얼마나 되나요?\n• 어떻게 시작하나요?\n\n또는 카카오톡 채널을 통해 직접 문의해 주세요!';
}

// 챗봇 메시지 전송
function sendChatbotMessage() {
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
  
  // 응답 생성 (약간의 딜레이로 자연스러운 느낌)
  setTimeout(() => {
    const answer = findAnswer(message);
    addMessage(answer, 'bot');
    sendButton.disabled = false;
    sendButton.innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>';
  }, 500);
}

// 메시지 추가
function addMessage(text, type) {
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
    messageDiv.innerHTML = `
      <div class="w-8 h-8 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
        <img src="./images/ai.png" alt="AI" class="w-full h-full object-contain p-1.5" />
      </div>
      <div class="flex-1">
        <div class="bg-white rounded-2xl rounded-tl-none p-4 shadow-sm border border-gray-200">
          <p class="text-gray-800 text-sm whitespace-pre-wrap">${escapeHtml(text)}</p>
        </div>
        <p class="text-xs text-gray-500 mt-1 ml-2">${time}</p>
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

// 챗봇 토글
document.addEventListener('DOMContentLoaded', () => {
  const toggleButton = document.getElementById('chatbot-toggle');
  const chatbotWindow = document.getElementById('chatbot-window');
  const chatbotIcon = document.getElementById('chatbot-icon');
  const chatbotCloseIcon = document.getElementById('chatbot-close-icon');
  const minimizeButton = document.getElementById('chatbot-minimize');
  
  if (toggleButton && chatbotWindow) {
    toggleButton.addEventListener('click', () => {
      const isHidden = chatbotWindow.classList.contains('hidden');
      
      if (isHidden) {
        chatbotWindow.classList.remove('hidden');
        chatbotIcon.classList.add('hidden');
        chatbotCloseIcon.classList.remove('hidden');
      } else {
        chatbotWindow.classList.add('hidden');
        chatbotIcon.classList.remove('hidden');
        chatbotCloseIcon.classList.add('hidden');
      }
    });
  }
  
  if (minimizeButton && chatbotWindow) {
    minimizeButton.addEventListener('click', () => {
      chatbotWindow.classList.add('hidden');
      chatbotIcon.classList.remove('hidden');
      chatbotCloseIcon.classList.add('hidden');
    });
  }
  
  // 전역 함수로 등록
  window.sendChatbotMessage = sendChatbotMessage;
});
