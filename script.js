function updateClock(){

let now = new Date()

let time = now.toLocaleTimeString('fa-IR')

document.getElementById('clock').innerHTML = time

}

setInterval(updateClock,1000)

updateClock()



let today = new Date()

document.getElementById('date').innerHTML =
today.toLocaleDateString('fa-IR')



function calculate(){

let n1 =
parseFloat(document.getElementById('num1').value)

let n2 =
parseFloat(document.getElementById('num2').value)

let result = n1 + n2

document.getElementById('calcResult').innerHTML =
"نتیجه : " + result

}



function convertTemp(){

let c =
document.getElementById('temp').value

let f = (c * 9/5) + 32

document.getElementById('tempResult').innerHTML =
f + " °F"

}



function randomNumber(){

let rand =
Math.floor(Math.random() * 1000)

document.getElementById('randomResult').innerHTML =
rand

}



function quoteGenerator(){

let quotes = [

"موفقیت از تلاش ساخته میشود",

"هیچ چیز غیر ممکن نیست",

"قوی باش",

"امروز بهتر از دیروز باش",

"تو میتوانی"

]

let random =
quotes[Math.floor(Math.random()*quotes.length)]

document.getElementById('quote').innerHTML =
random

}



function toggleMode(){

document.body.classList.toggle('dark')

}



function convertMeter(){

let meter =
document.getElementById('meter').value

let result = meter * 100

document.getElementById('meterResult').innerHTML =
result + " سانتی متر"

}



function startTimer(){

let seconds =
document.getElementById('seconds').value

let timer =
setInterval(function(){

seconds--

document.getElementById('timer').innerHTML =
seconds + " ثانیه"

if(seconds <= 0){

clearInterval(timer)

document.getElementById('timer').innerHTML =
"تمام شد"

}

},1000)

}



async function batteryInfo(){

if(navigator.getBattery){

let battery =
await navigator.getBattery()

let level =
battery.level * 100

document.getElementById('battery').innerHTML =
level + "%"

}else{

document.getElementById('battery').innerHTML =
"مرورگر پشتیبانی نمیکند"

}

}
