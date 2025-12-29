// =========================================
// PORTFOLIO WEBSITE - Main JavaScript
// =========================================

// Tool name to icon filename mapping
const TOOL_ICON_MAP = {
  'HubSpot': 'hubspot',
  'Google Sheets': 'google-sheets',
  'Phone': 'phone',
  'Airbnb': 'airbnb',
  'VRBO': 'vrbo',
  'Booking.com': 'booking',
  'Zendesk': 'zendesk',
  'Pipedrive': 'pipedrive',
  'Zapier': 'zapier',
  'G Suite': 'gsuite',
  'Gsuite': 'gsuite',
  'Microsoft 365': 'ms365',
  'Microsoft Teams': 'teams',
  'Outlook': 'outlook',
  'Twilio': 'twilio',
  'Excel': 'excel',
  'Apollo': 'apollo',
  'Instantly': 'instantly',
  'LinkedIn Sales Navigator': 'linkedin',
  'LinkedIn': 'linkedin',
  'Asana': 'asana',
  'Trello': 'trello',
  'WhatsApp': 'whatsapp',
  'Canva': 'canva',
  'Slack': 'slack'
};

// =========================================
// UTILITY FUNCTIONS
// =========================================

/**
 * Throttle function calls
 */
function throttle(fn, wait = 100) {
  let lastTime = 0;
  return function executedFunction(...args) {
    const now = Date.now();
    if (now - lastTime >= wait) {
      lastTime = now;
      fn.apply(this, args);
    }
  };
}

/**
 * Preload image and return promise
 */
function preloadImage(src) {
  return new Promise((resolve, reject) => {
    if (! src || src.trim() === '') {
      return reject(new Error('No image source provided'));
    }
    
    const img = new Image();
    img.onload = () => resolve(src);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

/**
 * Create tool icon element
 */
function createToolIcon(toolName) {
  const chip = document.createElement('span');
  chip.className = 'tool';
  chip.setAttribute('role', 'img');
  chip.setAttribute('aria-label', toolName);
  chip.title = toolName;

  const iconFileName = TOOL_ICON_MAP[toolName];
  
  if (iconFileName) {
    const img = document.createElement('img');
    img.className = 'tool-icon';
    img.alt = '';
    img.loading = 'lazy';
    img.src = `images/${iconFileName}.png`;
    img.width = 44;
    img.height = 44;
    
    // Handle image load error
    img.onerror = function() {
      console.warn(`Failed to load icon for:  ${toolName}`);
      chip.textContent = toolName;
    };
    
    chip.appendChild(img);
  } else {
    // Fallback to text if no icon mapping exists
    chip.textContent = toolName;
    chip.style.padding = '8px 16px';
    chip.style.borderRadius = '999px';
  }

  return chip;
}

// =========================================
// MOBILE MENU
// =========================================

function initMobileMenu() {
  const menuBtn = document.querySelector('.mobile-menu-btn');
  const nav = document.querySelector('.nav');
  
  if (!menuBtn || !nav) return;

  menuBtn.addEventListener('click', () => {
    const isExpanded = menuBtn.getAttribute('aria-expanded') === 'true';
    menuBtn.setAttribute('aria-expanded', !isExpanded);
    nav.classList.toggle('active');
  });

  // Close menu when clicking nav link
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menuBtn.setAttribute('aria-expanded', 'false');
      nav.classList.remove('active');
    });
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!menuBtn.contains(e.target) && !nav.contains(e.target)) {
      menuBtn.setAttribute('aria-expanded', 'false');
      nav.classList.remove('active');
    }
  });
}

// =========================================
// SMOOTH SCROLL
// =========================================

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      
      // Ignore empty or just "#" links
      if (!href || href === '#' || href.length <= 1) return;
      
      const target = document.querySelector(href);
      
      if (target) {
        e.preventDefault();
        
        // Calculate offset for sticky header
        const headerHeight = document.querySelector('.site-header')?.offsetHeight || 0;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
        
        // Update URL without triggering scroll
        history.pushState(null, '', href);
        
        // Set focus for accessibility
        target.setAttribute('tabindex', '-1');
        target.focus();
      }
    });
  });
}

// =========================================
// HEADER SHRINK ON SCROLL
// =========================================

function initHeaderShrink() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  function updateHeader() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    
    if (scrollTop > 40) {
      header.classList.add('shrink');
    } else {
      header.classList.remove('shrink');
    }
  }

  // Initial check
  updateHeader();

  // Throttled scroll listener
  window.addEventListener('scroll', throttle(updateHeader, 120));
}

// =========================================
// REVEAL ON SCROLL
// =========================================

