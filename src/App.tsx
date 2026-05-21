/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  X, 
  MapPin, 
  Calendar, 
  Image as ImageIcon,
  CheckCircle,
  HelpCircle,
  TrendingDown,
  Info,
  Sparkles
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

// Modals / Imports
import Sidebar from './components/Sidebar';
import TopAppBar from './components/TopAppBar';
import LandingPageView from './components/LandingPageView';
import DashboardView from './components/DashboardView';
import TripsView from './components/TripsView';
import ExpensesView from './components/ExpensesView';
import MembersView from './components/MembersView';
import ReportsView from './components/ReportsView';
import SettingsView from './components/SettingsView';
import SpendingDetailsView from './components/SpendingDetailsView';
import GalleryView from './components/GalleryView';

import { INITIAL_TRIPS, INITIAL_MEMBERS, INITIAL_EXPENSES } from './data';
import { Trip, Member, Expense, MealType, ExpenseCategory } from './types';
import { 
  loadTripsFromFirestore, 
  saveTripToFirestore,
  loadMembersFromFirestore,
  saveMemberToFirestore,
  loadExpensesFromFirestore,
  saveExpenseToFirestore,
  deleteExpenseFromFirestore,
  clearAndResetFirebase,
  saveGalleryItemToFirestore
} from './firebase';
import { DEFAULT_MEMORIES } from './components/GalleryView';


