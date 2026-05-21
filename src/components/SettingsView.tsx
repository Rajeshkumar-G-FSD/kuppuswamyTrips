/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Settings, Save, Trash2, ShieldAlert, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { Trip } from '../types';

interface SettingsViewProps {
  activeTrip: Trip;
  onUpdateTrip: (tripId: string, updatedData: Partial<Trip>) => void;
  onClearAllExpenses: (tripId: string) => void;
}

export default function SettingsView({
  activeTrip,
  onUpdateTrip,
  onClearAllExpenses,
}: SettingsViewProps) {
  const [name, setName] = useState(activeTrip.name);
  const [description, setDescription] = useState(activeTrip.description);
  const [dateRange, setDateRange] = useState(activeTrip.dateRange);
  const [success, setSuccess] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateTrip(activeTrip.id, {
      name: name.trim(),
      description: description.trim(),
      dateRange: dateRange.trim(),
    });
    setSuccess('Trip settings updated successfully!');
    setTimeout(() => setSuccess(''), 4000);
  };

  const handleClear = () => {
    const ok = window.confirm('Are you absolutely sure you want to clear all logged ledger expenses for this trip? This operation is irreversible.');
    if (ok) {
      onClearAllExpenses(activeTrip.id);
      alert('Ledger expenses cleared.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto w-full flex-grow flex flex-col gap-6"
    >
      <div className="glass-card p-6 rounded-2xl shadow-xs">
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

      {/* Danger Zone */}
      <div className="glass-card p-6 border-l-4 border-l-error rounded-2xl bg-error-container/10">
        <h4 className="text-sm font-bold text-error flex items-center gap-1.5 mb-2 uppercase tracking-wide">
          <ShieldAlert className="w-5 h-5" />
          <span>Danger Room Zone</span>
        </h4>
        <p className="text-xs text-on-surface-variant mb-4 leading-relaxed font-semibold">
          Operations here are direct deletions. Please double test and coordinate with family members before executing.
        </p>

        <button
          type="button"
          onClick={handleClear}
          className="bg-error hover:bg-red-700 text-white font-bold text-xs px-4 py-2.5 rounded-lg flex items-center gap-1.5"
        >
          <Trash2 className="w-4 h-4" />
          <span>Clear Ledger Expenses</span>
        </button>
      </div>
    </motion.div>
  );
}
