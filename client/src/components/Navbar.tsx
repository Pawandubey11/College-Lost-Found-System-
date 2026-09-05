import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, PlusCircle, Search, Bell, User as UserIcon, LogOut, LayoutDashboard, Shield, FileText } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, unreadNotificationsCount } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-[#1E3A2B] text-white shadow-md border-b border-[#2A4D3B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-lg bg-[#D97706] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight block text-white leading-tight">College Lost & Found System</span>
            <span className="text-xs text-[#A7F3D0] block tracking-wide font-medium">Department of Campus Safety & Administration</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1">
          <Link
            to="/"
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive('/') ? 'bg-[#2A4D3B] text-white font-semibold' : 'text-gray-200 hover:bg-[#2A4D3B] hover:text-white'
            }`}
          >
            Home
          </Link>
          <Link
            to="/browse?type=LOST"
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              location.search.includes('type=LOST') ? 'bg-[#2A4D3B] text-white font-semibold' : 'text-gray-200 hover:bg-[#2A4D3B] hover:text-white'
            }`}
          >
            Browse Lost
          </Link>
          <Link
            to="/browse?type=FOUND"
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              location.search.includes('type=FOUND') ? 'bg-[#2A4D3B] text-white font-semibold' : 'text-gray-200 hover:bg-[#2A4D3B] hover:text-white'
            }`}
          >
            Browse Found
          </Link>
        </nav>

        {/* Actions & User Menu */}
        <div className="flex items-center space-x-3">
          
          <Link
            to="/report-lost"
            className="hidden sm:inline-flex items-center space-x-1 bg-[#D97706] hover:bg-[#B45309] text-white px-3.5 py-1.5 rounded-lg text-sm font-medium shadow-sm transition-all hover:shadow"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report Lost</span>
          </Link>

          <Link
            to="/report-found"
            className="hidden sm:inline-flex items-center space-x-1 bg-white/10 hover:bg-white/20 text-white px-3.5 py-1.5 rounded-lg text-sm font-medium border border-white/20 transition-all"
          >
            <Search className="w-4 h-4" />
            <span>Report Found</span>
          </Link>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 bg-[#2A4D3B] hover:bg-[#35614B] px-3 py-1.5 rounded-lg text-sm font-medium transition-colors focus:outline-none border border-white/10"
              >
                <div className="w-7 h-7 rounded-full bg-[#D97706] flex items-center justify-center text-xs font-bold uppercase text-white">
                  {user.full_name.charAt(0)}
                </div>
                <span className="hidden lg:inline text-sm font-medium">{user.full_name.split(' ')[0]}</span>
                {unreadNotificationsCount > 0 && (
                  <span className="bg-[#D97706] text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl py-1 text-gray-800 border border-gray-100 z-50 animate-fadeIn"
                  onMouseLeave={() => setDropdownOpen(false)}
                >
                  <div className="px-4 py-3 border-b border-gray-100 bg-[#FAFAF7] rounded-t-xl">
                    <p className="text-sm font-semibold text-gray-900">{user.full_name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#1E3A2B]/10 text-[#1E3A2B]">
                      {user.role}
                    </span>
                  </div>

                  <Link
                    to="/dashboard"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <LayoutDashboard className="w-4 h-4 text-gray-500" />
                    <span>My Dashboard</span>
                  </Link>

                  <Link
                    to="/my-claims"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <FileText className="w-4 h-4 text-gray-500" />
                    <span>My Claims & Proofs</span>
                  </Link>

                  <Link
                    to="/notifications"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-2">
                      <Bell className="w-4 h-4 text-gray-500" />
                      <span>Notifications</span>
                    </div>
                    {unreadNotificationsCount > 0 && (
                      <span className="bg-[#D97706] text-white text-xs px-2 py-0.5 rounded-full font-bold">
                        {unreadNotificationsCount}
                      </span>
                    )}
                  </Link>

                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-[#1E3A2B] font-semibold hover:bg-green-50"
                    >
                      <Shield className="w-4 h-4 text-[#1E3A2B]" />
                      <span>Admin Control Panel</span>
                    </Link>
                  )}

                  <div className="border-t border-gray-100 my-1"></div>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="text-sm font-medium text-gray-200 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="text-sm font-medium bg-white text-[#1E3A2B] hover:bg-gray-100 px-3.5 py-1.5 rounded-lg shadow-sm transition-colors"
              >
                Register
              </Link>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
