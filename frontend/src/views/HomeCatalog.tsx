import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sparkles, 
  Search, 
  Filter, 
  RefreshCw, 
  Trophy, 
  ShieldCheck, 
  Clock, 
  Flame,
  ArrowUpDown
} from 'lucide-react';
import type { AuctionItem } from '../types/auction';
import { api } from '../services/api';
import { useUser } from '../context/UserContext';
import { AuctionCard } from '../components/AuctionCard';

export const HomeCatalog: React.FC = () => {
  const { currentUser } = useUser();
  const [auctions, setAuctions] = useState<AuctionItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'All' | 'Active' | 'EndingSoon' | 'Closed' | 'Registered'>('Active');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'ending' | 'fee-asc' | 'retail-desc'>('ending');

  const fetchAuctions = async () => {
    try {
      setIsLoading(true);
      const data = await api.getAuctions();
      setAuctions(data);
    } catch (err) {
      console.error('Failed to load auctions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAuctions();
  }, [currentUser]);

  // Filter & Sort Logic
  const filteredAuctions = useMemo(() => {
    return auctions.filter((item) => {
      // Search
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      // Tab
      const now = new Date().getTime();
      const end = new Date(item.endTime).getTime();
      const isEndingSoon = item.status === 'Active' && end - now > 0 && end - now < 3600 * 1000 * 2; // within 2 hours

      if (activeTab === 'Active') return item.status === 'Active';
      if (activeTab === 'EndingSoon') return isEndingSoon;
      if (activeTab === 'Closed') return item.status === 'Closed' || item.status === 'NoWinner';
      if (activeTab === 'Registered') return item.isUserRegistered;

      return true; // 'All'
    }).sort((a, b) => {
      if (sortBy === 'ending') {
        return new Date(a.endTime).getTime() - new Date(b.endTime).getTime();
      }
      if (sortBy === 'fee-asc') {
        return a.registrationFee - b.registrationFee;
      }
      if (sortBy === 'retail-desc') {
        return b.retailValue - a.retailValue;
      }
      return 0;
    });
  }, [auctions, activeTab, searchQuery, sortBy]);

  // Overall platform stats
  const stats = useMemo(() => {
    const totalPrizePool = auctions.reduce((acc, a) => acc + a.retailValue, 0);
    const activeCount = auctions.filter((a) => a.status === 'Active').length;
    const closedCount = auctions.filter((a) => a.status === 'Closed').length;
    const lowestWin = auctions
      .filter((a) => a.winningBidAmount && a.winningBidAmount > 0)
      .map((a) => a.winningBidAmount as number)
      .sort((a, b) => a - b)[0] || 0.23;

    return { totalPrizePool, activeCount, closedCount, lowestWin };
  }, [auctions]);

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Banner */}
      <section className="relative overflow-hidden pt-8 pb-12 sm:pt-14 sm:pb-16 border-b border-slate-800/80">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-6 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Lowest Unique Bid Auction Protocol</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
              Bid Lowest. Stay Unique.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                Win Luxury.
              </span>
            </h1>

            <p className="mt-4 sm:mt-5 text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Welcome to <strong className="text-white font-semibold">Unique Low</strong>. Submit secret blind bids on high-end gadgets and watches. When the auction closes, duplicates are eliminated — and the single lowest unique bid wins!
            </p>

            {/* Quick Highlights / Stats */}
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
                <span className="text-[11px] font-semibold uppercase text-slate-400 block tracking-wider">
                  Live Auctions
                </span>
                <span className="text-2xl font-black font-mono text-emerald-400">
                  {stats.activeCount} Active
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
                <span className="text-[11px] font-semibold uppercase text-slate-400 block tracking-wider">
                  Lowest Win To Date
                </span>
                <span className="text-2xl font-black font-mono text-amber-400">
                  ${stats.lowestWin.toFixed(2)}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
                <span className="text-[11px] font-semibold uppercase text-slate-400 block tracking-wider">
                  Prizes Catalog
                </span>
                <span className="text-2xl font-black font-mono text-indigo-400">
                  ${stats.totalPrizePool.toLocaleString()}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
                <span className="text-[11px] font-semibold uppercase text-slate-400 block tracking-wider">
                  Fairness
                </span>
                <span className="text-2xl font-black text-cyan-400 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-5 h-5" /> 100% Blind
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalog Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        
        {/* Controls Bar: Tabs, Search, Sort */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
          
          {/* Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
            {[
              { id: 'Active', label: 'Active Auctions', icon: Flame },
              { id: 'EndingSoon', label: 'Ending Soon', icon: Clock },
              { id: 'Registered', label: 'My Registered', icon: ShieldCheck },
              { id: 'Closed', label: 'Closed / Winners', icon: Trophy },
              { id: 'All', label: 'All Items', icon: Filter },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/20'
                      : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search, Sort & Refresh */}
          <div className="flex items-center gap-2.5">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search auctions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 focus:border-emerald-500 text-xs text-white placeholder-slate-500 transition-colors"
              />
            </div>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="pl-3 pr-8 py-2 rounded-xl bg-slate-900 border border-slate-800 focus:border-emerald-500 text-xs text-slate-300 appearance-none transition-colors cursor-pointer"
              >
                <option value="ending">Ending Soonest</option>
                <option value="fee-asc">Entry Fee: Low to High</option>
                <option value="retail-desc">Retail Value: High to Low</option>
              </select>
              <ArrowUpDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <button
              onClick={fetchAuctions}
              title="Refresh listings"
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Catalog Grid */}
        <div className="mt-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="rounded-2xl bg-slate-900/60 border border-slate-800 p-4 h-96 animate-pulse flex flex-col justify-between">
                  <div className="aspect-[16/10] bg-slate-800/60 rounded-xl" />
                  <div className="space-y-3 mt-4">
                    <div className="h-5 bg-slate-800/80 rounded w-3/4" />
                    <div className="h-3 bg-slate-800/50 rounded w-full" />
                    <div className="h-3 bg-slate-800/50 rounded w-2/3" />
                  </div>
                  <div className="h-10 bg-slate-800/60 rounded-xl mt-4" />
                </div>
              ))}
            </div>
          ) : filteredAuctions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
              {filteredAuctions.map((auction) => (
                <AuctionCard key={auction.id} auction={auction} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center rounded-3xl bg-slate-900/40 border border-slate-800/80">
              <div className="w-14 h-14 rounded-2xl bg-slate-800/60 flex items-center justify-center mx-auto text-slate-500 mb-4">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">No auctions found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                {activeTab === 'Registered'
                  ? "You haven't registered for any auctions yet with this persona. Click any active auction to register!"
                  : "We couldn't find any auctions matching your search or filter criteria."}
              </p>
              <button
                onClick={() => {
                  setActiveTab('All');
                  setSearchQuery('');
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
