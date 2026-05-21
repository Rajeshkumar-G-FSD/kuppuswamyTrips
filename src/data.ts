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
  },
  {
    id: 'member_7',
    name: 'Bhuvanesh',
    initials: 'BH',
    avatarUrl: '',
  },
  {
    id: 'member_8',
    name: 'Gnanakumar',
    initials: 'GK',
    avatarUrl: '',
  },
  {
    id: 'member_9',
    name: 'Rajeshkumar',
    initials: 'RK',
    avatarUrl: '',
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

export const INITIAL_EXPENSES: Expense[] = [];
