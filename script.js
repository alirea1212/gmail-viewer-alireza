const input = document.getElementById('inputText');
const addBtn = document.getElementById('addBtn');
const removeBtn = document.getElementById('removeBtn');
const spinBtn = document.getElementById('spinBtn');
const message = document.getElementById('message');
const result = document.getElementById('result');
const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');
const spinSound = document.getElementById('spinSound');
const winSound = document.getElementById('winSound');

let options = [];
let rotation = 0;
let spinning = false;

function drawWheel() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const num = options.length;
  if (num === 0) return;

  const arc = (2 * Math.PI) / num;
  for (let i = 0; i < num; i++) {
    const start = i * arc;
    ctx.beginPath();
    ctx.fillStyle = `hsl(${(i * 360) / num}, 80%, 60%)`;
    ctx.moveTo(200, 200);
    ctx.arc(200, 200, 200, start, start + arc);
    ctx.fill();

    ctx.save();
    ctx.translate(200, 200);
    ctx.rotate(start + arc / 2);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 16px Vazirmatn";
    ctx.fillText(options[i], 90, 5);
    ctx.restore();
  }

  // فلش بالا
  ctx.beginPath();
  ctx.moveTo(200, 0);
  ctx.lineTo(190, 30);
  ctx.lineTo(210, 30);
  ctx.fillStyle = "black";
  ctx.fill();
}

addBtn.onclick = () => {
  const val = input.value.trim();
  if (!val) return;
  options.push(val);
  input.value = "";
  message.textContent = "";
  drawWheel();
};

removeBtn.onclick = () => {
  if (options.length > 0) {
    options.pop();
    drawWheel();
    message.textContent = "آخرین گزینه حذف شد ❌";
    setTimeout(() => (message.textContent = ""), 2000);
  } else {
    message.textContent = "هیچ گزینه‌ای برای حذف نیست 😅";
  }
};

spinBtn.onclick = () => {
  if (spinning) return;
  if (options.length === 0) {
    message.textContent = "گردونه خالی است هوشنگ 😅";
    return;
  }

  spinning = true;
  message.textContent = "";
  result.textContent = "";

  // صدای چرخیدن
  spinSound.currentTime = 0;
  spinSound.play();

  const randomExtra = Math.random() * 360;
  const spin = 3600 + randomExtra; // 10 دور کامل به بالا
  rotation = (rotation + spin) % 360;

  canvas.style.transition = "transform 10s cubic-bezier(0.08, 0.85, 0.2, 1)";
  canvas.style.transform = `rotate(${rotation}deg)`;

  setTimeout(() => {
    spinning = false;
    spinSound.pause();
    winSound.play();

    const index = Math.floor(((360 - (rotation % 360)) / 360) * options.length) % options.length;
    result.textContent = `🎉 برنده: ${options[index]} 🎊`;
  }, 10000); // دقیقاً 10 ثانیه
};

drawWheel();
