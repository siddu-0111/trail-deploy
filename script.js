/**
 * Kukkala Sai Siddhardha - Liquid Glass Portfolio Scripts
 * High-performance vanilla motion design, 3D tilts, magnetic elements, and custom cursors.
 */

document.addEventListener('DOMContentLoaded', () => {
    initPreloader();
    initCustomCursor();
    initParticlesBackground();
    initBlobParallax();
    initTypingEffect();
    initScrollEffects();
    initTiltCards();
    initMagneticElements();
    initContactForm();
    initMobileMenu();
});

/* ==========================================================================
   1. Preloader Handler
   ========================================================================== */
function initPreloader() {
    const preloader = document.getElementById('preloader');
    if (!preloader) return;

    const fadeOut = () => {
        preloader.classList.add('fade-out');
        document.body.style.overflowY = 'auto';
    };

    // Check if the document is already fully loaded
    if (document.readyState === 'complete') {
        setTimeout(fadeOut, 800);
    } else {
        window.addEventListener('load', () => {
            setTimeout(fadeOut, 800);
        });
    }

    // Safety fallback: ensure loader fades out after a maximum of 2.5s
    setTimeout(fadeOut, 2500);
}

/* ==========================================================================
   2. Custom Trailing Cursor with Click Ripples
   ========================================================================== */
function initCustomCursor() {
    const dot = document.getElementById('customCursorDot');
    const circle = document.getElementById('customCursorCircle');
    
    if (!dot || !circle) return;

    let mouseX = 0;
    let mouseY = 0;
    let circleX = 0;
    let circleY = 0;
    
    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Instant inner dot placement
        dot.style.left = `${mouseX}px`;
        dot.style.top = `${mouseY}px`;
    });

    // Outer circle trailing LERP animation
    function updateCursor() {
        const lerpFactor = 0.12; // Smooth tracking delay
        circleX += (mouseX - circleX) * lerpFactor;
        circleY += (mouseY - circleY) * lerpFactor;
        
        circle.style.left = `${circleX}px`;
        circle.style.top = `${circleY}px`;
        
        requestAnimationFrame(updateCursor);
    }
    updateCursor();

    // Click Ripple Generator
    window.addEventListener('click', (e) => {
        const ripple = document.createElement('div');
        ripple.className = 'cursor-click-ripple';
        ripple.style.left = `${e.clientX}px`;
        ripple.style.top = `${e.clientY}px`;
        document.body.appendChild(ripple);
        
        // Remove after animation completes
        ripple.addEventListener('animationend', () => {
            ripple.remove();
        });
    });

    // Hover states for interactive items
    const hoverTargets = document.querySelectorAll('a, button, .tilt-card, .skill-capsule, .social-circle-btn, .form-input');
    
    hoverTargets.forEach(target => {
        target.addEventListener('mouseenter', () => {
            dot.classList.add('custom-cursor-hover-dot');
            circle.classList.add('custom-cursor-hover-circle');
        });
        
        target.addEventListener('mouseleave', () => {
            dot.classList.remove('custom-cursor-hover-dot');
            circle.classList.remove('custom-cursor-hover-circle');
        });
    });

    // Mouse boundaries visibility
    document.addEventListener('mouseleave', () => {
        dot.style.opacity = '0';
        circle.style.opacity = '0';
    });
    
    document.addEventListener('mouseenter', () => {
        dot.style.opacity = '1';
        circle.style.opacity = '1';
    });
}

/* ==========================================================================
   3. Canvas Particles Background (Soft Glow)
   ========================================================================== */
