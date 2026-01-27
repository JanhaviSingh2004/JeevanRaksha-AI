// ============================================
// FUTURISTIC AI MEDICAL RESULTS - ANIMATIONS
// Premium Interactive Experience
// ============================================

class AIResultsExperience {
  constructor() {
    this.init();
  }

  init() {
    this.createParticles();
    this.initLoader();
    this.initMedicineCards();
    this.initConfidenceMeter();
    this.initSoundEffects();
    this.initViewToggle();
  }

  // Create floating particles
  createParticles() {
    const particlesContainer = document.querySelector('.ai-particles');
    if (!particlesContainer) return;

    for (let i = 0; i < 30; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 8 + 's';
      particle.style.animationDuration = (Math.random() * 4 + 6) + 's';
      particlesContainer.appendChild(particle);
    }
  }

  // AI Scanning Loader
  initLoader() {
    const loader = document.querySelector('.ai-loader');
    if (!loader) return;

    const scanText = loader.querySelector('.scan-text');
    const messages = [
      'Initializing AI Engine...',
      'Analyzing Symptoms...',
      'Processing Medical Data...',
      'Generating Diagnosis...',
      'Complete!'
    ];

    let index = 0;
    const interval = setInterval(() => {
      if (index < messages.length) {
        scanText.textContent = messages[index];
        index++;
      } else {
        clearInterval(interval);
      }
    }, 500);

    // Remove loader after animation
    setTimeout(() => {
      loader.style.display = 'none';
    }, 3000);
  }

  // Medicine Cards Interaction
  initMedicineCards() {
    const cards = document.querySelectorAll('.medicine-card');
    
    cards.forEach(card => {
      card.addEventListener('click', () => {
        // Toggle expanded state
        const isExpanded = card.classList.contains('expanded');
        
        // Close all other cards
        cards.forEach(c => c.classList.remove('expanded'));
        
        // Toggle current card
        if (!isExpanded) {
          card.classList.add('expanded');
          this.playSound('expand');
        } else {
          card.classList.remove('expanded');
        }
      });

      // Hover effect
      card.addEventListener('mouseenter', () => {
        this.playSound('hover');
      });
    });
  }

  // Animated Confidence Meter
  initConfidenceMeter() {
    const confidenceFill = document.querySelector('.confidence-fill');
    if (!confidenceFill) return;

    // Simulate AI confidence calculation
    const targetConfidence = 85; // This should come from backend
    confidenceFill.style.setProperty('--confidence-width', targetConfidence + '%');

    // Update value with animation
    const valueElement = document.querySelector('.confidence-value');
    if (valueElement) {
      let current = 0;
      const duration = 1500;
      const increment = targetConfidence / (duration / 16);
      
      const counter = setInterval(() => {
        current += increment;
        if (current >= targetConfidence) {
          current = targetConfidence;
          clearInterval(counter);
        }
        valueElement.textContent = Math.round(current) + '%';
      }, 16);
    }
  }

  // Sound Effects (subtle)
  initSoundEffects() {
    this.sounds = {
      hover: this.createSound(200, 0.05, 'sine'),
      expand: this.createSound(300, 0.1, 'sine'),
      click: this.createSound(400, 0.1, 'square')
    };
  }

  createSound(frequency, volume, type) {
    return () => {
      if (!window.AudioContext && !window.webkitAudioContext) return;
      
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = type;
      gainNode.gain.value = volume;

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    };
  }

  playSound(type) {
    if (this.sounds && this.sounds[type]) {
      this.sounds[type]();
    }
  }

  // View Toggle (Simple/Detailed)
  initViewToggle() {
    const toggleBtn = document.getElementById('viewToggle');
    if (!toggleBtn) return;

    let isDetailed = true;
    
    toggleBtn.addEventListener('click', () => {
      isDetailed = !isDetailed;
      document.body.classList.toggle('simple-view', !isDetailed);
      toggleBtn.textContent = isDetailed ? 'Simple View' : 'Detailed AI View';
      this.playSound('click');
    });
  }
}

// Magnetic Button Effect
class MagneticButton {
  constructor(element) {
    this.element = element;
    this.init();
  }

  init() {
    this.element.addEventListener('mousemove', (e) => {
      const rect = this.element.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      this.element.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
    });

    this.element.addEventListener('mouseleave', () => {
      this.element.style.transform = 'translate(0, 0)';
    });
  }
}

// Ripple Effect on Click
function createRipple(event) {
  const button = event.currentTarget;
  const ripple = document.createElement('span');
  
  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;

  ripple.style.width = ripple.style.height = size + 'px';
  ripple.style.left = x + 'px';
  ripple.style.top = y + 'px';
  ripple.classList.add('ripple-effect');

  button.appendChild(ripple);

  setTimeout(() => ripple.remove(), 600);
}

// Text-to-Speech with Visual Feedback
function speakResult(text, lang) {
  if ('speechSynthesis' in window) {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1;

    // Visual feedback
    const speakBtn = event.target;
    speakBtn.classList.add('speaking');
    speakBtn.innerHTML = '<i class="ti ti-volume"></i> Speaking...';

    utterance.onend = () => {
      speakBtn.classList.remove('speaking');
      speakBtn.innerHTML = '<i class="ti ti-volume"></i> Read Aloud';
    };

    window.speechSynthesis.speak(utterance);
  } else {
    alert('Text-to-speech is not supported in your browser.');
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  // Initialize main experience
  new AIResultsExperience();

  // Add magnetic effect to buttons
  document.querySelectorAll('.btn-primary, .btn-secondary').forEach(btn => {
    new MagneticButton(btn);
    btn.addEventListener('click', createRipple);
  });

  // Smooth scroll for any internal links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Add parallax effect to header on scroll
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const scrolled = window.pageYOffset;
        const header = document.querySelector('.result-header');
        if (header) {
          header.style.transform = `translateY(${scrolled * 0.3}px)`;
          header.style.opacity = 1 - (scrolled / 500);
        }
        ticking = false;
      });
      ticking = true;
    }
  });
});

// Add ripple effect styles dynamically
const style = document.createElement('style');
style.textContent = `
  .ripple-effect {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.6);
    transform: scale(0);
    animation: ripple-animation 0.6s ease-out;
    pointer-events: none;
  }

  @keyframes ripple-animation {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }

  .speaking {
    animation: speakPulse 1s ease-in-out infinite;
  }

  @keyframes speakPulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
  }

  .simple-view .medicine-details,
  .simple-view .confidence-section,
  .simple-view .care-section {
    display: none !important;
  }
`;
document.head.appendChild(style);