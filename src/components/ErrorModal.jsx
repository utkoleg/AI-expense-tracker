import { colors, radii } from "../theme";

export default function ErrorModal({ message, onClose }) {
  if (!message) return null;
  return (
    <div
      onClick={onClose}
      role="alertdialog"
      aria-modal="true"
      aria-label="Error"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        zIndex: 500,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: colors.card,
          border: `1px solid rgba(248,113,113,0.3)`,
          borderRadius: radii.xxl,
          padding: "32px 24px",
          maxWidth: 320,
          width: "100%",
          textAlign: "center",
          animation: "popIn 0.25s ease",
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 14 }}>⚠️</div>
        <div style={{ fontSize: 18, fontWeight: 800, color: colors.text, marginBottom: 10 }}>
          Something went wrong
        </div>
        <div style={{
          fontSize: 13,
          color: colors.muted,
          lineHeight: 1.7,
          marginBottom: 24,
          wordBreak: "break-word",
        }}>
          {message}
        </div>
        <button
          onClick={onClose}
          style={{
            width: "100%",
            background: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: 14,
            padding: "14px",
            color: colors.text,
            fontWeight: 700,
            fontSize: 15,
            cursor: "pointer",
          }}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
