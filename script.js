// Ensure page respects anchor on load
window.addEventListener('load', function() {
    setTimeout(function() {
        if (window.location.hash) {
            const target = document.querySelector(window.location.hash);
            if (target) {
                smoothScrollTo(target);
            }
        } else {
            window.scrollTo(0, 0);
        }
    }, 50);
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const targetSelector = this.getAttribute('href');
        if (!targetSelector || targetSelector === '#') return;
        const target = document.querySelector(targetSelector);
        if (target) {
            e.preventDefault();
            smoothScrollTo(target);
        }
    });
});

function smoothScrollTo(target) {
    const headerOffset = 80;
    const elementPosition = target.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementPosition - headerOffset;

    window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
    });
}

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Add the animation class when visible
            if (entry.target.classList.contains('fade-in')) {
                entry.target.style.animationPlayState = 'running';
            }
            if (entry.target.classList.contains('fade-in-up')) {
                entry.target.style.animationPlayState = 'running';
            }
            if (entry.target.classList.contains('fade-in-scale')) {
                entry.target.style.animationPlayState = 'running';
            }
        }
    });
}, observerOptions);

// Observe all sections and elements that should fade in
document.querySelectorAll('.section, .trust-bar, .visual-section, .social-proof, .contact-section').forEach(section => {
    section.classList.add('fade-in');
    section.style.animationPlayState = 'paused';
    observer.observe(section);
});

// Observe individual cards and elements
document.querySelectorAll('.leistung-card, .testimonial-card, .garantie-card, .trust-badge, .faq-item').forEach(element => {
    if (!element.classList.contains('fade-in')) {
        element.classList.add('fade-in-up');
        element.style.animationPlayState = 'paused';
        observer.observe(element);
    }
});
document.querySelectorAll('a[href^="tel:"]').forEach(link => {
    link.addEventListener('click', function() {
        console.log('Phone call initiated:', this.href);
    });
});

// WhatsApp link click tracking
document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
    link.addEventListener('click', function() {
        console.log('WhatsApp contact initiated');
    });
});

// Mobile menu toggle (if needed in future)
// const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
// const navLinks = document.querySelector('.nav-links');

// if (mobileMenuToggle) {
//     mobileMenuToggle.addEventListener('click', () => {
//         navLinks.classList.toggle('active');
//     });
// }

// Form validation and submission
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    const formMessage = document.getElementById('formMessage');
    const cookieBanner = document.getElementById('cookieBanner');
    const legalModal = document.getElementById('legalModal');
    const legalModalClose = document.getElementById('legalModalClose');
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navLinks = document.querySelector('.nav-links');

    initCookieBanner(cookieBanner);
    initLegalModal(legalModal, legalModalClose);
    initMobileMenu(mobileToggle, navLinks);

    if (contactForm) {
        const formName = contactForm.getAttribute('name') || 'kontakt';
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            resetMessage();

            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData);

            if (!data.name || !data.phone || !data.service || !data.address) {
                showMessage('Bitte füllen Sie alle erforderlichen Felder aus.', 'error');
                return;
            }

            if (data.email && !isValidEmail(data.email)) {
                showMessage('Bitte geben Sie eine gültige E-Mail-Adresse ein.', 'error');
                return;
            }

            if (!isValidPhone(data.phone)) {
                showMessage('Bitte geben Sie eine gültige Telefonnummer ein.', 'error');
                return;
            }

            fetch('/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: encodeFormData({ 'form-name': formName, ...data })
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Netzwerkfehler');
                    }
                    showMessage('Vielen Dank! Ihre Anfrage wurde erfolgreich übermittelt. Wir melden uns innerhalb von 24 Stunden bei Ihnen.', 'success');
                    contactForm.reset();
                })
                .catch(() => {
                    showMessage('Ups, etwas ist schief gelaufen. Bitte versuchen Sie es erneut.', 'error');
                });
        });
    }

    function resetMessage() {
        if (!formMessage) return;
        formMessage.className = 'form-message';
        formMessage.textContent = '';
        formMessage.style.display = 'none';
    }

    function showMessage(message, type) {
        if (!formMessage) return;
        formMessage.textContent = message;
        formMessage.classList.add(type);
        formMessage.style.display = 'block';

        // Auto-hide success messages after 5 seconds
        if (type === 'success') {
            setTimeout(() => {
                formMessage.style.display = 'none';
            }, 5000);
        }
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function isValidPhone(phone) {
        // Basic phone validation (German format)
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]{7,}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    }

    // Add input validation on blur
    if (contactForm) {
        const inputs = contactForm.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });

            input.addEventListener('input', function() {
                if (this.classList.contains('invalid')) {
                    validateField(this);
                }
            });
        });
    }

    function validateField(field) {
        const value = field.value.trim();
        let isValid = true;

        // Remove previous validation classes
        field.classList.remove('invalid', 'valid');

        // Required field validation
        if (field.hasAttribute('required') && !value) {
            isValid = false;
        }

        // Email validation
        if (field.type === 'email' && value && !isValidEmail(value)) {
            isValid = false;
        }

        // Phone validation
        if (field.name === 'phone' && value && !isValidPhone(value)) {
            isValid = false;
        }

        // Add validation class
        field.classList.add(isValid ? 'valid' : 'invalid');
    }

    function encodeFormData(data) {
        return Object.keys(data)
            .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key] ?? ''))
            .join('&');
    }
});

