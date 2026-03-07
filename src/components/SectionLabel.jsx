import { colors } from "../theme";

export default function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: 12,
      fontWeight: 700,
      color: colors.muted,
      textTransform: "uppercase",
      letterSpacing: 0.7,
      marginBottom: 10,
    }}>
      {children}
    </div>
  );
}
