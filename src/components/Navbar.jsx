import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navbar({ user, onLogout }) {
  const location = useLocation();
  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex space-x-8">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">OGGPack</span>
            </Link>
            <Link to="/creator" className={"inline-flex items-center px-4 border-b-2 text-sm font-medium " + (isActive('/creator') ? 'border-purple-500 text-purple-400' : 'border-transparent text-gray-400 hover:text-gray-300')}>
              Creator
            </Link>
            <Link to="/social" className={"inline-flex items-center px-4 border-b-2 text-sm font-medium " + (isActive('/social') ? 'border-purple-500 text-purple-400' : 'border-transparent text-gray-400 hover:text-gray-300')}>
              Social
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-300">{user.display_name}</span>
            <button onClick={onLogout} className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm">Logout</button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;