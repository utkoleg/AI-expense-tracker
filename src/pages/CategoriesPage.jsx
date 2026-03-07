import { useState, useEffect, useRef } from "react";
import { colors, radii, safe } from "../theme";
import { CATS } from "../constants/categories";
import { fmt } from "../utils/format";
import SectionLabel from "../components/SectionLabel";
import PullToRefresh from "../components/PullToRefresh";

function SkeletonCard() {
  return (
    <div style={{
      background: colors.card,
      border: `1px solid ${colors.border}`,
      borderRadius: radii.lg,
      padding: "16px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <div style={{ width: 48, height: 48, borderRadius: 15, background: colors.border, animation: "shimmer 1.2s ease-in-out infinite" }} />
        <div style={{ flex: 1 }}>
          <div style={{ height: 14, width: "55%", borderRadius: 6, background: colors.border, marginBottom: 8, animation: "shimmer 1.2s ease-in-out infinite" }} />
          <div style={{ height: 11, width: "35%", borderRadius: 6, background: colors.border, animation: "shimmer 1.2s ease-in-out infinite 0.15s" }} />
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ height: 14, width: 56, borderRadius: 6, background: colors.border, marginBottom: 6, animation: "shimmer 1.2s ease-in-out infinite" }} />
          <div style={{ height: 11, width: 28, borderRadius: 6, background: colors.border, marginLeft: "auto", animation: "shimmer 1.2s ease-in-out infinite 0.15s" }} />
        </div>
      </div>
      <div style={{ background: colors.surface, borderRadius: 999, height: 5 }} />
    </div>
  );
}

export default function CategoriesPage({ stats, onCategoryPress, onRefresh }) {
  const { usedCats, catTotals, catCounts, totalSpent } = stats;
  const [ready, setReady] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 180);
    return () => clearTimeout(t);
  }, []);

  return (
    <PullToRefresh scrollRef={scrollRef} onRefresh={onRefresh}>
    <div
      ref={scrollRef}
      className="page-scroll"
      style={{ flex: 1, overflowY: "auto", padding: `16px 16px`, paddingBottom: `calc(90px + ${safe.bot})` }}
    >
      <SectionLabel>{ready ? `${usedCats.length} Active Categories` : "Loading..."}</SectionLabel>

      {!ready ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : usedCats.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: colors.muted, fontSize: 14, lineHeight: 2 }}>
          No categories yet.<br />Scan a receipt first!
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {usedCats.map(cat => {
            const catTotal = catTotals[cat] || 0;
            const count = catCounts[cat] || 0;
            const pct = totalSpent > 0 ? (catTotal / totalSpent) * 100 : 0;
            const c = CATS[cat] || CATS["Other"];

            return (
              <div
                key={cat}
                role="button"
                tabIndex={0}
                onClick={() => onCategoryPress(cat)}
                onKeyDown={e => e.key === "Enter" && onCategoryPress(cat)}
                className="exp-row"
                style={{
                  background: colors.card,
                  border: `1px solid ${colors.border}`,
                  borderRadius: radii.lg,
                  padding: "16px",
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: 15,
                    background: c.color + "18",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 26,
                    flexShrink: 0,
                  }}>
                    {c.emoji}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 16, color: colors.text }}>{cat}</div>
                    <div style={{ fontSize: 12, color: colors.muted, marginTop: 3 }}>
                      {count} expense{count !== 1 ? "s" : ""}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 800, fontSize: 17, color: c.color }}>{fmt(catTotal)}</div>
                    <div style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>{pct.toFixed(0)}%</div>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ background: colors.surface, borderRadius: 999, height: 5, overflow: "hidden" }}>
                  <div style={{
                    background: c.color,
                    height: "100%",
                    width: `${pct}%`,
                    borderRadius: 999,
                    transition: "width 0.4s ease",
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
    </PullToRefresh>
  );
}
