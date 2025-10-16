const input = document.getElementById('inputText');
const addBtn = document.getElementById('addBtn');
const spinBtn = document.getElementById('spinBtn');
const message = document.getElementById('message');
const result = document.getElementById('result');
const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');

let options = [];
let rotation = 0;
let spinning = false;

function drawWheel() {
  const num = options.length;
  const arc = (2 * Math.PI) / num;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

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
    ctx.font = "16px Vazirmatn";
    ctx.fillText(options[i], 80, 5);
    ctx.restore();
  }

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

spinBtn.onclick = () => {
  if (spinning) return;
  if (options.length === 0) {
    message.textContent = "گردونه خالی است هوشنگ 😅";
    return;
  }
  message.textContent = "";
  spinning = true;

  let spin = Math.random() * 3600 + 720;
  let current = 0;
  const speed = 20;

  const interval = setInterval(() => {
    rotation = (rotation + speed) % 360;
    canvas.style.transform = `rotate(${rotation}deg)`;
    current += speed;

    if (current >= spin) {
      clearInterval(interval);
      spinning = false;
      const index = Math.floor(((360 - (rotation % 360)) / 360) * options.length) % options.length;
      result.textContent = `🎉 نتیجه: ${options[index]} 🎊`;
    }
  }, 20);
};

drawWheel();
