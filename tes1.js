document.getElementById('calcBtn').addEventListener('click', function() {
    let num1 = parseFloat(prompt("عدد اول را وارد کنید:"));
    let num2 = parseFloat(prompt("عدد دوم را وارد کنید:"));
    
    if (!isNaN(num1) && !isNaN(num2)) {
        alert("جمع دو عدد: " + (num1 + num2));
    } else {
        alert("لطفاً عدد معتبر وارد کنید!");
    }
});
