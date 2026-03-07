import { colors, radii, safe } from "../theme";
import { fmt } from "../utils/format";

export default function SettingsPage({ expenses, stats, onClearAll }) {
  const { totalSpent, usedCats } = stats;
  const totalItems = expenses.reduce((s, e) => s + e.items.length, 0);

  function exportCSV() {
    const rows = [["Date", "Merchant", "Category", "Total", "Items"]];
    expenses.forEach(e =>
      rows.push([e.date, e.merchant, e.category, e.total.toFixed(2), e.items.map(i => i.name).join("; ")])
    );
    const csv = rows
      .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = "receiptly_export.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const summaryRows = [
    ["Total Receipts", expenses.length],
    ["Total Items",    totalItems],
    ["Total Spent",    fmt(totalSpent)],
    ["Categories",     usedCats.length],
    ["Avg per Receipt", expenses.length ? fmt(totalSpent / expenses.length) : "—"],
  ];

  return (
    <div
      className="page-scroll"
      style={{ flex: 1, overflowY: "auto", padding: `16px 16px`, paddingBottom: `calc(90px + ${safe.bot})` }}
    >
      {/* Summary stats */}
      <div style={{
        background: colors.card,
        border: `1px solid ${colors.border}`,
        borderRadius: radii.lg,
        overflow: "hidden",
        marginBottom: 16,
      }}>
        {summaryRows.map(([label, value], i, arr) => (
          <div
            key={label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "14px 16px",
              borderBottom: i < arr.length - 1 ? `1px solid ${colors.border}` : "none",
            }}
          >
            <span style={{ fontSize: 15, color: colors.muted }}>{label}</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: colors.text }}>{value}</span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{
        background: colors.card,
        border: `1px solid ${colors.border}`,
        borderRadius: radii.lg,
        overflow: "hidden",
        marginBottom: 16,
      }}>
        <button
          onClick={exportCSV}
          disabled={expenses.length === 0}
          style={{
            width: "100%",
            background: "none",
            border: "none",
            borderBottom: `1px solid ${colors.border}`,
            padding: "16px",
            color: expenses.length === 0 ? colors.muted : colors.accent,
            fontWeight: 600,
            fontSize: 15,
            cursor: expenses.length === 0 ? "not-allowed" : "pointer",
            textAlign: "left",
            display: "flex",
            alignItems: "center",
            gap: 10,
            opacity: expenses.length === 0 ? 0.5 : 1,
          }}
        >
          <span>📤</span> Export to CSV
        </button>
        <button
          onClick={onClearAll}
          disabled={expenses.length === 0}
          style={{
            width: "100%",
            background: "none",
            border: "none",
            padding: "16px",
            color: expenses.length === 0 ? colors.muted : colors.danger,
            fontWeight: 600,
            fontSize: 15,
            cursor: expenses.length === 0 ? "not-allowed" : "pointer",
            textAlign: "left",
            display: "flex",
            alignItems: "center",
            gap: 10,
            opacity: expenses.length === 0 ? 0.5 : 1,
          }}
        >
          <span>🗑</span> Clear All Expenses
        </button>
      </div>

      {/* About */}
      <div style={{
        background: colors.card,
        border: `1px solid ${colors.border}`,
        borderRadius: radii.lg,
        padding: "16px",
      }}>
        <div style={{ fontSize: 13, color: colors.muted, lineHeight: 1.8 }}>
          <b style={{ color: colors.text }}>Receiptly</b> uses Claude AI to scan and categorize
          your expenses automatically.<br /><br />
          50 categories · Line-item extraction · Monthly charts · CSV export<br /><br />
          All data is stored locally on your device.
        </div>
      </div>
    </div>
  );
}
