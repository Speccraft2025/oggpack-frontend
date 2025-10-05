import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Auth from './components/Auth';
import CreatorMode from './components/CreatorMode';
import PlayerPreview from './components/PlayerPreview';
import SocialMode from './components/SocialMode';
import ConcertRoom from './components/ConcertRoom';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored token
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Animated Background Orbs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-64 sm:w-96 h-64 sm:h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        {user && <Navbar user={user} onLogout={handleLogout} />}

        <Routes>
          <Route
            path="/"
            element={user ? <Navigate to="/social" /> : <Auth onLogin={handleLogin} />}
          />
          <Route
            path="/creator"
            element={user && user.role === 'creator' ? <CreatorMode user={user} /> : <Navigate to="/social" />}
          />
          <Route
            path="/preview/:id?"
            element={user && user.role === 'creator' ? <PlayerPreview user={user} /> : <Navigate to="/social" />}
          />
          <Route
            path="/social"
            element={user ? <SocialMode user={user} /> : <Navigate to="/" />}
          />
          <Route
            path="/concert/:id"
            element={user ? <ConcertRoom user={user} /> : <Navigate to="/" />}
          />
        </Routes>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </Router>
  );
}

export default App;