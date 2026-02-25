// ========== script.js ==========

// TYPEWRITER EFFECT FACTORY
function createTypewriter(elementId, phrases, speed = 80) {
    const element = document.getElementById(elementId);
    if (!element) return null;
    
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let currentPhrase = '';
    let timeoutId = null;
    
    function type() {
        const fullPhrase = phrases[phraseIndex];
        
        if (isDeleting) {
            currentPhrase = fullPhrase.substring(0, charIndex - 1);
            charIndex--;
        } else {
            currentPhrase = fullPhrase.substring(0, charIndex + 1);
            charIndex++;
        }
        
        element.textContent = currentPhrase;
        
        if (!isDeleting && charIndex === fullPhrase.length) {
            isDeleting = true;
            timeoutId = setTimeout(type, 2000);
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            timeoutId = setTimeout(type, 500);
        } else {
            timeoutId = setTimeout(type, isDeleting ? 50 : speed);
        }
    }
    
    type();
    
    // Cleanup function
    return {
        stop: () => {
            if (timeoutId) clearTimeout(timeoutId);
        },
        phrases,
        element
    };
}

// CAROUSEL FACTORY
function createCarousel(carouselId, images) {
    const container = document.getElementById(carouselId);
    if (!container) return null;
    
    const img = container.querySelector('.carousel-slide');
    const prevBtn = container.querySelector('[data-dir="prev"]');
    const nextBtn = container.querySelector('[data-dir="next"]');
    
    let currentIndex = 0;
    
    function updateImage(index) {
        currentIndex = (index + images.length) % images.length;
        
        // Add fade animation
        img.style.opacity = '0';
        setTimeout(() => {
            img.src = images[currentIndex];
            img.alt = `Slide ${currentIndex + 1}: ${images[currentIndex].substring(0, 50)}...`;
        }, 150);
        
        setTimeout(() => {
            img.style.opacity = '1';
        }, 200);
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            updateImage(currentIndex - 1);
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            updateImage(currentIndex + 1);
        });
    }
    
    // Keyboard navigation
    container.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            updateImage(currentIndex - 1);
        }
        if (e.key === 'ArrowRight') {
            e.preventDefault();
            updateImage(currentIndex + 1);
        }
    });
    
    // Touch swipe support
    let touchStartX = 0;
    let touchEndX = 0;
    
    container.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    container.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        if (touchEndX < touchStartX - 50) {
            updateImage(currentIndex + 1);
        } else if (touchEndX > touchStartX + 50) {
            updateImage(currentIndex - 1);
        }
    }, { passive: true });
    
    // Set initial image
    if (images.length > 0) {
        img.src = images[0];
        img.style.transition = 'opacity 0.3s ease';
        img.alt = 'Carousel slide 1';
    }
    
    // Make container focusable for keyboard
    container.setAttribute('tabindex', '0');
    
    return { 
        next: () => updateImage(currentIndex + 1), 
        prev: () => updateImage(currentIndex - 1),
        goTo: updateImage
    };
}

