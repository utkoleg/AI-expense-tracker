import { colors, radii, safe } from "../theme";
import { CATS } from "../constants/categories";
import { fmt } from "../utils/format";
import StatCard from "../components/StatCard";
import SectionLabel from "../components/SectionLabel";

export default function CategoryDetailPage({
  category,
  expenses,
  onBack,
  onExpensePress,
  onDeletePress,
}) {
  if (!category) return null;

  const c = CATS[category] || CATS["Other"];

  // Include expenses where this category is dominant OR appears as a group
  const catExp = expenses.filter(e =>
    e.category === category || e.groups?.some(g => g.category === category)
  );

  // For each expense, get only the items belonging to this category
  const getCatItems = (e) => {
    if (e.groups) {
      const g = e.groups.find(g => g.category === category);
      return g ? g.items : [];
    }
    return e.items;
  };

  // Group by expense: each entry = { expense, items, total }
  const rows = catExp.map(e => {
    const items = getCatItems(e);
    return {
      expense: e,
      items,
      total: items.reduce((s, item) => s + (parseFloat(item.price) || 0), 0),
    };
  });

  const catTotal = rows.reduce((s, r) => s + r.total, 0);
  const totalItems = rows.reduce((s, r) => s + r.items.length, 0);

  return (
    <div
      className="page-scroll"
      style={{ flex: 1, overflowY: "auto", padding: `16px 16px`, paddingBottom: `calc(90px + ${safe.bot})` }}
    >
      <button
        onClick={onBack}
        style={{
          background: colors.card,
          border: `1px solid ${colors.border}`,
          borderRadius: 10,
          padding: "9px 16px",
          color: colors.text,
          fontSize: 14,
          cursor: "pointer",
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <span style={{ fontSize: 16 }}>‹</span> Back
      </button>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
        <div style={{
          width: 64,
          height: 64,
          borderRadius: 20,
          background: c.color + "18",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 34,
          flexShrink: 0,
        }}>
          {c.emoji}
        </div>
        <div>
          <div style={{ fontSize: 28, fontWeight: 800, color: colors.text, letterSpacing: -0.5 }}>
            {category}
          </div>
          <div style={{ fontSize: 13, color: colors.muted, marginTop: 3 }}>
            {totalItems} item{totalItems !== 1 ? "s" : ""} ·{" "}
            <span style={{ color: c.color, fontWeight: 700 }}>{fmt(catTotal)}</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
        <div style={{ gridColumn: "1 / -1" }}>
          <StatCard label="Total" value={fmt(catTotal)} color={c.color} />
        </div>
        <StatCard label="Avg" value={fmt(rows.length ? catTotal / rows.length : 0)} color={colors.muted} />
        <StatCard label="Count" value={rows.length} color={colors.success} />
      </div>

      <SectionLabel>{rows.length} Expense{rows.length !== 1 ? "s" : ""}</SectionLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {rows.map((row, i) => {
          const title = row.items.length === 1 ? row.items[0].name : row.expense.merchant;
          const subtitle = row.items.length === 1
            ? `${row.expense.date} · ${row.expense.merchant}`
            : `${row.expense.date} · ${row.items.map(it => it.name).filter(Boolean).join(", ")}`;
          return (
            <div
              key={i}
              role="button"
              tabIndex={0}
              onClick={() => onExpensePress(row.expense, category)}
              onKeyDown={e => e.key === "Enter" && onExpensePress(row.expense, category)}
              className="exp-row"
              style={{
                background: colors.card,
                border: `1px solid ${colors.border}`,
                borderRadius: radii.lg,
                padding: "14px",
                display: "flex",
                alignItems: "center",
                gap: 12,
                cursor: "pointer",
              }}
            >
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                background: c.color + "18",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                fontSize: 22,
              }}>
                {c.emoji}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontWeight: 600,
                  fontSize: 15,
                  color: colors.text,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}>
                  {title}
                </div>
                <div style={{
                  fontSize: 12,
                  color: colors.muted,
                  marginTop: 3,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}>
                  {subtitle}
                </div>
              </div>

              <div style={{ textAlign: "right", flexShrink: 0, marginRight: 4 }}>
                <div style={{ fontWeight: 700, fontSize: 16, color: colors.text }}>
                  {fmt(row.total)}
                </div>
                <div style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>
                  {row.items.length} item{row.items.length !== 1 ? "s" : ""}
                </div>
              </div>

              <button
                aria-label="Delete expense"
                onClick={e => { e.stopPropagation(); onDeletePress(row.expense.id); }}
                className="icon-btn"
                style={{
                  background: "rgba(255,107,107,0.12)",
                  border: "1px solid rgba(255,107,107,0.28)",
                  color: colors.danger,
                  fontSize: 16,
                  cursor: "pointer",
                  padding: "6px 8px",
                  borderRadius: radii.sm,
                  flexShrink: 0,
                }}
              >
                🗑
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
