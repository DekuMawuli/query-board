document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENT SELECTION ---
    function getElements() {
        const elements = {
            presentation: document.getElementById('presentation-container'),
            slides: document.querySelectorAll('.slide'),
            prevBtn: document.getElementById('prev-btn'),
            nextBtn: document.getElementById('next-btn'),
            slideCounter: document.getElementById('slide-counter'),
            loadingScreen: document.getElementById('loading-screen'),
        };
        for (const key in elements) {
            if (!elements[key] || (elements[key].length === 0 && key === 'slides')) {
                console.error(`Critical element not found: ${key}`);
                return null;
            }
        }
        return elements;
    }

    const elements = getElements();
    if (!elements) { /* Error handling as before */ return; }
    
    const { presentation, slides, prevBtn, nextBtn, slideCounter, loadingScreen } = elements;

    // --- MODE DETECTION ---
    const isMobile = window.matchMedia('(max-width: 768px)').matches;

    // =====================================================================
    // SCROLLABLE MODE LOGIC (for Mobile)
    // =====================================================================
    function initScrollable() {
        console.log("Initializing Scrollable Mode for mobile.");

        // Animate slides in as they are scrolled into view
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 }); // Trigger when 20% of the slide is visible

        slides.forEach(slide => {
            observer.observe(slide);
        });
    }

    // =====================================================================
    // DECK MODE LOGIC (for Desktop/Tablet)
    // =====================================================================
    function initDeck() {
        console.log("Initializing Deck Mode for desktop.");

        let currentSlide = 0;
        const totalSlides = slides.length;

        function showSlide(index) {
            currentSlide = index;
            slides.forEach((slide, i) => slide.classList.toggle('active', i === currentSlide));
            slideCounter.textContent = `${currentSlide + 1} / ${totalSlides}`;
            prevBtn.disabled = currentSlide === 0;
            nextBtn.disabled = currentSlide === totalSlides - 1;
            saveProgress();
        }
    
        const nextSlide = () => { if (currentSlide < totalSlides - 1) showSlide(currentSlide + 1); };
        const prevSlide = () => { if (currentSlide > 0) showSlide(currentSlide - 1); };
        const resetPresentation = () => showSlide(0);

        function toggleFullscreen() {
            if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(err => console.error(err));
            else document.exitFullscreen();
        }

        function saveProgress() {
            try { localStorage.setItem('queryBoardSlidePosition', currentSlide); } 
            catch (e) { console.warn("localStorage is not available."); }
        }

        function loadProgress() {
            try {
                const savedSlide = localStorage.getItem('queryBoardSlidePosition');
                const slideNumber = parseInt(savedSlide, 10);
                if (!isNaN(slideNumber) && slideNumber >= 0 && slideNumber < totalSlides) return slideNumber;
            } catch (e) {
                console.warn("localStorage is not available.");
            }
            return 0;
        }

        function handleKeyDown(e) {
            const keyMap = { 'ArrowRight': nextSlide, ' ': nextSlide, 'ArrowLeft': prevSlide, 'r': resetPresentation, 'R': resetPresentation, 'F11': toggleFullscreen };
            if (keyMap[e.key]) { e.preventDefault(); keyMap[e.key](); }
        }
    
        let touchStartX = 0;
        const swipeThreshold = 50;
        function handleTouchStart(e) { touchStartX = e.changedTouches[0].screenX; }
        function handleTouchEnd(e) {
            const touchEndX = e.changedTouches[0].screenX;
            if (touchEndX < touchStartX - swipeThreshold) nextSlide();
            if (touchEndX > touchStartX + swipeThreshold) prevSlide();
        }

        document.addEventListener('keydown', handleKeyDown);
        prevBtn.addEventListener('click', prevSlide);
        nextBtn.addEventListener('click', nextSlide);
        presentation.addEventListener('touchstart', handleTouchStart, { passive: true });
        presentation.addEventListener('touchend', handleTouchEnd, { passive: true });

        const startSlide = loadProgress();
        showSlide(startSlide);
    }

    // --- UNIVERSAL INITIALIZATION ---
    function init() {
        // Hide loader (works for both modes)
        if (loadingScreen) {
            setTimeout(() => {
                loadingScreen.style.opacity = '0';
                loadingScreen.addEventListener('transitionend', () => { loadingScreen.style.display = 'none'; }, { once: true });
            }, 100);
        }

        // Initialize the correct mode based on screen size
        if (isMobile) {
            initScrollable();
        } else {
            initDeck();
        }

        console.log("QueryBoard Presentation Initialized successfully.");
    }

    init();
});