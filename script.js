// انتخاب عناصر صفحه
const loginBtn = document.getElementById('login-btn');
const passwordInput = document.getElementById('password-input');
const errorMessage = document.getElementById('error-message');
const loginSection = document.getElementById('login-section');
const mainContent = document.getElementById('main-content');

// تابع بررسی رمز عبور
function checkPassword() {
    const password = passwordInput.value;
    
    // رمز عبور درخواستی شما: 26
    if (password === '26') {
        // مخفی کردن ارور در صورت وجود
        errorMessage.classList.add('hidden');
        
        // افکت محو شدن صفحه ورود
        loginSection.style.opacity = '0';
        
        setTimeout(() => {
            // بعد از نیم ثانیه، فرم ورود کاملا حذف و سایت اصلی نمایش داده می‌شود
            loginSection.style.display = 'none';
            mainContent.classList.remove('hidden');
        }, 500);
        
    } else {
        // نمایش اخطار با انیمیشن لرزش
        errorMessage.classList.remove('hidden');
        passwordInput.value = ''; // پاک کردن فیلد
        
        // افکت لرزش برای رمز اشتباه
        loginSection.style.transform = 'translateX(-10px)';
        setTimeout(() => loginSection.style.transform = 'translateX(10px)', 100);
        setTimeout(() => loginSection.style.transform = 'translateX(-10px)', 200);
        setTimeout(() => loginSection.style.transform = 'translateX(0)', 300);
    }
}

// اجرای تابع با کلیک روی دکمه ورود
loginBtn.addEventListener('click', checkPassword);

// اجرای تابع با زدن دکمه Enter روی کیبورد
passwordInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        checkPassword();
    }
});
