import React, { useState } from 'react';
import axios from 'axios';
import API_URL from '../api';

function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState('creator');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpoint = isLogin ? `${API_URL}/api/auth/login` : `${API_URL}/api/auth/register`;
      const payload = isLogin ? { username, password } : { username, password, display_name: displayName, role };
      const { data } = await axios.post(endpoint, payload);
      onLogin(data.token, data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-gray-900 to-black px-4">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700">
        <h1 className="text-4xl font-bold mb-2 text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          OGGPack Studio
        </h1>
        <p className="text-gray-400 text-center mb-8">Audio platform for creators</p>
        {error && <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">Username</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:border-purple-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:border-purple-500" required />
          </div>
          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Display Name</label>
                <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:border-purple-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Role</label>
                <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:border-purple-500">
                  <option value="creator">Creator</option>
                  <option value="listener">Listener</option>
                </select>
              </div>
            </>
          )}
          <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 rounded-lg disabled:opacity-50 transition-all">
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
          </button>
        </form>
        <div className="mt-6 text-center">
          <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="text-purple-400 hover:text-purple-300 transition-colors">
            {isLogin ? 'Need an account? Register' : 'Already have an account? Login'}
          </button>
        </div>
        <div className="mt-6 p-4 bg-gray-700/50 rounded-lg text-sm text-gray-300">
          <p className="font-semibold mb-2">Demo Accounts:</p>
          <p>• demo_creator / password123</p>
          <p>• demo_listener / password123</p>
        </div>
      </div>
    </div>
  );
}

export default Auth;