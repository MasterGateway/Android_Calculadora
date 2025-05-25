document.addEventListener('DOMContentLoaded', function() {
    // Event listeners for CTA buttons
    const startAppBtn = document.getElementById('start-app');
    const tryNowBtn = document.getElementById('try-now');

    function redirectToApp() {
        window.location.href = 'app.html';
    }

    if (startAppBtn) startAppBtn.addEventListener('click', redirectToApp);
    if (tryNowBtn) tryNowBtn.addEventListener('click', redirectToApp);

    // Calculator functionality
    const gradesList = document.getElementById('gradesList');
    const addGradeBtn = document.getElementById('addGrade');
    const finalAverageSpan = document.getElementById('finalAverage');
    const gradesChart = document.getElementById('gradesChart');
    let chart = null;

    if (addGradeBtn) {
        addGradeBtn.addEventListener('click', addGradeItem);
        initializeChart();
    }

    function addGradeItem() {
        const template = document.getElementById('gradeTemplate');
        const gradeItem = template.content.cloneNode(true);
        
        const deleteBtn = gradeItem.querySelector('.delete-grade');
        deleteBtn.addEventListener('click', function(e) {
            e.target.closest('.grade-item').remove();
            calculateAverage();
            updateChart();
        });

        const inputs = gradeItem.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                calculateAverage();
                updateChart();
            });
        });

        gradesList.appendChild(gradeItem);
    }

    function calculateAverage() {
        const gradeItems = document.querySelectorAll('.grade-item');
        let totalWeight = 0;
        let weightedSum = 0;

        gradeItems.forEach(item => {
            const grade = parseFloat(item.querySelector('.grade-value').value) || 0;
            const weight = parseFloat(item.querySelector('.grade-weight').value) || 0;
            
            totalWeight += weight;
            weightedSum += grade * weight;
        });

        const average = totalWeight > 0 ? weightedSum / totalWeight : 0;
        finalAverageSpan.textContent = average.toFixed(2);
    }

    function initializeChart() {
        const ctx = gradesChart.getContext('2d');
        chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Notas',
                    data: [],
                    backgroundColor: 'rgba(99, 102, 241, 0.5)',
                    borderColor: 'rgb(99, 102, 241)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 10
                    }
                }
            }
        });
    }

    function updateChart() {
        if (!chart) return;

        const gradeItems = document.querySelectorAll('.grade-item');
        const grades = [];
        const weights = [];

        gradeItems.forEach(item => {
            const grade = parseFloat(item.querySelector('.grade-value').value) || 0;
            const weight = parseFloat(item.querySelector('.grade-weight').value) || 0;
            grades.push(grade);
            weights.push(`Peso: ${weight}%`);
        });

        chart.data.labels = weights;
        chart.data.datasets[0].data = grades;
        chart.update();
    }

    // Navbar scroll effect
    let lastScroll = 0;
    const navbar = document.querySelector('.navbar');

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll <= 0) {
            navbar.style.boxShadow = 'none';
            return;
        }
        
        if (currentScroll > lastScroll) {
            navbar.style.transform = 'translateY(-100%)';
        } else {
            navbar.style.transform = 'translateY(0)';
            navbar.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
        }
        
        lastScroll = currentScroll;
    });

    // Animate elements on scroll
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const elements = document.querySelectorAll('.feature-card, .step-card, .hero-image');
    elements.forEach(element => observer.observe(element));

    // Smooth scroll for anchor links
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
});