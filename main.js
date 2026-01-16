// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// Navbar effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  const scrolled = window.scrollY;
  if (!navbar) return;
  if (scrolled > 80) {
    navbar.classList.add('shadow-lg', 'bg-white');
    navbar.classList.remove('bg-white/90');
  } else {
    navbar.classList.remove('shadow-lg', 'bg-white');
    navbar.classList.add('bg-white/90');
  }
});

// Mobile menu
const mobileBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
if (mobileBtn && mobileMenu) {
  mobileBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
  });
  mobileMenu.querySelectorAll('a').forEach((link) =>
    link.addEventListener('click', () => mobileMenu.classList.add('hidden'))
  );
}

// Reveal animation
const revealElements = document.querySelectorAll('section, .product-card');
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-slideUp');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);
revealElements.forEach((el) => observer.observe(el));

// Form submit
const form = document.getElementById('contact-form');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const payload = {
      name: data.get('name'),
      phone: data.get('phone'),
      region: data.get('region'),
      workType: data.get('work-type'),
      minQuantity: data.get('min-quantity') ? parseInt(data.get('min-quantity')) : null,
      message: data.get('message'),
    };

    // 제출 버튼 비활성화
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = '전송 중...';

    try {
      // API 호출
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        // 성공 시 모달 표시
    
    // 작업 종류별 정보 매핑
    const workInfo = {
      '장난감부품버클캡': {
        name: '장난감 부품 버클캡',
        price: 100,
        quantity: '1,000-5,000',
        description: '장난감 부품의 버클 캡을 조립하는 단순 작업입니다. 작업 난이도가 비교적 낮아 처음 시작하시는 분께 추천드립니다.',
        recommended: 3000,
        estimated: 300000
      },
      '폰케이스스티커': {
        name: '폰케이스 스티커',
        price: 1000,
        quantity: '500-3,000',
        description: '폰케이스에 스티커를 부착하는 작업입니다. 세심함이 필요한 작업으로 단가가 높은 편입니다.',
        recommended: 1000,
        estimated: 1000000
      },
      '단추부자재': {
        name: '단추부자재',
        price: 300,
        quantity: '1,000-3,000',
        description: '단추와 부자재를 조립하는 작업입니다. 규칙적인 패턴으로 진행할 수 있어 리듬감 있게 작업하실 수 있습니다.',
        recommended: 2000,
        estimated: 600000
      },
      '머리핀': {
        name: '머리핀',
        price: 200,
        quantity: '1,000-3,000',
        description: '머리핀을 제작하는 작업입니다. 작은 부품을 다루는 작업으로 집중력이 필요합니다.',
        recommended: 2000,
        estimated: 400000
      },
      '커넥터': {
        name: '커넥터',
        price: 400,
        quantity: '500-2,000',
        description: '커넥터를 조립하는 작업입니다. 정확한 위치에 부품을 결합하는 작업으로 세심함이 필요합니다.',
        recommended: 1000,
        estimated: 400000
      },
      '꽃꽂이': {
        name: '꽃꽂이',
        price: 200,
        quantity: '1,000-3,000',
        description: '꽃꽂이를 만드는 작업입니다. 아름다운 디자인으로 제작하는 창의적인 작업입니다.',
        recommended: 2000,
        estimated: 400000
      },
      '열쇠고리': {
        name: '열쇠고리',
        price: 200,
        quantity: '1,000-3,000',
        description: '열쇠고리를 제작하는 작업입니다. 다양한 디자인의 열쇠고리를 만드는 작업입니다.',
        recommended: 2000,
        estimated: 400000
      },
      '스티커': {
        name: '스티커',
        price: 100,
        quantity: '5,000-10,000',
        description: '스티커를 포장하거나 부착하는 작업입니다. 난이도가 가장 낮아서 처음 해보시는 분들께 인기가 많습니다.',
        recommended: 7000,
        estimated: 700000
      }
    };
    
    const selectedWork = workInfo[payload.workType] || {
      name: payload.workType,
      price: 0,
      quantity: '-',
      description: '선택하신 작업에 대한 상세 안내는 담당자가 개별 상담 시 안내해 드립니다.',
      recommended: 0,
      estimated: 0
    };
    
    // 미리보기 모달 생성
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-gray-600/50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
      <div class="bg-white rounded-lg shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto relative">
        <!-- Close Button -->
        <button onclick="this.closest('.fixed').remove()" 
          class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
        
        <!-- Content -->
        <div class="p-6">
          <!-- Header -->
          <div class="flex items-center gap-2 mb-4">
            <span class="text-xl">📦</span>
            <h3 class="text-base font-semibold text-gray-900">수공예 재료 택배 신청서 (미리보기)</h3>
          </div>
          
          <!-- Confirmation Message -->
          <p class="text-lg font-bold text-gray-900 mb-6">${selectedWork.name} 신청이 접수되었습니다</p>
          
          <!-- Application Details -->
          <div class="space-y-3 mb-6 border-b border-gray-200 pb-6">
            <div class="flex justify-between items-start">
              <span class="text-gray-600 text-sm">신청자</span>
              <span class="text-gray-900 font-medium text-right">${payload.name}</span>
            </div>
            <div class="flex justify-between items-start">
              <span class="text-gray-600 text-sm">연락처</span>
              <span class="text-gray-900 font-medium text-right">${payload.phone}</span>
            </div>
            <div class="flex justify-between items-start">
              <span class="text-gray-600 text-sm">배송지</span>
              <span class="text-gray-900 font-medium text-right">${payload.region}</span>
            </div>
            <div class="flex justify-between items-start">
              <span class="text-gray-600 text-sm">신청 재료</span>
              <span class="text-gray-900 font-medium text-right">${selectedWork.name} (단가 ${selectedWork.price.toLocaleString()}원)</span>
            </div>
            ${payload.minQuantity ? `
            <div class="flex justify-between items-start">
              <span class="text-gray-600 text-sm">최소 수량</span>
              <span class="text-gray-900 font-medium text-right">${payload.minQuantity}개</span>
            </div>
            ` : ''}
          </div>
          
          <!-- Work Description -->
          <p class="text-gray-700 mb-6 leading-relaxed text-sm">${selectedWork.description}</p>
          
          <!-- Earnings Summary -->
          <div class="mb-6">
            <p class="text-gray-700 mb-2 text-sm">
              단가 <span class="font-bold text-primary-600">${selectedWork.price.toLocaleString()}원</span> - 
              신입 추천 수량 <span class="font-bold text-primary-600">${selectedWork.recommended.toLocaleString()}개</span>
            </p>
            <p class="text-gray-700 text-sm">
              예상 총 정산 급여 약 <span class="font-bold text-primary-600">${Math.floor(selectedWork.estimated / 10000)}만원</span> (예시)
            </p>
          </div>
          
          <!-- Disclaimer -->
          <p class="text-xs text-gray-500 leading-relaxed mb-4">
            * 위 내용은 온라인 신청서를 기반으로 자동 생성된 미리보기이며, 실제 배정 전 담당자가 전화·카톡 상담을 통해 수량·일정·단가를 한 번 더 확인해 드립니다.
          </p>
          
          <!-- Close Button -->
          <button onclick="this.closest('.fixed').remove()" 
            class="w-full px-5 py-3 rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold hover:shadow-lg transition-all">
            확인
          </button>
        </div>
      </div>
    `;
        document.body.appendChild(modal);
        
        // 모달 배경 클릭 시 닫기
        modal.addEventListener('click', (e) => {
          if (e.target === modal) {
            modal.remove();
          }
        });
        
        form.reset();
      } else {
        // 실패 시 에러 메시지 표시
        alert('문의 제출에 실패했습니다: ' + (result.error || '알 수 없는 오류'));
        submitButton.disabled = false;
        submitButton.textContent = originalText;
      }
    } catch (error) {
      console.error('문의 제출 오류:', error);
      alert('문의 제출 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      submitButton.disabled = false;
      submitButton.textContent = originalText;
    }
  });
}

// FAQ Accordion
document.querySelectorAll('.faq-item').forEach((item) => {
  const question = item.querySelector('.faq-question');
  const answer = item.querySelector('.faq-answer');
  const icon = question.querySelector('span:last-child');
  
  question.addEventListener('click', () => {
    const isOpen = !answer.classList.contains('hidden');
    
    // Close all other FAQs
    document.querySelectorAll('.faq-answer').forEach((ans) => {
      ans.classList.add('hidden');
    });
    document.querySelectorAll('.faq-question span:last-child').forEach((ic) => {
      ic.textContent = '+';
    });
    
    // Toggle current FAQ
    if (isOpen) {
      answer.classList.add('hidden');
      icon.textContent = '+';
    } else {
      answer.classList.remove('hidden');
      icon.textContent = '−';
    }
  });
});

// Fixed buttons scroll behavior
const topButton = document.getElementById('top-button');
const topButtonMobile = document.getElementById('top-button-mobile');

const updateTopButtons = () => {
  const scrolled = window.scrollY;
  const isVisible = scrolled > 300;
  
  if (topButton) {
    topButton.style.opacity = isVisible ? '1' : '0.5';
    topButton.style.pointerEvents = isVisible ? 'auto' : 'none';
  }
  
  if (topButtonMobile) {
    topButtonMobile.style.opacity = isVisible ? '1' : '0.5';
    topButtonMobile.style.pointerEvents = isVisible ? 'auto' : 'none';
  }
};

window.addEventListener('scroll', updateTopButtons);
updateTopButtons(); // 초기 상태 설정

// Video autoplay with Intersection Observer
const videos = ['video-1', 'video-2', 'video-3', 'video-4'];
const videoElements = videos.map(id => document.getElementById(id)).filter(v => v !== null);

// 비디오 재생 함수
const playVideo = (video) => {
  if (video && video.readyState >= 2) {
    video.play().catch((error) => {
      // 자동재생이 막혔을 경우 무시 (muted이므로 대부분 허용됨)
      console.log('비디오 자동재생:', error.message);
    });
  }
};

// 모든 비디오에 대해 재생 시도
videoElements.forEach((video) => {
  // 비디오 로드 완료 후 재생
  if (video.readyState >= 2) {
    playVideo(video);
  } else {
    video.addEventListener('loadeddata', () => playVideo(video), { once: true });
    video.addEventListener('canplay', () => playVideo(video), { once: true });
  }
  
  // 에러 처리
  video.addEventListener('error', (e) => {
    console.error('비디오 로드 오류:', e);
  });
  
  // 일시정지 시 다시 재생 (무한 루프 보장)
  video.addEventListener('pause', () => {
    if (!video.ended) {
      playVideo(video);
    }
  });
  
  // 끝나면 다시 시작 (loop 속성 보완)
  video.addEventListener('ended', () => {
    video.currentTime = 0;
    playVideo(video);
  });
});

// Intersection Observer로 화면에 보일 때 재생
const videoObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      playVideo(entry.target);
    }
  });
}, { threshold: 0.1 });

videoElements.forEach((video) => {
  videoObserver.observe(video);
});

console.log('로지알 랜딩페이지 로드 완료');
