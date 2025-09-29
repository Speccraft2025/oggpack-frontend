import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import FeedItem from './FeedItem';

function SocialMode({ token, user }) {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [concerts, setConcerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConcertForm, setShowConcertForm] = useState(false);
  const [concertTitle, setConcertTitle] = useState('');
  const [concertDesc, setConcertDesc] = useState('');

  useEffect(() => {
    fetchFeed();
    fetchConcerts();
  }, []);

  const fetchFeed = async () => {
    try {
      const { data } = await axios.get('/api/social/posts');
      setPosts(data.posts || []);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  const fetchConcerts = async () => {
    try {
      const { data } = await axios.get('/api/social/concerts');
      setConcerts(data.concerts || []);
    } catch (err) {}
  };

  const handleCreateConcert = async (e) => {
    e.preventDefault();
    if (!concertTitle) return alert('Title is required');
    try {
      await axios.post('/api/social/concerts', { title: concertTitle, description: concertDesc, start_time: new Date().toISOString() }, { headers: { Authorization: 'Bearer ' + token } });
      alert('✅ Concert created!');
      setShowConcertForm(false);
      setConcertTitle('');
      setConcertDesc('');
      fetchConcerts();
    } catch (err) {
      alert('Failed to create concert');
    }
  };

  if (loading) return <div className="max-w-4xl mx-auto p-6 text-center"><div className="animate-pulse">Loading feed...</div></div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Social Feed</h1>
        <button onClick={() => setShowConcertForm(!showConcertForm)} className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg font-semibold">
          {showConcertForm ? 'Cancel' : '🎤 Create Concert'}
        </button>
      </div>
      {showConcertForm && (
        <form onSubmit={handleCreateConcert} className="bg-gray-800 p-6 rounded-xl mb-8 space-y-4">
          <h2 className="text-xl font-bold">Create Concert Event</h2>
          <div>
            <label className="block text-sm font-medium mb-2">Concert Title *</label>
            <input type="text" value={concertTitle} onChange={(e) => setConcertTitle(e.target.value)} className="w-full" placeholder="Friday Night Live Session" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea value={concertDesc} onChange={(e) => setConcertDesc(e.target.value)} className="w-full h-24" placeholder="Join us for an exclusive live performance..." />
          </div>
          <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 rounded-lg">
            Create Concert
          </button>
        </form>
      )}
      {concerts.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">🎤 Live Concerts</h2>
          <div className="space-y-4">
            {concerts.map((concert) => (
              <div key={concert.id} className="bg-gradient-to-r from-pink-900/50 to-purple-900/50 p-6 rounded-xl border border-pink-500/30">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold">{concert.title}</h3>
                    <p className="text-gray-300 text-sm mb-2">Hosted by {concert.display_name}</p>
                    {concert.description && <p className="text-gray-400 text-sm mb-4">{concert.description}</p>}
                  </div>
                  <button onClick={() => navigate('/concert/' + concert.id)} className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg font-semibold whitespace-nowrap">
                    Join Concert →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <h2 className="text-2xl font-bold mb-4">Recent Posts</h2>
      {posts.length === 0 ? (
        <div className="bg-gray-800 p-12 rounded-xl text-center">
          <p className="text-gray-400 mb-4">No posts yet. Be the first to share!</p>
          <button onClick={() => navigate('/creator')} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg">
            Create Your First Track
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <FeedItem key={post.id} post={post} token={token} currentUser={user} onUpdate={fetchFeed} />
          ))}
        </div>
      )}
    </div>
  );
}

export default SocialMode;