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
});
