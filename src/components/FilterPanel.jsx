import { CATS } from "../constants/categories";
import { colors, radii } from "../theme";

function Chip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="chip"
      style={{
        background: active ? colors.accent : colors.surface,
        border: `1px solid ${active ? colors.accent : colors.border}`,
        borderRadius: radii.sm,
        padding: "6px 12px",
        color: active ? "#fff" : colors.muted,
        fontSize: 12,
        fontWeight: 600,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}

export default function FilterPanel({
  sortBy, onSortChange,
  filterCat, onCatChange, usedCats,
  monthFilter, onMonthChange, months,
}) {
  return (
    <div style={{
      background: colors.card,
      border: `1px solid ${colors.border}`,
      borderRadius: radii.lg,
      padding: "14px",
      marginBottom: 8,
    }}>
      {/* Sort */}
      <div style={{ fontSize: 11, color: colors.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
        Sort by
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
        {["date", "amount", "category"].map(s => (
          <Chip key={s} label={s} active={sortBy === s} onClick={() => onSortChange(s)} />
        ))}
      </div>

      {/* Category */}
      <div style={{ fontSize: 11, color: colors.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
        Category
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
        <Chip label="All" active={filterCat === "All"} onClick={() => onCatChange("All")} />
        {usedCats.map(c => (
          <Chip
            key={c}
            label={`${CATS[c]?.emoji ?? ""} ${c}`}
            active={filterCat === c}
            onClick={() => onCatChange(c)}
          />
        ))}
      </div>

      {/* Month */}
      <div style={{ fontSize: 11, color: colors.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
        Month
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {months.map(m => (
          <Chip key={m} label={m} active={monthFilter === m} onClick={() => onMonthChange(m)} />
        ))}
      </div>
    </div>
  );
}
