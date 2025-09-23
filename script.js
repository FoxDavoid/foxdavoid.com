// Giulia tooltip
const tooltip = document.createElement('div');
tooltip.className = 'tooltip';
tooltip.textContent = 'By my friend, @suigyozaa';
tooltip.style.padding = '20px';
tooltip.style.width = '9rem';
tooltip.style.textAlign = 'center';
document.body.appendChild(tooltip);

// All hiden at the start
document.documentElement.style.visibility = 'hidden';

// Wait for everything to load finally
window.addEventListener('load', function() {
  // And show
  document.documentElement.style.visibility = 'visible';
  document.body.classList.add('content-loaded');
});

document.addEventListener('DOMContentLoaded', function() {
  const banner = document.querySelector('.profile-banner-container');
  let isMobile = window.innerWidth <= 768;
  let tooltipTimeout;

  // Utility Functions
  function throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  function debounce(func, wait) {
    let timeout;
    return function() {
      const context = this;
      const args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), wait);
    };
  }

  // Tooltip Functions
  function positionTooltip(event, isTouch = false) {
    const rect = banner.getBoundingClientRect();
    
    if (isMobile || isTouch) {
      tooltip.style.left = '50%';
      tooltip.style.top = '50%';
      tooltip.style.transform = 'translate(-50%, -250%)';
    } else {
      tooltip.style.left = (rect.right + 10) + 'px';
      tooltip.style.top = (rect.top + rect.height / 2) + 'px';
      tooltip.style.transform = 'translateY(-50%)';
    }
  }

  function toggleTooltip(show, isTouch = false) {
    if (show) {
      tooltip.style.opacity = '1';
      positionTooltip(null, isTouch);
    } else {
      tooltip.style.opacity = '0';
    }
  }

  function handleTooltipResize() {
    isMobile = window.innerWidth <= 768;
    if (tooltip.style.opacity === '1') {
      positionTooltip(null, isMobile);
    }
  }

  // Scroll Indicator
  function updateScrollIndicator() {
    const indicator = document.querySelector('.scroll-indicator-bar');
    if (!indicator) return;
    
    const winHeight = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;
    const scrolled = window.scrollY;
    const scrollPercent = (scrolled / (docHeight - winHeight)) * 100;
    
    indicator.style.width = scrollPercent + '%';
  }

  // Modal Functionality
  function initModals() {
    let scrollPosition = 0;
    
    document.querySelectorAll('a[href^="#newsletter-"], a[href^="#blog-"], a[href^="#feed-"], a[href^="#changelog-"], a[href^="#modal-"], a[href="#message-modal"]').forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        const modal = document.querySelector(this.getAttribute('href'));
        if (modal) {
          scrollPosition = window.pageYOffset;
          modal.classList.add('active');
          document.body.style.overflow = 'hidden';
          document.body.style.position = 'fixed';
          document.body.style.top = `-${scrollPosition}px`;
          document.body.style.width = '100%';
        }
      });
    });

    function closeModal(modal) {
      if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollPosition);
      }
    }

    // Close when clicking the close button
    document.querySelectorAll('.modal-close').forEach(closeBtn => {
      closeBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        const modal = this.closest('.modal');
        closeModal(modal);
      });
    });

    // Close when pressing Escape
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        const activeModal = document.querySelector('.modal.active');
        closeModal(activeModal);
      }
    });

    // Close when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
      modal.addEventListener('click', function(e) {
        if (e.target === this) {
          closeModal(this);
        }
      });
    });
  }

  // Remove 3D Tilt Effect
  function removeTiltEffect() {
    document.querySelectorAll('.content-card, .blog-content-container').forEach(card => {
      card.style.removeProperty('--tilt-x');
      card.style.removeProperty('--tilt-y');
      card.style.transform = '';
      card.style.position = '';
      card.style.overflow = '';
      
      const existingGlow = card.querySelector('.card-glow');
      if (existingGlow) existingGlow.remove();
    });
  }

  // Scroll Effects
  const sections = document.querySelectorAll('section:not(.hero-container)');
  let lastScrollTop = 0;
  
  function isInViewport(element, threshold = 0.2) {
    const rect = element.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const thresholdPx = viewportHeight * threshold;
    
    return rect.top <= (viewportHeight - thresholdPx) && rect.bottom >= thresholdPx;
  }

  function updateActiveSections() {
    sections.forEach(section => {
      section.classList.toggle('active', isInViewport(section));
    });
  }

  function handleScrollAnimations() {
    const st = window.pageYOffset || document.documentElement.scrollTop;
    const scrollingUp = st < lastScrollTop;
    lastScrollTop = st <= 0 ? 0 : st;
    
    document.querySelectorAll('section').forEach(section => {
      const cards = Array.from(section.querySelectorAll('.content-card, .book-card'));
      const sectionInView = isInViewport(section);
      const loadMoreContainer = section.querySelector('.load-more-container');
      
      if (sectionInView) {
        cards.forEach((card, index) => {
          if (!card.classList.contains('visible')) {
            clearTimeout(card.animationTimeout);
            card.animationTimeout = setTimeout(() => {
              card.classList.add('visible');
              card.classList.toggle('scrolling-up', scrollingUp);
              
              if (index === cards.length - 1 && loadMoreContainer) {
                setTimeout(() => loadMoreContainer.classList.add('visible'), 200);
              }
            }, 10 * index);
          }
        });
        
        if (loadMoreContainer && cards.every(card => card.classList.contains('visible'))) {
          loadMoreContainer.classList.add('visible');
        }
      } else {
        cards.forEach(card => {
          clearTimeout(card.animationTimeout);
          card.animationTimeout = null;
          card.classList.remove('visible', 'scrolling-up');
        });
        
        if (loadMoreContainer) loadMoreContainer.classList.remove('visible');
      }
    });
  }

  // Load More Functionality
  function initLoadMore(section) {
    const contentGrid = section.querySelector('.content-grid');
    if (!contentGrid) {
      return;
    }
    if (contentGrid.parentNode.querySelector('.load-more-container')) {
      return;
    }
    
    const cards = Array.from(contentGrid.querySelectorAll('.content-card, .book-card'));
    if (cards.length <= 4) {
      return;
    }

    const isBookSection = section.classList.contains('book-reading-section');
    const isNewsletterSection = section.classList.contains('newsletter-section');
    const itemRem = isBookSection ? 8.75 : 14;
    const remInPx = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const itemTotalWidth = itemRem * remInPx;
    const gridStyle = window.getComputedStyle(contentGrid);
    const gridGap = parseInt(gridStyle.gap) || 0;
    const gridWidth = contentGrid.clientWidth;
    const gridPadding = parseInt(getComputedStyle(contentGrid).paddingLeft) + 
                       parseInt(getComputedStyle(contentGrid).paddingRight);
    const availableWidth = gridWidth - gridPadding;
    let itemsPerRow = Math.floor((availableWidth + gridGap) / (itemTotalWidth + gridGap));
    itemsPerRow = Math.max(4, itemsPerRow);

    if (isBookSection) {
      cards.forEach((card, index) => {
        card.classList.toggle('hidden', index >= itemsPerRow);
      });
    } else {
      const initialCardsToShow = Math.min(cards.length, itemsPerRow * 2);
      cards.forEach((card, index) => {
        if (index >= initialCardsToShow) {
          card.classList.add('hidden');
        } else {
          card.classList.remove('hidden');
        }
      });
    }
    
    const remainingCards = cards.filter(card => card.classList.contains('hidden'));
    if (remainingCards.length === 0) {
      return;
    }

    const loadMoreBtn = document.createElement('button');
    loadMoreBtn.className = 'load-more-btn';
    loadMoreBtn.textContent = 'Load More';
    
    const loadMoreContainer = document.createElement('div');
    loadMoreContainer.className = 'load-more-container';
    loadMoreContainer.appendChild(loadMoreBtn);
    contentGrid.parentNode.insertBefore(loadMoreContainer, contentGrid.nextSibling);
    
    loadMoreBtn.addEventListener('click', function() {
      const hiddenCards = Array.from(contentGrid.querySelectorAll('.content-card.hidden, .book-card.hidden'));
      const nextCards = hiddenCards.slice(0, itemsPerRow);
      
      nextCards.forEach(card => {
        card.classList.remove('hidden');
        card.style.opacity = '0';
        setTimeout(() => {
          card.style.transition = 'opacity 0.3s ease';
          card.style.opacity = '1';
        }, 10);
      });
      
      if (hiddenCards.length <= itemsPerRow) {
        loadMoreContainer.style.opacity = '0';
        setTimeout(() => {
          loadMoreContainer.style.display = 'none';
        }, 300);
      } else {
        void loadMoreContainer.offsetHeight;
      }
    });
  }

  function handleGridResize() {
    document.querySelectorAll('.content-grid').forEach(grid => {
      const cards = Array.from(grid.querySelectorAll('.content-card, .book-card'));
      if (cards.length === 0) return;

      const section = grid.closest('section');
      const isBookSection = section.classList.contains('book-reading-section');
      const itemRem = isBookSection ? 8.75 : 14;
      const remInPx = parseFloat(getComputedStyle(document.documentElement).fontSize);
      const itemTotalWidth = itemRem * remInPx;
      const gridStyle = window.getComputedStyle(grid);
      const gridGap = parseInt(gridStyle.gap) || 0;
      const gridWidth = grid.clientWidth;
      const gridPadding = parseInt(getComputedStyle(grid).paddingLeft) + 
                         parseInt(getComputedStyle(grid).paddingRight);
      const availableWidth = gridWidth - gridPadding;
      let itemsPerRow = Math.floor((availableWidth + gridGap) / (itemTotalWidth + gridGap));
      itemsPerRow = Math.max(4, itemsPerRow);

      cards.forEach(card => {
        card.classList.remove('hidden', 'visible');
      });

      if (isBookSection) {
        cards.forEach((card, index) => {
          card.classList.toggle('hidden', index >= itemsPerRow);
        });
      } else {
        const initialCardsToShow = Math.min(cards.length, itemsPerRow);
        cards.forEach((card, index) => {
          card.classList.toggle('hidden', index >= initialCardsToShow);
        });
      }
      
      const loadMoreContainer = grid.parentNode.querySelector('.load-more-container');
      if (loadMoreContainer) {
        const remainingHidden = grid.querySelectorAll('.content-card.hidden, .book-card.hidden').length;
        loadMoreContainer.style.display = remainingHidden === 0 ? 'none' : 'flex';
        loadMoreContainer.style.opacity = remainingHidden === 0 ? '0' : '1';
      }
    });
  }

  // Mouse Movement Tracking
  let lastMouseX = 0;
  let lastMouseY = 0;
  let ticking = false;
  let cardElements = [];
  
  function updateCardElements() {
    cardElements = Array.from(document.querySelectorAll('.content-card'));
    updateCardPositions();
  }
  
  function updateCardPositions() {
    cardElements = cardElements.filter(card => document.body.contains(card));
    cardElements.forEach(card => {
      card._rect = card.getBoundingClientRect();
    });
  }
  
  function handleCardMouseMove(e) {
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
    
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateMousePosition(lastMouseX, lastMouseY);
        ticking = false;
      });
      ticking = true;
    }
  }
  
  function updateMousePosition(mouseX, mouseY) {
    cardElements.forEach(card => {
      const rect = card._rect || card.getBoundingClientRect();
      const x = mouseX - rect.left;
      const y = mouseY - rect.top;
      const isMouseNear = x > -rect.width && x < rect.width * 2 && 
                         y > -rect.height && y < rect.height * 2;
      
      if (isMouseNear) {
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
        
        if (!card.classList.contains('mouse-near')) {
          card.classList.add('mouse-near');
          card.style.setProperty('--mouse-opacity', '0.5');
        }
      } else if (card.classList.contains('mouse-near')) {
        card.style.setProperty('--mouse-opacity', '0');
        
        setTimeout(() => {
          if (!card.classList.contains('mouse-near')) return;
          card.style.removeProperty('--mouse-x');
          card.style.removeProperty('--mouse-y');
          card.classList.remove('mouse-near');
        }, 800);
      }
    });
  }

  function handleAllMouseMove(e) {
    handleCardMouseMove(e);
    
    document.querySelectorAll('.modal .blog-content-container').forEach(modalContent => {
      const rect = modalContent.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      modalContent.style.setProperty('--mouse-x', `${x}px`);
      modalContent.style.setProperty('--mouse-y', `${y}px`);
    });
  }

  function initMouseTracking() {
    updateCardElements();
    
    const observer = new MutationObserver(updateCardElements);
    observer.observe(document.body, { childList: true, subtree: true });
    
    window.addEventListener('scroll', updateCardPositions, { passive: true });
    window.addEventListener('resize', debounce(updateCardPositions, 250));
    
    document.addEventListener('mousemove', handleAllMouseMove, { passive: true });
    setInterval(updateCardElements, 1000);
  }

  // Contact Form Handling
  function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;
    
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);
    
    const statusEl = newForm.querySelector('#status');
    let isSubmitting = false;

    const nameInput = form.querySelector('input[name="name"]');
    if (nameInput) {
        nameInput.addEventListener('input', (e) => {
            if (e.target.value.toLowerCase() === 'gaster') {
                window.location.reload();
            }
        });
    }

    function setError(field, msg) {
      const el = form.querySelector(`[data-for="${field}"]`);
      if (el) el.textContent = msg; 
    }

    function clearErrors() {
      form.querySelectorAll('.error').forEach(e => e.textContent = '');
      if (statusEl) statusEl.textContent = '';
    }

    function clientValidate() {
      clearErrors();
      let ok = true;
      const name = form.name.value.trim();

      if (name.toLowerCase() === 'gaster') {
        window.location.reload();
        return false;
      }

      if (name.length > 0 && name.length < 2) { 
        setError('name', 'How on Earth do you have less than two characters in your name? Like, BRO?!'); 
        ok = false; 
      }
      if (name.length < 1) { 
        setError('name', 'So, you don\'t have a name? How did people even refer to you at school? "Null"?'); 
        ok = false; 
      }
      
      const email = form.email.value.trim();
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) { 
        setError('email', "Nice email, too bad it doesn't exist"); 
        ok = false; 
      }
      
      const msg = form.message.value.trim();
      if (msg.length < 4) { 
        setError('message', "This right here is the kind of message that I wouldn't reply to."); 
        ok = false; 
      }
      
      if (form._honey && form._honey.value) ok = false;
      
      return ok;
    }

    async function ajaxSubmit(e) {
      e.preventDefault();
      
      if (isSubmitting) return;
      isSubmitting = true;
      
      if (!clientValidate()) {
        isSubmitting = false;
        return;
      }
    
      const formData = new FormData(form);
      const submitBtn = form.querySelector('button[type="submit"]');
    
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
      }
      if (statusEl) {
        statusEl.className = '';
        statusEl.textContent = 'Here we go...';
      }
    
      try {
        const response = await fetch('https://formsubmit.co/ajax/b0d32210c94089fee36b97bb34f77064', {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' }
        });
    
        const contentType = (response.headers.get('content-type') || '').toLowerCase();
    
        if (contentType.includes('application/json')) {
          const data = await response.json();
          if (data && (data.success === true || data.success === 'true')) {
            if (statusEl) { statusEl.className = 'success'; statusEl.textContent = 'The message got sent. You can rest.'; }
            form.reset();
            setTimeout(closeModalAndRestoreScroll, 2000);
          } else {
            throw new Error(data && data.message ? data.message : 'FormSubmit returned JSON... no success flag.');
          }
          return;
        }
    
        const text = await response.text();
        console.log('FormSubmit non-JSON response (body):', text);
    
        if (response.ok) {
          if (statusEl) { statusEl.className = 'success'; statusEl.textContent = 'The message got sent (non-JSON response).'; }
          form.reset();
          setTimeout(closeModalAndRestoreScroll, 2000);
        } else {
          throw new Error('Non-JSON response and non-OK status: ' + response.status);
        }
      } catch (error) {
        console.error('Form submit error:', error);
        if (statusEl) {
          statusEl.className = 'error';
          statusEl.textContent = error.message || 'Sorry, something happened';
        }
      } finally {
        isSubmitting = false;
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Send';
        }
      }
    }

    function closeModalAndRestoreScroll() {
      const modal = document.querySelector('.modal.active');
      if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollPosition);
      }
    }

