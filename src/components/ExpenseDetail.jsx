import { useState, useRef } from "react";
import { CATS } from "../constants/categories";
import { fmt } from "../utils/format";
import { colors, radii, safe } from "../theme";

export default function ExpenseDetail({ expense, categoryFilter, onClose, onDelete, onEdit, onCategoryPress }) {
  const [dragY, setDragY] = useState(0);
  const [activeDrag, setActiveDrag] = useState(false);
  const [showFull, setShowFull] = useState(false);
  const startY = useRef(0);
  const movedRef = useRef(false);
  const bodyRef = useRef(null);
  const dragEnabledRef = useRef(false);

  const onTouchStart = (e) => {
    startY.current = e.touches[0].clientY;
    movedRef.current = false;
    // Only allow drag-to-close if the body is scrolled to the very top
    dragEnabledRef.current = !bodyRef.current || bodyRef.current.scrollTop === 0;
  };
  const onTouchMove = (e) => {
    const dy = e.touches[0].clientY - startY.current;
    if (!dragEnabledRef.current) return;
    if (dy > 8) {
      if (!movedRef.current && bodyRef.current) {
        // Freeze scroll so the panel and body composite as one layer
        bodyRef.current.style.overflowY = "hidden";
      }
      movedRef.current = true;
      setActiveDrag(true);
      setDragY(dy - 8);
    }
  };
  const onTouchEnd = () => {
    const shouldClose = movedRef.current && dragY > 90;
    movedRef.current = false;
    dragEnabledRef.current = false;
    if (bodyRef.current) bodyRef.current.style.overflowY = "auto";
    // Turn off activeDrag first so the transition becomes active,
    // then reset dragY in the next tick so the browser animates the snap-back.
    setActiveDrag(false);
    if (shouldClose) {
      onClose();
    } else {
      setTimeout(() => setDragY(0), 0);
    }
  };

  if (!expense) return null;

  const cat = CATS[expense.category] || CATS["Other"];
  const isMulti = expense.groups?.length > 1;

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label={`${expense.merchant} expense details`}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.8)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        zIndex: 200,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
    >
      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          background: colors.card,
          borderRadius: `${radii.xxl}px ${radii.xxl}px 0 0`,
          width: "100%",
          maxHeight: "88dvh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          animation: "slideUp 0.25s ease",
          transform: `translateY(${dragY}px)`,
          transition: activeDrag ? "none" : "transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)",
        }}>
        {/* Handle */}
        <div style={{
          padding: "14px 0 8px",
          display: "flex",
          justifyContent: "center",
          flexShrink: 0,
        }}>
          <div style={{
            width: 36,
            height: 4,
            background: colors.border,
            borderRadius: 2,
          }} />
        </div>

        {/* Header */}
        <div style={{
          padding: "16px 20px",
          borderBottom: `1px solid ${colors.border}`,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}>
          {isMulti ? (
            <div style={{ display: "flex", gap: 4 }}>
              {expense.groups.map(g => {
                const c = CATS[g.category] || CATS["Other"];
                return (
                  <div key={g.category} style={{
                    width: 34, height: 34, borderRadius: 10,
                    background: c.color + "20",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 18,
                  }}>{c.emoji}</div>
                );
              })}
            </div>
          ) : (
            <div style={{ fontSize: 30 }}>{cat.emoji}</div>
          )}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: colors.text }}>
              {expense.merchant}
            </div>
            <div style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>
              {expense.date} · {isMulti ? `${expense.groups.length} categories` : expense.category}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              aria-label="Edit expense"
              onClick={() => onEdit(expense)}
              style={{
                background: "rgba(167,139,250,0.1)",
                border: "1px solid rgba(167,139,250,0.25)",
                borderRadius: radii.sm,
                padding: "7px 12px",
                color: colors.accent,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              ✏️
            </button>
            <button
              aria-label="Delete expense"
              onClick={() => onDelete(expense.id)}
              style={{
                background: "rgba(248,113,113,0.1)",
                border: "1px solid rgba(248,113,113,0.25)",
                borderRadius: radii.sm,
                padding: "7px 12px",
                color: colors.danger,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              🗑
            </button>
            <button
              aria-label="Close"
              onClick={onClose}
              style={{
                background: colors.surface,
                border: `1px solid ${colors.border}`,
                borderRadius: "50%",
                width: 34,
                height: 34,
                color: colors.text,
                fontSize: 20,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ×
            </button>
          </div>
        </div>

        {/* Body */}
        <div ref={bodyRef} style={{
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
          padding: "16px 20px",
          flex: 1,
          paddingBottom: `calc(16px + ${safe.bot})`,
        }}>
          {/* Filtered view: show only items for the selected category */}
          {categoryFilter && !showFull ? (() => {
            const filterCat = categoryFilter;
            const group = expense.groups?.find(g => g.category === filterCat)
              || { category: expense.category, total: expense.total, items: expense.items };
            const c = CATS[group.category] || CATS["Other"];
            return (
              <>
                <div style={{
                  background: colors.accent + "12",
                  border: `1px solid ${colors.accent}30`,
                  borderRadius: 14,
                  padding: "14px 16px",
                  marginBottom: 16,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}>
                  <span style={{ fontSize: 13, color: colors.muted }}>{filterCat} total</span>
                  <span style={{ fontSize: 28, fontWeight: 900, color: c.color }}>
                    {fmt(group.total)}
                  </span>
                </div>

                <div
                  onClick={() => onCategoryPress?.(filterCat)}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "8px 12px",
                    background: c.color + "14",
                    border: `1px solid ${c.color}28`,
                    borderRadius: radii.md,
                    marginBottom: 6,
                    cursor: onCategoryPress ? "pointer" : "default",
                  }}>
                  <span style={{ fontSize: 16 }}>{c.emoji}</span>
                  <span style={{ fontWeight: 700, fontSize: 13, color: c.color }}>{filterCat}</span>
                  {onCategoryPress && <span style={{ marginLeft: "auto", fontSize: 11, color: c.color, opacity: 0.7 }}>›</span>}
                </div>

                {group.items.map((item, i) => (
                  <div key={i} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "12px 4px",
                    borderBottom: `1px solid ${colors.border}`,
                  }}>
                    <div style={{ flex: 1, fontSize: 15, color: colors.text }}>{item.name}</div>
                    {item.quantity && item.quantity !== 1 && (
                      <div style={{ fontSize: 12, color: colors.muted, margin: "0 10px" }}>×{item.quantity}</div>
                    )}
                    <div style={{ fontWeight: 700, fontSize: 15, color: colors.text }}>{fmt(item.price)}</div>
                  </div>
                ))}

                {/* Show whole receipt button */}
                <button
                  onClick={() => setShowFull(true)}
                  style={{
                    width: "100%",
                    marginTop: 20,
                    padding: "12px",
                    background: "none",
                    border: `1px solid ${colors.border}`,
                    borderRadius: radii.md,
                    color: colors.muted,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    fontFamily: "inherit",
                  }}
                >
                  Show whole receipt ›
                </button>
              </>
            );
          })() : (
            <>
              {/* Total Paid */}
              <div style={{
                background: colors.accent + "12",
                border: `1px solid ${colors.accent}30`,
                borderRadius: 14,
                padding: "14px 16px",
                marginBottom: 16,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}>
                <span style={{ fontSize: 13, color: colors.muted }}>Total Paid</span>
                <span style={{ fontSize: 28, fontWeight: 900, color: colors.accent }}>
                  {fmt(expense.total)}
                </span>
              </div>

              {expense.notes && (
                <div style={{
                  background: colors.surface,
                  border: `1px solid ${colors.border}`,
                  borderRadius: radii.md,
                  padding: "10px 14px",
                  marginBottom: 16,
                  fontSize: 13,
                  color: colors.muted,
                }}>
                  {expense.notes}
                </div>
              )}

              {expense.items.length === 0 ? (
                <div style={{ textAlign: "center", padding: "24px 0", color: colors.muted, fontSize: 13 }}>
                  No line items extracted. Try a clearer image.
                </div>
              ) : isMulti ? (
                <>
                  {expense.groups.map(g => {
                    const c = CATS[g.category] || CATS["Other"];
                    return (
                      <div key={g.category} style={{ marginBottom: 20 }}>
                        <div
                          onClick={() => onCategoryPress?.(g.category)}
                          style={{
                            display: "flex", alignItems: "center", gap: 8,
                            padding: "8px 12px",
                            background: c.color + "14",
                            border: `1px solid ${c.color}28`,
                            borderRadius: radii.md,
                            marginBottom: 6,
                            cursor: onCategoryPress ? "pointer" : "default",
                          }}>
                          <span style={{ fontSize: 16 }}>{c.emoji}</span>
                          <span style={{ fontWeight: 700, fontSize: 13, color: c.color }}>{g.category}</span>
                          <span style={{ marginLeft: "auto", fontWeight: 700, fontSize: 13, color: c.color }}>{fmt(g.total)}</span>
                          {onCategoryPress && <span style={{ fontSize: 11, color: c.color, opacity: 0.7 }}>›</span>}
                        </div>
                        {g.items.map((item, i) => (
                          <div key={i} style={{
                            display: "flex", justifyContent: "space-between", alignItems: "center",
                            padding: "10px 4px",
                            borderBottom: `1px solid ${colors.border}`,
                          }}>
                            <div style={{ flex: 1, fontSize: 14, color: colors.text }}>{item.name}</div>
                            {item.quantity && item.quantity !== 1 && (
                              <div style={{ fontSize: 12, color: colors.muted, margin: "0 10px" }}>×{item.quantity}</div>
                            )}
                            <div style={{ fontWeight: 600, fontSize: 14, color: colors.text }}>{fmt(item.price)}</div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                  <div style={{
                    display: "flex", justifyContent: "space-between",
                    marginTop: 8, paddingTop: 16,
                    borderTop: `2px solid ${colors.accent}`,
                    fontWeight: 800, fontSize: 17,
                  }}>
                    <span style={{ color: colors.muted }}>Total</span>
                    <span style={{ color: colors.accent }}>{fmt(expense.total)}</span>
                  </div>
                </>
              ) : (
                <>
                  <div
                    onClick={() => onCategoryPress?.(expense.category)}
                    style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "8px 12px",
                      background: cat.color + "14",
                      border: `1px solid ${cat.color}28`,
                      borderRadius: radii.md,
                      marginBottom: 6,
                      cursor: onCategoryPress ? "pointer" : "default",
                    }}>
                    <span style={{ fontSize: 16 }}>{cat.emoji}</span>
                    <span style={{ fontWeight: 700, fontSize: 13, color: cat.color }}>{expense.category}</span>
                    <span style={{ marginLeft: "auto", fontWeight: 700, fontSize: 13, color: cat.color }}>{fmt(expense.total)}</span>
                    {onCategoryPress && <span style={{ fontSize: 11, color: cat.color, opacity: 0.7 }}>›</span>}
                  </div>
                  {expense.items.map((item, i) => (
                    <div key={i} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "12px 4px",
                      borderBottom: `1px solid ${colors.border}`,
                    }}>
                      <div style={{ flex: 1, fontSize: 15, color: colors.text }}>{item.name}</div>
                      {item.quantity && item.quantity !== 1 && (
                        <div style={{ fontSize: 12, color: colors.muted, margin: "0 10px" }}>×{item.quantity}</div>
                      )}
                      <div style={{ fontWeight: 700, fontSize: 15, color: colors.text }}>{fmt(item.price)}</div>
                    </div>
                  ))}
                  <div style={{
                    display: "flex", justifyContent: "space-between",
                    marginTop: 16, paddingTop: 16,
                    borderTop: `2px solid ${colors.accent}`,
                    fontWeight: 800, fontSize: 17,
                  }}>
                    <span style={{ color: colors.muted }}>Total</span>
                    <span style={{ color: colors.accent }}>{fmt(expense.total)}</span>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
