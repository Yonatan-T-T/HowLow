import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Check,
  RefreshCw,
  ArrowRight,
  Wallet,
  ShoppingBag,
  Info,
  Lock,
  Calculator,
  Target,
} from "lucide-react";
import { useUser } from "../context/UserContext";
import { useLanguage } from "../context/LanguageContext";
import { api } from "../services/api";
import type { AuctionItem, UserPostItemPayload } from "../types/auction";

interface SamplePreset {
  title: string;
  category: string;
  retailValue: number;
  registrationFee: number;
  imageUrl: string;
  description: string;
  authenticityDeclaration: string;
}

const PRESET_ITEMS: SamplePreset[] = [
  {
    title: "Apple iPhone 15 Pro Max 256GB - Natural Titanium",
    category: "Electronics",
    retailValue: 185000,
    registrationFee: 35,
    imageUrl:
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1200&q=80",
    description:
      "100% Brand new, factory-sealed in official Apple packaging. Includes 1-year Apple international warranty, original USB-C braided cable, and purchase invoice from authorized dealer.",
    authenticityDeclaration:
      "Factory sealed box with intact pull-tabs. IMEI and serial verified on Apple CheckCoverage with valid purchase date.",
  },
  {
    title: "Sony PlayStation 5 Slim Console (1TB SSD Digital Edition)",
    category: "Gaming",
    retailValue: 84000,
    registrationFee: 25,
    imageUrl:
      "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=1200&q=80",
    description:
      "Brand new PlayStation 5 Slim digital console. Unopened retail box with DualSense wireless controller, HDMI cable, power cord, and Astro's Playroom pre-installed.",
    authenticityDeclaration:
      "Original tamper-evident seal intact. Purchased from official Sony retail store with tax receipt included.",
  },
  {
    title: "Sony WH-1000XM5 Wireless Noise Canceling Headphones - Silver",
    category: "Audio",
    retailValue: 42000,
    registrationFee: 20,
    imageUrl:
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1200&q=80",
    description:
      "Brand new Sony flagship noise cancelling headphones in sealed manufacturer box. Features dual processor noise cancelling, 30-hour battery life, and high-res audio.",
    authenticityDeclaration:
      "Never opened, retail sticker sealed, authentic serial number printed on box with authorized distributor warranty card.",
  },
  {
    title: 'Apple MacBook Pro 14" (M3 Pro, 18GB RAM, 512GB SSD) - Space Black',
    category: "Computers",
    retailValue: 275000,
    registrationFee: 50,
    imageUrl:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80",
    description:
      "Factory sealed brand new MacBook Pro with Apple M3 Pro chip. Never opened, pristine condition in shrink wrap with official Apple 1-year warranty.",
    authenticityDeclaration:
      "Retail shrink-wrapped unit, verified serial number, bought directly from Apple Store with receipt.",
  },
];

