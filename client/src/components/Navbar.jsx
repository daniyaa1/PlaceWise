import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
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
  Sliders
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-sm group-hover:bg-indigo-600 transition-colors">
                <Compass className="w-5 h-5 text-indigo-400 group-hover:text-white transition-colors" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg tracking-tight text-slate-900 leading-none">PlaceWise</span>
                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Placement Intelligence</span>
              </div>
            </Link>

            {/* Role / Institution Badge */}
            {user && (
              <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                <Building2 className="w-3 h-3 mr-1 text-slate-500" />
                {user.institutionCode || (user.role === 'PLATFORM_ADMIN' ? 'Platform HQ' : 'Multi-Campus')}
              </span>
            )}
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              to="/opportunities"
              className="px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center space-x-1"
            >
              <Briefcase className="w-4 h-4 text-slate-500" />
              <span>Opportunities</span>
            </Link>

            {isAuthenticated && user?.role === 'STUDENT' && (
              <>
                <Link
                  to="/dashboard"
                  className="px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center space-x-1"
                >
                  <Layers className="w-4 h-4 text-slate-500" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/applications"
                  className="px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center space-x-1"
                >
                  <CheckCircle2 className="w-4 h-4 text-slate-500" />
                  <span>Applications</span>
                </Link>
                <Link
                  to="/preferences"
                  className="px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center space-x-1"
                >
                  <Sliders className="w-4 h-4 text-slate-500" />
                  <span>Preferences</span>
                </Link>
              </>
            )}

            {isAuthenticated && user?.role === 'PLACEMENT_ADMIN' && (
              <>
                <Link
                  to="/admin/dashboard"
                  className="px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  Admin Portal
                </Link>
                <Link
                  to="/admin/drives"
                  className="px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  Campus Drives
                </Link>
                <Link
                  to="/admin/companies"
                  className="px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  Companies
                </Link>
              </>
            )}

            {isAuthenticated && user?.role === 'PLATFORM_ADMIN' && (
              <>
                <Link
                  to="/platform/moderation"
                  className="px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center space-x-1"
                >
                  <ShieldAlert className="w-4 h-4 text-amber-500" />
                  <span>Moderation Queue</span>
                </Link>
                <Link
                  to="/platform/institutions"
                  className="px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  Institutions
                </Link>
              </>
            )}
          </div>

          {/* Right Controls: Notifications & Auth State */}
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                {/* Notifications Bell Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifs(!showNotifs)}
                    className="p-2 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 relative transition-colors focus:outline-none"
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifs && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                        <span className="font-semibold text-sm text-slate-900">Notifications</span>
                        <Link
                          to="/notifications"
                          onClick={() => setShowNotifs(false)}
                          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                          View all
                        </Link>
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-xs text-slate-500">
                            No notifications right now.
                          </div>
                        ) : (
                          notifications.slice(0, 5).map(n => (
                            <div
                              key={n.id}
                              onClick={() => { markAsRead(n.id); setShowNotifs(false); }}
                              className={`p-3 hover:bg-slate-50 cursor-pointer transition-colors ${!n.read_at ? 'bg-indigo-50/40' : ''}`}
                            >
                              <div className="flex items-start justify-between">
                                <p className="text-xs font-semibold text-slate-900 line-clamp-1">{n.title}</p>
                                {!n.read_at && (
                                  <span className="w-2 h-2 rounded-full bg-indigo-600 ml-2 mt-1 shrink-0" />
                                )}
                              </div>
                              <p className="text-xs text-slate-600 line-clamp-2 mt-0.5">{n.message}</p>
                              <span className="text-[10px] text-slate-400 mt-1 block">
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
                    className="flex items-center space-x-2 p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-semibold text-xs">
                      {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                    </div>
                    <span className="hidden lg:inline text-sm font-medium text-slate-900">
                      {user.firstName}
                    </span>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-sm font-semibold text-slate-900 leading-none">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-slate-500 mt-1 truncate">{user.email}</p>
                        <span className="inline-block mt-1.5 px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide uppercase bg-slate-100 text-slate-700">
                          {user.role.replace('_', ' ')}
                        </span>
                      </div>

                      {user.role === 'STUDENT' && (
                        <>
                          <Link
                            to="/profile"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                          >
                            <User className="w-4 h-4 mr-2 text-slate-400" />
                            Academic Profile
                          </Link>
                          <Link
                            to="/resumes"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                          >
                            <Briefcase className="w-4 h-4 mr-2 text-slate-400" />
                            Resume Manager
                          </Link>
                          <Link
                            to="/preferences"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                          >
                            <Sliders className="w-4 h-4 mr-2 text-slate-400" />
                            Career Preferences
                          </Link>
                          <Link
                            to="/settings"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                          >
                            <Building2 className="w-4 h-4 mr-2 text-slate-400" />
                            Account Settings
                          </Link>
                        </>
                      )}

                      <div className="border-t border-slate-100 my-1" />
                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center px-4 py-2 text-xs text-rose-600 hover:bg-rose-50"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
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
                  className="px-3.5 py-1.5 rounded-lg text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 rounded-lg text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-sm"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          <Link
            to="/opportunities"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100"
          >
            Opportunities
          </Link>
          {isAuthenticated && user?.role === 'STUDENT' && (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                Dashboard
              </Link>
              <Link
                to="/applications"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                Applications
              </Link>
              <Link
                to="/preferences"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                Career Preferences
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                Profile & Resumes
              </Link>
            </>
          )}
          {isAuthenticated && user?.role === 'PLACEMENT_ADMIN' && (
            <Link
              to="/admin/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100"
            >
              Placement Admin Portal
            </Link>
          )}
          {isAuthenticated && user?.role === 'PLATFORM_ADMIN' && (
            <Link
              to="/platform/moderation"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100"
            >
              Moderation Queue
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
