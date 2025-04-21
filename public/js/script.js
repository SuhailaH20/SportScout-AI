 // JavaScript to toggle between Scout and Player forms
 const scoutBtn = document.getElementById("scoutBtn");
 const playerBtn = document.getElementById("playerBtn");
 const scoutForm = document.getElementById("scoutForm");
 const playerForm = document.getElementById("playerForm");

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

 // Function to validate a single input field
 function validateField(inputElement, errorElement, errorMessage) {
     if (!inputElement.value.trim()) {
         inputElement.classList.add('is-invalid');
         errorElement.innerText = errorMessage;
         errorElement.style.float = "right";
         return false;
     } else {
         inputElement.classList.remove('is-invalid');
         errorElement.innerText = "";
         return true;
     }
 }

 // Function to validate phone number field
 function validatePhoneNumber(inputElement, errorElement, errorMessage) {
     if (!inputElement.value || isNaN(inputElement.value)) {
         inputElement.classList.add('is-invalid');
         errorElement.innerText = errorMessage;
         errorElement.style.float = "right";
         return false;
     } else if (inputElement.value.length !== 10) {
         inputElement.classList.add('is-invalid');
         errorElement.innerText = "رقم الهاتف يجب أن يتكون من 10 أرقام.";
         errorElement.style.float = "right";
         return false;
     } else {
         inputElement.classList.remove('is-invalid');
         errorElement.innerText = "";
         return true;
     }
 }

 // Form validation for Scout form
 document.getElementById("scoutForm").addEventListener('submit', function(event) {
     let valid = true;

     // Validate Name
     const scoutNameInput = this.querySelector('input[name="name"]');
     const scoutNameError = document.getElementById('nameError');
     valid = validateField(scoutNameInput, scoutNameError, "الاسم الكامل مطلوب") && valid;

     // Validate Phone Number
     const scoutPhoneNumberInput = this.querySelector('input[name="phoneNumber"]');
     const scoutPhoneNumberError = document.getElementById('phoneNumberError');
     valid = validatePhoneNumber(scoutPhoneNumberInput, scoutPhoneNumberError, "رقم الهاتف مطلوب");

     // Validate Email
     const scoutEmailInput = this.querySelector('input[name="email"]');
     const scoutEmailError = document.getElementById('emailError');
     valid = validateField(scoutEmailInput, scoutEmailError, "البريد الإلكتروني مطلوب") && valid;

     // Validate Password
     const scoutPasswordInput = this.querySelector('input[name="password"]');
     const scoutPasswordError = document.getElementById('passwordError');
     valid = validateField(scoutPasswordInput, scoutPasswordError, "كلمة المرور مطلوبة.") && valid;

     // Validate Organization
     const scoutOrganizationInput = this.querySelector('input[name="organization"]');
     const scoutOrganizationError = document.getElementById('organizationError');
     valid = validateField(scoutOrganizationInput, scoutOrganizationError, "المنظمة أو النادي مطلوب") && valid;

     // Validate Experience
     const scoutExperienceInput = this.querySelector('input[name="experience"]');
     const scoutExperienceError = document.getElementById('experienceError');
     valid = validateField(scoutExperienceInput, scoutExperienceError, "سنوات الخبرة مطلوبة") && valid;

     // Validate Location
     const scoutLocationInput = this.querySelector('input[name="location"]');
     const scoutLocationError = document.getElementById('locationError');
     valid = validateField(scoutLocationInput, scoutLocationError, "الموقع مطلوب") && valid;

     // Prevent form submission if any validation failed
     if (!valid) {
         event.preventDefault();
     }
 });

 // Form validation for Player form
 document.getElementById("playerForm").addEventListener('submit', function(event) {
     let valid = true;

     // Validate Name
     const playerNameInput = this.querySelector('input[name="name"]');
     const playerNameError = document.getElementById('playerNameError');
     valid = validateField(playerNameInput, playerNameError, "الاسم الكامل مطلوب") && valid;

     // Validate Phone Number
     const playerPhoneNumberInput = this.querySelector('input[name="phoneNumber"]');
     const playerPhoneNumberError = document.getElementById('playerPhoneNumberError');
     valid = validatePhoneNumber(playerPhoneNumberInput, playerPhoneNumberError, "رقم الهاتف مطلوب");

     // Validate Email
     const playerEmailInput = this.querySelector('input[name="email"]');
     const playerEmailError = document.getElementById('playerEmailError');
     valid = validateField(playerEmailInput, playerEmailError, "البريد الإلكتروني مطلوب") && valid;

     // Validate Password
     const playerPasswordInput = this.querySelector('input[name="password"]');
     const playerPasswordError = document.getElementById('playerPasswordError');
     valid = validateField(playerPasswordInput, playerPasswordError, "كلمة المرور مطلوبة.") && valid;

     // Validate Birthdate
     const playerBirthdateInput = this.querySelector('input[name="birthdate"]');
     const playerBirthdateError = document.getElementById('birthdateError');
     valid = validateField(playerBirthdateInput, playerBirthdateError, "تاريخ الميلاد مطلوب") && valid;

     // Validate Location
     const playerLocationInput = this.querySelector('input[name="location"]');
     const playerLocationError = document.getElementById('playerLocationError');
     valid = validateField(playerLocationInput, playerLocationError, "الموقع مطلوب") && valid;

     // Prevent form submission if any validation failed
     if (!valid) {
         event.preventDefault();
     } 
 });