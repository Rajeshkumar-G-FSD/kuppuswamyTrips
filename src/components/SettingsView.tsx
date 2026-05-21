/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Settings, Save, Trash2, ShieldAlert, Sparkles, RefreshCw, Layers } from 'lucide-react';
import { motion } from 'motion/react';
import { Trip } from '../types';

interface SettingsViewProps {
  activeTrip: Trip;
  onUpdateTrip: (tripId: string, updatedData: Partial<Trip>) => void;
  onClearAllExpenses: (tripId: string) => void;
  onFullReset: (mode: 'blank' | 'reseed') => Promise<void>;
}

export default function SettingsView({
  activeTrip,
  onUpdateTrip,
  onClearAllExpenses,
  onFullReset,
}: SettingsViewProps) {
  const [name, setName] = useState(activeTrip?.name || '');
  const [description, setDescription] = useState(activeTrip?.description || '');
  const [dateRange, setDateRange] = useState(activeTrip?.dateRange || '');
  const [success, setSuccess] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTrip) return;
    onUpdateTrip(activeTrip.id, {
      name: name.trim(),
      description: description.trim(),
      dateRange: dateRange.trim(),
    });
    setSuccess('Trip settings updated successfully!');
    setTimeout(() => setSuccess(''), 4000);
  };

  const handleClear = () => {
    if (!activeTrip) return;
    const ok = window.confirm('Are you absolutely sure you want to clear all logged ledger expenses for this trip? This operation is irreversible.');
    if (ok) {
      onClearAllExpenses(activeTrip.id);
      alert('Ledger expenses cleared.');
    }
  };

  const handleDbReset = async (mode: 'blank' | 'reseed') => {
    const promptMsg = mode === 'blank' 
      ? 'WARNING: This will completely delete all trips, members, expenses, and gallery images from the Firebase database, starting 100% fresh with no records.\n\nAre you sure you want to proceed?'
      : 'WARNING: This will clear the Firebase database and restore the original "May 2026 Trip" with pre-configured members, expenses, and gallery photos.\n\nAre you sure you want to proceed?';
    
    if (window.confirm(promptMsg)) {
      setIsResetting(true);
      try {
        await onFullReset(mode);
        alert(mode === 'blank' 
          ? 'Firebase database has been successfully wiped. The app will reload with a fresh configuration.' 
          : 'Firebase database successfully restored to the original seed data.'
        );
      } catch (err) {
        alert('An error occurred while resetting the database: ' + err);
      } finally {
        setIsResetting(false);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto w-full flex-grow flex flex-col gap-6"
    >
      {activeTrip && (
        <div className="glass-card p-6 rounded-2xl shadow-xs text-left">
          <div className="flex items-center gap-2 mb-6 border-b border-outline-variant/15 pb-3">
            <Settings className="w-6 h-6 text-primary" />
            <div>
              <h3 className="text-lg font-bold text-on-surface">Trip Configurations</h3>
              <p className="text-xs text-on-surface-variant">Update metadata parameters for {activeTrip.name}</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            {success && (
              <div className="p-3 bg-secondary-container/45 text-secondary text-xs font-semibold rounded-lg border border-secondary/15 animate-pulse">
                {success}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Adventure Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="bg-surface-bright border border-outline-variant/30 text-on-surface text-sm rounded-lg focus:ring-2 focus:ring-primary block w-full p-2.5 outline-none font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Calendar Dates</label>
                <input
                  type="text"
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  required
                  className="bg-surface-bright border border-outline-variant/30 text-on-surface text-sm rounded-lg focus:ring-2 focus:ring-primary block w-full p-2.5 outline-none font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Summary Plan</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-surface-bright border border-outline-variant/30 text-on-surface text-sm rounded-lg focus:ring-2 focus:ring-primary block w-full p-2.5 outline-none font-medium leading-relaxed"
              />
            </div>

            <button
              type="submit"
              className="bg-primary hover:bg-primary-container text-on-primary font-bold text-xs px-5 py-3 rounded-lg flex items-center gap-2 cursor-pointer focus:outline-none shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>Save Preferences</span>
            </button>
          </form>
        </div>
      )}

      {/* Danger Zone */}
      <div className="glass-card p-6 border-l-4 border-l-error rounded-2xl bg-error-container/10 text-left">
        <h4 className="text-sm font-bold text-error flex items-center gap-1.5 mb-2 uppercase tracking-wide">
          <ShieldAlert className="w-5 h-5" />
          <span>Danger Room Zone</span>
        </h4>
        <p className="text-xs text-on-surface-variant mb-4 leading-relaxed font-semibold">
          Operations here perform database cleanups. Please double check and coordinate with family members before executing.
        </p>

        <div className="flex flex-wrap gap-3">
          {activeTrip && (
            <button
              type="button"
              onClick={handleClear}
              className="bg-error hover:bg-red-700 text-white font-bold text-xs px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear Current Trip Expenses</span>
            </button>
          )}

          <button
            type="button"
            disabled={isResetting}
            onClick={() => handleDbReset('blank')}
            className="bg-surface-bright hover:bg-error/10 text-error border border-error/30 font-bold text-xs px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isResetting ? 'animate-spin' : ''}`} />
            <span>Wipe Firebase (Get 100% Blank DB)</span>
          </button>

          <button
            type="button"
            disabled={isResetting}
            onClick={() => handleDbReset('reseed')}
            className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 font-bold text-xs px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span>Wipe &amp; Re-seed Original May 2026 Data</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
