/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Calendar, MoreVertical, Plus, CheckCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Trip, Member } from '../types';

interface TripsViewProps {
  trips: Trip[];
  activeTripId: string;
  onSetActiveTrip: (tripId: string) => void;
  members: Member[];
  onAddNewTrip: () => void;
}

export default function TripsView({
  trips,
  activeTripId,
  onSetActiveTrip,
  members,
  onAddNewTrip,
}: TripsViewProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>('');

  // Sorter / Filter grouping matching mockup
  const filteredTrips = selectedFilter
    ? trips.filter((t) => t.dateRange.toLowerCase().includes(selectedFilter.toLowerCase()) || t.name.toLowerCase().includes(selectedFilter.toLowerCase()))
    : trips;

  const getStatusBadge = (status: Trip['status']) => {
    switch (status) {
      case 'Planning':
        return (
          <div className="absolute top-4 right-4 bg-surface-lowest/90 backdrop-blur-md px-3 py-1 rounded-full border border-outline-variant/10 shadow-xs flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-[10px] md:text-xs font-bold text-on-surface uppercase tracking-wider">Planning</span>
          </div>
        );
      case 'Upcoming':
        return (
          <div className="absolute top-4 right-4 bg-surface-lowest/90 backdrop-blur-md px-3 py-1 rounded-full border border-outline-variant/10 shadow-xs flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-secondary" />
            <span className="text-[10px] md:text-xs font-bold text-on-surface uppercase tracking-wider">Upcoming</span>
          </div>
        );
      case 'Completed':
        return (
          <div className="absolute top-4 right-4 bg-surface-lowest/90 backdrop-blur-md px-3 py-1 rounded-full border border-outline-variant/10 shadow-xs flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-outline" />
            <span className="text-[10px] md:text-xs font-bold text-on-surface uppercase tracking-wider">Completed</span>
          </div>
        );
      default:
        return null;
    }
  };

  const getMemberMeta = (memberId: string) => {
    const m = members.find(u => u.id === memberId);
    return m ? m.initials : 'UN';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full flex-1 flex flex-col gap-6"
    >
      {/* Header and Filter drop inputs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-on-background tracking-tight">Manage Trips</h1>
          <p className="text-sm text-on-surface-variant font-medium mt-1">Organize and track all your family adventures.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Filter Form */}
          <div className="relative flex-1 md:flex-none">
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="appearance-none w-full md:w-48 bg-surface-lowest border border-outline-variant/25 text-on-surface font-semibold text-xs rounded-lg pl-4 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-primary shadow-xs cursor-pointer"
            >
              <option value="">All Months</option>
              <option value="2026">May 2026</option>
              <option value="2024">July 2024</option>
              <option value="2023">October 2023</option>
              <option value="2022">December 2022</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          
          <button
            type="button"
            onClick={onAddNewTrip}
            className="bg-primary hover:bg-primary-container text-on-primary font-bold text-xs rounded-lg px-5 py-3 flex items-center gap-2 shadow-xs hover:shadow-sm transition-all active:scale-95 whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Trip</span>
          </button>
        </div>
      </div>

      {/* Grid structure of cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {filteredTrips.map((trip) => {
          const isActive = trip.id === activeTripId;
          return (
            <article 
              key={trip.id} 
              className={`bg-surface-lowest/80 backdrop-blur-md rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 border flex flex-col translate-all ${
                isActive ? 'border-primary ring-2 ring-primary/20 bg-white' : 'border-outline-variant/10'
              }`}
            >
              <div className="h-48 w-full bg-surface-variant relative overflow-hidden">
                <img 
                  alt={trip.name} 
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-[1.03]" 
                  referrerPolicy="no-referrer"
                  src={trip.coverImage} 
                />
                {getStatusBadge(trip.status)}

                {/* Active Indicator tag */}
                {isActive && (
                  <div className="absolute top-4 left-4 bg-primary text-on-primary text-[10px] font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    <span>Selected Workspace</span>
                  </div>
                )}
              </div>

              <div className="p-6 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-on-background tracking-tight">{trip.name}</h3>
                  <button className="text-on-surface-variant hover:text-primary transition-colors p-1.5 hover:bg-surface-variant/40 rounded-full focus:outline-none">
                    <MoreVertical className="w-4.5 h-4.5" />
                  </button>
                </div>
                
                <div className="flex items-center gap-1.5 text-on-surface-variant/90 mb-4 text-xs font-semibold">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span>{trip.dateRange}</span>
                </div>

                <p className="text-[13px] md:text-sm text-on-surface-variant line-clamp-2 mb-6 flex-1 font-medium leading-relaxed">
                  {trip.description}
                </p>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-outline-variant/10">
                  <div className="flex -space-x-2.5 overflow-hidden">
                    {trip.memberIds.slice(0, 3).map((mId, i) => (
                      <div 
                        key={mId} 
                        className="w-8 h-8 rounded-full bg-primary/10 border-2 border-surface-lowest flex items-center justify-center text-xs font-bold text-primary shadow-xs"
                      >
                        {getMemberMeta(mId)}
                      </div>
                    ))}
                    {trip.memberIds.length > 3 && (
                      <div className="w-8 h-8 rounded-full bg-surface-container border-2 border-surface-lowest flex items-center justify-center text-xs font-bold text-on-surface shadow-xs">
                        +{trip.memberIds.length - 3}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => onSetActiveTrip(trip.id)}
                    className={`font-semibold text-xs px-4 py-2 rounded-lg transition-all focus:outline-none ${
                      isActive
                        ? 'bg-secondary/15 text-secondary hover:bg-secondary/20 font-bold'
                        : 'bg-surface-container hover:bg-surface-variant text-primary hover:text-primary-container'
                    }`}
                  >
                    {isActive ? 'Current Work' : (trip.status === 'Completed' ? 'View Details' : 'Manage Trip')}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </motion.div>
  );
}
