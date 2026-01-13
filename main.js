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
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const payload = {
      name: data.get('name'),
      phone: data.get('phone'),
      region: data.get('region'),
      workType: data.get('work-type'),
      message: data.get('message'),
    };
    console.log('문의 전송', payload);
    
    // 미리보기 카드 생성
    const previewCard = document.createElement('div');
    previewCard.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4';
    previewCard.innerHTML = `
      <div class="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <h3 class="text-2xl font-bold text-gray-900 mb-4">📦 수공예 재료 택배 신청서</h3>
        <div class="space-y-2 text-gray-700 mb-6">
          <p><span class="font-bold">신청자:</span> ${payload.name}</p>
          <p><span class="font-bold">연락처:</span> ${payload.phone}</p>
          <p><span class="font-bold">배송지:</span> ${payload.region}</p>
          <p><span class="font-bold">신청 재료:</span> ${payload.workType}</p>
        </div>
        <p class="text-sm text-gray-600 mb-4">* 위 내용은 온라인 신청서를 기반으로 자동 생성된 미리보기이며, 실제 배정 전 담당자가 전화·카톡 상담을 통해 수량·일정·단가를 한 번 더 확인해 드립니다.</p>
        <button onclick="this.closest('.fixed').remove()" class="w-full px-5 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold hover:shadow-lg transition-all">
          확인
        </button>
      </div>
    `;
    document.body.appendChild(previewCard);
    
    alert('문의가 접수되었습니다. 곧 연락드릴게요!');
    form.reset();
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

console.log('로지알 랜딩페이지 로드 완료');
