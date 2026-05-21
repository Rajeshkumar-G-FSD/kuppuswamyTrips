/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  Image as ImageIcon, 
  Plus, 
  X, 
  Trash2, 
  Calendar, 
  MapPin, 
  Compass, 
  Utensils, 
  Info,
  ExternalLink,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Trip, Member } from '../types';
import { loadGalleryFromFirestore, saveGalleryItemToFirestore, deleteGalleryItemFromFirestore } from '../firebase';

export interface GalleryItem {
  id: string;
  tripId: string;
  title: string;
  description: string;
  imageUrl: string;
  location: string;
  date: string;
  tag?: string;
  addedBy?: string;
}

interface GalleryViewProps {
  activeTrip: Trip;
  trips: Trip[];
  members: Member[];
  onClose?: () => void;
}

// Beautiful default curated images for initial user experience
const DEFAULT_MEMORIES: GalleryItem[] = [
  {
    id: 'mem_1',
    tripId: 'trip_2',
    title: 'Eiffel Tower Twilight, Paris',
    description: 'Breathtaking view of the sparkling Eiffel Tower at sunset, taking in the romantic Parisian atmosphere during our family night walk.',
    imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
    location: 'Paris, France',
    date: '2026-05-12',
    tag: 'Sights',
    addedBy: 'Prakash'
  },
  {
    id: 'mem_2',
    tripId: 'trip_2',
    title: 'Grand Colosseum Walk, Rome',
    description: 'Walking under the majestic arches of the Roman Colosseum, feeling centuries of legendary Italian history all around Rajesh and the kids.',
    imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80',
    location: 'Rome, Italy',
    date: '2026-05-18',
    tag: 'Sights',
    addedBy: 'Bhuvanesh'
  },
  {
    id: 'mem_3',
    tripId: 'trip_2',
    title: 'Venetian Gondola Voyage',
    description: 'Gliding peacefully along the historic Grand Canal in Venice. The ancient narrow waterways felt completely magical.',
    imageUrl: 'https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=800&q=80',
    location: 'Venice, Italy',
    date: '2026-05-15',
    tag: 'Activities',
    addedBy: 'Rajeshkumar'
  },
  {
    id: 'mem_4',
    tripId: 'trip_2',
    title: 'Pâtisserie French Breakfast',
    description: 'Mouth-watering fresh butter croissants, pain au chocolat, and double espresso at a cozy street alley café near Montmartre.',
    imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80',
    location: 'Paris, France',
    date: '2026-05-11',
    tag: 'Food',
    addedBy: 'Prakash'
  },
  {
    id: 'mem_5',
    tripId: 'trip_2',
    title: 'Cozy Family Dinner Banquet',
    description: 'Splendid woodfired Neapolitan pizzas, freshly rolled pasta, and local mocktails reflecting deep laughter and stories compiled together.',
    imageUrl: 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&w=800&q=80',
    location: 'Florence, Italy',
    date: '2026-05-16',
    tag: 'Food',
    addedBy: 'Gnanakumar-Rajesh'
  },
  {
    id: 'mem_6',
    tripId: 'trip_2',
    title: 'Tuscan Hillside Panorama',
    description: 'Endless rolling emerald hills, rows of tall green cyprus trees, and golden afternoon sunrays enveloping the serene villas of Tuscany.',
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
    location: 'Tuscany, Italy',
    date: '2026-05-17',
    tag: 'Sightseeing',
    addedBy: 'Bhuvanesh'
  }
];

