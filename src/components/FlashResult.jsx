import { CATS } from "../constants/categories";
import { fmt } from "../utils/format";
import { colors, radii } from "../theme";

export default function FlashResult({ expense }) {
  if (!expense) return null;
  const cat = CATS[expense.category];
  return (
    <div style={{
      background: `linear-gradient(135deg, ${colors.accent}22, ${colors.accent2}11)`,
      border: `1px solid ${colors.accent}44`,
      borderRadius: radii.lg,
      padding: "14px 16px",
      marginBottom: 16,
      animation: "fadeIn 0.3s ease",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: colors.text }}>
          {cat?.emoji} {expense.merchant}
        </div>
        <div style={{ fontWeight: 800, fontSize: 17, color: colors.accent }}>
          {fmt(expense.total)}
        </div>
      </div>
      <div style={{ fontSize: 12, color: colors.muted }}>
        {expense.category} · {expense.items.slice(0, 3).map(i => i.name).join(", ") || expense.date}
      </div>
    </div>
  );
}
