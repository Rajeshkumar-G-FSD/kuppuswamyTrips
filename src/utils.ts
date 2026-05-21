/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Expense, Settlement, Trip, Member } from './types';

/**
 * Calculates Splitwise-like simplified debt settlement transactions for a given trip's expenses.
 */
export function calculateSettlements(expenses: Expense[], trip: Trip): Settlement[] {
  const memberIds = trip.memberIds;
  if (memberIds.length === 0) return [];

  // Initialize ledger
  const paid: Record<string, number> = {};
  const share: Record<string, number> = {};

  for (const mid of memberIds) {
    paid[mid] = 0;
    share[mid] = 0;
  }

  // Active non-skipped expenses for this trip
  const activeExpenses = expenses.filter(e => e.tripId === trip.id && !e.skipped);

  for (const exp of activeExpenses) {
    const amount = exp.amount;
    const payer = exp.paidById;

    // Add to paid amount
    if (payer in paid) {
      paid[payer] += amount;
    }

    // Split equally among all members of the trip
    const perPersonShare = amount / memberIds.length;
    for (const mid of memberIds) {
      if (mid in share) {
        share[mid] += perPersonShare;
      }
    }
  }

  // Net balances (paid - shared share)
  const balances: { memberId: string; balance: number }[] = memberIds.map(mid => ({
    memberId: mid,
    balance: (paid[mid] || 0) - (share[mid] || 0),
  }));

  // Separate debtors and creditors
  // Debtors have negative balance (need to pay)
  const debtors = balances
    .filter(b => b.balance < -0.01)
    .sort((a, b) => a.balance - b.balance); // Most negative first

  // Creditors have positive balance (should receive)
  const creditors = balances
    .filter(b => b.balance > 0.01)
    .sort((a, b) => b.balance - a.balance); // Most positive first

  const settlements: Settlement[] = [];

  let dIdx = 0;
  let cIdx = 0;

  // Clone to modify in-place
  const localDebtors = debtors.map(d => ({ ...d }));
  const localCreditors = creditors.map(c => ({ ...c }));

  while (dIdx < localDebtors.length && cIdx < localCreditors.length) {
    const debtor = localDebtors[dIdx];
    const creditor = localCreditors[cIdx];

    const oweAmount = -debtor.balance;
    const creditAmount = creditor.balance;

    const transfer = Math.min(oweAmount, creditAmount);

    if (transfer > 0.01) {
      settlements.push({
        fromId: debtor.memberId,
        toId: creditor.memberId,
        amount: Math.round(transfer * 100) / 100, // round to 2 decimal places
      });
    }

    debtor.balance += transfer;
    creditor.balance -= transfer;

    if (Math.abs(debtor.balance) < 0.01) {
      dIdx++;
    }
    if (Math.abs(creditor.balance) < 0.01) {
      cIdx++;
    }
  }

  return settlements;
}

/**
 * Calculates sum of paid expenses per member
 */
export function calculateMemberPaidTotals(expenses: Expense[], memberIds: string[], tripId: string): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const mid of memberIds) {
    totals[mid] = 0;
  }

  const activeExpenses = expenses.filter(e => e.tripId === tripId && !e.skipped);
  for (const exp of activeExpenses) {
    if (exp.paidById in totals) {
      totals[exp.paidById] += exp.amount;
    }
  }

  return totals;
}
