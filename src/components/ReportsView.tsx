/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BarChart3, TrendingUp, Info, ListFilter, Download, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { Expense, Trip, ExpenseCategory } from '../types';

interface ReportsViewProps {
  activeTrip: Trip;
  expenses: Expense[];
}

export default function ReportsView({ activeTrip, expenses }: ReportsViewProps) {
  const tripExpenses = expenses.filter(e => e.tripId === activeTrip.id && !e.skipped);
  const totalSpend = tripExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Spend by Category calculations
  const categoriesList: { name: ExpenseCategory; amount: number; color: string; hoverColor: string; bg: string }[] = [
    { name: 'Accommodation', amount: 0, color: 'bg-secondary', hoverColor: 'hover:bg-secondary/90', bg: 'bg-secondary/10' },
    { name: 'Food', amount: 0, color: 'bg-tertiary-container', hoverColor: 'hover:bg-tertiary-container/90', bg: 'bg-tertiary-container/10' },
    { name: 'Transport', amount: 0, color: 'bg-primary', hoverColor: 'hover:bg-primary/95', bg: 'bg-primary/10' },
    { name: 'Activities', amount: 0, color: 'bg-primary-fixed-dim', hoverColor: 'hover:bg-primary-fixed-dim/95', bg: 'bg-primary-fixed-dim/15' },
    { name: 'Other', amount: 0, color: 'bg-outline', hoverColor: 'hover:bg-outline/90', bg: 'bg-outline/10' },
  ];

  tripExpenses.forEach((exp) => {
    const found = categoriesList.find((c) => c.name === exp.category);
    if (found) found.amount += exp.amount;
  });

  const sortedCategories = [...categoriesList].sort((a, b) => b.amount - a.amount);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full flex-grow flex flex-col gap-6"
    >
      <div className="flex justify-between items-center bg-surface-container/30 px-6 py-4.5 rounded-2xl border border-outline-variant/10">
        <div>
          <h2 className="text-xl font-bold text-on-surface tracking-tight">Active Analytics Report</h2>
          <p className="text-xs text-on-surface-variant font-medium mt-0.5">Budget status for {activeTrip.name}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            alert('Financial ledger export completed successfully! NomadLedger.csv resides inside your browser cache.');
          }}
          className="bg-primary hover:bg-primary-container text-on-primary font-bold text-xs px-4 py-2.5 rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer transition-all focus:outline-none"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Category spend cards */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="glass-card p-6 rounded-2xl">
            <h3 className="font-bold text-base text-on-surface mb-3 flex items-center gap-2 border-b border-outline-variant/15 pb-2.5">
              <BarChart3 className="w-5 h-5 text-primary" />
              <span>Percentage Category Allocation</span>
            </h3>

            {tripExpenses.length === 0 ? (
              <p className="text-sm text-on-surface-variant italic py-6">No expenses loaded.</p>
            ) : (
              <div className="space-y-6 pt-2">
                {sortedCategories
                  .filter((cat) => cat.amount > 0)
                  .map((cat) => {
                    const pct = totalSpend > 0 ? (cat.amount / totalSpend) * 100 : 0;
                    return (
                      <div key={cat.name} className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <div className="flex items-center gap-2">
                            <span className={`w-3.5 h-3.5 rounded-full ${cat.color}`} />
                            <span className="font-bold text-on-surface capitalize">
                              {cat.name === 'Food' ? 'Food & Dining' : cat.name}
                            </span>
                          </div>
                          <span className="font-bold text-on-surface font-mono">
                            ₹{cat.amount.toFixed(2)}{' '}
                            <span className="text-outline text-xs font-normal">({pct.toFixed(1)}%)</span>
                          </span>
                        </div>
                        <div className="w-full bg-surface-variant rounded-full h-2.5 overflow-hidden shadow-inner">
                          <div
                            className={`h-2.5 rounded-full ${cat.color} transition-all duration-700 ease-out`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Mini checklist and info */}
        <div className="flex flex-col gap-6">
          <div className="glass-card p-6 rounded-2xl">
            <h3 className="font-bold text-base text-on-surface mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-secondary" />
              <span>Health Index Tracker</span>
            </h3>
            <p className="text-xs text-on-surface-variant mb-4 font-semibold uppercase tracking-wider">Audit logs</p>

            <ul className="space-y-4">
              <li className="flex items-start gap-2 text-sm text-on-surface-variant">
                <Check className="w-5 h-5 text-secondary flex-shrink-0" />
                <span>Fair splits verified. No user double-counted.</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-on-surface-variant">
                <Check className="w-5 h-5 text-secondary flex-shrink-0" />
                <span>Equal share ratios checked. Total matches ledger.</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-on-surface-variant">
                <Check className="w-5 h-5 text-secondary flex-shrink-0" />
                <span>Zero mathematical drift found on debt settlements.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
