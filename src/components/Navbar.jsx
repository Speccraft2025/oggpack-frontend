import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Music, LogOut, Menu, X } from 'lucide-react';

const Navbar = ({ user, onLogout }) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="relative z-50 bg-black/40 backdrop-blur-lg border-b border-purple-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <Link to="/social" className="flex items-center space-x-2" onClick={closeMobileMenu}>
            <Music className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400" />
            <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              OGGPack
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {user.role === 'creator' && (
              <>
                <Link
                  to="/creator"
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    isActive('/creator')
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  Creator
                </Link>
                <Link
                  to="/preview"
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    isActive('/preview')
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  Preview
                </Link>
              </>
            )}
            <Link
              to="/social"
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                isActive('/social')
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Feed
            </Link>
          </nav>

          {/* Right Side */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <span className="hidden sm:block text-sm text-gray-300 truncate max-w-[150px]">
              {user.display_name || user.username}
            </span>
            
            {/* Desktop Logout */}
            <button
              onClick={onLogout}
              className="hidden md:flex items-center space-x-2 px-3 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Logout</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-300 hover:text-white transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-purple-500/20 animate-slideDown">
            <nav className="space-y-2">
              {user.role === 'creator' && (
                <>
                  <Link
                    to="/creator"
                    onClick={closeMobileMenu}
                    className={`block w-full text-left px-4 py-3 rounded-lg font-medium transition-all ${
                      isActive('/creator')
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                        : 'text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    Creator Mode
                  </Link>
                  <Link
                    to="/preview"
                    onClick={closeMobileMenu}
                    className={`block w-full text-left px-4 py-3 rounded-lg font-medium transition-all ${
                      isActive('/preview')
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                        : 'text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    Player Preview
                  </Link>
                </>
              )}
              <Link
                to="/social"
                onClick={closeMobileMenu}
                className={`block w-full text-left px-4 py-3 rounded-lg font-medium transition-all ${
                  isActive('/social')
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'text-gray-300 hover:bg-white/10'
                }`}
              >
                Social Feed
              </Link>
              
              {/* Mobile User Info */}
              <div className="px-4 py-3 text-gray-400 text-sm border-t border-purple-500/20 mt-2">
                Logged in as: {user.display_name || user.username}
              </div>
              
              {/* Mobile Logout */}
              <button
                onClick={() => {
                  closeMobileMenu();
                  onLogout();
                }}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </nav>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
      `}</style>
    </header>
  );
};

export default Navbar;