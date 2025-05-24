document.addEventListener('DOMContentLoaded', function() {
    // Event listeners for CTA buttons
    const startAppBtn = document.getElementById('start-app');
    const tryNowBtn = document.getElementById('try-now');

    function redirectToApp() {
        window.location.href = 'app.html';
    }

    startAppBtn.addEventListener('click', redirectToApp);
    tryNowBtn.addEventListener('click', redirectToApp);

    // Animate elements on scroll
    function animateOnScroll() {
        const elements = document.querySelectorAll('.feature-card, .step-card');
        
        elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementBottom = element.getBoundingClientRect().bottom;
            
            if (elementTop < window.innerHeight && elementBottom > 0) {
                element.classList.add('animate-fade');
            }
        });
    }

    // Initial check for elements in viewport
    animateOnScroll();

    // Listen for scroll events
    window.addEventListener('scroll', animateOnScroll);
});