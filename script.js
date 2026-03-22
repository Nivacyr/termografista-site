/* ============================================
   TERMOGRAFISTA V4 — INTERACTIONS & ANIMATIONS
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    // ============ SPLINE WATERMARK REMOVAL (Shadow DOM Bypass) ============
    const removeSplineLogo = () => {
        const viewer = document.querySelector('spline-viewer');
        if (!viewer) return;

        const removeLogo = (root) => {
            if (!root) return;
            const logo = root.querySelector('#logo');
            if (logo) {
                logo.remove();
                console.log('[Termografista] Spline watermark removed');
            }
        };

        // Attempt immediate removal if shadowRoot already exists
        if (viewer.shadowRoot) {
            removeLogo(viewer.shadowRoot);

            // Observe shadowRoot for dynamic additions (Spline adds logo after render)
            const shadowObserver = new MutationObserver((mutations) => {
                for (const mutation of mutations) {
                    for (const node of mutation.addedNodes) {
                        if (node.id === 'logo' || (node.querySelector && node.querySelector('#logo'))) {
                            removeLogo(viewer.shadowRoot);
                        }
                    }
                }
            });

            shadowObserver.observe(viewer.shadowRoot, {
                childList: true,
                subtree: true
            });
        }

        // Watch for shadowRoot to be attached (it may not exist yet on load)
        const viewerObserver = new MutationObserver(() => {
            if (viewer.shadowRoot) {
                removeLogo(viewer.shadowRoot);

                // Once shadowRoot is detected, observe within it
                const innerObserver = new MutationObserver((mutations) => {
                    for (const mutation of mutations) {
                        for (const node of mutation.addedNodes) {
                            if (node.id === 'logo' || (node.querySelector && node.querySelector('#logo'))) {
                                removeLogo(viewer.shadowRoot);
                            }
                        }
                    }
                });

                innerObserver.observe(viewer.shadowRoot, {
                    childList: true,
                    subtree: true
                });

                viewerObserver.disconnect();
            }
        });

        viewerObserver.observe(viewer, {
            childList: true,
            subtree: true,
            attributes: true
        });

        // Fallback: retry periodically for 10 seconds
        let attempts = 0;
        const maxAttempts = 20;
        const retryInterval = setInterval(() => {
            attempts++;
            if (viewer.shadowRoot) {
                removeLogo(viewer.shadowRoot);
            }
            if (attempts >= maxAttempts) {
                clearInterval(retryInterval);
            }
        }, 500);
    };

    removeSplineLogo();
    // ============ NAVBAR SCROLL EFFECT ============
    const navbar = document.getElementById('navbar');
    let lastScrollY = 0;

    const handleNavbarScroll = () => {
        const scrollY = window.scrollY;

        if (scrollY > 60) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        lastScrollY = scrollY;
    };

    window.addEventListener('scroll', handleNavbarScroll, { passive: true });

    // ============ MOBILE MENU TOGGLE ============
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        // Close menu on link click
        navLinks.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }

    // ============ SMOOTH SCROLL ============
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const targetId = anchor.getAttribute('href');
            if (targetId === '#') return;

            e.preventDefault();
            const target = document.querySelector(targetId);

            if (target) {
                const navbarHeight = navbar.offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.scrollY - navbarHeight - 20;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ============ SCROLL ANIMATIONS (IntersectionObserver) ============
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -60px 0px',
        threshold: 0.1
    };

    const animateOnScroll = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');

                // Stagger children animation
                const children = entry.target.querySelectorAll('.stagger-child');
                children.forEach((child, index) => {
                    child.style.transitionDelay = `${index * 0.08}s`;
                    child.classList.add('visible');
                });

                observer.unobserve(entry.target);
            }
        });
    };

    const scrollObserver = new IntersectionObserver(animateOnScroll, observerOptions);

    // Apply observer to sections and cards
    const animatableElements = document.querySelectorAll(
        '.section-header, .duvida-card, .pilar-card, .tool-card, .caso-card, ' +
        '.knowledge-card, .comece-wrapper, .noticia-card, .treinamento-wrapper, ' +
        '.app-card, .community-card, .footer-top'
    );

    animatableElements.forEach(el => {
        el.classList.add('animate-on-scroll');
        scrollObserver.observe(el);
    });

    // ============ ACTIVE NAV LINK ON SCROLL ============
    const sections = document.querySelectorAll('section[id]');
    const navLinksList = document.querySelectorAll('.nav-link');

    const highlightNav = () => {
        const scrollPos = window.scrollY + 200;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                navLinksList.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    };

    window.addEventListener('scroll', highlightNav, { passive: true });

    // ============ HIDE SCROLL INDICATOR ON SCROLL ============
    const scrollIndicator = document.querySelector('.hero-scroll-indicator');
    if (scrollIndicator) {
        const hideIndicator = () => {
            if (window.scrollY > 100) {
                scrollIndicator.style.opacity = '0';
                scrollIndicator.style.transition = 'opacity 0.5s ease';
            } else {
                scrollIndicator.style.opacity = '1';
            }
        };
        window.addEventListener('scroll', hideIndicator, { passive: true });
    }

    // ============ CARD TILT EFFECT (Desktop only) ============
    if (window.matchMedia('(min-width: 768px)').matches) {
        const cards = document.querySelectorAll('.pilar-card, .tool-card');

        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const rotateX = (y - centerY) / 25;
                const rotateY = (centerX - x) / 25;

                card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg) translateY(0px)';
                card.style.transition = 'transform 0.5s ease';
            });

            card.addEventListener('mouseenter', () => {
                card.style.transition = 'transform 0.1s ease';
            });
        });
    }

    // ============ FLIP CARDS ANIMATION ============
    document.querySelectorAll('.btn-flip').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const card = e.target.closest('.duvida-card');
            if (card) {
                card.classList.toggle('is-flipped');
            }
        });
    });

    // ============ PERFORMANCE: Throttle scroll events ============
    let scrollTicking = false;

    const onScroll = () => {
        if (!scrollTicking) {
            window.requestAnimationFrame(() => {
                handleNavbarScroll();
                highlightNav();
                scrollTicking = false;
            });
            scrollTicking = true;
        }
    };

    // Re-bind with throttled version
    window.removeEventListener('scroll', handleNavbarScroll);
    window.removeEventListener('scroll', highlightNav);
    window.addEventListener('scroll', onScroll, { passive: true });
});
