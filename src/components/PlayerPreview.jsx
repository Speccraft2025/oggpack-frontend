import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function PlayerPreview({ token }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const audioRef = useRef(null);
  const [oggpack, setOggpack] = useState(null);
  const [metadata, setMetadata] = useState({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [showMetadata, setShowMetadata] = useState(false);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    fetchOggpack();
  }, [id]);

  const fetchOggpack = async () => {
    try {
      setOggpack({
        id,
        title: 'Preview Track',
        file_path: 'uploads/ogg/' + id + '.ogg',
        cover_path: null,
        metadata_json: '{}'
      });
      setLoading(false);
    } catch (err) {
      setOggpack({
        id,
        title: 'Preview Track',
        file_path: 'uploads/ogg/' + id + '.ogg',
        cover_path: null,
        metadata_json: '{}'
      });
      setLoading(false);
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      const caption = prompt('Enter a caption for your post:');
      if (caption === null) {
        setPublishing(false);
        return;
      }
      await axios.post('/api/social/posts', { oggpack_id: id, caption }, { headers: { Authorization: 'Bearer ' + token } });
      alert('✅ Published to Social Feed!');
      navigate('/social');
    } catch (err) {
      alert('Failed to publish');
    } finally {
      setPublishing(false);
    }
  };

  if (loading) return <div className="max-w-4xl mx-auto p-6 text-center"><div className="animate-pulse">Loading...</div></div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button onClick={() => navigate('/creator')} className="mb-6 text-gray-400 hover:text-white">← Back to Creator</button>
      <div className="bg-gray-800 rounded-xl overflow-hidden">
        <div className="h-64 bg-gradient-to-br from-purple-900 to-pink-900 flex items-center justify-center">
          {oggpack.cover_path ? <img src={'/' + oggpack.cover_path} alt="Cover" className="w-full h-full object-cover" /> : <div className="text-6xl">🎵</div>}
        </div>
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-2">{oggpack.title}</h1>
          <p className="text-gray-400 mb-6">{oggpack.description}</p>
          <div className="bg-gray-900 rounded-lg p-4 mb-6">
            <audio ref={audioRef} src={'/' + oggpack.file_path} onEnded={() => setIsPlaying(false)} className="w-full mb-4" controls />
            <div className="flex items-center justify-between">
              <button onClick={togglePlay} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold">
                {isPlaying ? '⏸ Pause' : '▶ Play'}
              </button>
              <div className="text-gray-400 text-sm">OGG Opus • 128kbps</div>
            </div>
          </div>
          <button onClick={() => setShowMetadata(!showMetadata)} className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg mb-4">
            {showMetadata ? '▼ Hide Metadata' : '▶ Show Metadata'}
          </button>
          {showMetadata && (
            <div className="bg-gray-900 rounded-lg p-4 mb-6 space-y-4">
              {metadata.lyrics && (
                <div>
                  <h3 className="font-semibold mb-2">Lyrics</h3>
                  <pre className="text-gray-300 whitespace-pre-wrap text-sm">{metadata.lyrics}</pre>
                </div>
              )}
              {metadata.credits && (
                <div>
                  <h3 className="font-semibold mb-2">Credits</h3>
                  <p className="text-gray-300 text-sm">{metadata.credits}</p>
                </div>
              )}
            </div>
          )}
          <div className="flex items-center space-x-4 mb-6 text-gray-400">
            <span>👍 0 upvotes (preview)</span>
            <span>💬 0 comments</span>
          </div>
          <div className="flex space-x-4">
            <button onClick={handlePublish} disabled={publishing} className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 rounded-lg disabled:opacity-50">
              {publishing ? 'Publishing...' : 'Publish to Social Feed'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlayerPreview;