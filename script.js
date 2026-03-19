/**
 * Professional Resume/CV JavaScript
 * Author: Mohamed Abdelrahman
 * Version: 2.0
 */

// Initialize EmailJS


// Document ready function
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initResumeTabs();
    initThemeToggle();
    initCustomCaptcha();
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
 * Custom CAPTCHA System
 * Text-based CAPTCHA with alphanumeric characters on image
 */
const CustomCaptcha = {
    currentAnswer: null,
    timeout: 300000, // 5 minutes
    startTime: null,
    
    init() {
        this.generateChallenge();
        this.setupEventListeners();
        this.startTimer();
    },
    
    generateChallenge() {
        this.startTime = Date.now();
        this.generateTextChallenge();
        this.updateHint();
    },
    
    generateTextChallenge() {
        // Generate random alphanumeric string (5-6 characters)
        const length = Math.floor(Math.random() * 2) + 5; // 5 or 6 characters
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        this.currentAnswer = result;
        this.displayTextChallenge(result);
    },
    
    displayTextChallenge(text) {
        const display = document.getElementById('captchaDisplay');
        
        // Create canvas for text image
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas size
        canvas.width = 200;
        canvas.height = 80;
        
        // Create gradient background
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#f0f0f0');
        gradient.addColorStop(1, '#e0e0e0');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add noise lines
        ctx.strokeStyle = '#ccc';
        ctx.lineWidth = 1;
        for (let i = 0; i < 8; i++) {
            ctx.beginPath();
            ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
            ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
            ctx.stroke();
        }
        
        // Add noise dots
        ctx.fillStyle = '#ddd';
        for (let i = 0; i < 50; i++) {
            ctx.beginPath();
            ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 1, 0, 2 * Math.PI);
            ctx.fill();
        }
        
        // Draw text
        ctx.font = 'bold 32px Arial';
        ctx.fillStyle = '#333';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Add slight rotation and distortion to each character
        const charWidth = canvas.width / text.length;
        for (let i = 0; i < text.length; i++) {
            ctx.save();
            
            // Position and rotate each character slightly
            const x = charWidth * i + charWidth / 2;
            const y = canvas.height / 2;
            const rotation = (Math.random() - 0.5) * 0.3; // -0.15 to 0.15 radians
            
            ctx.translate(x, y);
            ctx.rotate(rotation);
            
            // Slight color variation
            const colorVariation = Math.floor(Math.random() * 50);
            ctx.fillStyle = `rgb(${51 + colorVariation}, ${51 + colorVariation}, ${51 + colorVariation})`;
            
            ctx.fillText(text[i], 0, 0);
            ctx.restore();
        }
        
        // Convert canvas to image
        const imageData = canvas.toDataURL();
        
        display.innerHTML = `
            <div class="text-captcha">
                <img src="${imageData}" alt="CAPTCHA" class="captcha-image">
                <div class="captcha-instruction">Enter the characters you see above</div>
            </div>
        `;
    },
    
    updateHint() {
        const hint = document.getElementById('captchaHint');
        if (!hint) return;
        
        hint.textContent = 'Enter the alphanumeric characters shown in the image above';
    },
    
    setupEventListeners() {
        const refreshBtn = document.getElementById('refreshCaptcha');
        const audioBtn = document.getElementById('audioCaptcha');
        const input = document.getElementById('captchaInput');
        
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.generateChallenge());
        }
        
        if (audioBtn) {
            audioBtn.addEventListener('click', () => this.playAudioChallenge());
        }
        
        if (input) {
            input.addEventListener('input', () => this.clearErrors());
        }
    },
    
    playAudioChallenge() {
        if (!('speechSynthesis' in window)) {
            showStatus('Audio not supported in this browser', 'error');
            return;
        }
        
        const utterance = new SpeechSynthesisUtterance();
        utterance.text = `The characters are: ${this.currentAnswer.split('').join(', ')}`;
        utterance.rate = 0.6;
        utterance.pitch = 1;
        speechSynthesis.speak(utterance);
    },
    
    clearErrors() {
        const errorEl = document.getElementById('captchaError');
        const timeoutEl = document.getElementById('captchaTimeout');
        
        if (errorEl) errorEl.style.display = 'none';
        if (timeoutEl) timeoutEl.style.display = 'none';
    },
    
    startTimer() {
        setTimeout(() => {
            this.showTimeoutError();
        }, this.timeout);
    },
    
    showTimeoutError() {
        const timeoutEl = document.getElementById('captchaTimeout');
        if (timeoutEl) {
            timeoutEl.style.display = 'block';
        }
        this.generateChallenge();
    },
    
    validateAnswer(userAnswer) {
        if (!userAnswer || !this.currentAnswer) return false;
        
        // Case-insensitive comparison for text CAPTCHA
        const normalizedUser = userAnswer.toString().trim();
        const normalizedAnswer = this.currentAnswer.trim();
        
        return normalizedUser.toLowerCase() === normalizedAnswer.toLowerCase();
    },
    
    isExpired() {
        return Date.now() - this.startTime > this.timeout;
    }
};

function initCustomCaptcha() {
    CustomCaptcha.init();
}

/**
 * Resume Tab Layout
 * Groups the existing resume sections into website tabs.
 */
function initResumeTabs() {
    const body = document.body;
    const mainContent = document.querySelector('.main-content');

    if (!body || !mainContent || body.classList.contains('resume-tabbed-layout')) {
        return;
    }

    const sections = {
        summary: document.getElementById('summary'),
        education: document.getElementById('education'),
        skills: document.getElementById('skills'),
        experience: document.getElementById('experience'),
        certifications: document.getElementById('certifications'),
        employers: document.getElementById('employers'),
        projects: document.getElementById('projects'),
        achievements: document.getElementById('achievements')
    };

    if (Object.values(sections).some(section => !section)) {
        return;
    }

    body.classList.add('resume-tabbed-layout');

    const tabDefinitions = [
        {
            id: 'profile',
            label: 'Profile',
            icon: 'fa-user',
            content: createSplitColumns(
                [sections.summary],
                [sections.skills]
            )
        },
        {
            id: 'experience',
            label: 'Experience',
            icon: 'fa-briefcase',
            className: 'resume-panel--experience',
            content: sections.experience
        },
        {
            id: 'education',
            label: 'Education',
            icon: 'fa-graduation-cap',
            className: 'resume-panel--education',
            content: sections.education
        },
        {
            id: 'certifications',
            label: 'Certifications',
            icon: 'fa-certificate',
            className: 'resume-panel--certifications',
            content: sections.certifications
        },
        {
            id: 'highlights',
            label: 'Highlights',
            icon: 'fa-star',
            className: 'resume-panel--highlights',
            content: createSplitColumns(
                [
                    sections.employers,
                    sections.projects
                ],
                [
                    sections.achievements
                ]
            )
        }
    ];

    const layout = document.createElement('div');
    layout.className = 'resume-tabs-shell container';

    const intro = document.createElement('div');
    intro.className = 'resume-tabs-intro';
    intro.innerHTML = `
        <p class="resume-tabs-kicker">Discover More</p>
        <h2 class="resume-tabs-title">Navigate My Professional Profile</h2>
        <p class="resume-tabs-text">I've structured my resume into focused sections so you can easily explore my background as an interactive portfolio.</p>
    `;

    const tabs = createResumeTabList(tabDefinitions);
    const panels = createResumePanelWrap(tabDefinitions);

    layout.append(intro, tabs, panels);
    mainContent.replaceChildren(layout);

    setupResumeTabs(layout, tabDefinitions);
}

function createSplitColumns(leftSections, rightSections) {
    const grid = document.createElement('div');
    grid.className = 'resume-panel-grid resume-panel-grid--split';

    const leftColumn = document.createElement('div');
    leftColumn.className = 'resume-panel-column';
    leftSections.forEach(section => {
        if (section) {
            leftColumn.appendChild(section);
        }
    });

    const rightColumn = document.createElement('div');
    rightColumn.className = 'resume-panel-column';
    rightSections.forEach(section => {
        if (section) {
            rightColumn.appendChild(section);
        }
    });

    grid.append(leftColumn, rightColumn);
    return grid;
}

