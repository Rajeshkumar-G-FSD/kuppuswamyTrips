/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  MapPin, 
  Calendar, 
  Share2, 
  Users, 
  Calculator, 
  Smartphone, 
  Link as LinkIcon, 
  Mail, 
  Phone,
  Plane,
  ChevronRight,
  ExternalLink,
  Info,
  Lock,
  User,
  ShieldAlert,
  Loader2,
  ShieldCheck,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { verifyLoginFromFirestore } from '../firebase';

import { Trip, Member, Expense } from '../types';

interface LandingPageViewProps {
  onLoginSuccess: (username: string, role: string) => void;
  members: Member[];
  expenses: Expense[];
  trips: Trip[];
}

export default function LandingPageView({ onLoginSuccess, members = [], expenses = [], trips = [] }: LandingPageViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Public Ledger Tracker states
  const [selectedTripId, setSelectedTripId] = useState<string>(trips && trips.length > 0 ? trips[0].id : 'trip_2');
  const [dayFilter, setDayFilter] = useState<'all' | '1' | '2' | '3' | '4'>('all');

  // Automatically select the first trip when trips are loaded
  React.useEffect(() => {
    if (trips && trips.length > 0 && !selectedTripId) {
      setSelectedTripId(trips[0].id);
    }
  }, [trips, selectedTripId]);

  // Compute stats on-the-fly for unauthenticated users
  const activeTripToShow = trips.find(t => t.id === selectedTripId) || trips[0];
  const activeTripMembers = activeTripToShow
    ? members.filter(m => activeTripToShow.memberIds?.includes(m.id))
    : [];

  const filteredLiveExpenses = expenses.filter(e => {
    const matchesTrip = e.tripId === (selectedTripId || (trips[0] && trips[0].id));
    if (!matchesTrip) return false;
    if (dayFilter === 'all') return true;
    return e.day === Number(dayFilter);
  });

  const overallFilteredTotal = filteredLiveExpenses.reduce((sum, e) => sum + (e.skipped ? 0 : e.amount), 0);
  const totalInvolvedMembers = activeTripMembers.length;
  const publicPerPersonShare = totalInvolvedMembers > 0 ? overallFilteredTotal / totalInvolvedMembers : 0;

  // Contributions per member map
  const memberContributions: { [memberId: string]: number } = {};
  activeTripMembers.forEach(m => {
    memberContributions[m.id] = 0;
  });

  filteredLiveExpenses.forEach(e => {
    if (!e.skipped && memberContributions[e.paidById] !== undefined) {
      memberContributions[e.paidById] += e.amount;
    }
  });

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      // Connect and query Firestore logins collection in real-time
      const res = await verifyLoginFromFirestore(username, password);
      if (res.success) {
        setSuccessMessage(`Welcome back, ${username}! Real-time Firebase session granted.`);
        setTimeout(() => {
          setIsModalOpen(false);
          onLoginSuccess(username, res.role || 'user');
        }, 1200);
      } else {
        setErrorMessage(res.error || 'Invalid administrator username or password.');
      }
    } catch (err) {
      setErrorMessage('Offline or database timeout. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const openLogin = () => {
    setErrorMessage('');
    setSuccessMessage('');
    setUsername('');
    setPassword('');
    setIsModalOpen(true);
  };
  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-sans selection:bg-primary/20">
      {/* TopNavBar */}
      <header className="w-full sticky top-0 z-50 bg-surface/80 dark:bg-on-background/80 backdrop-blur-md border-b border-outline-variant/20 shadow-xs transition-all duration-200">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center h-16">
          {/* Brand */}
          <button
            type="button"
            onClick={openLogin}
            className="font-bold text-xl md:text-2xl text-primary dark:text-primary-fixed flex items-center gap-2 outline-none pointer focus:outline-none cursor-pointer"
          >
            <Plane className="w-6 h-6 rotate-45 text-primary" />
            <span>Kuppu Swamy Trips</span>
          </button>
          
          {/* Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#public-tracker" className="text-sm font-semibold text-primary dark:text-primary-fixed border-b-2 border-primary pb-1 transition-all">Live Tracker Ledger</a>
            <a href="#about" className="text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors">About Us</a>
          </nav>
          
          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={openLogin}
              className="text-xs font-bold bg-primary text-on-primary hover:bg-primary-container px-5 py-2.5 rounded-full shadow-xs hover:shadow-sm transition-all focus:outline-none cursor-pointer flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Admin Login</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative w-full h-[580px] sm:h-[650px] md:h-[750px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img 
              alt="Scenic mountain landscape" 
              className="w-full h-full object-cover object-center scale-[1.01]" 
              referrerPolicy="no-referrer"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBMWxdnfHMqtiVPAuhXfRzWxg_dw1EvwJf6-Dq6017mEXkQohnzpBlVhVbG8P4VB4Uzy4prhaPxGo6Ya3mWGGv61m-d_WIqYTrgvyJFZgcQdE6877LyM1u2btdIL_j6GRzmQzoAVeBA0DO37LQil0gvgs6tLzLhAiehbMxe0SOL79RkEoGIKjP7GhPinKu819tQn0I-7NFVbjEe-xsEFscREx3SooXfgUBWe_WMAPDRxPIuaJFdRzP025ph2k131TwowKXLou0p3-m_"
            />
            <div className="absolute inset-0 bg-on-background/30 mix-blend-multiply" />
          </div>

          <div className="relative z-10 glass-card rounded-2xl p-6 md:p-12 max-w-3xl mx-4 text-center shadow-lg">
            <span className="text-[10px] font-bold tracking-widest text-primary uppercase bg-primary/10 rounded-full px-3 py-1 mb-4 inline-block">SWAT Family Finance</span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-on-surface mb-3 tracking-tight leading-tight">
              Manage Family Trip Expenses Easily
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-on-surface-variant mb-8 max-w-2xl mx-auto leading-relaxed">
              Track breakfast, lunch, dinner and shared travel expenses with your family in real-time. Spend less time calculating and more time creating memories.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="#public-tracker"
                className="w-full sm:w-auto text-xs font-bold bg-primary text-on-primary px-8 py-3.5 rounded-full shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none"
              >
                <span>View Spending Details</span>
                <ChevronRight className="w-4 h-4 text-white" />
              </a>
              <button
                type="button"
                onClick={openLogin}
                className="w-full sm:w-auto text-xs font-bold bg-white text-primary border border-outline-variant/30 hover:bg-surface-variant px-8 py-3.5 rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none"
              >
                <span>Admin Login</span>
              </button>
            </div>
          </div>
        </section>

        {/* Gallery Section */}
        <section className="py-16 px-6 md:px-12 bg-surface-container-low" id="gallery">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 select-none">
              <h2 className="text-2xl md:text-3xl font-extrabold text-on-surface mb-2">Moments That Matter</h2>
              <p className="text-xs md:text-sm text-on-surface-variant font-medium">Focus on the journey, we&apos;ll handle the math.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 auto-rows-[250px]">
              <div className="md:col-span-2 md:row-span-2 rounded-2xl overflow-hidden shadow-xs group relative">
                <img 
                  alt="Family at beach" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103" 
                  referrerPolicy="no-referrer"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCxEPrJ0cJzX_NsohNV_IN6BR0d3YOYvq5Xre1xrPwdrKK6bUL6g2JjfD5O8A7FMEhcp2HcQEf6Isan8P1VtzuIQGHc80ygpNFMGLFO5G5pkmAXEi1022CfoO7yZgvyX-fy0C2NNUTvMlYIM8LNTvbOgfI_f8P9gClHm-7YmyExmA-cIfCHpjEu_qFxazlr511iFzsg3T6HpIc-PGuoX3-ewOan4L8zINiDGkKDQmOKLPJKTZaMJ2Ov9uMkoVor_T214Hn8dzh0tAtI" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-on-background/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                  <span className="text-sm font-bold text-white uppercase tracking-wider">Maui Beachfront Stay</span>
                </div>
              </div>

              <div className="rounded-2xl overflow-hidden shadow-xs group relative">
                <img 
                  alt="Hiking adventure" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103" 
                  referrerPolicy="no-referrer"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAWs5-q-wwqS6Z1yEWwOe4-m6rZG4fiSemjPQgXBKU7ATu2kiH8881MwBfTe5I6kDRd7tCml9xnmrX0lfSINBe_f4DQjRo-jD-jYF9RwMO349uBgIrRjQWmsj7Ca3_7g_Js7Rc09RTEeYXgWvMrCHpKUX5VlliXuPucyzwTiHpCAoLNquRPOvD3uHJokj0wEFtWLUbJ4IgrCXFB3Dn6N2IdMxuSpQN3dHBOLOjixWtE4uHHvoItHp8m45TPYpskCibB9Ycx_UHqJSGQ"
                />
              </div>

              <div className="rounded-2xl overflow-hidden shadow-xs group relative">
                <img 
                  alt="Cozy cabin dinner" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103" 
                  referrerPolicy="no-referrer"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCOTWN1XKp7HHrR9YGki7BZF6UvUZP1xzeVrMWucW_8sCWP-AdPpFTlwazRf-oEaIasNK-EiMYYyO5f4XbJoo7XYSO8vlIcHwP4kgDBBX7VDa1BSQ95Oux6ozPRjlPbMByTKPYA-AbZiyaJNXkuP1RHGcVhInuih6oEhBSdk2dB43-msFKcxwMnw4sCFwKmQDF4DhmIAtMYZhK6Mp-zyp1yRJ-2tUXIvJ74VS_EIrPq10hGpkk5HLUj4ZwTQqEht9nal9cw1UR8_OWr"
                />
              </div>

              <div className="md:col-span-2 rounded-2xl overflow-hidden shadow-xs group relative">
                <img 
                  alt="Airplane window view" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103" 
                  referrerPolicy="no-referrer"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCG8UeVJnlj4mLhnYZS8nx_FZZ0fmHgWE6TqFe3E6BIuh4BRqjHOtiMIRkm7UBwi3QlTkkwEUF1DPihavs4LhxQWcBGOzqFoZdpCo78pXLRLgI8UV3wuqPnJIKfvp9eldGK2V9-OalpDbaCU2yhlLQAaiNzhpkxBd2Ivh8BSgSO48avlkYHqHshWKSCnfETJFAc7n2z6uCios6l5YvK_Vc9u283TBPs5ZzVg2TwDDIlM8bUP4PI1B3WJrXxPD_I7kwUUaYr9RXA_bvV"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 📊 Interactive Public Live Tracker Ledger */}
        <section className="py-16 px-6 md:px-12 bg-white scroll-mt-20" id="public-tracker">
          <div className="max-w-7xl mx-auto">
            <div className="mb-10 text-center">
              <span className="text-[10px] font-bold tracking-widest text-primary uppercase bg-primary/10 rounded-full px-3 py-1 mb-2.5 inline-block">
                No Login Required Desk
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-on-surface mb-2">
                Live Family Spending &amp; Shares
              </h2>
              <p className="text-xs md:text-sm text-on-surface-variant font-medium max-w-2xl mx-auto">
                Real-time snapshot from active family trip entries. Instantly identify who is the contributor, track equal shares, and settle balances dynamically.
              </p>
            </div>

            {/* Interactive Control Deck */}
            <div className="glass-card mb-8 p-5 rounded-2xl border border-outline-variant/15 bg-surface-container-lowest shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Trip Selector Dropdown */}
              <div className="w-full md:w-auto">
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                  Active Adventure
                </label>
                {trips && trips.length > 1 ? (
                  <select
                    value={selectedTripId}
                    onChange={(e) => {
                      setSelectedTripId(e.target.value);
                      setDayFilter('all');
                    }}
                    className="bg-surface-bright border border-outline-variant/20 rounded-xl text-xs font-bold text-on-surface px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary w-full md:w-72 cursor-pointer"
                  >
                    {trips.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.dateRange})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="bg-surface-container/50 border border-outline-variant/10 rounded-xl px-4 py-2.5 text-xs font-bold text-on-surface">
                    {activeTripToShow?.name || 'Active May Trip'}
                  </div>
                )}
              </div>

              {/* Day Filter Segment (Day 1 to Day 4) */}
              <div className="w-full md:w-auto flex flex-col items-start md:items-end w-full md:w-auto">
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1 mr-1">
                  Day Wise Filters (Day 1 - Day 4)
                </label>
                <div className="flex flex-wrap gap-1 bg-surface-container/40 p-1.5 rounded-xl border border-outline-variant/10 w-full md:w-auto">
                  <button
                    type="button"
                    onClick={() => setDayFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-2xs font-extrabold cursor-pointer transition-all ${
                      dayFilter === 'all'
                        ? 'bg-primary text-on-primary shadow-xs'
                        : 'text-on-surface-variant hover:bg-surface-variant/50'
                    }`}
                  >
                    Overall Expenses
                  </button>
                  {['1', '2', '3', '4'].map((dayNum) => (
                    <button
                      key={dayNum}
                      type="button"
                      onClick={() => setDayFilter(dayNum as any)}
                      className={`px-3 py-1.5 rounded-lg text-2xs font-extrabold cursor-pointer transition-all ${
                        dayFilter === dayNum
                          ? 'bg-primary text-on-primary shadow-xs'
                          : 'text-on-surface-variant hover:bg-surface-variant/50'
                      }`}
                    >
                      Day {dayNum}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Calculated Output Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Stats & Shares */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/15">
                  <h3 className="text-sm font-bold text-on-surface mb-4 flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-primary" />
                    <span>Fair-Share Calculations</span>
                  </h3>

                  {/* Summary Metric Badges */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-surface-bright p-4 rounded-xl border border-outline-variant/10 text-left">
                      <p className="text-[10px] font-bold uppercase text-on-surface-variant tracking-wider">
                        Total Spent ({dayFilter === 'all' ? 'All Days' : `Day ${dayFilter}`})
                      </p>
                      <h4 className="text-xl font-extrabold text-primary mt-1 font-mono">
                        ₹{overallFilteredTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </h4>
                    </div>

                    <div className="bg-surface-bright p-4 rounded-xl border border-outline-variant/10 text-left">
                      <p className="text-[10px] font-bold uppercase text-on-surface-variant tracking-wider">
                        Per Person Share
                      </p>
                      <h4 className="text-xl font-extrabold text-secondary mt-1 font-mono">
                        ₹{publicPerPersonShare.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </h4>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-outline-variant/10">
                    <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-3">
                      Who is the Contributor &amp; State Balance
                    </p>

                    {/* Empty check for contributions calculation */}
                    {overallFilteredTotal === 0 ? (
                      <div className="py-8 px-4 text-center rounded-xl bg-surface-variant/10 border border-dashed border-outline-variant/30 flex flex-col items-center justify-center">
                        <Info className="w-8 h-8 text-on-surface-variant/50 mb-2 animate-pulse" />
                        <span className="text-xs font-bold text-on-surface-variant">At present no contribution</span>
                        <p className="text-[10px] text-on-surface-variant/70 mt-1 max-w-xs">
                          There are no expenditures logged on this specific filter. Log items or adjust filter values!
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3.5">
                        {activeTripMembers.map((memb) => {
                          const contributedAmount = memberContributions[memb.id] || 0;
                          const shareBalance = contributedAmount - publicPerPersonShare;
                          const sharePercentage = overallFilteredTotal > 0 ? (contributedAmount / overallFilteredTotal) * 100 : 0;

                          return (
                            <div key={memb.id} className="bg-surface-bright p-3.5 rounded-xl border border-outline-variant/10 flex flex-col gap-2">
                              {/* Member head details */}
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-extrabold text-xs flex items-center justify-center font-mono border border-primary/20">
                                    {memb.initials}
                                  </div>
                                  <div className="text-left font-sans">
                                    <h5 className="text-xs font-bold text-on-surface">{memb.name}</h5>
                                    <p className="text-[10px] font-mono text-on-surface-variant leading-none">
                                      Paid ₹{contributedAmount.toLocaleString('en-IN')}
                                    </p>
                                  </div>
                                </div>

                                {/* Dynamic Settlement Badger */}
                                {shareBalance > 0.05 ? (
                                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-green-500/10 text-green-600 dark:text-green-400 font-mono">
                                    Gets back ₹{shareBalance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                  </span>
                                ) : shareBalance < -0.05 ? (
                                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono">
                                    Owes ₹{Math.abs(shareBalance).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                  </span>
                                ) : (
                                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-gray-500/10 text-gray-500 font-mono">
                                    Settled Up
                                  </span>
                                )}
                              </div>

                              {/* Progress bar */}
                              <div className="w-full bg-surface-container-high rounded-full h-1.5 overflow-hidden">
                                <div 
                                  style={{ width: `${Math.min(100, Math.max(0, sharePercentage))}%` }}
                                  className="bg-primary h-full rounded-full transition-all duration-500" 
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-secondary/5 border border-secondary/10 rounded-xl text-left">
                  <span className="text-xs font-bold text-secondary flex items-center gap-1">
                    🛡️ Authenticated Actions
                  </span>
                  <p className="text-[11px] text-on-surface-variant font-medium mt-1 leading-relaxed">
                    To modify actual family records, update food statuses, add new members, or write transaction details directly to the Firebase Database, please log in as administrator using your credentials.
                  </p>
                </div>
              </div>

              {/* Right Column: Detailed Expense Feed */}
              <div className="lg:col-span-7 space-y-4 text-left">
                <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/15 flex flex-col h-full min-h-[400px]">
                  <div className="flex justify-between items-center mb-4 pb-2 border-b border-outline-variant/10">
                    <h3 className="text-sm font-bold text-on-surface flex items-center gap-1.5">
                      <Calendar className="w-4.5 h-4.5 text-primary" />
                      <span>Detailed Expense Ledger</span>
                    </h3>
                    <span className="text-[10px] font-semibold text-on-surface-variant bg-surface-bright px-2.5 py-0.5 rounded-full border border-outline-variant/10">
                      {filteredLiveExpenses.length} Items Found
                    </span>
                  </div>

                  {/* Empty state list checker */}
                  {filteredLiveExpenses.length === 0 ? (
                    <div className="flex-grow flex flex-col items-center justify-center py-12 text-center select-none">
                      <div className="p-3 bg-primary/5 rounded-full text-primary/50 mb-3">
                        <MapPin className="w-8 h-8" />
                      </div>
                      <h4 className="text-xs font-bold text-on-surface">At present no contribution</h4>
                      <p className="text-[10px] text-on-surface-variant/70 mt-1 max-w-sm">
                        There are no expenditures currently logged for Day {dayFilter === 'all' ? '1 to 4' : dayFilter}. Connect to admin console to log expenditures!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5 overflow-y-auto max-h-[480px] pr-1">
                      {filteredLiveExpenses.map((exp) => {
                        const paidByMember = activeTripMembers.find(m => m.id === exp.paidById);
                        return (
                          <div 
                            key={exp.id} 
                            className={`p-3.5 rounded-xl border border-outline-variant/10 bg-surface-bright hover:bg-surface-container/30 transition-colors flex justify-between items-center ${
                              exp.skipped ? 'opacity-50 select-none' : ''
                            }`}
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                                  exp.skipped 
                                    ? 'bg-red-500/10 text-red-500' 
                                    : 'bg-primary/10 text-primary'
                                }`}>
                                  Day {exp.day} - {exp.mealType}
                                </span>
                                <span className="text-[9px] font-bold text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-md font-sans">
                                  {exp.category}
                                </span>
                              </div>
                              <h5 className="text-xs font-bold text-on-surface leading-tight mt-0.5">
                                {exp.title}
                              </h5>
                              <p className="text-[10px] text-on-surface-variant font-medium">
                                Paid by: <strong className="text-on-surface font-semibold">{paidByMember?.name || 'Someone'}</strong>
                              </p>
                            </div>

                            <div className="text-right">
                              {exp.skipped ? (
                                <span className="text-[11px] font-bold text-red-500 line-through">
                                  SKIPPED
                                </span>
                              ) : (
                                <span className="text-sm font-extrabold text-on-surface font-mono">
                                  ₹{exp.amount.toLocaleString('en-IN', { minimumFractionDigits: 1 })}
                                </span>
                              )}
                              <p className="text-[8px] text-on-surface-variant font-mono mt-0.5">
                                {exp.dateCreated ? new Date(exp.dateCreated).toLocaleDateString() : 'N/A'}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* About Us Section */}
        <section className="py-16 px-6 md:px-12 bg-surface-container-lowest border-t border-outline-variant/10" id="about">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-1">
              <span className="text-xs font-bold uppercase tracking-widest text-primary mb-2 inline-block">SWAT FAMILY LEDGER</span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-on-surface mb-4">About Kuppu Swamy Trips</h2>
              <p className="text-xs md:text-sm text-on-surface-variant font-medium leading-relaxed mb-4">
                Established in 2024 to empower unified travel budgeting, our travel ecosystem lets families experience memorable adventures without the friction of complex spreadsheets. 
              </p>
              <p className="text-xs md:text-sm text-on-surface-variant font-medium leading-relaxed">
                Whether tracking a high-altitude tea &amp; snacks stop, family breakfast, or sightseeing ticket bookings across major events, our ledger ensures error-free contributions back to the common pool. Real-time updates operate dynamically!
              </p>
            </div>
            <div className="flex-1 w-full max-w-sm">
              <div className="relative rounded-2xl overflow-hidden shadow-md">
                <img 
                  alt="Scenic mountain road" 
                  className="w-full h-64 object-cover" 
                  referrerPolicy="no-referrer"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCLi-cy3sjHORq7VOt3UNwcjFZVyWC5hBlAahGO3BPuvbgP3AkGMEa9fDE5-XexZcx0TZqXhoYZAabke9GXPIhYkeY_VAe_b9McZHVevlgnVda5kF7fd78v1yA_wr4CV8ITnZtuwOlg794zKWr7hq3VccPnpbeh-lCpIOUV_DrPiyLf8s1jLHwPVZl_mlOJ1QrQnAp_02NA4vGBGfrw1x5_FRJltw5q9daBgsWS1Jv1cITLQr5ZD-tpGgKnYNd1zOtomd2YoJwdh2pV"
                />
                <div className="absolute inset-0 bg-primary/10 mix-blend-multiply" />
              </div>
            </div>
          </div>
        </section>

        {/* Share & Contact combined panels */}
        <section className="py-16 px-6 md:px-12 bg-surface-container-highest">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-6">
            {/* Share panel */}
            <div className="flex-1 bg-surface-container-lowest rounded-2xl p-8 shadow-xs border border-outline-variant/10 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                <LinkIcon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-on-surface mb-2">Share your trip</h3>
              <p className="text-xs md:text-sm text-on-surface-variant mb-6 leading-relaxed">
                Invite family members to view the ledger or add their own expenses instantly.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 w-full">
                <button
                  type="button"
                  onClick={openLogin}
                  className="flex-1 font-bold text-xs bg-[#25D366] hover:bg-[#128C7E] text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 cursor-pointer focus:outline-none"
                >
                  WhatsApp Share
                </button>
                <button
                  type="button"
                  onClick={openLogin}
                  className="flex-1 font-bold text-xs bg-white text-on-surface border border-outline-variant hover:bg-surface-variant py-3 px-4 rounded-lg flex items-center justify-center gap-2 cursor-pointer focus:outline-none"
                >
                  Copy Link URL
                </button>
              </div>
            </div>

            {/* Assistance support contact */}
            <div className="flex-1 bg-primary rounded-xl p-8 shadow-xs text-on-primary flex flex-col justify-center">
              <h3 className="text-lg font-extrabold mb-2 text-white">Need Assistance?</h3>
              <p className="text-xs md:text-sm text-on-primary/80 mb-6 leading-relaxed">
                Our support team is ready to help you untangle any travel finance or split issues on-site.
              </p>
              <div className="flex flex-col gap-2">
                <a
                  href="tel:+18005550199"
                  className="flex items-center gap-2 hover:bg-on-primary-fixed-variant p-2.5 rounded-lg transition-colors text-white text-xs font-semibold"
                >
                  <Phone className="w-4.5 h-4.5 text-white" />
                  <span>+1 (800) 555-0199</span>
                </a>
                <a
                  href="mailto:support@nomadfamily.com"
                  className="flex items-center gap-2 hover:bg-on-primary-fixed-variant p-2.5 rounded-lg transition-colors text-white text-xs font-semibold"
                >
                  <Mail className="w-4.5 h-4.5 text-white" />
                  <span>support@nomadfamily.com</span>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 bg-surface-container-lowest dark:bg-on-background border-t border-outline-variant/20">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-4">
          <button
            type="button"
            onClick={openLogin}
            className="font-bold text-xl text-primary dark:text-primary-fixed flex items-center gap-1.5 focus:outline-none cursor-pointer"
          >
            <Plane className="w-5 h-5 rotate-45 text-primary" />
            <span>Kuppu Swamy Trips</span>
          </button>
          
          <p className="text-xs text-on-surface-variant text-center md:text-left">
            © 2024 Kuppu Swamy Trips. All rights reserved. Registered SaaS.
          </p>
          
          <nav className="flex gap-4">
            <button type="button" onClick={openLogin} className="text-xs text-on-surface-variant hover:text-primary focus:outline-none cursor-pointer">Privacy Policy</button>
            <button type="button" onClick={openLogin} className="text-xs text-on-surface-variant hover:text-primary focus:outline-none cursor-pointer">Terms of Service</button>
          </nav>
        </div>
      </footer>

      {/* 🔐 High-Fidelity Firebase Logins Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop scale blur overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { if(!loading) setIsModalOpen(false); }}
              className="absolute inset-0 bg-on-background/40 backdrop-blur-md"
            />

            {/* Dialog Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 15 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative bg-surface-lowest rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-outline-variant/20 flex flex-col z-10"
            >
              {/* Header decor */}
              <div className="px-6 py-5 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container/30">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-xl text-primary">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-on-surface leading-tight">Secure Console login</h3>
                    <p className="text-[10px] text-on-surface-variant font-semibold uppercase tracking-wider">Firebase Identity Suite</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={loading}
                  className="text-on-surface-variant hover:text-on-surface hover:bg-surface-variant p-1.5 rounded-full outline-none focus:outline-none cursor-pointer disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleLoginSubmit} className="p-6 space-y-4">
                {/* Micro Alert instructions */}
                <div className="p-3.5 bg-secondary/10 border border-secondary/10 rounded-xl text-left">
                  <div className="flex items-start gap-2.5">
                    <span className="text-base text-secondary flex-shrink-0">🛡️</span>
                    <div className="text-[11px] font-medium text-on-surface-variant leading-relaxed">
                      Please enter correct credentials to access administrative desk and reports. Use seeded administrator account:
                      <div className="mt-1 font-semibold text-on-surface font-mono flex flex-col gap-0.5">
                        <span>Username: <strong className="text-secondary select-all">Rajesh</strong></span>
                        <span>Password: <strong className="text-secondary select-all">8072117912</strong></span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Username Input */}
                <div>
                  <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5 font-sans">
                    Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-on-surface-variant/75">
                      <User className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      required
                      disabled={loading}
                      placeholder="e.g. Rajesh"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="bg-surface-bright border border-outline-variant/30 text-on-surface text-sm rounded-xl focus:ring-2 focus:ring-primary block w-full pl-10 pr-4 py-2.5 outline-none font-semibold transition-all disabled:opacity-60"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5 font-sans">
                    Security Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-on-surface-variant/75">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type="password"
                      required
                      disabled={loading}
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-surface-bright border border-outline-variant/30 text-on-surface text-sm rounded-xl focus:ring-2 focus:ring-primary block w-full pl-10 pr-4 py-2.5 outline-none font-sans font-semibold transition-all disabled:opacity-60"
                    />
                  </div>
                </div>

                {/* Database State Warnings & Success Feedbacks */}
                <AnimatePresence mode="wait">
                  {errorMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2.5 text-red-500 text-xs font-semibold"
                    >
                      <ShieldAlert className="w-4 h-4 flex-shrink-0 animate-bounce" />
                      <span>{errorMessage}</span>
                    </motion.div>
                  )}

                  {successMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="p-3 bg-primary/10 border border-primary/20 rounded-xl flex items-center gap-2.5 text-primary text-xs font-semibold"
                    >
                      <ShieldCheck className="w-4 h-4 flex-shrink-0 text-primary" />
                      <span>{successMessage}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Action Buttons */}
                <div className="pt-2 flex flex-col gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full text-xs font-extrabold bg-primary hover:bg-primary-container text-on-primary py-3 px-5 rounded-xl shadow-xs hover:shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Checking Live Firebase DB...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4.5 h-4.5 text-white" />
                        <span>Connect &amp; Verify DB Login</span>
                      </>
                    )}
                  </button>
                  
                  <span className="text-[10px] text-center font-mono text-on-surface-variant/60 block">
                    ⚡ Secured with Firestore Attribute Access Control
                  </span>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
