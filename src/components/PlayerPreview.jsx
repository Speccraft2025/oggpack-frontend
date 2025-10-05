import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import BuyPackButton from './BuyPackButton';

const API_URL = 'https://oggpack-backend-production.up.railway.app';

function PlayerPreview({ token }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const [oggpack, setOggpack] = useState(null);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    const fetchOggpack = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/creator/oggpack/${id}`, {
          headers: { Authorization: 'Bearer ' + token }
        });
        setOggpack(data.oggpack);
      } catch (err) {
        console.error('Failed to fetch oggpack:', err);
        setFetchError('Failed to load oggpack');
      }
    };
    
    if (id) {
      fetchOggpack();
    }
  }, [id, token]);

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

  if (fetchError) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-900/30 border border-red-500 text-red-200 p-4 rounded-lg">
          {fetchError}
        </div>
        <button
          onClick={() => navigate('/creator')}
          className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg"
        >
          Go to Creator
        </button>
      </div>
    );
  }

  if (!oggpack) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="text-white text-xl">Loading oggpack...</div>
      </div>
    );
  }

  const metadata = oggpack.metadata_json ? JSON.parse(oggpack.metadata_json) : {};
  const audioUrl = `${API_URL}/uploads/ogg/${id}.ogg`;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-white">Player Preview</h1>
      
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        {/* Cover Art */}
        {oggpack.cover_path && (
          <img
            src={`${API_URL}${oggpack.cover_path}`}
            alt="Cover"
            className="w-full max-w-md mx-auto rounded-lg mb-4"
          />
        )}
        
        {/* Track Info */}
        <h2 className="text-2xl font-bold text-white mb-2">{oggpack.title}</h2>
        {oggpack.description && (
          <p className="text-gray-300 mb-4">{oggpack.description}</p>
        )}
        
        {/* Audio Player */}
        <audio controls className="w-full mb-4">
          <source src={audioUrl} type="audio/ogg" />
          Your browser does not support the audio element.
        </audio>
        
        {/* Metadata */}
        <div className="mt-6 space-y-4">
          {metadata.lyrics && (
            <div>
              <h3 className="text-lg font-semibold text-purple-400 mb-2">Lyrics</h3>
              <pre className="text-gray-300 whitespace-pre-wrap bg-gray-900 p-4 rounded">{metadata.lyrics}</pre>
            </div>
          )}
          
          {metadata.credits && (
            <div>
              <h3 className="text-lg font-semibold text-purple-400 mb-2">Credits</h3>
              <pre className="text-gray-300 whitespace-pre-wrap bg-gray-900 p-4 rounded">{metadata.credits}</pre>
            </div>
          )}
        </div>
      </div>
      
      {/* Publish Section */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Publish to Feed</h2>
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Write a caption for your post..."
          className="w-full bg-gray-700 text-white p-3 rounded-lg mb-4 min-h-[100px]"
        />
        <div className="flex space-x-4">
          <button
            onClick={handlePublish}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold"
          >
            {loading ? 'Publishing...' : 'Publish to Social Feed'}
          </button>
          <button
            onClick={() => navigate('/creator')}
            className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg"
          >
            Back to Creator
          </button>
          {/* Buy Pack Section */}
<div className="bg-gray-800 rounded-lg p-6 mt-6">
  <h2 className="text-xl font-bold text-white mb-4">Own This Pack</h2>
  <p className="text-gray-300 mb-4">
    Download the high-quality .oggpack file with all metadata, lyrics, and credits.
  </p>
  <BuyPackButton 
    oggpackId={id} 
    oggpackTitle={oggpack.title}
    token={token} 
  />
</div>
        </div>
      </div>
    </div>
  );
}

export default PlayerPreview;