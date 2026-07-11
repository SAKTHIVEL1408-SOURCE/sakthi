document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 1. PRELOADER
  // ==========================================
  const preloader = document.getElementById('preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        preloader.style.opacity = '0';
        preloader.style.visibility = 'hidden';
      }, 500); // Small delay to let the animation complete nicely
    });
    
    // Fallback if load event takes too long
    setTimeout(() => {
      preloader.style.opacity = '0';
      preloader.style.visibility = 'hidden';
    }, 4000);
  }

  // ==========================================
  // 2. NAVBAR SCROLL EFFECT
  // ==========================================
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // ==========================================
  // 3. MOBILE MENU TOGGLE
  // ==========================================
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('nav-links');
  const links = document.querySelectorAll('.nav-link');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      navLinks.classList.toggle('open');
    });

    // Close menu when clicking links
    links.forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        navLinks.classList.remove('open');
      });
    });
  }

  // ==========================================
  // 4. SCROLLSPY (ACTIVE LINK ON SCROLL)
  // ==========================================
  const sections = document.querySelectorAll('section');
  const navItems = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let currentSectionId = '';
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120; // offset for fixed header
      const sectionHeight = section.clientHeight;
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        currentSectionId = section.getAttribute('id');
      }
    });

    navItems.forEach(item => {
      item.classList.remove('active');
      if (item.getAttribute('href') === `#${currentSectionId}`) {
        item.classList.add('active');
      }
    });
  });

  // ==========================================
  // 5. COUNT-UP STATS ANIMATION
  // ==========================================
  const statNumbers = document.querySelectorAll('.stat-number');
  
  const startCountUp = (element) => {
    const target = parseInt(element.getAttribute('data-target'), 10);
    const duration = 2000; // 2 seconds animation
    const startTime = performance.now();
    
    const updateCount = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing out quadratic function
      const easeProgress = progress * (2 - progress);
      const currentValue = Math.floor(easeProgress * target);
      
      element.textContent = currentValue;
      
      if (progress < 1) {
        requestAnimationFrame(updateCount);
      } else {
        element.textContent = target; // Ensure it ends on exact target
      }
    };
    
    requestAnimationFrame(updateCount);
  };

  // Trigger when scrolled into view
  if ('IntersectionObserver' in window && statNumbers.length > 0) {
    const statsObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          startCountUp(entry.target);
          observer.unobserve(entry.target); // Only count up once
        }
      });
    }, { threshold: 0.5 });

    statNumbers.forEach(stat => statsObserver.observe(stat));
  } else {
    // Fallback if IntersectionObserver not supported
    statNumbers.forEach(stat => stat.textContent = stat.getAttribute('data-target'));
  }

  // ==========================================
  // 6. FAQ ACCORDION COLLAPSE/EXPAND
  // ==========================================
  const faqQuestions = document.querySelectorAll('.faq-question');
  
  faqQuestions.forEach(question => {
    question.addEventListener('click', () => {
      const item = question.parentElement;
      const answer = question.nextElementSibling;
      const isActive = item.classList.contains('active');
      
      // Close all other FAQs first
      document.querySelectorAll('.faq-item').forEach(otherItem => {
        otherItem.classList.remove('active');
        otherItem.querySelector('.faq-answer').style.maxHeight = null;
      });

      if (!isActive) {
        item.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });

  // ==========================================
  // 7. PORTFOLIO GALLERY FILTER
  // ==========================================
  const filterButtons = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active classes
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      galleryItems.forEach(item => {
        const category = item.getAttribute('data-category');
        
        // Custom animated fade in/out
        if (filterValue === 'all' || category === filterValue) {
          item.style.display = 'block';
          setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'scale(1)';
          }, 50);
        } else {
          item.style.opacity = '0';
          item.style.transform = 'scale(0.8)';
          setTimeout(() => {
            item.style.display = 'none';
          }, 400);
        }
      });
    });
  });

  // ==========================================
  // 8. TESTIMONIALS CAROUSEL SLIDER
  // ==========================================
  const testimonialCards = document.querySelectorAll('.testimonial-card');
  const dots = document.querySelectorAll('.testimonial-dots .dot');
  let currentTestimonial = 0;
  let testimonialInterval;

  const showTestimonial = (index) => {
    testimonialCards.forEach(card => card.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));

    testimonialCards[index].classList.add('active');
    dots[index].classList.add('active');
    currentTestimonial = index;
  };

  const nextTestimonial = () => {
    let nextIndex = currentTestimonial + 1;
    if (nextIndex >= testimonialCards.length) {
      nextIndex = 0;
    }
    showTestimonial(nextIndex);
  };

  // Handle dots click
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      clearInterval(testimonialInterval);
      const index = parseInt(dot.getAttribute('data-index'), 10);
      showTestimonial(index);
      startAutoSlide();
    });
  });

  const startAutoSlide = () => {
    testimonialInterval = setInterval(nextTestimonial, 5000); // Change slide every 5s
  };

  if (testimonialCards.length > 0) {
    startAutoSlide();
  }

  // ==========================================
  // 9. SCROLL TO TOP BUTTON
  // ==========================================
  const scrollTopBtn = document.getElementById('scroll-top');
  
  if (scrollTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 500) {
        scrollTopBtn.classList.add('visible');
      } else {
        scrollTopBtn.classList.remove('visible');
      }
    });

    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // ==========================================
  // 10. MODAL HANDLING & CALLBACK REQUESTS
  // ==========================================
  const callbackModal = document.getElementById('callback-modal');
  const modalCloseBtn = document.getElementById('modal-close');
  const modalForm = document.getElementById('modal-form');
  const modalSuccess = document.getElementById('modal-success');

  // Open Modal function
  const openModal = () => {
    if (callbackModal && !sessionStorage.getItem('modalOpened')) {
      callbackModal.classList.add('open');
      sessionStorage.setItem('modalOpened', 'true');
    }
  };

  // Close Modal function
  const closeModal = () => {
    if (callbackModal) {
      callbackModal.classList.remove('open');
    }
  };

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeModal);
  }

  // Close Modal when clicking outside the content
  window.addEventListener('click', (e) => {
    if (e.target === callbackModal) {
      closeModal();
    }
  });

  // Trigger Modal: 1) After 15 seconds
  setTimeout(openModal, 15000);

  // Trigger Modal: 2) Exit Intent (User mouse leaves window at the top)
  document.addEventListener('mouseleave', (e) => {
    if (e.clientY < 20) {
      openModal();
    }
  });

  // ==========================================
  // 11. FORM VALIDATION & AJAX SUBMISSION
  // ==========================================
  const contactForm = document.getElementById('contact-form');
  const formSuccess = document.getElementById('form-success');
  const submitBtn = document.getElementById('form-submit-btn');
  const btnText = document.getElementById('btn-text');
  const btnLoader = document.getElementById('btn-loader');

  // Input Field Interactive Styling
  const radioOptions = document.querySelectorAll('.radio-option');
  radioOptions.forEach(option => {
    const input = option.querySelector('input[type="radio"]');
    
    // On click
    option.addEventListener('click', () => {
      // Unselect all in group
      radioOptions.forEach(opt => opt.classList.remove('selected'));
      // Select clicked
      option.classList.add('selected');
      input.checked = true;
    });
  });

  // Validation Helpers
  const setError = (element, id, message) => {
    const errorEl = document.getElementById(id);
    if (errorEl) {
      errorEl.textContent = message;
      element.style.borderColor = 'var(--color-accent)';
    }
  };

  const clearError = (element, id) => {
    const errorEl = document.getElementById(id);
    if (errorEl) {
      errorEl.textContent = '';
      element.style.borderColor = 'var(--border-glass)';
    }
  };

  // Handle Free Quote Contact Form Submission
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      let isValid = true;
      const nameField = document.getElementById('name');
      const phoneField = document.getElementById('phone');
      const emailField = document.getElementById('email');
      const serviceField = document.getElementById('service');
      const messageField = document.getElementById('message');
      const propertyField = document.querySelector('input[name="property"]:checked');

      // Clear errors
      clearError(nameField, 'error-name');
      clearError(phoneField, 'error-phone');
      clearError(emailField, 'error-email');
      clearError(serviceField, 'error-service');

      // Validate Name
      if (!nameField.value.trim()) {
        setError(nameField, 'error-name', 'Full name is required');
        isValid = false;
      }

      // Validate Phone
      const phoneVal = phoneField.value.trim();
      const phoneRegex = /^[+]?[0-9]{10,14}$/;
      if (!phoneVal) {
        setError(phoneField, 'error-phone', 'Phone number is required');
        isValid = false;
      } else if (!phoneRegex.test(phoneVal.replace(/\s+/g, ''))) {
        setError(phoneField, 'error-phone', 'Please enter a valid phone number (10+ digits)');
        isValid = false;
      }

      // Validate Email (optional, but if filled, check format)
      const emailVal = emailField.value.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailVal && !emailRegex.test(emailVal)) {
        setError(emailField, 'error-email', 'Please enter a valid email address');
        isValid = false;
      }

      // Validate Service Required
      if (!serviceField.value) {
        setError(serviceField, 'error-service', 'Please select a security service');
        isValid = false;
      }

      if (!isValid) return;

      // Submit form via fetch
      try {
        // Show Loader
        submitBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline-block';

        const payload = {
          name: nameField.value.trim(),
          phone: phoneField.value.trim(),
          email: emailField.value.trim(),
          service: serviceField.value,
          property: propertyField ? propertyField.value : '',
          message: messageField.value.trim()
        };

        const response = await fetch('/api/quote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok) {
          // Success state
          contactForm.reset();
          radioOptions.forEach(opt => opt.classList.remove('selected'));
          formSuccess.style.display = 'block';
          formSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          setTimeout(() => {
            formSuccess.style.display = 'none';
          }, 8000);
        } else {
          // Server error
          alert(data.message || 'Something went wrong. Please try again.');
        }
      } catch (err) {
        console.error('Error submitting form:', err);
        alert('Network error. Please check your connection and try again.');
      } finally {
        submitBtn.disabled = false;
        btnText.style.display = 'inline-block';
        btnLoader.style.display = 'none';
      }
    });
  }

  // Handle Callback Request Modal Form Submission
  if (modalForm) {
    modalForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nameField = document.getElementById('modal-name');
      const phoneField = document.getElementById('modal-phone');

      if (!nameField.value.trim() || !phoneField.value.trim()) {
        alert('Please fill in both name and phone number fields.');
        return;
      }

      try {
        const payload = {
          name: nameField.value.trim(),
          phone: phoneField.value.trim()
        };

        const response = await fetch('http://localhost:3000/api/callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok) {
          modalForm.reset();
          modalSuccess.style.display = 'block';
          setTimeout(() => {
            modalSuccess.style.display = 'none';
            closeModal();
          }, 3000);
        } else {
          alert(data.message || 'Failed to submit callback request.');
        }
      } catch (err) {
        console.error('Error submitting callback request:', err);
        alert('Network error. Please try again.');
      }
    });
  }
});
