// JavaScript to toggle between Scout and Player forms
const scoutBtn = document.getElementById("scoutBtn");
const playerBtn = document.getElementById("playerBtn");
const scoutForm = document.getElementById("scoutForm");
const playerForm = document.getElementById("playerForm");
const errorMessage = document.getElementById('errorMessage'); // Get the error message element

scoutForm.style.display = "block";
playerForm.style.display = "none";

playerBtn.addEventListener("click", function() {
    scoutForm.style.display = "none";
    playerForm.style.display = "block";

    playerBtn.classList.remove("btn-outline-primary");
    playerBtn.classList.add("btn-scout");
    scoutBtn.classList.remove("btn-scout");
    scoutBtn.classList.add("btn-outline-primary");
});

scoutBtn.addEventListener("click", function() {
    scoutForm.style.display = "block";
    playerForm.style.display = "none";

    scoutBtn.classList.remove("btn-outline-primary");
    scoutBtn.classList.add("btn-scout");
    playerBtn.classList.remove("btn-scout");
    playerBtn.classList.add("btn-outline-primary");
});

// Function to validate a single input field and display error
function validateInput(inputElement, errorElement, validationFunction, errorMessage) {
    if (!validationFunction(inputElement.value)) {
        inputElement.classList.add("is-invalid");
        errorElement.innerText = errorMessage;
        errorElement.style.float = "right";
        errorElement.style.paddingBottom = "6px";
        return false;
    } else {
        inputElement.classList.remove("is-invalid");
        errorElement.innerText = "";
        return true;
    }
}

// Validation functions
const isNotEmpty = (value) => !!value;
const isValidFullName = (value) => {
    const trimmedValue = value.trim();

    const namePattern = /^([\u0621-\u064A]+\s){2,}[\u0621-\u064A]+$|^([a-zA-Z]+\s){2,}[a-zA-Z]+$/;

    return namePattern.test(trimmedValue);
};

const isValidPhoneNumber = (value) => !isNaN(value) && value.length === 10;
const isValidEmail = (value) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);
const hasUppercase = (value) => /[A-Z]/.test(value);
const hasLowercase = (value) => /[a-z]/.test(value);
const hasNumber = (value) => /[0-9]/.test(value);
const isPasswordLongEnough = (value) => value.length >= 8;

// Form validation for Scout form
document.getElementById("scoutForm").addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission

    let isValid = true;
    const nameInput = this.querySelector('input[name="name"]');
    const phoneNumberInput = this.querySelector('input[name="phoneNumber"]');
    const emailInput = this.querySelector('input[name="email"]');
    const passwordInput = this.querySelector('input[name="password"]');
    const organizationInput = this.querySelector('input[name="organization"]');
    const experienceInput = this.querySelector('input[name="experience"]');
    const locationInput = this.querySelector('input[name="location"]');
    const nameError = document.getElementById('nameError');
    const phoneNumberError = document.getElementById('phoneNumberError');
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
    const organizationError = document.getElementById('organizationError');
    const experienceError = document.getElementById('experienceError');
    const locationError = document.getElementById('locationError');

    isValid = validateInput(nameInput, nameError, isValidFullName, "الرجاء ادخال اسم ثلاثي صحيح") && isValid;
    isValid = validateInput(phoneNumberInput, phoneNumberError, isValidPhoneNumber, "رقم الهاتف يجب أن يتكون من 10 أرقام") && isValid;
    isValid = validateInput(emailInput, emailError, isValidEmail, "الرجاء ادخال بريد إلكتروني صحيح") && isValid;

    if (!passwordInput.value) {
        passwordInput.classList.add("is-invalid");
        passwordError.innerText = "الرجاء ادخال كلمة المرور";
        passwordError.style.float = "right";
        passwordError.style.paddingBottom = "8px";
        isValid = false;
    } else {
        passwordInput.classList.remove("is-invalid");
        passwordError.innerText = ""; // Clear previous error
        let passwordValid = true;

        if (!/[A-Z]/.test(passwordInput.value)) {
            passwordInput.classList.add("is-invalid");
            passwordError.innerText = "يجب أن تحتوي كلمة المرور على حرف كبير";
            passwordError.style.float = "right";
            passwordError.style.paddingBottom = "8px";
            passwordValid = false;
        } else if (!/[a-z]/.test(passwordInput.value)) {
            passwordInput.classList.add("is-invalid");
            passwordError.innerText = "يجب أن تحتوي كلمة المرور على حرف صغير";
            passwordError.style.float = "right";
            passwordError.style.paddingBottom = "8px";
            passwordValid = false;
        } else if (!/[0-9]/.test(passwordInput.value)) {
            passwordInput.classList.add("is-invalid");
            passwordError.innerText = "يجب أن تحتوي كلمة المرور على رقم";
            passwordError.style.float = "right";
            passwordError.style.paddingBottom = "8px";
            passwordValid = false;
        } else if (passwordInput.value.length < 8) {
            passwordInput.classList.add("is-invalid");
            passwordError.innerText = "يجب أن لا يقل طول كلمة المرور عن 8";
            passwordError.style.float = "right";
            passwordError.style.paddingBottom = "8px";
            passwordValid = false;
        }

        if (!passwordValid) {
            isValid = false;
        }
    }

    isValid = validateInput(organizationInput, organizationError, isNotEmpty, "المنظمة أو النادي مطلوب") && isValid;
    isValid = validateInput(experienceInput, experienceError, isNotEmpty, "سنوات الخبرة مطلوبة") && isValid;
    isValid = validateInput(locationInput, locationError, isNotEmpty, "الموقع مطلوب") && isValid;

    if (isValid) {
        const formData = {
            accountType: this.querySelector('input[name="accountType"]').value,
            name: this.querySelector('input[name="name"]').value,
            phoneNumber: this.querySelector('input[name="phoneNumber"]').value,
            email: this.querySelector('input[name="email"]').value,
            password: this.querySelector('input[name="password"]').value,
            organization: this.querySelector('input[name="organization"]').value,
            experience: this.querySelector('input[name="experience"]').value,
            location: this.querySelector('input[name="location"]').value
        };

        fetch('/createAccount', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => {
            if (response.ok) {
                window.location.href = '/pages/login.html'; // Redirect on success
            } else {
                return response.json().then(data => {
                    if (data && data.message) {
                        errorMessage.innerText = data.message; // Display server-side error
                    } else {
                        errorMessage.innerText = 'حدث خطأ أثناء التسجيل.';
                    }
                    throw new Error(data.message || 'حدث خطأ أثناء التسجيل.');
                });
            }
        })
        .catch(error => {
            console.error('خطأ أثناء التسجيل (كشاف):', error);
        });
    }
});

