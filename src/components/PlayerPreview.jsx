import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';

function PlayerPreview({ token }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);

  const oggpack = JSON.parse(localStorage.getItem('currentOggpack') || '{}');

  const handlePublish = async () => {
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/social/posts`, { oggpack_id: id, caption }, { headers: { Authorization: 'Bearer ' + token } });
      alert('Published to feed!');
      navigate('/social');
    } catch (err) {
      console.error('Failed to publish:', err);
      alert('Failed to publish post');
    } finally {
      setLoading(false);
    }
  };

  if (!oggpack.id) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <p className="text-gray-400">No oggpack to preview. Create one first!</p>
        <button onClick={() => navigate('/creator')} className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg">
          Go to Creator
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-3xl font-bold text-white mb-4">Preview Your OGGPack</h2>
        
        {oggpack.coverUrl && (
          <img src={oggpack.coverUrl} alt="Cover" className="w-full h-64 object-cover rounded-lg mb-4" />
        )}
        
        <h3 className="text-2xl font-bold text-white mb-2">{oggpack.title}</h3>
        <p className="text-gray-400 mb-4">{oggpack.description}</p>

        <div className="bg-gray-900 p-4 rounded-lg mb-4">
          <audio controls className="w-full" src={oggpack.audioUrl}>
            Your browser does not support audio playback.
          </audio>
        </div>

        {oggpack.metadata && (
          <div className="bg-gray-900 p-4 rounded-lg mb-6">
            <h4 className="text-lg font-bold text-white mb-2">Metadata</h4>
            <pre className="text-gray-300 text-sm overflow-auto">{JSON.stringify(oggpack.metadata, null, 2)}</pre>
          </div>
        )}

        <div className="border-t border-gray-700 pt-6">
          <h4 className="text-xl font-bold text-white mb-3">Publish to Feed</h4>
          <textarea 
            placeholder="Add a caption for your post..." 
            value={caption} 
            onChange={(e) => setCaption(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white mb-4"
            rows="3"
          />
          <button 
            onClick={handlePublish} 
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 rounded-lg disabled:opacity-50 transition-all"
          >
            {loading ? 'Publishing...' : 'Publish to Social Feed'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PlayerPreview;