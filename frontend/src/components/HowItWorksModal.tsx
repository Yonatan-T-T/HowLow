import React from "react";
import {
  X,
  HelpCircle,
  CheckCircle,
  XCircle,
  Trophy,
  Sparkles,
  AlertCircle,
} from "lucide-react";

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 dark:bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/60 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              How "Lowest Unique Bid" Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              A thrilling strategy game where the lowest solo bid wins!
            </p>
          </div>
        </div>

        {/* 3 Step Process */}
        <div className="grid gap-4 sm:grid-cols-3 mb-8">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800/80">
            <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 text-xs font-bold flex items-center justify-center mb-2">
              1
            </span>
            <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
              Register with Entry Fee
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Pay a small nominal entry fee to unlock bidding access for that
              auction.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800/80">
            <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400 text-xs font-bold flex items-center justify-center mb-2">
              2
            </span>
            <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
              Place Single Secret Bid
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Submit your secret bid (e.g. $0.05, $0.12). Each bidder can only bid once per auction, completely blind.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800/80">
            <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400 text-xs font-bold flex items-center justify-center mb-2">
              3
            </span>
            <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
              Resolution & Win
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              All duplicate bids are discarded. The single lowest remaining bid
              wins the luxury prize!
            </p>
          </div>
        </div>

        {/* Visual Example Simulation */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 mb-6">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Live Example Scenario ($1,199 iPhone Auction)
          </h4>

          <div className="space-y-2.5 font-mono text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 text-rose-800 dark:text-rose-300">
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                <span>$0.05 — Bid by Bob & Charlie</span>
              </div>
              <span className="font-bold text-[11px] bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300 px-2 py-0.5 rounded">
                CANCELLED (Duplicate)
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-500/50 text-emerald-900 dark:text-emerald-300 shadow-sm dark:shadow-lg dark:shadow-emerald-950/40">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="font-bold text-slate-900 dark:text-white">
                  $0.12 — Bid by Diana
                </span>
              </div>
              <span className="font-bold text-[11px] bg-emerald-600 text-white dark:bg-emerald-500/30 dark:text-emerald-200 px-2 py-0.5 rounded">
                WINNER (Lowest Unique!)
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-slate-400 shrink-0" />
                <span>$0.45 — Bid by Evan</span>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 px-2 py-0.5">
                Unique, but higher than $0.12
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-slate-400 shrink-0" />
                <span>$1.20 — Bid by Bob</span>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 px-2 py-0.5">
                Unique, but higher than $0.12
              </span>
            </div>
          </div>

          <p className="mt-4 text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 p-3 rounded-xl">
            🎉{" "}
            <strong className="text-emerald-700 dark:text-emerald-400">
              Result:
            </strong>{" "}
            Diana wins the brand new iPhone 16 Pro Max ($1,199 value) and pays
            only{" "}
            <strong className="text-slate-900 dark:text-white">$0.12</strong>!
          </p>
        </div>

        {/* Edge Case Note */}
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-xs text-amber-900 dark:text-amber-200/90">
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <span>
            <strong className="text-amber-900 dark:text-amber-200">
              Edge Case Guarantee:
            </strong>{" "}
            If every single placed bid is tied with another (no unique bid
            exists), the auction is safely marked as "No Winner / Tied",
            ensuring complete algorithmic fairness.
          </span>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-colors shadow-lg shadow-emerald-900/30"
          >
            Got it, Let's Play!
          </button>
        </div>
      </div>
    </div>
  );
};
