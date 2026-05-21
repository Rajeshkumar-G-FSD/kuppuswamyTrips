/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Member {
  id: string;
  name: string;
  initials: string;
  avatarUrl?: string;
  email?: string;
  spouse?: string;
  childrenUnder13?: string[];
  familyNote?: string;
}

export type TripStatus = 'Planning' | 'Upcoming' | 'Completed';

export interface Trip {
  id: string;
  name: string;
  description: string;
  dateRange: string;
  status: TripStatus;
  coverImage: string;
  memberIds: string[];
  totalEstimate?: number;
}

export type ExpenseCategory = 'Food' | 'Transport' | 'Accommodation' | 'Activities' | 'Tea & Snacks' | 'Sightseeing' | 'Shopping' | 'Medical' | 'Other';

export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Tea & Snacks' | 'Other';

export interface Expense {
  id: string;
  tripId: string;
  day: number; // 1, 2, 3 etc.
  mealType: MealType;
  title: string;
  amount: number;
  paidById: string;
  category: ExpenseCategory;
  notes?: string;
  dateCreated: string;
  skipped?: boolean;
}

export interface Settlement {
  fromId: string;
  toId: string;
  amount: number;
}

export interface CategoryBreakdown {
  category: ExpenseCategory;
  amount: number;
  percentage: number;
}
