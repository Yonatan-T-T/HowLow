import React, { useState, useEffect } from "react";
import { 
  X, 
  Copy, 
  Check, 
  Clock, 
  AlertCircle, 
  RefreshCw, 
  History, 
  Send
} from "lucide-react";
import { useUser } from "../context/UserContext";
import { api } from "../services/api";
import type { AgentAccount, TopUpRequest } from "../types/auction";

export const WalletTopUpModal: React.FC = () => {
  const { currentUser, isTopUpOpen, closeTopUp, refreshUser } = useUser();

  // Active view: "form" | "history" | "success"
  const [activeTab, setActiveTab] = useState<"form" | "history">("form");

  // Form states matching user's Telebirr modal reference
  const [amount, setAmount] = useState<string>("50.00");
  const [senderPhone, setSenderPhone] = useState<string>("");
  const [transactionNumber, setTransactionNumber] = useState<string>("");
  const [agentAccount, setAgentAccount] = useState<AgentAccount>({
    receiverPhoneNumber: "0942618861",
    receiverName: "Tekleweyni alemayehu brhane"
  });

  // UI helpers
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successRequest, setSuccessRequest] = useState<TopUpRequest | null>(null);
  const [myRequests, setMyRequests] = useState<TopUpRequest[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState<boolean>(false);

  // 10-minute timer countdown simulation
  const [timeLeft, setTimeLeft] = useState<number>(600); // 10 minutes in seconds

  useEffect(() => {
    if (!isTopUpOpen) return;

    // Reset countdown
    setTimeLeft(600);
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [isTopUpOpen]);

  // Load random agent receiver account and user phone on open
  useEffect(() => {
    if (isTopUpOpen && currentUser) {
      setSenderPhone(currentUser.phoneNumber || "");
      setErrorMsg(null);
      setSuccessRequest(null);

      // Fetch fresh random receiver account
      api.getAgentAccount()
        .then((acc) => setAgentAccount(acc))
        .catch(() => {
          // fallback default
          setAgentAccount({
            receiverPhoneNumber: "0942618861",
            receiverName: "Tekleweyni alemayehu brhane"
          });
        });

      // Load existing requests
      fetchMyRequests();
    }
  }, [isTopUpOpen, currentUser]);

  const fetchMyRequests = async () => {
    try {
      setIsLoadingRequests(true);
      const data = await api.getMyTopUpRequests();
      setMyRequests(data);
    } catch (err) {
      console.warn("Could not load my requests:", err);
    } finally {
      setIsLoadingRequests(false);
    }
  };

  if (!isTopUpOpen || !currentUser || currentUser.role === "Admin") return null;

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const presets = [300, 500, 1000, 3000, 5000];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount < 50 || parsedAmount > 15000) {
      setErrorMsg("Amount must be between 50.00 ETB and 15,000.00 ETB.");
      return;
    }

    if (!transactionNumber.trim() || transactionNumber.trim().length < 6) {
      setErrorMsg("Please enter a valid Telebirr transaction number (at least 6 characters).");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      const created = await api.submitTopUpRequest({
        amount: parsedAmount,
        receiverPhoneNumber: agentAccount.receiverPhoneNumber,
        receiverName: agentAccount.receiverName,
        transactionNumber: transactionNumber.trim(),
        senderPhoneNumber: senderPhone.trim() || currentUser.phoneNumber
      });

      setSuccessRequest(created);
      await fetchMyRequests();
      await refreshUser();
      setTransactionNumber("");
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || "Failed to submit top-up request. Please verify the transaction details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const pendingCount = myRequests.filter((r) => r.status === "Pending").length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-5 sm:p-7 overflow-hidden my-auto">
        {/* Close Button */}
        <button
          onClick={closeTopUp}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/60 dark:hover:bg-slate-800 transition-colors z-10"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Telebirr Authentic Logo Header */}
        <div className="flex flex-col items-center justify-center pt-1 pb-4">
          <div className="flex items-center gap-2.5">
            <svg
              className="w-10 h-10 shrink-0"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M50 8 C50 35 65 50 92 50 C65 50 50 65 50 92 C50 65 35 50 8 50 C35 50 50 35 50 8 Z"
                fill="#008FD5"
              />
              <path
                d="M38 48 C30 48 24 55 24 64 C24 73 31 80 40 80 C48 80 54 74 54 66 C54 59 49 55 43 55 C38 55 35 58 35 62 C35 65 38 67 41 67"
                stroke="#008FD5"
                strokeWidth="6"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
            <div className="leading-none text-left">
              <div className="text-[#008FD5] font-black text-2xl tracking-tight">
                ቴሌብር
              </div>
              <div className="text-[#ECA512] font-black text-2xl tracking-tight -mt-0.5">
                telebirr
              </div>
            </div>
          </div>
        </div>

        {/* Tab switcher: Form / History */}
        <div className="flex items-center justify-between mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">
          <div className="flex gap-2">
            <button
              onClick={() => {
                setActiveTab("form");
                setSuccessRequest(null);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "form" && !successRequest
                  ? "bg-[#008FD5] text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Deposit Funds
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "history"
                  ? "bg-[#008FD5] text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Request Status</span>
              {pendingCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-white font-bold ml-1">
                  {pendingCount}
                </span>
              )}
            </button>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Balance:</span>
            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
              ${currentUser.balance.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Success / Pending Confirmation View */}
        {successRequest ? (
          <div className="space-y-4 animate-fade-in py-2">
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <h4 className="font-bold text-sm">
                    Top-Up Request Submitted &amp; Pending Approval!
                  </h4>
                  <p className="text-xs mt-1 text-slate-600 dark:text-slate-400 leading-relaxed">
                    Your request of{" "}
                    <strong className="text-amber-700 dark:text-amber-300 font-mono">
                      {successRequest.amount.toFixed(2)} ETB
                    </strong>{" "}
                    with Transaction Number{" "}
                    <strong className="font-mono text-slate-900 dark:text-white">
                      {successRequest.transactionNumber}
                    </strong>{" "}
                    has been recorded. An administrator will verify the Telebirr transfer and credit your wallet.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800/80">
                <span className="text-slate-500">Status:</span>
                <span className="font-bold uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  {successRequest.status} (Wait for approval)
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800/80">
                <span className="text-slate-500">Your Telebirr Phone:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {successRequest.senderPhoneNumber}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800/80">
                <span className="text-slate-500">Sent to:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">
                  {successRequest.receiverPhoneNumber} ({successRequest.receiverName})
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Submitted at:</span>
                <span className="font-mono text-slate-600 dark:text-slate-400">
                  {new Date(successRequest.createdAt).toLocaleTimeString()}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("history")}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-white transition-all flex items-center justify-center gap-1.5"
              >
                <History className="w-3.5 h-3.5" />
                <span>Track Status in Requests</span>
              </button>
              <button
                onClick={() => setSuccessRequest(null)}
                className="flex-1 py-2.5 rounded-xl bg-[#008FD5] hover:bg-[#007cb8] text-xs font-bold text-white transition-all"
              >
                New Request
              </button>
            </div>
          </div>
        ) : activeTab === "history" ? (
          /* Request Status History View */
          <div className="space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Your Deposit Requests
              </h4>
              <button
                onClick={fetchMyRequests}
                className="text-xs text-[#008FD5] hover:underline flex items-center gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${isLoadingRequests ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            {myRequests.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
                No deposit requests submitted yet.
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {myRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                        {req.amount.toFixed(2)} ETB
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                          req.status === "Approved"
                            ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                            : req.status === "Rejected"
                            ? "bg-rose-500/20 text-rose-700 dark:text-rose-400 border-rose-500/30"
                            : "bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30 animate-pulse"
                        }`}
                      >
                        {req.status === "Pending" ? "Pending Approval" : req.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      <span>Txn: {req.transactionNumber}</span>
                      <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                    </div>

                    <div className="text-[10px] text-slate-500 truncate">
                      To: {req.receiverPhoneNumber} ({req.receiverName})
                    </div>

                    {req.adminNotes && (
                      <div className="text-[10px] text-rose-600 dark:text-rose-400 bg-rose-500/10 p-1.5 rounded-lg border border-rose-500/20">
                        Admin Note: {req.adminNotes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Main Deposit Form Matching the User's Screenshot */
          <form onSubmit={handleSubmit} className="space-y-3.5 animate-fade-in">
            {/* Green Notification Box matching user's image */}
            <div className="p-3 sm:p-3.5 rounded-2xl bg-[#235827] text-white text-xs sm:text-[13px] leading-snug font-medium shadow-md">
              <div className="flex items-center justify-between mb-1 text-[11px] font-bold text-emerald-200">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Time limit</span>
                </span>
                <span className="font-mono bg-black/30 px-2 py-0.5 rounded">
                  {formatTimer(timeLeft)}
                </span>
              </div>
              Before creating a request, transfer funds within 10 minutes using
              the payment details provided below.
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Payment Details with copy icons matching user's image */}
            <div className="space-y-2 py-1">
              {/* Account Number */}
              <div className="flex items-center justify-between gap-2 text-xs sm:text-sm">
                <div className="flex items-center gap-1.5 text-[#1e3a5f] dark:text-blue-200 font-bold">
                  <span>የቴሌ ብር ሂሳብ ቁጥር</span>
                  <span className="font-mono font-extrabold text-[#008FD5] dark:text-[#38bdf8] text-sm sm:text-base">
                    {agentAccount.receiverPhoneNumber}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(agentAccount.receiverPhoneNumber, "phone")}
                  className="p-1 text-[#5b8a3c] hover:text-[#456b2c] dark:text-emerald-400 transition-colors"
                  title="Copy Phone Number"
                >
                  {copiedField === "phone" ? (
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Receiver Name */}
              <div className="flex items-center justify-between gap-2 text-xs sm:text-sm">
                <div className="flex items-center gap-1.5 text-[#1e3a5f] dark:text-blue-200 font-bold truncate">
                  <span className="shrink-0">የተቀባይ ስም</span>
                  <span className="text-slate-800 dark:text-slate-100 font-medium truncate">
                    {agentAccount.receiverName}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(agentAccount.receiverName, "name")}
                  className="p-1 text-[#5b8a3c] hover:text-[#456b2c] dark:text-emerald-400 transition-colors shrink-0"
                  title="Copy Receiver Name"
                >
                  {copiedField === "name" ? (
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Amount input row matching user's image */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
              <label className="text-xs sm:text-[13px] font-bold text-[#1e3a5f] dark:text-blue-200">
                Amount (Min 50.00 ETB / Max 15 000.00 ETB):
              </label>
              <input
                type="number"
                min="50"
                max="15000"
                step="any"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full sm:w-36 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-mono text-center font-bold text-sm focus:outline-none focus:ring-1 focus:ring-[#008FD5] shadow-inner"
              />
            </div>

            {/* Preset Amount Chips matching user's image */}
            <div>
              <span className="block text-xs font-semibold text-[#1e3a5f] dark:text-blue-200 mb-1.5">
                Please enter or select your deposit amount
              </span>
              <div className="grid grid-cols-5 gap-1.5">
                {presets.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmount(val.toFixed(2))}
                    className={`py-1.5 rounded-md border text-xs font-mono font-semibold transition-all ${
                      parseFloat(amount) === val
                        ? "bg-[#008FD5] border-[#008FD5] text-white shadow-sm"
                        : "border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    {val >= 1000 ? `${(val / 1000).toFixed(0)} 000` : val}
                  </button>
                ))}
              </div>
            </div>

            {/* User's registered phone number row matching user's image */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
              <label className="text-xs sm:text-[13px] font-bold text-[#1e3a5f] dark:text-blue-200">
                የእርስዎ የቴሌ ብር ሂሳብ ቁጥር:
              </label>
              <input
                type="text"
                required
                placeholder="09XXXXXXXX"
                value={senderPhone}
                onChange={(e) => setSenderPhone(e.target.value)}
                className="w-full sm:w-44 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-mono text-center font-bold text-sm focus:outline-none focus:ring-1 focus:ring-[#008FD5]"
              />
            </div>

            {/* Telebirr Transaction Number input */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                  የግብይት ቁጥር / Transaction Number:
                </label>
                <span className="text-[10px] text-[#008FD5] dark:text-blue-300 font-semibold">
                  From Telebirr SMS
                </span>
              </div>
              <input
                type="text"
                required
                placeholder="e.g. CIL45G7X89 or transaction code"
                value={transactionNumber}
                onChange={(e) => setTransactionNumber(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#008FD5]/40 focus:border-[#008FD5] uppercase placeholder:normal-case placeholder-slate-400"
              />
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-1">
                After completing the transfer in your Telebirr app, enter the transaction number here and submit for administrator verification.
              </span>
            </div>

            {/* Submit Request Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-2xl bg-[#008FD5] hover:bg-[#007cb8] active:scale-[0.99] disabled:opacity-50 text-white font-bold text-sm transition-all shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 mt-2"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Submitting request...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>ጥያቄውን ላክ / Submit Top-Up Request</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
