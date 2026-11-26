/**
 * Dr. Chintan Patel Pediatrician Website
 * Core Interactivity, Floating Capsule Navbar, Scroll Animations & Counters
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const header = document.getElementById('header');
  const mobileToggle = document.getElementById('mobileToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const navBackdrop = document.getElementById('navBackdrop');
  const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
  const mobileCta = document.querySelector('.mobile-menu .btn-appointment');

  // 1. Mobile Menu Drawer Toggle with Scroll Lock & Background Blur
  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = mobileMenu.classList.contains('open');
      if (isOpen) {
        closeMobileNav();
      } else {
        openMobileNav();
      }
    });

    // Close menu when clicking outside or on blurred backdrop
    document.addEventListener('click', (e) => {
      if (mobileMenu.classList.contains('open') && !mobileMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
        closeMobileNav();
      }
    });

    if (navBackdrop) {
      navBackdrop.addEventListener('click', closeMobileNav);
    }

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
        closeMobileNav();
      }
    });

    // Close menu when tapping mobile CTA button
    if (mobileCta) {
      mobileCta.addEventListener('click', closeMobileNav);
    }
  }

  function openMobileNav() {
    mobileToggle.classList.add('active');
    mobileToggle.setAttribute('aria-expanded', 'true');
    mobileMenu.classList.add('open');
    header.classList.add('menu-open');
    document.documentElement.classList.add('nav-open');
    document.body.classList.add('nav-open');
    if (navBackdrop) navBackdrop.classList.add('active');
  }

  function closeMobileNav() {
    mobileToggle.classList.remove('active');
    mobileToggle.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('open');
    header.classList.remove('menu-open');
    document.documentElement.classList.remove('nav-open');
    document.body.classList.remove('nav-open');
    if (navBackdrop) navBackdrop.classList.remove('active');
  }

  // 2. Active Nav Link Handling
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      const targetId = link.getAttribute('href');
      
      // If it's a section anchor, update active class
      if (targetId && targetId.startsWith('#')) {
        navLinks.forEach(l => l.classList.remove('active'));
        
        // Find matching links in both desktop and mobile
        document.querySelectorAll(`a[href="${targetId}"]`).forEach(matched => {
          matched.classList.add('active');
        });

        // Close mobile drawer if open
        if (mobileMenu && mobileMenu.classList.contains('open')) {
          closeMobileNav();
        }
      }
    });
  });

  // 3. Floating Capsule Navbar on Scroll (RAF-throttled for 60/120fps scroll smoothness)
  let scrollTicking = false;
  let lastCapsuleState = null;

  function updateScrollCapsule() {
    scrollTicking = false;
    const shouldBeCapsule = window.scrollY > 30;
    if (shouldBeCapsule !== lastCapsuleState) {
      lastCapsuleState = shouldBeCapsule;
      header.classList.toggle('scrolled-capsule', shouldBeCapsule);
    }
  }

  function handleScrollCapsule() {
    if (!scrollTicking) {
      scrollTicking = true;
      requestAnimationFrame(updateScrollCapsule);
    }
  }

  window.addEventListener('scroll', handleScrollCapsule, { passive: true });
  updateScrollCapsule(); // Initial check on page load

  // 4. Scroll-Triggered Entrance Animation for About Section (Pre-reveals before entering viewport)
  const aboutVisual = document.querySelector('.about-visual-wrapper');
  const aboutSection = document.getElementById('about');

  if (aboutVisual && 'IntersectionObserver' in window) {
    const aboutObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          aboutVisual.classList.add('is-visible');
          aboutObserver.disconnect();
        }
      });
    }, {
      rootMargin: '80px 0px 80px 0px',
      threshold: 0.01
    });

    aboutObserver.observe(aboutSection || aboutVisual);
  } else if (aboutVisual) {
    aboutVisual.classList.add('is-visible');
  }

  // 5. Modern Number Counting Animation for Stat Cards
  let animationTriggered = false;

  function runNumberCounters() {
    if (animationTriggered) return;
    animationTriggered = true;

    const statNumbers = document.querySelectorAll('.stat-number');
    
    statNumbers.forEach(stat => {
      const target = parseFloat(stat.getAttribute('data-target'));
      const suffix = stat.getAttribute('data-suffix') || '';
      const isComma = stat.getAttribute('data-format') === 'comma';
      const decimals = parseInt(stat.getAttribute('data-decimals') || '0', 10);
      const duration = 1800; // ms
      let startTime = null;

      function updateCounter(currentTime) {
        if (!startTime) startTime = currentTime;
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Quintic/Exponential ease-out for an energetic start and buttery smooth finish
        const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const currentVal = target * easeProgress;

        let displayVal;
        if (decimals > 0) {
          displayVal = currentVal.toFixed(decimals);
        } else if (isComma) {
          displayVal = Math.floor(currentVal).toLocaleString('en-US');
        } else {
          displayVal = Math.floor(currentVal);
        }

        stat.textContent = displayVal + suffix;

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        } else {
          // Guarantee final exact number format
          if (decimals > 0) {
            stat.textContent = target.toFixed(decimals) + suffix;
          } else if (isComma) {
            stat.textContent = target.toLocaleString('en-US') + suffix;
          } else {
            stat.textContent = target + suffix;
          }
        }
      }

      requestAnimationFrame(updateCounter);
    });
  }

  // Trigger number counter animation when page loads & stats are entered
  const statsSection = document.querySelector('.hero-stats-compact') || document.querySelector('.hero-content');
  if ('IntersectionObserver' in window && statsSection) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setTimeout(runNumberCounters, 180);
          observer.disconnect();
        }
      });
    }, { rootMargin: '60px 0px 60px 0px', threshold: 0.01 });
    
    observer.observe(statsSection);
  } else {
    setTimeout(runNumberCounters, 200);
  }

  // 6. Specialties & Programs "Show More" Mobile Interaction
  const specialtiesShowMoreBtn = document.getElementById('specialtiesShowMore');
  const specialtiesGrid = document.getElementById('specialtiesGrid');

  if (specialtiesShowMoreBtn && specialtiesGrid) {
    specialtiesShowMoreBtn.addEventListener('click', () => {
      const isExpanded = specialtiesGrid.classList.toggle('is-expanded');
      specialtiesShowMoreBtn.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
      
      const btnText = specialtiesShowMoreBtn.querySelector('.btn-show-more-text');
      if (btnText) {
        btnText.textContent = isExpanded ? 'Show Less' : 'Show More';
      }

      // If user collapses, smoothly anchor back to the top of the specialties section
      if (!isExpanded) {
        const specialtiesSec = document.getElementById('services');
        if (specialtiesSec) {
          const yOffset = -80;
          const y = specialtiesSec.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }
    });
  }

  // 7. Specialties & Programs Staggered Scroll Entrance Animation
  const specialtiesSec = document.getElementById('services');
  if (specialtiesSec && 'IntersectionObserver' in window) {
    const specObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          specialtiesSec.classList.add('is-visible');
          specObserver.disconnect();
        }
      });
    }, { rootMargin: '80px 0px 80px 0px', threshold: 0.01 });
    specObserver.observe(specialtiesSec);
  } else if (specialtiesSec) {
    specialtiesSec.classList.add('is-visible');
  }

  // 8. About Page Dr. Patel's Journey Banner Popup Animation
  const journeySec = document.getElementById('dr-journey');
  if (journeySec) {
    const revealJourney = () => {
      journeySec.classList.add('is-visible');
    };

    if ('IntersectionObserver' in window) {
      const journeyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            revealJourney();
            journeyObserver.disconnect();
          }
        });
      }, { rootMargin: '80px 0px 80px 0px', threshold: 0.01 });
      journeyObserver.observe(journeySec);
    } else {
      revealJourney();
    }
  }

  // 9. About Page Care Philosophy Section Scroll Entrance Animation
  const philosophySec = document.getElementById('care-philosophy');
  if (philosophySec && 'IntersectionObserver' in window) {
    const philObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          philosophySec.classList.add('is-visible');
          philObserver.disconnect();
        }
      });
    }, { rootMargin: '80px 0px 80px 0px', threshold: 0.01 });
    philObserver.observe(philosophySec);
  } else if (philosophySec) {
    philosophySec.classList.add('is-visible');
  }

  // 10. About Page Community Section Scroll Entrance Animation
  const communitySec = document.getElementById('community');
  if (communitySec && 'IntersectionObserver' in window) {
    const commObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          communitySec.classList.add('is-visible');
          commObserver.disconnect();
        }
      });
    }, { rootMargin: '80px 0px 80px 0px', threshold: 0.01 });
    commObserver.observe(communitySec);
  } else if (communitySec) {
    communitySec.classList.add('is-visible');
  }

  // 11. About Page Warm & Child-Friendly Space Scroll Entrance Animation
  const spaceSec = document.getElementById('clinic-space');
  if (spaceSec && 'IntersectionObserver' in window) {
    const spaceObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          spaceSec.classList.add('is-visible');
          spaceObserver.disconnect();
        }
      });
    }, { rootMargin: '80px 0px 80px 0px', threshold: 0.01 });
    spaceObserver.observe(spaceSec);
  } else if (spaceSec) {
    spaceSec.classList.add('is-visible');
  }

  // 12. About Page Priority Appointment Banner Scroll Entrance Animation
  const prioritySec = document.getElementById('priority-cta');
  if (prioritySec && 'IntersectionObserver' in window) {
    const priorityObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          prioritySec.classList.add('is-visible');
          priorityObserver.disconnect();
        }
      });
    }, { rootMargin: '80px 0px 80px 0px', threshold: 0.01 });
    priorityObserver.observe(prioritySec);
  } else if (prioritySec) {
    prioritySec.classList.add('is-visible');
  }

  // 13. Contact Page FAQ Accordion
  const faqItems = document.querySelectorAll('#faqAccordion .faq-item');
  if (faqItems.length > 0) {
    faqItems.forEach(item => {
      const trigger = item.querySelector('.faq-trigger');
      if (!trigger) return;

      trigger.addEventListener('click', () => {
        const isCurrentlyOpen = item.classList.contains('is-open');

        faqItems.forEach(other => {
          other.classList.remove('is-open');
          const otherBtn = other.querySelector('.faq-trigger');
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
        });

        if (!isCurrentlyOpen) {
          item.classList.add('is-open');
          trigger.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  // 14. Shared Appointment Form Handler (Contact Page + Navbar Modal)
  function bindAppointmentForm(form, feedbackEl) {
    if (!form || !feedbackEl) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const firstName = form.firstName.value.trim();
      const lastName = form.lastName.value.trim();
      const email = form.email.value.trim();
      const message = form.message.value.trim();

      feedbackEl.classList.remove('is-error');

      if (!firstName || !lastName || !email || !message) {
        feedbackEl.textContent = 'Please fill in your name, email, and message to continue.';
        feedbackEl.classList.add('is-error');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        feedbackEl.textContent = 'Please enter a valid email address.';
        feedbackEl.classList.add('is-error');
        return;
      }

      const whatsappText = [
        'Hello Dr. Chintan Patel,',
        `Name: ${firstName} ${lastName}`,
        `Email: ${email}`,
        `Message: ${message}`
      ].join('\n');

      const whatsappUrl = `https://wa.me/919327252303?text=${encodeURIComponent(whatsappText)}`;
      feedbackEl.textContent = 'Redirecting to WhatsApp to confirm your appointment request...';
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      form.reset();
    });
  }

  bindAppointmentForm(
    document.getElementById('appointmentForm'),
    document.getElementById('formFeedback')
  );

  // 15. Navbar "Book Appointment" Booking Modal (Available Across All Pages)
  const navBookingTriggers = document.querySelectorAll('.site-header .btn-appointment');
  if (navBookingTriggers.length > 0) {
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'booking-modal-overlay';
    modalOverlay.id = 'bookingModal';
    modalOverlay.setAttribute('aria-hidden', 'true');
    modalOverlay.setAttribute('role', 'dialog');
    modalOverlay.setAttribute('aria-modal', 'true');
    modalOverlay.setAttribute('aria-labelledby', 'bookingModalTitle');

    modalOverlay.innerHTML = `
      <div class="booking-modal-card contact-form-card">
        <div class="form-card-decor" aria-hidden="true">
          <span class="form-decor-circle-tr"></span>
          <span class="form-decor-circle-bl"></span>
          <span class="modal-dot-grid"></span>
          <svg class="modal-sparkles-svg" viewBox="0 0 120 80" fill="none">
            <path d="M24 12 Q24 21 33 21 Q24 21 24 30 Q24 21 15 21 Q24 21 24 12 Z" stroke="#4DE2B9" stroke-width="1.6" opacity="0.65"/>
            <path d="M92 48 C92 48 83 42 83 36 C83 32.8 85.5 30.5 88.4 30.5 C90.2 30.5 91.4 31.4 92 32.6 C92.6 31.4 93.8 30.5 95.6 30.5 C98.5 30.5 101 32.8 101 36 C101 42 92 48 92 48 Z" stroke="#FFFFFF" stroke-width="1.5" opacity="0.38"/>
          </svg>
        </div>

        <button type="button" class="booking-modal-close" aria-label="Close booking form">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div class="modal-header-block">
          <div class="modal-clinic-pill">
            <span class="modal-pill-dot" aria-hidden="true"></span>
            <span>Dr. Chintan Patel &bull; Valsad</span>
          </div>
          <h2 class="contact-form-title" id="bookingModalTitle">Book Your Child’s Appointment</h2>
          <p class="modal-subtitle">Share your details below for quick confirmation via WhatsApp.</p>
        </div>

        <form class="appointment-form" id="modalAppointmentForm" novalidate>
          <div class="form-row-two">
            <div class="form-field form-field-icon">
              <label for="modalFirstName" class="sr-only">Name</label>
              <svg class="field-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <input type="text" id="modalFirstName" name="firstName" class="form-input" placeholder="Name" required>
            </div>
            <div class="form-field form-field-icon">
              <label for="modalLastName" class="sr-only">Last name</label>
              <svg class="field-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <input type="text" id="modalLastName" name="lastName" class="form-input" placeholder="Last name" required>
            </div>
          </div>

          <div class="form-field form-field-icon">
            <label for="modalEmail" class="sr-only">Email</label>
            <svg class="field-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
            <input type="email" id="modalEmail" name="email" class="form-input" placeholder="Email" required>
          </div>

          <div class="form-field form-field-icon form-field-textarea">
            <label for="modalMessage" class="sr-only">Message</label>
            <svg class="field-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <textarea id="modalMessage" name="message" class="form-input form-textarea" rows="3" placeholder="Message (child's age, symptoms, preferred time)" required></textarea>
          </div>

          <button type="submit" class="btn-form-submit btn-modal-submit">
            <span>Book Appointment</span>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>

          <p class="form-feedback" id="modalFormFeedback" role="status" aria-live="polite"></p>
        </form>

        <div class="modal-trust-bar">
          <span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            Instant WhatsApp Confirmation
          </span>
          <span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            Mon – Sat: 9:30 AM – 7:30 PM
          </span>
        </div>
      </div>
    `;

    document.body.appendChild(modalOverlay);

    const modalCloseBtn = modalOverlay.querySelector('.booking-modal-close');
    const modalFirstInput = document.getElementById('modalFirstName');
    const modalMessageInput = document.getElementById('modalMessage');

    function openBookingModal(serviceName) {
      if (mobileMenu && mobileMenu.classList.contains('open')) {
        closeMobileNav();
      }
      if (modalMessageInput) {
        if (serviceName) {
          modalMessageInput.value = `Service requested: ${serviceName}\n`;
        } else if (modalMessageInput.value.startsWith('Service requested: ')) {
          modalMessageInput.value = '';
        }
      }
      modalOverlay.classList.add('is-open');
      modalOverlay.setAttribute('aria-hidden', 'false');
      document.documentElement.classList.add('modal-open');
      document.body.classList.add('modal-open');
      if (modalFirstInput) {
        setTimeout(() => modalFirstInput.focus(), 120);
      }
    }

    function closeBookingModal() {
      modalOverlay.classList.remove('is-open');
      modalOverlay.setAttribute('aria-hidden', 'true');
      document.documentElement.classList.remove('modal-open');
      document.body.classList.remove('modal-open');
    }

    navBookingTriggers.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openBookingModal();
      });
    });

    document.querySelectorAll('.js-open-booking-modal').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openBookingModal();
      });
    });

    document.querySelectorAll('.js-book-service').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const serviceName = btn.getAttribute('data-service') || '';
        openBookingModal(serviceName);
      });
    });

    if (modalCloseBtn) {
      modalCloseBtn.addEventListener('click', closeBookingModal);
    }

    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        closeBookingModal();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalOverlay.classList.contains('is-open')) {
        closeBookingModal();
      }
    });

    bindAppointmentForm(
      document.getElementById('modalAppointmentForm'),
      document.getElementById('modalFormFeedback')
    );
  }

  // 16. Navbar Services Dropdown Hover Grace Timer, Filter Pills, Mobile Accordion & Card Highlight
  const navDropdownItem = document.querySelector('.nav-item-dropdown');
  if (navDropdownItem) {
    const dropdownTrigger = navDropdownItem.querySelector('.nav-link-dropdown');
    const dropdownPanel = navDropdownItem.querySelector('.nav-services-dropdown');
    let hoverCloseTimer = null;

    const openDropdown = () => {
      clearTimeout(hoverCloseTimer);
      navDropdownItem.classList.add('is-open');
      if (dropdownTrigger) dropdownTrigger.setAttribute('aria-expanded', 'true');
    };

    const scheduleCloseDropdown = () => {
      clearTimeout(hoverCloseTimer);
      hoverCloseTimer = setTimeout(() => {
        navDropdownItem.classList.remove('is-open');
        if (dropdownTrigger) dropdownTrigger.setAttribute('aria-expanded', 'false');
      }, 140);
    };

    navDropdownItem.addEventListener('mouseenter', openDropdown);
    navDropdownItem.addEventListener('mouseleave', scheduleCloseDropdown);

    if (dropdownPanel) {
      dropdownPanel.addEventListener('mouseenter', openDropdown);
      dropdownPanel.addEventListener('mouseleave', scheduleCloseDropdown);
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        clearTimeout(hoverCloseTimer);
        navDropdownItem.classList.remove('is-open');
        if (dropdownTrigger) dropdownTrigger.setAttribute('aria-expanded', 'false');
        if (document.activeElement && navDropdownItem.contains(document.activeElement)) {
          document.activeElement.blur();
        }
      }
    });

    // Visual toggle for left-side 4 filter buttons in Services mega-card
    const filterBtns = navDropdownItem.querySelectorAll('.nav-filter-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        filterBtns.forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
      });
    });
  }

  // Mobile Services Drawer Arrow Accordion
  document.querySelectorAll('.mobile-services-group').forEach(group => {
    const toggleBtn = group.querySelector('.mobile-services-toggle');
    if (!toggleBtn) return;

    toggleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isOpen = group.classList.toggle('is-open');
      toggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  });

  function highlightTargetServiceCard() {
    const hash = window.location.hash;
    if (!hash) return;
    const targetCard = document.querySelector(`.service-page-card${hash}`);
    if (!targetCard) return;
    document.querySelectorAll('.service-page-card.is-highlighted').forEach(c => c.classList.remove('is-highlighted'));
    targetCard.classList.add('is-highlighted');
    setTimeout(() => targetCard.classList.remove('is-highlighted'), 2400);
  }

  highlightTargetServiceCard();
  window.addEventListener('hashchange', highlightTargetServiceCard);

  // 17. Services Page Detail Modal ("Learn More" -> Split Modal with Symptoms / Care / Cause)
  const serviceDetailModal = document.getElementById('serviceDetailModal');
  if (serviceDetailModal) {
    const SERVICE_DETAILS = {
      'newborn-care': {
        title: 'Newborn Care',
        badge: '0 – 1 Month • Neonatal Care',
        image: 'images/services/newborn-care.png',
        alt: 'Peaceful sleeping newborn baby with soft knit hat',
        desc: 'Warm, attentive postnatal checkups supporting your baby’s earliest days, feeding rhythm, and healthy weight gain.',
        tabs: {
          symptoms: [
            'Feeding difficulty or poor latching',
            'Mild jaundice or skin yellowing',
            'Irregular sleep or colic fussiness',
            'Slow early weight gain'
          ],
          care: [
            'Full newborn head-to-toe exam',
            'Lactation & feeding schedule guidance',
            'Umbilical cord & safe sleep advice',
            'Jaundice & early reflex screening'
          ],
          cause: [
            'Post-birth adjustment & hydration shifts',
            'Immature liver enzyme clearance',
            'Early feeding & latch transitions',
            'Developing newborn digestive tract'
          ]
        }
      },
      'growth-development': {
        title: 'Growth & Development Monitoring',
        badge: 'All Ages • Milestone Tracking',
        image: 'images/services/growth-development.png',
        alt: 'Happy smiling toddler sitting up cheerfully',
        desc: 'Proactive tracking of physical growth, motor skills, speech, and social milestones at every age.',
        tabs: {
          symptoms: [
            'Delayed sitting, crawling, or walking',
            'Fewer words or delayed speech clarity',
            'Sudden height or weight percentile dip',
            'Attention or social play concerns'
          ],
          care: [
            'WHO growth chart plotting every visit',
            'Age-specific motor & speech screening',
            'Playful cognitive milestone activities',
            'Early intervention guidance if needed'
          ],
          cause: [
            'Normal individual growth variations',
            'Nutritional gaps during growth spurts',
            'Ear fluid affecting early speech clarity',
            'Genetic height & build patterns'
          ]
        }
      },
      'vaccination': {
        title: 'Vaccination & Immunization',
        badge: 'Preventive Care • IAP / CDC',
        image: 'images/services/vaccination-immunization.png',
        alt: 'Smiling young girl receiving a gentle pediatric vaccination',
        desc: 'Timely, gentle immunizations following trusted pediatric guidelines to build lifelong protection safely.',
        tabs: {
          symptoms: [
            'Due or missed routine booster doses',
            'Mild warmth or soreness post-shot',
            'Upcoming school or travel immunizations',
            'Seasonal flu protection needs'
          ],
          care: [
            'Painless-focus gentle injection technique',
            'Personalized digital vaccine schedule',
            'Post-vaccine comfort & fever guidance',
            'Cold-chain certified vaccine storage'
          ],
          cause: [
            'Age-scheduled immunity milestones',
            'Waning protection needing boosters',
            'Seasonal viral & bacterial exposure',
            'School & daycare group exposure'
          ]
        }
      },
      'childhood-illnesses': {
        title: 'Treatment of Common Childhood Illnesses',
        badge: 'Same-Day Pediatric Care',
        image: 'images/services/childhood-illnesses.png',
        alt: 'Dr. Chintan Patel consulting warmly with mother and child',
        desc: 'Prompt, accurate diagnosis and gentle relief for fevers, colds, earaches, stomach bugs, and rashes.',
        tabs: {
          symptoms: [
            'Persistent fever or chills',
            'Runny nose, sore throat, or cough',
            'Ear tugging, tummy ache, or vomiting',
            'Sudden skin rashes or low energy'
          ],
          care: [
            'Same-day gentle pediatric examination',
            'Child-safe weight-based dosing plans',
            'Hydration & home comfort instructions',
            'Quick follow-up check if symptoms linger'
          ],
          cause: [
            'Common seasonal viral infections',
            'School or playground germ spread',
            'Mild ear or throat bacterial bugs',
            'Food sensitivity or stomach viruses'
          ]
        }
      },
      'nutrition-guidance': {
        title: 'Nutrition & Dietary Guidance',
        badge: 'Balanced Growth • Diet Plans',
        image: 'images/services/nutrition-guidance.png',
        alt: 'Happy child enjoying fresh colorful healthy fruits',
        desc: 'Practical, family-friendly nutrition counseling from first solids to balanced meals for thriving energy.',
        tabs: {
          symptoms: [
            'Picky eating or mealtime refusal',
            'Low appetite, fatigue, or pale look',
            'Constipation or tummy bloating',
            'Underweight or rapid weight shifts'
          ],
          care: [
            'Age-tailored daily meal & snack plans',
            'Gentle weaning & solids transition chart',
            'Iron, calcium & vitamin-rich food ideas',
            'Healthy habit tips without meal stress'
          ],
          cause: [
            'Texture sensitivity during weaning',
            'Excess milk or sugary snacking',
            'Low dietary fiber or hydration',
            'Changing appetite in toddler years'
          ]
        }
      },
      'asthma-respiratory': {
        title: 'Childhood Asthma & Respiratory Care',
        badge: 'Gentle Breathing & Allergy Relief',
        image: 'images/services/asthma-respiratory.png',
        alt: 'Dr. Chintan Patel checking a child’s chest with a stethoscope',
        desc: 'Specialized airway evaluation, inhaler/nebulizer guidance, and preventive care so children breathe easy.',
        tabs: {
          symptoms: [
            'Nighttime or play-triggered dry cough',
            'Wheezing or whistling chest sounds',
            'Shortness of breath during active play',
            'Frequent seasonal sneezing & congestion'
          ],
          care: [
            'Detailed lung & airway assessment',
            'Kid-friendly spacer & nebulizer training',
            'Written home asthma action plan',
            'Allergy trigger identification & control'
          ],
          cause: [
            'Dust mites, pollen, or weather shifts',
            'Viral colds triggering sensitive airways',
            'Family tendency toward asthma or allergies',
            'Indoor smoke or strong fragrances'
          ]
        }
      }
    };

    const detailImg = document.getElementById('serviceDetailImg');
    const detailBadge = document.getElementById('serviceDetailBadge');
    const detailTitle = document.getElementById('serviceDetailTitle');
    const detailDesc = document.getElementById('serviceDetailDesc');
    const detailPoints = document.getElementById('serviceDetailPoints');
    const detailTabs = serviceDetailModal.querySelectorAll('.service-detail-tab');
    const detailBookBtn = document.getElementById('serviceDetailBookBtn');
    const detailCloseBtn = serviceDetailModal.querySelector('.service-detail-close');

    let activeServiceId = 'newborn-care';
    let activeTabKey = 'symptoms';

    function renderDetailPoints() {
      const svc = SERVICE_DETAILS[activeServiceId];
      if (!svc || !detailPoints) return;
      const items = svc.tabs[activeTabKey] || [];
      detailPoints.innerHTML = items.map(text => `
        <li class="service-detail-point">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="9 12 11.5 14.5 16 9.5"></polyline>
          </svg>
          <span>${text}</span>
        </li>
      `).join('');
    }

    function openServiceDetail(serviceId) {
      const svc = SERVICE_DETAILS[serviceId];
      if (!svc) return;
      activeServiceId = serviceId;
      activeTabKey = 'symptoms';

      if (detailImg) {
        detailImg.src = svc.image;
        detailImg.alt = svc.alt;
      }
      if (detailBadge) detailBadge.textContent = svc.badge;
      if (detailTitle) detailTitle.textContent = svc.title;
      if (detailDesc) detailDesc.textContent = svc.desc;

      detailTabs.forEach(tab => {
        const isDefault = tab.getAttribute('data-tab') === 'symptoms';
        tab.classList.toggle('is-active', isDefault);
        tab.setAttribute('aria-selected', isDefault ? 'true' : 'false');
      });

      renderDetailPoints();
      serviceDetailModal.classList.add('is-open');
      serviceDetailModal.setAttribute('aria-hidden', 'false');
      document.documentElement.classList.add('modal-open');
      document.body.classList.add('modal-open');
    }

    function closeServiceDetail() {
      serviceDetailModal.classList.remove('is-open');
      serviceDetailModal.setAttribute('aria-hidden', 'true');
      document.documentElement.classList.remove('modal-open');
      document.body.classList.remove('modal-open');
    }

    document.querySelectorAll('.js-open-service-detail').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const sid = btn.getAttribute('data-service-id');
        openServiceDetail(sid);
      });
    });

    detailTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        activeTabKey = tab.getAttribute('data-tab') || 'symptoms';
        detailTabs.forEach(t => {
          const active = t === tab;
          t.classList.toggle('is-active', active);
          t.setAttribute('aria-selected', active ? 'true' : 'false');
        });
        renderDetailPoints();
      });
    });

    if (detailBookBtn) {
      detailBookBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const svc = SERVICE_DETAILS[activeServiceId];
        closeServiceDetail();
        const modalOverlay = document.getElementById('bookingModal');
        const modalMsg = document.getElementById('modalMessage');
        const modalFirst = document.getElementById('modalFirstName');
        if (modalOverlay) {
          if (modalMsg && svc) {
            modalMsg.value = `Service requested: ${svc.title}\n`;
          }
          modalOverlay.classList.add('is-open');
          modalOverlay.setAttribute('aria-hidden', 'false');
          document.documentElement.classList.add('modal-open');
          document.body.classList.add('modal-open');
          if (modalFirst) setTimeout(() => modalFirst.focus(), 120);
        }
      });
    }

    if (detailCloseBtn) {
      detailCloseBtn.addEventListener('click', closeServiceDetail);
    }

    serviceDetailModal.addEventListener('click', (e) => {
      if (e.target === serviceDetailModal) closeServiceDetail();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && serviceDetailModal.classList.contains('is-open')) {
        closeServiceDetail();
      }
    });
  }

  // 18. Childhood Health Journey Scroll Pop-Up Animation (Each Stage Pops In Smoothly Before Viewport Entry)
  const journeyStages = document.querySelectorAll('#journeyTrack .journey-stage');
  if (journeyStages.length > 0) {
    if ('IntersectionObserver' in window) {
      const stageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const idx = Array.from(journeyStages).indexOf(entry.target);
            const delay = window.innerWidth > 868 ? idx * 70 : 0;
            if (delay > 0) {
              setTimeout(() => entry.target.classList.add('is-popped'), delay);
            } else {
              entry.target.classList.add('is-popped');
            }
            stageObserver.unobserve(entry.target);
          }
        });
      }, { rootMargin: '80px 0px 80px 0px', threshold: 0.01 });

      journeyStages.forEach(stage => stageObserver.observe(stage));
    } else {
      journeyStages.forEach(stage => stage.classList.add('is-popped'));
    }
  }

  // 19. Services Page Search Bar + Category Filters + List All Reset
  const servicesSearchInput = document.getElementById('servicesSearchInput');
  const servicesSearchClear = document.getElementById('servicesSearchClear');
  const servicesFilterBtns = document.querySelectorAll('.services-filter-btn');
  const servicesCards = document.querySelectorAll('#servicesPageGrid .service-page-card');
  const servicesEmptyState = document.getElementById('servicesEmptyState');
  const servicesEmptyResetBtn = document.getElementById('servicesEmptyResetBtn');

  if (servicesCards.length > 0 && (servicesSearchInput || servicesFilterBtns.length > 0)) {
    let activeCategory = 'all';
    let searchTerm = '';

    function applyServiceFilters() {
      const q = searchTerm.trim().toLowerCase();
      let visibleCount = 0;

      servicesCards.forEach(card => {
        const cardCat = card.getAttribute('data-category') || '';
        const matchesCategory = activeCategory === 'all' || cardCat === activeCategory;
        const text = card.textContent.toLowerCase();
        const matchesSearch = !q || text.includes(q);
        const shouldShow = matchesCategory && matchesSearch;

        card.classList.toggle('is-hidden', !shouldShow);
        if (shouldShow) visibleCount++;
      });

      if (servicesEmptyState) {
        servicesEmptyState.hidden = visibleCount > 0;
      }

      if (servicesSearchClear) {
        servicesSearchClear.hidden = q.length === 0;
      }
    }

    if (servicesSearchInput) {
      servicesSearchInput.addEventListener('input', () => {
        searchTerm = servicesSearchInput.value;
        applyServiceFilters();
      });
    }

    if (servicesSearchClear && servicesSearchInput) {
      servicesSearchClear.addEventListener('click', () => {
        servicesSearchInput.value = '';
        searchTerm = '';
        applyServiceFilters();
        servicesSearchInput.focus();
      });
    }

    servicesFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const filterVal = btn.getAttribute('data-filter') || 'all';
        activeCategory = filterVal;

        if (filterVal === 'all' && servicesSearchInput) {
          servicesSearchInput.value = '';
          searchTerm = '';
        }

        servicesFilterBtns.forEach(b => b.classList.toggle('is-active', b === btn));
        applyServiceFilters();
      });
    });

    if (servicesEmptyResetBtn) {
      servicesEmptyResetBtn.addEventListener('click', () => {
        activeCategory = 'all';
        searchTerm = '';
        if (servicesSearchInput) servicesSearchInput.value = '';
        servicesFilterBtns.forEach(b => {
          b.classList.toggle('is-active', b.getAttribute('data-filter') === 'all');
        });
        applyServiceFilters();
      });
    }
  }
});
