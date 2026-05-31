import { useEffect, useState } from "react";
import { DeviceMode } from "../App";

interface Props {
  onSelect: (mode: DeviceMode) => void;
}

const particles = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  top: Math.random() * 100,
  size: Math.random() * 6 + 2,
  duration: Math.random() * 4 + 3,
  delay: Math.random() * 3,
}));

export default function LandingPage({ onSelect }: Props) {
  const [hovered, setHovered] = useState<DeviceMode>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  const emojiList = ["👋", "✌️", "🤙", "👍", "👎", "☝️", "✊", "🤞", "🖖", "🤟", "🤘", "🖐", "🤏", "👌", "🤌", "💪"];

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center"
      style={{
        background: "linear-gradient(135deg, #0a0a1a 0%, #0d1b2a 30%, #1a0a2e 60%, #0a1628 100%)",
        fontFamily: "'Vazirmatn', sans-serif",
      }}
    >
      {/* Animated Background Grid */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(99,179,237,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,179,237,0.3) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Floating Particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full opacity-40"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: `hsl(${200 + p.id * 10}, 80%, 60%)`,
            animation: `floatParticle ${p.duration}s ease-in-out ${p.delay}s infinite alternate`,
          }}
        />
      ))}

      {/* Glowing Orbs */}
      <div
        className="absolute rounded-full blur-3xl opacity-20"
        style={{
          width: "500px",
          height: "500px",
          background: "radial-gradient(circle, #7c3aed, transparent)",
          top: "-100px",
          left: "-100px",
          animation: "pulse 6s ease-in-out infinite",
        }}
      />
      <div
        className="absolute rounded-full blur-3xl opacity-20"
        style={{
          width: "400px",
          height: "400px",
          background: "radial-gradient(circle, #2563eb, transparent)",
          bottom: "-80px",
          right: "-80px",
          animation: "pulse 8s ease-in-out 2s infinite",
        }}
      />

      {/* Main Content */}
      <div
        className="relative z-10 flex flex-col items-center gap-8 px-4 py-10"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(40px)",
          transition: "all 1s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Logo Area */}
        <div className="flex flex-col items-center gap-3">
          <div
            className="relative flex items-center justify-center"
            style={{ width: "120px", height: "120px" }}
          >
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: "linear-gradient(135deg, #7c3aed, #2563eb, #06b6d4)",
                animation: "spin 8s linear infinite",
                padding: "3px",
              }}
            />
            <div
              className="absolute inset-1 rounded-full flex items-center justify-center"
              style={{ background: "#0d1b2a" }}
            >
              <span style={{ fontSize: "52px" }}>✋</span>
            </div>
          </div>

          <div className="text-center">
            <h1
              className="font-black tracking-tight"
              style={{
                fontSize: "clamp(2rem, 5vw, 3.5rem)",
                background: "linear-gradient(135deg, #a78bfa, #60a5fa, #22d3ee)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                lineHeight: 1.1,
              }}
            >
              Hand Emoji Detector
            </h1>
            <p
              className="mt-2 font-light"
              style={{
                color: "rgba(167,139,250,0.8)",
                fontSize: "clamp(0.9rem, 2vw, 1.1rem)",
                letterSpacing: "0.05em",
              }}
            >
              تشخیص حرکات دست با هوش مصنوعی
            </p>
          </div>
        </div>

        {/* Emoji Marquee */}
        <div
          className="w-full overflow-hidden py-3 rounded-2xl"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            maxWidth: "600px",
          }}
        >
          <div style={{ display: "flex", animation: "marquee 12s linear infinite", whiteSpace: "nowrap" }}>
            {[...emojiList, ...emojiList].map((emoji, i) => (
              <span
                key={i}
                style={{ fontSize: "2rem", margin: "0 12px", display: "inline-block" }}
              >
                {emoji}
              </span>
            ))}
          </div>
        </div>

        {/* Question */}
        <div className="text-center">
          <p
            className="font-semibold"
            style={{
              color: "rgba(255,255,255,0.9)",
              fontSize: "clamp(1.1rem, 3vw, 1.5rem)",
              marginBottom: "8px",
            }}
          >
            📱 با چه دستگاهی وارد می‌شوی؟
          </p>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.85rem" }}>
            دوربین مناسب دستگاه شما فعال خواهد شد
          </p>
        </div>

        {/* Device Selection Cards */}
        <div className="flex flex-col sm:flex-row gap-5 w-full" style={{ maxWidth: "520px" }}>
          {/* Computer Card */}
          <button
            onClick={() => onSelect("computer")}
            onMouseEnter={() => setHovered("computer")}
            onMouseLeave={() => setHovered(null)}
            className="relative flex-1 flex flex-col items-center gap-4 rounded-3xl p-8 cursor-pointer outline-none"
            style={{
              background:
                hovered === "computer"
                  ? "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(37,99,235,0.3))"
                  : "rgba(255,255,255,0.04)",
              border: hovered === "computer"
                ? "2px solid rgba(124,58,237,0.8)"
                : "2px solid rgba(255,255,255,0.1)",
              transform: hovered === "computer" ? "translateY(-6px) scale(1.02)" : "translateY(0) scale(1)",
              transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
              boxShadow: hovered === "computer"
                ? "0 20px 60px rgba(124,58,237,0.3), 0 0 0 1px rgba(124,58,237,0.2)"
                : "0 4px 20px rgba(0,0,0,0.2)",
            }}
          >
            <div
              className="flex items-center justify-center rounded-2xl"
              style={{
                width: "80px",
                height: "80px",
                background: "linear-gradient(135deg, #7c3aed22, #2563eb22)",
                border: "1px solid rgba(124,58,237,0.3)",
              }}
            >
              <span style={{ fontSize: "40px" }}>🖥️</span>
            </div>
            <div className="text-center">
              <div
                className="font-bold"
                style={{
                  color: "white",
                  fontSize: "1.2rem",
                  marginBottom: "6px",
                }}
              >
                کامپیوتر
              </div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem", lineHeight: 1.6 }}>
                وبکم لپتاپ یا دسکتاپ
                <br />
                بدون لگ · سریع · دقیق
              </div>
            </div>
            <div
              className="rounded-full px-5 py-2 font-semibold text-sm"
              style={{
                background: "linear-gradient(135deg, #7c3aed, #2563eb)",
                color: "white",
                opacity: hovered === "computer" ? 1 : 0.6,
                transition: "opacity 0.3s",
              }}
            >
              انتخاب ← 
            </div>
          </button>

          {/* Mobile Card */}
          <button
            onClick={() => onSelect("mobile")}
            onMouseEnter={() => setHovered("mobile")}
            onMouseLeave={() => setHovered(null)}
            className="relative flex-1 flex flex-col items-center gap-4 rounded-3xl p-8 cursor-pointer outline-none"
            style={{
              background:
                hovered === "mobile"
                  ? "linear-gradient(135deg, rgba(6,182,212,0.3), rgba(16,185,129,0.3))"
                  : "rgba(255,255,255,0.04)",
              border: hovered === "mobile"
                ? "2px solid rgba(6,182,212,0.8)"
                : "2px solid rgba(255,255,255,0.1)",
              transform: hovered === "mobile" ? "translateY(-6px) scale(1.02)" : "translateY(0) scale(1)",
              transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
              boxShadow: hovered === "mobile"
                ? "0 20px 60px rgba(6,182,212,0.3), 0 0 0 1px rgba(6,182,212,0.2)"
                : "0 4px 20px rgba(0,0,0,0.2)",
            }}
          >
            <div
              className="flex items-center justify-center rounded-2xl"
              style={{
                width: "80px",
                height: "80px",
                background: "linear-gradient(135deg, #06b6d422, #10b98122)",
                border: "1px solid rgba(6,182,212,0.3)",
              }}
            >
              <span style={{ fontSize: "40px" }}>📱</span>
            </div>
            <div className="text-center">
              <div
                className="font-bold"
                style={{
                  color: "white",
                  fontSize: "1.2rem",
                  marginBottom: "6px",
                }}
              >
                موبایل
              </div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem", lineHeight: 1.6 }}>
                دوربین جلو گوشی
                <br />
                بهینه‌شده · لمسی · پرتابل
              </div>
            </div>
            <div
              className="rounded-full px-5 py-2 font-semibold text-sm"
              style={{
                background: "linear-gradient(135deg, #06b6d4, #10b981)",
                color: "white",
                opacity: hovered === "mobile" ? 1 : 0.6,
                transition: "opacity 0.3s",
              }}
            >
              انتخاب ←
            </div>
          </button>
        </div>

        {/* Features Row */}
        <div
          className="flex flex-wrap justify-center gap-3 mt-2"
          style={{ maxWidth: "600px" }}
        >
          {[
            { icon: "⚡", text: "بدون لگ" },
            { icon: "🎯", text: "۳۰+ ایموجی" },
            { icon: "🤖", text: "هوش مصنوعی" },
            { icon: "📷", text: "Real-time" },
            { icon: "🌐", text: "آفلاین" },
            { icon: "🔒", text: "حریم خصوصی" },
          ].map((f, i) => (
            <div
              key={i}
              className="flex items-center gap-2 rounded-full px-4 py-2"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.7)",
                fontSize: "0.8rem",
              }}
            >
              <span>{f.icon}</span>
              <span>{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Creator Badge */}
      <div
        className="absolute bottom-6 left-0 right-0 flex justify-center"
        style={{
          opacity: visible ? 1 : 0,
          transition: "opacity 1.5s ease 0.5s",
        }}
      >
        <div
          className="flex items-center gap-2 rounded-full px-6 py-3"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.12)",
            backdropFilter: "blur(10px)",
          }}
        >
          <span style={{ fontSize: "1rem" }}>✨</span>
          <span
            style={{
              fontFamily: "'Vazirmatn', sans-serif",
              fontSize: "0.95rem",
              fontWeight: 600,
              background: "linear-gradient(135deg, #a78bfa, #60a5fa)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Create by Alireza Namdari + AI
          </span>
          <span style={{ fontSize: "1rem" }}>🤖</span>
        </div>
      </div>

      <style>{`
        @keyframes floatParticle {
          0% { transform: translateY(0px) scale(1); opacity: 0.3; }
          100% { transform: translateY(-20px) scale(1.3); opacity: 0.7; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.15; }
          50% { transform: scale(1.2); opacity: 0.25; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