export const UserPostItem: React.FC = () => {
  const { currentUser, refreshUser, openTopUp } = useUser();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"create" | "my_items">("create");

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [retailValue, setRetailValue] = useState<number>(35000);
  const [registrationFee, setRegistrationFee] = useState<number>(20);
  const [durationHours, setDurationHours] = useState<number>(24);
  const [authenticityDeclaration, setAuthenticityDeclaration] = useState("");

  // Mandatory Agreements
  const [agreeBrandNew, setAgreeBrandNew] = useState(false);
  const [agreeFeeNonRefundable, setAgreeFeeNonRefundable] = useState(false);
  const [agreeFraudLoss, setAgreeFraudLoss] = useState(false);
  const [agreeProfitSplit, setAgreeProfitSplit] = useState(false);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // My Posted Items State
  const [myItems, setMyItems] = useState<AuctionItem[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);

  // Profit Simulator & Financial Logic
  const LISTING_FEE = 1000; // 1,000 ETB upfront submission fee
  const SELLER_SHARE_RATIO = 0.6; // 60% of gross revenue pool
  const SYSTEM_SHARE_RATIO = 0.4; // 40% of gross revenue pool

  const numRetailValue = Math.max(0, Number(retailValue) || 0);
  const numRegFee = Math.max(1, Number(registrationFee) || 1);
  const totalSellerCost = numRetailValue + LISTING_FEE;

  // Breakeven Entrants: Number of bidders required so Seller 60% payout covers item retail value + 1,000 ETB fee
  // Formula: 0.60 * (breakevenEntrants * numRegFee) >= totalSellerCost
  const breakevenEntrants = Math.max(
    1,
    Math.ceil(totalSellerCost / (SELLER_SHARE_RATIO * numRegFee)),
  );

  const [entrantScenario, setEntrantScenario] = useState<
    "breakeven" | "target" | "high" | "custom"
  >("target");
  const [customEntrants, setCustomEntrants] = useState<number>(0);

  // Active simulated entrant count
  const simulatedEntrants =
    entrantScenario === "breakeven"
      ? breakevenEntrants
      : entrantScenario === "target"
        ? Math.ceil(breakevenEntrants * 1.25)
        : entrantScenario === "high"
          ? Math.ceil(breakevenEntrants * 1.5)
          : Math.max(1, customEntrants || breakevenEntrants);

  const estimatedGrossRevenue = Math.round(numRegFee * simulatedEntrants);
  const estimatedSellerShare = Math.round(
    estimatedGrossRevenue * SELLER_SHARE_RATIO,
  );
  const estimatedSystemShare = Math.round(
    estimatedGrossRevenue * SYSTEM_SHARE_RATIO,
  );

  // Real Net Profit = Seller Payout - Total Cost (Retail Value + 1,000 ETB Listing Fee)
  const estimatedNetProfit = estimatedSellerShare - totalSellerCost;
  const estimatedProfitMargin =
    totalSellerCost > 0
      ? Math.round((estimatedNetProfit / totalSellerCost) * 100)
      : 0;

  const fetchMyItems = async () => {
    if (!currentUser) return;
    try {
      setIsLoadingItems(true);
      const items = await api.getMyPostedItems(currentUser.id);
      setMyItems(items);
    } catch (err) {
      console.error("Failed to load user posted items:", err);
    } finally {
      setIsLoadingItems(false);
    }
  };

  useEffect(() => {
    if (activeTab === "my_items") {
      fetchMyItems();
    }
  }, [activeTab, currentUser]);

  const applyPreset = (preset: SamplePreset) => {
    setTitle(preset.title);
    setDescription(preset.description);
    setImageUrl(preset.imageUrl);
    setRetailValue(preset.retailValue);
    setRegistrationFee(preset.registrationFee);
    setAuthenticityDeclaration(preset.authenticityDeclaration);
  };

  const handlePostItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!currentUser) {
      setStatusMessage({
        type: "error",
        text: "You must be logged in to post an item.",
      });
      return;
    }

    if (currentUser.role === "Admin") {
      setStatusMessage({
        type: "error",
        text: "Admins should create auctions through the Admin Portal.",
      });
      return;
    }

    if (currentUser.balance < 1000) {
      setStatusMessage({
        type: "error",
        text: `Insufficient wallet balance. You need at least 1,000 ETB for the non-refundable listing fee. Your balance is ${currentUser.balance.toFixed(2)} ETB.`,
      });
      return;
    }

    if (
      !agreeBrandNew ||
      !agreeFeeNonRefundable ||
      !agreeFraudLoss ||
      !agreeProfitSplit
    ) {
      setStatusMessage({
        type: "error",
        text: "Please review and accept all 4 terms and conditions before listing your item.",
      });
      return;
    }

    if (
      !authenticityDeclaration.trim() ||
      authenticityDeclaration.length < 15
    ) {
      setStatusMessage({
        type: "error",
        text: "Please provide a clear authenticity and condition declaration (minimum 15 characters).",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const computedEndTime = new Date(
        Date.now() + durationHours * 3600 * 1000,
      ).toISOString();

      const payload: UserPostItemPayload = {
        title: title.trim(),
        description: description.trim(),
        imageUrl: imageUrl.trim(),
        retailValue: Number(retailValue),
        registrationFee: Number(registrationFee),
        endTime: computedEndTime,
        conditionIsBrandNew: true,
        authenticityDeclaration: authenticityDeclaration.trim(),
        userId: currentUser.id,
      };

      await api.userPostItem(payload);

      await refreshUser();
      setStatusMessage({
        type: "success",
        text: `Success! Item "${title}" submitted. 1,000 ETB listing fee deducted. It is now awaiting admin verification before going live.`,
      });

      // Reset form
      setTitle("");
      setDescription("");
      setImageUrl("");
      setAuthenticityDeclaration("");
      setAgreeBrandNew(false);
      setAgreeFeeNonRefundable(false);
      setAgreeFraudLoss(false);
      setAgreeProfitSplit(false);

      // Switch to my items tab after delay
      setTimeout(() => {
        setActiveTab("my_items");
      }, 1500);
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Failed to submit item. Please check your inputs.";
      setStatusMessage({ type: "error", text: errorMsg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasSufficientBalance = currentUser
    ? currentUser.balance >= 1000
    : false;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500/10 via-slate-50 to-teal-500/10 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950 border border-emerald-500/20 dark:border-slate-800 p-6 sm:p-10 shadow-xl dark:shadow-2xl mb-8">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t("postItem.hubTitle")} &bull; 60%</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {t("postItem.hubTitle")}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
            {t("postItem.hubSubtitle")}
          </p>

          {/* Quick Rules Banner */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-slate-950/60 border border-emerald-500/20 dark:border-slate-800 backdrop-blur-sm shadow-sm">
              <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block tracking-wider">
                {t("postItem.rule1Tag")}
              </span>
              <span className="text-xs font-bold text-slate-900 dark:text-white block mt-0.5">
                {t("postItem.rule1Title")}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                {t("postItem.rule1Desc")}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-slate-950/60 border border-cyan-500/20 dark:border-slate-800 backdrop-blur-sm shadow-sm">
              <span className="text-[10px] uppercase font-bold text-cyan-600 dark:text-cyan-400 block tracking-wider">
                {t("postItem.rule2Tag")}
              </span>
              <span className="text-xs font-bold text-slate-900 dark:text-white block mt-0.5">
                {t("postItem.rule2Title")}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                {t("postItem.rule2Desc")}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-slate-950/60 border border-amber-500/20 dark:border-slate-800 backdrop-blur-sm shadow-sm">
              <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 block tracking-wider">
                {t("postItem.rule3Tag")}
              </span>
              <span className="text-xs font-bold text-slate-900 dark:text-white block mt-0.5">
                {t("postItem.rule3Title")}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                {t("postItem.rule3Desc")}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-slate-950/60 border border-purple-500/20 dark:border-slate-800 backdrop-blur-sm shadow-sm">
              <span className="text-[10px] uppercase font-bold text-purple-600 dark:text-purple-400 block tracking-wider">
                {t("postItem.rule4Tag")}
              </span>
              <span className="text-xs font-bold text-slate-900 dark:text-white block mt-0.5">
                {t("postItem.rule4Title")}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                {t("postItem.rule4Desc")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4 mb-8">
        <button
          onClick={() => setActiveTab("create")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === "create"
              ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/30 dark:shadow-emerald-950/50"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800"
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>{t("postItem.tabCreate")}</span>
        </button>

        <button
          onClick={() => setActiveTab("my_items")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === "my_items"
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800"
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>{t("postItem.tabMyItems")} ({myItems.length})</span>
        </button>
      </div>

      {/* TAB 1: POST NEW ITEM */}
      {activeTab === "create" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Feedback */}
            {statusMessage && (
              <div
                className={`p-4 rounded-2xl border text-xs sm:text-sm flex items-start gap-3 ${
                  statusMessage.type === "success"
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300"
                    : "bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-300"
                }`}
              >
                {statusMessage.type === "success" ? (
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                )}
                <div className="flex-1 leading-relaxed font-semibold">
                  {statusMessage.text}
                </div>
              </div>
            )}

            {/* Wallet Balance Check Box */}
            <div
              className={`p-4 sm:p-5 rounded-3xl border transition-all ${
                hasSufficientBalance
                  ? "bg-emerald-500/5 dark:bg-emerald-950/20 border-emerald-500/30"
                  : "bg-amber-500/5 dark:bg-amber-950/20 border-amber-500/30"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white shrink-0 ${
                      hasSufficientBalance ? "bg-emerald-600" : "bg-amber-500"
                    }`}
                  >
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                      Seller Wallet Balance
                    </span>
                    <span className="text-lg font-black font-mono text-slate-900 dark:text-white">
                      {currentUser
                        ? `${currentUser.balance.toFixed(2)} ETB`
                        : "Not Logged In"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-xl border ${
                      hasSufficientBalance
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                    }`}
                  >
                    {hasSufficientBalance
                      ? "1,000 ETB Available"
                      : "1,000 ETB Required"}
                  </span>

                  {!hasSufficientBalance && (
                    <button
                      type="button"
                      onClick={openTopUp}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Top Up Balance</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Presets for Easy Testing */}
            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2.5">
                ⚡ Quick Fill With Verified Product Presets:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PRESET_ITEMS.map((item) => (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => applyPreset(item)}
                    className="p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 text-left transition-all group"
                  >
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 block truncate">
                      {item.category}
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate group-hover:text-emerald-500 transition-colors">
                      {item.title}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 block mt-0.5">
                      {item.retailValue.toLocaleString()} ETB
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Submission Form */}
            <form
              onSubmit={handlePostItem}
              className="space-y-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm"
            >
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Item Title &amp; Exact Model Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sony WH-1000XM5 Wireless Headphones - Silver (Factory Sealed)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Retail Value & Entry Fee */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                    Estimated Retail Market Value (ETB) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min={500}
                      step={50}
                      value={retailValue}
                      onChange={(e) => setRetailValue(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm font-mono font-bold focus:outline-none focus:border-emerald-500"
                    />
                    <span className="absolute right-3.5 top-3.5 text-xs text-slate-400 font-mono">
                      ETB
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Must reflect authentic market retail price.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                    Bidder Registration / Entry Fee (ETB) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min={5}
                      max={500}
                      step={5}
                      value={registrationFee}
                      onChange={(e) =>
                        setRegistrationFee(Number(e.target.value))
                      }
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm font-mono font-bold focus:outline-none focus:border-emerald-500"
                    />
                    <span className="absolute right-3.5 top-3.5 text-xs text-slate-400 font-mono">
                      ETB
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Entry fee paid by bidders to join this auction.
                  </span>
                </div>
              </div>

              {/* Image URL & Preview */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  High-Resolution Item Image URL *
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    required
                    placeholder="https://images.unsplash.com/..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:border-emerald-500 font-mono text-xs"
                  />
                </div>
                {imageUrl && (
                  <div className="mt-3 flex items-center gap-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-800 bg-white"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80";
                      }}
                    />
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-bold text-slate-900 dark:text-white block">
                        Image Preview
                      </span>
                      <span>
                        Verified image preview. Admin will inspect this against
                        the item.
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Auction Duration */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Target Auction Duration (Hours)
                </label>
                <select
                  value={durationHours}
                  onChange={(e) => setDurationHours(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500"
                >
                  <option value={12}>12 Hours (Fast Auction)</option>
                  <option value={24}>24 Hours (Standard 1 Day)</option>
                  <option value={48}>48 Hours (2 Days)</option>
                  <option value={72}>72 Hours (3 Days)</option>
                  <option value={168}>7 Days (1 Week Mega Auction)</option>
                </select>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Timer starts upon admin approval and catalog publication.
                </span>
              </div>

              {/* Detailed Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Comprehensive Item Description &amp; Specifications *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Detail condition, color, storage capacity, bundled accessories, packaging condition, and warranty status..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:border-emerald-500 leading-relaxed"
                />
              </div>

              {/* Condition & Authenticity Declaration */}
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/20 space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                    Mandatory Authenticity &amp; Brand New Declaration *
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Provide verifiable proof of authenticity (e.g. factory sealed
                  pull tabs, retail store receipt, manufacturer warranty code,
                  intact serial tags).
                </p>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Factory sealed box, intact tamper tape, serial verified with manufacturer, official purchase invoice available upon request."
                  value={authenticityDeclaration}
                  onChange={(e) => setAuthenticityDeclaration(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-amber-500/30 text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Mandatory Policy Acceptance Checkboxes */}
              <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  Legal Acknowledgements &amp; Rules Compliance:
                </span>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={agreeBrandNew}
                    onChange={(e) => setAgreeBrandNew(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-700"
                  />
                  <span className="text-xs text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                    <strong>Condition Rule:</strong> I confirm this item is{" "}
                    <strong>100% brand new, authentic, and unopened</strong>,
                    matching this exact specification.
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={agreeFeeNonRefundable}
                    onChange={(e) => setAgreeFeeNonRefundable(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-700"
                  />
                  <span className="text-xs text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                    <strong>Listing Fee:</strong> I understand that{" "}
                    <strong>1,000 ETB will be deducted immediately</strong> as a
                    non-refundable item posting fee.
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={agreeFraudLoss}
                    onChange={(e) => setAgreeFraudLoss(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-700"
                  />
                  <span className="text-xs text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                    <strong>Zero-Tolerance Discrepancy Policy:</strong> Any
                    non-similarity, opened seal, counterfeit, or misleading
                    description will result in{" "}
                    <strong>
                      immediate auction cancellation and total loss/forfeiture
                      of the 1,000 ETB fee
                    </strong>
                    .
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={agreeProfitSplit}
                    onChange={(e) => setAgreeProfitSplit(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-700"
                  />
                  <span className="text-xs text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                    <strong>Profit Split Agreement:</strong> I agree to the
                    platform revenue classification:{" "}
                    <strong>60% paid to me as the seller</strong> and{" "}
                    <strong>40% retained by the system</strong> upon auction
                    resolution.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    !hasSufficientBalance ||
                    !agreeBrandNew ||
                    !agreeFeeNonRefundable ||
                    !agreeFraudLoss ||
                    !agreeProfitSplit
                  }
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm tracking-wide shadow-xl shadow-emerald-900/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Submitting &amp; Deducting 1,000 ETB...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Submit Item &bull; Pay 1,000 ETB Listing Fee</span>
                    </>
                  )}
                </button>
                <p className="text-center text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                  Admin will review condition &amp; specs within 2 hours before
                  publishing to the live catalog.
                </p>
              </div>
            </form>
          </div>

          {/* Sidebar: Profit Split Simulator & System Rules (1 col) */}
          <div className="space-y-6">
            {/* Real-time Profit Split Simulator */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <Calculator className="w-5 h-5" />
                <h3 className="text-sm font-bold uppercase tracking-wider">
                  {t("postItem.calcTitle")}
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {t("postItem.calcSubtitle")}
              </p>

              {/* Baseline Cost Breakdown */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">
                    {t("postItem.calcRetailCost")}
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {numRetailValue.toLocaleString()} ETB
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">
                    {t("postItem.calcListingFee")}
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {LISTING_FEE.toLocaleString()} ETB
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    {t("postItem.calcTotalCost")}
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {totalSellerCost.toLocaleString()} ETB
                  </span>
                </div>
              </div>

              {/* Simulation Scenarios */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{t("postItem.calcSimulatedBidders")}</span>
                  </span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    ~{simulatedEntrants.toLocaleString()}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setEntrantScenario("breakeven");
                    }}
                    className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all ${
                      entrantScenario === "breakeven"
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-sm"
                        : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    {t("postItem.btnBreakeven")}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEntrantScenario("target");
                    }}
                    className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all ${
                      entrantScenario === "target"
                        ? "bg-emerald-600 text-white border-transparent shadow-sm"
                        : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    {t("postItem.btnTarget")}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEntrantScenario("high");
                    }}
                    className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all ${
                      entrantScenario === "high"
                        ? "bg-purple-600 text-white border-transparent shadow-sm"
                        : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    {t("postItem.btnHigh")}
                  </button>
                </div>

                {/* Draggable Slider */}
                <div className="pt-2">
                  <input
                    type="range"
                    min={Math.max(10, Math.floor(breakevenEntrants * 0.5))}
                    max={Math.max(100, Math.ceil(breakevenEntrants * 2.5))}
                    step={Math.max(5, Math.floor(breakevenEntrants / 50))}
                    value={simulatedEntrants}
                    onChange={(e) => {
                      setEntrantScenario("custom");
                      setCustomEntrants(Number(e.target.value));
                    }}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-1">
                    <span>
                      Min:{" "}
                      {Math.max(
                        10,
                        Math.floor(breakevenEntrants * 0.5),
                      ).toLocaleString()}
                    </span>
                    <span>Breakeven: {breakevenEntrants.toLocaleString()}</span>
                    <span>
                      Max:{" "}
                      {Math.max(
                        100,
                        Math.ceil(breakevenEntrants * 2.5),
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Pool & Split Breakdown */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-500 dark:text-slate-400">
                    {t("postItem.calcEntryFee")}
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {numRegFee} ETB
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-500 dark:text-slate-400">
                    {t("postItem.calcGrossPool")}
                  </span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {estimatedGrossRevenue.toLocaleString()} ETB
                  </span>
                </div>
              </div>

              {/* The 60/40 Split Boxes */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
                    {t("postItem.calcSellerPayout")}
                  </span>
                  <span className="text-base font-black font-mono text-emerald-600 dark:text-emerald-400 block mt-1">
                    {estimatedSellerShare.toLocaleString()} ETB
                  </span>
                  <span className="text-[9px] text-emerald-700/90 dark:text-emerald-300/80 font-medium">
                    Wallet Credit
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400 block">
                    {t("postItem.calcSystemShare")}
                  </span>
                  <span className="text-base font-black font-mono text-purple-700 dark:text-purple-300 block mt-1">
                    {estimatedSystemShare.toLocaleString()} ETB
                  </span>
                  <span className="text-[9px] text-purple-700/90 dark:text-purple-300/80 font-medium">
                    Platform Revenue
                  </span>
                </div>
              </div>

              {/* True Net Profit Display */}
              <div
                className={`p-4 rounded-2xl border transition-all ${
                  estimatedNetProfit >= 0
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200"
                    : "bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    {estimatedNetProfit >= 0
                      ? t("postItem.calcNetProfit")
                      : t("postItem.calcShortfall")}
                  </span>
                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                      estimatedNetProfit >= 0
                        ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                        : "bg-amber-500/20 text-amber-700 dark:text-amber-300"
                    }`}
                  >
                    {estimatedNetProfit >= 0
                      ? `+${estimatedProfitMargin}%`
                      : `${estimatedProfitMargin}%`}
                  </span>
                </div>

                <div className="flex items-baseline gap-2 mt-1">
                  <span
                    className={`text-xl font-black font-mono ${
                      estimatedNetProfit >= 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    {estimatedNetProfit >= 0 ? "+" : ""}
                    {estimatedNetProfit.toLocaleString()} ETB
                  </span>
                </div>

                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 leading-tight">
                  {estimatedNetProfit >= 0
                    ? t("postItem.calcNetProfitNote")
                    : t("postItem.calcShortfallNote")}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 flex items-start gap-2">
                <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Formula:</strong> 60% Payout (
                  {estimatedSellerShare.toLocaleString()} ETB) − Item Cost (
                  {numRetailValue.toLocaleString()} ETB) − Listing Fee (1,000
                  ETB) = {estimatedNetProfit >= 0 ? "+" : ""}
                  {estimatedNetProfit.toLocaleString()} ETB.
                </span>
              </div>
            </div>

            {/* Why HowLow Seller Protection */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-500" />
                <span>Fairness &amp; Anti-Shill Rules</span>
              </h4>
              <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2">
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>Anti-Shill Guarantee:</strong> Sellers cannot bid on
                    their own auctions, preserving authentic blind bidding.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>Admin Verification:</strong> Admins inspect your
                    item details before going live to ensure premium catalog
                    quality.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>Guaranteed Payouts:</strong> When resolved, 60% of
                    collected revenue is immediately credited to your balance.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MY LISTED ITEMS */}
      {activeTab === "my_items" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Your Listed Auctions
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Track status, admin review feedback, live bidding metrics, and
                60% profit payouts.
              </p>
            </div>
            <button
              onClick={fetchMyItems}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-emerald-500 transition-colors"
              title="Refresh Items"
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoadingItems ? "animate-spin text-emerald-500" : ""}`}
              />
            </button>
          </div>

          {isLoadingItems ? (
            <div className="py-16 text-center text-slate-500">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-500 mb-2" />
              <span>Loading your items...</span>
            </div>
          ) : myItems.length === 0 ? (
            <div className="py-16 text-center rounded-3xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-8">
              <ShoppingBag className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                You haven't listed any items yet
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                Post your brand new items for a 1,000 ETB fee and earn 60% of
                all auction revenue!
              </p>
              <button
                onClick={() => setActiveTab("create")}
                className="mt-4 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-md inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Post Your First Item</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {myItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80";
                        }}
                      />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          {/* Status Badge */}
                          {item.status === "PendingApproval" && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 animate-pulse">
                              ⏳ Awaiting Admin Review
                            </span>
                          )}
                          {item.status === "Active" && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                              🟢 Live &amp; Bidding Active
                            </span>
                          )}
                          {item.status === "Closed" && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/30">
                              🏁 Auction Resolved
                            </span>
                          )}
                          {item.status === "Rejected" && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30">
                              ❌ Rejected
                            </span>
                          )}
                          {item.status === "Cancelled" && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-500/15 text-red-700 dark:text-red-400 border border-red-500/30">
                              🚫 Cancelled (Fraud/Condition)
                            </span>
                          )}

                          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                            Listing Fee Paid: 1,000 ETB
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                          {item.title}
                        </h3>

                        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">
                          <span>
                            Retail: {item.retailValue.toLocaleString()} ETB
                          </span>
                          <span>&bull;</span>
                          <span>Entry Fee: {item.registrationFee} ETB</span>
                          <span>&bull;</span>
                          <span>Registered: {item.totalRegistrations}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Action / Payout info */}
                    <div className="flex flex-col sm:items-end justify-between gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-800">
                      {/* If Closed: Show 60% Payout */}
                      {item.status === "Closed" && (
                        <div className="text-left sm:text-right bg-emerald-500/10 border border-emerald-500/30 p-2.5 rounded-2xl">
                          <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 block">
                            Your 60% Seller Payout
                          </span>
                          <span className="text-base font-black font-mono text-emerald-600 dark:text-emerald-400">
                            +
                            {item.sellerPayoutAmount
                              ? item.sellerPayoutAmount.toFixed(2)
                              : "0.00"}{" "}
                            ETB
                          </span>
                          <span className="text-[9px] text-slate-500 dark:text-slate-400 block font-mono">
                            Platform Cut (40%):{" "}
                            {item.systemProfitAmount
                              ? item.systemProfitAmount.toFixed(2)
                              : "0.00"}{" "}
                            ETB
                          </span>
                        </div>
                      )}

                      {/* If Pending Approval: Show notice */}
                      {item.status === "PendingApproval" && (
                        <div className="text-left sm:text-right text-xs text-amber-700 dark:text-amber-400">
                          <span className="font-semibold">
                            Under administrator review
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                            Submitted on{" "}
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}

                      {/* If Active: Link to live auction */}
                      {item.status === "Active" && (
                        <Link
                          to={`/auction/${item.id}`}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-all shadow-md"
                        >
                          <span>View Live Auction</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      )}

                      {/* If Rejected: Show Rejection Reason */}
                      {item.status === "Rejected" && (
                        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-700 dark:text-rose-300 max-w-md">
                          <strong>Admin Feedback:</strong>{" "}
                          {item.rejectionReason ||
                            "Did not meet listing standards."}
                          <span className="block text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                            {item.feeForfeited
                              ? "Listing fee forfeited."
                              : "Listing fee refunded."}
                          </span>
                        </div>
                      )}

                      {/* If Cancelled: Show cancellation details */}
                      {item.status === "Cancelled" && (
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-700 dark:text-red-300 max-w-md">
                          <strong>Reason:</strong>{" "}
                          {item.rejectionReason ||
                            "Condition / Authenticity policy violation."}
                          <span className="block text-[10px] text-red-600 dark:text-red-400 mt-0.5 font-bold">
                            1,000 ETB Listing Fee Forfeited.
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
