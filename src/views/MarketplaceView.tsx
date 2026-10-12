import React, { useState, useEffect } from 'react';
import {
  Search,
  Sparkles,
  Star,
  Clock,
  GraduationCap,
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  Layers,
  ArrowUpDown,
  Tag,
  CheckCircle2,
  Code,
  Brain,
  Palette,
  BookOpen,
  FileText,
  Video,
} from 'lucide-react';
import { Gig, Review } from '../types';
import { api } from '../services/api';

interface MarketplaceViewProps {
  onSelectGig: (gig: Gig) => void;
  onPostProjectClick: () => void;
  onSwitchToSeller: () => void;
}

const CATEGORIES = [
  { id: 'all', name: 'All Categories', icon: Layers },
  { id: 'web-dev', name: 'Web & Mobile Dev', icon: Code },
  { id: 'ai-data', name: 'AI & Data Science', icon: Brain },
  { id: 'design', name: 'UI/UX & Graphics', icon: Palette },
  { id: 'tutoring', name: 'Academic Tutoring', icon: BookOpen },
  { id: 'content', name: 'Content & Docs', icon: FileText },
  { id: 'video', name: 'Video & Animation', icon: Video },
];

export const MarketplaceView: React.FC<MarketplaceViewProps> = ({
  onSelectGig,
  onPostProjectClick,
  onSwitchToSeller,
}) => {
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [deliveryDays, setDeliveryDays] = useState<number | ''>('');
  const [sortBy, setSortBy] = useState('recommended');

  const fetchGigs = async () => {
    setLoading(true);
    try {
      const res = await api.getGigs({
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        search: searchQuery || undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        deliveryDays: deliveryDays ? Number(deliveryDays) : undefined,
        sort: sortBy,
      });
      setGigs(res.gigs);
    } catch (err) {
      console.error('Failed to load gigs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGigs();
  }, [selectedCategory, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchGigs();
  };

  const promotedGigs = gigs.filter(g => g.isPromoted);
  const regularGigs = gigs;

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-950 text-white p-6 sm:p-10 lg:p-12 shadow-xl border border-emerald-800/40">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
            <GraduationCap className="w-4 h-4" />
            <span>Campus Micro-Gig & Task Marketplace</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            Hire Top Student Talent From Top Colleges.
          </h1>

          <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed max-w-2xl">
            Discover peer developers, UI designers, and AI builders from IITs, BITS, and NITs.
            Fair milestone escrow, student-friendly rates, and genuine verified reviews.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="pt-2 flex flex-col sm:flex-row gap-2 max-w-2xl">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search 'React MVP', 'FastAPI backend', 'Figma design'..."
                className="w-full pl-10 pr-4 py-3 bg-white text-slate-900 rounded-xl text-sm placeholder:text-slate-400 shadow-md focus:ring-2 focus:ring-emerald-400 focus:outline-hidden"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Search</span>
            </button>
          </form>

          {/* Quick Tag Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-2 text-xs text-emerald-200">
            <span className="font-semibold text-emerald-300">Popular:</span>
            {['React Next.js', 'FastAPI REST', 'Figma Prototype', 'Python ML', 'Club Posters'].map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  setSearchQuery(tag);
                  fetchGigs();
                }}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white cursor-pointer"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Bar */}
      <section className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map(cat => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
              }`}
            >
              <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-emerald-600'}`} />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </section>

      {/* Promoted / Featured Spotlight Carousel (Section 3: Clearly labeled promoted placement) */}
      {promotedGigs.length > 0 && selectedCategory === 'all' && !searchQuery && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-100 rounded-lg text-amber-800">
                <Sparkles className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Featured Student Talent</h2>
                <p className="text-xs text-slate-500">
                  Promoted listings by verified PRO Campus Star students
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
              Promoted Placement
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {promotedGigs.slice(0, 3).map(gig => (
              <div
                key={`promoted-${gig.id}`}
                onClick={() => onSelectGig(gig)}
                className="group relative bg-white rounded-2xl border-2 border-amber-300 shadow-md hover:shadow-xl transition-all overflow-hidden flex flex-col cursor-pointer"
              >
                {/* Promoted Badge Tag */}
                <div className="absolute top-3 left-3 z-10 flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-400 text-slate-950 shadow-xs">
                  <Sparkles className="w-3 h-3 fill-slate-950" />
                  <span>Promoted</span>
                </div>

                <div className="relative aspect-video overflow-hidden bg-slate-100">
                  <img
                    src={gig.coverImage}
                    alt={gig.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    {/* Student Seller Info */}
                    <div className="flex items-center gap-2 mb-2">
                      <img
                        src={gig.sellerAvatar}
                        alt={gig.sellerName}
                        className="w-6 h-6 rounded-full object-cover border border-emerald-500"
                      />
                      <span className="text-xs font-bold text-slate-800">{gig.sellerName}</span>
                      <span className="text-[11px] text-slate-400">•</span>
                      <span className="text-[11px] text-slate-500 truncate max-w-[120px]">
                        {gig.sellerCollege}
                      </span>
                    </div>

                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2">
                      {gig.title}
                    </h3>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 font-bold text-amber-600">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{gig.sellerRating.toFixed(1)}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Starting at</span>
                      <span className="text-sm font-black text-slate-900">₹{gig.price.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Main Gigs Grid & Filter Header */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {selectedCategory === 'all'
                ? 'All Available Services'
                : CATEGORIES.find(c => c.id === selectedCategory)?.name}
            </h2>
            <p className="text-xs text-slate-500">
              Showing {gigs.length} verified student listings
            </p>
          </div>

          {/* Filters & Sort */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 text-xs">
              <span className="text-slate-500">Sort by:</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-semibold focus:outline-hidden"
              >
                <option value="recommended">Fair Balanced Ranking</option>
                <option value="rating">Highest Rating</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-500 mt-3">Loading marketplace listings...</p>
          </div>
        ) : gigs.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8">
            <Layers className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800">No student listings found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Try adjusting your search query, clearing filters, or post a custom task for students to bid on!
            </p>
            <div className="mt-4 flex justify-center gap-3">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  fetchGigs();
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
              >
                Clear Filters
              </button>
              <button
                onClick={onPostProjectClick}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                Post Custom Project
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularGigs.map(gig => (
              <div
                key={gig.id}
                onClick={() => onSelectGig(gig)}
                className="group bg-white rounded-2xl border border-slate-200/80 hover:border-emerald-300 shadow-xs hover:shadow-xl transition-all overflow-hidden flex flex-col cursor-pointer"
              >
                <div className="relative aspect-video overflow-hidden bg-slate-100">
                  {gig.isPromoted && (
                    <div className="absolute top-3 left-3 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-400 text-slate-950 shadow-xs">
                      <Sparkles className="w-2.5 h-2.5 fill-slate-950" />
                      <span>Promoted</span>
                    </div>
                  )}
                  <img
                    src={gig.coverImage}
                    alt={gig.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    {/* Seller details */}
                    <div className="flex items-center gap-2 mb-2">
                      <img
                        src={gig.sellerAvatar}
                        alt={gig.sellerName}
                        className="w-6 h-6 rounded-full object-cover border border-emerald-500"
                      />
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-800 block truncate">
                          {gig.sellerName}
                        </span>
                        <span className="text-[10px] text-slate-400 block truncate">
                          {gig.sellerCollege}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2">
                      {gig.title}
                    </h3>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 font-bold text-amber-600">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{gig.sellerRating.toFixed(1)}</span>
                      </div>
                      <span className="text-slate-300">•</span>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{gig.deliveryDays}d</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Starting at</span>
                      <span className="text-sm font-black text-slate-900">₹{gig.price.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Fair Ranking Explanation Footer Notice (Section 3) */}
      <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-5 text-xs text-slate-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            SkillBridge Fair Ranking & Verification Constitution
          </h4>
          <p className="text-[11px] text-slate-500 max-w-2xl">
            Our search ranking combines client review quality, verified order completion rates,
            recency, and clearly labeled paid promotions. Paid placement boosts discovery slots
            without compromising organic search relevance.
          </p>
        </div>
        <button
          onClick={onSwitchToSeller}
          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs whitespace-nowrap shadow-xs cursor-pointer"
        >
          Become a Student Seller
        </button>
      </div>
    </div>
  );
};
