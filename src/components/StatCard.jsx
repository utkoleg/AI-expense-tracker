import { colors, radii } from "../theme";

export default function StatCard({ label, value, sub, color }) {
  return (
    <div className="glass-card" style={{
      background: colors.card,
      border: `1px solid ${colors.border}`,
      borderRadius: radii.lg,
      padding: "14px",
      flex: 1,
    }}>
      <div style={{
        fontSize: 10,
        color: colors.muted,
        textTransform: "uppercase",
        letterSpacing: 0.6,
        marginBottom: 6,
      }}>
        {label}
      </div>
      <div style={{
        fontSize: 20,
        fontWeight: 800,
        color: color || colors.text,
        letterSpacing: -0.5,
        lineHeight: 1.1,
        wordBreak: "break-word",
      }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 11, color: colors.muted, marginTop: 4 }}>
          {sub}
        </div>
      )}
    </div>
  );
}
