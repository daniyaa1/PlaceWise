import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';
import {
  Compass,
  Bell,
  User,
  LogOut,
  Briefcase,
  Layers,
  ShieldAlert,
  ChevronDown,
  Menu,
  X,
  Building2,
  CheckCircle2,
  Sliders,
  Moon,
  Sun,
  Search,
  Sparkles,
  Link as LinkIcon
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const { isDark, toggleTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-40 glass-elevated border-b border-white/10 transition-colors duration-400">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-4">
          {/* Left: User Identity Pill matching user screenshot */}
          <div className="flex items-center space-x-3 shrink-0">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2.5 p-1.5 pr-3.5 rounded-full glass-pill hover:border-cyan-500/40 transition-all cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center font-bold text-xs ring-2 ring-white/20">
                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                  </div>
                  <div className="text-left hidden sm:block">
                    <span className="font-extrabold text-xs text-slate-900 dark:text-white block leading-tight">
                      {user?.firstName} {user?.lastName}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">
                      {user?.institutionCode || user?.role?.toLowerCase()}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-transform" />
                </button>

                {showUserMenu && (
                  <div className="absolute left-0 mt-2 w-64 glass-elevated rounded-3xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-2 border-b border-white/10">
                      <span className="font-bold text-xs text-slate-900 dark:text-white block">{user?.email}</span>
                      <span className="text-[10px] text-cyan-500 font-bold uppercase">{user?.role}</span>
                    </div>
                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setShowUserMenu(false)}
                        className="px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/10 rounded-xl block transition-colors"
                      >
                        Academic Profile
                      </Link>
                      <Link
                        to="/preferences"
                        onClick={() => setShowUserMenu(false)}
                        className="px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/10 rounded-xl block transition-colors"
                      >
                        Career Preferences
                      </Link>
                      <Link
                        to="/settings"
                        onClick={() => setShowUserMenu(false)}
                        className="px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/10 rounded-xl block transition-colors"
                      >
                        Account Settings
                      </Link>
                    </div>
                    <div className="pt-1 border-t border-white/10">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 text-xs font-bold text-rose-500 hover:bg-rose-500/10 rounded-xl block transition-colors cursor-pointer"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/" className="flex items-center space-x-2.5 group">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25 group-hover:scale-105 transition-all">
                  <Compass className="w-5 h-5" />
                </div>
                <span className="font-black text-lg tracking-tight text-slate-900 dark:text-white">
                  PlaceWise
                </span>
              </Link>
            )}

            {/* Flagged / Verified Section Pill matching screenshot */}
            <span className="hidden xl:inline-flex items-center space-x-1.5 px-3 py-1 rounded-full glass-pill text-[11px] font-bold text-slate-600 dark:text-slate-300">
              <span>🚩</span>
              <span>Verified Campus Gateway</span>
            </span>
          </div>

          {/* Center: Frosted Glass Capsule Search Bar (Matching Search Bar in Screenshot) */}
          <div className="flex-1 max-w-md hidden md:block">
            <Link to="/opportunities" className="block w-full">
              <div className="glass-pill px-4 py-2 rounded-full flex items-center justify-between text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:border-cyan-500/40 transition-all cursor-pointer">
                <div className="flex items-center space-x-2">
                  <Search className="w-3.5 h-3.5 text-slate-400" />
                  <span>Search opportunities, companies, domains...</span>
                </div>
                <kbd className="hidden lg:inline-block px-2 py-0.5 text-[10px] font-mono rounded bg-white/20 dark:bg-white/10 border border-white/10 text-slate-400">
                  ⌘K
                </kbd>
              </div>
            </Link>
          </div>

          {/* Right Action Controls: Dark/Light Toggle + Messages Pill matching screenshot */}
          <div className="flex items-center space-x-3 shrink-0">
            {/* Theme Toggle Button (Dark / Light) */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full glass-pill hover:scale-105 transition-all cursor-pointer text-slate-600 dark:text-slate-300"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Theme"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600" />
              )}
            </button>

            {isAuthenticated ? (
              <>
                {/* Capsule Pill Notification matching +9 New Messages in screenshot */}
                <Link
                  to="/notifications"
                  className="hidden sm:flex items-center space-x-2 px-3.5 py-1.5 rounded-full glass-pill hover:border-cyan-500/40 transition-all text-xs font-bold text-slate-800 dark:text-white group"
                >
                  <Bell className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
                  <span>
                    {unreadCount > 0 ? `+${unreadCount} New Alerts` : '+9 Updates'}
                  </span>
                </Link>

                <Link
                  to="/opportunities"
                  className="px-4 py-2 rounded-full text-xs font-bold text-white btn-glow-blue transition-all flex items-center space-x-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Discover</span>
                </Link>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-full text-xs font-bold text-slate-700 dark:text-white glass-pill hover:bg-white/20 transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-full text-xs font-bold text-white btn-glow-cyan transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl glass-pill text-slate-600 dark:text-slate-300"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 glass-elevated px-4 pt-2 pb-4 space-y-1">
          <Link
            to="/opportunities"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-white/10"
          >
            Opportunities
          </Link>
          {isAuthenticated && user?.role === 'STUDENT' && (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-white/10"
              >
                Dashboard
              </Link>
              <Link
                to="/applications"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-white/10"
              >
                Applications
              </Link>
              <Link
                to="/preferences"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-white/10"
              >
                Preferences
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
