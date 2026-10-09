import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Sparkles,
  Wallet,
  Plus,
  HelpCircle,
  ShieldAlert,
  ChevronDown,
  Menu,
  X,
  LayoutGrid,
  Sun,
  Moon,
  LogIn,
  UserPlus,
  LogOut,
  Zap,
} from "lucide-react";
import { useUser } from "../context/UserContext";
import { useTheme } from "../context/ThemeContext";
import { HowItWorksModal } from "./HowItWorksModal";

export const Navbar: React.FC = () => {
  const { currentUser, testProfiles, quickLoginAs, logout, openTopUp } = useUser();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isDemoMenuOpen, setIsDemoMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileDemoOpen, setIsMobileDemoOpen] = useState(false);

  const isAdmin = currentUser?.role === "Admin";

  const handleSignOut = () => {
    logout();
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
    navigate("/");
  };

  const handleMobileQuickLogin = (tp: any) => {
    quickLoginAs(tp);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl transition-all">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-1.5 sm:gap-4">
          {/* Brand Logo */}
          <Link
            to="/"
            className="flex items-center gap-1.5 sm:gap-2.5 group shrink-0 min-w-0"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-300 shrink-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="text-base sm:text-lg font-black tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                  Unique<span className="text-emerald-400">Low</span>
                </span>
                <span className="hidden sm:inline-block text-[9px] sm:text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Auction
                </span>
              </div>
              <span className="hidden sm:block text-[10px] text-slate-400 font-medium truncate">
                Lowest Unique Bid Platform
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 shrink-0">
            <Link
              to="/"
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                location.pathname === "/"
                  ? "bg-slate-800 text-emerald-400 border border-slate-700/60 shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-slate-900"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Live Auctions</span>
              </div>
            </Link>

            <button
              onClick={() => setIsHowItWorksOpen(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900 transition-all flex items-center gap-1.5"
            >
              <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>How It Works</span>
            </button>

            {isAdmin && (
              <Link
                to="/admin"
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  location.pathname.startsWith("/admin")
                    ? "bg-indigo-950/50 text-indigo-300 border border-indigo-700/50"
                    : "text-slate-300 hover:text-white hover:bg-slate-900"
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" />
                <span>Admin Portal</span>
              </Link>
            )}
          </nav>

          {/* Right Action Area */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Wallet Balance Pill (Only for logged-in standard bidders) */}
            {currentUser && !isAdmin && (
              <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-xl sm:rounded-2xl p-1 pl-2 sm:pl-3 shadow-inner shrink-0">
                <div className="flex items-center gap-1 sm:gap-1.5 mr-1 sm:mr-2">
                  <Wallet className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="font-mono text-xs font-bold text-white whitespace-nowrap">
                    ${currentUser.balance.toFixed(2)}
                  </span>
                </div>
                <button
                  onClick={openTopUp}
                  title="Quick Deposit"
                  className="p-1 sm:p-1.5 rounded-lg sm:rounded-xl bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 transition-colors shrink-0"
                >
                  <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </button>
              </div>
            )}

            {/* If NOT logged in: Show Log In, Sign Up, and Quick Demo Accounts */}
            {!currentUser ? (
              <div className="flex items-center gap-1 sm:gap-2">
                {/* Demo Accounts Quick Dropdown (Hidden on small mobile screens to prevent overflow, accessible in mobile menu) */}
                <div className="relative hidden sm:block">
                  <button
                    onClick={() => setIsDemoMenuOpen(!isDemoMenuOpen)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl sm:rounded-2xl bg-slate-900/90 border border-amber-500/30 text-amber-300 hover:bg-amber-500/10 text-xs font-bold transition-all"
                    title="Quick Test Accounts (2 Admins, 5 Users)"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Test Accounts</span>
                    <ChevronDown className="w-3 h-3 text-amber-400/80" />
                  </button>

                  {isDemoMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsDemoMenuOpen(false)}
                      />
                      <div
                        className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-1.5rem)] rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-2.5 z-50 animate-fade-in"
                        onClick={() => setIsDemoMenuOpen(false)}
                      >
                        <div className="px-2.5 py-2 border-b border-slate-800/80 mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                            Quick Test Credentials
                          </span>
                          <span className="text-[11px] text-slate-400">
                            2 Admins &amp; 5 Bidders ready for 1-click evaluation
                          </span>
                        </div>
                        <div className="space-y-1.5 max-h-[60vh] overflow-y-auto">
                          {testProfiles.map((tp) => (
                            <button
                              key={tp.username}
                              onClick={() => quickLoginAs(tp)}
                              className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-800 transition-colors text-left"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <div
                                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black text-white shrink-0 ${
                                    tp.role === "Admin"
                                      ? "bg-amber-500"
                                      : "bg-emerald-500"
                                  }`}
                                >
                                  {tp.username.charAt(0).toUpperCase()}
                                </div>
                                <div className="truncate">
                                  <span className="text-xs font-bold text-white block truncate">
                                    {tp.username}
                                  </span>
                                  <span className="text-[9px] text-slate-400 font-mono">
                                    {tp.password}
                                  </span>
                                </div>
                              </div>
                              <span
                                className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border shrink-0 ml-2 ${
                                  tp.role === "Admin"
                                    ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                                    : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                }`}
                              >
                                {tp.role}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <Link
                  to="/login"
                  className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl sm:rounded-2xl text-xs font-bold text-slate-200 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex items-center gap-1 shrink-0"
                >
                  <LogIn className="w-3.5 h-3.5 text-slate-400" />
                  <span>Log In</span>
                </Link>

                <Link
                  to="/signup"
                  className="px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl sm:rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 shadow-sm sm:shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1 shrink-0"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Sign Up</span>
                </Link>
              </div>
            ) : (
              /* If LOGGED IN: User Profile Dropdown Menu */
              <div className="relative shrink-0">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-1.5 sm:gap-2 p-1 sm:px-3 sm:py-2 rounded-xl sm:rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all text-left"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                    {currentUser.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden sm:block">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white max-w-[100px] truncate">
                        {currentUser.username}
                      </span>
                      {isAdmin && (
                        <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Admin
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 block -mt-0.5">
                      {currentUser.role}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                </button>

                {/* Logged in User Menu */}
                {isUserMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsUserMenuOpen(false)}
                    />
                    <div
                      className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-1.5rem)] rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-2.5 z-50 animate-fade-in"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      {/* User details header */}
                      <div className="px-3 py-2.5 border-b border-slate-800/80 mb-2 bg-slate-950/40 rounded-xl">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white truncate">
                            {currentUser.username}
                          </span>
                          <span
                            className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border ${
                              isAdmin
                                ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                                : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                            }`}
                          >
                            {currentUser.role}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 block truncate font-mono mt-0.5">
                          {currentUser.email}
                        </span>
                        <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs">
                          <span className="text-slate-400">Wallet:</span>
                          <span className="font-mono font-bold text-emerald-400">
                            ${currentUser.balance.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Quick Switch Test Profiles */}
                      <div className="px-2 py-1 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                          Switch Test Profile
                        </span>
                        <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                          {testProfiles.map((tp) => {
                            const isCurrent = tp.username.toLowerCase() === currentUser.username.toLowerCase();
                            return (
                              <button
                                key={tp.username}
                                onClick={() => quickLoginAs(tp)}
                                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                                  isCurrent
                                    ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                                    : "text-slate-300 hover:bg-slate-800"
                                }`}
                              >
                                <span className="font-medium truncate">{tp.username}</span>
                                <span className="text-[10px] text-slate-400 uppercase font-semibold">
                                  {tp.role}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="pt-2 border-t border-slate-800/80 space-y-1">
                        {!isAdmin && (
                          <button
                            onClick={openTopUp}
                            className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-emerald-400 hover:bg-emerald-500/10 transition-colors flex items-center gap-2"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Top Up Wallet Balance</span>
                          </button>
                        )}
                        {isAdmin && (
                          <Link
                            to="/admin"
                            className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-indigo-300 hover:bg-indigo-950/40 transition-colors flex items-center gap-2"
                          >
                            <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Admin Portal</span>
                          </Link>
                        )}
                        <button
                          onClick={handleSignOut}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center gap-2"
                        >
                          <LogOut className="w-3.5 h-3.5 text-rose-400" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Light / Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              className="hidden sm:flex p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all items-center justify-center shadow-sm shrink-0"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform duration-300" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-400 hover:-rotate-12 transition-transform duration-300" />
              )}
            </button>

            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-1.5 sm:p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white shrink-0 ml-0.5"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 px-4 py-4 space-y-3 bg-slate-950/95 backdrop-blur-xl animate-fade-in shadow-2xl">
            <div className="space-y-1">
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-200 hover:bg-slate-900"
              >
                Live Auctions
              </Link>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsHowItWorksOpen(true);
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold text-slate-200 hover:bg-slate-900 flex items-center gap-2"
              >
                <HelpCircle className="w-4 h-4 text-emerald-400" />
                <span>How It Works</span>
              </button>
            </div>

            {currentUser ? (
              <div className="pt-2 border-t border-slate-800 space-y-2">
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-xl text-sm font-semibold text-indigo-300 hover:bg-slate-900 flex items-center gap-2"
                  >
                    <ShieldAlert className="w-4 h-4 text-indigo-400" />
                    <span>Admin Portal</span>
                  </Link>
                )}
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold text-rose-400 hover:bg-slate-900 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out ({currentUser.username})</span>
                </button>
              </div>
            ) : (
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="py-2.5 px-3 rounded-xl text-center text-xs font-bold bg-slate-900 border border-slate-800 text-white flex items-center justify-center gap-1.5"
                  >
                    <LogIn className="w-3.5 h-3.5 text-slate-400" />
                    <span>Log In</span>
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="py-2.5 px-3 rounded-xl text-center text-xs font-bold bg-emerald-600 text-white flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Sign Up</span>
                  </Link>
                </div>

                {/* Mobile Quick Test Accounts Accordion */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setIsMobileDemoOpen(!isMobileDemoOpen)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 border border-amber-500/30 text-amber-300 text-xs font-bold"
                  >
                    <div className="flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span>1-Click Test Accounts ({testProfiles.length})</span>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isMobileDemoOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isMobileDemoOpen && (
                    <div className="mt-2 space-y-1.5 p-2 rounded-xl bg-slate-900 border border-slate-800 max-h-52 overflow-y-auto">
                      {testProfiles.map((tp) => (
                        <button
                          key={tp.username}
                          onClick={() => handleMobileQuickLogin(tp)}
                          className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-800 transition-colors text-left"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black text-white shrink-0 ${
                                tp.role === "Admin" ? "bg-amber-500" : "bg-emerald-500"
                              }`}
                            >
                              {tp.username.charAt(0).toUpperCase()}
                            </div>
                            <div className="truncate">
                              <span className="text-xs font-bold text-white block truncate">
                                {tp.username}
                              </span>
                              <span className="text-[9px] text-slate-400 font-mono">
                                pw: {tp.password}
                              </span>
                            </div>
                          </div>
                          <span
                            className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border shrink-0 ml-2 ${
                              tp.role === "Admin"
                                ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                                : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                            }`}
                          >
                            {tp.role}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <button
              onClick={() => {
                toggleTheme();
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold text-slate-200 hover:bg-slate-900 flex items-center gap-2 pt-2 border-t border-slate-800/80"
            >
              {theme === "dark" ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span>Switch to Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-400" />
                  <span>Switch to Dark Mode</span>
                </>
              )}
            </button>
          </div>
        )}
      </header>

      {/* How it Works Modal */}
      <HowItWorksModal
        isOpen={isHowItWorksOpen}
        onClose={() => setIsHowItWorksOpen(false)}
      />
    </>
  );
};
