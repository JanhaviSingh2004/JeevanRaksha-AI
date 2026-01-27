// Advanced Micro-interactions for Professional UX
class MicroInteractions {
  constructor() {
    this.init();
  }

  init() {
    this.addRippleEffect();
    this.addFloatingLabels();
    this.addInputValidationFeedback();
    this.addButtonHoverEffects();
    this.addScrollAnimations();
  }

  // Ripple effect on buttons
  addRippleEffect() {
    document.addEventListener('click', (e) => {
      const button = e.target.closest('button, .btn');
      if (!button) return;

      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';

      button.style.position = 'relative';
      button.style.overflow = 'hidden';
      button.appendChild(ripple);

      setTimeout(() => ripple.remove(), 600);
    });
  }

  // Floating labels for inputs
  addFloatingLabels() {
    const inputs = document.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
      const label = input.previousElementSibling;
      if (!label || label.tagName !== 'LABEL') return;

      const checkValue = () => {
        if (input.value || input === document.activeElement) {
          label.classList.add('label-float');
        } else {
          label.classList.remove('label-float');
        }
      };

      input.addEventListener('focus', checkValue);
      input.addEventListener('blur', checkValue);
      input.addEventListener('input', checkValue);
      checkValue();
    });
  }

  // Real-time validation feedback
  addInputValidationFeedback() {
    const inputs = document.querySelectorAll('input[required], textarea[required]');
    
    inputs.forEach(input => {
      let timeout;
      
      input.addEventListener('input', () => {
        clearTimeout(timeout);
        input.classList.remove('input-error', 'input-success');
        
        timeout = setTimeout(() => {
          if (input.value.trim()) {
            input.classList.add('input-success');
            this.createCheckmark(input);
          }
        }, 500);
      });

      input.addEventListener('blur', () => {
        if (input.hasAttribute('required') && !input.value.trim()) {
          input.classList.add('input-error');
          this.createErrorIcon(input);
        }
      });
    });
  }

  createCheckmark(input) {
    const existing = input.parentElement.querySelector('.validation-icon');
    if (existing) existing.remove();

    const icon = document.createElement('span');
    icon.className = 'validation-icon validation-success';
    icon.innerHTML = '✓';
    input.parentElement.appendChild(icon);
  }

  createErrorIcon(input) {
    const existing = input.parentElement.querySelector('.validation-icon');
    if (existing) existing.remove();

    const icon = document.createElement('span');
    icon.className = 'validation-icon validation-error';
    icon.innerHTML = '✕';
    input.parentElement.appendChild(icon);
  }

  // Advanced button hover effects
  addButtonHoverEffects() {
    const buttons = document.querySelectorAll('button, .btn');
    
    buttons.forEach(button => {
      button.addEventListener('mouseenter', (e) => {
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        button.style.setProperty('--mouse-x', x + 'px');
        button.style.setProperty('--mouse-y', y + 'px');
      });
    });
  }

  // Scroll-triggered animations
  addScrollAnimations() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, observerOptions);

    // Observe elements that should animate on scroll
    document.querySelectorAll('.step, .input-group').forEach(el => {
      observer.observe(el);
    });
  }
}

// Initialize micro-interactions
document.addEventListener('DOMContentLoaded', () => {
  new MicroInteractions();
});