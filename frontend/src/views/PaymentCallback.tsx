import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  CheckCircle2,
  XCircle,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { api } from "../services/api";
import { useUser } from "../context/UserContext";

export const PaymentCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { refreshUser, currentUser } = useUser();

  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");
  const [message, setMessage] = useState<string>("Verifying your payment with Chapa...");
  const [amountCredited, setAmountCredited] = useState<number>(0);

  const reference =
    searchParams.get("reference") ||
    searchParams.get("tx_ref") ||
    searchParams.get("trx_ref");

  useEffect(() => {
    if (!reference) {
      setStatus("failed");
      setMessage("No transaction reference was provided in the return URL.");
      return;
    }

    let isMounted = true;

    const verify = async () => {
      try {
        const res = await api.verifyChapaPayment(reference);
        if (!isMounted) return;

        if (res.success) {
          setStatus("success");
          setMessage(res.message || "Payment verified and wallet credited!");
          setAmountCredited(res.amount);
          // Refresh user session so updated balance is reflected globally
          await refreshUser();
        } else {
          setStatus("failed");
          setMessage(res.message || "Payment could not be verified.");
        }
      } catch (err: any) {
        if (!isMounted) return;
        setStatus("failed");
        setMessage(
          err.response?.data?.message ||
            "Unable to connect to payment server for verification."
        );
      }
    };

    verify();

    return () => {
      isMounted = false;
    };
  }, [reference, refreshUser]);

  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center">
        {status === "loading" && (
          <div className="py-8 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto animate-pulse">
              <RefreshCw className="w-8 h-8 animate-spin" />
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              Verifying Payment
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
              Please wait while we confirm your transaction with Chapa payment gateway...
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="py-6 space-y-5 animate-fade-in">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-1">
                Transaction Successful
              </span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                Wallet Credited!
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                {message}
              </p>
            </div>

            {/* Credit details card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 text-left">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Amount Deposited:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                  +${amountCredited.toFixed(2)} ETB
                </span>
              </div>
              {currentUser && (
                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200 dark:border-slate-800/80">
                  <span className="text-slate-500">Current Balance:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    ${currentUser.balance.toFixed(2)} ETB
                  </span>
                </div>
              )}
              {reference && (
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 font-mono">
                  <span>Reference:</span>
                  <span className="truncate max-w-[150px]">{reference}</span>
                </div>
              )}
            </div>

            <div className="pt-2">
              <Link
                to="/"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
              >
                <span>Browse Live Auctions</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {status === "failed" && (
          <div className="py-6 space-y-5 animate-fade-in">
            <div className="w-16 h-16 rounded-3xl bg-rose-500/15 border border-rose-500/30 text-rose-500 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/20">
              <XCircle className="w-10 h-10" />
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 block mb-1">
                Payment Incomplete
              </span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                Verification Failed
              </h2>
              <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">
                {message}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-700 dark:text-amber-300 text-left flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                If money was deducted from your account, please keep your transaction reference and contact support for manual reconciliation.
              </span>
            </div>

            <div className="flex gap-3 pt-2">
              <Link
                to="/"
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-300 dark:hover:bg-slate-700 transition-all"
              >
                Back to Home
              </Link>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Check</span>
              </button>
            </div>
          </div>
        )}

        {/* Security badge footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-center gap-1 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Secured by Chapa Payment Gateway</span>
        </div>
      </div>
    </div>
  );
};