export default function GalleryView({
  activeTrip,
  trips,
  members,
  onClose,
}: GalleryViewProps) {
  const [selectedTripId, setSelectedTripId] = useState<string>(activeTrip.id);
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryItem | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [tag, setTag] = useState('Sights');
  const [addedBy, setAddedBy] = useState('');

  // Load from Firebase on start
  useEffect(() => {
    async function loadGallery() {
      setLoading(true);
      try {
        const fbGallery = await loadGalleryFromFirestore();
        if (fbGallery && fbGallery.length > 0) {
          // Cast values
          setItems(fbGallery as GalleryItem[]);
        } else {
          // Fallback to default memories and seed them to Firestore so they show permanently
          setItems(DEFAULT_MEMORIES);
          // Seed silently
          for (const memory of DEFAULT_MEMORIES) {
            await saveGalleryItemToFirestore(memory);
          }
        }
      } catch (err) {
        console.warn("Could not fetch gallery items. Using local backup.", err);
        setItems(DEFAULT_MEMORIES);
      } finally {
        setLoading(false);
      }
    }
    loadGallery();
  }, []);

  // Filter gallery photos according to current selected trip
  const tripMemories = items.filter(item => item.tripId === selectedTripId);

  // Selected trip meta
  const currentTripMeta = trips.find(t => t.id === selectedTripId) || activeTrip;

  // Handle saving new gallery photos to Firebase
  const handleAddPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imageUrl.trim() || !location.trim()) return;

    const newItem: GalleryItem = {
      id: `gallery_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      tripId: selectedTripId,
      title: title.trim(),
      description: description.trim(),
      imageUrl: imageUrl.trim(),
      location: location.trim(),
      date,
      tag,
      addedBy: addedBy || undefined
    };

    const updated = [newItem, ...items];
    setItems(updated);
    
    // Save to Firestore DB
    await saveGalleryItemToFirestore(newItem);

    // Reset Form
    setTitle('');
    setDescription('');
    setImageUrl('');
    setLocation('');
    setDate(new Date().toISOString().split('T')[0]);
    setTag('Sights');
    setAddedBy('');
    setIsAddOpen(false);
  };

  // Handle deleting photos
  const handleDeletePhoto = async (photoId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering lightbox clicks
    if (!window.confirm("Are you sure you want to delete this trip memory from the gallery?")) {
      return;
    }

    const updated = items.filter(i => i.id !== photoId);
    setItems(updated);

    // Remove from Firestore
    await deleteGalleryItemFromFirestore(photoId);

    if (selectedPhoto?.id === photoId) {
      setSelectedPhoto(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full flex-grow flex flex-col gap-6"
    >
      {/* Header element */}
      <div className="flex flex-wrap justify-between items-center bg-surface-container-low p-5 rounded-2xl border border-outline-variant/15 shadow-xs gap-4">
        <div className="text-left">
          <span className="text-[10px] font-bold tracking-widest text-primary uppercase bg-primary/10 rounded-full px-3 py-1 mb-2 inline-block">
            SIGHTS &amp; MEMORIES
          </span>
          <h2 className="text-xl font-bold text-on-surface flex items-center gap-1.5">
            <Camera className="w-5 h-5 text-primary" />
            <span>Trip Photo Gallery</span>
          </h2>
          <p className="text-xs text-on-surface-variant font-medium mt-1">
            Visual diary of landmarks, food spots, and beautiful bonding highlights captured across your vacation tracks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 px-3.5 hover:bg-surface-variant text-on-surface-variant hover:text-on-surface hover:ring-1 hover:ring-outline-variant/15 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold font-sans"
            >
              <X className="w-4 h-4 text-primary" />
              <span>Close</span>
            </button>
          )}
        </div>
      </div>

      {/* Control panel & selector dropdowns */}
      <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/15 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider font-sans shrink-0">
            Select Trip Workspace:
          </label>
          <select
            value={selectedTripId}
            onChange={(e) => setSelectedTripId(e.target.value)}
            className="bg-surface-bright border border-outline-variant/30 text-xs rounded-lg p-2.5 outline-none cursor-pointer text-on-surface font-semibold max-w-xs focus:ring-1 focus:ring-primary flex-grow"
          >
            {trips.map((tb) => (
              <option key={tb.id} value={tb.id}>
                {tb.name} ({tb.dateRange})
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="bg-primary hover:bg-primary-container text-on-primary font-bold text-xs p-2.5 px-4 rounded-xl shadow-xs transition-transform transform active:scale-95 flex items-center gap-1.5 cursor-pointer w-full sm:w-auto justify-center"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>Upload Memory Photo</span>
        </button>
      </div>

      {/* Main photo grid */}
      {loading ? (
        <div className="py-24 text-center">
          <span className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></span>
          <p className="text-xs font-semibold text-on-surface-variant mt-2 font-mono">Syncing visual gallery from Firestore DB...</p>
        </div>
      ) : tripMemories.length === 0 ? (
        <div className="bg-surface-container-low border border-dashed border-outline-variant/25 rounded-2xl py-20 px-6 text-center select-none flex flex-col items-center justify-center">
          <ImageIcon className="w-12 h-12 text-outline/50 mb-3 animate-pulse" />
          <h4 className="text-sm font-bold text-on-surface">No Gallery Photos Found</h4>
          <p className="text-xs text-on-surface-variant max-w-md mt-1 mb-6">
            There are no photos uploaded for <strong>{currentTripMeta.name}</strong> yet. Be the first to catalog a breathtaking landmark, cozy dinner, or ticket slip memory!
          </p>
          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="bg-surface-bright border border-outline-variant/35 text-primary hover:bg-primary/5 hover:border-primary/50 text-xs font-semibold p-2 px-4 rounded-xl transition-all cursor-pointer shadow-2xs"
          >
            Add Your First Image
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tripMemories.map((memory, index) => (
            <motion.div
              layoutId={memory.id}
              key={memory.id}
              onClick={() => setSelectedPhoto(memory)}
              whileHover={{ y: -4, transition: { duration: 0.15 } }}
              className="bg-surface-container-low rounded-2xl overflow-hidden cursor-pointer border border-outline-variant/15 flex flex-col h-full shadow-xs hover:shadow-md transition-shadow group relative"
            >
              {/* Media banner */}
              <div className="relative aspect-video w-full overflow-hidden bg-black/10">
                <img
                  src={memory.imageUrl}
                  alt={memory.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    // Fallback on visual render error
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80';
                  }}
                />

                {/* Categories Badge tag */}
                {memory.tag && (
                  <span className="absolute top-3 left-3 bg-black/60 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md backdrop-blur-xs">
                    {memory.tag}
                  </span>
                )}

                {/* Trash delete action */}
                <button
                  type="button"
                  onClick={(e) => handleDeletePhoto(memory.id, e)}
                  className="absolute top-3 right-3 bg-black/40 hover:bg-error text-white opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all"
                  title="Delete memory"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Informative text content */}
              <div className="p-4 flex-grow flex flex-col justify-between text-left">
                <div>
                  <h4 className="text-xs font-bold text-on-surface line-clamp-1 group-hover:text-primary transition-colors">
                    {memory.title}
                  </h4>
                  <p className="text-[11px] text-on-surface-variant line-clamp-2 mt-1.5 leading-relaxed">
                    {memory.description || 'No memory notes logged.'}
                  </p>
                </div>

                {/* Footer metadata block */}
                <div className="border-t border-outline-variant/10 pt-3 mt-4 flex justify-between items-center text-[10px] text-on-surface-variant font-medium">
                  <span className="flex items-center gap-1 font-mono">
                    <Calendar className="w-3 h-3 text-primary shrink-0" />
                    <span>{new Date(memory.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </span>

                  <span className="flex items-center gap-1 font-sans">
                    <MapPin className="w-3 h-3 text-secondary shrink-0" />
                    <span className="truncate max-w-[100px]">{memory.location}</span>
                  </span>
                </div>
              </div>

              {/* Contributor credit tag */}
              {memory.addedBy && (
                <div className="absolute bottom-11 right-3 bg-surface-container-high/95 text-on-surface text-[9px] font-bold px-2 py-0.5 rounded-full border border-outline-variant/10 shadow-xs pointer-events-none">
                  👤 By {memory.addedBy}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Memory Dialog Overlay Modal */}
      <AnimatePresence>
        {isAddOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface-container-high rounded-2xl p-6 shadow-xl w-full max-w-md border border-outline-variant/15 text-left"
            >
              <div className="flex justify-between items-center border-b border-outline-variant/15 pb-3 mb-4">
                <h3 className="text-base font-bold text-on-surface flex items-center gap-1.5">
                  <Camera className="w-5 h-5 text-primary" />
                  <span>Upload Travel Memory Photo</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="p-1 px-1.5 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-variant/40"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddPhoto} className="space-y-4">
                {/* Photo Title */}
                <div>
                  <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                    Photo Memory Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Eiffel Tower Sunrise, Family Dinner"
                    required
                    className="bg-surface-bright border border-outline-variant/30 text-on-surface text-sm rounded-lg focus:ring-2 focus:ring-primary block w-full p-2.5 outline-none font-medium"
                  />
                </div>

                {/* Public image URL option */}
                <div>
                  <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                    Image URL Address *
                  </label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="e.g., https://images.unsplash.com/photo-..."
                    required
                    className="bg-surface-bright border border-outline-variant/30 text-on-surface text-xs rounded-lg focus:ring-2 focus:ring-primary block w-full p-2.5 outline-none font-mono"
                  />
                  <p className="text-[10px] text-on-surface-variant/60 font-medium mt-1">
                    Provide a valid HTTP/HTTPS direct unsplash or web image path.
                  </p>
                </div>

                {/* Country/Locality and Date */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                      Locality/City *
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Paris, France"
                      required
                      className="bg-surface-bright border border-outline-variant/30 text-on-surface text-xs rounded-lg focus:ring-2 focus:ring-primary block w-full p-2 outline-none font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                      Date Captured
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="bg-surface-bright border border-outline-variant/30 text-on-surface text-xs rounded-lg focus:ring-2 focus:ring-primary block w-full p-2 outline-none font-mono"
                    />
                  </div>
                </div>

                {/* Category select tags + addedBy payer */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                      Memories category
                    </label>
                    <select
                      value={tag}
                      onChange={(e) => setTag(e.target.value)}
                      className="bg-surface-bright border border-outline-variant/30 text-on-surface text-xs rounded-lg focus:ring-2 focus:ring-primary block w-full p-2 cursor-pointer outline-none font-semibold"
                    >
                      <option value="Sights">Cultural Sights</option>
                      <option value="Food">Local Cuisine</option>
                      <option value="Activities">Activities</option>
                      <option value="Landmark">Landmark</option>
                      <option value="Family">Family Fun</option>
                      <option value="Other">Other Snap</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                      Captured By (Optional)
                    </label>
                    <select
                      value={addedBy}
                      onChange={(e) => setAddedBy(e.target.value)}
                      className="bg-surface-bright border border-outline-variant/30 text-on-surface text-xs rounded-lg focus:ring-2 focus:ring-primary block w-full p-2 cursor-pointer outline-none font-semibold"
                    >
                      <option value="">Choose partner...</option>
                      {members.map(mb => (
                        <option key={mb.id} value={mb.name}>{mb.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Photo Description */}
                <div>
                  <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                    Describe Memory Details (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide a delightful story about this photo block..."
                    className="bg-surface-bright border border-outline-variant/30 text-on-surface text-xs rounded-lg focus:ring-2 focus:ring-primary block w-full p-2.5 outline-none font-medium resize-none"
                  />
                </div>

                {/* Modal actions */}
                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddOpen(false)}
                    className="flex-1 text-on-surface bg-surface-container-high hover:bg-surface-variant font-semibold rounded-lg text-xs px-4 py-2.5 text-center transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 text-on-primary bg-primary hover:bg-primary-container font-semibold rounded-lg text-xs px-4 py-2.5 text-center transition-all cursor-pointer shadow-xs"
                  >
                    Save Memory
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Lightbox Photo Preview dialog */}
      <AnimatePresence>
        {selectedPhoto && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.div
              layoutId={selectedPhoto.id}
              className="relative max-w-3xl w-full bg-surface-container-high rounded-3xl overflow-hidden border border-outline-variant/10 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 bg-black/60 text-white hover:bg-black/90 p-2 rounded-full z-10 transition-colors"
                title="Close Lightbox"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="aspect-video w-full bg-black flex items-center justify-center">
                <img
                  src={selectedPhoto.imageUrl}
                  alt={selectedPhoto.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80';
                  }}
                />
              </div>

              <div className="p-5 text-left">
                <div className="flex flex-wrap justify-between items-center gap-2 mb-2">
                  <h3 className="text-base font-extrabold text-on-surface">{selectedPhoto.title}</h3>
                  <div className="flex gap-2 items-center">
                    {selectedPhoto.tag && (
                      <span className="text-[9px] font-bold tracking-widest text-primary bg-primary/10 rounded-full px-2.5 py-0.5 uppercase">
                        {selectedPhoto.tag}
                      </span>
                    )}
                    {selectedPhoto.addedBy && (
                      <span className="text-[9px] font-semibold text-on-surface-variant bg-surface-container px-2 px-1 rounded-full">
                        👤 By {selectedPhoto.addedBy}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {selectedPhoto.description || 'No extra memory description added.'}
                </p>

                <div className="flex gap-4 mt-4 pt-3 border-t border-outline-variant/10 text-[10px] text-on-surface-variant font-medium">
                  <span className="flex items-center gap-1 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    <span>Captured: {new Date(selectedPhoto.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  </span>

                  <span className="flex items-center gap-1 font-sans">
                    <MapPin className="w-3.5 h-3.5 text-secondary" />
                    <span>Location: {selectedPhoto.location}</span>
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
