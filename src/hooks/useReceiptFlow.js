import { useState, useCallback, useRef } from "react";
import { analyzeReceipt, buildExpense } from "../services/receiptAnalyzer";

/**
 * Encapsulates the full receipt lifecycle:
 * capture → stage → analyze → confirm/edit → save
 *
 * @param {object} deps
 * @param {function} deps.addExpense
 * @param {function} deps.updateExpense
 * @param {function} deps.onNotReceipt  - called when AI says not a receipt
 * @param {function} deps.onError       - called with an error message string
 */
export function useReceiptFlow({ addExpense, updateExpense, onNotReceipt, onError }) {
  const [loading,        setLoading]       = useState(false);
  const [stagedImages,   setStagedImages]  = useState([]); // [{b64, mediaType}]
  const [pendingGroups,  setPendingGroups] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);
  const [flash,          setFlash]         = useState(null);
  const flashTimer = useRef(null);

  const setFlashBriefly = useCallback((exp) => {
    clearTimeout(flashTimer.current);
    setFlash(exp);
    flashTimer.current = setTimeout(() => setFlash(null), 5000);
  }, []);

  // ── Stage ────────────────────────────────────────────────────
  const handleCapture = useCallback((b64, mediaType) => {
    setStagedImages(prev => [...prev, { b64, mediaType }]);
  }, []);

  const removeStaged = useCallback((i) => {
    setStagedImages(prev => prev.filter((_, idx) => idx !== i));
  }, []);

  const clearStaged = useCallback(() => setStagedImages([]), []);

  // ── Analyze ──────────────────────────────────────────────────
  const handleAnalyze = useCallback(async (images) => {
    setLoading(true);
    try {
      const result = await analyzeReceipt(images);
      if (result.not_receipt) {
        setStagedImages([]);
        onNotReceipt();
        return;
      }
      const groups = Array.isArray(result) ? result : [result];
      setPendingGroups(groups);
      setStagedImages([]);
    } catch (err) {
      if (err.name === "TimeoutError" || err.name === "AbortError") {
        onError("Request timed out. Please check your connection and try again.");
      } else {
        onError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [onNotReceipt, onError]);

  // ── Confirm new receipt ──────────────────────────────────────
  const handleConfirmReceipt = useCallback((editedGroups) => {
    try {
      const exp = buildExpense(editedGroups);
      addExpense(exp);
      setPendingGroups(null);
      setFlashBriefly(exp);
    } catch (err) {
      onError(err.message || "Could not save receipt");
    }
  }, [addExpense, setFlashBriefly, onError]);

  // ── Edit existing receipt ────────────────────────────────────
  const handleEditPress = useCallback((expense) => {
    const groups = expense.groups
      ? expense.groups.map(g => ({
          merchant: expense.merchant,
          date:     expense.date,
          currency: expense.currency,
          notes:    expense.notes,
          category: g.category,
          items:    g.items,
        }))
      : [{
          merchant: expense.merchant,
          date:     expense.date,
          currency: expense.currency,
          notes:    expense.notes,
          category: expense.category,
          items:    expense.items,
        }];
    setEditingExpense({ originalId: expense.id, originalAddedAt: expense.addedAt, groups });
  }, []);

  const handleUpdateExpense = useCallback((editedGroups) => {
    try {
      const built = buildExpense(editedGroups);
      updateExpense(editingExpense.originalId, {
        ...built,
        id:      editingExpense.originalId,
        addedAt: editingExpense.originalAddedAt,
      });
      setEditingExpense(null);
      setFlashBriefly(built);
    } catch (err) {
      onError(err.message || "Could not update expense");
    }
  }, [updateExpense, editingExpense, setFlashBriefly, onError]);

  return {
    // state
    loading,
    stagedImages,
    pendingGroups,
    editingExpense,
    flash,
    // actions
    handleCapture,
    handleAnalyze,
    handleConfirmReceipt,
    handleEditPress,
    handleUpdateExpense,
    // cancel helpers
    removeStaged,
    clearStaged,
    discardPending:  () => setPendingGroups(null),
    discardEdit:     () => setEditingExpense(null),
  };
}
