import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Auth from './components/Auth';
import CreatorMode from './components/CreatorMode';
import PlayerPreview from './components/PlayerPreview';
import SocialMode from './components/SocialMode';
import ConcertRoom from './components/ConcertRoom';
import ExperiencePlayer from './components/ExperiencePlayer';

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (token, user) => {
    setToken(token);
    setUser(user);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  if (!user) return <Auth onLogin={handleLogin} />;

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-950">
        <Navbar user={user} onLogout={handleLogout} />
        <Routes>
          <Route path="/" element={<Navigate to="/social" />} />
          <Route path="/creator" element={<CreatorMode token={token} />} />
          <Route path="/preview/:id" element={<PlayerPreview token={token} />} />
          <Route path="/social" element={<SocialMode token={token} user={user} />} />
          <Route path="/concert/:id" element={<ConcertRoom token={token} user={user} />} />
          <Route path="/experience/:id" element={<ExperiencePlayer token={token} />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;