export default function App() {
  // Global Application States
  const [activeView, setActiveView] = useState<string>('landing');
  const [sessionUser, setSessionUser] = useState<{ username: string; role: string } | null>(null);
  const [trips, setTrips] = useState<Trip[]>(INITIAL_TRIPS);
  const [activeTripId, setActiveTripId] = useState<string>('trip_2');
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);

  // Load from Firestore on mount
  useEffect(() => {
    async function loadData() {
      const dbTrips = await loadTripsFromFirestore();
      const dbMembers = await loadMembersFromFirestore();
      const dbExpenses = await loadExpensesFromFirestore();

      if (dbTrips && dbTrips.length > 0) {
        setTrips(dbTrips);
      } else {
        // Sync original trips configuration
        INITIAL_TRIPS.forEach(t => saveTripToFirestore(t));
      }

      if (dbMembers && dbMembers.length > 0) {
        // Ensure any new detailed family definitions (spouses/children) get merged & updated in Firestore
        const upgraded = dbMembers.map(dbM => {
          const initM = INITIAL_MEMBERS.find(m => m.id === dbM.id || m.name.toLowerCase().includes(dbM.name.toLowerCase()) || dbM.name.toLowerCase().includes(m.name.toLowerCase()));
          if (initM && (!dbM.spouse && initM.spouse)) {
            const merged = { ...dbM, ...initM };
            saveMemberToFirestore(merged);
            return merged;
          }
          return dbM;
        });
        setMembers(upgraded);
      } else {
        // Sync original members configuration
        INITIAL_MEMBERS.forEach(m => saveMemberToFirestore(m));
      }

      if (dbExpenses && dbExpenses.length > 0) {
        setExpenses(dbExpenses);
      } else {
        // Sync original expenses configuration
        INITIAL_EXPENSES.forEach(e => saveExpenseToFirestore(e));
        setExpenses(INITIAL_EXPENSES);
      }
    }
    loadData();
  }, []);
  
  // UI states
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [showAddTripModal, setShowAddTripModal] = useState<boolean>(false);
  const [showHelpToast, setShowHelpToast] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Trip Form States
  const [newTripName, setNewTripName] = useState('');
  const [newTripDates, setNewTripDates] = useState('');
  const [newTripDesc, setNewTripDesc] = useState('');
  const [newTripCover, setNewTripCover] = useState('');

  // Resolve Currently Active Workspace Trip
  const activeTrip = trips.find((t) => t.id === activeTripId) || trips[0] || null;

  // Active View naming
  const getViewTitle = () => {
    switch (activeView) {
      case 'dashboard':
        return 'Overview Dashboard';
      case 'trips':
        return 'Manage Trips';
      case 'members':
        return 'Family Members';
      case 'expenses':
        return 'Day Tracker & Expenses';
      case 'spending-details':
        return 'Spending Details';
      case 'gallery':
        return 'Trip Photo Gallery';
      case 'reports':
        return 'Analytics Report';
      case 'settings':
        return 'Trip Configuration';
      case 'help':
        return 'Kuppu Swamy Trips Help Desk';
      default:
        return 'Kuppu Swamy Trips Workspace';
    }
  };

  // Actions: Add Trip
  const handleAddNewTripSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTripName.trim() || !newTripDates.trim()) return;

    const covers = [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBG8UeVJnlj4mLhnYZS8nx_FZZ0fmHgWE6TqFe3E6BIuh4BRqjHOtiMIRkm7UBwi3QlTkkwEUF1DPihavs4LhxQWcBGOzqFoZdpCo78pXLRLgI8UV3wuqPnJIKfvp9eldGK2V9-OalpDbaCU2yhlLQAaiNzhpkxBd2Ivh8BSgSO48avlkYHqHshWKSCnfETJFAc7n2z6uCios6l5YvK_Vc9u283TBPs5ZzVg2TwDDIlM8bUP4PI1B3WJrXxPD_I7kwUUaYr9RXA_bvV',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAWs5-q-wwqS6Z1yEWwOe4-m6rZG4fiSemjPQgXBKU7ATu2kiH8881MwBfTe5I6kDRd7tCml9xnmrX0lfSINBe_f4DQjRo-jD-jYF9RwMO349uBgIrRjQWmsj7Ca3_7g_Js7Rc09RTEeYXgWvMrCHpKUX5VlliXuPucyzwTiHpCAoLNquRPOvD3uHJokj0wEFtWLUbJ4IgrCXFB3Dn6N2IdMxuSpQN3dHBOLOjixWtE4uHHvoItHp8m45TPYpskCibB9Ycx_UHqJSGQ',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCOTWN1XKp7HHrR9YGki7BZF6UvUZP1xzeVrMWucW_8sCWP-AdPpFTlwazRf-oEaIasNK-EiMYYyO5f4XbJoo7XYSO8vlIcHwP4kgDBBX7VDa1BSQ95Oux6ozPRjlPbMByTKPYA-AbZiyaJNXkuP1RHGcVhInuih6oEhBSdk2dB43-msFKcxwMnw4sCFwKmQDF4DhmIAtMYZhK6Mp-zyp1yRJ-2tUXIvJ74VS_EIrPq10hGpkk5HLUj4ZwTQqEht9nal9cw1UR8_OWr'
    ];
    const pickedCover = newTripCover.trim() || covers[Math.floor(Math.random() * covers.length)];

    const nextId = `trip_${Date.now()}`;
    const newTripItem: Trip = {
      id: nextId,
      name: newTripName.trim(),
      dateRange: newTripDates.trim(),
      coverImage: pickedCover,
      description: newTripDesc.trim() || 'No custom description provided yet. Let the logs capture the scenic routes!',
      status: 'Planning',
      memberIds: activeTrip ? [...activeTrip.memberIds] : ['member_6', 'member_7'], // share active members list
    };

    saveTripToFirestore(newTripItem);
    setTrips([newTripItem, ...trips]);
    setActiveTripId(nextId);
    setShowAddTripModal(false);
    setActiveView('trips');

    // Reset fields
    setNewTripName('');
    setNewTripDates('');
    setNewTripDesc('');
    setNewTripCover('');
  };

  // Actions: Add individual expense
  const handleAddExpense = (expData: {
    day: number;
    mealType: MealType;
    title: string;
    amount: number;
    paidById: string;
    category: ExpenseCategory;
    notes?: string;
  }) => {
    const newExp: Expense = {
      id: `exp_${Date.now()}`,
      tripId: activeTripId,
      day: expData.day,
      mealType: expData.mealType,
      title: expData.title,
      amount: expData.amount,
      paidById: expData.paidById,
      category: expData.category,
      dateCreated: new Date().toISOString(),
      notes: expData.notes,
    };

    setExpenses([newExp, ...expenses]);
    saveExpenseToFirestore(newExp);
    
    // Automatically show the "View Spending Details" page
    setActiveView('spending-details');
  };

  // Actions: Delete individual expense
  const handleDeleteExpense = (expId: string) => {
    setExpenses(expenses.filter((e) => e.id !== expId));
    deleteExpenseFromFirestore(expId);
  };

  // Actions: Edit individual expense
  const handleEditExpense = (expenseId: string, updatedData: Partial<Expense>) => {
    setExpenses((prevExpenses) => 
      prevExpenses.map((e) => {
        if (e.id === expenseId) {
          const updated = { ...e, ...updatedData };
          saveExpenseToFirestore(updated);
          return updated;
        }
        return e;
      })
    );
  };

  // Actions: Toggle Dinner Skip
  const handleToggleDinnerSkip = (dayNo: number, isSkipped: boolean) => {
    if (isSkipped) {
      // Create a dummy placeholder expense flagged as skipped for calculations
      const existSkip = expenses.find(e => e.tripId === activeTripId && e.day === dayNo && e.mealType === 'Dinner' && e.skipped === true);
      if (!existSkip) {
        const skippedDinnerExp: Expense = {
          id: `exp_skip_${activeTripId}_${dayNo}`,
          tripId: activeTripId,
          day: dayNo,
          mealType: 'Dinner',
          title: 'Skipped Dinner (No cost)',
          amount: 0,
          paidById: 'member_6', // default Prakash
          category: 'Food',
          dateCreated: new Date().toISOString(),
          skipped: true,
        };
        // Remove active dinner items first on that day to prevent database clashes
        const toDeleteList = expenses.filter(e => e.tripId === activeTripId && e.day === dayNo && e.mealType === 'Dinner' && !e.skipped);
        toDeleteList.forEach(e => {
          deleteExpenseFromFirestore(e.id);
        });

        const filtered = expenses.filter(e => !(e.tripId === activeTripId && e.day === dayNo && e.mealType === 'Dinner' && !e.skipped));
        setExpenses([skippedDinnerExp, ...filtered]);
        saveExpenseToFirestore(skippedDinnerExp);
      }
    } else {
      // Remove skipped descriptor
      const skippedId = `exp_skip_${activeTripId}_${dayNo}`;
      deleteExpenseFromFirestore(skippedId);
      setExpenses(expenses.filter(e => !(e.tripId === activeTripId && e.day === dayNo && e.mealType === 'Dinner' && e.skipped === true)));
    }
  };

  // Actions: Add new family member with optional starting spend amount
  const handleAddMember = (mName: string, mEmail: string, initialSpend?: number, spouse?: string, childrenUnder13?: string[]) => {
    const initials = mName
      .trim()
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const mId = `member_${Date.now()}`;
    
    // Assemble family note automatically
    let familyNote = '';
    if (spouse && spouse.trim()) {
      familyNote += `Spouse: ${spouse.trim()}`;
    }
    if (childrenUnder13 && childrenUnder13.length > 0) {
      if (familyNote) familyNote += ', ';
      familyNote += `Kids under 13: ${childrenUnder13.join(', ')}`;
    }

    const newMember: Member = {
      id: mId,
      name: mName.trim(),
      initials,
      email: mEmail || undefined,
      spouse: spouse?.trim() || undefined,
      childrenUnder13: childrenUnder13 && childrenUnder13.length > 0 ? childrenUnder13 : undefined,
      familyNote: familyNote || undefined,
    };

    const updatedMembList = [...members, newMember];
    setMembers(updatedMembList);
    saveMemberToFirestore(newMember);

    // Create custom starting prepay activity event if spend is provided
    if (initialSpend && initialSpend > 0) {
      const initExp: Expense = {
        id: `exp_init_${Date.now()}`,
        tripId: activeTripId,
        day: 1,
        mealType: 'Other',
        title: `${mName}'s Initial Prepaid Fund`,
        amount: initialSpend,
        paidById: mId,
        category: 'Other',
        dateCreated: new Date().toISOString()
      };
      setExpenses((prev) => [initExp, ...prev]);
      saveExpenseToFirestore(initExp);
    }
    
    // Add member to the active trip workspace
    if (activeTrip) {
      setTrips(
        trips.map((t) => {
          if (t.id === activeTripId) {
            const updatedTrip = {
              ...t,
              memberIds: [...t.memberIds, mId],
            };
            saveTripToFirestore(updatedTrip);
            return updatedTrip;
          }
          return t;
        })
      );
    }
  };

  // Update Trip parameters
  const handleUpdateTrip = (tripId: string, updatedData: Partial<Trip>) => {
    setTrips(
      trips.map((t) => {
        if (t.id === tripId) {
          const updated = { ...t, ...updatedData };
          saveTripToFirestore(updated);
          return updated;
        }
        return t;
      })
    );
  };

  // Clear all expenses
  const handleClearAllExpenses = (tripId: string) => {
    const toDelete = expenses.filter((e) => e.tripId === tripId);
    setExpenses(expenses.filter((e) => e.tripId !== tripId));
    toDelete.forEach((e) => deleteExpenseFromFirestore(e.id));
  };

  // Full database erase & optional reseed
  const handleFullReset = async (mode: 'blank' | 'reseed') => {
    try {
      await clearAndResetFirebase();
      if (mode === 'blank') {
        setTrips([]);
        setMembers([]);
        setExpenses([]);
        setActiveTripId('');
      } else {
        // Reseed Firestore
        for (const t of INITIAL_TRIPS) {
          await saveTripToFirestore(t);
        }
        for (const m of INITIAL_MEMBERS) {
          await saveMemberToFirestore(m);
        }
        for (const e of INITIAL_EXPENSES) {
          await saveExpenseToFirestore(e);
        }
        for (const imgItem of DEFAULT_MEMORIES) {
          await saveGalleryItemToFirestore(imgItem);
        }

        // Reseed state variables
        setTrips(INITIAL_TRIPS);
        setMembers(INITIAL_MEMBERS);
        setExpenses(INITIAL_EXPENSES);
        setActiveTripId('trip_2');
      }
    } catch (err) {
      console.error("Full Reset flow failed to complete: ", err);
      throw err;
    }
  };

  // Switch to Dashboard
  const handleGetStartedLogin = () => {
    setActiveView('dashboard');
  };

  // Render Page Content Layout
  const renderWorkspaceView = () => {
    // Elegant Empty State when database contains 0 trips
    if (!activeTrip && activeView !== 'settings' && activeView !== 'help' && activeView !== 'trips') {
      return (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-grow flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto w-full min-h-[60vh]"
        >
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 border-2 border-primary/20 shadow-xs animate-pulse">
            <MapPin className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-extrabold text-on-surface tracking-tight mb-2">Adventure Awaits!</h2>
          <p className="text-sm text-on-surface-variant font-medium leading-relaxed mb-8">
            Your Firebase Firestore database is clean and completely fresh. You can begin from raw scratch, or instantly restore the default pre-configured family tour ledger.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <button
              onClick={() => handleFullReset('reseed')}
              className="bg-primary hover:bg-primary-container text-on-primary font-bold text-xs py-3.5 px-6 rounded-full shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-102"
            >
              <Sparkles className="w-4 h-4 text-on-primary" />
              <span>Restore Default May 2026 Tour Ledger</span>
            </button>
            <button
              onClick={() => setShowAddTripModal(true)}
              className="bg-surface-bright border border-outline-variant/30 text-on-surface hover:bg-surface-variant/20 font-bold text-xs py-3.5 px-6 rounded-full shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-102"
            >
              <Plus className="w-4 h-4 text-primary" />
              <span>Add Custom Trip</span>
            </button>
          </div>
          <p className="text-xs text-on-surface-variant mt-6">
            Or configure settings inside the <button onClick={() => setActiveView('settings')} className="text-primary font-bold hover:underline">Settings Panel</button>.
          </p>
        </motion.div>
      );
    }

    switch (activeView) {
      case 'dashboard':
        return activeTrip ? (
          <DashboardView
            activeTrip={activeTrip}
            expenses={expenses}
            members={members}
            onAddExpenseClick={() => setActiveView('expenses')}
            onAddMemberClick={() => setActiveView('members')}
            setActiveView={setActiveView}
            onAddMemberAndSpend={(name, email, spend) => handleAddMember(name, email, spend)}
            onAddExpense={handleAddExpense}
          />
        ) : null;
      case 'trips':
        return (
          <TripsView
            trips={trips}
            activeTripId={activeTripId}
            onSetActiveTrip={setActiveTripId}
            members={members}
            onAddNewTrip={() => setShowAddTripModal(true)}
          />
        );
      case 'expenses':
        return activeTrip ? (
          <ExpensesView
            activeTrip={activeTrip}
            expenses={expenses}
            members={members}
            onAddExpense={handleAddExpense}
            onDeleteExpense={handleDeleteExpense}
            onToggleDinnerSkip={handleToggleDinnerSkip}
            onEditExpense={handleEditExpense}
            onClose={() => setActiveView('dashboard')}
          />
        ) : null;
      case 'members':
        return activeTrip ? (
          <MembersView
            activeTrip={activeTrip}
            members={members}
            expenses={expenses}
            onAddMember={handleAddMember}
            onClose={() => setActiveView('dashboard')}
          />
        ) : null;
      case 'reports':
        return activeTrip ? (
          <ReportsView
            activeTrip={activeTrip}
            expenses={expenses}
          />
        ) : null;
      case 'spending-details':
        return activeTrip ? (
          <SpendingDetailsView
            activeTrip={activeTrip}
            expenses={expenses}
            members={members}
            onClose={() => setActiveView('dashboard')}
          />
        ) : null;
      case 'gallery':
        return activeTrip ? (
          <GalleryView
            activeTrip={activeTrip}
            trips={trips}
            members={members}
            onClose={() => setActiveView('dashboard')}
          />
        ) : null;
      case 'settings':
        return (
          <SettingsView
            activeTrip={activeTrip!}
            onUpdateTrip={handleUpdateTrip}
            onClearAllExpenses={handleClearAllExpenses}
            onFullReset={handleFullReset}
          />
        );
      case 'help':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto w-full flex-grow flex flex-col gap-6"
          >
            <div className="glass-card p-6 rounded-2xl">
              <h3 className="text-xl font-bold text-on-surface mb-2 flex items-center gap-2">
                <HelpCircle className="w-5.5 h-5.5 text-primary" />
                <span>Kuppu Swamy Trips Help Center</span>
              </h3>
              <p className="text-xs text-on-surface-variant mb-6 font-semibold uppercase tracking-wider">Frequently Asked Questions</p>

              <div className="space-y-4">
                <div className="p-4 bg-surface-bright rounded-xl border border-outline-variant/15">
                  <h4 className="font-bold text-sm text-on-surface">How are dinner skips handled?</h4>
                  <p className="text-xs text-on-surface-variant font-medium mt-1 leading-relaxed">
                    Checking the &quot;Skipped Dinner&quot; box on Day tracker greys out the dinner cards list and keeps total bills at ₹0.00 for dinners on that day, helping you omit meals that local groups skipped!
                  </p>
                </div>
                <div className="p-4 bg-surface-bright rounded-xl border border-outline-variant/15">
                  <h4 className="font-bold text-sm text-on-surface">Can I register an infinite count of trips?</h4>
                  <p className="text-xs text-on-surface-variant font-medium mt-1 leading-relaxed">
                    Yes! Click the &quot;Create New Trip&quot; button in the sidebar or Trips manager. New adventures instantly inherit active members to start logging!
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  // Landing Page layout holds no sidebar/topappbar
  if (activeView === 'landing') {
    return (
      <LandingPageView 
        onLoginSuccess={(username, role) => {
          setSessionUser({ username, role });
          setActiveView('dashboard');
        }} 
        members={members}
        expenses={expenses}
        trips={trips}
      />
    );
  }

  return (
    <div className="bg-background text-on-background min-h-screen flex selection:bg-primary/20">
      {/* 1. Sidebar Left */}
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        activeTrip={activeTrip}
        onAddNewTrip={() => setShowAddTripModal(true)}
        onLogout={() => {
          setSessionUser(null);
          setActiveView('landing');
        }}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* 2. Main Content container wrapper */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen relative">
        <TopAppBar
          title={getViewTitle()}
          onMenuToggle={() => setIsSidebarOpen(true)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onNotificationClick={() => {
            setShowHelpToast(true);
            setTimeout(() => setShowHelpToast(false), 3500);
          }}
          onProfileClick={() => setActiveView('settings')}
          sessionUser={sessionUser}
        />

        {/* Dynamic Inner Component wrapper */}
        <div id="main-content-flow" className="flex-grow flex flex-col w-full">
          {renderWorkspaceView()}
        </div>
      </div>

      {/* 3. Alerts notification alerts popup */}
      <AnimatePresence>
        {showHelpToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 p-4 bg-primary text-on-primary rounded-xl shadow-lg border border-primary-container max-w-sm flex items-center gap-3"
          >
            <CheckCircle className="w-5 h-5 text-white flex-shrink-0" />
            <div>
              <p className="font-bold text-xs">Family Alert</p>
              <p className="text-[10px] text-white/90">Welcome back! All currency values correspond to your active trip workspace.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. "Create New Trip" Modal Panel Drawer */}
      <AnimatePresence>
        {showAddTripModal && (
          <div className="fixed inset-0 bg-on-background/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface-lowest rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-outline-variant/15 flex flex-col"
            >
              <div className="px-6 py-4 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container/20">
                <h3 className="font-bold text-base text-on-surface flex items-center gap-1.5">
                  <Plus className="w-5 h-5 text-primary" />
                  <span>Create New Adventure</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddTripModal(false)}
                  className="text-on-surface-variant hover:text-on-surface hover:bg-surface-variant p-1 rounded-full outline-none focus:outline-none cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddNewTripSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Adventure Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Winter Resort Break"
                    value={newTripName}
                    onChange={(e) => setNewTripName(e.target.value)}
                    required
                    className="bg-surface-bright border border-outline-variant/30 text-on-surface text-sm rounded-lg focus:ring-2 focus:ring-primary block w-full p-2.5 outline-none font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Trip Dates Range</label>
                  <input
                    type="text"
                    placeholder="e.g. Dec 10 - Dec 18, 2026"
                    value={newTripDates}
                    onChange={(e) => setNewTripDates(e.target.value)}
                    required
                    className="bg-surface-bright border border-outline-variant/30 text-on-surface text-sm rounded-lg focus:ring-2 focus:ring-primary block w-full p-2.5 outline-none font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Cover Image Link (Optional)</label>
                  <input
                    type="text"
                    placeholder="Paste JPEG/PNG URL... or randomize!"
                    value={newTripCover}
                    onChange={(e) => setNewTripCover(e.target.value)}
                    className="bg-surface-bright border border-outline-variant/30 text-on-surface text-sm rounded-lg focus:ring-2 focus:ring-primary block w-full p-2.5 outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Brief Description (Optional)</label>
                  <textarea
                    rows={2}
                    placeholder="Track our trip notes details here..."
                    value={newTripDesc}
                    onChange={(e) => setNewTripDesc(e.target.value)}
                    className="bg-surface-bright border border-outline-variant/30 text-on-surface text-sm rounded-lg focus:ring-2 focus:ring-primary block w-full p-2.5 outline-none font-medium leading-normal"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-outline-variant/10 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowAddTripModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-on-surface-variant hover:bg-surface-variant rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-on-primary bg-primary hover:bg-primary-container rounded-lg cursor-pointer shadow-xs transition-colors"
                  >
                    Launch Trip
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
