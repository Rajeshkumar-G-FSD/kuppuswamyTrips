/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Menu, Search, Bell } from 'lucide-react';

interface TopAppBarProps {
  title: string;
  onMenuToggle: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onNotificationClick: () => void;
  onProfileClick: () => void;
  sessionUser?: { username: string; role: string } | null;
}

export default function TopAppBar({
  title,
  onMenuToggle,
  searchQuery,
  setSearchQuery,
  onNotificationClick,
  onProfileClick,
  sessionUser,
}: TopAppBarProps) {
  return (
    <header className="flex justify-between items-center px-4 md:px-6 py-3.5 bg-surface/80 dark:bg-on-background/80 backdrop-blur-lg w-full sticky top-0 z-40 border-b border-outline-variant/10">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          type="button"
          className="md:hidden text-on-surface hover:bg-surface-variant rounded-full p-2.5 transition-colors focus:outline-none"
          onClick={onMenuToggle}
        >
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="text-xl md:text-2xl font-bold text-on-surface tracking-tight capitalize">
          {title}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Session Badge */}
        {sessionUser && (
          <div className="hidden sm:flex items-center gap-1 bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span>🛡️ Super {sessionUser.role}: {sessionUser.username}</span>
          </div>
        )}

        {/* Search bar inside header (only visible layout-wide) */}
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-on-surface-variant pointer-events-none" />
          <input
            type="text"
            placeholder="Search expenses & members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-1.5 bg-surface-container-low border border-outline-variant/15 rounded-full text-sm font-medium focus:ring-2 focus:ring-primary focus:border-transparent outline-none w-56 md:w-64 transition-all"
          />
        </div>

        {/* Mobile search indicator */}
        <button
          type="button"
          onClick={() => {
            // Focus or enable search mobile popup
            const searchInput = document.getElementById('search-mobile-field');
            if (searchInput) searchInput.focus();
          }}
          className="sm:hidden text-on-surface-variant hover:bg-surface-variant rounded-full p-2 transition-transform duration-200"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Notifications */}
        <button
          type="button"
          onClick={onNotificationClick}
          className="text-on-surface-variant hover:bg-surface-variant rounded-full p-2 transition-colors relative"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full animate-pulse" />
        </button>

        {/* User image profile */}
        <button
          type="button"
          onClick={onProfileClick}
          className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant/30 hover:opacity-85 transition-opacity focus:outline-none"
        >
          <img
            alt="User Profile"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAEbi0YSIetmn4t-dQtukZTjkZ6lYyq6_r5K2QEffH77uBHgVv3TOIMrp8roV8Lct5QNzpoJQE_0MURo7VnrxSypjfhcnJzgXbkYpyyRNemPTRJueCtujzv0ySZv90PRjwB9bT-5Ic7Z4L5zZ3ujc1muA586Lzy32q_ItOWgVje3Sowv5gnoQrkWPCKrQ1FU26H7hLidFlMdcecHuFSS1i4ka2IuwIESoFx1bqcROhJ2PvR-EvVtWKPKi70jcK7kH-MyRtSu-GQ5_f9"
          />
        </button>
      </div>
    </header>
  );
}