<<<<<<< Updated upstream
<<<<<<< Updated upstream
    if (!form.hasAttribute('data-form-initialized')) {
      form.setAttribute('data-form-initialized', 'true');
      form.addEventListener('submit', ajaxSubmit);
    }
=======
    newForm.addEventListener('submit', ajaxSubmit);
>>>>>>> Stashed changes
=======
    newForm.addEventListener('submit', ajaxSubmit);
>>>>>>> Stashed changes
  }

  // Tooltip Event Listeners
  if (banner) {
    // Desktop events
    banner.addEventListener('mousemove', (e) => positionTooltip(e, false));
    banner.addEventListener('mouseenter', () => toggleTooltip(true));
    banner.addEventListener('mouseleave', () => toggleTooltip(false));

    // Mobile touch events
    banner.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const isVisible = tooltip.style.opacity === '1';
      
      if (tooltipTimeout) clearTimeout(tooltipTimeout);
      
      if (!isVisible) {
        toggleTooltip(true, true);
        tooltipTimeout = setTimeout(() => toggleTooltip(false), 1500);
      } else {
        toggleTooltip(false);
      }
    });

    // Close tooltip when clicking outside
    window.addEventListener('touchstart', (e) => {
      if (!banner.contains(e.target) && !tooltip.contains(e.target)) {
        toggleTooltip(false);
        if (tooltipTimeout) clearTimeout(tooltipTimeout);
      }
    });

    // Update tooltip position on scroll
    window.addEventListener('scroll', () => {
      if (tooltip.style.opacity === '1') {
        const rect = banner.getBoundingClientRect();
        tooltip.style.top = (rect.top + rect.height / 20) + 'px';
      }
    }, { passive: true });
  }

  // Handle window resize for tooltip
  window.addEventListener('resize', handleTooltipResize);

  // Initialization
  function init() {
    initModals();
    removeTiltEffect();
    initContactForm();
    initMouseTracking();
    
    sections.forEach(section => {
      section.classList.add('scroll-effect-section');
      if (isInViewport(section)) section.classList.add('active');
    });
    
    document.querySelectorAll('section').forEach(section => {
      initLoadMore(section);
    });
    
    document.querySelectorAll('.content-grid').forEach(grid => {
      const cards = Array.from(grid.querySelectorAll('.content-card, .book-card'));
      const section = grid.closest('section');
      const isBookSection = section.classList.contains('book-reading-section');
      
      cards.forEach((card, index) => {
        card.classList.toggle('hidden', isBookSection ? index >= 8 : index >= 8);
        card.style.opacity = '1';
        if (!card.classList.contains('hidden')) {
          card.classList.add('visible');
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }
      });
      
      if (!grid.parentNode.querySelector('.load-more-container') && cards.length > 4) {
        const loadMoreBtn = document.createElement('button');
        loadMoreBtn.className = 'load-more-btn';
        loadMoreBtn.textContent = 'Load More';
        
        const loadMoreContainer = document.createElement('div');
        loadMoreContainer.className = 'load-more-container visible';
        loadMoreContainer.appendChild(loadMoreBtn);
        grid.parentNode.insertBefore(loadMoreContainer, grid.nextSibling);
        
        loadMoreBtn.addEventListener('click', function() {
          const hiddenCards = Array.from(grid.querySelectorAll('.content-card.hidden, .book-card.hidden'));
          const nextCards = hiddenCards.slice(0, 4);
          
          nextCards.forEach(card => {
            card.classList.remove('hidden');
            card.classList.add('visible');
            card.style.opacity = '0';
            setTimeout(() => {
              card.style.transition = 'opacity 0.3s ease';
              card.style.opacity = '1';
            }, 10);
          });
          
          if (hiddenCards.length <= 4) {
            loadMoreContainer.style.opacity = '0';
            setTimeout(() => loadMoreContainer.remove(), 300);
          }
        });
      }
    });
    
    handleGridResize();
    
    setTimeout(() => document.body.classList.add('loaded'), 50);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Event Listeners
  const throttledScroll = throttle(function() {
    updateScrollIndicator();
    handleScrollAnimations();
    updateActiveSections();
  }, 100);

  window.addEventListener('scroll', throttledScroll);
  window.addEventListener('resize', debounce(handleGridResize, 150));

  // Initialize
  init();
});