// MODAL POPUP HANDLER
function setupPopups() {
    // Create modal container if it doesn't exist
    if (!document.getElementById('modal-container')) {
        const modalHTML = `
            <div id="modal-container" style="display: none;">
                <div class="modal-overlay"></div>
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Microsoft Archive</h3>
                        <button class="modal-close" aria-label="Close">&times;</button>
                    </div>
                    <div class="modal-body"></div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Close modal functionality
        const modal = document.getElementById('modal-container');
        const closeBtn = modal.querySelector('.modal-close');
        const overlay = modal.querySelector('.modal-overlay');
        
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
        
        overlay.addEventListener('click', () => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
        
        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.style.display === 'flex') {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }
    
    // Add click handlers
    document.querySelectorAll('.info-card, .source-link, .folder').forEach(el => {
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            
            // Handle folder navigation
            if (el.classList.contains('folder')) {
                const target = el.dataset.target;
                if (target) {
                    // Add loading effect
                    document.body.style.opacity = '0.7';
                    document.body.style.transition = 'opacity 0.2s';
                    
                    setTimeout(() => {
                        window.location.href = target + '.html';
                    }, 200);
                    return;
                }
            }
            
            // Show modal popup
            const msg = el.getAttribute('data-popup');
            if (msg) {
                const modal = document.getElementById('modal-container');
                const modalBody = modal.querySelector('.modal-body');
                const modalHeader = modal.querySelector('.modal-header h3');
                
                // Determine icon and title based on element type
                let icon = 'ℹ️';
                let title = 'Information';
                
                if (el.classList.contains('info-card')) {
                    const h3 = el.querySelector('h3')?.textContent || '';
                    if (h3.includes('Facts')) {
                        icon = '📊';
                        title = 'Fact';
                    } else if (h3.includes('Link')) {
                        icon = '🔗';
                        title = 'External Link';
                        
                        // Handle links specially
                        if (msg.startsWith('http')) {
                            modalBody.innerHTML = `
                                <div style="text-align: center;">
                                    <div style="font-size: 1.2rem; margin-bottom: 1.5rem;">${icon} You are about to visit:</div>
                                    <div style="background: #f5f5f5; padding: 1rem; border-radius: 8px; word-break: break-all; margin-bottom: 1.5rem; font-family: monospace;">${msg}</div>
                                    <div style="display: flex; gap: 1rem; justify-content: center;">
                                        <a href="${msg}" target="_blank" class="source-link" style="text-decoration: none; background: #0078d4; color: white; padding: 0.8rem 2rem;">Continue to Link</a>
                                        <button class="modal-close-btn" style="background: #f0f0f0; border: none; padding: 0.8rem 2rem; border-radius: 6px; cursor: pointer;">Cancel</button>
                                    </div>
                                </div>
                            `;
                            
                            const cancelBtn = modalBody.querySelector('.modal-close-btn');
                            cancelBtn.addEventListener('click', () => {
                                modal.style.display = 'none';
                            });
                            
                            modalHeader.textContent = title;
                            modal.style.display = 'flex';
                            document.body.style.overflow = 'hidden';
                            return;
                        }
                    } else {
                        icon = 'ℹ️';
                        title = 'Information';
                    }
                } else if (el.classList.contains('source-link')) {
                    icon = '📚';
                    title = 'Source Reference';
                }
                
                modalBody.innerHTML = `<div style="display: flex; align-items: center; gap: 1rem; font-size: 1.2rem;"><span style="font-size: 2rem;">${icon}</span> <span>${msg}</span></div>`;
                modalHeader.textContent = title;
                modal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            }
        });
    });
}

// INITIALIZE ACTIVE NAV LINK
function setActiveNav() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.navbar a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });
}

// PAGE TRANSITIONS
function addPageTransitions() {
    document.querySelectorAll('a').forEach(link => {
        // Only apply to internal links
        if (link.hostname === window.location.hostname || !link.hostname) {
            link.addEventListener('click', (e) => {
                // Don't apply to modal buttons or links with target="_blank"
                if (link.target === '_blank' || link.classList.contains('no-transition')) {
                    return;
                }
                
                const href = link.getAttribute('href');
                if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
                    e.preventDefault();
                    
                    // Add fade-out animation
                    document.body.style.opacity = '0';
                    document.body.style.transition = 'opacity 0.3s ease';
                    
                    setTimeout(() => {
                        window.location.href = href;
                    }, 300);
                }
            });
        }
    });
}

// SMOOTH SCROLL FOR ANCHOR LINKS
function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// INTERSECTION OBSERVER FOR ANIMATIONS
function setupIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.float-box, .info-card, .folder').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
}

// RUN ON LOAD
document.addEventListener('DOMContentLoaded', () => {
    setActiveNav();
    setupPopups();
    setupSmoothScroll();
    
    // Optional: Uncomment for page transitions
    // addPageTransitions();
    
    // Setup intersection observer for scroll animations
    setupIntersectionObserver();
    
    // Entrance animation
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 50);
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    document.body.style.transition = 'none';
});