function createResumeTabList(tabDefinitions) {
    const tabList = document.createElement('div');
    tabList.className = 'resume-tabs-nav';
    tabList.setAttribute('role', 'tablist');
    tabList.setAttribute('aria-label', 'Resume sections');

    tabDefinitions.forEach((tabDefinition, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'resume-tab';
        button.id = `tab-${tabDefinition.id}`;
        button.dataset.tab = tabDefinition.id;
        button.setAttribute('role', 'tab');
        button.setAttribute('aria-controls', `panel-${tabDefinition.id}`);
        button.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
        button.tabIndex = index === 0 ? 0 : -1;
        button.innerHTML = `<i class="fas ${tabDefinition.icon}"></i><span>${tabDefinition.label}</span>`;
        if (index === 0) {
            button.classList.add('is-active');
        }
        tabList.appendChild(button);
    });

    return tabList;
}

function createResumePanelWrap(tabDefinitions) {
    const panels = document.createElement('div');
    panels.className = 'resume-panels';

    tabDefinitions.forEach((tabDefinition, index) => {
        panels.appendChild(createResumePanel(tabDefinition, index === 0));
    });

    return panels;
}

function createResumePanel({ id, label, className = '', content }, isActive = false) {
    const panel = document.createElement('section');
    panel.className = `resume-panel ${className}`.trim();
    panel.id = `panel-${id}`;
    panel.dataset.tab = id;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', `tab-${id}`);
    panel.hidden = !isActive;

    const shell = document.createElement('div');
    shell.className = 'resume-panel-shell';

    const heading = document.createElement('div');
    heading.className = 'resume-panel-heading';
    heading.innerHTML = `
        <p class="resume-panel-label">${label}</p>
        <h3 class="resume-panel-title">${label}</h3>
    `;

    shell.appendChild(heading);

    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'resume-panel-content';
    if (content) {
        contentWrapper.appendChild(content);
    }

    shell.appendChild(contentWrapper);
    panel.appendChild(shell);

    if (isActive) {
        panel.classList.add('is-active');
    }

    return panel;
}

