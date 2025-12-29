// UI/UX interactions:
// - contact form mailto
// - smooth scroll for nav links
// - header shrink-on-scroll
// - reveal-on-scroll for sections/cards
// - portfolio modal handling (robust image preload, thumbnail fallback, focus return)

const toEmail = 'your.email@example.com'; // <-- update to your real email

document.addEventListener('DOMContentLoaded', () => {
  /* ---------------- Contact form (mailto) ---------------- */
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = encodeURIComponent(document.getElementById('name')?.value.trim() || '');
      const email = encodeURIComponent(document.getElementById('email')?.value.trim() || '');
      const message = encodeURIComponent(document.getElementById('message')?.value.trim() || '');
      const subject = encodeURIComponent(`Portfolio inquiry from ${name || 'Website visitor'}`);
      const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${decodeURIComponent(message)}`);
      window.location.href = `mailto:${toEmail}?subject=${subject}&body=${body}`;
    });
  }

  /* ---------------- Smooth scroll for anchor links ---------------- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (href && href.length > 1) {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          history.replaceState(null, '', href);
        }
      }
    });
  });

  /* ---------------- Header shrink on scroll ---------------- */
  const header = document.querySelector('.site-header');
  function updateHeader() {
    const sc = window.scrollY || document.documentElement.scrollTop;
    if (sc > 40) header.classList.add('shrink'); else header.classList.remove('shrink');
  }
  updateHeader();
  window.addEventListener('scroll', throttle(updateHeader, 120));

  /* ---------------- Reveal-on-scroll (IntersectionObserver) ---------------- */
  const revealElems = document.querySelectorAll('section, .card, .portfolio-card, .ux-step, .timeline-item');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        entry.target.classList.remove('reveal');
      }
    });
  }, { root: null, threshold: 0.12 });
  revealElems.forEach(el => {
    el.classList.add('reveal');
    io.observe(el);
  });

  /* ---------------- Portfolio modal (robust) ---------------- */
  const modal = document.getElementById('projectModal');
  const modalTitle = document.getElementById('modal-title');
  const modalImage = document.getElementById('modal-image');
  const modalDesc = document.getElementById('modal-desc');
  const modalTools = document.getElementById('modal-tools');

  let lastFocusedElement = null;

  // Preload image helper returns a Promise that resolves if load OK, rejects on error
  function preloadImage(src) {
    return new Promise((resolve, reject) => {
      if (!src) return reject(new Error('No src provided'));
      const img = new Image();
      img.onload = () => resolve(src);
      img.onerror = () => reject(new Error('Image failed to load: ' + src));
      img.src = src;
    });
  }

  function openProjectModal(card) {
    if (!card || !modal) return;
    lastFocusedElement = document.activeElement;

    const title = card.dataset.title || '';
    const dataImage = (card.dataset.image || '').trim();
    const tools = card.dataset.tools || '';
    const desc = card.dataset.desc || '';

    modalTitle.textContent = title;
    modalDesc.textContent = desc;
    modalTools.textContent = tools;

    // Determine final image src: prefer data-image; fallback to card thumbnail src if present
    let finalSrc = '';
    if (dataImage) {
      finalSrc = dataImage;
    } else {
      const thumb = card.querySelector('.portfolio-thumb');
      if (thumb && thumb.getAttribute('src')) finalSrc = thumb.getAttribute('src');
    }

    // Debug log to console to help trace issues
    console.log('[modal] opening:', { title, finalSrc, dataImage });

    // Try to preload finalSrc; if it fails, hide the <img> (no broken icon)
    if (finalSrc) {
      // show a temporary loading state (could be extended to show spinner)
      modalImage.style.display = 'none';
      preloadImage(finalSrc).then((src) => {
        modalImage.src = src;
        modalImage.alt = title || 'Project image';
        modalImage.style.display = '';
      }).catch((err) => {
        console.warn('[modal] image preload failed:', err.message);
        // fallback: if card thumbnail exists and wasn't used yet, try that
        const thumb = card.querySelector('.portfolio-thumb');
        if (thumb && thumb.getAttribute('src') && thumb.getAttribute('src') !== finalSrc) {
          preloadImage(thumb.getAttribute('src')).then((s2) => {
            modalImage.src = s2;
            modalImage.alt = title || 'Project image';
            modalImage.style.display = '';
          }).catch((err2) => {
            console.warn('[modal] thumbnail preload also failed:', err2.message);
            modalImage.src = '';
            modalImage.alt = '';
            modalImage.style.display = 'none';
          });
        } else {
          modalImage.src = '';
          modalImage.alt = '';
          modalImage.style.display = 'none';
        }
      });
    } else {
      // No image available at all
      modalImage.src = '';
      modalImage.alt = '';
      modalImage.style.display = 'none';
      console.log('[modal] no image provided for this card');
    }

    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // prevent background scroll

    // move keyboard focus to close button for accessibility
    const closeBtn = modal.querySelector('[data-close-modal]');
    if (closeBtn) closeBtn.focus();
  }

  function closeProjectModal() {
    if (!modal) return;
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    // clear modal content to avoid stale info (especially large images)
    modalTitle.textContent = '';
    modalDesc.textContent = '';
    modalTools.textContent = '';
    modalImage.src = '';
    modalImage.alt = '';
    modalImage.style.display = '';

    // restore focus to last focused element (if available)
    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
      lastFocusedElement.focus();
      lastFocusedElement = null;
    }
  }

  // Attach open handlers on buttons
  document.querySelectorAll('[data-open-project]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.portfolio-card');
      if (card) openProjectModal(card);
    });
  });

  // Allow keyboard open on card (Enter / Space)
  document.querySelectorAll('.portfolio-card').forEach(card => {
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openProjectModal(card);
      }
    });
  });

  // Close handlers
  document.querySelectorAll('[data-close-modal]').forEach(el => el.addEventListener('click', closeProjectModal));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.getAttribute('aria-hidden') === 'false') closeProjectModal();
  });

  /* ---------------- Utility: simple throttle ---------------- */
  function throttle(fn, wait = 100) {
    let lastTime = 0;
    return (...args) => {
      const now = Date.now();
      if (now - lastTime >= wait) {
        lastTime = now;
        fn.apply(this, args);
      }
    };
  }
});