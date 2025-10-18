/**
 * Professional Resume/CV JavaScript
 * Author: Mohamed Abdelrahman
 * Version: 2.0
 */

// Initialize EmailJS
emailjs.init("_Mczvev_oUorf4ERM");

// Document ready function
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initThemeToggle();
    initCaptcha();
    setupDownloadButton();
    setupFormValidation();
    enhanceUserExperience();
    initBackToTop();
    initSmoothScrolling();
});

/**
 * Theme Toggle Functionality
 * Allows switching between light and dark mode
 */
function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Check for saved theme preference or use the system preference
    const currentTheme = localStorage.getItem('theme') || 
                         (prefersDarkScheme.matches ? 'dark' : 'light');
    
    // Apply the current theme
    if (currentTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        if (themeToggle) {
            themeToggle.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
        }
    }
    
    // Add event listener to theme toggle button
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            // Toggle theme
            if (document.body.getAttribute('data-theme') === 'dark') {
                document.body.removeAttribute('data-theme');
                localStorage.setItem('theme', 'light');
                this.innerHTML = '<i class="fas fa-moon"></i> Dark Mode';
            } else {
                document.body.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
                this.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
            }
        });
    }
}

/**
 * CAPTCHA Functionality
 * Generates a simple math CAPTCHA to prevent spam
 */
let captchaAnswer;

function initCaptcha() {
    generateCaptcha();
    
    // Add event listener for CAPTCHA input to clear error on type
    const captchaInput = document.getElementById("captcha");
    if (captchaInput) {
        captchaInput.addEventListener('input', function() {
            document.getElementById("captchaError").style.display = "none";
        });
    }
}

function generateCaptcha() {
    const num1 = Math.floor(Math.random() * 10);
    const num2 = Math.floor(Math.random() * 10);
    captchaAnswer = num1 + num2;
    
    const captchaQuestion = document.getElementById("captchaQuestion");
    if (captchaQuestion) {
        captchaQuestion.innerHTML = `<i class="fas fa-shield-alt"></i> Security Check: What is ${num1} + ${num2}?`;
    }
}

/**
 * Contact Form Functionality
 * Handles form validation and submission
 */
function setupFormValidation() {
    const contactForm = document.getElementById("contactForm");
    if (!contactForm) return;
    
    contactForm.addEventListener("submit", function(e) {
        e.preventDefault();
        
        // Get form data
        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const message = document.getElementById("message").value.trim();
        const captcha = parseInt(document.getElementById("captcha").value, 10);
        
        // Form validation
        if (!name || !email || !message) {
            showStatus("Please fill in all fields", "error");
            highlightEmptyFields();
            return;
        }
        
        // Email validation
        if (!isValidEmail(email)) {
            showStatus("Please enter a valid email address", "error");
            highlightField("email");
            return;
        }
        
        // CAPTCHA validation
        if (isNaN(captcha) || captcha !== captchaAnswer) {
            document.getElementById("captchaError").style.display = "block";
            highlightField("captcha");
            generateCaptcha();
            return;
        }
        
        document.getElementById("captchaError").style.display = "none";
        
        // Disable form during submission
        const submitButton = contactForm.querySelector("button[type='submit']");
        const originalButtonText = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        
        // Send email using EmailJS
        emailjs.send("service_92gbfx2", "template_1qu0jow", {
            to_name: name,
            from_name: email,
            message: message
        })
        .then(function() {
            showStatus("Message sent successfully! I'll get back to you soon.", "success");
            contactForm.reset();
            generateCaptcha();
        })
        .catch(function(error) {
            console.error("EmailJS error:", error);
            showStatus("Failed to send message. Please try again later.", "error");
        })
        .finally(function() {
            // Re-enable button
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
        });
    });
    
    // Add input event listeners to clear validation styling
    const formInputs = contactForm.querySelectorAll('input, textarea');
    formInputs.forEach(input => {
        input.addEventListener('input', function() {
            this.classList.remove('input-error');
        });
    });
}

function highlightEmptyFields() {
    const contactForm = document.getElementById("contactForm");
    if (!contactForm) return;
    
    const formInputs = contactForm.querySelectorAll('input, textarea');
    formInputs.forEach(input => {
        if (input.value.trim() === '' && input.required) {
            highlightField(input.id);
        }
    });
}