function setupResumeTabs(layout, tabDefinitions) {
    const tabs = Array.from(layout.querySelectorAll('.resume-tab'));
    const panels = Array.from(layout.querySelectorAll('.resume-panel'));
    const validTabIds = new Set(tabDefinitions.map(({ id }) => id));

    const activateTab = (tabId, updateHash = true) => {
        if (!validTabIds.has(tabId)) {
            return;
        }

        tabs.forEach(tab => {
            const isActive = tab.dataset.tab === tabId;
            tab.classList.toggle('is-active', isActive);
            tab.setAttribute('aria-selected', String(isActive));
            tab.tabIndex = isActive ? 0 : -1;
        });

        panels.forEach(panel => {
            const isActive = panel.dataset.tab === tabId;
            panel.hidden = !isActive;
            panel.classList.toggle('is-active', isActive);

            if (isActive) {
                panel.querySelectorAll('.section').forEach(section => {
                    section.classList.add('section-visible');
                });
            }
        });

        if (updateHash && window.location.hash !== `#${tabId}`) {
            history.replaceState(null, '', `#${tabId}`);
        }
    };

    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => activateTab(tab.dataset.tab));
        tab.addEventListener('keydown', event => {
            const currentIndex = tabs.indexOf(tab);
            let nextIndex = currentIndex;

            if (event.key === 'ArrowRight') {
                nextIndex = (currentIndex + 1) % tabs.length;
            } else if (event.key === 'ArrowLeft') {
                nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
            } else if (event.key === 'Home') {
                nextIndex = 0;
            } else if (event.key === 'End') {
                nextIndex = tabs.length - 1;
            } else {
                return;
            }

            event.preventDefault();
            tabs[nextIndex].focus();
            activateTab(tabs[nextIndex].dataset.tab);
        });

        if (index === 0) {
            tab.classList.add('is-active');
        }
    });

    const initialTabId = validTabIds.has(window.location.hash.slice(1))
        ? window.location.hash.slice(1)
        : tabDefinitions[0].id;

    activateTab(initialTabId, false);

    window.addEventListener('hashchange', () => {
        const requestedTabId = window.location.hash.slice(1);
        if (validTabIds.has(requestedTabId)) {
            activateTab(requestedTabId, false);
        }
    });
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
        const captcha = document.getElementById("captchaInput").value.trim();
        
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
        if (CustomCaptcha.isExpired()) {
            showStatus("CAPTCHA expired. Please refresh and try again.", "error");
            CustomCaptcha.generateChallenge();
            return;
        }
        
        if (!CustomCaptcha.validateAnswer(captcha)) {
            document.getElementById("captchaError").style.display = "block";
            highlightField("captchaInput");
            CustomCaptcha.generateChallenge();
            return;
        }
        
        // Clear all errors
        document.getElementById("captchaError").style.display = "none";
        document.getElementById("captchaTimeout").style.display = "none";
        
        // Disable form during submission
        const submitButton = contactForm.querySelector("button[type='submit']");
        const originalButtonText = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        
        // Send directly to n8n Webhook ONLY
        fetch("https://c1vps004.4topapps.com/webhook/CV-Website-Contactus", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: name,
                email: email,
                message: message,
                source: window.location.hostname || "mohamedabdelrahman",
                timestamp: new Date().toISOString()
            })
        })
        .then(response => {
            showStatus("Message sent successfully! I'll get back to you soon.", "success");
            contactForm.reset();
            CustomCaptcha.generateChallenge();
        })
        .catch(function(error) {
            console.error("Webhook error:", error);
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
            // Clear CAPTCHA errors on input
            if (this.id === 'captchaInput') {
                CustomCaptcha.clearErrors();
            }
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
    const modal = document.getElementById("downloadCvModal");
    const closeBtn = document.getElementById("closeCvModal");
    const downloadForm = document.getElementById("downloadCvForm");
    const statusMsg = document.getElementById("cvDownloadStatus");
    
    if (!downloadButton || !modal) return;

    downloadButton.addEventListener("click", function(e) {
        e.preventDefault();
        modal.classList.add("active");
        statusMsg.style.display = "none";
    });

    closeBtn.addEventListener("click", function() {
        modal.classList.remove("active");
    });

    window.addEventListener("click", function(e) {
        if (e.target == modal) {
            modal.classList.remove("active");
        }
    });

    downloadForm.addEventListener("submit", function(e) {
        e.preventDefault();
        const btn = document.getElementById("submitCvDownload");
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        btn.disabled = true;
        
        const name = document.getElementById("cvName").value.trim();
        const email = document.getElementById("cvEmail").value.trim();
        const phone = document.getElementById("cvPhone").value.trim();

        fetch("https://c1vps004.4topapps.com/webhook/downloadCV", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                fullname: name,
                email: email,
                phone: phone,
                source: window.location.hostname || "mohamedabdelrahman",
                timestamp: new Date().toISOString()
            })
        })
        .then(() => {
            statusMsg.innerText = "Success! Your download is starting...";
            statusMsg.style.color = "#2ed573";
            statusMsg.style.display = "block";
            
            const fileLink = document.createElement("a");
            fileLink.href = "MohamedAbdelrahman.pdf";
            fileLink.download = "MohamedAbdelrahman.pdf";
            fileLink.click();
            
            setTimeout(() => {
                modal.classList.remove("active");
                downloadForm.reset();
                btn.innerHTML = originalText;
                btn.disabled = false;
            }, 2000);
        })
        .catch(err => {
            console.error("Webhook error:", err);
            statusMsg.innerText = "Error connecting, but starting download...";
            statusMsg.style.color = "#ff6b6b";
            statusMsg.style.display = "block";
            
            const fileLink = document.createElement("a");
            fileLink.href = "MohamedAbdelrahman.pdf";
            fileLink.download = "MohamedAbdelrahman.pdf";
            fileLink.click();
            
            setTimeout(() => {
                modal.classList.remove("active");
                downloadForm.reset();
                btn.innerHTML = originalText;
                btn.disabled = false;
            }, 3000);
        });
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


// ===== NEW UI/UX EFFECTS =====
document.addEventListener('DOMContentLoaded', function() {
    initScrollProgress();
    initCustomCursor();
    initTypewriterEffect();
});

function initScrollProgress() {
    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        const progressBar = document.getElementById('scroll-progress');
        if(progressBar) {
            progressBar.style.width = scrolled + '%';
        }
    });
}

