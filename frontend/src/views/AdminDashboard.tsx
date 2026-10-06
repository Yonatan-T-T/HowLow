import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldAlert, 
  Plus, 
  BarChart3, 
  Trophy, 
  AlertTriangle, 
  RefreshCw, 
  X, 
  Ban
} from 'lucide-react';
import type { AuctionItem, AuctionAnalytics, ResolveAuctionResult } from '../types/auction';
import { api } from '../services/api';
import { LiveCountdown } from '../components/LiveCountdown';

export const AdminDashboard: React.FC = () => {
  const [auctions, setAuctions] = useState<AuctionItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedAnalytics, setSelectedAnalytics] = useState<AuctionAnalytics | null>(null);
  const [resolvingId, setResolvingId] = useState<number | null>(null);
  const [resolutionResult, setResolutionResult] = useState<ResolveAuctionResult | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fetchAuctions = async () => {
    try {
      setIsLoading(true);
      const data = await api.getAuctions();
      setAuctions(data);
    } catch (err) {
      console.error('Failed to load admin auctions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAuctions();
  }, []);

  // Trigger Lowest Unique Bid Resolution
  const handleResolve = async (auctionId: number) => {
    try {
      setResolvingId(auctionId);
      const res = await api.resolveAuction(auctionId);
      setResolutionResult(res);
      await fetchAuctions();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to resolve auction.');
    } finally {
      setResolvingId(null);
    }
  };

  // Open Analytics Modal
  const handleOpenAnalytics = async (auctionId: number) => {
    try {
      const analytics = await api.getAuctionAnalytics(auctionId);
      setSelectedAnalytics(analytics);
    } catch (err) {
      alert('Failed to load analytics.');
    }
  };

  // Cancel Auction
  const handleCancel = async (auctionId: number) => {
    if (!confirm(`Are you sure you want to cancel auction #${auctionId}?`)) return;
    try {
      await api.cancelAuction(auctionId);
      setStatusMessage(`Auction #${auctionId} was cancelled.`);
      await fetchAuctions();
    } catch (err) {
      alert('Failed to cancel auction.');
    }
  };

  const totalFeesCollected = auctions.reduce((acc, a) => acc + (a.registrationFee * a.totalRegistrations), 0);
  const activeCount = auctions.filter((a) => a.status === 'Active').length;
  const closedCount = auctions.filter((a) => a.status === 'Closed').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold mb-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Administrator Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Auction Management & Analytics</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Monitor live bidding, trigger lowest unique bid settlement, and inspect secret bid distributions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAuctions}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>

          <Link
            to="/admin/create"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm transition-all shadow-lg shadow-emerald-900/40"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Auction</span>
          </Link>
        </div>
      </div>

      {/* Admin KPI Stats */}
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs uppercase font-semibold text-slate-400 block">Total Auctions</span>
          <span className="text-2xl font-black font-mono text-white mt-1 block">{auctions.length}</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs uppercase font-semibold text-slate-400 block">Active Auctions</span>
          <span className="text-2xl font-black font-mono text-emerald-400 mt-1 block">{activeCount}</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs uppercase font-semibold text-slate-400 block">Settled / Closed</span>
          <span className="text-2xl font-black font-mono text-amber-400 mt-1 block">{closedCount}</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs uppercase font-semibold text-slate-400 block">Est. Revenue Collected</span>
          <span className="text-2xl font-black font-mono text-indigo-400 mt-1 block">
            ${totalFeesCollected.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Status Alert */}
      {statusMessage && (
        <div className="mt-6 p-4 rounded-2xl bg-slate-900 border border-slate-700 text-xs text-slate-300 flex items-center justify-between">
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Auctions Table */}
      <div className="mt-8 rounded-3xl bg-slate-900/60 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-4 px-6">Item</th>
                <th className="py-4 px-4">Fee / Value</th>
                <th className="py-4 px-4">Status & Timer</th>
                <th className="py-4 px-4">Registrations & Bids</th>
                <th className="py-4 px-4">Winner Details</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {auctions.map((a) => {
                const isResolving = resolvingId === a.id;
                return (
                  <tr key={a.id} className="hover:bg-slate-800/30 transition-colors">
                    {/* Item Image & Title */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={a.imageUrl}
                          alt={a.title}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-800 bg-slate-950 shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80';
                          }}
                        />
                        <div>
                          <Link
                            to={`/auction/${a.id}`}
                            className="font-bold text-white hover:text-emerald-400 transition-colors line-clamp-1"
                          >
                            {a.title}
                          </Link>
                          <span className="text-[10px] text-slate-400">ID #{a.id}</span>
                        </div>
                      </div>
                    </td>

                    {/* Fee & Retail */}
                    <td className="py-4 px-4 font-mono">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Fee: ${a.registrationFee.toFixed(2)}</span>
                        <span className="font-bold text-slate-200">Retail: ${a.retailValue.toLocaleString()}</span>
                      </div>
                    </td>

                    {/* Status & Timer */}
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <div>
                          {a.status === 'Active' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                              Active
                            </span>
                          )}
                          {a.status === 'Closed' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300">
                              Closed
                            </span>
                          )}
                          {a.status === 'NoWinner' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400">
                              No Winner
                            </span>
                          )}
                          {a.status === 'Cancelled' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400">
                              Cancelled
                            </span>
                          )}
                        </div>
                        <LiveCountdown endTime={a.endTime} variant="compact" />
                      </div>
                    </td>

                    {/* Registrations & Bids */}
                    <td className="py-4 px-4">
                      <div className="text-xs">
                        <span className="text-slate-200 font-semibold block">
                          {a.totalRegistrations} users registered
                        </span>
                        <span className="text-slate-400 text-[11px] block">
                          {a.totalBids} blind bids
                        </span>
                      </div>
                    </td>

                    {/* Winner Details */}
                    <td className="py-4 px-4">
                      {a.winnerUsername ? (
                        <div>
                          <span className="font-bold text-amber-400 block">{a.winnerUsername}</span>
                          <span className="font-mono text-[11px] text-emerald-400">
                            ${a.winningBidAmount?.toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-500 text-[11px]">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Analytics Trigger */}
                        <button
                          onClick={() => handleOpenAnalytics(a.id)}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          title="Inspect Secret Bid Breakdown & Distribution"
                        >
                          <BarChart3 className="w-4 h-4 text-indigo-400" />
                        </button>

                        {/* Resolve Winner Button */}
                        {a.status === 'Active' && (
                          <button
                            onClick={() => handleResolve(a.id)}
                            disabled={isResolving}
                            className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold text-xs transition-colors flex items-center gap-1 shadow-md shadow-amber-900/30"
                            title="Determine Lowest Unique Bid Winner Immediately"
                          >
                            <Trophy className="w-3.5 h-3.5" />
                            <span>{isResolving ? 'Resolving...' : 'Resolve Winner'}</span>
                          </button>
                        )}

                        {/* Cancel Button */}
                        {a.status === 'Active' && (
                          <button
                            onClick={() => handleCancel(a.id)}
                            className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950 hover:text-rose-400 text-slate-400 transition-colors"
                            title="Cancel Auction"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* RESOLUTION RESULT MODAL */}
      {resolutionResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8">
            <button
              onClick={() => setResolutionResult(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/60"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mx-auto mb-3">
                <Trophy className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-white">Lowest Unique Bid Resolution</h3>
              <p className="text-xs text-slate-400 mt-1">{resolutionResult.title}</p>
            </div>

            {resolutionResult.lowestUniqueBidFound ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-center">
                  <span className="text-[11px] uppercase font-bold text-emerald-400 tracking-wider block">
                    Winner Declared!
                  </span>
                  <h4 className="text-2xl font-black text-white mt-1">
                    {resolutionResult.winnerUsername}
                  </h4>
                  <div className="mt-2 text-sm font-mono text-emerald-300">
                    Winning Bid: <span className="font-bold text-white text-lg">${resolutionResult.winningBidAmount?.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-emerald-400 mt-1">
                    Saved {resolutionResult.savingsPercent}% off retail price!
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Total Bids</span>
                    <span className="font-bold text-white">{resolutionResult.totalBids}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Unique Bids</span>
                    <span className="font-bold text-emerald-400">{resolutionResult.uniqueBidsCount}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Duplicates</span>
                    <span className="font-bold text-rose-400">{resolutionResult.duplicateBidsCount}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-white">No Lowest Unique Bid Found</h4>
                <p className="text-xs text-slate-400 mt-1">{resolutionResult.message}</p>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setResolutionResult(null)}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors"
              >
                Close & Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ANALYTICS & SECRET BID BREAKDOWN MODAL */}
      {selectedAnalytics && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8">
            <button
              onClick={() => setSelectedAnalytics(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/60"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Secret Bid Distribution Analytics</h3>
                <p className="text-xs text-slate-400">{selectedAnalytics.title} (Auction #{selectedAnalytics.auctionId})</p>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Bids Placed</span>
                <span className="text-lg font-mono font-bold text-white">{selectedAnalytics.totalBids}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-emerald-400 uppercase font-semibold block">Unique Bids</span>
                <span className="text-lg font-mono font-bold text-emerald-400">{selectedAnalytics.uniqueBidsCount}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-rose-400 uppercase font-semibold block">Duplicated Bids</span>
                <span className="text-lg font-mono font-bold text-rose-400">{selectedAnalytics.duplicateBidsCount}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-amber-400 uppercase font-semibold block">Current Winner</span>
                <span className="text-sm font-bold text-amber-400 truncate block">
                  {selectedAnalytics.winnerUsername || 'Pending Settlement'}
                </span>
              </div>
            </div>

            {/* Bid Groups Table */}
            <div>
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
                Bid Amount Groups & Collision Analysis
              </h4>

              {selectedAnalytics.bidDistribution.length > 0 ? (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {selectedAnalytics.bidDistribution.map((group) => (
                    <div
                      key={group.amount}
                      className={`p-3 rounded-xl border flex items-center justify-between text-xs font-mono transition-all ${
                        group.isWinning
                          ? 'bg-amber-500/20 border-amber-500/50 text-amber-200 shadow-md shadow-amber-950/50'
                          : group.isUnique
                          ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                          : 'bg-rose-950/20 border-rose-800/40 text-rose-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-base font-bold text-white">
                          ${group.amount.toFixed(2)}
                        </span>
                        <span className="text-slate-400 text-[11px]">
                          ({group.count} {group.count === 1 ? 'bid' : 'bids'} placed)
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {group.isWinning ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/30 text-amber-300 border border-amber-500/40">
                            <Trophy className="w-3.5 h-3.5" /> Lowest Unique Winner!
                          </span>
                        ) : group.isUnique ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300">
                            Unique Bid
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/20 text-rose-300">
                            Duplicated ({group.count}x Tied)
                          </span>
                        )}

                        <span className="text-[10px] text-slate-400 font-sans hidden sm:inline">
                          By: {group.bidderUsernames.join(', ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-slate-500">
                  No bids have been placed on this auction yet.
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedAnalytics(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs"
              >
                Close Analytics
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