function highlightField(fieldId) {
    const field = document.getElementById(fieldId);
    if (field) {
        field.classList.add('input-error');
        field.focus();
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showStatus(message, type) {
    const status = document.getElementById("status");
    if (!status) return;
    
    status.innerText = message;
    status.className = 'status-message';
    
    if (type === 'error') {
        status.style.backgroundColor = 'rgba(255, 107, 107, 0.2)';
        status.style.color = '#ff6b6b';
    } else if (type === 'success') {
        status.style.backgroundColor = 'rgba(46, 213, 115, 0.2)';
        status.style.color = '#2ed573';
    }
    
    status.style.display = 'block';
    
    // Auto-hide status after 5 seconds
    setTimeout(() => {
        status.style.opacity = '0';
        setTimeout(() => {
            status.style.display = 'none';
            status.style.opacity = '1';
        }, 500);
    }, 5000);
}

/**
 * Download Button Functionality
 * Handles CV download with visual feedback
 */
function setupDownloadButton() {
    const downloadButton = document.getElementById("download-btn");
    if (!downloadButton) return;
    
    // Check sessionStorage to disable the button if the file was already downloaded
    if (sessionStorage.getItem("fileDownloaded")) {
        downloadButton.innerHTML = '<i class="fas fa-check"></i> CV Downloaded';
        downloadButton.classList.add('downloaded');
        downloadButton.title = "You've already downloaded the CV";
        downloadButton.disabled = true;
    }
    
    downloadButton.addEventListener("click", function() {
        // Visual feedback before download
        const originalText = this.innerHTML;
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Downloading...';
        
        // Create download link
        const fileLink = document.createElement("a");
        fileLink.href = "MohamedAbdelrahman.pdf";
        fileLink.download = "MohamedAbdelrahman.pdf";
        
        // Start download
        fileLink.click();
        
        // Mark as downloaded in sessionStorage
        sessionStorage.setItem("fileDownloaded", "true");
        
        // Disable the button with delay for better UX
        setTimeout(() => {
            this.innerHTML = '<i class="fas fa-check"></i> CV Downloaded';
            this.classList.add('downloaded');
            this.title = "You've already downloaded the CV";
            this.disabled = true;
        }, 1000);
    });
}

/**
 * Back to Top Button Functionality
 * Shows/hides the back to top button based on scroll position
 */
function initBackToTop() {
    const backToTopButton = document.getElementById('back-to-top');
    if (!backToTopButton) return;
    
    // Show/hide button based on scroll position
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    });
    
    // Scroll to top when clicked
    backToTopButton.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

/**
 * Smooth Scrolling Functionality
 * Enables smooth scrolling for anchor links
 */
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                window.scrollTo({
                    top: targetElement.offsetTop - 100,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * User Experience Enhancements
 * Adds animations and interactive elements
 */
function enhanceUserExperience() {
    // Add animation classes to elements when they come into view
    const sections = document.querySelectorAll('.section');
    
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('section-visible');
                    
                    // Add staggered animations to child elements
                    const children = entry.target.querySelectorAll('.timeline-item, .skill-item, .certification-card, .employer-card, .achievement-card');
                    children.forEach((child, index) => {
                        setTimeout(() => {
                            child.classList.add('fade-in');
                        }, 100 * index);
                    });
                }
            });
        }, { threshold: 0.1 });
        
        sections.forEach(section => {
            observer.observe(section);
        });
    } else {
        // Fallback for browsers that don't support IntersectionObserver
        sections.forEach(section => {
            section.classList.add('section-visible');
        });
    }
    
    // Add hover effects to skill items
    const skillItems = document.querySelectorAll('.skill-item');
    skillItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Add tooltip functionality
    initTooltips();
}

/**
 * Tooltip Functionality
 * Adds custom tooltips to elements with data-tooltip attribute
 */
function initTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            const tooltipText = this.getAttribute('data-tooltip');
            
            // Create tooltip element
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = tooltipText;
            
            // Position the tooltip
            document.body.appendChild(tooltip);
            const rect = this.getBoundingClientRect();
            tooltip.style.top = `${rect.top - tooltip.offsetHeight - 10 + window.scrollY}px`;
            tooltip.style.left = `${rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2)}px`;
            
            // Show tooltip with animation
            setTimeout(() => {
                tooltip.style.opacity = '1';
                tooltip.style.transform = 'translateY(0)';
            }, 10);
            
            // Store tooltip reference
            this._tooltip = tooltip;
        });
        
        element.addEventListener('mouseleave', function() {
            if (this._tooltip) {
                const tooltip = this._tooltip;
                
                // Hide tooltip with animation
                tooltip.style.opacity = '0';
                tooltip.style.transform = 'translateY(10px)';
                
                // Remove tooltip after animation
                setTimeout(() => {
                    if (tooltip.parentNode) {
                        tooltip.parentNode.removeChild(tooltip);
                    }
                }, 300);
                
                this._tooltip = null;
            }
        });
    });
}