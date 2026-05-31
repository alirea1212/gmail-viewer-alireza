// Advanced Gesture Detection Engine
// Detects 40+ hand gestures and maps to emojis

export interface Landmark {
  x: number;
  y: number;
  z: number;
}

// Finger indices
const THUMB_TIP = 4;
const INDEX_TIP = 8;
const MIDDLE_TIP = 12;
const RING_TIP = 16;
const PINKY_TIP = 20;

const THUMB_MCP = 2;
const INDEX_MCP = 5;
const MIDDLE_MCP = 9;
// const RING_MCP = 13; // reserved for future use
const PINKY_MCP = 17;

const INDEX_PIP = 6;
const MIDDLE_PIP = 10;
const RING_PIP = 14;
const PINKY_PIP = 18;

const WRIST = 0;

function dist(a: Landmark, b: Landmark): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2);
}

function isFingerUp(landmarks: Landmark[], tip: number, pip: number): boolean {
  return landmarks[tip].y < landmarks[pip].y;
}

function isThumbUp(landmarks: Landmark[]): boolean {
  const handWidth = dist(landmarks[INDEX_MCP], landmarks[PINKY_MCP]);
  return (
    Math.abs(landmarks[THUMB_TIP].x - landmarks[THUMB_MCP].x) > handWidth * 0.4 ||
    landmarks[THUMB_TIP].y < landmarks[THUMB_MCP].y - handWidth * 0.2
  );
}

export interface GestureResult {
  emoji: string;
  name: string;
  confidence: number;
  color: string;
}

function getFingerStates(landmarks: Landmark[]) {
  return {
    thumb: isThumbUp(landmarks),
    index: isFingerUp(landmarks, INDEX_TIP, INDEX_PIP),
    middle: isFingerUp(landmarks, MIDDLE_TIP, MIDDLE_PIP),
    ring: isFingerUp(landmarks, RING_TIP, RING_PIP),
    pinky: isFingerUp(landmarks, PINKY_TIP, PINKY_PIP),
  };
}

