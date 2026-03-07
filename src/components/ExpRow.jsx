import { CATS } from "../constants/categories";
import { fmt } from "../utils/format";
import { colors, radii } from "../theme";

export default function ExpRow({ expense, onPress, onDelete, accentColor, categoryFilter }) {
  const cat = CATS[expense.category] || CATS["Other"];
  const col = accentColor || cat.color;
  const isMulti = expense.groups?.length > 1;

  const filteredGroup  = categoryFilter && (expense.groups?.find(g => g.category === categoryFilter)
    || (expense.category === categoryFilter ? { items: expense.items, total: expense.total } : null));
  const displayAmount  = filteredGroup ? filteredGroup.total : expense.total;
  const displayItems   = filteredGroup ? filteredGroup.items.length : expense.items.length;

  // When filtering by category, show item names instead of category label
  const itemNames = filteredGroup?.items.length > 0
    ? filteredGroup.items.map(i => i.name).filter(Boolean).join(", ")
    : null;
  const displayCatLine = categoryFilter
    ? `${expense.date} · ${itemNames || categoryFilter}`
    : `${expense.date} · ${isMulti ? expense.groups.map(g => g.category).join(", ") : expense.category}`;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onPress(expense)}
      onKeyDown={e => e.key === "Enter" && onPress(expense)}
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
      {/* Category icon */}
      <div style={{
        width: 44,
        height: 44,
        borderRadius: 14,
        background: col + "18",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        position: "relative",
      }}>
        <span style={{ fontSize: 22 }}>{cat.emoji}</span>
        {isMulti && (
          <div style={{
            position: "absolute",
            bottom: -3,
            right: -3,
            background: colors.accent,
            color: "#08081a",
            fontSize: 9,
            fontWeight: 800,
            borderRadius: 6,
            padding: "1px 4px",
            lineHeight: 1.4,
          }}>
            +{expense.groups.length - 1}
          </div>
        )}
      </div>

      {/* Merchant + meta */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontWeight: 600,
          fontSize: 15,
          color: colors.text,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}>
          {expense.merchant}
        </div>
        <div style={{ fontSize: 12, color: colors.muted, marginTop: 3 }}>
          {displayCatLine}
        </div>
      </div>

      {/* Amount + items */}
      <div style={{ textAlign: "right", flexShrink: 0, marginRight: 4 }}>
        <div style={{ fontWeight: 700, fontSize: 16, color: colors.text }}>
          {fmt(displayAmount)}
        </div>
        <div style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>
          {displayItems} items
        </div>
      </div>

      {/* Delete */}
      <button
        aria-label="Delete expense"
        onClick={e => { e.stopPropagation(); onDelete(expense.id); }}
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
}
