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
  Sparkles
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const { isDark, toggleTheme } = useTheme();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-40 glass-panel border-b border-slate-200/80 dark:border-white/10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-all">
                <Compass className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white leading-none">
                  PlaceWise
                </span>
                <span className="text-[10px] font-semibold text-indigo-600 dark:text-cyan-400 uppercase tracking-widest">
                  Intelligence
                </span>
              </div>
            </Link>

            {/* Institution Badge */}
            {user && (
              <span className="hidden md:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10">
                <Building2 className="w-3.5 h-3.5 mr-1 text-indigo-500 dark:text-cyan-400" />
                {user.institutionCode || (user.role === 'PLATFORM_ADMIN' ? 'Platform HQ' : 'Multi-Campus')}
              </span>
            )}
          </div>

          {/* Center Search / Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              to="/opportunities"
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all flex items-center space-x-1.5"
            >
              <Briefcase className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <span>Opportunities</span>
            </Link>

            {isAuthenticated && user?.role === 'STUDENT' && (
              <>
                <Link
                  to="/dashboard"
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all flex items-center space-x-1.5"
                >
                  <Layers className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/applications"
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all flex items-center space-x-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                  <span>Applications</span>
                </Link>
                <Link
                  to="/preferences"
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all flex items-center space-x-1.5"
                >
                  <Sliders className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                  <span>Preferences</span>
                </Link>
              </>
            )}

            {isAuthenticated && user?.role === 'PLACEMENT_ADMIN' && (
              <>
                <Link
                  to="/admin/dashboard"
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                >
                  Admin Portal
                </Link>
                <Link
                  to="/admin/drives"
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                >
                  Campus Drives
                </Link>
                <Link
                  to="/admin/companies"
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                >
                  Companies
                </Link>
              </>
            )}

            {isAuthenticated && user?.role === 'PLATFORM_ADMIN' && (
              <>
                <Link
                  to="/platform/moderation"
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all flex items-center space-x-1.5"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                  <span>Moderation</span>
                </Link>
                <Link
                  to="/platform/institutions"
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                >
                  Institutions
                </Link>
              </>
            )}
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-2.5">
            {/* Theme Toggle Button (Dark / Light) */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-200 dark:border-white/10 transition-all hover:scale-105"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Theme"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-180 duration-300" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600 animate-in spin-in-180 duration-300" />
              )}
            </button>

            {isAuthenticated ? (
              <>
                {/* Notifications Bell Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifs(!showNotifs)}
                    className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-200 dark:border-white/10 relative transition-all"
                    aria-label="Notifications"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-500 text-[10px] font-bold text-white shadow-xs">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifs && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 glass-panel rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-4 py-2.5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">Notifications</span>
                        <Link
                          to="/notifications"
                          onClick={() => setShowNotifs(false)}
                          className="text-xs text-indigo-600 dark:text-cyan-400 hover:underline font-semibold"
                        >
                          View all
                        </Link>
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-white/5">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-xs text-slate-500">
                            No notifications right now.
                          </div>
                        ) : (
                          notifications.slice(0, 5).map(n => (
                            <div
                              key={n.id}
                              onClick={() => { markAsRead(n.id); setShowNotifs(false); }}
                              className={`p-3.5 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer transition-colors ${!n.read_at ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''}`}
                            >
                              <div className="flex items-start justify-between">
                                <p className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-1">{n.title}</p>
                                {!n.read_at && (
                                  <span className="w-2 h-2 rounded-full bg-cyan-500 ml-2 mt-1 shrink-0" />
                                )}
                              </div>
                              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-0.5">{n.message}</p>
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
                                {new Date(n.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Menu Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 p-1 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent hover:border-slate-200 dark:hover:border-white/10 transition-all"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-slate-800 to-slate-900 dark:from-indigo-600 dark:to-cyan-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                    </div>
                    <span className="hidden lg:inline text-xs font-semibold text-slate-900 dark:text-white">
                      {user.firstName}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 glass-panel rounded-2xl shadow-2xl py-1.5 z-50">
                      <div className="px-4 py-2.5 border-b border-slate-200 dark:border-white/10">
                        <p className="text-xs font-bold text-slate-900 dark:text-white leading-none">{user.firstName} {user.lastName}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">{user.email}</p>
                        <span className="inline-block mt-1.5 px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                          {user.role.replace('_', ' ')}
                        </span>
                      </div>

                      {user.role === 'STUDENT' && (
                        <>
                          <Link
                            to="/profile"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
                          >
                            <User className="w-3.5 h-3.5 mr-2 text-slate-400" />
                            Academic Profile
                          </Link>
                          <Link
                            to="/resumes"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
                          >
                            <Briefcase className="w-3.5 h-3.5 mr-2 text-slate-400" />
                            Resume Vault
                          </Link>
                          <Link
                            to="/preferences"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
                          >
                            <Sliders className="w-3.5 h-3.5 mr-2 text-slate-400" />
                            Career Preferences
                          </Link>
                          <Link
                            to="/settings"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
                          >
                            <Building2 className="w-3.5 h-3.5 mr-2 text-slate-400" />
                            Account Settings
                          </Link>
                        </>
                      )}

                      <div className="border-t border-slate-200 dark:border-white/10 my-1" />
                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 font-semibold"
                      >
                        <LogOut className="w-3.5 h-3.5 mr-2" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-200 dark:border-white/10 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-cyan-500 hover:opacity-90 transition-opacity shadow-md shadow-indigo-500/20"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-white/10 glass-panel px-4 pt-2 pb-4 space-y-1">
          <Link
            to="/opportunities"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5"
          >
            Opportunities
          </Link>
          {isAuthenticated && user?.role === 'STUDENT' && (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5"
              >
                Dashboard
              </Link>
              <Link
                to="/applications"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5"
              >
                Applications
              </Link>
              <Link
                to="/preferences"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5"
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
