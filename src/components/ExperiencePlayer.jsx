import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import BuyPackButton from './BuyPackButton';

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
  const [showLyrics, setShowLyrics] = useState(true);
  const [showCredits, setShowCredits] = useState(false);

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
    // ======================================
    // MOCK: Bypass payment for UI development
    // TODO: Remove this when Stripe is working
    // ======================================
    console.log('🎨 DEVELOPMENT MODE: Mocking ownership as TRUE');
    setOwns(true);
    setLoading(false);
    return;
    
    // Real implementation (commented out for development):
    /*
    try {
      const { data } = await axios.get(
        `${API_URL}/api/payment/check-ownership/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOwns(data.owns);
    } catch (err) {
      console.error('Failed to check ownership:', err);
    } finally {
      setLoading(false);
    }
    */
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-gray-900 to-black text-white">
      {/* Close button */}
      <button
        onClick={() => navigate('/social')}
        className="fixed top-4 right-4 z-50 bg-gray-800/80 hover:bg-gray-700 p-3 rounded-full"
      >
        ✕
      </button>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Cover and title */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div>
            {oggpack.cover_path ? (
              <img
                src={`${API_URL}${oggpack.cover_path}`}
                alt={oggpack.title}
                className="w-full rounded-2xl shadow-2xl"
              />
            ) : (
              <div className="w-full aspect-square bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center">
                <span className="text-6xl">🎵</span>
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center">
            <h1 className="text-5xl font-bold mb-4">{oggpack.title}</h1>
            {oggpack.description && (
              <p className="text-xl text-gray-300 mb-6">{oggpack.description}</p>
            )}

            {/* Audio player */}
            <audio
              ref={audioRef}
              src={audioUrl}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => setIsPlaying(false)}
            />

            <div className="space-y-4">
              {/* Progress bar */}
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full transition-all"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                />
              </div>

              {/* Time */}
              <div className="flex justify-between text-sm text-gray-400">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>

              {/* Play button */}
              <button
                onClick={togglePlay}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-lg text-xl font-semibold"
              >
                {isPlaying ? '⏸ Pause' : '▶ Play'}
              </button>
            </div>
          </div>
        </div>

        {/* Locked content if not owned */}
        {!owns && (
          <div className="bg-gray-800/50 backdrop-blur rounded-2xl p-8 mb-8 border-2 border-purple-500">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold mb-3">🔒 Unlock Full Experience</h2>
              <p className="text-gray-300 text-lg">
                Get synchronized lyrics, full credits, liner notes, and download the .oggpack file
              </p>
            </div>
            <div className="flex justify-center">
              <BuyPackButton 
                oggpackId={id} 
                oggpackTitle={oggpack.title}
                token={token} 
              />
            </div>
          </div>
        )}

        {/* Premium content - only show if owned */}
        {owns && (
          <>
            {/* Tabs */}
            <div className="flex space-x-4 mb-6">
              <button
                onClick={() => { setShowLyrics(true); setShowCredits(false); }}
                className={`px-6 py-3 rounded-lg font-semibold ${
                  showLyrics ? 'bg-purple-600' : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                Lyrics
              </button>
              <button
                onClick={() => { setShowLyrics(false); setShowCredits(true); }}
                className={`px-6 py-3 rounded-lg font-semibold ${
                  showCredits ? 'bg-purple-600' : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                Credits
              </button>
            </div>

            {/* Lyrics */}
            {showLyrics && metadata.lyrics && (
              <div className="bg-gray-800/50 backdrop-blur rounded-2xl p-8 mb-8">
                <h3 className="text-2xl font-bold mb-4">Lyrics</h3>
                <pre className="text-lg text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">
                  {metadata.lyrics}
                </pre>
              </div>
            )}

            {/* Credits */}
            {showCredits && metadata.credits && (
              <div className="bg-gray-800/50 backdrop-blur rounded-2xl p-8 mb-8">
                <h3 className="text-2xl font-bold mb-4">Credits</h3>
                <pre className="text-lg text-gray-300 whitespace-pre-wrap font-sans">
                  {metadata.credits}
                </pre>
              </div>
            )}

            {/* Download button */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-center">
              <h3 className="text-2xl font-bold mb-3">Download .oggpack File</h3>
              <p className="text-gray-200 mb-6">
                Keep this pack forever. Play anywhere, offline.
              </p>
              <button
                onClick={() => window.open(`${API_URL}/uploads/oggpack/${id}.oggpack`, '_blank')}
                className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-bold text-lg"
              >
                ⬇ Download Pack
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}