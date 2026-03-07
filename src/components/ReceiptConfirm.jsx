import { useState } from "react";
import { CATS, CAT_NAMES } from "../constants/categories";
import { fmt } from "../utils/format";
import { colors, radii, safe } from "../theme";

export default function ReceiptConfirm({ groups: rawGroups, onConfirm, onDiscard }) {
  const [merchant, setMerchant] = useState(rawGroups[0]?.merchant || "");
  const [date, setDate] = useState(rawGroups[0]?.date || new Date().toISOString().slice(0, 10));
  const [groups, setGroups] = useState(() =>
    rawGroups.map(g => ({
      category: CATS[g.category] ? g.category : "Other",
      items: (g.items || []).map(item => ({ ...item, price: String(item.price ?? "") })),
    }))
  );
  const [catPickerFor, setCatPickerFor] = useState(null);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  const total = groups.reduce((s, g) =>
    s + g.items.reduce((si, item) => si + (parseFloat(item.price) || 0), 0), 0
  );

  const updateItem = (gi, ii, field, value) =>
    setGroups(gs => gs.map((g, gI) => gI !== gi ? g : {
      ...g,
      items: g.items.map((item, iI) => iI !== ii ? item : { ...item, [field]: value }),
    }));

  const deleteItem = (gi, ii) =>
    setGroups(gs => gs.map((g, gI) => gI !== gi ? g : {
      ...g, items: g.items.filter((_, iI) => iI !== ii),
    }));

  const addItem = (gi) =>
    setGroups(gs => gs.map((g, gI) => gI !== gi ? g : {
      ...g, items: [...g.items, { name: "", price: "", quantity: 1 }],
    }));

  const setCategory = (gi, cat) =>
    setGroups(gs => gs.map((g, gI) => gI !== gi ? g : { ...g, category: cat }));

  const addGroup = () => {
    setGroups(gs => {
      const newGs = [...gs, { category: "Other", items: [{ name: "", price: "", quantity: 1 }] }];
      setCatPickerFor(newGs.length - 1);
      return newGs;
    });
  };

  const handleConfirm = () => {
    const builtGroups = groups
      .filter(g => g.items.length > 0)
      .map(g => ({
        merchant,
        date,
        currency: rawGroups[0]?.currency || "USD",
        notes: rawGroups[0]?.notes || "",
        category: g.category,
        total: g.items.reduce((s, item) => s + (parseFloat(item.price) || 0), 0),
        items: g.items.map(item => ({
          name: item.name,
          quantity: parseInt(item.quantity) || 1,
          price: parseFloat(item.price) || 0,
        })),
      }));
    onConfirm(builtGroups.length ? builtGroups : rawGroups);
  };

  const inputBase = {
    background: "none",
    border: "none",
    outline: "none",
    fontFamily: "inherit",
    width: "100%",
  };

  return (
    <>
      {/* Discard confirmation */}
      {showDiscardConfirm && (
        <div
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.4)",
            zIndex: 600,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 24,
            animation: "fadeIn 0.15s ease",
          }}
        >
          <div style={{
            background: colors.surface,
            borderRadius: 20,
            padding: "24px 20px",
            width: "100%",
            maxWidth: 320,
            animation: "popIn 0.2s cubic-bezier(0.34,1.56,0.64,1)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: colors.text, marginBottom: 8, textAlign: "center" }}>
              Discard receipt?
            </div>
            <div style={{ fontSize: 14, color: colors.muted, textAlign: "center", marginBottom: 24 }}>
              All changes will be lost and this receipt won't be saved.
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setShowDiscardConfirm(false)}
                style={{
                  flex: 1, padding: "12px",
                  background: colors.surface,
                  border: `1px solid ${colors.border}`,
                  borderRadius: radii.md,
                  color: colors.text, fontSize: 15, fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={onDiscard}
                style={{
                  flex: 1, padding: "12px",
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  borderRadius: radii.md,
                  color: colors.danger, fontSize: 15, fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category picker sheet */}
      {catPickerFor !== null && (
        <div
          onClick={() => setCatPickerFor(null)}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.35)",
            zIndex: 500,
            display: "flex", alignItems: "flex-end",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: colors.surface,
              borderRadius: "24px 24px 0 0",
              width: "100%",
              maxHeight: "72dvh",
              overflowY: "auto",
              padding: "16px",
              paddingBottom: `calc(16px + ${safe.bot})`,
              animation: "slideUp 0.2s ease",
            }}
          >
            <div style={{
              fontSize: 12, fontWeight: 700, color: colors.muted,
              textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 14,
            }}>
              Select Category
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {CAT_NAMES.map(cat => {
                const c = CATS[cat];
                const active = groups[catPickerFor]?.category === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => { setCategory(catPickerFor, cat); setCatPickerFor(null); }}
                    style={{
                      background: active ? c.color + "22" : colors.surface,
                      border: `1.5px solid ${active ? c.color : colors.border}`,
                      borderRadius: radii.md,
                      padding: "10px 6px",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <span style={{ fontSize: 20 }}>{c.emoji}</span>
                    <span style={{
                      fontSize: 10, color: active ? c.color : colors.muted,
                      fontWeight: active ? 700 : 500,
                      lineHeight: 1.3, textAlign: "center",
                    }}>{cat}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main screen */}
      <div style={{
        position: "fixed", inset: 0,
        background: colors.bg,
        zIndex: 300,
        display: "flex",
        flexDirection: "column",
        animation: "slideUp 0.35s cubic-bezier(0.34,1.1,0.64,1)",
      }}>
        {/* Header */}
        <div style={{
          background: "rgba(19,15,42,0.88)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderBottom: `1px solid ${colors.border}`,
          paddingTop: `calc(${safe.top} + 12px)`,
          paddingBottom: 12,
          paddingLeft: 20,
          paddingRight: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}>
          <button
            onClick={() => setShowDiscardConfirm(true)}
            style={{
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.25)",
              borderRadius: radii.sm,
              color: colors.danger, fontSize: 14, fontWeight: 600,
              cursor: "pointer", padding: "6px 14px",
            }}
          >
            Discard
          </button>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: colors.text, textAlign: "center" }}>
              Review Receipt
            </div>
            <div style={{ fontSize: 11, color: colors.muted, textAlign: "center", marginTop: 1 }}>
              Tap any field to edit
            </div>
          </div>
          <button
            onClick={handleConfirm}
            style={{
              background: colors.accent,
              border: "none",
              borderRadius: radii.sm,
              color: colors.surface, fontSize: 14, fontWeight: 700,
              cursor: "pointer",
              padding: "6px 16px",
              boxShadow: "0 4px 12px rgba(124,92,252,0.35)",
            }}
          >
            Save
          </button>
        </div>

        {/* Scrollable body */}
        <div
          className="page-scroll"
          style={{
            flex: 1, overflowY: "auto",
            padding: "16px",
            paddingBottom: `calc(32px + ${safe.bot})`,
          }}
        >
          {/* Merchant + date card */}
          <div style={{
            background: colors.surface,
            border: `1.5px solid ${colors.border}`,
            borderRadius: radii.lg,
            padding: "14px 16px",
            marginBottom: 12,
            boxShadow: "0 2px 12px rgba(110,80,220,0.07)",
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: colors.muted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>
              Merchant
            </div>
            <input
              value={merchant}
              onChange={e => setMerchant(e.target.value)}
              placeholder="Merchant name"
              style={{
                ...inputBase,
                color: colors.text, fontSize: 18, fontWeight: 700,
                borderBottom: `1.5px solid ${colors.border}`,
                paddingBottom: 6, marginBottom: 12,
              }}
            />
            <div style={{ fontSize: 10, fontWeight: 700, color: colors.muted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>
              Date
            </div>
            <input
              value={date}
              onChange={e => setDate(e.target.value)}
              placeholder="YYYY-MM-DD"
              style={{
                ...inputBase,
                color: colors.text, fontSize: 14,
                borderBottom: `1.5px solid ${colors.border}`,
                paddingBottom: 4,
              }}
            />
          </div>

          {/* Total */}
          <div style={{
            background: colors.accent + "10",
            border: `1.5px solid ${colors.accent}30`,
            borderRadius: radii.lg,
            padding: "12px 16px",
            marginBottom: 16,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
            <span style={{ fontSize: 13, color: colors.muted, fontWeight: 600 }}>Total</span>
            <span style={{ fontSize: 26, fontWeight: 900, color: colors.accent }}>{fmt(total)}</span>
          </div>

          {/* Category groups */}
          {groups.map((g, gi) => {
            const c = CATS[g.category] || CATS["Other"];
            const groupTotal = g.items.reduce((s, item) => s + (parseFloat(item.price) || 0), 0);
            return (
              <div
                key={gi}
                style={{
                  background: colors.surface,
                  border: `1.5px solid ${colors.border}`,
                  borderRadius: radii.lg,
                  marginBottom: 14,
                  overflow: "hidden",
                  boxShadow: "0 2px 12px rgba(110,80,220,0.06)",
                }}
              >
                {/* Category header — tap to change */}
                <button
                  onClick={() => setCatPickerFor(gi)}
                  style={{
                    width: "100%",
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "12px 14px",
                    background: c.color + "15",
                    border: "none",
                    borderBottom: `1.5px solid ${c.color}25`,
                    cursor: "pointer", textAlign: "left",
                  }}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: 10,
                    background: c.color + "25",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 17, flexShrink: 0,
                  }}>
                    {c.emoji}
                  </div>
                  <span style={{ fontWeight: 700, fontSize: 14, color: c.color, flex: 1 }}>{g.category}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: c.color }}>{fmt(groupTotal)}</span>
                  <div style={{
                    background: c.color + "20",
                    border: `1px solid ${c.color}40`,
                    borderRadius: 6,
                    padding: "2px 8px",
                    fontSize: 11, color: c.color, fontWeight: 600,
                    marginLeft: 6,
                  }}>
                    change
                  </div>
                </button>

                {/* Items */}
                <div style={{ padding: "0 14px" }}>
                  {g.items.map((item, ii) => (
                    <div
                      key={ii}
                      style={{
                        display: "flex", alignItems: "center", gap: 8,
                        paddingTop: 10, paddingBottom: 10,
                        borderBottom: ii < g.items.length - 1 ? `1px solid ${colors.border}` : "none",
                      }}
                    >
                      <input
                        value={item.name}
                        onChange={e => updateItem(gi, ii, "name", e.target.value)}
                        placeholder="Item name"
                        style={{
                          ...inputBase,
                          color: colors.text, fontSize: 14,
                          borderBottom: `1.5px solid ${colors.border}`,
                          paddingBottom: 2,
                        }}
                      />
                      <div style={{ display: "flex", alignItems: "center", gap: 2, flexShrink: 0 }}>
                        <span style={{ color: colors.muted, fontSize: 13 }}>$</span>
                        <input
                          value={item.price}
                          onChange={e => updateItem(gi, ii, "price", e.target.value)}
                          inputMode="decimal"
                          placeholder="0.00"
                          style={{
                            ...inputBase,
                            width: 64,
                            color: colors.text, fontSize: 14, fontWeight: 700,
                            textAlign: "right",
                            borderBottom: `1.5px solid ${colors.border}`,
                            paddingBottom: 2,
                          }}
                        />
                      </div>
                      <button
                        onClick={() => deleteItem(gi, ii)}
                        style={{
                          background: "rgba(239,68,68,0.08)",
                          border: "1px solid rgba(239,68,68,0.2)",
                          borderRadius: 6,
                          color: colors.danger, fontSize: 16,
                          cursor: "pointer", padding: "1px 7px",
                          flexShrink: 0, lineHeight: 1.4,
                          fontWeight: 700,
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add item */}
                <button
                  onClick={() => addItem(gi)}
                  style={{
                    width: "100%",
                    background: "none",
                    border: "none",
                    borderTop: `1.5px dashed ${colors.border}`,
                    color: colors.accent, fontSize: 13, fontWeight: 600,
                    cursor: "pointer", padding: "10px",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                  }}
                >
                  <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Add item
                </button>
              </div>
            );
          })}

          {/* Add Category */}
          <button
            onClick={addGroup}
            style={{
              width: "100%",
              background: colors.surface,
              border: `1.5px dashed ${colors.accent}50`,
              borderRadius: radii.lg,
              color: colors.accent,
              fontSize: 14, fontWeight: 700,
              cursor: "pointer",
              padding: "14px",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              fontFamily: "inherit",
              marginBottom: 8,
            }}
          >
            <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Add Category
          </button>
        </div>
      </div>
    </>
  );
}
