// ===== Portfolio App - Versión JavaScript compilada =====
class PortfolioApp {
    constructor() {
        this.lastScrollY = 0;
        this.scrollDirection = 'down';
        this.isScrolling = false;
        this.observer = null;
        this.scrollTimeout = 0;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeAnimations();
        this.setupIntersectionObserver();
        this.initializeSkillBars();
        this.setupSmoothScrolling();
        this.initializeMobileMenu();
        this.setupFormHandling();
        this.optimizePerformance();
    }

    // ===== Event Listeners =====
    setupEventListeners() {
        window.addEventListener('scroll', this.throttle(this.handleScroll.bind(this), 16));
        window.addEventListener('resize', this.debounce(this.handleResize.bind(this), 250));
        window.addEventListener('load', this.handleLoad.bind(this));
        document.addEventListener('click', this.handleNavigation.bind(this));
        document.addEventListener('keydown', this.handleKeyboard.bind(this));
    }

    // ===== Scroll Handling =====
    handleScroll() {
        const currentScrollY = window.scrollY;
        this.scrollDirection = currentScrollY > this.lastScrollY ? 'down' : 'up';
        
        this.updateHeaderVisibility(currentScrollY);
        this.updateActiveNavLink();
        
        this.lastScrollY = currentScrollY;
        this.isScrolling = true;
        
        clearTimeout(this.scrollTimeout);
        this.scrollTimeout = setTimeout(() => {
            this.isScrolling = false;
        }, 150);
    }

    updateHeaderVisibility(scrollY) {
        const header = document.querySelector('.header');
        if (!header) return;

        if (scrollY > 100) {
            header.classList.add('header--scrolled');
            if (this.scrollDirection === 'up') {
                header.style.transform = 'translateY(0)';
            } else {
                header.style.transform = 'translateY(-100%)';
            }
        } else {
            header.classList.remove('header--scrolled');
            header.style.transform = 'translateY(0)';
        }
    }

