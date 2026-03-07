import { useState, useEffect, useMemo } from "react";

const STORAGE_KEY = "receiptly_v8";

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function useExpenses() {
  const [expenses, setExpenses] = useState(load);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  }, [expenses]);

  function addExpense(exp) {
    setExpenses(prev => [exp, ...prev]);
  }

  function deleteExpense(id) {
    setExpenses(prev => prev.filter(e => e.id !== id));
  }

  function updateExpense(id, updatedExp) {
    setExpenses(prev => prev.map(e => e.id === id ? { ...updatedExp, id } : e));
  }

  function clearAll() {
    setExpenses([]);
  }

  function reload() {
    setExpenses(load());
  }

  const stats = useMemo(() => {
    const totalSpent = expenses.reduce((s, e) => s + e.total, 0);

    const catTotals = {};
    expenses.forEach(e => {
      if (e.groups) {
        e.groups.forEach(g => {
          catTotals[g.category] = (catTotals[g.category] || 0) + g.total;
        });
      } else {
        catTotals[e.category] = (catTotals[e.category] || 0) + e.total;
      }
    });

    const monthlyTotals = {};
    expenses.forEach(e => {
      const m = e.date?.slice(0, 7);
      if (m) monthlyTotals[m] = (monthlyTotals[m] || 0) + e.total;
    });

    const topCat = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0]?.[0];
    const usedCats = Object.keys(catTotals).sort((a, b) => catTotals[b] - catTotals[a]);
    const thisMonth = new Date().toISOString().slice(0, 7);

    return { totalSpent, catTotals, monthlyTotals, topCat, usedCats, thisMonth };
  }, [expenses]);

  return { expenses, addExpense, updateExpense, deleteExpense, clearAll, reload, stats };
}
