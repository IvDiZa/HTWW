// ========== script.js ==========

// TYPEWRITER EFFECT FACTORY
function createTypewriter(elementId, phrases, speed = 150) {
    const element = document.getElementById(elementId);
    if (!element) return null;
    
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let currentPhrase = '';
    
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
            setTimeout(type, 2000);
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            setTimeout(type, 500);
        } else {
            setTimeout(type, isDeleting ? 100 : speed);
        }
    }
    
    type();
    return { phrases, element };
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
        img.src = images[currentIndex];
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => updateImage(currentIndex - 1));
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => updateImage(currentIndex + 1));
    }
    
    // set initial image
    if (images.length > 0) {
        img.src = images[0];
    }
    
    return { next: () => updateImage(currentIndex + 1), prev: () => updateImage(currentIndex - 1) };
}

// POPUP HANDLER
function setupPopups() {
    document.querySelectorAll('.info-card, .source-link, .folder').forEach(el => {
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            
            // Don't show popup for folders if they have navigation
            if (el.classList.contains('folder')) {
                const target = el.dataset.target;
                if (target) {
                    window.location.href = target + '.html';
                    return;
                }
            }
            
            const msg = el.getAttribute('data-popup');
            if (msg) {
                alert(msg);
            } else if (el.classList.contains('folder')) {
                alert('📂 Folder opened');
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

// RUN ON LOAD
document.addEventListener('DOMContentLoaded', () => {
    setActiveNav();
    setupPopups();
});
