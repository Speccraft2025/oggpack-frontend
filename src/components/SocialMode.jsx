import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../api';
import FeedItem from './FeedItem';

function SocialMode({ token, user }) {
  const [posts, setPosts] = useState([]);
  const [concerts, setConcerts] = useState([]);
  const [showCreateConcert, setShowCreateConcert] = useState(false);
  const [concertTitle, setConcertTitle] = useState('');
  const [concertDesc, setConcertDesc] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPosts();
    fetchConcerts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/social/posts`);
      setPosts(data.posts || []);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    }
  };

  const fetchConcerts = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/social/concerts`);
      setConcerts(data.concerts || []);
    } catch (err) {
      console.error('Failed to fetch concerts:', err);
    }
  };

  const handleCreateConcert = async () => {
    if (!concertTitle.trim()) return;
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/social/concerts`, { title: concertTitle, description: concertDesc, start_time: new Date().toISOString() }, { headers: { Authorization: 'Bearer ' + token } });
      setConcertTitle('');
      setConcertDesc('');
      setShowCreateConcert(false);
      fetchConcerts();
    } catch (err) {
      console.error('Failed to create concert:', err);
      alert('Failed to create concert');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white mb-4">Social Feed</h2>
        {user?.role === 'creator' && (
          <button onClick={() => setShowCreateConcert(!showCreateConcert)} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-2 rounded-lg font-semibold transition-all">
            {showCreateConcert ? 'Cancel' : '+ Create Concert'}
          </button>
        )}
      </div>

      {showCreateConcert && (
        <div className="bg-gray-800 p-6 rounded-lg mb-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4">Create New Concert</h3>
          <input type="text" placeholder="Concert Title" value={concertTitle} onChange={(e) => setConcertTitle(e.target.value)} className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white mb-3" />
          <textarea placeholder="Description" value={concertDesc} onChange={(e) => setConcertDesc(e.target.value)} className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white mb-3" rows="3" />
          <button onClick={handleCreateConcert} disabled={loading} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-50">
            {loading ? 'Creating...' : 'Create Concert'}
          </button>
        </div>
      )}

      {concerts.length > 0 && (
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-white mb-4">🎵 Live Concerts</h3>
          <div className="space-y-4">
            {concerts.map((concert) => (
              <div key={concert.id} className="bg-gradient-to-r from-purple-900 to-pink-900 p-6 rounded-lg border border-purple-500">
                <h4 className="text-xl font-bold text-white mb-2">{concert.title}</h4>
                <p className="text-gray-300 mb-4">{concert.description}</p>
                <a href={`/concert/${concert.id}`} className="inline-block bg-white text-purple-900 px-6 py-2 rounded-lg font-bold hover:bg-gray-100 transition-colors">
                  Join Concert →
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-6">
        {posts.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            <p className="text-lg">No posts yet. Be the first to share!</p>
          </div>
        ) : (
          posts.map((post) => <FeedItem key={post.id} post={post} token={token} onUpdate={fetchPosts} />)
        )}
      </div>
    </div>
  );
}

export default SocialMode;