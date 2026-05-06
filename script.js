document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

// Hide hero scroll indicator once the user starts scrolling
const heroScroll = document.querySelector('.hero-scroll');
if (heroScroll) {
  const updateHeroScroll = () => {
    heroScroll.classList.toggle('is-hidden', window.scrollY > 40);
  };
  updateHeroScroll();
  window.addEventListener('scroll', updateHeroScroll, { passive: true });
}

// Quote form: submit via fetch and show success inline on the button
document.querySelectorAll('.quote-form').forEach((form) => {
  const submitBtn = form.querySelector('button[type="submit"]');
  if (!submitBtn) return;
  const label = submitBtn.querySelector('.btn-label');
  const originalText = label ? label.textContent : submitBtn.textContent;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.classList.remove('is-sent');
    if (label) label.textContent = 'Sending…';
    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error('Bad response');
      if (label) label.textContent = 'Sent';
      submitBtn.classList.add('is-sent');
      form.querySelectorAll('input, textarea').forEach((el) => { el.disabled = true; });
    } catch (err) {
      submitBtn.disabled = false;
      if (label) label.textContent = originalText;
      alert("Sorry — couldn't send the message just now. Please call us on 022 122 8332.");
    }
  });
});

const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');

if (toggle && nav) {
  const closeMenu = () => {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  };
  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('click', (e) => {
    if (nav.classList.contains('open') && !nav.contains(e.target) && e.target !== toggle) {
      closeMenu();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });
}

// Mobile bar nav (hamburger on phone-only header)
const mobileToggle = document.querySelector('.mobile-menu-toggle');
const mobileNav = document.querySelector('.mobile-nav');
if (mobileToggle && mobileNav) {
  const closeMobile = () => {
    mobileNav.classList.remove('open');
    mobileToggle.setAttribute('aria-expanded', 'false');
  };
  mobileToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = mobileNav.classList.toggle('open');
    mobileToggle.setAttribute('aria-expanded', String(open));
  });
  mobileNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMobile);
  });
  document.addEventListener('click', (e) => {
    if (mobileNav.classList.contains('open') && !mobileNav.contains(e.target) && e.target !== mobileToggle) {
      closeMobile();
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMobile();
  });
}

// Before/after compare sliders
document.querySelectorAll('[data-compare]').forEach((compare) => {
  const setPos = (clientX) => {
    const rect = compare.getBoundingClientRect();
    const pct = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    compare.style.setProperty('--pos', pct + '%');
  };
  let activePointer = null;

  const onDown = (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    activePointer = e.pointerId;
    try { compare.setPointerCapture(e.pointerId); } catch (_) {}
    setPos(e.clientX);
    e.preventDefault();
  };
  const onMove = (e) => {
    if (activePointer !== e.pointerId) return;
    setPos(e.clientX);
    e.preventDefault();
  };
  const onUp = (e) => {
    if (activePointer === e.pointerId) activePointer = null;
  };

  compare.addEventListener('pointerdown', onDown);
  compare.addEventListener('pointermove', onMove);
  compare.addEventListener('pointerup', onUp);
  compare.addEventListener('pointercancel', onUp);
  compare.addEventListener('lostpointercapture', onUp);

  // Belt-and-braces fallback for touch on browsers that misbehave with pointer events
  compare.addEventListener('touchmove', (e) => {
    if (e.touches.length !== 1) return;
    setPos(e.touches[0].clientX);
    e.preventDefault();
  }, { passive: false });

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
