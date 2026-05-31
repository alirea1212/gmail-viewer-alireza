import { GESTURE_LIBRARY } from "../utils/gestureDetector";

interface Props {
  onClose: () => void;
}

export default function GestureGuide({ onClose }: Props) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(16px)" }}
      onClick={onClose}
    >
      <div
        className="relative rounded-3xl overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0d1b2a, #1a0a2e)",
          border: "1px solid rgba(255,255,255,0.1)",
          maxWidth: "700px",
          width: "100%",
          maxHeight: "85vh",
          overflowY: "auto",
          boxShadow: "0 40px 120px rgba(0,0,0,0.8)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-8 py-6"
          style={{
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            position: "sticky",
            top: 0,
            background: "linear-gradient(135deg, #0d1b2a, #1a0a2e)",
            zIndex: 10,
          }}
        >
          <div>
            <h2
              className="font-black text-2xl"
              style={{
                background: "linear-gradient(135deg, #a78bfa, #60a5fa)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                fontFamily: "'Vazirmatn', sans-serif",
              }}
            >
              📖 راهنمای ژست‌ها
            </h2>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.85rem", fontFamily: "'Vazirmatn', sans-serif" }}>
              {GESTURE_LIBRARY.length} ژست پشتیبانی‌شده
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center rounded-full text-xl font-bold"
            style={{
              width: "44px",
              height: "44px",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.7)",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(239,68,68,0.3)";
              e.currentTarget.style.color = "white";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.08)";
              e.currentTarget.style.color = "rgba(255,255,255,0.7)";
            }}
          >
            ✕
          </button>
        </div>

        {/* Tips */}
        <div className="px-8 py-4">
          <div
            className="rounded-2xl p-4 mb-6"
            style={{ background: "rgba(99,179,237,0.08)", border: "1px solid rgba(99,179,237,0.2)" }}
          >
            <p
              style={{
                color: "rgba(147,210,255,0.9)",
                fontSize: "0.85rem",
                lineHeight: 2,
                fontFamily: "'Vazirmatn', sans-serif",
              }}
            >
              💡 <strong>نکته:</strong> ژست را ثابت نگه دار تا شناسایی شود •
              نور مناسب داشته باش •
              دست را در وسط دوربین قرار بده •
              فاصله ۳۰-۷۰ سانتی از دوربین مناسب است
            </p>
          </div>

          {/* Gesture Grid */}
          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))" }}
          >
            {GESTURE_LIBRARY.map((g, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-2 rounded-2xl p-4"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  transition: "all 0.2s",
                  cursor: "default",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.border = "1px solid rgba(99,179,237,0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.border = "1px solid rgba(255,255,255,0.08)";
                }}
              >
                <span style={{ fontSize: "2.5rem" }}>{g.emoji}</span>
                <span
                  style={{
                    color: "rgba(255,255,255,0.7)",
                    fontSize: "0.75rem",
                    fontFamily: "'Vazirmatn', sans-serif",
                    textAlign: "center",
                  }}
                >
                  {g.name}
                </span>
              </div>
            ))}
          </div>

          {/* How to use section */}
          <div
            className="mt-6 rounded-2xl p-5"
            style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)" }}
          >
            <h3
              className="font-bold text-lg mb-3"
              style={{ color: "rgba(167,139,250,0.9)", fontFamily: "'Vazirmatn', sans-serif" }}
            >
              🚀 نحوه استفاده
            </h3>
            <div
              className="flex flex-col gap-2"
              style={{ fontFamily: "'Vazirmatn', sans-serif", fontSize: "0.85rem", lineHeight: 2 }}
            >
              {[
                { step: "۱", text: "دوربین را به صورت روشن نگه دار" },
                { step: "۲", text: "دست خود را جلوی دوربین بگیر" },
                { step: "۳", text: "ژست دلخواه را نشان بده" },
                { step: "۴", text: "چند ثانیه ثابت نگه دار تا ایموجی ذخیره شود" },
                { step: "۵", text: "ایموجی‌های ذخیره‌شده در پنل چپ نمایش داده می‌شوند" },
              ].map((s) => (
                <div key={s.step} className="flex items-center gap-3">
                  <div
                    className="rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{
                      width: "26px",
                      height: "26px",
                      background: "linear-gradient(135deg, #7c3aed, #2563eb)",
                      color: "white",
                    }}
                  >
                    {s.step}
                  </div>
                  <span style={{ color: "rgba(255,255,255,0.7)" }}>{s.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Creator */}
          <div
            className="mt-4 mb-2 flex items-center justify-center gap-2 rounded-2xl p-4"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <span>✨</span>
            <span
              style={{
                fontFamily: "'Vazirmatn', sans-serif",
                fontSize: "0.9rem",
                fontWeight: 700,
                background: "linear-gradient(135deg, #a78bfa, #60a5fa, #22d3ee)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Create by Alireza Namdari + AI
            </span>
            <span>🤖</span>
          </div>
        </div>
      </div>
    </div>
  );
}
