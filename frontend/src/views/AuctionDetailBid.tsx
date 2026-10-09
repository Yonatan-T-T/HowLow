import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { 
  ArrowLeft, 
  Trophy, 
  Tag, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2, 
  Wallet, 
  Sparkles, 
  Coins, 
  RefreshCw,
  ShieldAlert
} from 'lucide-react';
import type { AuctionItem, Bid } from '../types/auction';
import { api } from '../services/api';
import { useUser } from '../context/UserContext';
import { LiveCountdown } from '../components/LiveCountdown';

export const AuctionDetailBid: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const auctionId = parseInt(id || '0', 10);
  const { currentUser, refreshUser, openTopUp } = useUser();
  const isAdmin = currentUser?.role === 'Admin';

  const [auction, setAuction] = useState<AuctionItem | null>(null);
  const [myBids, setMyBids] = useState<Bid[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [bidAmount, setBidAmount] = useState<string>('');
  const [isSubmittingBid, setIsSubmittingBid] = useState<boolean>(false);
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchAuctionDetails = useCallback(async () => {
    if (!auctionId) return;
    try {
      setIsLoading(true);
      const data = await api.getAuctionById(auctionId);
      setAuction(data);

      if (currentUser) {
        const bids = await api.getMyBids(auctionId, currentUser.id);
        setMyBids(bids);
      }
    } catch (err: any) {
      console.error('Failed to load auction details:', err);
      setNotification({
        type: 'error',
        message: err.response?.data?.message || 'Failed to load auction details.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [auctionId, currentUser]);

  useEffect(() => {
    fetchAuctionDetails();
  }, [fetchAuctionDetails]);

  // Trigger celebration confetti if closed with a winner
  useEffect(() => {
    if (auction?.status === 'Closed' && auction.winnerUsername) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    }
  }, [auction?.status, auction?.winnerUsername]);

  // Handle Registration
  const handleRegister = async () => {
    if (!currentUser || !auction) return;

    if (currentUser.role === 'Admin') {
      setNotification({
        type: 'error',
        message: 'Admins cannot register or place bids on auctions.',
      });
      return;
    }

    if (currentUser.balance < auction.registrationFee) {
      setNotification({
        type: 'error',
        message: `Insufficient balance! Registration requires $${auction.registrationFee.toFixed(2)}, but your wallet has $${currentUser.balance.toFixed(2)}. Please top up your wallet.`,
      });
      return;
    }

    try {
      setIsRegistering(true);
      setNotification(null);
      const res = await api.registerForAuction(auction.id, currentUser.id);
      if (res.success) {
        setNotification({
          type: 'success',
          message: res.message || 'Successfully registered! You can now place secret bids.',
        });
        await refreshUser();
        await fetchAuctionDetails();
      }
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.response?.data?.message || 'Registration failed.',
      });
    } finally {
      setIsRegistering(false);
    }
  };

  // Handle Bid Placement
  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !auction) return;

    if (currentUser.role === 'Admin') {
      setNotification({
        type: 'error',
        message: 'Admins cannot register or place bids on auctions.',
      });
      return;
    }

    const amountNum = parseFloat(bidAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setNotification({
        type: 'error',
        message: 'Please enter a valid bid amount greater than $0.00.',
      });
      return;
    }

    try {
      setIsSubmittingBid(true);
      setNotification(null);
      const res = await api.placeBid(auction.id, amountNum, currentUser.id);
      if (res.success) {
        setNotification({
          type: 'success',
          message: `Secret blind bid of $${amountNum.toFixed(2)} successfully placed!`,
        });
        setBidAmount('');
        await fetchAuctionDetails();
      }
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.response?.data?.message || 'Failed to place bid.',
      });
    } finally {
      setIsSubmittingBid(false);
    }
  };

  if (isLoading && !auction) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto mb-4" />
        <p className="text-slate-400 text-sm">Loading auction details...</p>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold text-white">Auction Not Found</h2>
        <p className="text-slate-400 text-sm mt-2">The auction you are looking for does not exist or was removed.</p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-xs"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Live Auctions
        </Link>
      </div>
    );
  }

  const isCancelled = auction.status === 'Cancelled';
  const isActive = auction.status === 'Active';
  const isUserWinner = auction.winnerUserId === currentUser?.id;

  const savingsAmount = auction.winningBidAmount
    ? Math.max(0, auction.retailValue - auction.winningBidAmount)
    : 0;
  const savingsPercent = auction.winningBidAmount && auction.retailValue > 0
    ? Math.round((savingsAmount / auction.retailValue) * 100)
    : 0;

  // Quick bid amount suggestion chips
  const quickBidSuggestions = [0.05, 0.12, 0.23, 0.47, 0.88, 1.25];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Back Link */}
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </Link>
      </div>

      {/* Main Grid: Left Specs & Image, Right Bidding Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        
        {/* Left Column (5 cols): Media & Product Information */}
        <div className="lg:col-span-5 space-y-6">
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-xl">
            <img
              src={auction.imageUrl}
              alt={auction.title}
              className="w-full h-full object-cover object-center"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

            {/* Badges on Image */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-900/80 text-emerald-400 border border-emerald-500/30 backdrop-blur-md">
                Retail ${auction.retailValue.toLocaleString()}
              </span>

              {auction.isUserRegistered && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-600 text-white flex items-center gap-1 shadow-lg shadow-emerald-950/50">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Registered
                </span>
              )}
            </div>
          </div>

          {/* Title & Description Box */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
            <h1 className="text-xl sm:text-2xl font-black text-white leading-snug">
              {auction.title}
            </h1>
            <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
              {auction.description}
            </p>

            {/* Quick Metrics */}
            <div className="mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-2xl bg-slate-950/50 border border-slate-800/60">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Entry Fee</span>
                <span className="font-mono font-bold text-white text-sm">
                  ${auction.registrationFee.toFixed(2)}
                </span>
              </div>

              <div className="p-2.5 rounded-2xl bg-slate-950/50 border border-slate-800/60">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Bidders</span>
                <span className="font-mono font-bold text-white text-sm">
                  {auction.totalRegistrations}
                </span>
              </div>

              <div className="p-2.5 rounded-2xl bg-slate-950/50 border border-slate-800/60">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Total Bids</span>
                <span className="font-mono font-bold text-white text-sm">
                  {auction.totalBids}
                </span>
              </div>
            </div>

            {/* Fair Play Transparency Note */}
            <div className="mt-5 p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-800/40 flex items-start gap-2.5 text-xs text-indigo-200">
              <EyeOff className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <span>
                <strong>Blind Bidding Privacy:</strong> All bids are encrypted and blind until auction resolution. No competitor can see your bids.
              </span>
            </div>
          </div>
        </div>

        {/* Right Column (7 cols): Timer, Registration & Bidding Console */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Notification Alert */}
          {notification && (
            <div
              className={`p-4 rounded-2xl border text-xs sm:text-sm flex items-center justify-between gap-3 animate-fade-in ${
                notification.type === 'success'
                  ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-300'
                  : 'bg-rose-950/50 border-rose-500/50 text-rose-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {notification.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                )}
                <span>{notification.message}</span>
              </div>
              <button
                onClick={() => setNotification(null)}
                className="text-xs opacity-70 hover:opacity-100 font-semibold"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Countdown & Auction State Card */}
          <div className="p-6 sm:p-7 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
              <div>
                <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider block">
                  Auction Status
                </span>
                <div className="flex items-center gap-2 mt-1">
                  {isActive && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      Live & Accepting Bids
                    </span>
                  )}
                  {auction.status === 'Closed' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      <Trophy className="w-3.5 h-3.5" />
                      Auction Settled
                    </span>
                  )}
                  {auction.status === 'NoWinner' && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-400 border border-slate-700">
                      No Winner (All Bids Tied)
                    </span>
                  )}
                  {isCancelled && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      Auction Cancelled
                    </span>
                  )}
                </div>
              </div>

              {/* Digital Countdown Timer */}
              <div>
                <LiveCountdown endTime={auction.endTime} variant="digital" />
              </div>
            </div>

            {/* WINNER ANNOUNCEMENT BANNER (If Closed) */}
            {auction.status === 'Closed' && auction.winnerUsername && (
              <div className="mt-6 p-6 rounded-2xl bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent border border-amber-500/30 text-white relative overflow-hidden animate-slide-up">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/30 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                      <Trophy className="w-7 h-7" />
                    </div>
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-amber-400 font-bold block">
                        Official Winner Declared
                      </span>
                      <h3 className="text-xl font-black text-white">
                        {auction.winnerUsername} {isUserWinner ? '(You!)' : ''}
                      </h3>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Won with the Lowest Unique Bid of{' '}
                        <strong className="text-emerald-400 font-mono text-sm">
                          ${auction.winningBidAmount?.toFixed(2)}
                        </strong>
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-semibold text-amber-300/80 block">
                      Total Savings
                    </span>
                    <span className="text-2xl font-black text-emerald-400 font-mono">
                      {savingsPercent}% OFF
                    </span>
                    <span className="text-[11px] text-slate-400 block font-mono">
                      Saved ${savingsAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-amber-500/20 flex items-center justify-between text-xs">
                  <span className="text-slate-300">
                    Transparent LINQ resolution completed. All duplicate bids were eliminated.
                  </span>
                  <Link
                    to="/admin"
                    className="text-amber-400 hover:text-amber-300 font-semibold underline"
                  >
                    View Bid Distribution
                  </Link>
                </div>
              </div>
            )}

            {/* TIED / NO WINNER BANNER */}
            {auction.status === 'NoWinner' && (
              <div className="mt-6 p-5 rounded-2xl bg-slate-800/60 border border-slate-700 text-xs text-slate-300 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <strong className="text-white block font-semibold">No Lowest Unique Bid Found</strong>
                  <span>Every bid placed on this auction was duplicated by two or more bidders. The auction concluded with no winner.</span>
                </div>
              </div>
            )}

            {/* REGISTRATION & BIDDING INTERFACES (If Active) */}
            {isActive && (
              <div className="mt-6">
                {!currentUser ? (
                  /* Guest / Unauthenticated Mode: Prompt to Sign In */
                  <div className="p-6 sm:p-8 rounded-2xl bg-slate-950/70 border border-slate-800 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/10">
                      <Coins className="w-6 h-6" />
                    </div>
                    <h4 className="text-base font-bold text-white mb-1">
                      Log In to Participate in this Auction
                    </h4>
                    <p className="text-xs text-slate-400 mb-5 max-w-md mx-auto">
                      Sign in or create a free bidder account ($100 starting bonus included) to register and place secret lowest-unique bids.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                      <Link
                        to="/login"
                        className="w-full sm:w-auto py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-md shadow-emerald-900/30"
                      >
                        Sign In to Bid
                      </Link>
                      <Link
                        to="/signup"
                        className="w-full sm:w-auto py-2.5 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-colors"
                      >
                        Create Account &amp; Get $100
                      </Link>
                    </div>
                  </div>
                ) : isAdmin ? (
                  /* Admin Viewing Mode: Bidding Prohibited */
                  <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200">
                    <div className="flex items-start sm:items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                        <ShieldAlert className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">Admin Viewing Mode</h4>
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Bidding Restricted
                          </span>
                        </div>
                        <p className="text-xs text-amber-300/80 mt-1">
                          Administrators are prohibited from participating or placing bids in auctions to guarantee protocol fairness and prevent conflict of interest.
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <span className="text-slate-400">
                        To test bidding, switch to a standard bidder persona (e.g. Bob or Charlie) via the top-right persona switcher.
                      </span>
                      <Link
                        to="/admin"
                        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold border border-amber-500/30 transition-colors shrink-0"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>Manage in Admin Portal</span>
                      </Link>
                    </div>
                  </div>
                ) : !auction.isUserRegistered ? (
                  /* STEP 1: Registration Required */
                  <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <Coins className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">Unlock Bidding Access</h4>
                        <p className="text-xs text-slate-400">
                          Pay the nominal registration fee to participate in blind bidding
                        </p>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800/80 mb-5 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-slate-400 uppercase font-semibold block">Entry Fee</span>
                        <span className="text-lg font-mono font-bold text-white">
                          ${auction.registrationFee.toFixed(2)}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[11px] text-slate-400 uppercase font-semibold block">Your Wallet Balance</span>
                        <span className="text-lg font-mono font-bold text-emerald-400">
                          ${currentUser?.balance.toFixed(2) || '0.00'}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={handleRegister}
                        disabled={isRegistering}
                        className="flex-1 py-3 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2"
                      >
                        {isRegistering ? (
                          <span>Processing registration...</span>
                        ) : (
                          <>
                            <Coins className="w-4 h-4" />
                            <span>Pay ${auction.registrationFee.toFixed(2)} & Register</span>
                          </>
                        )}
                      </button>

                      {currentUser && currentUser.balance < auction.registrationFee && (
                        <button
                          onClick={openTopUp}
                          className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Wallet className="w-4 h-4 text-emerald-400" />
                          <span>Top Up Wallet</span>
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  /* STEP 2: Registered - Blind Bid Placement Console */
                  <div className="p-6 rounded-2xl bg-slate-950/60 border border-emerald-500/30 shadow-lg shadow-emerald-950/20">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                        <h4 className="text-sm font-bold text-white">Submit Secret / Blind Bid</h4>
                      </div>
                      <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                        Bidding Access Unlocked
                      </span>
                    </div>

                    <form onSubmit={handlePlaceBid}>
                      <div className="mb-4">
                        <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                          Bid Amount (USD $)
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold text-base">
                            $
                          </span>
                          <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            placeholder="0.05"
                            value={bidAmount}
                            onChange={(e) => setBidAmount(e.target.value)}
                            required
                            className="w-full pl-9 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white font-mono text-base font-bold transition-all"
                          />
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Strategy tip: Choose an amount you think no one else will guess, but as low as possible!
                        </p>
                      </div>

                      {/* Quick Suggestion Chips */}
                      <div className="mb-5">
                        <span className="text-[11px] text-slate-400 block mb-2 font-medium">Quick suggestions:</span>
                        <div className="flex flex-wrap gap-2">
                          {quickBidSuggestions.map((amt) => (
                            <button
                              key={amt}
                              type="button"
                              onClick={() => setBidAmount(amt.toFixed(2))}
                              className="px-3 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white font-mono text-xs transition-colors"
                            >
                              ${amt.toFixed(2)}
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmittingBid || !bidAmount}
                        className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2"
                      >
                        {isSubmittingBid ? (
                          <span>Encrypting & placing bid...</span>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            <span>Place Secret Bid (${parseFloat(bidAmount || '0').toFixed(2)})</span>
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User's Placed Bids in this Auction */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Tag className="w-4 h-4 text-emerald-400" />
                <span>My Bids in This Auction ({myBids.length})</span>
              </h4>
              <span className="text-xs text-slate-400">
                Persona: <strong className="text-white">{currentUser?.username}</strong>
              </span>
            </div>

            {myBids.length > 0 ? (
              <div className="space-y-2">
                {myBids.map((b) => (
                  <div
                    key={b.id}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-mono font-bold text-slate-300">
                        #
                      </div>
                      <div>
                        <span className="font-mono font-bold text-white text-sm">
                          ${b.amount.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          Placed {new Date(b.placedAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>

                    <div>
                      {auction.status === 'Closed' || auction.status === 'NoWinner' ? (
                        b.isWinner ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            <Trophy className="w-3 h-3" /> Winning Bid!
                          </span>
                        ) : b.isUniqueAfterResolution ? (
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/20 text-emerald-300">
                            Unique
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-rose-500/20 text-rose-300">
                            Duplicate (Cancelled)
                          </span>
                        )
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-400">
                          <EyeOff className="w-3 h-3" /> Blind / Secret
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-500">
                {auction.isUserRegistered
                  ? 'No bids placed yet. Submit your first blind bid above!'
                  : 'Register for this auction to start placing blind bids.'}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