function initRevealOnScroll() {
  const revealElements = document.querySelectorAll('section, .card, .timeline-item, .personal-card, .portfolio-card');
  
  if (!revealElements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold:  0.1,
      rootMargin: '0px 0px -50px 0px'
    }
  );

  revealElements.forEach(el => {
    el.classList.add('reveal');
    observer.observe(el);
  });
}

// =========================================
// PORTFOLIO MODAL
// =========================================

function initPortfolioModal() {
  const modal = document.getElementById('projectModal');
  const modalTitle = document.getElementById('modal-title');
  const modalImage = document.getElementById('modal-image');
  const modalDesc = document.getElementById('modal-desc');
  const modalTools = document.getElementById('modal-tools');
  
  if (!modal || !modalTitle || !modalImage || !modalDesc || !modalTools) {
    console.warn('Modal elements not found');
    return;
  }

  let lastFocusedElement = null;

  /**
   * Open modal with project data
   */
  function openModal(card) {
    if (! card) return;

    lastFocusedElement = document.activeElement;

    const title = card.dataset.title || 'Project Details';
    const dataImage = (card.dataset.image || '').trim();
    const tools = card.dataset.tools || '';
    const desc = card.dataset.desc || 'No description available. ';

    // Set text content
    modalTitle.textContent = title;
    modalDesc.textContent = desc;

    // Clear and populate tools
    modalTools.innerHTML = '';
    if (tools) {
      const toolNames = tools.split('·').map(s => s.trim()).filter(Boolean);
      toolNames.forEach(toolName => {
        const toolIcon = createToolIcon(toolName);
        modalTools.appendChild(toolIcon);
      });
    }

    // Handle image
    let imageSrc = dataImage;
    
    // Fallback to thumbnail if no data-image
    if (!imageSrc) {
      const thumb = card.querySelector('.portfolio-thumb');
      if (thumb) {
        imageSrc = thumb.getAttribute('src');
      }
    }

    // Show loading state
    modalImage.style.display = 'none';
    modalImage.src = '';
    modalImage.alt = '';

    if (imageSrc) {
      preloadImage(imageSrc)
        .then((src) => {
          modalImage.src = src;
          modalImage.alt = title;
          modalImage.style.display = 'block';
        })
        .catch((error) => {
          console.warn('Image preload failed:', error.message);
          
          // Try thumbnail as final fallback
          const thumb = card.querySelector('.portfolio-thumb');
          if (thumb && thumb.getAttribute('src') !== imageSrc) {
            preloadImage(thumb.getAttribute('src'))
              .then((src) => {
                modalImage.src = src;
                modalImage.alt = title;
                modalImage.style.display = 'block';
              })
              .catch(() => {
                // Hide image if all attempts fail
                modalImage.style.display = 'none';
              });
          }
        });
    }

    // Show modal
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Focus close button
    const closeBtn = modal.querySelector('[data-close-modal]');
    if (closeBtn) {
      setTimeout(() => closeBtn.focus(), 100);
    }
  }

  /**
   * Close modal
   */
  function closeModal() {
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    // Clear content
    modalTitle.textContent = '';
    modalDesc.textContent = '';
    modalTools.innerHTML = '';
    modalImage.src = '';
    modalImage.alt = '';
    modalImage.style.display = '';

    // Restore focus
    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
      lastFocusedElement.focus();
      lastFocusedElement = null;
    }
  }

  // Attach event listeners for opening modal
  document.querySelectorAll('[data-open-project]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const card = e.target.closest('.portfolio-card');
      if (card) openModal(card);
    });
  });

  // Allow Enter/Space on portfolio cards
  document.querySelectorAll('.portfolio-card').forEach(card => {
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModal(card);
      }
    });
  });

  // Close modal listeners
  document.querySelectorAll('[data-close-modal]').forEach(el => {
    el.addEventListener('click', closeModal);
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') {
      closeModal();
    }
  });

  // Trap focus within modal when open
  modal.addEventListener('keydown', (e) => {
    if (e.key === 'Tab' && modal.getAttribute('aria-hidden') === 'false') {
      const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (! e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  });
}

// =========================================
// INITIALIZATION
// =========================================

document.addEventListener('DOMContentLoaded', () => {
  console.log('Portfolio site initialized');
  
  try {
    initMobileMenu();
    initSmoothScroll();
    initHeaderShrink();
    initRevealOnScroll();
    initPortfolioModal();
  } catch (error) {
    console.error('Initialization error:', error);
  }
});

// =========================================
// PERFORMANCE MONITORING (Optional)
// =========================================

if ('PerformanceObserver' in window) {
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === 'largest-contentful-paint') {
        console.log('LCP:', entry.renderTime || entry.loadTime);
      }
    }
  });
  
  try {
    observer.observe({ entryTypes: ['largest-contentful-paint'] });
  } catch (e) {
    // LCP observation not supported
  }
}