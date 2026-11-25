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

  // 3. Floating Capsule Navbar on Scroll
  function handleScrollCapsule() {
    if (window.scrollY > 30) {
      header.classList.add('scrolled-capsule');
    } else {
      header.classList.remove('scrolled-capsule');
    }
  }

  window.addEventListener('scroll', handleScrollCapsule, { passive: true });
  handleScrollCapsule(); // Initial check on page load

  // 4. Scroll-Triggered Entrance Animation for About Section (Doctor Image + Gradient appear from below)
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
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.12
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
          // Trigger slightly after card pop-in delay
          setTimeout(runNumberCounters, 400);
          observer.disconnect();
        }
      });
    }, { threshold: 0.15 });
    
    observer.observe(statsSection);
  } else {
    setTimeout(runNumberCounters, 450);
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
    }, { threshold: 0.12 });
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
      }, { rootMargin: '0px 0px -30px 0px', threshold: 0.08 });
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
    }, { threshold: 0.12 });
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
    }, { rootMargin: '0px 0px -30px 0px', threshold: 0.08 });
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
    }, { rootMargin: '0px 0px -30px 0px', threshold: 0.08 });
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
    }, { rootMargin: '0px 0px -30px 0px', threshold: 0.08 });
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
        </div>
        <button type="button" class="booking-modal-close" aria-label="Close booking form">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <h2 class="contact-form-title" id="bookingModalTitle">Book Your Child’s Appointment</h2>
        <form class="appointment-form" id="modalAppointmentForm" novalidate>
          <div class="form-row-two">
            <div class="form-field">
              <label for="modalFirstName" class="sr-only">Name</label>
              <input type="text" id="modalFirstName" name="firstName" class="form-input" placeholder="Name" required>
            </div>
            <div class="form-field">
              <label for="modalLastName" class="sr-only">Last name</label>
              <input type="text" id="modalLastName" name="lastName" class="form-input" placeholder="Last name" required>
            </div>
          </div>
          <div class="form-field">
            <label for="modalEmail" class="sr-only">Email</label>
            <input type="email" id="modalEmail" name="email" class="form-input" placeholder="Email" required>
          </div>
          <div class="form-field">
            <label for="modalMessage" class="sr-only">Message</label>
            <textarea id="modalMessage" name="message" class="form-input form-textarea" rows="4" placeholder="Message" required></textarea>
          </div>
          <button type="submit" class="btn-form-submit">
            <span>Book Appointment</span>
          </button>
          <p class="form-feedback" id="modalFormFeedback" role="status" aria-live="polite"></p>
        </form>
      </div>
    `;

    document.body.appendChild(modalOverlay);

    const modalCloseBtn = modalOverlay.querySelector('.booking-modal-close');
    const modalFirstInput = document.getElementById('modalFirstName');

    function openBookingModal() {
      if (mobileMenu && mobileMenu.classList.contains('open')) {
        closeMobileNav();
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
});
