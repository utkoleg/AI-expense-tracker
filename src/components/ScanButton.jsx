import { colors, radii } from "../theme";

export default function ScanButton({ onPress }) {
  return (
    <button
      onClick={onPress}
      aria-label="Scan a receipt"
      className="scan-btn"
      style={{
        width: "100%",
        background: `linear-gradient(135deg, ${colors.accent}, ${colors.accent2})`,
        border: "none",
        borderRadius: radii.xl,
        padding: "18px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        boxShadow: `0 8px 32px ${colors.accent}44`,
      }}
    >
      <span style={{ fontSize: 26 }}>📷</span>
      <div style={{ textAlign: "left" }}>
        <div style={{ fontWeight: 800, fontSize: 17, color: "#fff", letterSpacing: -0.3 }}>
          Scan Receipt
        </div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 1 }}>
          Camera or photo library
        </div>
      </div>
    </button>
  );
}
