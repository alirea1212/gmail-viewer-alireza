const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const emojiOutput = document.getElementById("emojiOutput");
const gestureName = document.getElementById("gestureName");
const fpsCounter = document.getElementById("fpsCounter");
const handCount = document.getElementById("handCount");

let lastTime = Date.now();
let frameCount = 0;

/* 🎥 Camera Start */
async function startCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: true
  });

  video.srcObject = stream;

  video.onloadeddata = () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
  };
}

/* 🤖 MediaPipe Hands */
const hands = new Hands({
  locateFile: (file) =>
    `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});

hands.setOptions({
  maxNumHands: 2,
  modelComplexity: 1,
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.7
});

/* 🧠 Gesture Recognition (simple logic) */
function detectGesture(landmarks) {
  const thumb = landmarks[4];
  const index = landmarks[8];
  const middle = landmarks[12];
  const ring = landmarks[16];
  const pinky = landmarks[20];

  const isThumbUp = thumb.y < index.y;
  const isIndexUp = index.y < middle.y;
  const isPinkyUp = pinky.y < ring.y;

  // 👍
  if (isThumbUp && !isIndexUp) {
    return "👍 Like";
  }

  // ✌️
  if (isIndexUp && pinky.y < index.y) {
    return "✌️ Peace";
  }

  // 👊
  if (!isIndexUp && !isPinkyUp) {
    return "👊 Fist";
  }

  // ✋
  if (isIndexUp && middle.y < ring.y && pinky.y < ring.y) {
    return "✋ Open Hand";
  }

  return "🤷 Unknown";
}

/* 😎 Emoji Map */
function gestureToEmoji(gesture) {
  switch (gesture) {
    case "👍 Like":
      return "👍";
    case "✌️ Peace":
      return "✌️";
    case "👊 Fist":
      return "👊";
    case "✋ Open Hand":
      return "✋";
    default:
      return "😐";
  }
}

/* 🎯 Results from MediaPipe */
hands.onResults((results) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  frameCount++;

  // FPS calc
  const now = Date.now();
  if (now - lastTime >= 1000) {
    fpsCounter.innerText = `FPS: ${frameCount}`;
    frameCount = 0;
    lastTime = now;
  }

  let handsDetected = results.multiHandLandmarks.length;
  handCount.innerText = `Hands: ${handsDetected}`;

  if (handsDetected > 0) {
    const landmarks = results.multiHandLandmarks[0];

    const gesture = detectGesture(landmarks);
    const emoji = gestureToEmoji(gesture);

    gestureName.innerText = gesture;
    emojiOutput.innerText = emoji;

    // draw skeleton
    drawConnectors(ctx, landmarks, HAND_CONNECTIONS, {
      color: "#6be7ff",
      lineWidth: 2
    });

    drawLandmarks(ctx, landmarks, {
      color: "#8b7bff",
      lineWidth: 1
    });
  } else {
    gestureName.innerText = "No Hand";
    emojiOutput.innerText = "😐";
  }
});

/* 📡 Camera loop */
const camera = new Camera(video, {
  onFrame: async () => {
    await hands.send({ image: video });
  },
  width: 1280,
  height: 720
});

/* 🚀 Start everything */
startCamera();
camera.start();