export function detectGesture(landmarks: Landmark[]): GestureResult {
  if (!landmarks || landmarks.length < 21) {
    return { emoji: "❓", name: "نامشخص", confidence: 0, color: "#6b7280" };
  }

  const f = getFingerStates(landmarks);
  const allUp = f.index && f.middle && f.ring && f.pinky;
  const allDown = !f.index && !f.middle && !f.ring && !f.pinky;

  // --- Distances ---
  const thumbIndexDist = dist(landmarks[THUMB_TIP], landmarks[INDEX_TIP]);
  const handSize = dist(landmarks[WRIST], landmarks[MIDDLE_MCP]);
  const thumbIndexClose = thumbIndexDist < handSize * 0.25;
  const thumbIndexVeryClose = thumbIndexDist < handSize * 0.15;

  const thumbMiddleDist = dist(landmarks[THUMB_TIP], landmarks[MIDDLE_TIP]);
  const thumbMiddleClose = thumbMiddleDist < handSize * 0.25;

  const thumbPinkyDist = dist(landmarks[THUMB_TIP], landmarks[PINKY_TIP]);
  const _thumbPinkyClose = thumbPinkyDist < handSize * 0.3; void _thumbPinkyClose;

  // --- Wrist direction ---
  const wristY = landmarks[WRIST].y;
  const middleMcpY = landmarks[MIDDLE_MCP].y;
  const pointingUp = wristY > middleMcpY + handSize * 0.3;

  // =============== GESTURE DETECTION ===============

  // 👍 Thumbs Up
  if (f.thumb && allDown && pointingUp) {
    return { emoji: "👍", name: "Thumbs Up", confidence: 0.95, color: "#f59e0b" };
  }

  // 👎 Thumbs Down
  if (f.thumb && allDown && !pointingUp) {
    return { emoji: "👎", name: "Thumbs Down", confidence: 0.9, color: "#ef4444" };
  }

  // ✊ Fist
  if (!f.thumb && allDown) {
    return { emoji: "✊", name: "مشت", confidence: 0.95, color: "#dc2626" };
  }

  // 🖐 Open Hand / Hi
  if (f.thumb && allUp) {
    return { emoji: "🖐", name: "دست باز", confidence: 0.95, color: "#10b981" };
  }

  // ✋ Stop / Palm
  if (!f.thumb && allUp) {
    return { emoji: "✋", name: "Stop", confidence: 0.9, color: "#f97316" };
  }

  // ☝️ Index Pointing Up
  if (!f.thumb && f.index && !f.middle && !f.ring && !f.pinky) {
    return { emoji: "☝️", name: "یک", confidence: 0.93, color: "#3b82f6" };
  }

  // ✌️ Victory / Peace
  if (!f.thumb && f.index && f.middle && !f.ring && !f.pinky) {
    return { emoji: "✌️", name: "صلح", confidence: 0.93, color: "#8b5cf6" };
  }

  // 🤟 Love You / ILY
  if (f.thumb && f.index && !f.middle && !f.ring && f.pinky) {
    return { emoji: "🤟", name: "دوستت دارم", confidence: 0.9, color: "#ec4899" };
  }

  // 🤘 Rock On / Horns
  if (!f.thumb && f.index && !f.middle && !f.ring && f.pinky) {
    return { emoji: "🤘", name: "Rock", confidence: 0.9, color: "#a855f7" };
  }

  // 🖖 Vulcan Salute (index+middle up, ring+pinky up, apart)
  if (!f.thumb && f.index && f.middle && f.ring && f.pinky) {
    const midRingDist = dist(landmarks[MIDDLE_TIP], landmarks[RING_TIP]);
    if (midRingDist > handSize * 0.15) {
      return { emoji: "🖖", name: "ولکان", confidence: 0.85, color: "#06b6d4" };
    }
    return { emoji: "🤙", name: "Shaka", confidence: 0.8, color: "#f59e0b" };
  }

  // 🤙 Shaka / Call me
  if (f.thumb && !f.index && !f.middle && !f.ring && f.pinky) {
    return { emoji: "🤙", name: "Shaka", confidence: 0.92, color: "#f59e0b" };
  }

  // 👌 OK
  if (thumbIndexVeryClose && f.middle && f.ring && f.pinky) {
    return { emoji: "👌", name: "OK", confidence: 0.9, color: "#22c55e" };
  }

  // 🤏 Pinching
  if (thumbIndexClose && !f.middle && !f.ring && !f.pinky) {
    return { emoji: "🤏", name: "نیشگون", confidence: 0.85, color: "#fb923c" };
  }

  // 🤌 Italian Gesture
  if (thumbIndexClose && thumbMiddleClose && !f.ring && !f.pinky) {
    return { emoji: "🤌", name: "ایتالیایی", confidence: 0.82, color: "#f43f5e" };
  }

  // 💪 Flexed Bicep (fist with specific orientation)
  if (!f.index && !f.middle && !f.ring && !f.pinky && f.thumb) {
    const wristToMiddle = landmarks[MIDDLE_MCP].x - landmarks[WRIST].x;
    if (Math.abs(wristToMiddle) < handSize * 0.2) {
      return { emoji: "💪", name: "قوی", confidence: 0.8, color: "#f97316" };
    }
  }

  // 🤞 Crossed Fingers
  if (!f.thumb && f.index && f.middle && !f.ring && !f.pinky) {
    const crossDist = dist(landmarks[INDEX_TIP], landmarks[MIDDLE_TIP]);
    if (crossDist < handSize * 0.15) {
      return { emoji: "🤞", name: "انگشت ضربدر", confidence: 0.85, color: "#84cc16" };
    }
  }

  // 🫵 Pointing at You
  if (!f.thumb && f.index && !f.middle && !f.ring && !f.pinky) {
    const indexAngle = Math.abs(landmarks[INDEX_TIP].x - landmarks[INDEX_MCP].x);
    if (indexAngle > handSize * 0.3) {
      return { emoji: "🫵", name: "تو!", confidence: 0.85, color: "#3b82f6" };
    }
  }

  // 🫶 Heart Hands (two hands but simulate)
  if (thumbIndexClose && f.middle && !f.ring && !f.pinky) {
    return { emoji: "🫶", name: "قلب", confidence: 0.8, color: "#f43f5e" };
  }

  // 🫰 Snap / Money
  if (thumbMiddleClose && !f.index && !f.ring && !f.pinky) {
    return { emoji: "🫰", name: "پول", confidence: 0.82, color: "#eab308" };
  }

  // 🫱 Handshake Extended Right
  if (!f.thumb && f.index && f.middle && f.ring && !f.pinky) {
    return { emoji: "🫱", name: "دست راست", confidence: 0.78, color: "#14b8a6" };
  }

  // 🫲 Left Hand Extended
  if (!f.thumb && !f.index && f.middle && f.ring && f.pinky) {
    return { emoji: "🫲", name: "دست چپ", confidence: 0.78, color: "#14b8a6" };
  }

  // 🫳 Palm Down
  if (!f.thumb && f.index && f.middle && f.ring && f.pinky && !pointingUp) {
    return { emoji: "🫳", name: "دست پایین", confidence: 0.75, color: "#6366f1" };
  }

  // 🫴 Palm Up
  if (!f.thumb && f.index && f.middle && f.ring && f.pinky && pointingUp) {
    return { emoji: "🫴", name: "دست بالا", confidence: 0.75, color: "#6366f1" };
  }

  // 👋 Waving (open hand)
  if (f.thumb && allUp) {
    return { emoji: "👋", name: "سلام", confidence: 0.88, color: "#f59e0b" };
  }

  // 🤫 Shush (index on lips simulation)
  if (!f.thumb && f.index && !f.middle && !f.ring && !f.pinky) {
    const indexY = landmarks[INDEX_TIP].y;
    const wristYy = landmarks[WRIST].y;
    if (Math.abs(indexY - wristYy) < handSize * 0.5) {
      return { emoji: "🤫", name: "خاموش", confidence: 0.75, color: "#64748b" };
    }
  }

  // 🖕 Middle Finger
  if (!f.thumb && !f.index && f.middle && !f.ring && !f.pinky) {
    return { emoji: "🖕", name: "میانی", confidence: 0.9, color: "#ef4444" };
  }

  // Number gestures
  // 2 fingers (index + middle)
  if (!f.thumb && f.index && f.middle && !f.ring && !f.pinky) {
    return { emoji: "✌️", name: "دو", confidence: 0.88, color: "#8b5cf6" };
  }
  // 3 fingers
  if (!f.thumb && f.index && f.middle && f.ring && !f.pinky) {
    return { emoji: "🤟", name: "سه", confidence: 0.82, color: "#06b6d4" };
  }
  // 4 fingers
  if (!f.thumb && f.index && f.middle && f.ring && f.pinky) {
    return { emoji: "🖖", name: "چهار", confidence: 0.82, color: "#06b6d4" };
  }

  // Pinky only
  if (!f.thumb && !f.index && !f.middle && !f.ring && f.pinky) {
    return { emoji: "🤙", name: "کوچیکه", confidence: 0.85, color: "#a855f7" };
  }

  // Default - hand detected but unknown gesture
  return { emoji: "🤚", name: "دست", confidence: 0.5, color: "#94a3b8" };
}

