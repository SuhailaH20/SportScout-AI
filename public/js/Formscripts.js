let currentQuestion = 0;
const formSteps = document.querySelectorAll('.form-step');
const progressSteps = document.querySelectorAll('.progress-steps .step');
const startButton = document.getElementById('startTest');
const introPage = document.getElementById('introPage');
const testForm = document.getElementById('testForm');

function showQuestion(index) {
    formSteps.forEach((step, i) => {
        step.style.display = i === index ? 'block' : 'none';
    });
    updateNavigationButtons();
    updateSidebar();
}

function updateNavigationButtons() {
    const currentNextButton = formSteps[currentQuestion].querySelector('.nextBtn');
    const currentPrevButton = formSteps[currentQuestion].querySelector('.prevBtn');

    if (currentPrevButton) {
        currentPrevButton.style.display = currentQuestion > 0 ? 'inline-block' : 'none';
        currentPrevButton.onclick = () => {
            if (currentQuestion > 0) {
                currentQuestion--;
                showQuestion(currentQuestion);
            }
        };
    }

    if (currentNextButton) {
        currentNextButton.textContent = currentQuestion < formSteps.length - 1 ? 'التالي' : 'إرسال';
        currentNextButton.onclick = () => {
            // قم بتنفيذ الإجراءات التي تريدها عند الضغط على "التالي" لكل سؤال هنا
            // على سبيل المثال، يمكنك حفظ الإجابة أو التحقق منها مؤقتًا

            if (currentQuestion < formSteps.length - 1) {
                currentQuestion++;
                showQuestion(currentQuestion);
            } else {
                // إجراءات الإرسال النهائي هنا
                alert('تم إرسال الاختبار!');
                // يمكنك هنا جمع الإجابات وإرسالها إلى الخادم
            }
        };
    }
}

function updateSidebar() {
    progressSteps.forEach((step, index) => {
        step.classList.remove('active');
        const currentGroup = Math.ceil((currentQuestion + 1) / 5); // Assuming 5 questions per step in sidebar
        if (index + 1 === currentGroup) {
            step.classList.add('active');
        }
    });
}

startButton.addEventListener('click', () => {
    introPage.style.display = 'none';
    testForm.style.display = 'block';
    currentQuestion = 0;
    showQuestion(currentQuestion);
    progressSteps[0].classList.remove('active');
    progressSteps[1].classList.add('active');
    updateSidebar();
});

// Initial setup
progressSteps.forEach((step, index) => {
    step.classList.remove('active');
    if (index === 0) {
        step.classList.add('active');
    }
});

formSteps.forEach((step, index) => {
    if (index > 0) {
        step.style.display = 'none';
    }
});

function showQuestion(index) {
    formSteps.forEach((step, i) => {
        step.style.display = i === index ? 'block' : 'none';
    });
    updateNavigationButtons();
    updateSidebar();
}

function updateNavigationButtons() {
    const currentNextButton = formSteps[currentQuestion].querySelector('.nextBtn');
    const currentPrevButton = formSteps[currentQuestion].querySelector('.prevBtn');

    if (currentPrevButton) {
        currentPrevButton.style.display = currentQuestion > 0 ? 'inline-block' : 'none';
        currentPrevButton.onclick = () => {
            if (currentQuestion > 0) {
                currentQuestion--;
                showQuestion(currentQuestion);
            }
        };
    }

    if (currentNextButton) {
        currentNextButton.textContent = currentQuestion < formSteps.length - 1 ? 'التالي' : 'إرسال';
        currentNextButton.onclick = () => {
            if (currentQuestion < formSteps.length - 1) {
                currentQuestion++;
                showQuestion(currentQuestion);
            } else {
                alert('تم إرسال الاختبار!');
            }
        };
    }
}

function updateSidebar() {
    progressSteps.forEach((step, index) => {
        step.classList.remove('active');
        const currentGroup = Math.ceil((currentQuestion + 1) / questionsPerPage);
        if (index + 1 === currentGroup + 1) {
            step.classList.add('active');
        }
    });
}

startButton.addEventListener('click', () => {
    introPage.style.display = 'none';
    testForm.style.display = 'block';
    currentQuestion = 0; // Start with the first question (index 0)
    showQuestion(currentQuestion);

    progressSteps[0].classList.remove('active');
    progressSteps[1].classList.add('active');
    updateSidebar();
});

// Initial setup: Make the first step in the sidebar active
progressSteps.forEach((step, index) => {
    step.classList.remove('active');
    if (index === 0) {
        step.classList.add('active');
    }
});

// Hide all questions except the first one
formSteps.forEach((step, index) => {
    if (index > 0) {
        step.style.display = 'none';
    }
});


let testStarted = false; // متغير لتتبع حالة بدء الاختبار
let timerInterval; // متغير لتخزين معرف interval

function updateTimer() {
    if (testStarted) {
        const timerElement = document.getElementById('timer');
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');

        timerElement.textContent = `الوقت: ${hours}:${minutes}:${seconds}`;
    }
}

let timer; 
let timeLeft = 0; 

function startTimer() {
    timeLeft = 0; 
    timer = setInterval(() => {
        timeLeft++;
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        document.getElementById('timer').textContent = `الوقت: ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }, 1000);
}


document.getElementById('startTest').addEventListener('click', function () {
    document.getElementById('introPage').style.display = 'none';
    document.getElementById('testForm').style.display = 'block';
    startTimer(); 
});

document.addEventListener('DOMContentLoaded', function() {
    const navigationButtons = document.querySelectorAll('.navigation-buttons');

    navigationButtons.forEach(container => {
        const submitButton = container.querySelector('button[type="submit"].btn-small');

        if (submitButton) {
            submitButton.addEventListener('click', function(event) {
                event.preventDefault();

                window.location.href = `/pages/success.html`;
            });
        }
    });
});