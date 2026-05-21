/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  LayoutDashboard, 
  Plane, 
  Users, 
  Receipt, 
  BarChart3, 
  Settings, 
  Plus, 
  HelpCircle, 
  LogOut,
  X,
  PieChart,
  Camera
} from 'lucide-react';
import { Trip } from '../types';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  activeTrip: Trip | null;
  onAddNewTrip: () => void;
  onLogout: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({
  activeView,
  setActiveView,
  activeTrip,
  onAddNewTrip,
  onLogout,
  isOpen = false,
  onClose,
}: SidebarProps) {
  const navItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'trips', name: 'Trips', icon: Plane },
    { id: 'members', name: 'Family Members', icon: Users },
    { id: 'expenses', name: 'Expenses', icon: Receipt },
    { id: 'spending-details', name: 'Spending Details', icon: PieChart },
    { id: 'gallery', name: 'Gallery', icon: Camera },
    { id: 'reports', name: 'Reports', icon: BarChart3 },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-on-background/40 z-40 md:hidden backdrop-blur-xs transition-opacity"
          onClick={onClose}
        />
      )}

      <aside
        id="side-nav-bar"
        className={`fixed top-0 bottom-0 left-0 w-64 bg-surface-container dark:bg-inverse-surface border-r border-outline-variant/10 flex flex-col py-6 transition-all duration-300 z-50 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Close Button */}
        {isOpen && (
          <button 
            type="button"
            className="absolute top-4 right-4 md:hidden text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-surface-variant/50 transition-colors"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Brand Header */}
        <div className="px-6 pb-6 border-b border-outline-variant/10 mb-6 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3 overflow-hidden border-2 border-surface-container-lowest shadow-xs">
            <img 
              alt="Kuppu Swamy Trips Logo" 
              className="w-full h-full object-cover" 
              referrerPolicy="no-referrer"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDcMAhgwMsjB6vdh8alo6SXirNf2PzKvkQFGI7gSjmAXcyNqd1FdbI1vUBKMZDHoD_ccGNKqV7JkusBkjSBfLllVTcMHxxlBf8jS-9lPIDakoOrd15v9UkOqgPUGRAnXCtBOeNerkMDS-tbWm9jGN8cBslD5eXWrbwmaSvUudHjrjvkFo179BgubUA0I-Zp0pvTR4LJCnEeZIFmbMtXqCXURcImgmXlWERLP30fXNWnM5fT8YOkYC83Lrh8Z9k9PieBQYow6P1kgLGp"
            />
          </div>
          <h1 className="text-xl font-bold text-primary dark:text-primary-fixed tracking-tight">Kuppu Swamy Trips</h1>
          <p className="text-xs text-on-surface-variant font-medium mt-1">
            {activeTrip ? activeTrip.name : 'Summer Vacation 2024'}
          </p>
        </div>

        {/* Sidebar Nav Items */}
        <nav className="flex-1 overflow-y-auto px-2 space-y-1">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveView(item.id);
                  if (onClose) onClose();
                }}
                className={`w-full text-left rounded-lg px-4 py-3 flex items-center gap-3 font-medium text-sm transition-all duration-200 outline-none scale-95 hover:scale-98 active:scale-90 ${
                  isActive
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-primary hover:bg-primary-fixed-dim/15'
                }`}
              >
                <IconComponent className="w-5 h-5 flex-shrink-0" />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer Area with Action & Setup */}
        <div className="px-4 mt-auto pt-6 border-t border-outline-variant/10">
          <button
            type="button"
            onClick={() => {
              onAddNewTrip();
              if (onClose) onClose();
            }}
            className="w-full bg-primary hover:bg-primary/95 text-on-primary py-2.5 px-4 rounded-full text-xs font-semibold shadow-xs hover:shadow-sm transition-all flex items-center justify-center gap-2 mb-3"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Trip</span>
          </button>
          
          <nav className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => {
                setActiveView('help');
                if (onClose) onClose();
              }}
              className="text-on-surface-variant hover:text-primary text-xs font-medium py-2 flex items-center gap-3 transition-colors text-left"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Help Center</span>
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="text-on-surface-variant hover:text-error text-xs font-medium py-2 flex items-center gap-3 transition-colors text-left"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </nav>
        </div>
      </aside>
    </>
  );
}