function initCustomCursor() {
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');
    
    if (!cursorDot || !cursorOutline) return;

    window.addEventListener('mousemove', function(e) {
        const posX = e.clientX;
        const posY = e.clientY;

        cursorDot.style.left = posX + 'px';
        cursorDot.style.top = posY + 'px';

        // Add a slight delay for outline
        cursorOutline.animate({
            left: posX + 'px',
            top: posY + 'px'
        }, { duration: 500, fill: 'forwards' });
    });
}

function initTypewriterEffect() {
    const titleElement = document.getElementById('typed-job-title');
    if (!titleElement) return;
    
    const titles = [
        'Technical Team Leader',
        'Sr. System Architect',
        'Sr. Multi-Cloud Engineer',
        'Sr. Platform Engineer',
        'CRM Administrator',
        'DevOps Engineer',
        'Sr. System Specialist'
    ];
    
    let titleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingDelay = 100;
    let erasingDelay = 50;
    let newWordDelay = 2000;
    
    titleElement.innerHTML = '<span class="typed-text"></span><span class="typed-cursor">|</span>';
    const textSpan = titleElement.querySelector('.typed-text');
    
    function type() {
        if(!textSpan) return;
        const currentTitle = titles[titleIndex];
        
        if (isDeleting) {
            textSpan.textContent = currentTitle.substring(0, charIndex - 1);
            charIndex--;
            typingDelay = erasingDelay;
        } else {
            textSpan.textContent = currentTitle.substring(0, charIndex + 1);
            charIndex++;
            typingDelay = 100;
        }
        
        if (!isDeleting && charIndex === currentTitle.length) {
            isDeleting = true;
            typingDelay = newWordDelay;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            titleIndex++;
            if (titleIndex >= titles.length) {
                titleIndex = 0;
            }
            typingDelay = 500;
        }
        
        setTimeout(type, typingDelay);
    }
    
    // Start typing effect
    setTimeout(type, 1000);
}



// ===== CHATBOT FUNCTIONALITY =====
function initChatbot() {
    const toggleBtn = document.getElementById('chatbot-toggle');
    const closeBtn = document.getElementById('chatbot-close');
    const chatWindow = document.getElementById('chatbot-window');
    const authForm = document.getElementById('chatbotAuthForm');
    const authSect = document.getElementById('chatbot-auth');
    const iframeSect = document.getElementById('chatbot-iframe-container');
    
    if(!toggleBtn || !chatWindow) return;

    // Toggle Chat window
    function toggleChat() {
        chatWindow.classList.toggle('active');
    }

    toggleBtn.addEventListener('click', toggleChat);
    closeBtn.addEventListener('click', () => chatWindow.classList.remove('active'));

    // Handle Auth Form Submission
    authForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('chatName').value.trim();
        const email = document.getElementById('chatEmail').value.trim();
        const phone = document.getElementById('chatPhone').value.trim();
        
        // Build webhook URL with parameters
        const baseUrl = "https://c1vps004.4topapps.com/webhook/6924c320-eeae-4b5e-9b05-4f8b4c58ed77/chat";
        const urlParams = new URLSearchParams({
            fullname: name,
            email: email,
            phone: phone
        });
        
        const finalUrl = `${baseUrl}?${urlParams.toString()}`;
        
        // Update UI: Hide our custom chatbot container completely
        document.getElementById('chatbot-container').style.display = 'none';
        
        // Inject N8N Native Chat Widget
        const link = document.createElement('link');
        link.href = 'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/style.css';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
        
        const script = document.createElement('script');
        script.type = 'module';
        script.innerHTML = `
            import { createChat } from 'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js';
            createChat({
                webhookUrl: '${finalUrl}',
                mode: 'window',
                initialMessages: [
                    'Hi! I have entered my details. My name is ${name}. My email is ${email}. My phone is ${phone}. I would like to start chatting!'
                ],
                metadata: {
                    fullname: '${name}',
                    email: '${email}',
                    phone: '${phone}'
                }
            });
            // Automatically click the N8N toggle to keep it seamless
            setTimeout(() => {
                const n8nToggle = document.querySelector('.chat-toggle-button, [aria-label="Open chat"]');
                if(n8nToggle) n8nToggle.click();
            }, 1000);
        `;
        document.body.appendChild(script);
    });
}

// Attach to DOMContentLoaded safely
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChatbot);
} else {
    initChatbot();
}

