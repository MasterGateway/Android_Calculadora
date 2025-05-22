document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const evaluationsBody = document.getElementById('evaluations-body');
    const addEvaluationBtn = document.getElementById('add-evaluation');
    const calculateBtn = document.getElementById('calculate-btn');
    const resultsSection = document.getElementById('results-section');
    const finalScoreDisplay = document.getElementById('final-score');
    const scoreProgress = document.getElementById('score-progress');
    const motivationalMessage = document.getElementById('motivational-message');
    const mainFab = document.getElementById('main-fab');
    const fabActions = document.querySelector('.fab-actions');
    const structureModal = new bootstrap.Modal('#structureModal');
    const saveStructureBtn = document.getElementById('save-structure-btn');
    const structureNameInput = document.getElementById('structure-name');
    const savedStructuresList = document.getElementById('saved-structures-list');
    const toggleViewBtn = document.getElementById('toggle-view');

    // Chart Variables
    let resultsChart = null;

    // Initial Data
    const initialData = [
        { evaluation: 'Práctica 1', nota: '', peso: '20%' },
        { evaluation: 'Práctica 2', nota: '', peso: '20%' },
        { evaluation: 'Trabajo 1', nota: '', peso: '15%' },
        { evaluation: 'Examen 1', nota: '', peso: '15%' },
        { evaluation: 'Examen 2', nota: '', peso: '15%' },
        { evaluation: 'Medio Curso', nota: '', peso: '25%' },
        { evaluation: 'Actitudinal', nota: '', peso: '5%' },
        { evaluation: 'Examen Final', nota: '', peso: '20%' }
    ];

    // Initialize App
    function initApp() {
        // Load initial data
        initialData.forEach(item => addEvaluationRow(item.evaluation, item.nota, item.peso));

        // Load saved structures from localStorage
        loadSavedStructures();

        // Set up event listeners
        setupEventListeners();
    }

    // Set up event listeners
    function setupEventListeners() {
        // Add evaluation row
        addEvaluationBtn.addEventListener('click', () => addEvaluationRow());

        // Calculate button
        calculateBtn.addEventListener('click', calculateGrades);

        // FAB actions
        mainFab.addEventListener('click', toggleFabActions);

        document.querySelectorAll('.fab-action').forEach(btn => {
            btn.addEventListener('click', function() {
                const action = this.getAttribute('data-action');
                handleFabAction(action);
                toggleFabActions();
            });
        });

        // Save structure
        saveStructureBtn.addEventListener('click', saveCurrentStructure);

        // Toggle view
        toggleViewBtn.addEventListener('click', () => {
            localStorage.removeItem('preferredDevice');
            window.location.href = 'https://calculadora-notas-uni.onrender.com/'; // Redirige a la versión de escritorio
        });
    }

    // Add evaluation row
    function addEvaluationRow(evaluation = '', nota = '', peso = '') {
        const row = document.createElement('tr');
        row.className = 'animate-fade';
        row.innerHTML = `
            <td>
                <input type="text" class="form-control evaluation-input" 
                       value="${evaluation}" placeholder="Evaluación" required>
            </td>
            <td>
                <input type="number" class="form-control grade-input" 
                       value="${nota}" min="0" max="20" step="0.1" placeholder="0-20">
            </td>
            <td>
                <input type="text" class="form-control weight-input" 
                       value="${peso}" placeholder="10%">
            </td>
            <td class="text-center">
                <button class="btn btn-sm btn-outline-danger remove-row">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;

        evaluationsBody.appendChild(row);

        // Add event listeners to new row
        const gradeInput = row.querySelector('.grade-input');
        const weightInput = row.querySelector('.weight-input');
        const removeBtn = row.querySelector('.remove-row');

        gradeInput.addEventListener('input', () => updateRowStyle(row, gradeInput.value));
        weightInput.addEventListener('input', validateWeightInput);
        removeBtn.addEventListener('click', () => {
            row.classList.add('animate-slide');
            setTimeout(() => row.remove(), 300);
        });

        updateRowStyle(row, nota);
    }

    // Calculate grades
    function calculateGrades() {
        const rows = evaluationsBody.querySelectorAll('tr');
        const evaluations = [];
        let totalWeight = 0;
        let hasErrors = false;

        // Validate inputs and collect data
        rows.forEach(row => {
            const evaluationInput = row.querySelector('.evaluation-input');
            const gradeInput = row.querySelector('.grade-input');
            const weightInput = row.querySelector('.weight-input');

            const evaluation = {
                name: evaluationInput.value.trim(),
                grade: parseFloat(gradeInput.value) || 0,
                weight: parseFloat(weightInput.value.replace('%', '')) || 0
            };

            // Validate
            if (!evaluation.name) {
                evaluationInput.classList.add('is-invalid');
                hasErrors = true;
            } else {
                evaluationInput.classList.remove('is-invalid');
            }

            if (isNaN(evaluation.weight)) {
                weightInput.classList.add('is-invalid');
                hasErrors = true;
            } else {
                weightInput.classList.remove('is-invalid');
                totalWeight += evaluation.weight;
            }

            evaluations.push(evaluation);

        });

        // Check total weight
        if (Math.abs(totalWeight - 100) > 0.1) {
            alert(`La suma de los porcentajes es ${totalWeight}%. Debe ser exactamente 100%`);
            hasErrors = true;
        }

        if (hasErrors) return;

        // Calculate final score
        let finalScore = 0;
        evaluations.forEach(eval => {
            finalScore += eval.grade * (eval.weight / 100);
        });

        finalScore = Math.round(finalScore * 100) / 100;

        // Display results
        showResults(evaluations, finalScore);
    }

    // Show results
    function showResults(evaluations, finalScore) {
        // Update final score display
        finalScoreDisplay.textContent = finalScore;

        // Update progress bar
        const percentage = (finalScore / 20) * 100;
        scoreProgress.style.width = `${percentage}%`;
        updateProgressColor(percentage);

        // Show motivational message
        showMotivationalMessage(finalScore);

        // Create chart
        createChart(evaluations, finalScore);

        // Show results section
        resultsSection.style.display = 'block';
        setTimeout(() => {
            resultsSection.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    }

    // Create results chart
    function createChart(evaluations, finalScore) {
        const ctx = document.getElementById('results-chart').getContext('2d');

        // Destroy previous chart if exists
        if (resultsChart) {
            resultsChart.destroy();
        }

        // Prepare data
        const labels = evaluations.map(eval => eval.name);
        const grades = evaluations.map(eval => eval.grade);
        const weights = evaluations.map(eval => eval.weight);

        // Create new chart
        resultsChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                        label: 'Notas',
                        data: grades,
                        backgroundColor: 'rgba(54, 162, 235, 0.7)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Pesos (%)',
                        data: weights,
                        backgroundColor: 'rgba(255, 159, 64, 0.7)',
                        borderColor: 'rgba(255, 159, 64, 1)',
                        borderWidth: 1,
                        type: 'line',
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Desempeño por Evaluación',
                        font: {
                            size: 14
                        }
                    },
                    legend: {
                        position: 'bottom',
                        labels: {
                            boxWidth: 12
                        }
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Nota (0-20)'
                        },
                        max: 20,
                        min: 0
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Peso (%)'
                        },
                        max: 100,
                        min: 0,
                        grid: {
                            drawOnChartArea: false
                        }
                    }
                }
            }
        });
    }

    // Show motivational message
    function showMotivationalMessage(score) {
        let message = '';
        let emoji = '';

        if (score >= 18) {
            message = "¡Excelente trabajo! Estás demostrando un desempeño sobresaliente. Sigue manteniendo este nivel de dedicación.";
            emoji = "🏆";
        } else if (score >= 15) {
            message = "Buen trabajo. Estás por encima del promedio, pero aún hay margen para mejorar. Identifica aquellas áreas donde puedes fortalecer tu aprendizaje.";
            emoji = "👍";
        } else if (score >= 11) {
            message = "Estás dentro del rango aprobatorio, pero considera reforzar tus estrategias de estudio. Revisa los temas donde hayas tenido dificultades y busca ayuda si es necesario.";
            emoji = "💡";
        } else if (score > 0) {
            message = "Es importante que revises tu método de estudio. Considera buscar asesoría, organizar mejor tu tiempo y practicar más. ¡Tú puedes mejorar!";
            emoji = "📚";
        } else {
            message = "Ingresa tus notas para calcular tu promedio y obtener recomendaciones personalizadas.";
            emoji = "📝";
        }

        motivationalMessage.innerHTML = `
            <div class="d-flex align-items-start">
                <span class="me-2" style="font-size: 1.5rem;">${emoji}</span>
                <span>${message}</span>
            </div>
        `;
    }

    // Update row style based on grade
    function updateRowStyle(row, grade) {
        const numGrade = parseFloat(grade) || 0;
        row.classList.remove('low-grade', 'medium-grade', 'high-grade');

        if (numGrade > 0) {
            if (numGrade < 10.5) {
                row.classList.add('low-grade');
            } else if (numGrade < 14) {
                row.classList.add('medium-grade');
            } else {
                row.classList.add('high-grade');
            }
        }
    }

    // Update progress bar color
    function updateProgressColor(percentage) {
        scoreProgress.classList.remove('bg-danger', 'bg-warning', 'bg-success');

        if (percentage < 52.5) { // < 10.5/20
            scoreProgress.classList.add('bg-danger');
        } else if (percentage < 70) { // < 14/20
            scoreProgress.classList.add('bg-warning');
        } else {
            scoreProgress.classList.add('bg-success');
        }
    }

    // Validate weight input
    function validateWeightInput(e) {
        const input = e.target;
        let value = input.value.replace('%', '');

        // Allow only numbers and %
        value = value.replace(/[^0-9.]/g, '');

        // Add % at the end
        if (value && !input.value.includes('%')) {
            value += '%';
        }

        input.value = value;
    }

    // FAB functions
    function toggleFabActions() {
        fabActions.classList.toggle('show');
    }

    function handleFabAction(action) {
        switch (action) {
            case 'calculate':
                calculateGrades();
                break;
            case 'add':
                addEvaluationRow();
                break;
            case 'save':
                structureModal.show();
                break;
            case 'reset':
                if (confirm('¿Reiniciar todas las evaluaciones?')) {
                    evaluationsBody.innerHTML = '';
                    initialData.forEach(item => addEvaluationRow(item.evaluation, item.nota, item.peso));
                    resultsSection.style.display = 'none';
                }
                break;
        }
    }

    // Structure management
    function saveCurrentStructure() {
        const structureName = structureNameInput.value.trim();
        if (!structureName) {
            alert('Por favor ingresa un nombre para la estructura');
            return;
        }

        const rows = evaluationsBody.querySelectorAll('tr');
        const structure = [];

        rows.forEach(row => {
            const evaluation = row.querySelector('.evaluation-input').value;
            const peso = row.querySelector('.weight-input').value;

            if (evaluation && peso) {
                structure.push({ evaluation, peso });
            }
        });

        if (structure.length === 0) {
            alert('No hay evaluaciones para guardar');
            return;
        }

        // Save to localStorage
        const savedStructures = JSON.parse(localStorage.getItem('savedStructures')) || {};
        savedStructures[structureName] = structure;
        localStorage.setItem('savedStructures', JSON.stringify(savedStructures));

        // Update UI
        structureNameInput.value = '';
        structureModal.hide();
        loadSavedStructures();
        alert(`Estructura "${structureName}" guardada`);
    }

    function loadSavedStructures() {
        const savedStructures = JSON.parse(localStorage.getItem('savedStructures')) || {};
        savedStructuresList.innerHTML = '';

        for (const [name, structure] of Object.entries(savedStructures)) {
            const item = document.createElement('button');
            item.className = 'list-group-item list-group-item-action';
            item.innerHTML = `
                <span>${name}</span>
                <button class="btn btn-sm btn-outline-danger delete-structure" data-name="${name}">
                    <i class="bi bi-trash"></i>
                </button>
            `;

            item.addEventListener('click', () => {
                evaluationsBody.innerHTML = '';
                structure.forEach(eval => {
                    addEvaluationRow(eval.evaluation, '', eval.peso);
                });
                structureModal.hide();
            });

            item.querySelector('.delete-structure').addEventListener('click', function(e) {
                e.stopPropagation();
                if (confirm(`¿Eliminar la estructura "${name}"?`)) {
                    delete savedStructures[name];
                    localStorage.setItem('savedStructures', JSON.stringify(savedStructures));
                    loadSavedStructures();
                }
            });

            savedStructuresList.appendChild(item);
        }
    }

    // Initialize the app
    initApp();
});