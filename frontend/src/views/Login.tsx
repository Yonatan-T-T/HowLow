import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Sparkles,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { useUser } from "../context/UserContext";
import type { TestProfile } from "../types/auction";

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, quickLoginAs, testProfiles } = useUser();

  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<"ALL" | "Admin" | "User">("ALL");

  // Redirect destination after login if provided in location state
  const from = (location.state as any)?.from?.pathname || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameOrEmail.trim() || !password) {
      setError("Please fill in both username/email and password.");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const res = await login(usernameOrEmail.trim(), password);
      if (res.success) {
        setSuccessMsg(res.message);
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 600);
      } else {
        setError(res.message);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to log in. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (profile: TestProfile) => {
    setUsernameOrEmail(profile.username);
    setPassword(profile.password);
    setError(null);
    try {
      setIsLoading(true);
      const res = await quickLoginAs(profile);
      if (res.success) {
        setSuccessMsg(`Logged in as ${profile.username} (${profile.role})`);
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 500);
      } else {
        setError(res.message);
      }
    } catch (err: any) {
      setError(err?.message || "Quick login failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProfiles = testProfiles.filter((p) => {
    if (selectedRoleFilter === "ALL") return true;
    return p.role === selectedRoleFilter;
  });

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        {/* Left Column: Form Card */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Welcome Back
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Log in to bid or manage lowest-unique auctions
              </p>
            </div>
          </div>

          {/* Feedback banners */}
          {error && (
            <div className="mb-6 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2.5 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2.5 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Username or Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. admin1 or bob@example.com"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-200 flex items-center justify-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800/80 text-center">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Don't have an account yet?{" "}
              <Link
                to="/signup"
                className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Sign Up &amp; get $100.00
              </Link>
            </p>
          </div>
        </div>

        {/* Right Column: Pre-configured Test Profiles Panel */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-slate-100/80 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60 rounded-3xl p-6 sm:p-8 backdrop-blur-md">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
                1-Click Test Credentials
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Instant login for evaluator &amp; testing profiles (2 Admins &amp; 5 Users).
            </p>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-200/80 dark:bg-slate-950 rounded-xl mb-4 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setSelectedRoleFilter("ALL")}
                className={`flex-1 py-1 rounded-lg transition-all ${
                  selectedRoleFilter === "ALL"
                    ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                All (7)
              </button>
              <button
                type="button"
                onClick={() => setSelectedRoleFilter("Admin")}
                className={`flex-1 py-1 rounded-lg transition-all ${
                  selectedRoleFilter === "Admin"
                    ? "bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-sm"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                Admins (2)
              </button>
              <button
                type="button"
                onClick={() => setSelectedRoleFilter("User")}
                className={`flex-1 py-1 rounded-lg transition-all ${
                  selectedRoleFilter === "User"
                    ? "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                Bidders (5)
              </button>
            </div>

            {/* Profile Cards */}
            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {filteredProfiles.map((p) => {
                const isAdmin = p.role === "Admin";
                return (
                  <button
                    key={p.username}
                    type="button"
                    onClick={() => handleQuickLogin(p)}
                    className="w-full text-left p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/40 hover:scale-[1.01] transition-all group shadow-sm flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black text-white shrink-0 ${
                          isAdmin
                            ? "bg-gradient-to-tr from-amber-500 to-orange-500"
                            : "bg-gradient-to-tr from-emerald-500 to-teal-500"
                        }`}
                      >
                        {p.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="truncate">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-500 transition-colors">
                            {p.username}
                          </span>
                          <span
                            className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded border ${
                              isAdmin
                                ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                            }`}
                          >
                            {p.role}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          pw: {p.password}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0 ml-2">
                      <span className="text-xs font-bold font-mono text-slate-700 dark:text-slate-300 block">
                        ${p.balance.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-emerald-500 dark:text-emerald-400 font-semibold group-hover:underline">
                        1-Click &rarr;
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800/60 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>PBKDF2 SHA-256 salted credentials with secure JWT bearer tokens.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
