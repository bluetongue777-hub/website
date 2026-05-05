const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');

if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// Carousel — snap scroll with arrows, dots, auto-advance and wrap-around.
document.querySelectorAll('[data-carousel]').forEach((carousel) => {
  const track = carousel.querySelector('[data-carousel-track]');
  const prev = carousel.querySelector('.carousel-btn.prev');
  const next = carousel.querySelector('.carousel-btn.next');
  const dotsWrap = carousel.querySelector('[data-carousel-dots]');
  const slides = Array.from(track.querySelectorAll('.carousel-slide'));
  if (!slides.length) return;

  if (dotsWrap) {
    slides.forEach((slide, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    });
  }
  const dots = dotsWrap ? Array.from(dotsWrap.querySelectorAll('button')) : [];

  let currentIdx = 0;
  const setActive = (idx) => {
    currentIdx = idx;
    dots.forEach((d, i) => d.classList.toggle('active', i === idx));
  };

  const goTo = (idx) => {
    const wrapped = ((idx % slides.length) + slides.length) % slides.length;
    slides[wrapped].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
    setActive(wrapped);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
        const idx = slides.indexOf(entry.target);
        if (idx >= 0) setActive(idx);
      }
    });
  }, { root: track, threshold: [0.6] });
  slides.forEach((s) => observer.observe(s));

  if (prev) prev.addEventListener('click', () => goTo(currentIdx - 1));
  if (next) next.addEventListener('click', () => goTo(currentIdx + 1));

  track.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(currentIdx - 1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); goTo(currentIdx + 1); }
  });

  let autoTimer = null;
  const startAuto = () => { if (!autoTimer) autoTimer = setInterval(() => goTo(currentIdx + 1), 4500); };
  const stopAuto = () => { if (autoTimer) { clearInterval(autoTimer); autoTimer = null; } };
  carousel.addEventListener('mouseenter', stopAuto);
  carousel.addEventListener('mouseleave', startAuto);
  carousel.addEventListener('focusin', stopAuto);
  carousel.addEventListener('focusout', startAuto);
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) startAuto();

  setActive(0);
});

// Highlight active nav link based on scroll position
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.main-nav a[href^="#"]');

if (sections.length && navLinks.length && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach((link) => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });

  sections.forEach((s) => observer.observe(s));
}
