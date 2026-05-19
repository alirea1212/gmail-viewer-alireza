// پیدا کردن دکمه و پاراگراف نتیجه در HTML
const button = document.getElementById("actionBtn");
const resultText = document.getElementById("resultText");

// اضافه کردن قابلیت کلیک به دکمه
button.addEventListener("click", function() {
    // متنی که بعد از کلیک نمایش داده می‌شود
    resultText.innerText = "آماده مسابقه در پارک! پیچ‌گوشتی و انبردست هم همیشه همراهمه. 🛠️🚴‍♂️";
    
    // تغییر رنگ دکمه بعد از کلیک برای جلوه بهتر
    button.style.backgroundColor = "#27ae60";
    button.innerText = "مهارت‌ها تایید شد!";
});
