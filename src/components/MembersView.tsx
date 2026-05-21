/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Users, UserPlus, Trash2, ShieldCheck, Mail, Send, Heart, Baby, PlusCircle, X } from 'lucide-react';
import { motion } from 'motion/react';
import { Member, Trip, Expense } from '../types';
import { calculateMemberPaidTotals } from '../utils';

interface MembersViewProps {
  activeTrip: Trip;
  members: Member[];
  expenses: Expense[];
  onAddMember: (
    name: string,
    email: string,
    initialSpend?: number,
    spouse?: string,
    childrenUnder13?: string[]
  ) => void;
  onClose?: () => void;
}

export default function MembersView({
  activeTrip,
  members,
  expenses,
  onAddMember,
  onClose,
}: MembersViewProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [spouse, setSpouse] = useState('');
  const [childrenStr, setChildrenStr] = useState('');
  const [initialSpend, setInitialSpend] = useState('');
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
    
    // Parse kids list
    const parsedKids = childrenStr
      .split(',')
      .map((kid) => kid.trim())
      .filter((kid) => kid.length > 0);

    const spendVal = parseFloat(initialSpend) || 0;

    onAddMember(name.trim(), email.trim(), spendVal, spouse.trim() || undefined, parsedKids);
    setSuccess(`Successfully invited ${name}!`);
    setName('');
    setEmail('');
    setSpouse('');
    setChildrenStr('');
    setInitialSpend('');
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
          <div className="flex items-center justify-between gap-2 mb-4 border-b border-outline-variant/15 pb-3">
            <div className="flex items-center gap-2">
              <Users className="w-6 h-6 text-primary" />
              <div className="text-left">
                <h3 className="text-lg font-bold text-on-surface">Active Family Members</h3>
                <p className="text-xs text-on-surface-variant">Members registered for {activeTrip.name}</p>
              </div>
            </div>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 px-3 hover:bg-surface-variant text-on-surface-variant hover:text-on-surface hover:ring-1 hover:ring-outline-variant/15 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold font-sans"
              >
                <X className="w-4 h-4 text-primary" />
                <span>Close</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tripMembers.map((member) => {
              const personalPaidAmount = paidTotals[member.id] || 0;
              return (
                <div 
                  key={member.id} 
                  className="p-4 bg-surface-bright/80 rounded-xl border border-outline-variant/15 flex flex-col gap-3 justify-between shadow-xs hover:border-primary/20 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {member.avatarUrl ? (
                        <img 
                          alt={member.name} 
                          src={member.avatarUrl} 
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-white mt-0.5" 
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm mt-0.5">
                          {member.initials}
                        </div>
                      )}
                      <div className="text-left">
                        <p className="font-extrabold text-on-surface text-sm">{member.name}</p>
                        
                        {/* Family spouse rendering */}
                        {member.spouse && (
                          <span className="inline-flex items-center gap-1 mt-1 mr-2 px-2 py-0.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold text-[10px] rounded-md">
                            <Heart className="w-2.5 h-2.5 fill-rose-500/20 text-rose-500" />
                            <span>Spouse: {member.spouse}</span>
                          </span>
                        )}

                        {/* Children under 13 rendering */}
                        {member.childrenUnder13 && member.childrenUnder13.length > 0 && (
                          <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold text-[10px] rounded-md">
                            <Baby className="w-2.5 h-2.5 text-blue-500" />
                            <span>Kids: {member.childrenUnder13.join(', ')}</span>
                          </span>
                        )}

                        {!member.spouse && (!member.childrenUnder13 || member.childrenUnder13.length === 0) && (
                          <p className="text-2xs text-on-surface-variant font-semibold mt-1">
                            Individual Family Account
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-[10px] text-outline font-semibold uppercase">Total Paid</p>
                      <p className="font-mono text-sm font-bold text-secondary">₹{personalPaidAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                  </div>

                  {member.familyNote && (
                    <div className="p-2 rounded bg-surface-container-low text-[10px] font-sans font-medium text-on-surface-variant border border-outline-variant/10 text-left">
                      📝 {member.familyNote}
                    </div>
                  )}
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

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
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
                placeholder="e.g. Prakash"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-surface-bright border border-outline-variant/30 text-on-surface text-sm rounded-lg focus:ring-2 focus:ring-primary block w-full p-2.5 outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Spouse Name (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Karpagam"
                value={spouse}
                onChange={(e) => setSpouse(e.target.value)}
                className="bg-surface-bright border border-outline-variant/30 text-on-surface text-sm rounded-lg focus:ring-2 focus:ring-primary block w-full p-2.5 outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Children Under 13 (Optional, comma-separated)</label>
              <input
                type="text"
                placeholder="e.g. Sambu, Nenthira"
                value={childrenStr}
                onChange={(e) => setChildrenStr(e.target.value)}
                className="bg-surface-bright border border-outline-variant/30 text-on-surface text-sm rounded-lg focus:ring-2 focus:ring-primary block w-full p-2.5 outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Email Invitation (Optional)</label>
              <input
                type="email"
                placeholder="prakash@nomadfamily.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-surface-bright border border-outline-variant/30 text-on-surface text-sm rounded-lg focus:ring-2 focus:ring-primary block w-full p-2.5 outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Initial Advanced Fund (₹) Optional</label>
              <input
                type="number"
                placeholder="0.00"
                value={initialSpend}
                onChange={(e) => setInitialSpend(e.target.value)}
                className="bg-surface-bright border border-outline-variant/30 text-on-surface text-sm rounded-lg focus:ring-2 focus:ring-primary block w-full p-2.5 outline-none font-mono font-medium"
              />
            </div>

            <div className="p-3 bg-surface-container/65 text-on-surface-variant text-[11px] leading-relaxed rounded-xl flex items-start gap-1.5 border border-outline-variant/5">
              <ShieldCheck className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
              <span>We will register this family unit, allocate calculated shares, and trace records on-the-fly.</span>
            </div>

            <button
               type="submit"
               className="w-full text-on-primary bg-primary hover:bg-primary-container font-semibold rounded-lg text-sm px-5 py-2.5 text-center transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Register Unit</span>
            </button>
          </form>
        </div>
      </div>
    </motion.div>
  );
}
