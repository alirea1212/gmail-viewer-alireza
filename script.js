const mobileBtn = document.getElementById("mobileBtn");
const pcBtn = document.getElementById("pcBtn");

const deviceSelect = document.querySelector(".device-select");
const mainPanel = document.querySelector(".main-panel");

const countries = document.querySelectorAll(".country");

const startTest = document.getElementById("startTest");

const dnsList = document.getElementById("dnsList");

const workingCount = document.getElementById("workingCount");
const deadCount = document.getElementById("deadCount");
const bestPing = document.getElementById("bestPing");

let selectedCountry = "Germany";

let working = 0;
let dead = 0;
let best = 999;

mobileBtn.onclick = () => {

    deviceSelect.classList.add("hidden");
    mainPanel.classList.remove("hidden");

    document.body.style.background = "#020617";

}

pcBtn.onclick = () => {

    deviceSelect.classList.add("hidden");
    mainPanel.classList.remove("hidden");

    document.body.style.background = "#040b1a";

}

countries.forEach(btn => {

    btn.onclick = () => {

        countries.forEach(b => b.classList.remove("active"));

        btn.classList.add("active");

        selectedCountry = btn.dataset.country;

    }

});

function generateDNS(){

    return `${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`;

}

function simulatePing(){

    return Math.floor(Math.random()*200);

}

startTest.onclick = async () => {

    dnsList.innerHTML = "";

    working = 0;
    dead = 0;
    best = 999;

    for(let i=0;i<200;i++){

        let dns = generateDNS();

        let ping = simulatePing();

        let isGood = ping < 120;

        if(isGood){
            working++;
        }else{
            dead++;
        }

        if(ping < best){
            best = ping;
        }

        workingCount.innerText = working;
        deadCount.innerText = dead;
        bestPing.innerText = best + " ms";

        let div = document.createElement("div");

        div.classList.add("dns-item");

        if(isGood){
            div.classList.add("good");
        }else{
            div.classList.add("bad");
        }

        div.innerHTML = `
        
        <h3>${selectedCountry} DNS</h3>

        <p>${dns}</p>

        <div class="ping">Ping: ${ping} ms</div>

        <div class="status">
        ${isGood ? "🟢 WORKING" : "🔴 DEAD"}
        </div>

        `;

        dnsList.appendChild(div);

        await new Promise(resolve => setTimeout(resolve,30));

    }

}