function initParticlesBackground() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particlesArray = [];
    let mouse = { x: null, y: null, radius: 150 };

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initParticles();
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    class Particle {
        constructor(x, y, dx, dy, size, color) {
            this.x = x;
            this.y = y;
            this.dx = dx;
            this.dy = dy;
            this.size = size;
            this.color = color;
            this.baseAlpha = Math.random() * 0.4 + 0.2;
            this.alpha = this.baseAlpha;
            this.twinkleSpeed = Math.random() * 0.04 + 0.01;
            this.angle = Math.random() * Math.PI * 2;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
            ctx.fillStyle = this.color;
            ctx.globalAlpha = Math.max(0.05, Math.min(this.alpha, 0.9));
            ctx.fill();
            ctx.globalAlpha = 1.0;
        }

        update() {
            // Screen edge check
            if (this.x > canvas.width || this.x < 0) this.dx = -this.dx;
            if (this.y > canvas.height || this.y < 0) this.dy = -this.dy;

            // Twinkle effect (fluctuating opacity)
            this.angle += this.twinkleSpeed;
            let currentAlpha = this.baseAlpha + Math.sin(this.angle) * 0.25;

            // Interactive cursor repulsion force
            if (mouse.x !== null && mouse.y !== null) {
                let diffX = mouse.x - this.x;
                let diffY = mouse.y - this.y;
                let distance = Math.sqrt(diffX * diffX + diffY * diffY);
                
                if (distance < mouse.radius) {
                    let forceDirectionX = diffX / distance;
                    let forceDirectionY = diffY / distance;
                    let strength = (mouse.radius - distance) / mouse.radius;
                    
                    this.dx -= forceDirectionX * strength * 0.15;
                    this.dy -= forceDirectionY * strength * 0.15;
                    currentAlpha = Math.min(currentAlpha + strength * 0.4, 0.95);
                }
            }

            this.alpha = currentAlpha;

            // Cap speeds (stars drift majestically)
            const speedLimit = 0.4;
            const currentSpeed = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
            if (currentSpeed > speedLimit) {
                this.dx = (this.dx / currentSpeed) * speedLimit;
                this.dy = (this.dy / currentSpeed) * speedLimit;
            }

            this.x += this.dx;
            this.y += this.dy;
            this.draw();
        }
    }

    function initParticles() {
        particlesArray = [];
        const count = Math.min(Math.floor((canvas.width * canvas.height) / 10000), 120);
        const colors = [
            'rgba(255, 255, 255, 0.9)', 
            'rgba(168, 85, 247, 0.7)', 
            'rgba(6, 182, 212, 0.7)',
            'rgba(99, 102, 241, 0.7)',
            'rgba(255, 255, 255, 0.4)'
        ];

        for (let i = 0; i < count; i++) {
            let size = Math.random() * 2.2 + 0.6;
            let x = Math.random() * (canvas.width - size * 2) + size;
            let y = Math.random() * (canvas.height - size * 2) + size;
            let dx = (Math.random() * 0.1) - 0.05;
            let dy = (Math.random() * 0.1) - 0.05;
            let color = colors[Math.floor(Math.random() * colors.length)];

            particlesArray.push(new Particle(x, y, dx, dy, size, color));
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
        }
        requestAnimationFrame(animate);
    }

    initParticles();
    animate();
}

/* ==========================================================================
   4. Background Blob Parallax & Parallax Scrolling
   ========================================================================== */
function initBlobParallax() {
    const blob1 = document.getElementById('aurora1');
    const blob2 = document.getElementById('aurora2');
    const blob3 = document.getElementById('aurora3');
    
    if (!blob1 || !blob2) return;

    window.addEventListener('mousemove', (e) => {
        // Calculate shifts relative to center coordinates
        const xShift = (e.clientX - window.innerWidth / 2) / 35;
        const yShift = (e.clientY - window.innerHeight / 2) / 35;

        // Apply visual offsets
        blob1.style.transform = `translate(${xShift}px, ${yShift}px)`;
        blob2.style.transform = `translate(${-xShift}px, ${-yShift}px)`;
        if (blob3) {
            blob3.style.transform = `translate(${xShift * 0.5}px, ${-yShift * 0.5}px)`;
        }
    });
}

/* ==========================================================================
   5. Animated Typing Effect
   ========================================================================== */
function initTypingEffect() {
    const textTarget = document.getElementById('typingText');
    if (!textTarget) return;

    const words = [
        "Software Engineer",
        "DSA Enthusiast",
        "Problem Solver",
        "C++ Programmer"
    ];

    let wordIdx = 0;
    let charIdx = 0;
    let isDeleting = false;
    let delay = 100;

    function handleTyping() {
        const word = words[wordIdx];
        
        if (isDeleting) {
            textTarget.textContent = word.substring(0, charIdx - 1);
            charIdx--;
            delay = 45; // Deletes faster
        } else {
            textTarget.textContent = word.substring(0, charIdx + 1);
            charIdx++;
            delay = 90; // Normal writing speeds
        }

        // Typing finished state
        if (!isDeleting && charIdx === word.length) {
            isDeleting = true;
            delay = 2000; // Visual pause at end of word
        }
        // Deleting finished state
        else if (isDeleting && charIdx === 0) {
            isDeleting = false;
            wordIdx = (wordIdx + 1) % words.length;
            delay = 500; // Rest before next word
        }

        setTimeout(handleTyping, delay);
    }

    handleTyping();
}

