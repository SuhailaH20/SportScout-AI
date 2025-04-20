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

                const endTime = new Date();
                console.log("startTime:", startTime);
                console.log("endTime:", endTime);

                const timeTaken = startTime ? endTime.getTime() - startTime.getTime() : 0;
                console.log('المدة بالمللي ثانية:', timeTaken);

                const formData = {
                    timeTaken: timeTaken.toString(), // تأكد أنه نص
                    ...answers
                };

                fetch('/submitTest', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                })
                .then(response => {
                    if (response.ok) {
                        window.location.href = '/pages/success.html';
                    } else {
                        return response.text().then(text => { throw new Error(text) });
                    }
                })
                .catch(error => {
                    console.error('خطأ أثناء الإرسال:', error);
                });
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
    progressSteps.forEach((step, index) => {
        step.classList.remove('active');
        const currentGroup = Math.ceil((currentQuestion + 1) / 5);
        if (index === currentGroup) {
            step.classList.add('active');
        }
    });
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

startButton.addEventListener('click', () => {
    introPage.style.display = 'none';
    testForm.style.display = 'block';
    currentQuestion = 0;
    showQuestion(currentQuestion);
    startTimer();
});

formSteps.forEach((step, index) => {
    if (index !== 0) step.style.display = 'none';
});
