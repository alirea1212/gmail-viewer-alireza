import { GestureResult } from "../utils/gestureDetector";

interface Props {
  recentEmojis: GestureResult[];
}

export default function EmojiPanel({ recentEmojis }: Props) {
  return (
    <div
      className="flex flex-col gap-3 overflow-y-auto py-6 px-3"
      style={{
        width: "100px",
        minHeight: "100vh",
        background: "rgba(255,255,255,0.025)",
        borderRight: "1px solid rgba(255,255,255,0.07)",
        backdropFilter: "blur(10px)",
      }}
    >
      <div
        className="text-center text-xs font-bold pb-2"
        style={{
          color: "rgba(255,255,255,0.4)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          fontFamily: "'Vazirmatn', sans-serif",
        }}
      >
        📝 آخرین
      </div>

      {recentEmojis.length === 0 && (
        <div
          className="flex flex-col items-center gap-2 mt-4"
          style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.65rem", textAlign: "center" }}
        >
          <span style={{ fontSize: "1.8rem", opacity: 0.3 }}>✋</span>
          <span style={{ fontFamily: "'Vazirmatn', sans-serif" }}>
            دست نشان بده
          </span>
        </div>
      )}

      {recentEmojis.map((g, i) => (
        <div
          key={i}
          className="flex flex-col items-center gap-1 rounded-2xl p-2 cursor-default"
          style={{
            background: i === 0 ? `${g.color}20` : "rgba(255,255,255,0.03)",
            border: i === 0 ? `1px solid ${g.color}50` : "1px solid rgba(255,255,255,0.06)",
            animation: i === 0 ? "slideInLeft 0.4s cubic-bezier(0.16,1,0.3,1)" : "none",
            transition: "all 0.3s",
            transform: i === 0 ? "scale(1.05)" : "scale(1)",
          }}
          title={g.name}
        >
          <span
            style={{
              fontSize: i === 0 ? "2.2rem" : "1.7rem",
              filter: i === 0 ? `drop-shadow(0 0 10px ${g.color})` : "none",
              transition: "all 0.3s",
            }}
          >
            {g.emoji}
          </span>
          {i === 0 && (
            <span
              style={{
                fontSize: "0.6rem",
                color: g.color,
                fontFamily: "'Vazirmatn', sans-serif",
                fontWeight: 600,
                textAlign: "center",
                maxWidth: "70px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {g.name}
            </span>
          )}
        </div>
      ))}

      <style>{`
        @keyframes slideInLeft {
          0% { transform: translateX(-30px) scale(0.8); opacity: 0; }
          100% { transform: translateX(0) scale(1.05); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
