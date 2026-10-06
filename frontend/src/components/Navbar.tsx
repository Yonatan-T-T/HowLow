import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
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
} from "lucide-react";
import { useUser } from "../context/UserContext";
import { useTheme } from "../context/ThemeContext";
import { HowItWorksModal } from "./HowItWorksModal";

export const Navbar: React.FC = () => {
  const { currentUser, users, switchUser, openTopUp } = useUser();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isAdmin = currentUser?.role === "Admin";

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl transition-all">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
          {/* Brand Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 sm:gap-2.5 group shrink-0 min-w-0"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-300 shrink-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="text-base sm:text-lg font-black tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                  Unique<span className="text-emerald-400">Low</span>
                </span>
                <span className="hidden min-[400px]:inline-block text-[9px] sm:text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
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

          {/* Right Action Area: User Role Switcher & Wallet */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Wallet Balance Pill (Only for standard bidders, hidden for Admins) */}
            {currentUser && !isAdmin && (
              <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-xl sm:rounded-2xl p-1 pl-2.5 sm:pl-3 shadow-inner shrink-0">
                <div className="flex items-center gap-1 sm:gap-1.5 mr-1.5 sm:mr-2">
                  <Wallet className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="font-mono text-xs font-bold text-white whitespace-nowrap">
                    ${currentUser.balance.toFixed(2)}
                  </span>
                </div>
                <button
                  onClick={openTopUp}
                  title="Quick Deposit (Demo)"
                  className="p-1 sm:p-1.5 rounded-lg sm:rounded-xl bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 transition-colors shrink-0"
                >
                  <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </button>
              </div>
            )}

            {/* Persona / Role Switcher Dropdown */}
            <div className="relative shrink-0">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-1.5 sm:gap-2 p-1 sm:px-3 sm:py-2 rounded-xl sm:rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all text-left"
                title="Switch Persona"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                  {currentUser ? currentUser.username.charAt(0) : "?"}
                </div>
                <div className="hidden sm:block">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white max-w-[100px] truncate">
                      {currentUser?.username}
                    </span>
                    {isAdmin && (
                      <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Admin
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 block -mt-0.5">
                    Switch Persona
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsUserMenuOpen(false)}
                  />
                  <div
                    className="absolute right-0 mt-2 w-64 max-w-[calc(100vw-1.5rem)] rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 animate-fade-in"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <div className="px-3 py-2 border-b border-slate-800/80 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Demo Persona Switcher
                      </span>
                      <span className="text-xs text-slate-400">
                        Switch users to test multi-user lowest unique bidding
                      </span>
                    </div>

                    <div className="space-y-1 max-h-[60vh] overflow-y-auto">
                      {users.map((u) => {
                        const isSelected = currentUser?.id === u.id;
                        const isUserAdmin = u.role === "Admin";
                        return (
                          <button
                            key={u.id}
                            onClick={() => switchUser(u.id)}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                              isSelected
                                ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                                : "text-slate-300 hover:bg-slate-800/60"
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                                {u.username.charAt(0)}
                              </div>
                              <div className="text-left truncate">
                                <span className="font-semibold block truncate">
                                  {u.username}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  {u.role}
                                </span>
                              </div>
                            </div>
                            {!isUserAdmin ? (
                              <span className="font-mono font-medium text-slate-400 text-[11px] shrink-0 ml-2">
                                ${u.balance.toFixed(2)}
                              </span>
                            ) : (
                              <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0 ml-2">
                                Admin
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

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
              className="md:hidden p-1.5 sm:p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white shrink-0"
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

        {/* Mobile Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 px-4 py-4 space-y-2 bg-slate-950 animate-fade-in">
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