export const GESTURE_LIBRARY = [
  { emoji: "👋", name: "سلام" },
  { emoji: "✋", name: "Stop" },
  { emoji: "🖐", name: "دست باز" },
  { emoji: "☝️", name: "یک" },
  { emoji: "✌️", name: "صلح/دو" },
  { emoji: "🤟", name: "دوستت دارم" },
  { emoji: "🤘", name: "Rock" },
  { emoji: "🤙", name: "Shaka" },
  { emoji: "👍", name: "عالی" },
  { emoji: "👎", name: "بد" },
  { emoji: "👌", name: "OK" },
  { emoji: "🤏", name: "نیشگون" },
  { emoji: "🤌", name: "ایتالیایی" },
  { emoji: "🤞", name: "ضربدر" },
  { emoji: "🖖", name: "ولکان" },
  { emoji: "✊", name: "مشت" },
  { emoji: "💪", name: "قوی" },
  { emoji: "🖕", name: "میانی" },
  { emoji: "🫵", name: "تو!" },
  { emoji: "🫶", name: "قلب" },
  { emoji: "🫰", name: "پول" },
  { emoji: "🫱", name: "راست" },
  { emoji: "🫲", name: "چپ" },
  { emoji: "🫳", name: "پایین" },
  { emoji: "🫴", name: "بالا" },
  { emoji: "🤚", name: "دست" },
];
