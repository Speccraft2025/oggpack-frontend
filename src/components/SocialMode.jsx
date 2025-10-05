import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FeedItem from './FeedItem';
import { PlusCircle, Radio } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const SocialMode = ({ user }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showCreateConcert, setShowCreateConcert] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/social/posts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPosts(response.data.posts || []);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostCreated = () => {
    setShowCreatePost(false);
    setShowCreateConcert(false);
    fetchPosts();
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8 relative z-10">
      {/* Header - Mobile Optimized */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Social Feed
        </h2>

        {/* Action Buttons - Stack on Mobile */}
        {user.role === 'creator' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => {
                setShowCreatePost(!showCreatePost);
                setShowCreateConcert(false);
              }}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-purple-500/50 text-sm sm:text-base"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Create Post</span>
            </button>

            <button
              onClick={() => {
                setShowCreateConcert(!showCreateConcert);
                setShowCreatePost(false);
              }}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-pink-600 to-red-600 text-white font-semibold rounded-lg hover:from-pink-700 hover:to-red-700 transition-all shadow-lg hover:shadow-pink-500/50 text-sm sm:text-base"
            >
              <Radio className="w-5 h-5" />
              <span>Create Concert</span>
            </button>
          </div>
        )}
      </div>

      {/* Create Post Form */}
      {showCreatePost && (
        <CreatePostForm user={user} onPostCreated={handlePostCreated} onCancel={() => setShowCreatePost(false)} />
      )}

      {/* Create Concert Form */}
      {showCreateConcert && (
        <CreateConcertForm user={user} onConcertCreated={handlePostCreated} onCancel={() => setShowCreateConcert(false)} />
      )}

      {/* Posts Feed */}
      {loading ? (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-purple-500/20 p-8 text-center">
          <p className="text-gray-300">Loading feed...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-purple-500/20 p-6 sm:p-8 text-center">
          <p className="text-gray-300 mb-2">No posts yet</p>
          <p className="text-gray-500 text-sm">Be the first to share something!</p>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {posts.map((post) => (
            <FeedItem key={post.id} post={post} user={user} onUpdate={fetchPosts} />
          ))}
        </div>
      )}
    </div>
  );
};

// Create Post Form Component
const CreatePostForm = ({ user, onPostCreated, onCancel }) => {
  const [oggpacks, setOggpacks] = useState([]);
  const [selectedOggpack, setSelectedOggpack] = useState('');
  const [caption, setCaption] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchOggpacks();
  }, []);

  const fetchOggpacks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/creator/oggpacks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOggpacks(response.data.oggpacks || []);
    } catch (err) {
      console.error('Failed to fetch oggpacks:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOggpack) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/api/social/posts`,
        { oggpack_id: selectedOggpack, caption },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onPostCreated();
    } catch (err) {
      console.error('Failed to create post:', err);
      alert('Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-purple-500/20 p-4 sm:p-6 mb-6 shadow-xl">
      <h3 className="text-lg sm:text-xl font-bold text-white mb-4">Create Post</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Select OGGPack</label>
          <select
            value={selectedOggpack}
            onChange={(e) => setSelectedOggpack(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-base"
            required
          >
            <option value="">Choose a track...</option>
            {oggpacks.map((pack) => (
              <option key={pack.id} value={pack.id}>{pack.title}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Caption</label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[80px] text-base"
            placeholder="What's this track about?"
          />
        </div>

        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={submitting || !selectedOggpack}
            className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 text-base"
          >
            {submitting ? 'Posting...' : 'Post'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-white/10 text-gray-300 font-semibold rounded-lg hover:bg-white/20 transition-all text-base"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

// Create Concert Form Component
const CreateConcertForm = ({ user, onConcertCreated, onCancel }) => {
  const [oggpacks, setOggpacks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [selectedSetlist, setSelectedSetlist] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchOggpacks();
    // Set default start time to 1 hour from now
    const now = new Date();
    now.setHours(now.getHours() + 1);
    setStartTime(now.toISOString().slice(0, 16));
  }, []);

  const fetchOggpacks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/creator/oggpacks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOggpacks(response.data.oggpacks || []);
    } catch (err) {
      console.error('Failed to fetch oggpacks:', err);
    }
  };

  const toggleSetlist = (oggpackId) => {
    if (selectedSetlist.includes(oggpackId)) {
      setSelectedSetlist(selectedSetlist.filter(id => id !== oggpackId));
    } else {
      setSelectedSetlist([...selectedSetlist, oggpackId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedSetlist.length === 0) {
      alert('Please select at least one track for the setlist');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/api/social/concerts`,
        {
          title,
          description,
          start_time: startTime,
          oggpack_setlist: selectedSetlist
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onConcertCreated();
    } catch (err) {
      console.error('Failed to create concert:', err);
      alert('Failed to create concert');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-pink-500/20 p-4 sm:p-6 mb-6 shadow-xl">
      <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center space-x-2">
        <Radio className="w-5 h-5 sm:w-6 sm:h-6 text-pink-400" />
        <span>Create Concert</span>
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Concert Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-pink-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 text-base"
            placeholder="e.g., Late Night Vibes Session"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-pink-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 min-h-[80px] text-base"
            placeholder="What's this concert about?"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Start Time</label>
          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-pink-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500 text-base"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Setlist ({selectedSetlist.length} selected)
          </label>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {oggpacks.map((pack) => (
              <label
                key={pack.id}
                className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all ${
                  selectedSetlist.includes(pack.id)
                    ? 'bg-pink-500/20 border border-pink-500/50'
                    : 'bg-white/5 border border-transparent hover:bg-white/10'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedSetlist.includes(pack.id)}
                  onChange={() => toggleSetlist(pack.id)}
                  className="w-4 h-4"
                />
                <span className="text-white text-sm sm:text-base flex-1">{pack.title}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={submitting || selectedSetlist.length === 0}
            className="flex-1 py-3 bg-gradient-to-r from-pink-600 to-red-600 text-white font-semibold rounded-lg hover:from-pink-700 hover:to-red-700 transition-all disabled:opacity-50 text-base"
          >
            {submitting ? 'Creating...' : 'Create Concert'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-white/10 text-gray-300 font-semibold rounded-lg hover:bg-white/20 transition-all text-base"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default SocialMode;