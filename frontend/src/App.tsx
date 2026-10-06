import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { UserProvider, useUser } from "./context/UserContext";
import { ThemeProvider } from "./context/ThemeContext";
import { Navbar } from "./components/Navbar";
import { WalletTopUpModal } from "./components/WalletTopUpModal";
import { HomeCatalog } from "./views/HomeCatalog";
import { AuctionDetailBid } from "./views/AuctionDetailBid";
import { AdminDashboard } from "./views/AdminDashboard";
import { AdminCreateAuction } from "./views/AdminCreateAuction";
import { ShieldCheck } from "lucide-react";

function AppContent() {
  const { currentUser } = useUser();
  const isAdmin = currentUser?.role === "Admin";

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 selection:bg-emerald-500 selection:text-white transition-colors duration-200 overflow-x-hidden">
        <Navbar />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomeCatalog />} />
            <Route path="/auction/:id" element={<AuctionDetailBid />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/create" element={<AdminCreateAuction />} />
          </Routes>
        </main>

        {/* Simulated Wallet Modal */}
        <WalletTopUpModal />

        {/* Modern Footer */}
        <footer className="border-t border-slate-200 dark:border-slate-900 bg-white/80 dark:bg-slate-950/90 py-10 mt-20 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-500">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-xs">
                UL
              </div>
              <span className="font-semibold text-slate-700 dark:text-slate-400">
                Unique Low Auction Protocol &copy; {new Date().getFullYear()}
              </span>
              <span className="hidden sm:inline">
                &bull; Guaranteed Lowest Unique Bid Algorithm
              </span>
            </div>

            <div className="flex items-center gap-6">
              <Link
                to="/"
                className="hover:text-slate-900 dark:hover:text-slate-300 transition-colors"
              >
                Catalog
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="hover:text-slate-900 dark:hover:text-slate-300 transition-colors"
                >
                  Admin Portal
                </Link>
              )}
              <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />{" "}
                100% Blind & Provably Fair
              </span>
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <AppContent />
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;
