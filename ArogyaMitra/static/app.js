let step = 0;
const steps = document.querySelectorAll(".step");
const stepIndicators = document.querySelectorAll(".step-indicator");
const bar = document.querySelector(".progress-bar");
const form = document.getElementById("healthForm");

function showStep(n) {
  // Update step visibility
  steps.forEach((s, i) => {
    s.classList.toggle("active", i === n);
  });

  // Update progress bar
  const progress = ((n + 1) / steps.length) * 100;
  bar.style.width = progress + "%";

  // Update step indicators
  stepIndicators.forEach((indicator, i) => {
    indicator.classList.remove("active", "completed");
    if (i === n) {
      indicator.classList.add("active");
    } else if (i < n) {
      indicator.classList.add("completed");
    }
  });

  // Scroll to top of container smoothly
  const container = document.querySelector(".container");
  container.scrollIntoView({ behavior: "smooth", block: "center" });
}

function validateStep(stepIndex) {
  const currentStep = steps[stepIndex];
  const inputs = currentStep.querySelectorAll("input, textarea, select");
  
  for (let input of inputs) {
    if (input.hasAttribute("required") && !input.value.trim()) {
      input.focus();
      input.classList.add('input-error');
      
      // Show error toast
      if (window.toast) {
        toast.error('Please fill in this field', 2000);
      }
      
      return false;
    }
    
    // Validate number input
    if (input.type === "number") {
      const value = parseInt(input.value);
      const min = parseInt(input.getAttribute("min"));
      const max = parseInt(input.getAttribute("max"));
      
      if (min && value < min) {
        input.focus();
        return false;
      }
      if (max && value > max) {
        input.focus();
        return false;
      }
    }
  }
  
  return true;
}

function nextStep() {
  if (!validateStep(step)) {
    return;
  }

  if (step < steps.length - 1) {
    step++;
    showStep(step);
    
    // Show success feedback
    if (window.toast) {
      toast.success('Step completed!', 1500);
    }
  }
}

// Add shake animation to CSS dynamically
const style = document.createElement("style");
style.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-10px); }
    75% { transform: translateX(10px); }
  }
`;
document.head.appendChild(style);

// Form submission handler
form.addEventListener("submit", function(e) {
  const submitBtn = form.querySelector(".btn-submit");
  submitBtn.classList.add("loading");
  submitBtn.disabled = true;
  
  // Show analyzing toast
  if (window.toast) {
    toast.info('Analyzing your symptoms...', 3000);
  }
});

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  showStep(step);

  // Typing effect for AI message
  const text = "Hi, I am ArogyaMitra 🤖. I will help assess your health.";
  const aiTextElement = document.getElementById("aiText");
  const typingIndicator = document.querySelector(".typing-indicator");
  let i = 0;

  function typeEffect() {
    if (i < text.length) {
      aiTextElement.innerHTML += text.charAt(i);
      i++;
      setTimeout(typeEffect, 50);
    } else {
      // Hide typing indicator when done
      setTimeout(() => {
        typingIndicator.classList.add("hidden");
      }, 500);
    }
  }

  // Start typing after a short delay
  setTimeout(() => {
    typeEffect();
  }, 300);

  // Add input focus effects
  const inputs = document.querySelectorAll("input, textarea, select");
  inputs.forEach(input => {
    input.addEventListener("focus", function() {
      this.parentElement.style.transform = "scale(1.02)";
      this.parentElement.style.transition = "transform 0.3s ease";
    });

    input.addEventListener("blur", function() {
      this.parentElement.style.transform = "scale(1)";
    });
  });

  // Add keyboard navigation
  document.addEventListener("keydown", function(e) {
    if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") {
      e.preventDefault();
      const activeStep = document.querySelector(".step.active");
      const nextButton = activeStep.querySelector(".btn-next");
      const submitButton = activeStep.querySelector(".btn-submit");
      
      if (nextButton) {
        nextStep();
      } else if (submitButton && !submitButton.disabled) {
        form.submit();
      }
    }
  });

  // Add smooth scroll behavior
  document.documentElement.style.scrollBehavior = "smooth";
});