// Form validation for Player form
document.getElementById("playerForm").addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission

    let isValid = true;
    const nameInput = this.querySelector('input[name="name"]');
    const phoneNumberInput = this.querySelector('input[name="phoneNumber"]');
    const emailInput = this.querySelector('input[name="email"]');
    const passwordInput = this.querySelector('input[name="password"]');
    const birthdateInput = this.querySelector('input[name="birthdate"]');
    const locationInput = this.querySelector('input[name="location"]');
    const playerNameError = document.getElementById('playerNameError');
    const playerPhoneNumberError = document.getElementById('playerPhoneNumberError');
    const playerEmailError = document.getElementById('playerEmailError');
    const playerPasswordError = document.getElementById('playerPasswordError');
    const birthdateError = document.getElementById('birthdateError');
    const playerLocationError = document.getElementById('playerLocationError');

    isValid = validateInput(nameInput, playerNameError, isValidFullName, "الرجاء ادخال اسم ثلاثي صحيح") && isValid;
    isValid = validateInput(phoneNumberInput, playerPhoneNumberError, isValidPhoneNumber, "رقم الهاتف يجب أن يتكون من 10 أرقام") && isValid;
    isValid = validateInput(emailInput, playerEmailError, isValidEmail, "الرجاء ادخال بريد إلكتروني صحيح") && isValid;

    if (!passwordInput.value) {
        passwordInput.classList.add("is-invalid");
        playerPasswordError.innerText = "الرجاء ادخال كلمة المرور";
        playerPasswordError.style.float = "right";
        playerPasswordError.style.paddingBottom = "8px";
        isValid = false;
    } else {
        passwordInput.classList.remove("is-invalid");
        playerPasswordError.innerText = ""; // Clear previous error
        let passwordValid = true;

        if (!/[A-Z]/.test(passwordInput.value)) {
            passwordInput.classList.add("is-invalid");
            playerPasswordError.innerText = "يجب أن تحتوي كلمة المرور على حرف كبير";
            playerPasswordError.style.float = "right";
            playerPasswordError.style.paddingBottom = "8px";
            passwordValid = false;
        } else if (!/[a-z]/.test(passwordInput.value)) {
            passwordInput.classList.add("is-invalid");
            playerPasswordError.innerText = "يجب أن تحتوي كلمة المرور على حرف صغير";
            playerPasswordError.style.float = "right";
            playerPasswordError.style.paddingBottom = "8px";
            passwordValid = false;
        } else if (!/[0-9]/.test(passwordInput.value)) {
            passwordInput.classList.add("is-invalid");
            playerPasswordError.innerText = "يجب أن تحتوي كلمة المرور على رقم";
            playerPasswordError.style.float = "right";
            playerPasswordError.style.paddingBottom = "8px";
            passwordValid = false;
        } else if (passwordInput.value.length < 8) {
            passwordInput.classList.add("is-invalid");
            playerPasswordError.innerText = "يجب أن لا يقل طول كلمة المرور عن 8";
            playerPasswordError.style.float = "right";
            playerPasswordError.style.paddingBottom = "8px";
            passwordValid = false;
        }

        if (!passwordValid) {
            isValid = false;
        }
    }

    isValid = validateInput(birthdateInput, birthdateError, isNotEmpty, "تاريخ الميلاد مطلوب") && isValid;
    isValid = validateInput(locationInput, playerLocationError, isNotEmpty, "الموقع مطلوب") && isValid;

    if (isValid) {
        const formData = {
            accountType: this.querySelector('input[name="accountType"]').value,
            name: this.querySelector('input[name="name"]').value,
            phoneNumber: this.querySelector('input[name="phoneNumber"]').value,
            email: this.querySelector('input[name="email"]').value,
            password: this.querySelector('input[name="password"]').value,
            birthdate: this.querySelector('input[name="birthdate"]').value,
            location: this.querySelector('input[name="location"]').value
        };

        fetch('/createAccount', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => {
            if (response.ok) {
                window.location.href = '/pages/login.html'; // Redirect on success
            } else {
                return response.json().then(data => {
                    if (data && data.message) {
                        errorMessage.innerText = data.message; // Display server-side error
                    } else {
                        errorMessage.innerText = 'حدث خطأ أثناء التسجيل.';
                    }
                    throw new Error(data.message || 'حدث خطأ أثناء التسجيل.');
                });
            }
        })
        .catch(error => {
            console.error('خطأ أثناء التسجيل (لاعب):', error);
            // errorMessage.innerText = 'حدث خطأ أثناء التسجيل: ' + error; // Already handled in .then
        });
    }
});