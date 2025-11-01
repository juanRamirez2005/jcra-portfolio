// ===== Interfaces y Tipos =====
interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface SkillElement extends HTMLElement {
  dataset: {
    progress?: string;
  };
}

interface ScrollPosition {
  y: number;
  direction: 'up' | 'down';
}

// ===== Clases Principales =====
class PortfolioApp {
  private lastScrollY: number = 0;
  private scrollDirection: 'up' | 'down' = 'down';
  private isScrolling: boolean = false;
  private observer: IntersectionObserver | null = null;

  constructor() {
    this.init();
  }

  private init(): void {
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
  private setupEventListeners(): void {
    // Scroll events
    window.addEventListener('scroll', this.throttle(this.handleScroll.bind(this), 16));
    
    // Resize events
    window.addEventListener('resize', this.debounce(this.handleResize.bind(this), 250));
    
    // Load event
    window.addEventListener('load', this.handleLoad.bind(this));
    
    // Navigation events
    document.addEventListener('click', this.handleNavigation.bind(this));
    
    // Keyboard navigation
    document.addEventListener('keydown', this.handleKeyboard.bind(this));
  }

  // ===== Scroll Handling =====
  private handleScroll(): void {
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

  private scrollTimeout: number = 0;

  private updateHeaderVisibility(scrollY: number): void {
    const header = document.querySelector('.header') as HTMLElement;
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

  private updateActiveNavLink(): void {
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
  private handleNavigation(event: Event): void {
    const target = event.target as HTMLElement;
    
    // Handle nav links
    if (target.classList.contains('nav__link')) {
      event.preventDefault();
      const href = target.getAttribute('href');
      if (href && href.startsWith('#')) {
        this.scrollToSection(href.slice(1));
        this.closeMobileMenu();
      }
    }

    // Handle smooth scroll buttons
    if (target.closest('.btn')) {
      const btn = target.closest('.btn') as HTMLAnchorElement;
      const href = btn.getAttribute('href');
      if (href && href.startsWith('#')) {
        event.preventDefault();
        this.scrollToSection(href.slice(1));
      }
    }
  }

  private scrollToSection(sectionId: string): void {
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
  private initializeMobileMenu(): void {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');

    if (navToggle && navMenu) {
      navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('show');
        navToggle.classList.toggle('active');
        
        // Update ARIA attributes
        const isOpen = navMenu.classList.contains('show');
        navToggle.setAttribute('aria-expanded', isOpen.toString());
      });
    }
  }

  private closeMobileMenu(): void {
    const navMenu = document.getElementById('nav-menu');
    const navToggle = document.getElementById('nav-toggle');
    
    if (navMenu && navToggle) {
      navMenu.classList.remove('show');
      navToggle.classList.remove('active');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  }

  // ===== Skill Bars Animation =====
  private initializeSkillBars(): void {
    const skillBars = document.querySelectorAll('.skill__progress') as NodeListOf<SkillElement>;
    
    skillBars.forEach((bar) => {
      const progress = bar.dataset.progress;
      if (progress) {
        bar.style.width = '0%';
      }
    });
  }

  private animateSkillBars(): void {
    const skillBars = document.querySelectorAll('.skill__progress') as NodeListOf<SkillElement>;
    
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
  private setupIntersectionObserver(): void {
    const options: IntersectionObserverInit = {
      root: null,
      rootMargin: '-10% 0px -10% 0px',
      threshold: 0.1
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          
          // Trigger skill bars animation for skills section
          if (entry.target.id === 'habilidades') {
            this.animateSkillBars();
          }
        }
      });
    }, options);

    // Observe all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach((section) => {
      this.observer?.observe(section);
    });
  }

  // ===== Form Handling =====
  private setupFormHandling(): void {
    const form = document.getElementById('contact-form') as HTMLFormElement;
    if (!form) return;

    form.addEventListener('submit', this.handleFormSubmit.bind(this));
    
    // Setup form validation
    const inputs = form.querySelectorAll('.form__input');
    inputs.forEach((input) => {
      input.addEventListener('blur', this.validateField.bind(this));
      input.addEventListener('input', this.clearFieldError.bind(this));
    });
  }

  private async handleFormSubmit(event: Event): Promise<void> {
    event.preventDefault();
    
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const data: ContactFormData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      subject: formData.get('subject') as string,
      message: formData.get('message') as string
    };

    if (!this.validateForm(data)) {
      this.showNotification('Por favor, completa todos los campos correctamente.', 'error');
      return;
    }

    const submitButton = form.querySelector('button[type="submit"]') as HTMLButtonElement;
    const originalText = submitButton.innerHTML;
    
    try {
      submitButton.disabled = true;
      submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
      
      // Simulate form submission (replace with actual endpoint)
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

  private validateForm(data: ContactFormData): boolean {
    const { name, email, subject, message } = data;
    
    if (!name.trim() || name.length < 2) return false;
    if (!this.isValidEmail(email)) return false;
    if (!subject.trim() || subject.length < 3) return false;
    if (!message.trim() || message.length < 10) return false;
    
    return true;
  }

  private validateField(event: Event): void {
    const input = event.target as HTMLInputElement;
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

  private clearFieldError(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.showFieldError(input, '');
  }

  private showFieldError(input: HTMLInputElement, message: string): void {
    const group = input.closest('.form__group');
    if (!group) return;

    let errorElement = group.querySelector('.form__error') as HTMLElement;
    
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

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private async simulateFormSubmission(data: ContactFormData): Promise<void> {
    // Simulate API call delay
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Form data:', data);
        resolve();
      }, 2000);
    });
  }

  // ===== Notifications =====
  private showNotification(message: string, type: 'success' | 'error'): void {
    // Remove existing notifications
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

    // Auto remove after 5 seconds
    setTimeout(() => {
      notification.classList.add('notification--fade-out');
      setTimeout(() => notification.remove(), 300);
    }, 5000);

    // Close button functionality
    const closeBtn = notification.querySelector('.notification__close');
    closeBtn?.addEventListener('click', () => {
      notification.classList.add('notification--fade-out');
      setTimeout(() => notification.remove(), 300);
    });

    // Trigger entrance animation
    requestAnimationFrame(() => {
      notification.classList.add('notification--show');
    });
  }

  // ===== Smooth Scrolling =====
  private setupSmoothScrolling(): void {
    // Enhanced smooth scrolling for better performance
    if ('scrollBehavior' in document.documentElement.style) {
      return; // Native smooth scrolling is supported
    }

    // Polyfill for smooth scrolling
    const smoothScrollLinks = document.querySelectorAll('a[href^="#"]');
    smoothScrollLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const href = (link as HTMLAnchorElement).getAttribute('href');
        if (href && href !== '#') {
          this.scrollToSection(href.slice(1));
        }
      });
    });
  }

  // ===== Keyboard Navigation =====
  private handleKeyboard(event: KeyboardEvent): void {
    // Close mobile menu with Escape key
    if (event.key === 'Escape') {
      this.closeMobileMenu();
    }

    // Navigation with arrow keys (when focus is on nav)
    if (event.target && (event.target as HTMLElement).classList.contains('nav__link')) {
      const navLinks = Array.from(document.querySelectorAll('.nav__link'));
      const currentIndex = navLinks.indexOf(event.target as HTMLElement);

      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault();
        const nextIndex = (currentIndex + 1) % navLinks.length;
        (navLinks[nextIndex] as HTMLElement).focus();
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault();
        const prevIndex = currentIndex === 0 ? navLinks.length - 1 : currentIndex - 1;
        (navLinks[prevIndex] as HTMLElement).focus();
      }
    }
  }

  // ===== Performance Optimization =====
  private optimizePerformance(): void {
    // Lazy load images
    this.setupLazyLoading();
    
    // Preload critical resources
    this.preloadCriticalResources();
    
    // Setup performance monitoring
    this.setupPerformanceMonitoring();
  }

  private setupLazyLoading(): void {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            img.src = img.dataset.src || img.src;
            img.classList.remove('lazy');
            imageObserver.unobserve(img);
          }
        });
      });

      images.forEach((img) => imageObserver.observe(img));
    }
  }

  private preloadCriticalResources(): void {
    // Preload hero image
    const heroImg = document.querySelector('.hero__img') as HTMLImageElement;
    if (heroImg && heroImg.src) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = heroImg.src;
      document.head.appendChild(link);
    }
  }

  private setupPerformanceMonitoring(): void {
    // Monitor Core Web Vitals
    if ('performance' in window && 'PerformanceObserver' in window) {
      // Largest Contentful Paint
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log('LCP:', lastEntry.startTime);
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay
      new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          console.log('FID:', entry.processingStart - entry.startTime);
        });
      }).observe({ entryTypes: ['first-input'], buffered: true });

      // Cumulative Layout Shift
      new PerformanceObserver((list) => {
        let clsValue = 0;
        list.getEntries().forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        console.log('CLS:', clsValue);
      }).observe({ entryTypes: ['layout-shift'], buffered: true });
    }
  }

  // ===== Animation Utilities =====
  private initializeAnimations(): void {
    // Add CSS animations dynamically
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

  // ===== Resize Handling =====
  private handleResize(): void {
    // Close mobile menu on resize to desktop
    if (window.innerWidth > 768) {
      this.closeMobileMenu();
    }
    
    // Recalculate positions if needed
    this.updateActiveNavLink();
  }

  // ===== Load Handling =====
  private handleLoad(): void {
    // Trigger initial animations
    document.body.classList.add('loaded');
    
    // Update navigation state
    this.updateActiveNavLink();
    
    // Start performance monitoring
    console.log('Portfolio loaded successfully');
  }

  // ===== Utility Functions =====
  private throttle<T extends (...args: any[]) => void>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return function (this: any, ...args: Parameters<T>) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  private debounce<T extends (...args: any[]) => void>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: number | null = null;
    return function (this: any, ...args: Parameters<T>) {
      const later = () => {
        timeout = null;
        func.apply(this, args);
      };
      if (timeout !== null) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(later, wait) as unknown as number;
    };
  }
}

