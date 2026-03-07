import { useState, useMemo, useCallback, useRef } from "react";
import { colors, radii, safe } from "../theme";
import { CATS } from "../constants/categories";
import { fmt } from "../utils/format";
import StatCard from "../components/StatCard";
import SectionLabel from "../components/SectionLabel";
import ScanButton from "../components/ScanButton";
import LoadingBanner from "../components/LoadingBanner";
import FlashResult from "../components/FlashResult";
import MonthlyChart from "../components/MonthlyChart";
import FilterPanel from "../components/FilterPanel";
import ExpRow from "../components/ExpRow";
import PullToRefresh from "../components/PullToRefresh";

export default function HomePage({
  expenses,
  stats,
  loading,
  flash,
  onScanPress,
  onExpensePress,
  onDeletePress,
  onRefresh,
}) {
  const scrollRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy]           = useState("date");
  const [filterCat, setFilterCat]     = useState("All");
  const [monthFilter, setMonthFilter] = useState("All");
  const [showFilters, setShowFilters] = useState(false);

  const { totalSpent, catTotals, monthlyTotals, topCat, usedCats, thisMonth } = stats;

  const months = useMemo(() => [
    "All",
    ...Array.from(new Set(expenses.map(e => e.date?.slice(0, 7)).filter(Boolean)))
      .sort()
      .reverse(),
  ], [expenses]);

  const filtered = useMemo(() => {
    return expenses
      .filter(e => filterCat === "All" || e.category === filterCat)
      .filter(e => monthFilter === "All" || e.date?.startsWith(monthFilter))
      .filter(e => !searchQuery || (
        e.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.category.toLowerCase().includes(searchQuery.toLowerCase())
      ))
      .sort((a, b) => {
        if (sortBy === "amount")   return b.total - a.total;
        if (sortBy === "category") return a.category.localeCompare(b.category);
        return new Date(b.date) - new Date(a.date);
      });
  }, [expenses, filterCat, monthFilter, searchQuery, sortBy]);

  const clearSearch = useCallback(() => setSearchQuery(""), []);

  return (
    <PullToRefresh scrollRef={scrollRef} onRefresh={onRefresh}>
    <div
      ref={scrollRef}
      className="page-scroll"
      style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: `16px 16px`, paddingBottom: `calc(90px + ${safe.bot})` }}
    >
      {/* Scan / Loading */}
      <div style={{ marginBottom: 16 }}>
        {loading
          ? <LoadingBanner />
          : <ScanButton onPress={onScanPress} />
        }
      </div>

      {/* Flash result */}
      <FlashResult expense={flash} />

      {/* Stats row 1 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
        <StatCard label="Total Spent" value={fmt(totalSpent)} />
        <StatCard label="Receipts" value={expenses.length} color={colors.success} />
      </div>

      {/* Stats row 2 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
        <StatCard
          label="This Month"
          value={fmt(monthlyTotals[thisMonth] || 0)}
          color={colors.warning}
        />
        <StatCard
          label="Top Category"
          value={topCat ? `${CATS[topCat]?.emoji} ${topCat}` : "—"}
          color={topCat ? CATS[topCat]?.color : colors.muted}
          sub={topCat ? fmt(catTotals[topCat]) : ""}
        />
      </div>

      {/* Chart */}
      <MonthlyChart monthlyTotals={monthlyTotals} />

      {/* Search + filter bar */}
      {expenses.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <div style={{
              flex: 1,
              background: colors.card,
              border: `1px solid ${colors.border}`,
              borderRadius: radii.md,
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "0 12px",
            }}>
              <span style={{ color: colors.muted }}>🔍</span>
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search..."
                aria-label="Search expenses"
                style={{
                  flex: 1,
                  background: "none",
                  border: "none",
                  outline: "none",
                  color: colors.text,
                  fontSize: 14,
                  padding: "11px 0",
                }}
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  aria-label="Clear search"
                  style={{
                    background: "none",
                    border: "none",
                    color: colors.muted,
                    cursor: "pointer",
                    fontSize: 18,
                    padding: 0,
                  }}
                >
                  ×
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(f => !f)}
              style={{
                background: showFilters ? colors.accent : colors.card,
                border: `1px solid ${showFilters ? colors.accent : colors.border}`,
                borderRadius: radii.md,
                padding: "0 16px",
                color: showFilters ? "#fff" : colors.muted,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Filter
            </button>
          </div>

          {showFilters && (
            <FilterPanel
              sortBy={sortBy} onSortChange={setSortBy}
              filterCat={filterCat} onCatChange={setFilterCat} usedCats={usedCats}
              monthFilter={monthFilter} onMonthChange={setMonthFilter} months={months}
            />
          )}
        </div>
      )}

      {/* Expense list */}
      <SectionLabel>
        {filtered.length > 0
          ? `${filtered.length} Expense${filtered.length !== 1 ? "s" : ""}`
          : "Expenses"
        }
      </SectionLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 0", color: colors.muted, fontSize: 14, lineHeight: 2 }}>
            {expenses.length === 0
              ? "Tap Scan Receipt above\nto add your first expense!"
              : "No results found."
            }
          </div>
        )}
        {filtered.map(e => (
          <ExpRow
            key={e.id}
            expense={e}
            onPress={onExpensePress}
            onDelete={onDeletePress}
          />
        ))}
      </div>
    </div>
    </PullToRefresh>
  );
}
