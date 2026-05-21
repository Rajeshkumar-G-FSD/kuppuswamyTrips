/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Coffee, 
  Utensils, 
  Moon, 
  DollarSign, 
  Plus, 
  ArrowRight,
  TrendingDown,
  Trash2,
  ListPlus,
  HelpCircle,
  CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Expense, Member, Trip, ExpenseCategory, MealType, Settlement } from '../types';
import { calculateSettlements } from '../utils';

interface ExpensesViewProps {
  activeTrip: Trip;
  expenses: Expense[];
  members: Member[];
  onAddExpense: (expenseData: {
    day: number;
    mealType: MealType;
    title: string;
    amount: number;
    paidById: string;
    category: ExpenseCategory;
    notes?: string;
  }) => void;
  onDeleteExpense: (expenseId: string) => void;
  onToggleDinnerSkip: (dayNo: number, isSkipped: boolean) => void;
}

export default function ExpensesView({
  activeTrip,
  expenses,
  members,
  onAddExpense,
  onDeleteExpense,
  onToggleDinnerSkip,
}: ExpensesViewProps) {
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [formDay, setFormDay] = useState<number>(1);
  const [amount, setAmount] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [paidById, setPaidById] = useState<string>('');
  const [category, setCategory] = useState<ExpenseCategory>('Food');
  const [mealType, setMealType] = useState<MealType>('Breakfast');
  const [notes, setNotes] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Trip members
  const tripMembers = members.filter((m) => activeTrip.memberIds.includes(m.id));

  // Skip dinners tracking map (storing in local states or resolving)
  const isDinnerSkipped = expenses.some(
    (e) => e.tripId === activeTrip.id && e.day === selectedDay && e.mealType === 'Dinner' && e.skipped === true
  );

  // Active non-skipped expenses for this active trip
  const tripExpenses = expenses.filter(e => e.tripId === activeTrip.id);
  const filteredDayExpenses = tripExpenses.filter(e => e.day === selectedDay);

  // Calculate meal category total amounts on the active selected day
  const getMealTotal = (mType: MealType) => {
    return filteredDayExpenses
      .filter((e) => e.mealType === mType && !e.skipped)
      .reduce((sum, e) => sum + e.amount, 0);
  };

  const breakfastTotal = getMealTotal('Breakfast');
  const lunchTotal = getMealTotal('Lunch');
  const teaSnacksTotal = getMealTotal('Tea & Snacks');
  const dinnerTotal = getMealTotal('Dinner');
  const otherTotal = getMealTotal('Other');

  // Compute calculated settlements for the active trip using Splitwise algorithm
  const settlements: Settlement[] = calculateSettlements(expenses, activeTrip);

  // Get member details
  const getMemberMeta = (id: string) => {
    const m = members.find((u) => u.id === id);
    return m ? { name: m.name, initials: m.initials, avatar: m.avatarUrl } : { name: 'Unknown', initials: 'UN', avatar: '' };
  };

  // Form submission handler
  const handleAddExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setErrorMessage('Please type a valid payment amount (>0)');
      return;
    }
    if (!paidById) {
      setErrorMessage('Please pick who paid the expense.');
      return;
    }
    if (!title.trim()) {
      setErrorMessage('Please type an expense summary or title.');
      return;
    }

    onAddExpense({
      day: formDay,
      mealType,
      title: title.trim(),
      amount: parseFloat(amount),
      paidById,
      category,
      notes: notes.trim() || undefined,
    });

    // Automatically navigate view to the logged day
    setSelectedDay(formDay);

    // Reset controls
    setAmount('');
    setTitle('');
    setNotes('');
    setErrorMessage('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full flex-1 flex flex-col lg:flex-row gap-6"
    >
      {/* Left Column: Expenses list */}
      <div className="flex-1 flex flex-col gap-6">
        {/* Day selection tabs */}
        <div className="flex gap-2.5 overflow-x-auto pb-2 border-b border-outline-variant/15 select-none scrollbar-none">
          {(() => {
            const loggedDays = Array.from(new Set(tripExpenses.map(e => e.day)));
            if (!loggedDays.includes(1)) {
              loggedDays.push(1);
            }
            const sortedDays = loggedDays.sort((a, b) => a - b);
            return sortedDays.map((dNum) => {
              const daysWeekName = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
              const isSelected = selectedDay === dNum;
              return (
                <button
                  key={dNum}
                  type="button"
                  onClick={() => setSelectedDay(dNum)}
                  className={`px-4 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all focus:outline-none capitalize cursor-pointer ${
                    isSelected
                      ? 'bg-primary text-on-primary shadow-xs scale-[1.02]'
                      : 'bg-surface-container-high text-on-surface hover:bg-surface-variant'
                  }`}
                >
                  Day {dNum} ({daysWeekName[(dNum - 1) % 7]})
                </button>
              );
            });
          })()}
        </div>

        {/* Categories by section */}
        <div className="space-y-6">
          {/* A. Breakfast Section */}
          <div className="glass-card rounded-2xl p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4 border-b border-outline-variant/10 pb-3">
              <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
                <Coffee className="w-5 h-5 text-tertiary-container" />
                <span>Breakfast Items</span>
              </h3>
              <span className="text-xs font-bold text-on-surface-variant bg-surface-container/60 px-3 py-1 rounded-full border border-outline-variant/5">
                ₹{breakfastTotal.toFixed(2)} Total
              </span>
            </div>

            <div className="space-y-2.5">
              {filteredDayExpenses.filter((e) => e.mealType === 'Breakfast' && !e.skipped).length === 0 ? (
                <p className="text-[13px] text-on-surface-variant font-medium py-3 italic">No breakfast logged for this day. Fill the quick form on the right.</p>
              ) : (
                filteredDayExpenses
                  .filter((e) => e.mealType === 'Breakfast' && !e.skipped)
                  .map((exp) => {
                    const payerMeta = getMemberMeta(exp.paidById);
                    return (
                      <div key={exp.id} className="flex justify-between items-center bg-surface-bright/80 p-3 rounded-xl border border-outline-variant/10 hover:shadow-xs transition-all duration-200 group">
                        <div className="flex items-center gap-3 min-w-0">
                          {payerMeta.avatar ? (
                            <img alt={payerMeta.name} src={payerMeta.avatar} className="w-9 h-9 rounded-full object-cover" referrerPolicy="referrer" />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-xs">{payerMeta.initials}</div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-on-surface text-sm truncate">{exp.title}</p>
                            <p className="text-xs text-on-surface-variant truncate">Paid by {payerMeta.name}</p>
                          </div>
                        </div>
                        <div className="text-right flex items-center gap-3 pl-2 flex-shrink-0">
                          <div>
                            <p className="font-bold text-on-surface text-sm font-mono">₹{exp.amount.toFixed(2)}</p>
                            <span className="text-[10px] text-secondary font-bold inline-block">Settled</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => onDeleteExpense(exp.id)}
                            className="text-on-surface-variant hover:text-error hover:bg-error/10 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity focus:outline-none"
                            title="Delete expense"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>

          {/* B. Lunch Section */}
          <div className="glass-card rounded-2xl p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4 border-b border-outline-variant/10 pb-3">
              <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
                <Utensils className="w-5 h-5 text-primary" />
                <span>Lunch Items</span>
              </h3>
              <span className="text-xs font-bold text-on-surface-variant bg-surface-container/60 px-3 py-1 rounded-full border border-outline-variant/5">
                ₹{lunchTotal.toFixed(2)} Total
              </span>
            </div>

            <div className="space-y-2.5">
              {filteredDayExpenses.filter((e) => e.mealType === 'Lunch' && !e.skipped).length === 0 ? (
                <p className="text-[13px] text-on-surface-variant font-medium py-3 italic">No lunch logged for this day.</p>
              ) : (
                filteredDayExpenses
                  .filter((e) => e.mealType === 'Lunch' && !e.skipped)
                  .map((exp) => {
                    const payerMeta = getMemberMeta(exp.paidById);
                    return (
                      <div key={exp.id} className="flex justify-between items-center bg-surface-bright/80 p-3 rounded-xl border border-outline-variant/10 hover:shadow-xs transition-all duration-200 group">
                        <div className="flex items-center gap-3 min-w-0">
                          {payerMeta.avatar ? (
                            <img alt={payerMeta.name} src={payerMeta.avatar} className="w-9 h-9 rounded-full object-cover" />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center font-bold text-xs">{payerMeta.initials}</div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-on-surface text-sm truncate">{exp.title}</p>
                            <p className="text-xs text-on-surface-variant truncate">Paid by {payerMeta.name}</p>
                          </div>
                        </div>
                        <div className="text-right flex items-center gap-3 pl-2 flex-shrink-0">
                          <div>
                            <p className="font-bold text-on-surface text-sm font-mono">₹{exp.amount.toFixed(2)}</p>
                            <span className="text-[10px] text-primary font-bold inline-block">Pending Split</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => onDeleteExpense(exp.id)}
                            className="text-on-surface-variant hover:text-error hover:bg-error/10 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity focus:outline-none"
                            title="Delete expense"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>

          {/* Tea & Snacks Section */}
          <div className="glass-card rounded-2xl p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4 border-b border-outline-variant/10 pb-3">
              <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
                <Coffee className="w-5 h-5 text-secondary" />
                <span>Tea &amp; Snacks Items</span>
              </h3>
              <span className="text-xs font-bold text-on-surface-variant bg-surface-container/60 px-3 py-1 rounded-full border border-outline-variant/5">
                ₹{teaSnacksTotal.toFixed(2)} Total
              </span>
            </div>

            <div className="space-y-2.5">
              {filteredDayExpenses.filter((e) => e.mealType === 'Tea & Snacks' && !e.skipped).length === 0 ? (
                <p className="text-[13px] text-on-surface-variant font-medium py-3 italic">No tea &amp; snacks logged for this day.</p>
              ) : (
                filteredDayExpenses
                  .filter((e) => e.mealType === 'Tea & Snacks' && !e.skipped)
                  .map((exp) => {
                    const payerMeta = getMemberMeta(exp.paidById);
                    return (
                      <div key={exp.id} className="flex justify-between items-center bg-surface-bright/80 p-3 rounded-xl border border-outline-variant/10 hover:shadow-xs transition-all duration-200 group">
                        <div className="flex items-center gap-3 min-w-0">
                          {payerMeta.avatar ? (
                            <img alt={payerMeta.name} src={payerMeta.avatar} className="w-9 h-9 rounded-full object-cover" />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-secondary text-white flex items-center justify-center font-bold text-xs">{payerMeta.initials}</div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-on-surface text-sm truncate">{exp.title}</p>
                            <p className="text-xs text-on-surface-variant truncate">Paid by {payerMeta.name}</p>
                          </div>
                        </div>
                        <div className="text-right flex items-center gap-3 pl-2 flex-shrink-0">
                          <div>
                            <p className="font-bold text-on-surface text-sm font-mono">₹{exp.amount.toFixed(2)}</p>
                            <span className="text-[10px] text-indigo-500 font-bold inline-block">Shared tea list</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => onDeleteExpense(exp.id)}
                            className="text-on-surface-variant hover:text-error hover:bg-error/10 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity focus:outline-none"
                            title="Delete expense"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>

          {/* C. Dinner Section with Skipped toggle */}
          <div className="glass-card rounded-2xl p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4 border-b border-outline-variant/10 pb-3">
              <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
                <Moon className="w-5 h-5 text-on-surface-variant" />
                <span>Dinner Items</span>
              </h3>
              <div className="flex items-center gap-5">
                {/* Skipped Toggle Slider checkbox */}
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isDinnerSkipped}
                    onChange={(e) => onToggleDinnerSkip(selectedDay, e.target.checked)}
                    className="form-checkbox h-4.5 w-4.5 text-primary rounded border-outline-variant focus:ring-primary focus:ring-offset-0 bg-surface-container cursor-pointer"
                  />
                  <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">Skipped Dinner</span>
                </label>

                {!isDinnerSkipped && (
                  <span className="text-xs font-bold text-on-surface-variant bg-surface-container/60 px-3 py-1 rounded-full border border-outline-variant/5">
                    ₹{dinnerTotal.toFixed(2)} Total
                  </span>
                )}
              </div>
            </div>

            <div className={`transition-all duration-300 ${isDinnerSkipped ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
              {isDinnerSkipped ? (
                <div className="flex justify-center items-center py-6 bg-surface-container/40 border border-outline-variant/20 rounded-xl">
                  <p className="text-xs font-semibold text-on-surface-variant flex items-center gap-1.5 uppercase tracking-wide">
                    👋 Dinner was skipped on Day {selectedDay} (Mon)
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredDayExpenses.filter((e) => e.mealType === 'Dinner' && !e.skipped).length === 0 ? (
                    <div className="flex justify-center items-center py-8 border-2 border-dashed border-outline-variant/20 rounded-xl text-on-surface-variant bg-surface/50">
                      <button
                        type="button"
                        onClick={() => {
                          setMealType('Dinner');
                          setCategory('Food');
                          setTitle('Group Dinner Banquet');
                          const textInput = document.getElementById('amount');
                          if (textInput) textInput.focus();
                        }}
                        className="font-semibold text-[13px] flex items-center gap-2 text-primary hover:underline cursor-pointer focus:outline-none"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Day {selectedDay} Dinner Expense</span>
                      </button>
                    </div>
                  ) : (
                    filteredDayExpenses
                      .filter((e) => e.mealType === 'Dinner' && !e.skipped)
                      .map((exp) => {
                        const payerMeta = getMemberMeta(exp.paidById);
                        return (
                          <div key={exp.id} className="flex justify-between items-center bg-surface-bright/80 p-3 rounded-xl border border-outline-variant/10 hover:shadow-xs transition-all duration-200 group">
                            <div className="flex items-center gap-3 min-w-0">
                              {payerMeta.avatar ? (
                                <img alt={payerMeta.name} src={payerMeta.avatar} className="w-9 h-9 rounded-full object-cover" />
                              ) : (
                                <div className="w-9 h-9 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-xs">{payerMeta.initials}</div>
                              )}
                              <div className="min-w-0">
                                <p className="font-semibold text-on-surface text-sm truncate">{exp.title}</p>
                                <p className="text-xs text-on-surface-variant truncate">Paid by {payerMeta.name}</p>
                              </div>
                            </div>
                            <div className="text-right flex items-center gap-3 pl-2 flex-shrink-0">
                              <div>
                                <p className="font-bold text-on-surface text-sm font-mono">₹{exp.amount.toFixed(2)}</p>
                                <span className="text-[10px] text-secondary font-bold inline-block">Settled</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => onDeleteExpense(exp.id)}
                                className="text-on-surface-variant hover:text-error hover:bg-error/10 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity focus:outline-none"
                                title="Delete expense"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                  )}
                </div>
              )}
            </div>
          </div>

          {/* D. Other Non-Meal Trip Expenses Section */}
          <div className="glass-card rounded-2xl p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4 border-b border-outline-variant/10 pb-3">
              <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
                <ListPlus className="w-5 h-5 text-outline" />
                <span>Other &amp; Transport Costs</span>
              </h3>
              <span className="text-xs font-bold text-on-surface-variant bg-surface-container/60 px-3 py-1 rounded-full border border-outline-variant/5">
                ₹{otherTotal.toFixed(2)} Total
              </span>
            </div>

            <div className="space-y-2.5">
              {filteredDayExpenses.filter((e) => e.mealType === 'Other' && !e.skipped).length === 0 ? (
                <p className="text-[13px] text-on-surface-variant font-medium py-3 italic">No structural other expenses logged for this day.</p>
              ) : (
                filteredDayExpenses
                  .filter((e) => e.mealType === 'Other' && !e.skipped)
                  .map((exp) => {
                    const payerMeta = getMemberMeta(exp.paidById);
                    return (
                      <div key={exp.id} className="flex justify-between items-center bg-surface-bright/80 p-3 rounded-xl border border-outline-variant/10 hover:shadow-xs transition-all duration-200 group">
                        <div className="flex items-center gap-3 min-w-0">
                          {payerMeta.avatar ? (
                            <img alt={payerMeta.name} src={payerMeta.avatar} className="w-9 h-9 rounded-full object-cover" />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-outline/20 text-on-surface flex items-center justify-center font-bold text-xs">{payerMeta.initials}</div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-on-surface text-sm truncate">{exp.title}</p>
                            <p className="text-xs text-on-surface-variant truncate">
                              Paid by {payerMeta.name.split(' ')[0]} • Category: {exp.category}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex items-center gap-3 pl-2 flex-shrink-0">
                          <div>
                            <p className="font-bold text-on-surface text-sm font-mono">₹{exp.amount.toFixed(2)}</p>
                            <span className="text-[10px] text-primary font-bold inline-block">Shared Cost</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => onDeleteExpense(exp.id)}
                            className="text-on-surface-variant hover:text-error hover:bg-error/10 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity focus:outline-none"
                            title="Delete expense"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Entry form and Settlements display card */}
      <div className="w-full lg:w-80 flex flex-col gap-6">
        {/* Quick entry form block */}
        <div className="glass-card rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex flex-col gap-0.5 mb-5 select-none">
            <h3 className="text-lg font-bold text-on-surface tracking-tight">Quick Entry</h3>
            <p className="text-xs text-on-surface-variant">Log an expense right on the spot</p>
          </div>

          <form onSubmit={handleAddExpenseSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-2.5 bg-error-container/45 text-error text-xs font-semibold rounded-lg border border-error/10">
                {errorMessage}
              </div>
            )}

            {/* Float input: Amount */}
            <div className="relative">
              <input
                id="amount"
                type="number"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount (₹)"
                required
                className="block px-3 py-3 w-full text-sm text-on-surface bg-surface-bright/80 rounded-lg border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-on-surface-variant font-mono font-semibold"
              />
            </div>

            {/* Input: Title description */}
            <div className="relative">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What did you pay for? (e.g. Sushi)"
                required
                className="block px-3 py-3 w-full text-sm text-on-surface bg-surface-bright/80 rounded-lg border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-on-surface-variant font-medium"
              />
            </div>

            {/* Who paid & Which Day Grid */}
            <div className="grid grid-cols-2 gap-2">
              {/* Selector: Paid By */}
              <div>
                <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5 font-sans">Who paid?</label>
                <select
                  value={paidById}
                  onChange={(e) => setPaidById(e.target.value)}
                  className="bg-surface-bright border border-outline-variant/30 text-on-surface text-xs rounded-lg focus:ring-2 focus:ring-primary block w-full p-2 cursor-pointer outline-none font-semibold"
                >
                  <option value="" disabled>Who...</option>
                  {tripMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selector: Which Day */}
              <div>
                <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5 font-sans">Which Day?</label>
                <select
                  value={formDay}
                  onChange={(e) => setFormDay(parseInt(e.target.value))}
                  className="bg-surface-bright border border-outline-variant/30 text-on-surface text-xs rounded-lg focus:ring-2 focus:ring-primary block w-full p-2 cursor-pointer outline-none font-semibold"
                >
                  <option value={1}>Day 1</option>
                  <option value={2}>Day 2</option>
                  <option value={3}>Day 3</option>
                  <option value={4}>Day 4</option>
                  <option value={5}>Day 5</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* Category */}
              <div>
                <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5 font-sans">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                  className="bg-surface-bright border border-outline-variant/30 text-on-surface text-xs rounded-lg focus:ring-2 focus:ring-primary block w-full p-2 cursor-pointer outline-none font-semibold"
                >
                  <option value="Food">Food &amp; Dining</option>
                  <option value="Transport">Transport</option>
                  <option value="Accommodation">Accommodation</option>
                  <option value="Activities">Activities</option>
                  <option value="Tea & Snacks">Tea &amp; Snacks</option>
                  <option value="Sightseeing">Sightseeing</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Medical">Medical</option>
                  <option value="Other">Other Items</option>
                </select>
              </div>

              {/* Meal Block Selection */}
              <div>
                <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5 font-sans">Trip Section</label>
                <select
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value as MealType)}
                  className="bg-surface-bright border border-outline-variant/30 text-on-surface text-xs rounded-lg focus:ring-2 focus:ring-primary block w-full p-2 cursor-pointer outline-none font-semibold"
                >
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Tea & Snacks">Tea &amp; Snacks</option>
                  <option value="Dinner">Dinner</option>
                  <option value="Other">Other Category</option>
                </select>
              </div>
            </div>

            {/* Notes optional */}
            <div>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes... (optional)"
                className="bg-surface-bright border border-outline-variant/30 text-on-surface text-xs rounded-lg focus:ring-2 focus:ring-primary block w-full p-2.5 outline-none font-medium"
              />
            </div>

            <button
              type="submit"
              className="w-full text-on-primary bg-primary hover:bg-primary-container font-semibold rounded-lg text-sm px-5 py-3 text-center transition-all shadow-xs cursor-pointer active:scale-98"
            >
              Add Expense
            </button>
          </form>
        </div>

        {/* Settlement Transfers calculation outputs */}
        <div className="glass-card rounded-2xl p-6 flex flex-col">
          <h3 className="font-bold text-base text-on-surface mb-0.5 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-secondary" />
            <span>Settlements ledger</span>
          </h3>
          <p className="text-xs text-on-surface-variant mb-4 font-semibold uppercase tracking-wider">Suggested transfers</p>
          
          <ul className="space-y-3">
            {settlements.length === 0 ? (
              <div className="text-center py-4 text-xs font-semibold text-secondary flex items-center gap-1.5 justify-center bg-secondary/10 p-2.5 rounded-lg">
                <CheckCircle className="w-4 h-4 text-secondary" />
                <span>Balances are settled!</span>
              </div>
            ) : (
              settlements.map((trans, idx) => {
                const fromMeta = getMemberMeta(trans.fromId);
                const toMeta = getMemberMeta(trans.toId);

                return (
                  <li key={idx} className="flex items-center justify-between text-sm bg-surface-bright/50 p-2.5 rounded-xl border border-outline-variant/5">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-7 h-7 rounded-full bg-secondary-container text-on-secondary-container text-xs flex items-center justify-center font-bold shadow-xs select-none"
                        title={fromMeta.name}
                      >
                        {fromMeta.initials}
                      </div>
                      <ArrowRight className="w-4 h-4 text-outline" />
                      <div 
                        className="w-7 h-7 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-xs flex items-center justify-center font-bold shadow-xs select-none"
                        title={toMeta.name}
                      >
                        {toMeta.initials}
                      </div>
                    </div>
                    <span className="font-bold text-on-surface font-mono">₹{trans.amount.toFixed(2)}</span>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}
