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

// Before/after compare sliders
document.querySelectorAll('[data-compare]').forEach((compare) => {
  const setPos = (clientX) => {
    const rect = compare.getBoundingClientRect();
    const pct = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    compare.style.setProperty('--pos', pct + '%');
  };
  let dragging = false;
  compare.addEventListener('pointerdown', (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    dragging = true;
    compare.setPointerCapture(e.pointerId);
    setPos(e.clientX);
    e.preventDefault();
  });
  compare.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    setPos(e.clientX);
    e.preventDefault();
  });
  const stop = () => { dragging = false; };
  compare.addEventListener('pointerup', stop);
  compare.addEventListener('pointercancel', stop);
  compare.addEventListener('lostpointercapture', stop);

  const handle = compare.querySelector('.compare-handle');
  if (handle) {
    handle.addEventListener('keydown', (e) => {
      const current = parseFloat(getComputedStyle(compare).getPropertyValue('--pos')) || 50;
      const step = e.shiftKey ? 10 : 4;
      let next = current;
      if (e.key === 'ArrowLeft') next = Math.max(0, current - step);
      else if (e.key === 'ArrowRight') next = Math.min(100, current + step);
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = 100;
      else return;
      e.preventDefault();
      compare.style.setProperty('--pos', next + '%');
    });
  }
});

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
    track.scrollTo({ left: slides[wrapped].offsetLeft - track.offsetLeft, behavior: 'smooth' });
    setActive(wrapped);
  };

  const updateFromScroll = () => {
    const slideWidth = slides[0].getBoundingClientRect().width;
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    const idx = Math.round(track.scrollLeft / (slideWidth + gap));
    if (idx >= 0 && idx < slides.length) setActive(idx);
  };
  track.addEventListener('scroll', () => {
    clearTimeout(track._scrollIdle);
    track._scrollIdle = setTimeout(updateFromScroll, 80);
  });

  if (prev) prev.addEventListener('click', () => goTo(currentIdx - 1));
  if (next) next.addEventListener('click', () => goTo(currentIdx + 1));

  track.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(currentIdx - 1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); goTo(currentIdx + 1); }
  });

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
