import { colors, radii } from "../theme";

export default function DeleteConfirm({ onConfirm, onCancel }) {
  return (
    <div
      onClick={onCancel}
      role="alertdialog"
      aria-modal="true"
      aria-label="Delete expense confirmation"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        zIndex: 400,
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
          borderRadius: radii.xxl - 2,
          padding: "28px 24px",
          maxWidth: 300,
          width: "100%",
          textAlign: "center",
          animation: "popIn 0.22s ease",
        }}
      >
        <div style={{ fontSize: 40, marginBottom: 12 }}>🗑️</div>
        <div style={{ fontSize: 18, fontWeight: 800, color: colors.text, marginBottom: 8 }}>
          Delete Expense?
        </div>
        <div style={{ fontSize: 13, color: colors.muted, marginBottom: 22 }}>
          This cannot be undone.
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              background: colors.surface,
              border: `1px solid ${colors.border}`,
              borderRadius: radii.md,
              padding: "13px",
              color: colors.text,
              fontWeight: 700,
              fontSize: 15,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              background: "rgba(248,113,113,0.15)",
              border: "1px solid rgba(248,113,113,0.35)",
              borderRadius: radii.md,
              padding: "13px",
              color: colors.danger,
              fontWeight: 700,
              fontSize: 15,
              cursor: "pointer",
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
