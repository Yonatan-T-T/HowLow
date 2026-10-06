import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Trophy, 
  Tag, 
  Users, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight
} from 'lucide-react';
import type { AuctionItem } from '../types/auction';
import { LiveCountdown } from './LiveCountdown';

interface AuctionCardProps {
  auction: AuctionItem;
}

export const AuctionCard: React.FC<AuctionCardProps> = ({ auction }) => {
  const isEnded = auction.status === 'Closed' || auction.status === 'NoWinner';
  const isCancelled = auction.status === 'Cancelled';
  const isWinnerDeclared = auction.status === 'Closed' && !!auction.winnerUsername;

  // Calculate potential savings if closed or estimated
  const savingsPercent = auction.winningBidAmount && auction.retailValue > 0
    ? Math.round(((auction.retailValue - auction.winningBidAmount) / auction.retailValue) * 100)
    : null;

  return (
    <div className="group relative rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-950/20 flex flex-col overflow-hidden backdrop-blur-sm">
      {/* Top Banner & Status Badges */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-950">
        <img
          src={auction.imageUrl}
          alt={auction.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          onError={(e) => {
            // High quality fallback image
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80';
          }}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
          {/* Status Badge */}
          {auction.status === 'Active' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Live Auction
            </span>
          )}

          {isWinnerDeclared && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 backdrop-blur-md">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              Winner Declared
            </span>
          )}

          {auction.status === 'NoWinner' && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-700/60 text-slate-300 border border-slate-600/50 backdrop-blur-md">
              No Winner (Tied)
            </span>
          )}

          {isCancelled && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40 backdrop-blur-md">
              Cancelled
            </span>
          )}

          {/* User Registration Status Badge */}
          {auction.isUserRegistered ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-600/30 text-emerald-200 border border-emerald-400/40 backdrop-blur-md">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Registered
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-900/80 text-slate-300 border border-slate-700/60 backdrop-blur-md">
              Fee: ${auction.registrationFee.toFixed(2)}
            </span>
          )}
        </div>

        {/* Bottom Countdown Badge inside image */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-10">
          <LiveCountdown endTime={auction.endTime} variant="compact" />
          <div className="text-right">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-medium">Retail Value</span>
            <span className="text-sm font-bold text-slate-200 font-mono">${auction.retailValue.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold text-white line-clamp-1 group-hover:text-emerald-400 transition-colors">
            {auction.title}
          </h3>
          <p className="mt-1.5 text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {auction.description}
          </p>

          {/* Highlights / Winner Info Box */}
          {isWinnerDeclared ? (
            <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Trophy className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-amber-400/80 tracking-wider block">Winner</span>
                  <span className="text-xs font-bold text-slate-100">{auction.winnerUsername}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block">Winning Bid</span>
                <span className="text-sm font-mono font-extrabold text-emerald-400">
                  ${auction.winningBidAmount?.toFixed(2)}
                </span>
                {savingsPercent && (
                  <span className="text-[10px] font-semibold text-amber-400 block">
                    Saved {savingsPercent}%
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wide block">Bidders</span>
                  <span className="font-semibold text-slate-200">{auction.totalRegistrations} registered</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center gap-2">
                <Tag className="w-4 h-4 text-indigo-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wide block">Blind Bids</span>
                  <span className="font-semibold text-slate-200">{auction.totalBids} placed</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CTA Button */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Blind & Fair</span>
          </div>

          <Link
            to={`/auction/${auction.id}`}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 shadow-md ${
              isEnded
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30 hover:shadow-emerald-700/50'
            }`}
          >
            <span>{isEnded ? 'View Results' : auction.isUserRegistered ? 'Place Blind Bid' : 'Register & Bid'}</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
