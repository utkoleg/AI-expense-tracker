import { colors, radii } from "../theme";

export default function LoadingBanner({ message = "Analyzing receipt..." }) {
  return (
    <div style={{
      background: `linear-gradient(135deg, ${colors.accent}33, ${colors.accent2}22)`,
      border: `1px solid ${colors.accent}44`,
      borderRadius: radii.xl,
      padding: "18px 20px",
      display: "flex",
      alignItems: "center",
      gap: 14,
    }}>
      <div className="spinner" style={{
        width: 26,
        height: 26,
        border: `3px solid ${colors.accent}33`,
        borderTopColor: colors.accent,
        borderRadius: "50%",
        flexShrink: 0,
      }} />
      <div>
        <div style={{ fontWeight: 700, fontSize: 15, color: colors.text }}>
          {message}
        </div>
        <div style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>
          Please wait...
        </div>
      </div>
    </div>
  );
}
