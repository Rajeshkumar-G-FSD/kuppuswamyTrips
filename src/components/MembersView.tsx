/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Users, UserPlus, Trash2, ShieldCheck, Mail, Send } from 'lucide-react';
import { motion } from 'motion/react';
import { Member, Trip, Expense } from '../types';
import { calculateMemberPaidTotals } from '../utils';

interface MembersViewProps {
  activeTrip: Trip;
  members: Member[];
  expenses: Expense[];
  onAddMember: (name: string, email: string) => void;
}

export default function MembersView({
  activeTrip,
  members,
  expenses,
  onAddMember,
}: MembersViewProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filter members on this active trip
  const tripMembers = members.filter((m) => activeTrip.memberIds.includes(m.id));

  // Sum up how much each user has paid on this trip
  const paidTotals = calculateMemberPaidTotals(expenses, activeTrip.memberIds, activeTrip.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    
    onAddMember(name.trim(), email.trim());
    setSuccess(`Successfully invited ${name}!`);
    setName('');
    setEmail('');
    setError('');

    setTimeout(() => setSuccess(''), 4000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full flex-grow flex flex-col lg:flex-row gap-6 animate-fade-in"
    >
      {/* Left Column: Active list */}
      <div className="flex-grow flex flex-col gap-6">
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center gap-2 mb-4 border-b border-outline-variant/15 pb-3">
            <Users className="w-6 h-6 text-primary" />
            <div>
              <h3 className="text-lg font-bold text-on-surface">Active Family Members</h3>
              <p className="text-xs text-on-surface-variant">Members registered for {activeTrip.name}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tripMembers.map((member) => {
              const personalPaidAmount = paidTotals[member.id] || 0;
              return (
                <div 
                  key={member.id} 
                  className="p-4 bg-surface-bright/80 rounded-xl border border-outline-variant/15 flex items-center justify-between shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    {member.avatarUrl ? (
                      <img 
                        alt={member.name} 
                        src={member.avatarUrl} 
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-white" 
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                        {member.initials}
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-on-surface text-sm">{member.name}</p>
                      <p className="text-xs text-on-surface-variant font-semibold">
                        Trip Contributor • No debt holds
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-outline font-semibold uppercase">Total Paid</p>
                    <p className="font-mono text-sm font-bold text-secondary">₹{personalPaidAmount.toFixed(2)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Column: Invite Form */}
      <div className="w-full lg:w-80 flex flex-col gap-6">
        <div className="glass-card p-6 rounded-2xl shadow-xs">
          <h3 className="text-base font-bold text-on-surface flex items-center gap-2 mb-4">
            <UserPlus className="w-5 h-5 text-primary" />
            <span>Invite Family Member</span>
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-2.5 bg-error-container/45 text-error text-xs font-semibold rounded-lg border border-error/10">
                {error}
              </div>
            )}
            {success && (
              <div className="p-2.5 bg-secondary-container/45 text-secondary text-xs font-semibold rounded-lg border border-secondary/15">
                {success}
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Name</label>
              <input
                type="text"
                placeholder="e.g. Grandma Joe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-surface-bright border border-outline-variant/30 text-on-surface text-sm rounded-lg focus:ring-2 focus:ring-primary block w-full p-2.5 outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Email (Optional)</label>
              <input
                type="email"
                placeholder="grandpa@nomadfamily.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-surface-bright border border-outline-variant/30 text-on-surface text-sm rounded-lg focus:ring-2 focus:ring-primary block w-full p-2.5 outline-none font-medium"
              />
            </div>

            <div className="p-3 bg-surface-container/65 text-on-surface-variant text-[11px] leading-relaxed rounded-xl flex items-start gap-1.5 border border-outline-variant/5">
              <ShieldCheck className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
              <span>We will automatically invite them to this trip ledger and split subsequent expenses.</span>
            </div>

            <button
              type="submit"
              className="w-full text-on-primary bg-primary hover:bg-primary-container font-semibold rounded-lg text-sm px-5 py-2.5 text-center transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Send Invite</span>
            </button>
          </form>
        </div>
      </div>
    </motion.div>
  );
}
