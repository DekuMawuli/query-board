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
    if (!elements) {
        document.body.innerHTML = `<div style="font-family: sans-serif; color: red; padding: 20px;">
            <h2>Error: A critical HTML element is missing.</h2>
            <p>Please check the browser console (F12) for more details.</p>
        </div>`;
        return;
    }
    
    const { presentation, slides, prevBtn, nextBtn, slideCounter, loadingScreen } = elements;

    // --- STATE MANAGEMENT ---
    let currentSlide = 0;
    const totalSlides = slides.length;

    // --- CORE FUNCTIONS ---
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

    // --- LOCALSTORAGE ---
    function saveProgress() {
        try { localStorage.setItem('queryBoardSlidePosition', currentSlide); } 
        catch (e) { console.warn("localStorage is not available. Progress will not be saved."); }
    }

    function loadProgress() {
        try {
            const savedSlide = localStorage.getItem('queryBoardSlidePosition');
            const slideNumber = parseInt(savedSlide, 10);
            if (!isNaN(slideNumber) && slideNumber >= 0 && slideNumber < totalSlides) {
                return slideNumber;
            }
        } catch (e) {
            console.warn("localStorage is not available. Starting from the beginning.");
        }
        return 0; // Default to 0 if anything goes wrong
    }

    // --- EVENT HANDLERS ---
    function handleKeyDown(e) {
        const keyMap = {
            'ArrowRight': nextSlide,
            ' ': nextSlide,
            'ArrowLeft': prevSlide,
            'r': resetPresentation,
            'R': resetPresentation,
            'F11': toggleFullscreen,
        };
        if (keyMap[e.key]) {
            e.preventDefault();
            keyMap[e.key]();
        }
    }
    
    let touchStartX = 0;
    const swipeThreshold = 50;
    function handleTouchStart(e) { touchStartX = e.changedTouches[0].screenX; }
    function handleTouchEnd(e) {
        const touchEndX = e.changedTouches[0].screenX;
        if (touchEndX < touchStartX - swipeThreshold) nextSlide();
        if (touchEndX > touchStartX + swipeThreshold) prevSlide();
    }

    // --- INITIALIZATION ---
    function init() {
        console.log("Initializing presentation...");

        if (loadingScreen) {
            setTimeout(() => {
                loadingScreen.style.opacity = '0';
                loadingScreen.addEventListener('transitionend', () => {
                    loadingScreen.style.display = 'none';
                }, { once: true });
            }, 100);
        }

        try {
            document.addEventListener('keydown', handleKeyDown);
            prevBtn.addEventListener('click', prevSlide);
            nextBtn.addEventListener('click', nextSlide);
            presentation.addEventListener('touchstart', handleTouchStart, { passive: true });
            presentation.addEventListener('touchend', handleTouchEnd, { passive: true });

            const startSlide = loadProgress();
            showSlide(startSlide);

            console.log("QueryBoard Presentation Initialized successfully.");
        } catch (error) {
            console.error("An error occurred during presentation setup:", error);
            document.body.innerHTML = `<div style="font-family: sans-serif; color: red; padding: 20px;">
                <h2>A script error occurred while loading the presentation.</h2>
                <p>Please open the console (F12) and report the error message.</p>
                <pre style="background: #f0f0f0; padding: 10px; border-radius: 5px; color: #333;">${error.stack}</pre>
            </div>`;
        }
    }

    init();
});