let currentQuestion = 0;
let timeLeft = 0;
let timer;
const answers = {};
let startTime;

const formSteps = document.querySelectorAll('.form-step');
const progressSteps = document.querySelectorAll('.progress-steps .step');
const startButton = document.getElementById('startTest');
const introPage = document.getElementById('introPage');
const testForm = document.getElementById('testForm');
const timeTakenInput = document.getElementById("timeTaken"); 

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
            saveAnswer();
            currentQuestion--;
            showQuestion(currentQuestion);
        };
    }

    if (currentNextButton) {
        currentNextButton.textContent = currentQuestion < formSteps.length - 1 ? 'التالي' : 'إرسال';
        currentNextButton.onclick = (event) => {
            event.preventDefault(); 
            saveAnswer();

            if (currentQuestion < formSteps.length - 1) {
                currentQuestion++;
                showQuestion(currentQuestion);
            } else {
                stopTimer();
                document.getElementById('hiddenSubmitBtn').click();
            }
        };
    }
}

function saveAnswer() {
    const currentStep = formSteps[currentQuestion];
    const selectedOption = currentStep.querySelector('input[type="radio"]:checked');
    if (selectedOption) {
        answers[`q${currentQuestion + 1}`] = selectedOption.value;
    }
}

function updateSidebar() {
    console.log("تنفيذ updateSidebar()");
    console.log("قيمة currentQuestion:", currentQuestion);

    progressSteps.forEach((step, index) => {
        step.classList.remove('active');
    });

    if (introPage.style.display !== 'none') {
        progressSteps[0].classList.add('active');
        console.log(`  تفعيل الخطوة 1 (الحالة الابتدائية)`);
    } else if (currentQuestion >= 0 && currentQuestion < 5) {
        progressSteps[1].classList.add('active');
        console.log(`  تفعيل الخطوة 2 (الأسئلة 1-5)`);
    } else if (currentQuestion >= 5 && currentQuestion < 10) {
        progressSteps[2].classList.add('active');
        console.log(`  تفعيل الخطوة 3 (الأسئلة 6-10)`);
    } else if (currentQuestion >= 10 && currentQuestion < 15) {
        progressSteps[3].classList.add('active');
        console.log(`  تفعيل الخطوة 4 (الأسئلة 11-15)`);
    } else if (currentQuestion >= 15 && currentQuestion < 21) {
        progressSteps[4].classList.add('active');
        console.log(`  تفعيل الخطوة 5 (الأسئلة 16-21)`);
    } else if (currentQuestion >= 21) {
        progressSteps[5].classList.add('active');
        console.log(`  تفعيل الخطوة 6 (صفحة الإحصائيات)`);
    }
}

function startTimer() {
    startTime = new Date();
    timeLeft = 0;
    timer = setInterval(() => {
        timeLeft++;
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        document.getElementById('timer').textContent = `الوقت: ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }, 1000);
    console.log('وقت البدء بعد الضغط:', startTime);
}

function stopTimer() {
    clearInterval(timer);
}

updateSidebar();

startButton.addEventListener('click', () => {
    introPage.style.display = 'none';
    testForm.style.display = 'block';
    currentQuestion = 0;
    showQuestion(currentQuestion);
    startTimer();
    updateSidebar();
});

formSteps.forEach((step, index) => {
    if (index !== 0) step.style.display = 'none';
});

document.getElementById("testForm").addEventListener("submit", (event) => {
    const endTime = new Date();
    const timeTakenMillis = endTime.getTime() - startTime.getTime();

    if (!isNaN(timeTakenMillis)) {
        const timeTakenSeconds = Math.floor(timeTakenMillis / 1000);
        const minutes = Math.floor(timeTakenSeconds / 60);
        const seconds = timeTakenSeconds % 60;
        const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        document.getElementById("timeTaken").value = formattedTime; 
    } else {
        console.error("حدث خطأ في حساب الوقت.");
        document.getElementById("timeTaken").value = "";
    }
});