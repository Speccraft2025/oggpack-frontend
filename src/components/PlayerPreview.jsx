import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Play, Pause, Heart, Music, ChevronDown, ChevronUp } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const PlayerPreview = ({ user }) => {
  const { id } = useParams();
  const audioRef = useRef(null);
  const [oggpack, setOggpack] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showMetadata, setShowMetadata] = useState(true);
  const [metadata, setMetadata] = useState(null);

  useEffect(() => {
    if (id) {
      fetchOggpack();
    } else {
      // Load most recent oggpack
      fetchRecentOggpack();
    }
  }, [id]);

  const fetchOggpack = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/creator/oggpacks/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOggpack(response.data.oggpack);
      if (response.data.oggpack.metadata_json) {
        setMetadata(JSON.parse(response.data.oggpack.metadata_json));
      }
    } catch (err) {
      console.error('Failed to fetch oggpack:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentOggpack = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/creator/oggpacks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.oggpacks && response.data.oggpacks.length > 0) {
        const recent = response.data.oggpacks[0];
        setOggpack(recent);
        if (recent.metadata_json) {
          setMetadata(JSON.parse(recent.metadata_json));
        }
      }
    } catch (err) {
      console.error('Failed to fetch oggpacks:', err);
    } finally {
      setLoading(false);
    }
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

  const handleSeek = (e) => {
    const seekTime = (e.target.value / 100) * duration;
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 relative z-10">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-purple-500/20 p-8 text-center">
          <p className="text-gray-300">Loading player...</p>
        </div>
      </div>
    );
  }

  if (!oggpack) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 relative z-10">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-purple-500/20 p-8 text-center">
          <p className="text-gray-300">No oggpack found. Create one first!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 relative z-10">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-purple-500/20 overflow-hidden shadow-2xl">
        {/* Cover Art - Responsive Aspect Ratio */}
        <div className="relative bg-gradient-to-br from-purple-900 to-pink-900 aspect-video sm:aspect-[2/1]">
          {oggpack.cover_path ? (
            <img
              src={`${API_URL}${oggpack.cover_path}`}
              alt={oggpack.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Music className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 text-white/30" />
            </div>
          )}
          
          {/* Title Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1 sm:mb-2 line-clamp-2">
              {oggpack.title}
            </h2>
            <p className="text-sm sm:text-base text-gray-300">by {user.display_name || user.username}</p>
          </div>
        </div>

        {/* Player Controls - Touch Optimized */}
        <div className="p-4 sm:p-6 lg:p-8 bg-black/40">
          {/* Play Button + Progress */}
          <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
            <button
              onClick={togglePlay}
              className="flex-shrink-0 flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-purple-500/50 active:scale-95"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              ) : (
                <Play className="w-6 h-6 sm:w-8 sm:h-8 text-white ml-1" />
              )}
            </button>

            {/* Progress Bar - Touch Friendly */}
            <div className="flex-1">
              <input
                type="range"
                min="0"
                max="100"
                value={duration ? (currentTime / duration) * 100 : 0}
                onChange={handleSeek}
                className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, rgb(147, 51, 234) 0%, rgb(219, 39, 119) ${duration ? (currentTime / duration) * 100 : 0}%, rgba(255,255,255,0.1) ${duration ? (currentTime / duration) * 100 : 0}%)`
                }}
              />
              <div className="flex justify-between mt-2 text-xs sm:text-sm text-gray-400">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Mock Upvote */}
            <div className="flex-shrink-0 flex items-center space-x-2 sm:space-x-3">
              <button className="p-2 sm:p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-all active:scale-95">
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-pink-400" />
              </button>
              <span className="text-sm sm:text-base text-gray-300 font-medium">42</span>
            </div>
          </div>

          {/* Description */}
          {oggpack.description && (
            <div className="mb-4 p-3 sm:p-4 bg-white/5 rounded-lg">
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                {oggpack.description}
              </p>
            </div>
          )}

          {/* Metadata Toggle - Mobile Friendly */}
          <button
            onClick={() => setShowMetadata(!showMetadata)}
            className="w-full flex items-center justify-between py-3 px-4 bg-white/5 rounded-lg text-gray-300 hover:bg-white/10 transition-all mb-4 text-sm sm:text-base"
          >
            <span className="font-medium">{showMetadata ? 'Hide' : 'Show'} Track Info</span>
            {showMetadata ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>

          {/* Metadata Grid - Stack on Mobile */}
          {showMetadata && metadata && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
              {metadata.genre && (
                <div className="bg-white/5 p-3 sm:p-4 rounded-lg">
                  <p className="text-gray-400 text-xs sm:text-sm mb-1">Genre</p>
                  <p className="text-white font-medium text-sm sm:text-base">{metadata.genre}</p>
                </div>
              )}
              {metadata.bpm && (
                <div className="bg-white/5 p-3 sm:p-4 rounded-lg">
                  <p className="text-gray-400 text-xs sm:text-sm mb-1">BPM</p>
                  <p className="text-white font-medium text-sm sm:text-base">{metadata.bpm}</p>
                </div>
              )}
              {metadata.lyrics && (
                <div className="bg-white/5 p-3 sm:p-4 rounded-lg sm:col-span-2">
                  <p className="text-gray-400 text-xs sm:text-sm mb-2">Lyrics</p>
                  <pre className="text-white text-xs sm:text-sm whitespace-pre-wrap font-mono leading-relaxed max-h-60 overflow-y-auto">
                    {metadata.lyrics}
                  </pre>
                </div>
              )}
              {metadata.credits && (
                <div className="bg-white/5 p-3 sm:p-4 rounded-lg sm:col-span-2">
                  <p className="text-gray-400 text-xs sm:text-sm mb-2">Credits</p>
                  <p className="text-white text-xs sm:text-sm whitespace-pre-wrap">{metadata.credits}</p>
                </div>
              )}
            </div>
          )}

          {/* Hidden Audio Element */}
          <audio
            ref={audioRef}
            src={`${API_URL}${oggpack.file_path}`}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => setIsPlaying(false)}
          />
        </div>
      </div>

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          background: white;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }
        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: white;
          border-radius: 50%;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }
        @media (max-width: 640px) {
          .slider::-webkit-slider-thumb {
            width: 20px;
            height: 20px;
          }
          .slider::-moz-range-thumb {
            width: 20px;
            height: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default PlayerPreview;