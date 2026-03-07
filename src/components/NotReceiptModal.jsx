import { colors, radii } from "../theme";

export default function NotReceiptModal({ onRetry, onClose }) {
  return (
    <div
      onClick={onClose}
      role="alertdialog"
      aria-modal="true"
      aria-label="Not a receipt"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        zIndex: 300,
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
          border: `1px solid ${colors.border}`,
          borderRadius: radii.xxl,
          padding: "36px 28px",
          maxWidth: 320,
          width: "100%",
          textAlign: "center",
          animation: "popIn 0.25s ease",
        }}
      >
        <div style={{ fontSize: 56, marginBottom: 14 }}>🧾</div>
        <div style={{ fontSize: 20, fontWeight: 900, color: colors.text, marginBottom: 10 }}>
          Not a Receipt
        </div>
        <div style={{ fontSize: 14, color: colors.muted, lineHeight: 1.7, marginBottom: 20 }}>
          Please upload a photo of a receipt, invoice, bill, or bank statement.
        </div>
        <button
          onClick={onRetry}
          style={{
            width: "100%",
            background: colors.accent,
            border: "none",
            borderRadius: 14,
            padding: "14px",
            color: "#fff",
            fontWeight: 800,
            fontSize: 15,
            cursor: "pointer",
            marginBottom: 10,
          }}
        >
          Try Again
        </button>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: colors.muted,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