// Cookie consent
function initCookieBanner(banner) {
    if (!banner) return;
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
        banner.style.display = 'block';
    }
}

function handleCookieChoice(choice) {
    localStorage.setItem('cookieConsent', choice);
    const banner = document.getElementById('cookieBanner');
    if (banner) {
        banner.style.display = 'none';
    }
    console.log('Cookie choice:', choice);
}

// Legal modal handling
let currentLegalModal;

function initLegalModal(modal, closeBtn) {
    currentLegalModal = modal;
    if (!modal || !closeBtn) return;

    closeBtn.addEventListener('click', closeLegalModal);
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeLegalModal();
        }
    });
}

function openLegalModal(type) {
    if (!currentLegalModal) return;
    const modalTitle = document.getElementById('legalModalTitle');
    const modalBody = document.getElementById('legalModalBody');
    const content = getLegalContent(type);

    modalTitle.textContent = content.title;
    modalBody.innerHTML = content.body;
    currentLegalModal.classList.add('show');
}

function closeLegalModal() {
    if (currentLegalModal) {
        currentLegalModal.classList.remove('show');
    }
}

function getLegalContent(type) {
    const contents = {
        datenschutz: {
            title: 'Datenschutzerklärung',
            body: '<p>Wir verarbeiten personenbezogene Daten ausschließlich zur Bearbeitung Ihrer Anfrage. Alle Informationen werden vertraulich behandelt und nicht an Dritte weitergegeben.</p>' +
                  '<p>Sie haben jederzeit das Recht auf Auskunft, Berichtigung oder Löschung Ihrer Daten. Kontaktieren Sie uns hierfür unter datenschutz@raumklar24.de.</p>'
        },
        agb: {
            title: 'AGB & Widerruf',
            body: '<p>Unsere Angebote sind 14 Tage gültig. Die Abrechnung erfolgt zum Festpreis nach Besichtigung. Sie können Ihren Auftrag innerhalb von 14 Tagen ohne Angabe von Gründen widerrufen.</p>' +
                  '<p>Alle Leistungen erfolgen gemäß den geltenden gesetzlichen Bestimmungen.</p>'
        },
        haftung: {
            title: 'Haftungsausschluss',
            body: '<p>Trotz sorgfältiger Prüfung übernehmen wir keine Haftung für externe Links. Für Inhalte verlinkter Seiten sind ausschließlich deren Betreiber verantwortlich.</p>'
        },
        cookies: {
            title: 'Cookie-Richtlinie',
            body: '<p>Wir setzen notwendige Cookies ein, um die Funktionalität der Website sicherzustellen. Optionale Cookies helfen uns, unser Angebot zu verbessern.</p>' +
                  '<p>Ihre Zustimmung können Sie jederzeit in den Browser-Einstellungen widerrufen.</p>'
        }
    };

    return contents[type] || contents.datenschutz;
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('RAUMKLAR website loaded successfully');
});

// Mobile navigation
function initMobileMenu(toggleButton, menu) {
    if (!toggleButton || !menu) return;

    const closeMenu = () => {
        menu.classList.remove('active');
        toggleButton.classList.remove('active');
        toggleButton.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('menu-open');
    };

    toggleButton.addEventListener('click', () => {
        const isOpen = !menu.classList.contains('active');
        menu.classList.toggle('active', isOpen);
        toggleButton.classList.toggle('active', isOpen);
        toggleButton.setAttribute('aria-expanded', String(isOpen));
        document.body.classList.toggle('menu-open', isOpen);
    });

    menu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            if (menu.classList.contains('active')) {
                closeMenu();
            }
        });
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 1024) {
            closeMenu();
        }
    });
}

// Prevent right-click on images (optional security)
document.addEventListener('contextmenu', function(e) {
    if (e.target.tagName === 'IMG') {
        e.preventDefault();
    }
}, false);

// FAQ Accordion Toggle Function
function toggleFaq(element) {
    const faqItem = element.parentElement;
    const isActive = faqItem.classList.contains('active');
    
    // Close all FAQ items
    document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Open clicked item if it wasn't already open
    if (!isActive) {
        faqItem.classList.add('active');
    }
}
