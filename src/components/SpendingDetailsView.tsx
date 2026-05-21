/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Users, 
  TrendingUp, 
  MapPin, 
  Calendar, 
  HelpCircle, 
  CheckCircle, 
  X, 
  DollarSign, 
  CreditCard, 
  ArrowRight, 
  Info,
  Utensils,
  Plane,
  Hotel,
  Compass,
  Tag,
  PieChart,
  Layers,
  Heart,
  Baby
} from 'lucide-react';
import { motion } from 'motion/react';
import { Expense, Member, Trip, ExpenseCategory, MealType, Settlement } from '../types';
import { calculateSettlements } from '../utils';

interface SpendingDetailsViewProps {
  activeTrip: Trip;
  expenses: Expense[];
  members: Member[];
  onClose?: () => void;
}

export default function SpendingDetailsView({
  activeTrip,
  expenses,
  members,
  onClose,
}: SpendingDetailsViewProps) {
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>('All');

  // Filter list of expenses corresponding to our active trip workspace
  const tripExpenses = expenses.filter(e => e.tripId === activeTrip.id && !e.skipped);
  const totalTripExpense = tripExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Active family members registered in the current trip workspace
  const tripMembers = members.filter((m) => activeTrip.memberIds.includes(m.id));
  const tripMembersCount = tripMembers.length;

  // Fair budget split per-person share calculation
  const perPersonShare = tripMembersCount > 0 ? totalTripExpense / tripMembersCount : 0;

  // Compute calculated settlements for the active trip
  const settlements: Settlement[] = calculateSettlements(expenses, activeTrip);

  // Categories list definition
  const categoriesList: ExpenseCategory[] = [
    'Food',
    'Transport',
    'Accommodation',
    'Activities',
    'Tea & Snacks',
    'Sightseeing',
    'Shopping',
    'Medical',
    'Other'
  ];

  // Map icons for display purposes
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Food': return <Utensils className="w-4 h-4 text-rose-500" />;
      case 'Transport': return <Plane className="w-4 h-4 text-sky-500" />;
      case 'Accommodation': return <Hotel className="w-4 h-4 text-emerald-500" />;
      case 'Activities': return <Compass className="w-4 h-4 text-amber-500" />;
      case 'Tea & Snacks': return <Utensils className="w-4 h-4 text-purple-500" />;
      case 'Sightseeing': return <MapPin className="w-4 h-4 text-indigo-500" />;
      default: return <Tag className="w-4 h-4 text-gray-500" />;
    }
  };

  // Compile contribution and balance lists per user
  const memberContributions: Record<string, number> = {};
  tripMembers.forEach(m => {
    memberContributions[m.id] = 0;
  });

  tripExpenses.forEach(e => {
    if (memberContributions[e.paidById] !== undefined) {
      memberContributions[e.paidById] += e.amount;
    }
  });

  // Category summary array for spending viz
  const categorySummary = categoriesList.map(cat => {
    const amt = tripExpenses.filter(e => e.category === cat).reduce((sum, e) => sum + e.amount, 0);
    return {
      name: cat,
      amount: amt,
      percentage: totalTripExpense > 0 ? (amt / totalTripExpense) * 100 : 0
    };
  }).filter(c => c.amount > 0).sort((a, b) => b.amount - a.amount);

  // Day summary array for spending patterns
  const daysInTrip = [1, 2, 3, 4, 5];
  const dailySummary = daysInTrip.map(dayNum => {
    const amt = tripExpenses.filter(e => e.day === dayNum).reduce((sum, e) => sum + e.amount, 0);
    return {
      day: dayNum,
      amount: amt,
      percentage: totalTripExpense > 0 ? (amt / totalTripExpense) * 100 : 0
    };
  }).filter(d => d.amount > 0);

  // Apply visual category and day filters on detailed ledger list
  const filteredLedgerExpenses = tripExpenses.filter(e => {
    const matchesCategory = selectedCategoryFilter === 'All' || e.category === selectedCategoryFilter;
    const matchesDay = selectedDayFilter === 'All' || e.day === Number(selectedDayFilter);
    return matchesCategory && matchesDay;
  });

  const getMemberMeta = (memberId: string) => {
    const m = members.find(u => u.id === memberId);
    return m ? { name: m.name, initials: m.initials } : { name: 'Unknown Contributor', initials: '?' };
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full flex-grow flex flex-col gap-6"
    >
      {/* Page header */}
      <div className="flex justify-between items-center bg-surface-container-low p-5 rounded-2xl border border-outline-variant/15 shadow-xs">
        <div className="text-left">
          <span className="text-[10px] font-bold tracking-widest text-primary uppercase bg-primary/10 rounded-full px-3 py-1 mb-2 inline-block">Nomad Ledger Analytics</span>
          <h2 className="text-xl font-bold text-on-surface">View Spending Details</h2>
          <p className="text-xs text-on-surface-variant font-medium mt-1">
            Real-time visual breakdown of spending patterns, active family contributions, and peer-to-peer settlement transfers.
          </p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 px-3.5 hover:bg-surface-variant text-on-surface-variant hover:text-on-surface hover:ring-1 hover:ring-outline-variant/15 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold font-sans"
          >
            <X className="w-4 h-4 text-primary" />
            <span>Close</span>
          </button>
        )}
      </div>

      {/* KPI Stats overview row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/15 text-left flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider">Total Money Spent</p>
            <h3 className="text-3xl font-bold font-mono text-primary mt-1">
              ₹{totalTripExpense.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
          </div>
          <p className="text-[10px] text-on-surface-variant mt-3 font-medium bg-surface-variant/40 p-2 rounded-lg">
            Calculated across {tripExpenses.length} transaction entries loaded from Firestore DB.
          </p>
        </div>

        <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/15 text-left flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider">Per-Person Fair Share</p>
            <h3 className="text-3xl font-bold font-mono text-secondary mt-1">
              ₹{perPersonShare.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
          </div>
          <p className="text-[10px] text-on-surface-variant mt-3 font-medium bg-surface-variant/40 p-2 rounded-lg">
            Split completely equally across {tripMembersCount} registered family contributors.
          </p>
        </div>

        <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/15 text-left flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider">UPI / Cash Settlements</p>
            <h3 className="text-3xl font-bold font-mono text-tertiary-container mt-1">
              {settlements.length} Transfers
            </h3>
          </div>
          <p className="text-[10px] text-on-surface-variant mt-3 font-medium bg-surface-variant/40 p-2 rounded-lg">
            Direct transactions required to fully settle split balances.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT PANEL: WHO CONTRIBUTED (Settlements & Balance Sheets) */}
        <div className="lg:col-span-5 space-y-6 flex flex-col">
          {/* Contribution ledger */}
          <div className="bg-surface-container-low rounded-2xl p-5 border border-outline-variant/15 text-left">
            <h3 className="text-sm font-bold text-on-surface flex items-center gap-2 mb-4 border-b border-outline-variant/10 pb-2.5">
              <Users className="w-4.5 h-4.5 text-primary" />
              <span>Who is the Contributor (Balance Card)</span>
            </h3>

            {tripMembersCount === 0 ? (
              <p className="text-xs text-on-surface-variant italic">No family members registered for this trip.</p>
            ) : (
              <div className="space-y-3">
                {tripMembers.map((memb) => {
                  const contributed = memberContributions[memb.id] || 0;
                  const balance = contributed - perPersonShare;
                  const isCreditor = balance > 0.05;
                  const isDebtor = balance < -0.05;

                  return (
                    <div key={memb.id} className="bg-surface-bright p-3 rounded-xl border border-outline-variant/10 flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center font-mono">
                            {memb.initials}
                          </div>
                          <div>
                            <h5 className="text-xs font-bold text-on-surface leading-tight">{memb.name}</h5>
                            <p className="text-[10px] text-on-surface-variant font-medium mt-0.5">
                              Contributed: <strong className="text-on-surface">₹{contributed.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</strong>
                            </p>

                            {memb.spouse && (
                              <p className="text-[9px] text-rose-500 font-bold flex items-center gap-0.5 mt-0.5 leading-none">
                                <Heart className="w-2.5 h-2.5 fill-rose-500/20 text-rose-500 inline" />
                                <span>Spouse: {memb.spouse}</span>
                              </p>
                            )}
                            {memb.childrenUnder13 && memb.childrenUnder13.length > 0 && (
                              <p className="text-[9px] text-blue-500 font-bold flex items-center gap-0.5 mt-0.5 leading-none">
                                <Baby className="w-2.5 h-2.5 text-blue-500 inline" />
                                <span>Kids: {memb.childrenUnder13.join(', ')}</span>
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Status label */}
                        {isCreditor ? (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-green-500/10 text-green-600 dark:text-green-400 font-mono">
                            Gets back ₹{balance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                          </span>
                        ) : isDebtor ? (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono font-semibold">
                            Owes ₹{Math.abs(balance).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-gray-500/15 text-gray-500 font-mono">
                            Settled Up
                          </span>
                        )}
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-surface-container-high rounded-full h-1">
                        <div 
                          className="bg-primary h-1 rounded-full transition-all duration-300" 
                          style={{ width: `${totalTripExpense > 0 ? (contributed / totalTripExpense) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Settle Up transfers panel */}
          <div className="bg-surface-container-low rounded-2xl p-5 border border-outline-variant/15 text-left">
            <h3 className="text-sm font-bold text-on-surface flex items-center gap-2 mb-3 border-b border-outline-variant/10 pb-2.5">
              <CreditCard className="w-4.5 h-4.5 text-secondary" />
              <span>UPI &amp; Settle-Up Directions</span>
            </h3>

            {settlements.length === 0 ? (
              <div className="py-6 text-center text-xs text-on-surface-variant font-medium bg-surface-bright rounded-xl border border-dashed border-outline-variant/20">
                🚀 Everyone is perfectly settled up! No money remains to be transferred.
              </div>
            ) : (
              <div className="space-y-2.5">
                {settlements.map((trans, idx) => {
                  const fromUser = getMemberMeta(trans.fromId);
                  const toUser = getMemberMeta(trans.toId);
                  return (
                    <div key={idx} className="bg-surface-bright p-3.5 rounded-xl border border-outline-variant/10 flex items-center justify-between shadow-2xs hover:shadow-xs transition-shadow">
                      <div className="flex items-center gap-1.5">
                        <div className="w-7 h-7 rounded-full bg-amber-500/10 text-amber-600 font-bold text-2xs flex items-center justify-center font-mono">
                          {fromUser.initials}
                        </div>
                        <span className="text-[11px] font-semibold text-on-surface">{fromUser.name}</span>
                      </div>
                      
                      <div className="flex flex-col items-center flex-grow mx-2">
                        <span className="text-xs font-extrabold text-secondary font-mono">₹{trans.amount.toLocaleString()}</span>
                        <div className="flex items-center text-[9px] text-on-surface-variant font-bold gap-0.5 mt-0.5">
                          <span>Pay via UPI</span>
                          <ArrowRight className="w-2.5 h-2.5 text-primary" />
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-semibold text-on-surface">{toUser.name}</span>
                        <div className="w-7 h-7 rounded-full bg-green-500/10 text-green-600 font-bold text-2xs flex items-center justify-center font-mono">
                          {toUser.initials}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: WHERE SPENT (Ledger & Custom Filters) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Detailed ledger listings */}
          <div className="bg-surface-container-low rounded-2xl p-5 border border-outline-variant/15 text-left flex flex-col h-full min-h-[450px]">
            <div className="flex flex-wrap justify-between items-center gap-2 mb-4 pb-2 border-b border-outline-variant/10">
              <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                <Layers className="w-4.5 h-4.5 text-primary" />
                <span>Expenditures Breakdown Ledger</span>
              </h3>
              
              <div className="flex items-center gap-1.5 text-2xs font-bold text-on-surface-variant bg-surface-bright px-3 py-1 rounded-full border border-outline-variant/10">
                <span>{filteredLedgerExpenses.length} items filtered</span>
              </div>
            </div>

            {/* Micro Filter Selector Tabs */}
            <div className="flex flex-wrap gap-2.5 mb-4 p-2 bg-surface-bright rounded-xl border border-outline-variant/10">
              <div className="flex flex-col gap-1 w-full sm:w-auto">
                <span className="text-[9px] font-extrabold text-on-surface-variant uppercase tracking-wider pl-1 font-sans">Filter by Category</span>
                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className="bg-surface-container border border-outline-variant/30 text-xs rounded-lg p-1.5 text-on-surface outline-none cursor-pointer font-semibold min-w-[120px]"
                >
                  <option value="All">All Categories</option>
                  {categoriesList.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1 w-full sm:w-auto">
                <span className="text-[9px] font-extrabold text-on-surface-variant uppercase tracking-wider pl-1 font-sans">Filter by Day</span>
                <select
                  value={selectedDayFilter}
                  onChange={(e) => setSelectedDayFilter(e.target.value)}
                  className="bg-surface-container border border-outline-variant/30 text-xs rounded-lg p-1.5 text-on-surface outline-none cursor-pointer font-semibold min-w-[100px]"
                >
                  <option value="All">All Days</option>
                  <option value="1">Day 1</option>
                  <option value="2">Day 2</option>
                  <option value="3">Day 3</option>
                  <option value="4">Day 4</option>
                  <option value="5">Day 5</option>
                </select>
              </div>
            </div>

            {/* List entries */}
            {filteredLedgerExpenses.length === 0 ? (
              <div className="flex-grow flex flex-col items-center justify-center py-16 text-center select-none">
                <Info className="w-10 h-10 text-outline mb-2.5 animate-bounce" />
                <h4 className="text-xs font-bold text-on-surface">No Match Found</h4>
                <p className="text-[10px] text-on-surface-variant/70 mt-1 max-w-sm">
                  Try clearing some filter preferences above or add new bills into the ledger to analyze!
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {filteredLedgerExpenses.map((exp) => {
                  const paidBy = getMemberMeta(exp.paidById);
                  return (
                    <div 
                      key={exp.id}
                      className="p-3 rounded-xl border border-outline-variant/10 bg-surface-bright hover:bg-surface-container/20 transition-colors flex justify-between items-center shadow-2xs"
                    >
                      <div className="space-y-0.5 text-left">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-bold text-primary font-mono bg-primary/10 px-2 py-0.5 rounded-md uppercase">
                            Day {exp.day} - {exp.mealType}
                          </span>
                          <span className="text-[9px] font-semibold text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-md flex items-center gap-1 font-sans">
                            {getCategoryIcon(exp.category)}
                            <span>{exp.category}</span>
                          </span>
                        </div>
                        <h5 className="text-xs font-bold text-on-surface mt-1">{exp.title}</h5>
                        <p className="text-[10px] text-on-surface-variant font-medium mt-0.5">
                          Contributor: <strong className="text-on-surface font-semibold">{paidBy.name}</strong>
                        </p>
                        {exp.notes && (
                          <p className="text-[9px] italic text-on-surface-variant/80 mt-0.5 pl-1.5 border-l border-outline/30">
                            Notes: {exp.notes}
                          </p>
                        )}
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-extrabold text-on-surface font-mono">
                          ₹{exp.amount.toLocaleString('en-IN', { minimumFractionDigits: 1 })}
                        </span>
                        <p className="text-[8px] text-on-surface-variant font-mono mt-0.5">
                          {exp.dateCreated ? new Date(exp.dateCreated).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Category totals sub-list panels */}
            <div className="mt-5 pt-3 border-t border-outline-variant/15">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider pl-1 mb-2.5 block">Allocation by Category</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {categorySummary.slice(0, 4).map((item) => (
                  <div key={item.name} className="bg-surface-bright p-2.5 rounded-xl border border-outline-variant/10 text-left">
                    <p className="text-[9px] font-bold text-on-surface-variant truncate uppercase tracking-widest">{item.name}</p>
                    <h6 className="text-[13px] font-bold text-on-surface font-mono mt-0.5">₹{item.amount.toLocaleString()}</h6>
                    <p className="text-[8px] text-primary font-bold mt-0.5">{item.percentage.toFixed(0)}% of total</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
