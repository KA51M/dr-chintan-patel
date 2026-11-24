/**
 * Dr. Chintan Patel Pediatrician Website
 * Core Interactivity, Floating Capsule Navbar, Scroll Animations & Counters
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const header = document.getElementById('header');
  const mobileToggle = document.getElementById('mobileToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');

  // 1. Mobile Menu Drawer Toggle
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

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (mobileMenu.classList.contains('open') && !mobileMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
        closeMobileNav();
      }
    });
  }

  function openMobileNav() {
    mobileToggle.classList.add('active');
    mobileToggle.setAttribute('aria-expanded', 'true');
    mobileMenu.classList.add('open');
  }

  function closeMobileNav() {
    mobileToggle.classList.remove('active');
    mobileToggle.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('open');
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
});
