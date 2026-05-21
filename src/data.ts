/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Member, Trip, Expense } from './types';

export const INITIAL_MEMBERS: Member[] = [
  {
    id: 'member_6',
    name: 'Prakash',
    initials: 'PR',
    avatarUrl: '',
    spouse: 'Karpagam',
    childrenUnder13: ['Sambu', 'Nenthira'],
    familyNote: 'Spouse: Karpagam, Kids under 13: Sambu, Nenthira'
  },
  {
    id: 'member_7',
    name: 'Bhuvanesh',
    initials: 'BH',
    avatarUrl: '',
    spouse: 'Poongodi',
    childrenUnder13: ['Praneeth'],
    familyNote: 'Spouse: Poongodi, Kid under 13: Praneeth'
  },
  {
    id: 'member_8',
    name: 'Gnanakumar-Rajesh Family',
    initials: 'GR',
    avatarUrl: '',
    spouse: 'Singaraveluu, Vaideki',
    childrenUnder13: ['Thanusiya', 'Deva'],
    familyNote: 'Adults: Singaraveluu, Vaideki, Kids under 13: Thanusiya, Deva'
  },
  {
    id: 'member_9',
    name: 'Rajeshkumar',
    initials: 'RK',
    avatarUrl: '',
    spouse: 'Vanithasree, Shanthi',
    childrenUnder13: ['Krithiv'],
    familyNote: 'Adults: Vanithasree, Shanthi, Kid under 13: Krithiv'
  },
];

export const INITIAL_TRIPS: Trip[] = [
  {
    id: 'trip_2',
    name: 'May 2026 Trip',
    description: 'A highly anticipated multi-city European tour focusing on cultural landmarks, culinary experiences, and extended family bonding across France and Italy.',
    dateRange: 'May 10 - May 24, 2026',
    status: 'Planning',
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCLi-cy3sjHORq7VOt3UNwcjFZVyWC5hBlAahGO3BPuvbgP3AkGMEa9fDE5-XexZcx0TZqXhoYZAabke9GXPIhYkeY_VAe_b9McZHVevlgnVda5kF7fd78v1yA_wr4CV8ITnZtuwOlg794zKWr7hq3VccPnpbeh-lCpIOUV_DrPiyLf8s1jLHwPVZl_mlOJ1QrQnAp_02NA4vGBGfrw1x5_FRJltw5q9daBgsWS1Jv1cITLQr5ZD-tpGgKnYNd1zOtomd2YoJwdh2pV',
    memberIds: ['member_6', 'member_7', 'member_8', 'member_9'],
    totalEstimate: 5000,
  }
];

export const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp_1',
    tripId: 'trip_2',
    day: 1,
    mealType: 'Breakfast',
    title: 'Pancakes and Berry breakfast',
    amount: 1540.00,
    paidById: 'member_6',
    category: 'Food',
    dateCreated: '2026-05-10T08:30:00Z'
  },
  {
    id: 'exp_2',
    tripId: 'trip_2',
    day: 1,
    mealType: 'Other',
    title: 'Airport Taxi Transfer',
    amount: 2800.00,
    paidById: 'member_7',
    category: 'Transport',
    dateCreated: '2026-05-10T11:00:00Z'
  },
  {
    id: 'exp_3',
    tripId: 'trip_2',
    day: 1,
    mealType: 'Lunch',
    title: 'Local Seafood Platters',
    amount: 6200.00,
    paidById: 'member_8',
    category: 'Food',
    dateCreated: '2026-05-10T13:30:00Z'
  },
  {
    id: 'exp_4',
    tripId: 'trip_2',
    day: 1,
    mealType: 'Other',
    title: 'Beach Resort Booking Deposit',
    amount: 32000.00,
    paidById: 'member_8',
    category: 'Accommodation',
    dateCreated: '2026-05-10T16:00:00Z'
  },
  {
    id: 'exp_5',
    tripId: 'trip_2',
    day: 1,
    mealType: 'Dinner',
    title: 'Classic Italian Seafood Dinner',
    amount: 7800.00,
    paidById: 'member_8',
    category: 'Food',
    dateCreated: '2026-05-10T20:30:00Z'
  },
  {
    id: 'exp_6',
    tripId: 'trip_2',
    day: 2,
    mealType: 'Breakfast',
    title: 'Street Alley Espresso & Coffee',
    amount: 850.00,
    paidById: 'member_7',
    category: 'Food',
    dateCreated: '2026-05-11T09:00:00Z'
  },
  {
    id: 'exp_7',
    tripId: 'trip_2',
    day: 2,
    mealType: 'Other',
    title: 'Local Sights Flight Tickets',
    amount: 14500.00,
    paidById: 'member_7',
    category: 'Transport',
    dateCreated: '2026-05-11T11:30:00Z'
  },
  {
    id: 'exp_8',
    tripId: 'trip_2',
    day: 2,
    mealType: 'Other',
    title: 'Deep Sea Scuba diving',
    amount: 18500.00,
    paidById: 'member_6',
    category: 'Activities',
    dateCreated: '2026-05-11T14:45:00Z'
  },
  {
    id: 'exp_9',
    tripId: 'trip_2',
    day: 2,
    mealType: 'Other',
    title: 'Ancient Museum Visit Tickets',
    amount: 3200.00,
    paidById: 'member_9',
    category: 'Sightseeing',
    dateCreated: '2026-05-11T16:30:00Z'
  },
  {
    id: 'exp_10',
    tripId: 'trip_2',
    day: 2,
    mealType: 'Dinner',
    title: 'Grand Beach BBQ banquet',
    amount: 12400.00,
    paidById: 'member_6',
    category: 'Food',
    dateCreated: '2026-05-11T21:00:00Z'
  }
];
