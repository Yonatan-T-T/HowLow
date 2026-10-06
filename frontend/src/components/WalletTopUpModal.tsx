import React, { useState } from "react";
import { X, Wallet, Plus, CheckCircle2 } from "lucide-react";
import { useUser } from "../context/UserContext";
import { api } from "../services/api";

export const WalletTopUpModal: React.FC = () => {
  const { currentUser, isTopUpOpen, closeTopUp, refreshUser } = useUser();
  const [customAmount, setCustomAmount] = useState<string>("50");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isTopUpOpen || !currentUser || currentUser.role === "Admin") return null;

  const handleDeposit = async (amount: number) => {
    if (amount <= 0) {
      setErrorMsg("Please enter a valid amount.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      const res = await api.depositFunds(currentUser.id, amount);
      if (res.success) {
        setSuccessMsg(res.message);
        await refreshUser();
        setTimeout(() => {
          setSuccessMsg(null);
          closeTopUp();
        }, 1200);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || "Failed to deposit funds.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const presets = [10, 25, 50, 100];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 dark:bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7">
        <button
          onClick={closeTopUp}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/60 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Simulated Wallet Deposit
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Current balance:{" "}
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                ${currentUser.balance.toFixed(2)}
              </span>
            </p>
          </div>
        </div>

        {successMsg ? (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300 text-sm flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        ) : (
          <div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
              Add mock funds to{" "}
              <strong className="text-slate-900 dark:text-white">
                {currentUser.username}
              </strong>
              's wallet to pay registration fees and test lowest unique bid
              auction mechanics.
            </p>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 text-xs text-rose-700 dark:text-rose-300">
                {errorMsg}
              </div>
            )}

            <div className="grid grid-cols-4 gap-2 mb-4">
              {presets.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setCustomAmount(val.toString())}
                  className={`py-2 rounded-xl text-xs font-mono font-semibold transition-all border ${
                    customAmount === val.toString()
                      ? "bg-emerald-50 dark:bg-emerald-500/20 border-emerald-400 dark:border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold"
                      : "bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
                  }`}
                >
                  +${val}
                </button>
              ))}
            </div>

            <div className="mb-5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1.5">
                Custom Deposit Amount ($)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 font-mono text-sm">
                  $
                </span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-900 dark:text-white font-mono text-sm transition-all"
                  placeholder="50"
                />
              </div>
            </div>

            <button
              onClick={() => handleDeposit(parseFloat(customAmount) || 0)}
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span>Adding funds...</span>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>
                    Deposit ${parseFloat(customAmount) || 0} to Wallet
                  </span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
