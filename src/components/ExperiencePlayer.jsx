import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'https://oggpack-backend-production.up.railway.app';

export default function ExperiencePlayer({ token }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const audioRef = useRef(null);
  
  const [oggpack, setOggpack] = useState(null);
  const [owns, setOwns] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeMetadata, setActiveMetadata] = useState('lyrics');

  useEffect(() => {
    fetchOggpack();
    checkOwnership();
  }, [id]);

  const fetchOggpack = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/creator/oggpack/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOggpack(data.oggpack);
    } catch (err) {
      console.error('Failed to fetch oggpack:', err);
    }
  };

  const checkOwnership = async () => {
    console.log('🎨 DEVELOPMENT MODE: Mocking ownership as TRUE');
    setOwns(true);
    setLoading(false);
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading || !oggpack) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading experience...</div>
      </div>
    );
  }

  const metadata = oggpack.metadata_json ? JSON.parse(oggpack.metadata_json) : {};
  const audioUrl = `${API_URL}/uploads/ogg/${id}.ogg`;

  // Mock data for alternate versions and attached files (will be dynamic later)
  const alternateVersions = [
    { id: 1, name: 'Main Version', active: true },
    { id: 2, name: 'Instrumental', active: false },
    { id: 3, name: 'Acoustic', active: false },
    { id: 4, name: 'Demo', active: false },
  ];

  const metadataTypes = [
    { id: 'lyrics', label: 'Lyrics', content: metadata.lyrics },
    { id: 'credits', label: 'Credits', content: metadata.credits },
    { id: 'liner', label: 'Liner Notes', content: 'Behind the scenes story...' },
    { id: 'production', label: 'Production', content: 'Recording details...' },
    { id: 'story', label: 'The Story', content: 'How this track came to be...' },
  ];

  const attachedFiles = [
    { id: 1, name: 'Album Artwork.pdf', type: 'pdf' },
    { id: 2, name: 'Behind The Scenes.jpg', type: 'image' },
    { id: 3, name: 'Recording Session.gif', type: 'gif' },
    { id: 4, name: 'Lyrics Sheet.pdf', type: 'pdf' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 to-pink-900 px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">OGG Experience Player</h1>
        <button
          onClick={() => navigate('/social')}
          className="bg-gray-800/80 hover:bg-gray-700 px-4 py-2 rounded-lg"
        >
          ✕ Close
        </button>
      </div>

      <div className="flex h-[calc(100vh-64px)]">
        {/* Left Sidebar - Alternate Versions */}
        <div className="w-64 bg-gray-900 border-r border-gray-800 p-4">
          <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">
            Track Versions
          </h3>
          <div className="space-y-2">
            {alternateVersions.map((version) => (
              <button
                key={version.id}
                className={`w-full px-4 py-3 rounded-lg text-left transition-colors ${
                  version.active
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold'
                    : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                }`}
              >
                {version.name}
              </button>
            ))}
          </div>
        </div>

        {/* Main Window - Player */}
        <div className="flex-1 flex flex-col">
          {/* Player Area */}
          <div className="flex-1 bg-gradient-to-br from-gray-800 to-gray-900 flex flex-col items-center justify-center p-12">
            {/* Cover Art */}
            {oggpack.cover_path ? (
              <img
                src={`${API_URL}${oggpack.cover_path}`}
                alt={oggpack.title}
                className="w-64 h-64 rounded-2xl shadow-2xl mb-8"
              />
            ) : (
              <div className="w-64 h-64 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mb-8">
                <span className="text-8xl">🎵</span>
              </div>
            )}

            <h2 className="text-4xl font-bold mb-2">{oggpack.title}</h2>
            {oggpack.description && (
              <p className="text-gray-400 text-lg mb-8">{oggpack.description}</p>
            )}

            {/* Audio Element */}
            <audio
              ref={audioRef}
              src={audioUrl}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => setIsPlaying(false)}
            />

            {/* Play Button */}
            <button
              onClick={togglePlay}
              className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform mb-6"
            >
              {isPlaying ? (
                <span className="text-4xl text-purple-600">⏸</span>
              ) : (
                <span className="text-4xl text-purple-600 ml-1">▶</span>
              )}
            </button>

            {/* Progress Bar */}
            <div className="w-full max-w-2xl">
              <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-sm text-gray-400">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          </div>

          {/* Attached Files Section */}
          <div className="bg-gray-900 border-t border-gray-800 p-4">
            <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">
              Attached Files
            </h3>
            <div className="grid grid-cols-4 gap-3">
              {attachedFiles.map((file) => (
                <button
                  key={file.id}
                  className="bg-gradient-to-br from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 px-4 py-3 rounded-lg text-sm font-medium transition-colors"
                >
                  {file.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Metadata */}
        <div className="w-80 bg-gray-900 border-l border-gray-800 flex flex-col">
          <div className="p-4 space-y-2 border-b border-gray-800">
            {metadataTypes.map((meta) => (
              <button
                key={meta.id}
                onClick={() => setActiveMetadata(meta.id)}
                className={`w-full px-4 py-3 rounded-lg text-left transition-colors ${
                  activeMetadata === meta.id
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold'
                    : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                }`}
              >
                {meta.label}
              </button>
            ))}
          </div>

          {/* Metadata Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {metadataTypes.find(m => m.id === activeMetadata)?.content ? (
              <pre className="text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">
                {metadataTypes.find(m => m.id === activeMetadata).content}
              </pre>
            ) : (
              <p className="text-gray-500 italic">No {metadataTypes.find(m => m.id === activeMetadata)?.label.toLowerCase()} available</p>
            )}
          </div>

          {/* Download Button */}
          <div className="p-4 border-t border-gray-800">
            <button
              onClick={() => window.open(`${API_URL}/uploads/oggpack/${id}.oggpack`, '_blank')}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-4 rounded-lg font-bold text-lg"
            >
              ⬇ Download .oggpack
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}