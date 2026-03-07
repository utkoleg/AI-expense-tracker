import { useMemo } from "react";
import { colors, radii } from "../theme";
import { fmt, formatMonth } from "../utils/format";
import SectionLabel from "./SectionLabel";

export default function MonthlyChart({ monthlyTotals }) {
  const chartData = useMemo(() =>
    Object.entries(monthlyTotals).sort().slice(-6),
    [monthlyTotals]
  );

  const chartMax = useMemo(() =>
    Math.max(...chartData.map(d => d[1]), 1),
    [chartData]
  );

  if (chartData.length < 2) return null;

  return (
    <div style={{ marginBottom: 20 }}>
      <SectionLabel>Monthly Spending</SectionLabel>
      <div style={{
        background: colors.card,
        border: `1px solid ${colors.border}`,
        borderRadius: radii.lg,
        padding: "16px 16px 10px",
      }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 80 }}>
          {chartData.map(([month, val]) => (
            <div key={month} style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 5,
            }}>
              <div style={{ fontSize: 8, color: colors.muted, fontWeight: 600 }}>
                {fmt(val).split(".")[0]}
              </div>
              <div style={{
                width: "100%",
                borderRadius: 6,
                background: colors.accent + "22",
                overflow: "hidden",
                height: 52,
                display: "flex",
                alignItems: "flex-end",
              }}>
                <div style={{
                  width: "100%",
                  background: `linear-gradient(to top, ${colors.accent}, ${colors.accent2})`,
                  height: `${(val / chartMax) * 100}%`,
                  borderRadius: 6,
                  transition: "height 0.4s ease",
                }} />
              </div>
              <div style={{ fontSize: 9, color: colors.muted }}>
                {formatMonth(month)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