/* ==========================================================================
   6. Scroll Progress, Sticky Navigation, Highlights & Intersection Observers
   ========================================================================== */
function initScrollEffects() {
    const header = document.getElementById('mainHeader');
    const progressBar = document.getElementById('scrollProgressBar');
    const backToTop = document.getElementById('backToTop');

    window.addEventListener('scroll', () => {
        const offsetTop = window.scrollY || document.documentElement.scrollTop;
        const totalHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        
        // Sticky Header sizing updates
        if (offsetTop > 60) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Scroll Progress Bar Update
        if (progressBar) {
            const pct = (offsetTop / totalHeight) * 100;
            progressBar.style.width = `${pct}%`;
        }

        // Back to top floating button visibility
        if (backToTop) {
            if (offsetTop > 500) {
                backToTop.classList.add('active');
            } else {
                backToTop.classList.remove('active');
            }
        }

        updateActiveSectionNav();
    });

    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Scroll Reveal Intersection Observers with support check & low threshold
    const revealElements = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target); // Reveal once
                }
            });
        }, { threshold: 0.02, rootMargin: '0px 0px -20px 0px' });

        revealElements.forEach(el => revealObserver.observe(el));
    } else {
        // Fallback for older browsers
        revealElements.forEach(el => el.classList.add('active'));
    }

    // Stats Counters Animation Observers
    const statElements = document.querySelectorAll('.stat-num');
    const statObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                triggerStatCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    statElements.forEach(el => statObserver.observe(el));
}

// Active Nav link updates on scroll coordinates matching
function updateActiveSectionNav() {
    const sections = document.querySelectorAll('section');
    const links = document.querySelectorAll('.nav-link');
    let currentId = '';
    const scrollTriggerY = window.scrollY + 180; // Offset including shrinking header height

    sections.forEach(sec => {
        const top = sec.offsetTop;
        const h = sec.clientHeight;
        if (scrollTriggerY >= top && scrollTriggerY < top + h) {
            currentId = sec.getAttribute('id');
        }
    });

    if (currentId) {
        links.forEach(l => {
            l.classList.remove('active');
            if (l.getAttribute('href') === `#${currentId}`) {
                l.classList.add('active');
            }
        });
    }
}

// Stats increment counter (supports decimals like 8.57 and large integers)
function triggerStatCounter(element) {
    const targetString = element.getAttribute('data-target');
    const isDecimal = targetString.includes('.');
    const target = parseFloat(targetString);
    const duration = 2200; // Increment timeframe
    const startTime = performance.now();

    function updateValue(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing curve (easeOutExpo)
        const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const currentVal = easeProgress * target;

        if (isDecimal) {
            element.textContent = currentVal.toFixed(2);
        } else {
            element.textContent = Math.floor(currentVal).toLocaleString();
        }

        if (progress < 1) {
            requestAnimationFrame(updateValue);
        } else {
            // Ensure exact target is printed
            element.textContent = isDecimal ? target.toFixed(2) : Math.floor(target).toLocaleString();
        }
    }

    requestAnimationFrame(updateValue);
}

/* ==========================================================================
   7. 3D Tilt Card Interaction with Dynamic Reflections
   ========================================================================== */