// ===== SEO and Analytics =====
class SEOManager {
  constructor() {
    this.initializeSEO();
  }

  private initializeSEO(): void {
    this.setupStructuredData();
    this.setupOpenGraph();
    this.monitorPagePerformance();
  }

  private setupStructuredData(): void {
    // Add additional structured data for better SEO
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

  private setupOpenGraph(): void {
    // Update Open Graph tags dynamically based on current section
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

  private updateMetaTags(sectionId: string): void {
    const descriptions: Record<string, string> = {
      'inicio': 'Juan Camilo Ramírez Arias - Desarrollador de Software especializado en HTML5, JavaScript, Java y SQL Server',
      'sobre-mi': 'Conoce más sobre Juan Camilo Ramírez, estudiante de Ingeniería en Software y desarrollador en Optiplant Consultores',
      'habilidades': 'Habilidades técnicas de Juan Camilo: HTML5, CSS3, JavaScript, Java, SQL Server y más tecnologías web',
      'experiencia': 'Experiencia profesional de Juan Camilo Ramírez en desarrollo de software y consultoría tecnológica',
      'contacto': 'Contacta a Juan Camilo Ramírez Arias para proyectos de desarrollo de software y consultoría web'
    };

    const description = descriptions[sectionId] || descriptions['inicio'];
    
    // Update meta description
    let metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement;
    if (metaDesc) {
      metaDesc.content = description;
    }

    // Update Open Graph description
    let ogDesc = document.querySelector('meta[property="og:description"]') as HTMLMetaElement;
    if (ogDesc) {
      ogDesc.content = description;
    }
  }

  private monitorPagePerformance(): void {
    // Monitor and report page performance for SEO
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
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

// ===== Export for potential module usage =====
declare global {
  interface Window {
    PortfolioApp: typeof PortfolioApp;
  }
}

window.PortfolioApp = PortfolioApp;