    updateActiveNavLink() {
        const sections = document.querySelectorAll('.section');
        const navLinks = document.querySelectorAll('.nav__link');
        
        let currentSection = '';
        
        sections.forEach((section) => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= 100 && rect.bottom >= 100) {
                currentSection = section.id;
            }
        });

        navLinks.forEach((link) => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    }

    // ===== Navigation =====
    handleNavigation(event) {
        const target = event.target;
        
        if (target.classList.contains('nav__link')) {
            event.preventDefault();
            const href = target.getAttribute('href');
            if (href && href.startsWith('#')) {
                this.scrollToSection(href.slice(1));
                this.closeMobileMenu();
            }
        }

        if (target.closest('.btn')) {
            const btn = target.closest('.btn');
            const href = btn.getAttribute('href');
            if (href && href.startsWith('#')) {
                event.preventDefault();
                this.scrollToSection(href.slice(1));
            }
        }
    }

    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (!section) return;

        const headerHeight = 70;
        const targetPosition = section.offsetTop - headerHeight;

        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }

    // ===== Mobile Menu =====
    initializeMobileMenu() {
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');

        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('show');
                navToggle.classList.toggle('active');
                
                const isOpen = navMenu.classList.contains('show');
                navToggle.setAttribute('aria-expanded', isOpen.toString());
            });
        }
    }

    closeMobileMenu() {
        const navMenu = document.getElementById('nav-menu');
        const navToggle = document.getElementById('nav-toggle');
        
        if (navMenu && navToggle) {
            navMenu.classList.remove('show');
            navToggle.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
        }
    }

    // ===== Skill Bars Animation =====
    initializeSkillBars() {
        const skillBars = document.querySelectorAll('.skill__progress');
        
        skillBars.forEach((bar) => {
            const progress = bar.dataset.progress;
            if (progress) {
                bar.style.width = '0%';
            }
        });
    }

    animateSkillBars() {
        const skillBars = document.querySelectorAll('.skill__progress');
        
        skillBars.forEach((bar, index) => {
            const progress = bar.dataset.progress;
            if (progress) {
                setTimeout(() => {
                    bar.style.width = `${progress}%`;
                }, index * 200);
            }
        });
    }

    // ===== Intersection Observer =====
    setupIntersectionObserver() {
        const options = {
            root: null,
            rootMargin: '-10% 0px -10% 0px',
            threshold: 0.1
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    
                    if (entry.target.id === 'habilidades') {
                        this.animateSkillBars();
                    }
                }
            });
        }, options);

        const sections = document.querySelectorAll('.section');
        sections.forEach((section) => {
            this.observer.observe(section);
        });
    }

    // ===== Form Handling =====
    setupFormHandling() {
        const form = document.getElementById('contact-form');
        if (!form) return;

        form.addEventListener('submit', this.handleFormSubmit.bind(this));
        
        const inputs = form.querySelectorAll('.form__input');
        inputs.forEach((input) => {
            input.addEventListener('blur', this.validateField.bind(this));
            input.addEventListener('input', this.clearFieldError.bind(this));
        });
    }

    async handleFormSubmit(event) {
        event.preventDefault();
        
        const form = event.target;
        const formData = new FormData(form);
        
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            subject: formData.get('subject'),
            message: formData.get('message')
        };

        if (!this.validateForm(data)) {
            this.showNotification('Por favor, completa todos los campos correctamente.', 'error');
            return;
        }

        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        
        try {
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
            
            await this.simulateFormSubmission(data);
            
            this.showNotification('¡Mensaje enviado correctamente! Te contactaré pronto.', 'success');
            form.reset();
            
        } catch (error) {
            console.error('Error sending form:', error);
            this.showNotification('Error al enviar el mensaje. Por favor, intenta nuevamente.', 'error');
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = originalText;
        }
    }

    validateForm(data) {
        const { name, email, subject, message } = data;
        
        if (!name.trim() || name.length < 2) return false;
        if (!this.isValidEmail(email)) return false;
        if (!subject.trim() || subject.length < 3) return false;
        if (!message.trim() || message.length < 10) return false;
        
        return true;
    }

    validateField(event) {
        const input = event.target;
        const value = input.value.trim();
        
        let isValid = true;
        let errorMessage = '';

        switch (input.type) {
            case 'text':
                if (input.name === 'name') {
                    isValid = value.length >= 2;
                    errorMessage = 'El nombre debe tener al menos 2 caracteres.';
                } else if (input.name === 'subject') {
                    isValid = value.length >= 3;
                    errorMessage = 'El asunto debe tener al menos 3 caracteres.';
                }
                break;
            case 'email':
                isValid = this.isValidEmail(value);
                errorMessage = 'Por favor, ingresa un email válido.';
                break;
        }

        if (input.tagName === 'TEXTAREA') {
            isValid = value.length >= 10;
            errorMessage = 'El mensaje debe tener al menos 10 caracteres.';
        }

        this.showFieldError(input, isValid ? '' : errorMessage);
    }

    clearFieldError(event) {
        const input = event.target;
        this.showFieldError(input, '');
    }

    showFieldError(input, message) {
        const group = input.closest('.form__group');
        if (!group) return;

        let errorElement = group.querySelector('.form__error');
        
        if (message) {
            if (!errorElement) {
                errorElement = document.createElement('span');
                errorElement.className = 'form__error';
                group.appendChild(errorElement);
            }
            errorElement.textContent = message;
            input.classList.add('form__input--error');
        } else {
            if (errorElement) {
                errorElement.remove();
            }
            input.classList.remove('form__input--error');
        }
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    async simulateFormSubmission(data) {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Form data:', data);
                resolve();
            }, 2000);
        });
    }

    // ===== Notifications =====
    showNotification(message, type) {
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(n => n.remove());

        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        notification.innerHTML = `
            <div class="notification__content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
                <span>${message}</span>
                <button class="notification__close" aria-label="Cerrar notificación">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('notification--fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 5000);

        const closeBtn = notification.querySelector('.notification__close');
        closeBtn?.addEventListener('click', () => {
            notification.classList.add('notification--fade-out');
            setTimeout(() => notification.remove(), 300);
        });

        requestAnimationFrame(() => {
            notification.classList.add('notification--show');
        });
    }

    // ===== Smooth Scrolling =====
    setupSmoothScrolling() {
        if ('scrollBehavior' in document.documentElement.style) {
            return;
        }

        const smoothScrollLinks = document.querySelectorAll('a[href^="#"]');
        smoothScrollLinks.forEach((link) => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const href = link.getAttribute('href');
                if (href && href !== '#') {
                    this.scrollToSection(href.slice(1));
                }
            });
        });
    }

    // ===== Keyboard Navigation =====
    handleKeyboard(event) {
        if (event.key === 'Escape') {
            this.closeMobileMenu();
        }

        if (event.target && event.target.classList.contains('nav__link')) {
            const navLinks = Array.from(document.querySelectorAll('.nav__link'));
            const currentIndex = navLinks.indexOf(event.target);

            if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
                event.preventDefault();
                const nextIndex = (currentIndex + 1) % navLinks.length;
                navLinks[nextIndex].focus();
            } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
                event.preventDefault();
                const prevIndex = currentIndex === 0 ? navLinks.length - 1 : currentIndex - 1;
                navLinks[prevIndex].focus();
            }
        }
    }

    // ===== Performance Optimization =====
    optimizePerformance() {
        this.setupLazyLoading();
        this.preloadCriticalResources();
        this.setupPerformanceMonitoring();
    }

    setupLazyLoading() {
        const images = document.querySelectorAll('img[loading="lazy"]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src || img.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });

            images.forEach((img) => imageObserver.observe(img));
        }
    }

    preloadCriticalResources() {
        const heroImg = document.querySelector('.hero__img');
        if (heroImg && heroImg.src) {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = heroImg.src;
            document.head.appendChild(link);
        }
    }

    setupPerformanceMonitoring() {
        if ('performance' in window && 'PerformanceObserver' in window) {
            try {
                new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    console.log('LCP:', lastEntry.startTime);
                }).observe({ entryTypes: ['largest-contentful-paint'] });

                new PerformanceObserver((list) => {
                    list.getEntries().forEach((entry) => {
                        console.log('FID:', entry.processingStart - entry.startTime);
                    });
                }).observe({ entryTypes: ['first-input'], buffered: true });

                new PerformanceObserver((list) => {
                    let clsValue = 0;
                    list.getEntries().forEach((entry) => {
                        if (!entry.hadRecentInput) {
                            clsValue += entry.value;
                        }
                    });
                    console.log('CLS:', clsValue);
                }).observe({ entryTypes: ['layout-shift'], buffered: true });
            } catch (error) {
                console.log('Performance monitoring not fully supported');
            }
        }
    }

    // ===== Animation Utilities =====
    initializeAnimations() {
        const style = document.createElement('style');
        style.textContent = `
            .animate-in {
                animation: fadeInUp 0.6s ease forwards;
            }
            
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                border-radius: 8px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.15);
                z-index: 10000;
                transform: translateX(100%);
                transition: transform 0.3s ease;
            }
            
            .notification--show {
                transform: translateX(0);
            }
            
            .notification--fade-out {
                transform: translateX(100%);
            }
            
            .notification__content {
                padding: 16px 20px;
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .notification--success {
                border-left: 4px solid #10b981;
            }
            
            .notification--success i {
                color: #10b981;
            }
            
            .notification--error {
                border-left: 4px solid #ef4444;
            }
            
            .notification--error i {
                color: #ef4444;
            }
            
            .notification__close {
                background: none;
                border: none;
                cursor: pointer;
                padding: 4px;
                margin-left: auto;
                border-radius: 4px;
                transition: background-color 0.2s;
            }
            
            .notification__close:hover {
                background: rgba(0,0,0,0.1);
            }
            
            .form__error {
                color: #ef4444;
                font-size: 0.875rem;
                margin-top: 4px;
                display: block;
            }
            
            .form__input--error {
                border-color: #ef4444 !important;
            }
            
            .header--scrolled {
                background: rgba(255, 255, 255, 0.98);
                backdrop-filter: blur(20px);
                box-shadow: 0 2px 20px rgba(0,0,0,0.1);
            }
        `;
        document.head.appendChild(style);
    }

    handleResize() {
        if (window.innerWidth > 768) {
            this.closeMobileMenu();
        }
        this.updateActiveNavLink();
    }

    handleLoad() {
        document.body.classList.add('loaded');
        this.updateActiveNavLink();
        console.log('Portfolio loaded successfully');
    }

    // ===== Utility Functions =====
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => (inThrottle = false), limit);
            }
        };
    }

    debounce(func, wait) {
        let timeout = null;
        return function(...args) {
            const later = () => {
                timeout = null;
                func.apply(this, args);
            };
            if (timeout !== null) {
                clearTimeout(timeout);
            }
            timeout = setTimeout(later, wait);
        };
    }
}

// ===== SEO Manager =====
class SEOManager {
    constructor() {
        this.initializeSEO();
    }

    initializeSEO() {
        this.setupStructuredData();
        this.setupOpenGraph();
        this.monitorPagePerformance();
    }

    setupStructuredData() {
        const additionalSchema = {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Juan Camilo Ramírez Arias - Portfolio",
            "url": "https://juancamiloramirez.dev",
            "description": "Portfolio profesional de Juan Camilo Ramírez Arias, desarrollador de software especializado en HTML5, JavaScript, Java y SQL Server",
            "author": {
                "@type": "Person",
                "name": "Juan Camilo Ramírez Arias"
            },
            "potentialAction": {
                "@type": "SearchAction",
                "target": "https://juancamiloramirez.dev/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
            }
        };

        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(additionalSchema);
        document.head.appendChild(script);
    }

    setupOpenGraph() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    this.updateMetaTags(entry.target.id);
                }
            });
        }, { threshold: 0.5 });

        document.querySelectorAll('.section').forEach((section) => {
            observer.observe(section);
        });
    }

    updateMetaTags(sectionId) {
        const descriptions = {
            'inicio': 'Juan Camilo Ramírez Arias - Desarrollador de Software especializado en HTML5, JavaScript, Java y SQL Server',
            'sobre-mi': 'Conoce más sobre Juan Camilo Ramírez, estudiante de Ingeniería en Software y desarrollador en Optiplant Consultores',
            'habilidades': 'Habilidades técnicas de Juan Camilo: HTML5, CSS3, JavaScript, Java, SQL Server y más tecnologías web',
            'experiencia': 'Experiencia profesional de Juan Camilo Ramírez en desarrollo de software y consultoría tecnológica',
            'contacto': 'Contacta a Juan Camilo Ramírez Arias para proyectos de desarrollo de software y consultoría web'
        };

        const description = descriptions[sectionId] || descriptions['inicio'];
        
        let metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.content = description;
        }

        let ogDesc = document.querySelector('meta[property="og:description"]');
        if (ogDesc) {
            ogDesc.content = description;
        }
    }

    monitorPagePerformance() {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = performance.getEntriesByType('navigation')[0];
                
                console.log('Page Performance:', {
                    loadTime: perfData.loadEventEnd - perfData.loadEventStart,
                    domReady: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
                    firstByte: perfData.responseStart - perfData.requestStart
                });
            }, 0);
        });
    }
}

// ===== Initialization =====
document.addEventListener('DOMContentLoaded', () => {
    new PortfolioApp();
    new SEOManager();
});

window.PortfolioApp = PortfolioApp;