function initTiltCards() {
    const cards = document.querySelectorAll('.tilt-card');
    
    // Ignore on mobile touch displays for better standard experience
    if (window.matchMedia('(hover: none)').matches) return;

    cards.forEach(card => {
        const shine = card.querySelector('.card-glass-shine');

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            
            // Mouse coordinates relative to card
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            // Offset relative to center coordinates
            const xOffset = mouseX - rect.width / 2;
            const yOffset = mouseY - rect.height / 2;

            // Rotate angles based on offsets (Max 10 degrees)
            const rotX = -(yOffset / (rect.height / 2)) * 10;
            const rotY = (xOffset / (rect.width / 2)) * 10;

            card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.02, 1.02, 1.02)`;
            card.style.zIndex = '5';

            // Dynamic border and mouse glow coordinate updates
            card.style.setProperty('--mouse-x', `${mouseX}px`);
            card.style.setProperty('--mouse-y', `${mouseY}px`);

            // Shift inner glass-shine gradients dynamically
            if (shine) {
                const shineX = (mouseX / rect.width) * 100;
                const shineY = (mouseY / rect.height) * 100;
                shine.style.background = `radial-gradient(circle at ${shineX}% ${shineY}%, rgba(255, 255, 255, 0.12) 0%, transparent 60%)`;
            }
        });

        card.addEventListener('mouseleave', () => {
            // Smoothly ease back properties
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
            card.style.zIndex = '1';

            if (shine) {
                shine.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0) 50%)';
            }
        });
    });
}

/* ==========================================================================
   8. Magnetic Pull Interaction (Apple / Nothing OS style)
   ========================================================================== */
function initMagneticElements() {
    const magneticItems = document.querySelectorAll('.magnetic-element');

    if (window.matchMedia('(hover: none)').matches) return;

    magneticItems.forEach(item => {
        item.addEventListener('mousemove', (e) => {
            const rect = item.getBoundingClientRect();
            
            // Item center coordinates
            const itemCenterX = rect.left + rect.width / 2;
            const itemCenterY = rect.top + rect.height / 2;

            // Distance of mouse from center coordinates
            const xDist = e.clientX - itemCenterX;
            const yDist = e.clientY - itemCenterY;

            // Pull factor translations (Max translation offset 15px)
            const pullFactor = 0.35; 
            const translateTargetX = xDist * pullFactor;
            const translateTargetY = yDist * pullFactor;

            // Apply translation offset to follow mouse slightly
            item.style.transform = `translate(${translateTargetX}px, ${translateTargetY}px)`;
            item.style.transition = 'none'; // Instant tracking while mouse moves
        });

        item.addEventListener('mouseleave', () => {
            // Restore translations back to zero coordinate points
            item.style.transform = 'translate(0px, 0px)';
            item.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
        });
    });
}

/* ==========================================================================
   9. Mobile Hamburger Navigation
   ========================================================================== */
function initMobileMenu() {
    const btn = document.getElementById('hamburgerBtn');
    const wrapper = document.getElementById('navLinksWrapper');
    const links = document.querySelectorAll('.nav-link');

    if (!btn || !wrapper) return;

    btn.addEventListener('click', () => {
        btn.classList.toggle('active');
        wrapper.classList.toggle('active');

        if (wrapper.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    });

    // Close menu when navigation anchors click
    links.forEach(l => {
        l.addEventListener('click', () => {
            btn.classList.remove('active');
            wrapper.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    });
}

/* ==========================================================================
   10. Contact Form validation & Liquid Toast Generator
   ========================================================================== */
function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('formName').value.trim();
        const email = document.getElementById('formEmail').value.trim();
        const message = document.getElementById('formMessage').value.trim();

        if (!name || !email || !message) {
            triggerToast("Fill out all form fields.", "error");
            return;
        }

        if (!validateEmail(email)) {
            triggerToast("Provide a valid email address.", "error");
            return;
        }

        // Animate button processing state
        const submitBtn = form.querySelector('.btn-submit');
        const defaultBtnHTML = submitBtn.innerHTML;

        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>Processing...</span><div class="morph-blob" style="width:16px; height:16px; margin:0; border-radius:50%; filter:none; opacity:1; position:relative; display:inline-block;"></div>`;

        // Simulate API network latency
        setTimeout(() => {
            triggerToast(`Thank you, ${name}! Your details have been sent.`, "success");
            form.reset();
            submitBtn.disabled = false;
            submitBtn.innerHTML = defaultBtnHTML;
        }, 1600);
    });
}

function validateEmail(email) {
    const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return regex.test(String(email).toLowerCase());
}

function triggerToast(message, type = "success") {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type === 'success' ? 'toast-success' : 'toast-error'}`;

    // SVGs representing success or warning indicators
    const checkIcon = `<svg class="toast-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
    const alertIcon = `<svg class="toast-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;

    toast.innerHTML = `
        ${type === 'success' ? checkIcon : alertIcon}
        <span class="toast-msg">${message}</span>
    `;

    container.appendChild(toast);

    // Slide-in transitions trigger
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);

    // Destruct toast alert after 4.5 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 500);
    }, 4500);
}
