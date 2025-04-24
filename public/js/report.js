async function submitTestData() {
    console.log("تم الضغط على زر الإرسال لحفظ بيانات الاختبار والإحصائيات");

    const answers = {};
    document.querySelectorAll('input[type="radio"]:checked').forEach(radio => {
        const name = radio.name;
        const value = radio.value;
        answers[name] = value;
    });

    const statsData = {
        goals: parseInt(document.getElementById('goals').value),
        assists: parseInt(document.getElementById('assists').value),
        rating: parseFloat(document.getElementById('rating').value),
        matches: parseInt(document.getElementById('matches').value),
        timeTaken: document.getElementById('timeTaken').value,
        staticTime: document.getElementById('staticTime').value,
        answers: answers
    };

    try {
        const response = await fetch('/submitTest', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(statsData)
        });

        const result = await response.json();
        console.log("نتيجة حفظ الاختبار:", result);

        if (result.success) {
            alert('تم حفظ نتائج الاختبار بنجاح!');
            sessionStorage.setItem('lastTestData', JSON.stringify(statsData));
            if (result.testScore !== undefined) {
                sessionStorage.setItem('testScore', result.testScore);
            }
        
            predictPerformance(); 
            window.location.href = '/pages/success.html';
        } else {
            alert('حدث خطأ أثناء حفظ نتائج الاختبار: ' + (result.error || ''));
        }

    } catch (err) {
        console.error('خطأ في إرسال بيانات الاختبار:', err);
        alert('حدث خطأ غير متوقع أثناء حفظ الاختبار.');
    }
}

async function predictPerformance() {
    console.log("يتم الآن توقع الأداء...");
    const savedTestData = sessionStorage.getItem('lastTestData');
    const testScore = sessionStorage.getItem('testScore'); 

    if (!savedTestData) return;

    const data = JSON.parse(savedTestData);

    try {
        const response = await fetch('http://localhost:5001/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        console.log("نتائج التوقع:", result);

        document.getElementById('current-rating').innerText = result.result.current_rating;
        document.getElementById('predicted-rating').innerText = result.result.predicted_rating;
        document.getElementById('improvement').innerText = result.result.improvement;
        document.getElementById('inference-time').innerText = result.result.inference_time;

        const strengthsList = document.getElementById('strengths');
        strengthsList.innerHTML = '';
        result.result.strengths.forEach(strength => {
            const li = document.createElement('li');
            li.textContent = strength;
            strengthsList.appendChild(li);
        });

        const analysisList = document.getElementById('performance-analysis');
        analysisList.innerHTML = '';
        result.result.performance_analysis.forEach(analysis => {
            const li = document.createElement('li');
            li.textContent = analysis;
            analysisList.appendChild(li);
        });

        const recommendationsList = document.getElementById('recommendations');
        recommendationsList.innerHTML = '';
        result.result.recommendations.forEach(recommendation => {
            const li = document.createElement('li');
            li.textContent = recommendation;
            recommendationsList.appendChild(li);
        });

        // عرض درجة الاختبار إذا كانت موجودة
        if (testScore !== null) {
            const testScoreElement = document.getElementById('test-score');
            if (testScoreElement) {
                testScoreElement.innerText = `%${testScore}`; 
            }
        }

    } catch (err) {
        console.error('خطأ في طلب توقع الأداء:', err);
        document.getElementById('current-rating').innerText = 'خطأ';
        document.getElementById('predicted-rating').innerText = 'خطأ';
        document.getElementById('improvement').innerText = 'خطأ';
        document.getElementById('inference-time').innerText = 'خطأ';
        document.getElementById('strengths').innerHTML = '<li>حدث خطأ في عرض نقاط القوة.</li>';
        document.getElementById('performance-analysis').innerHTML = '<li>حدث خطأ في عرض تحليل الأداء.</li>';
        document.getElementById('recommendations').innerHTML = '<li>حدث خطأ في عرض التوصيات.</li>';
        const testScoreElement = document.getElementById('test-score');
        if (testScoreElement) {
            testScoreElement.innerText = 'خطأ';
        }
    }
}

document.addEventListener('DOMContentLoaded', function () {
    predictPerformance();
});

document.addEventListener('DOMContentLoaded', function () {
    const startTestButton = document.getElementById('startTest');
    const introPage = document.getElementById('introPage');
    const testForm = document.getElementById('testForm');
    const formSteps = document.querySelectorAll('.form-step');
    const nextButtons = document.querySelectorAll('.nextBtn');
    const prevButtons = document.querySelectorAll('.prevBtn');
    const submitButton = testForm.querySelector('button[type="submit"]');
    const timeDisplay = document.getElementById('timer');
    let currentStep = 0;
    let timerInterval;
    let startTime;

    function showStep(n) {
        formSteps.forEach(step => step.style.display = 'none');
        formSteps[n].style.display = 'block';
        updateProgress(n);
    }

    function updateProgress(stepIndex) {
        const steps = document.querySelectorAll('.progress-steps .step');
        steps.forEach((step, index) => {
            step.classList.remove('active');
            if (index <= stepIndex + 1) {
                step.classList.add('active');
            }
        });
    }

    function startTimer() {
        startTime = Date.now();
        timerInterval = setInterval(updateTimer, 1000);
    }

    function updateTimer() {
        const currentTime = Date.now();
        const elapsedTime = Math.floor((currentTime - startTime) / 1000);
        const minutes = Math.floor(elapsedTime / 60).toString().padStart(2, '0');
        const seconds = (elapsedTime % 60).toString().padStart(2, '0');
        timeDisplay.textContent = `الوقت: ${minutes}:${seconds}`;
        document.getElementById('timeTaken').value = elapsedTime;
    }

    function stopTimer() {
        clearInterval(timerInterval);
    }

    startTestButton.addEventListener('click', function () {
        introPage.style.display = 'none';
        testForm.style.display = 'block';
        showStep(currentStep);
        startTimer();
        updateProgress(currentStep - 1);
    });

    nextButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (currentStep < formSteps.length - 1) {
                currentStep++;
                showStep(currentStep);
            }
        });
    });

    prevButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (currentStep > 0) {
                currentStep--;
                showStep(currentStep);
            }
        });
    });

    testForm.addEventListener('submit', function (event) {
        event.preventDefault();
        stopTimer();

        const answers = {};
        document.querySelectorAll('input[type="radio"]:checked').forEach(radio => {
            const name = radio.name;
            const value = radio.value;
            answers[name] = value;
        });

        const statsData = {
            goals: parseInt(document.getElementById('goals').value),
            assists: parseInt(document.getElementById('assists').value),
            rating: parseFloat(document.getElementById('rating').value),
            matches: parseInt(document.getElementById('matches').value),
            timeTaken: document.getElementById('timeTaken').value,
            staticTime: document.getElementById('staticTime').value,
            answers: answers
        };

        sessionStorage.setItem('lastTestData', JSON.stringify(statsData));
        setTimeout(submitTestData, 500);
    });

    if (document.getElementById('expected-rating')) {
        predictPerformance();
    }

    if (testForm.style.display === 'block' && formSteps.length > 0) {
        showStep(currentStep);
        updateProgress(currentStep - 1);
    }
});