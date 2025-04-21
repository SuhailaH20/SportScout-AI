document.addEventListener('DOMContentLoaded', function () {
  const loginForm = document.querySelector('form');
  const phoneNumberInput = document.querySelector('input[name="phoneNumber"]');
  const passwordInput = document.querySelector('input[name="password"]');
  const phoneNumberError = document.getElementById('phoneNumberError');
  const passwordError = document.getElementById('passwordError');
  const errorMessage = document.getElementById('errorMessage'); // العنصر لعرض رسائل الخطأ العامة

  loginForm.addEventListener('submit', function (event) {
      event.preventDefault();

      let isValid = true;
      phoneNumberError.innerText = "";
      passwordError.innerText = "";
      errorMessage.innerText = "";

      if (!phoneNumberInput.value.trim()) {
          phoneNumberError.innerText = "رقم الهاتف مطلوب.";
          isValid = false;
      } else if (isNaN(phoneNumberInput.value) || phoneNumberInput.value.length !== 10) {
          phoneNumberError.innerText = "رقم الهاتف يجب أن يكون 10 أرقام.";
          isValid = false;
      }

      if (!passwordInput.value.trim()) {
          passwordError.innerText = "كلمة المرور مطلوبة.";
          isValid = false;
      }

      if (isValid) {
          fetch('/login', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                  phoneNumber: phoneNumberInput.value,
                  password: passwordInput.value,
              }),
          })
          .then(async response => {
              const data = await response.json();
              if (!response.ok) {
                  throw new Error(data.message || 'حدث خطأ');
              }
              return data;
          })
          .then(data => {
              if (data.success) {
                  window.location.href = '/main';
              } else {
                  errorMessage.innerText = data.message;
              }
          })
          .catch(error => {
              errorMessage.innerText = error.message;
          });
      }
  });

  phoneNumberInput.addEventListener('input', () => phoneNumberError.innerText = "");
  passwordInput.addEventListener('input', () => passwordError.innerText = "");
});