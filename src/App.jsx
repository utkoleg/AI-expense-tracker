import { useState, useCallback, useRef } from "react";
import { colors, font, safe } from "./theme";
import { useExpenses } from "./hooks/useExpenses";
import { useCamera } from "./hooks/useCamera";
import { useReceiptFlow } from "./hooks/useReceiptFlow";

import HomePage           from "./pages/HomePage";
import CategoriesPage     from "./pages/CategoriesPage";
import CategoryDetailPage from "./pages/CategoryDetailPage";
import SettingsPage       from "./pages/SettingsPage";

import UploadSheet    from "./components/UploadSheet";
import ExpenseDetail  from "./components/ExpenseDetail";
import ReceiptConfirm from "./components/ReceiptConfirm";
import ImageStaging   from "./components/ImageStaging";
import DeleteConfirm  from "./components/DeleteConfirm";
import NotReceiptModal from "./components/NotReceiptModal";
import ErrorModal     from "./components/ErrorModal";

// ── Navigation ──────────────────────────────────────────────────
const NAV = [
  { id: "categories", emoji: "📊", label: "Categories" },
  { id: "home",       emoji: "🏠", label: "Home" },
  { id: "settings",   emoji: "⚙️",  label: "Settings" },
];

export default function App() {
  // ── Core state ───────────────────────────────────────────────
  const { expenses, addExpense, updateExpense, deleteExpense, clearAll, reload, stats } = useExpenses();
  const [page,           setPage]          = useState("home");
  const [activeCat,      setActiveCat]     = useState(null);

  // ── UI state ─────────────────────────────────────────────────
  const [detailExp,      setDetailExp]     = useState(null);
  const [detailCatFilter, setDetailCatFilter] = useState(null);
  const [deleteTarget,   setDeleteTarget]  = useState(null); // expense id
  const [showUpload,     setShowUpload]    = useState(false);
  const [showNotReceipt, setShowNotReceipt] = useState(false);
  const [errorMsg,       setErrorMsg]      = useState(null);

  // ── Receipt flow ─────────────────────────────────────────────
  const flow = useReceiptFlow({
    addExpense,
    updateExpense,
    onNotReceipt: () => setShowNotReceipt(true),
    onError: setErrorMsg,
  });

  const handleInvalidFile = useCallback(() => setShowNotReceipt(true), []);
  const camera = useCamera(flow.handleCapture, handleInvalidFile);

  // iOS requires the webview overlay (the sheet) to be fully dismissed
  // before Capacitor can present the native camera or photo picker.
  // So we close the sheet first, then await the camera action.
  const openCamera  = useCallback(() => {
    setShowUpload(false);
    // Small delay lets React flush the sheet unmount before Capacitor opens native UI
    setTimeout(() => camera.openNativeCamera().catch(e => {
      if (!e.message?.includes("cancelled") && !e.message?.includes("User cancelled")) {
        setErrorMsg(e.message);
      }
    }), 80);
  }, [camera]);

  const openLibrary = useCallback(() => {
    setShowUpload(false);
    setTimeout(() => camera.openPhotoLibrary().catch(e => {
      if (!e.message?.includes("cancelled") && !e.message?.includes("User cancelled")) {
        setErrorMsg(e.message);
      }
    }), 80);
  }, [camera]);

  const openFilePicker = useCallback(() => {
    setShowUpload(false);
    camera.openFilePicker();
  }, [camera]);

  // ── Delete flow ──────────────────────────────────────────────
  const handleDeletePress = useCallback((id) => {
    setDeleteTarget(id);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    deleteExpense(deleteTarget);
    setDeleteTarget(null);
    // If we were viewing this expense in the detail modal, close it
    if (detailExp?.id === deleteTarget) setDetailExp(null);
  }, [deleteExpense, deleteTarget, detailExp]);

  // ── Edit flow ────────────────────────────────────────────────
  const handleEditPress = useCallback((expense) => {
    setDetailExp(null);
    setDetailCatFilter(null);
    flow.handleEditPress(expense);
  }, [flow.handleEditPress]);

  // ── Clear all (replaces window.confirm) ──────────────────────
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleClearAll = useCallback(() => {
    setShowClearConfirm(true);
  }, []);

  // ── Category navigation ──────────────────────────────────────
  const handleCategoryPress = useCallback((cat) => {
    setActiveCat(cat);
    setPage("detail");
  }, []);

  // ── Active tab index (for sliding pill) ──────────────────────
  const activeNavIdx = NAV.findIndex(n => n.id === page || (page === "detail" && n.id === "categories"));

  // ── Horizontal swipe to switch tabs ──────────────────────────
  const swipeStart = useRef(null);
  const onSwipeTouchStart = useCallback((e) => {
    // Ignore if any overlay is open
    if (detailExp || flow.pendingGroups || showUpload || flow.stagedImages.length > 0) return;
    swipeStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, [detailExp, flow.pendingGroups, showUpload, flow.stagedImages]);

  const onSwipeTouchEnd = useCallback((e) => {
    if (!swipeStart.current) return;
    const dx = e.changedTouches[0].clientX - swipeStart.current.x;
    const dy = e.changedTouches[0].clientY - swipeStart.current.y;
    swipeStart.current = null;
    // Only trigger if horizontal is dominant and distance is enough
    if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    const mainPages = NAV.map(n => n.id);
    const curIdx = mainPages.indexOf(page === "detail" ? "categories" : page);
    if (curIdx === -1) return;
    if (dx < 0 && curIdx < NAV.length - 1) setPage(NAV[curIdx + 1].id); // swipe left → next
    if (dx > 0 && curIdx > 0)              setPage(NAV[curIdx - 1].id); // swipe right → prev
  }, [page]);

  // ── Navbar subtitle ──────────────────────────────────────────
  const navSubtitle = {
    home:       `${expenses.length} expenses`,
    categories: `${stats.usedCats.length} categories`,
    detail:     activeCat || "",
    settings:   "Settings",
  }[page] ?? "";

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100dvh",
      background: `radial-gradient(ellipse 120% 60% at 50% 0%, #2a1a5a 0%, ${colors.bg} 65%)`,
      color: colors.text,
      fontFamily: font,
      overflow: "hidden",
    }}>

      {/* Top navigation bar — glass, padding-top absorbs Dynamic Island / notch */}
      <header style={{
        background: "rgba(19,15,42,0.82)",
        backdropFilter: "blur(32px) saturate(180%)",
        WebkitBackdropFilter: "blur(32px) saturate(180%)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        paddingTop: `calc(${safe.top} + 12px)`,
        paddingBottom: "12px",
        paddingLeft: "20px",
        paddingRight: "20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
      }}>
        <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: -0.5 }}>
          Receipt<span style={{ color: colors.accent }}>ly</span>
        </div>
        <div style={{ fontSize: 12, color: colors.muted }}>{navSubtitle}</div>
      </header>

      {/* Page content — key triggers mount animation on tab switch */}
      <div
        key={page}
        className="page-enter"
        style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}
        onTouchStart={onSwipeTouchStart}
        onTouchEnd={onSwipeTouchEnd}
      >
        {page === "home" && (
          <HomePage
            expenses={expenses}
            stats={stats}
            loading={flow.loading}
            flash={flow.flash}
            onScanPress={() => setShowUpload(true)}
            onExpensePress={setDetailExp}
            onDeletePress={handleDeletePress}
            onRefresh={reload}
          />
        )}
        {page === "categories" && (
          <CategoriesPage
            expenses={expenses}
            stats={stats}
            onCategoryPress={handleCategoryPress}
            onRefresh={reload}
          />
        )}
        {page === "detail" && (
          <CategoryDetailPage
            category={activeCat}
            expenses={expenses}
            onBack={() => setPage("categories")}
            onExpensePress={(exp, cat) => { setDetailExp(exp); setDetailCatFilter(cat); }}
            onDeletePress={handleDeletePress}
          />
        )}
        {page === "settings" && (
          <SettingsPage
            expenses={expenses}
            stats={stats}
            onClearAll={handleClearAll}
          />
        )}
      </div>

      {/* Bottom tab bar — glass with sliding pill */}
      <nav
        aria-label="Main navigation"
        style={{
          position: "relative",
          background: "rgba(19,15,42,0.88)",
          backdropFilter: "blur(32px) saturate(180%)",
          WebkitBackdropFilter: "blur(32px) saturate(180%)",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          zIndex: 50,
          paddingBottom: safe.bot,
          paddingTop: 6,
          flexShrink: 0,
        }}
      >
        {/* Pill that slides between tabs */}
        <div style={{
          position: "absolute",
          top: 4,
          bottom: `calc(${safe.bot} + 4px)`,
          left: `calc(${activeNavIdx} * 33.333% + 5%)`,
          width: "23.333%",
          background: "rgba(167,139,250,0.14)",
          border: "1px solid rgba(167,139,250,0.24)",
          borderRadius: 18,
          boxShadow: "0 0 18px rgba(167,139,250,0.13)",
          transition: "left 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
          pointerEvents: "none",
        }} />

        {NAV.map(n => {
          const active = page === n.id || (page === "detail" && n.id === "categories");
          return (
            <button
              key={n.id}
              onClick={() => setPage(n.id)}
              aria-label={n.label}
              aria-current={active ? "page" : undefined}
              className="tab-btn"
              style={{
                flex: 1,
                background: "none",
                border: "none",
                padding: "4px 0 8px",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                position: "relative",
                zIndex: 1,
              }}
            >
              <span style={{
                fontSize: 22,
                display: "block",
                transform: active ? "scale(1.1)" : "scale(1)",
                transition: "transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}>{n.emoji}</span>
              <span style={{
                fontSize: 10,
                fontWeight: active ? 700 : 500,
                color: active ? colors.accent : colors.muted,
                letterSpacing: 0.1,
                marginTop: 3,
                transition: "color 0.2s ease",
              }}>
                {n.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Hidden file input for web fallback */}
      <input
        ref={camera.fileRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={camera.handleFileChange}
        aria-hidden="true"
      />

      {/* ── Overlays ─────────────────────────────────────────── */}

      {showUpload && (
        <UploadSheet
          onCamera={openCamera}
          onLibrary={openLibrary}
          onFilePicker={openFilePicker}
          onClose={() => setShowUpload(false)}
        />
      )}

      {flow.stagedImages.length > 0 && !flow.loading && !showUpload && (
        <ImageStaging
          images={flow.stagedImages}
          onAddMore={() => setShowUpload(true)}
          onRemove={flow.removeStaged}
          onAnalyze={() => flow.handleAnalyze(flow.stagedImages)}
          onCancel={flow.clearStaged}
        />
      )}

      {flow.pendingGroups && (
        <ReceiptConfirm
          groups={flow.pendingGroups}
          onConfirm={flow.handleConfirmReceipt}
          onDiscard={flow.discardPending}
        />
      )}

      {flow.editingExpense && (
        <ReceiptConfirm
          groups={flow.editingExpense.groups}
          onConfirm={flow.handleUpdateExpense}
          onDiscard={flow.discardEdit}
        />
      )}

      {detailExp && (
        <ExpenseDetail
          expense={detailExp}
          categoryFilter={detailCatFilter}
          onClose={() => { setDetailExp(null); setDetailCatFilter(null); }}
          onDelete={handleDeletePress}
          onEdit={handleEditPress}
          onCategoryPress={(cat) => {
            setDetailExp(null);
            setDetailCatFilter(null);
            handleCategoryPress(cat);
          }}
        />
      )}

      {deleteTarget && (
        <DeleteConfirm
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* "Clear All" reuses the same DeleteConfirm component */}
      {showClearConfirm && (
        <DeleteConfirm
          onConfirm={() => { clearAll(); setShowClearConfirm(false); }}
          onCancel={() => setShowClearConfirm(false)}
        />
      )}

      {showNotReceipt && (
        <NotReceiptModal
          onRetry={() => { setShowNotReceipt(false); setShowUpload(true); }}
          onClose={() => setShowNotReceipt(false)}
        />
      )}

      {errorMsg && (
        <ErrorModal
          message={errorMsg}
          onClose={() => setErrorMsg(null)}
        />
      )}
    </div>
  );
}
