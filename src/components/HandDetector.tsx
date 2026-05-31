import { useEffect, useRef, useState, useCallback } from "react";
import { DeviceMode } from "../App";
import { detectGesture, GestureResult, GESTURE_LIBRARY, Landmark } from "../utils/gestureDetector";
import EmojiPanel from "./EmojiPanel";
import GestureGuide from "./GestureGuide";

declare global {
  interface Window {
    Hands: any;
    Camera: any;
    drawConnectors: any;
    drawLandmarks: any;
    HAND_CONNECTIONS: any;
  }
}

interface Props {
  deviceMode: DeviceMode;
  onBack: () => void;
}

const LOADING_STEPS = [
  "بارگذاری MediaPipe AI...",
  "آماده‌سازی مدل دست...",
  "اتصال به دوربین...",
  "آماده! 🚀",
];

export default function HandDetector({ deviceMode, onBack }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handsRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number>(0);

  const [currentGesture, setCurrentGesture] = useState<GestureResult | null>(null);
  const [recentEmojis, setRecentEmojis] = useState<GestureResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string>("");
  const [fps, setFps] = useState(0);
  const [handVisible, setHandVisible] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [emojiBurst, setEmojiPop] = useState<{ emoji: string; id: number } | null>(null);
  const [totalDetected, setTotalDetected] = useState(0);

  const fpsCounterRef = useRef({ frames: 0, last: Date.now() });
  const lastGestureRef = useRef<string>("");
  const gestureHoldRef = useRef<number>(0);
  const burstIdRef = useRef(0);

  const addEmojiToRecent = useCallback((gesture: GestureResult) => {
    setRecentEmojis((prev) => [gesture, ...prev.slice(0, 19)]);
    setTotalDetected((n) => n + 1);
  }, []);

  const onResults = useCallback(
    (results: any) => {
      // FPS counter
      const now = Date.now();
      fpsCounterRef.current.frames++;
      if (now - fpsCounterRef.current.last > 1000) {
        setFps(fpsCounterRef.current.frames);
        fpsCounterRef.current.frames = 0;
        fpsCounterRef.current.last = now;
      }

      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (!canvas || !video) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        setHandVisible(true);
        const landmarks = results.multiHandLandmarks[0] as Landmark[];

        // Draw custom hand skeleton
        if (window.drawConnectors && window.HAND_CONNECTIONS) {
          window.drawConnectors(ctx, landmarks, window.HAND_CONNECTIONS, {
            color: "rgba(99,179,237,0.85)",
            lineWidth: 3,
          });
        }

        // Draw landmark points with glow
        if (window.drawLandmarks) {
          window.drawLandmarks(ctx, landmarks, {
            color: "rgba(147,197,253,1)",
            fillColor: "rgba(59,130,246,0.9)",
            lineWidth: 2,
            radius: 5,
          });
        }

        const gesture = detectGesture(landmarks);
        setCurrentGesture(gesture);

        // Hold detection
        if (gesture.emoji === lastGestureRef.current) {
          gestureHoldRef.current++;
          if (gestureHoldRef.current === 10) {
            addEmojiToRecent(gesture);
            burstIdRef.current++;
            setEmojiPop({ emoji: gesture.emoji, id: burstIdRef.current });
            setTimeout(() => setEmojiPop(null), 1000);
          }
        } else {
          lastGestureRef.current = gesture.emoji;
          gestureHoldRef.current = 0;
        }
      } else {
        setHandVisible(false);
        setCurrentGesture(null);
        lastGestureRef.current = "";
        gestureHoldRef.current = 0;
      }
    },
    [addEmojiToRecent]
  );

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        setLoadingStep(0);
        // Wait for MediaPipe Hands
        let attempts = 0;
        while (!window.Hands && attempts < 50) {
          await new Promise((r) => setTimeout(r, 200));
          attempts++;
        }
        if (!window.Hands) throw new Error("MediaPipe بارگذاری نشد. اینترنت را بررسی کنید.");
        if (cancelled) return;

        setLoadingStep(1);
        const hands = new window.Hands({
          locateFile: (file: string) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
        });

        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: deviceMode === "mobile" ? 0 : 1,
          minDetectionConfidence: 0.7,
          minTrackingConfidence: 0.6,
        });

        hands.onResults(onResults);
        handsRef.current = hands;

        setLoadingStep(2);
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: deviceMode === "mobile" ? 640 : 1280 },
            height: { ideal: deviceMode === "mobile" ? 480 : 720 },
            frameRate: { ideal: 30, max: 30 },
          },
        });

        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;

        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();

        setLoadingStep(3);
        await new Promise((r) => setTimeout(r, 500));

        if (window.Camera) {
          const camera = new window.Camera(video, {
            onFrame: async () => {
              if (handsRef.current) {
                await handsRef.current.send({ image: video });
              }
            },
            width: deviceMode === "mobile" ? 640 : 1280,
            height: deviceMode === "mobile" ? 480 : 720,
          });
          cameraRef.current = camera;
          camera.start();
        } else {
          const processFrame = async () => {
            if (handsRef.current && video.readyState === 4) {
              await handsRef.current.send({ image: video });
            }
            animFrameRef.current = requestAnimationFrame(processFrame);
          };
          animFrameRef.current = requestAnimationFrame(processFrame);
        }

        if (!cancelled) setIsLoading(false);
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || "خطا در دسترسی به دوربین");
          setIsLoading(false);
        }
      }
    };

    init();

    return () => {
      cancelled = true;
      if (cameraRef.current) {
        try { cameraRef.current.stop(); } catch {}
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (handsRef.current) {
        try { handsRef.current.close(); } catch {}
      }
    };
  }, [deviceMode, onResults]);

  const progressPct = ((loadingStep + 1) / LOADING_STEPS.length) * 100;

  return (
    <div
      className="relative flex min-h-screen w-full overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #020209 0%, #080818 50%, #020209 100%)",
        fontFamily: "'Vazirmatn', sans-serif",
      }}
    >
      {/* === LEFT EMOJI PANEL === */}
      <EmojiPanel recentEmojis={recentEmojis} />

      {/* === MAIN CAMERA AREA === */}
      <div className="flex-1 flex flex-col items-center justify-start relative p-3 sm:p-4 overflow-y-auto" style={{ minWidth: 0 }}>

        {/* TOP BAR */}
        <div className="w-full flex items-center justify-between mb-3 px-1 flex-wrap gap-2" style={{ maxWidth: "960px" }}>
          <button
            onClick={onBack}
            className="flex items-center gap-2 rounded-xl px-4 py-2 font-semibold text-sm flex-shrink-0"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.7)",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.12)";
              e.currentTarget.style.color = "white";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.06)";
              e.currentTarget.style.color = "rgba(255,255,255,0.7)";
            }}
          >
            ← برگشت
          </button>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            {/* FPS */}
            <div
              className="flex items-center gap-1 rounded-full px-3 py-1 text-xs font-mono font-bold"
              style={{
                background: fps > 20 ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
                border: `1px solid ${fps > 20 ? "rgba(16,185,129,0.4)" : "rgba(239,68,68,0.4)"}`,
                color: fps > 20 ? "#34d399" : "#f87171",
              }}
            >
              ⚡ {fps} FPS
            </div>

            {/* Hand status */}
            <div
              className="flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold"
              style={{
                background: handVisible ? "rgba(16,185,129,0.15)" : "rgba(100,116,139,0.15)",
                border: `1px solid ${handVisible ? "rgba(16,185,129,0.4)" : "rgba(100,116,139,0.3)"}`,
                color: handVisible ? "#34d399" : "#94a3b8",
              }}
            >
              <span
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background: handVisible ? "#34d399" : "#64748b",
                  display: "inline-block",
                  animation: handVisible ? "pulseDot 1.5s ease-in-out infinite" : "none",
                }}
              />
              {handVisible ? "✋ شناسایی شد" : "دست نشان بده"}
            </div>

            {/* Total */}
            {totalDetected > 0 && (
              <div
                className="flex items-center gap-1 rounded-full px-3 py-1 text-xs"
                style={{
                  background: "rgba(245,158,11,0.15)",
                  border: "1px solid rgba(245,158,11,0.35)",
                  color: "#fbbf24",
                }}
              >
                🎯 {totalDetected} ژست
              </div>
            )}

            {/* Mode badge */}
            <div
              className="flex items-center gap-1 rounded-full px-3 py-1 text-xs"
              style={{
                background: "rgba(99,102,241,0.15)",
                border: "1px solid rgba(99,102,241,0.35)",
                color: "#a5b4fc",
              }}
            >
              {deviceMode === "mobile" ? "📱 موبایل" : "🖥️ کامپیوتر"}
            </div>

            {/* Guide */}
            <button
              onClick={() => setShowGuide(true)}
              className="rounded-full px-3 py-1 text-xs font-semibold"
              style={{
                background: "rgba(251,191,36,0.15)",
                border: "1px solid rgba(251,191,36,0.35)",
                color: "#fbbf24",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(251,191,36,0.25)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(251,191,36,0.15)";
              }}
            >
              📖 راهنما
            </button>
          </div>
        </div>

        {/* Camera + Canvas Container */}
        <div
          className="relative rounded-3xl overflow-hidden w-full"
          style={{
            maxWidth: "960px",
            aspectRatio: deviceMode === "mobile" ? "4/3" : "16/9",
            background: "#000814",
            boxShadow: currentGesture && !isLoading
              ? `0 0 80px ${currentGesture.color}35, 0 0 160px ${currentGesture.color}15, inset 0 0 60px rgba(0,0,0,0.3)`
              : "0 0 60px rgba(0,0,0,0.5), inset 0 0 60px rgba(0,0,0,0.3)",
            border: currentGesture && !isLoading
              ? `2px solid ${currentGesture.color}55`
              : "2px solid rgba(255,255,255,0.07)",
            transition: "box-shadow 0.5s ease, border-color 0.5s ease",
          }}
        >
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            playsInline
            muted
            style={{ opacity: 0, position: "absolute" }}
          />
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
            style={{
              transform: "scaleX(-1)",
              objectFit: "cover",
            }}
          />

          {/* Emoji Burst Animation */}
          {emojiBurst && (
            <div
              key={emojiBurst.id}
              style={{
                position: "absolute",
                top: "15%",
                left: "50%",
                fontSize: "6rem",
                zIndex: 30,
                pointerEvents: "none",
                animation: "emojiBurst 1s cubic-bezier(0.16,1,0.3,1) forwards",
                transform: "translateX(-50%)",
              }}
            >
              {emojiBurst.emoji}
            </div>
          )}

          {/* Corner Brackets */}
          {!isLoading && !error && (
            <>
              {[
                { top: "12px", left: "12px", bt: true, bl: true },
                { top: "12px", right: "12px", bt: true, br: true },
                { bottom: "12px", left: "12px", bb: true, bl: true },
                { bottom: "12px", right: "12px", bb: true, br: true },
              ].map((c, i) => (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    width: "28px",
                    height: "28px",
                    top: c.top,
                    bottom: c.bottom,
                    left: c.left,
                    right: c.right,
                    borderTop: c.bt ? "3px solid rgba(99,179,237,0.9)" : undefined,
                    borderBottom: c.bb ? "3px solid rgba(99,179,237,0.9)" : undefined,
                    borderLeft: c.bl ? "3px solid rgba(99,179,237,0.9)" : undefined,
                    borderRight: c.br ? "3px solid rgba(99,179,237,0.9)" : undefined,
                    zIndex: 5,
                  }}
                />
              ))}
              {/* Scanning line */}
              {handVisible && (
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    height: "2px",
                    background: "linear-gradient(90deg, transparent, rgba(99,179,237,0.6), transparent)",
                    zIndex: 5,
                    animation: "scanLine 3s ease-in-out infinite",
                  }}
                />
              )}
            </>
          )}

          {/* Loading Overlay */}
          {isLoading && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "24px",
                background: "rgba(2,2,9,0.95)",
                zIndex: 20,
              }}
            >
              {/* AI Brain animation */}
              <div style={{ position: "relative", width: "100px", height: "100px" }}>
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    border: "3px solid transparent",
                    borderTop: "3px solid #7c3aed",
                    borderRight: "3px solid #2563eb",
                    animation: "spin 1s linear infinite",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: "12px",
                    borderRadius: "50%",
                    border: "2px solid transparent",
                    borderBottom: "2px solid #06b6d4",
                    animation: "spin 1.5s linear infinite reverse",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "2.5rem",
                  }}
                >
                  🤖
                </div>
              </div>

              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    color: "white",
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    marginBottom: "8px",
                    fontFamily: "'Vazirmatn', sans-serif",
                  }}
                >
                  {LOADING_STEPS[loadingStep]}
                </div>
                <div
                  style={{
                    width: "280px",
                    height: "6px",
                    background: "rgba(255,255,255,0.1)",
                    borderRadius: "9999px",
                    overflow: "hidden",
                    margin: "0 auto",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${progressPct}%`,
                      background: "linear-gradient(90deg, #7c3aed, #2563eb, #06b6d4)",
                      borderRadius: "9999px",
                      transition: "width 0.5s ease",
                    }}
                  />
                </div>
                <div
                  style={{
                    color: "rgba(255,255,255,0.4)",
                    fontSize: "0.8rem",
                    marginTop: "8px",
                    fontFamily: "'Vazirmatn', sans-serif",
                  }}
                >
                  گام {loadingStep + 1} از {LOADING_STEPS.length}
                </div>
              </div>
            </div>
          )}

          {/* Error Overlay */}
          {error && !isLoading && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "16px",
                background: "rgba(2,2,9,0.97)",
                zIndex: 20,
                padding: "24px",
              }}
            >
              <span style={{ fontSize: "4rem" }}>📷</span>
              <div style={{ color: "#f87171", fontSize: "1.1rem", fontWeight: 700, fontFamily: "'Vazirmatn', sans-serif" }}>
                خطا در دسترسی به دوربین
              </div>
              <div
                style={{
                  color: "rgba(255,255,255,0.5)",
                  fontSize: "0.85rem",
                  textAlign: "center",
                  maxWidth: "320px",
                  fontFamily: "'Vazirmatn', sans-serif",
                  lineHeight: 1.8,
                }}
              >
                {error}
                <br />
                <br />
                اطمینان حاصل کنید که:
                <br />
                • مرورگر به دوربین دسترسی دارد
                <br />
                • از HTTPS یا localhost استفاده می‌کنید
                <br />
                • دوربین دیگری آن را استفاده نمی‌کند
              </div>
              <button
                onClick={() => window.location.reload()}
                style={{
                  background: "linear-gradient(135deg, #7c3aed, #2563eb)",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  padding: "12px 28px",
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "'Vazirmatn', sans-serif",
                  marginTop: "8px",
                }}
              >
                🔄 تلاش مجدد
              </button>
            </div>
          )}
        </div>

        {/* Current Gesture Card */}
        <div
          className="w-full mt-4"
          style={{ maxWidth: "960px" }}
        >
          {currentGesture && !isLoading && !error ? (
            <div
              className="flex flex-col sm:flex-row items-center gap-5 rounded-3xl px-8 py-5"
              style={{
                background: `linear-gradient(135deg, ${currentGesture.color}18, ${currentGesture.color}08)`,
                border: `1px solid ${currentGesture.color}40`,
                transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
              }}
            >
              <div
                style={{
                  fontSize: "5rem",
                  filter: `drop-shadow(0 0 30px ${currentGesture.color}80)`,
                  animation: "bounceEmoji 0.4s ease",
                  lineHeight: 1,
                  flexShrink: 0,
                }}
              >
                {currentGesture.emoji}
              </div>
              <div className="flex-1 text-center sm:text-right">
                <div style={{ color: "white", fontSize: "1.8rem", fontWeight: 900, lineHeight: 1.2 }}>
                  {currentGesture.name}
                </div>
                <div className="flex items-center gap-3 mt-2 justify-center sm:justify-start flex-wrap">
                  <div
                    className="text-sm font-semibold"
                    style={{ color: currentGesture.color }}
                  >
                    دقت: {Math.round(currentGesture.confidence * 100)}%
                  </div>
                  <div
                    style={{
                      height: "8px",
                      width: "120px",
                      background: "rgba(255,255,255,0.08)",
                      borderRadius: "9999px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${currentGesture.confidence * 100}%`,
                        background: currentGesture.color,
                        borderRadius: "9999px",
                        transition: "width 0.4s ease",
                        boxShadow: `0 0 10px ${currentGesture.color}80`,
                      }}
                    />
                  </div>
                </div>
                <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.75rem", marginTop: "6px" }}>
                  ✨ ژست را ثابت نگه دار تا ذخیره شود
                </div>
              </div>

              {/* Hold progress ring */}
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  background: `conic-gradient(${currentGesture.color} ${(gestureHoldRef.current / 10) * 360}deg, rgba(255,255,255,0.05) 0deg)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  transition: "background 0.1s",
                }}
              >
                <div
                  style={{
                    width: "46px",
                    height: "46px",
                    borderRadius: "50%",
                    background: "#020209",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.5rem",
                  }}
                >
                  {currentGesture.emoji}
                </div>
              </div>
            </div>
          ) : !isLoading && !error ? (
            <div
              className="flex flex-col items-center gap-3 rounded-3xl py-8"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px dashed rgba(255,255,255,0.1)",
              }}
            >
              <span
                style={{
                  fontSize: "3rem",
                  animation: "waveHand 1.5s ease-in-out infinite",
                  display: "inline-block",
                }}
              >
                👋
              </span>
              <p style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'Vazirmatn', sans-serif" }}>
                دست خود را جلوی دوربین بگیر!
              </p>
            </div>
          ) : null}
        </div>

        {/* Mobile Gesture Library (horizontal scroll) */}
        <div
          className="w-full mt-4 lg:hidden"
          style={{ maxWidth: "960px" }}
        >
          <div
            className="text-xs font-bold mb-2"
            style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'Vazirmatn', sans-serif" }}
          >
            📚 ژست‌های پشتیبانی‌شده:
          </div>
          <div
            style={{
              display: "flex",
              gap: "8px",
              overflowX: "auto",
              paddingBottom: "8px",
            }}
          >
            {GESTURE_LIBRARY.map((g, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-1 rounded-2xl p-3 flex-shrink-0"
                style={{
                  background:
                    currentGesture?.emoji === g.emoji
                      ? "rgba(99,179,237,0.2)"
                      : "rgba(255,255,255,0.04)",
                  border:
                    currentGesture?.emoji === g.emoji
                      ? "1px solid rgba(99,179,237,0.5)"
                      : "1px solid rgba(255,255,255,0.07)",
                  transition: "all 0.3s",
                  minWidth: "60px",
                }}
              >
                <span style={{ fontSize: "1.6rem" }}>{g.emoji}</span>
                <span
                  style={{
                    color: "rgba(255,255,255,0.5)",
                    fontSize: "0.6rem",
                    whiteSpace: "nowrap",
                    fontFamily: "'Vazirmatn', sans-serif",
                  }}
                >
                  {g.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Spacer for creator badge */}
        <div style={{ height: "80px" }} />
      </div>

      {/* === RIGHT GESTURE LIBRARY (Desktop) === */}
      <div
        className="hidden lg:flex flex-col gap-2 overflow-y-auto py-6 px-3"
        style={{
          width: "190px",
          background: "rgba(255,255,255,0.02)",
          borderLeft: "1px solid rgba(255,255,255,0.06)",
          flexShrink: 0,
        }}
      >
        <div
          className="text-center text-xs font-bold pb-3 mb-1"
          style={{
            color: "rgba(255,255,255,0.4)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            fontFamily: "'Vazirmatn', sans-serif",
          }}
        >
          📚 ژست‌های موجود
        </div>
        {GESTURE_LIBRARY.map((g, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-xl px-3 py-2 cursor-default"
            style={{
              background:
                currentGesture?.emoji === g.emoji
                  ? "rgba(99,179,237,0.15)"
                  : "rgba(255,255,255,0.025)",
              border:
                currentGesture?.emoji === g.emoji
                  ? "1px solid rgba(99,179,237,0.5)"
                  : "1px solid rgba(255,255,255,0.05)",
              transition: "all 0.3s ease",
              transform: currentGesture?.emoji === g.emoji ? "translateX(-3px)" : "none",
            }}
          >
            <span style={{ fontSize: "1.3rem", flexShrink: 0 }}>{g.emoji}</span>
            <span
              style={{
                color: currentGesture?.emoji === g.emoji
                  ? "rgba(147,210,255,0.9)"
                  : "rgba(255,255,255,0.5)",
                fontSize: "0.7rem",
                fontFamily: "'Vazirmatn', sans-serif",
                transition: "color 0.3s",
              }}
            >
              {g.name}
            </span>
            {currentGesture?.emoji === g.emoji && (
              <div
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "#34d399",
                  marginLeft: "auto",
                  flexShrink: 0,
                  animation: "pulseDot 1.5s ease-in-out infinite",
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* === CREATOR BADGE - Fixed === */}
      <div
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          zIndex: 100,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            borderRadius: "9999px",
            padding: "10px 20px",
            background: "rgba(6,6,20,0.9)",
            border: "1px solid rgba(167,139,250,0.3)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 8px 40px rgba(124,58,237,0.25), 0 2px 10px rgba(0,0,0,0.5)",
          }}
        >
          <span style={{ fontSize: "1rem" }}>✨</span>
          <span
            style={{
              fontFamily: "'Vazirmatn', sans-serif",
              fontSize: "clamp(0.7rem, 1.5vw, 0.9rem)",
              fontWeight: 700,
              background: "linear-gradient(135deg, #a78bfa, #60a5fa, #22d3ee)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              whiteSpace: "nowrap",
            }}
          >
            Create by Alireza Namdari + AI
          </span>
          <span style={{ fontSize: "1rem" }}>🤖</span>
        </div>
      </div>

      {/* Gesture Guide Modal */}
      {showGuide && <GestureGuide onClose={() => setShowGuide(false)} />}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulseDot {
          0%, 100% { box-shadow: 0 0 0 0 rgba(52,211,153,0.5); }
          50% { box-shadow: 0 0 0 5px rgba(52,211,153,0); }
        }
        @keyframes emojiBurst {
          0% { transform: translateX(-50%) scale(0.2) rotate(-20deg); opacity: 0; }
          25% { transform: translateX(-50%) scale(1.4) rotate(5deg); opacity: 1; }
          60% { transform: translateX(-50%) translateY(-30px) scale(1.2) rotate(0deg); opacity: 1; }
          100% { transform: translateX(-50%) translateY(-90px) scale(0.7); opacity: 0; }
        }
        @keyframes bounceEmoji {
          0% { transform: scale(0.6) rotate(-10deg); }
          60% { transform: scale(1.15) rotate(3deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        @keyframes waveHand {
          0%, 100% { transform: rotate(-15deg); }
          50% { transform: rotate(15deg); }
        }
        @keyframes scanLine {
          0% { top: 10%; }
          50% { top: 90%; }
          100% { top: 10%; }
        }
      `}</style>
    </div>
  );
}
