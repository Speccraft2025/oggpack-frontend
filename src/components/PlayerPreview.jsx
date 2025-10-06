import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Play, Pause, Heart, Music, Image as ImageIcon, FileText, Film, Download } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const PlayerPreview = ({ user }) => {
  const { id } = useParams();
  const audioRef = useRef(null);
  const [oggpack, setOggpack] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [activeTab, setActiveTab] = useState('player');

  useEffect(() => {
    if (id) {
      fetchOggpack();
    } else {
      fetchRecentOggpack();
    }
  }, [id]);

  const fetchOggpack = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/creator/oggpacks/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const pack = response.data.oggpack;
      setOggpack(pack);
      setCurrentTrack({ path: pack.file_path, name: 'Main Track' });
      if (pack.metadata_json) {
        setMetadata(JSON.parse(pack.metadata_json));
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
        const pack = response.data.oggpacks[0];
        setOggpack(pack);
        setCurrentTrack({ path: pack.file_path, name: 'Main Track' });
        if (pack.metadata_json) {
          setMetadata(JSON.parse(pack.metadata_json));
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

  const playTrack = (track) => {
    setCurrentTrack(track);
    setIsPlaying(false);
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }, 100);
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
      <div className="max-w-6xl mx-auto px-4 py-8 relative z-10">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-purple-500/20 p-8 text-center">
          <p className="text-gray-300">Loading experience...</p>
        </div>
      </div>
    );
  }

  if (!oggpack) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 relative z-10">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-purple-500/20 p-8 text-center">
          <p className="text-gray-300">No experience found. Create one first!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 relative z-10">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">{oggpack.title}</h1>
          <p className="text-gray-400 text-sm sm:text-base">by {user.display_name || user.username}</p>
        </div>
        <a
          href={`${API_URL}/uploads/oggpack/${id}.oggpack`}
          download
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all"
        >
          <Download className="w-5 h-5" />
          <span className="hidden sm:inline">Download</span>
        </a>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-purple-500/20 mb-6 overflow-x-auto">
        <div className="flex space-x-1 p-2">
          <TabButton
            active={activeTab === 'player'}
            onClick={() => setActiveTab('player')}
            icon={<Music className="w-4 h-4" />}
            label="Player"
          />
          {metadata?.alternateTracks?.length > 0 && (
            <TabButton
              active={activeTab === 'tracks'}
              onClick={() => setActiveTab('tracks')}
              icon={<Music className="w-4 h-4" />}
              label={`Versions (${metadata.alternateTracks.length})`}
            />
          )}
          {metadata?.images?.length > 0 && (
            <TabButton
              active={activeTab === 'images'}
              onClick={() => setActiveTab('images')}
              icon={<ImageIcon className="w-4 h-4" />}
              label={`Images (${metadata.images.length})`}
            />
          )}
          {metadata?.videos?.length > 0 && (
            <TabButton
              active={activeTab === 'videos'}
              onClick={() => setActiveTab('videos')}
              icon={<Film className="w-4 h-4" />}
              label={`Videos (${metadata.videos.length})`}
            />
          )}
          {(metadata?.lyrics || metadata?.linerNotes) && (
            <TabButton
              active={activeTab === 'text'}
              onClick={() => setActiveTab('text')}
              icon={<FileText className="w-4 h-4" />}
              label="Lyrics & Notes"
            />
          )}
          {metadata?.pdfs?.length > 0 && (
            <TabButton
              active={activeTab === 'pdfs'}
              onClick={() => setActiveTab('pdfs')}
              icon={<FileText className="w-4 h-4" />}
              label={`PDFs (${metadata.pdfs.length})`}
            />
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-purple-500/20 overflow-hidden shadow-2xl">
        {activeTab === 'player' && (
          <PlayerTab
            oggpack={oggpack}
            metadata={metadata}
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            audioRef={audioRef}
            togglePlay={togglePlay}
            handleSeek={handleSeek}
            handleTimeUpdate={handleTimeUpdate}
            handleLoadedMetadata={handleLoadedMetadata}
            formatTime={formatTime}
          />
        )}

        {activeTab === 'tracks' && metadata?.alternateTracks && (
          <TracksTab
            tracks={metadata.alternateTracks}
            currentTrack={currentTrack}
            playTrack={playTrack}
          />
        )}

        {activeTab === 'images' && metadata?.images && (
          <ImagesTab images={metadata.images} />
        )}

        {activeTab === 'videos' && metadata?.videos && (
          <VideosTab videos={metadata.videos} />
        )}

        {activeTab === 'text' && metadata && (
          <TextTab
            lyrics={metadata.lyrics}
            linerNotes={metadata.linerNotes}
            credits={metadata.credits}
          />
        )}

        {activeTab === 'pdfs' && metadata?.pdfs && (
          <PdfsTab pdfs={metadata.pdfs} />
        )}
      </div>
    </div>
  );
};

// Tab Button Component
const TabButton = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap text-sm sm:text-base ${
      active
        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
        : 'text-gray-300 hover:bg-white/10'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

// Player Tab
const PlayerTab = ({ oggpack, metadata, currentTrack, isPlaying, currentTime, duration, audioRef, togglePlay, handleSeek, handleTimeUpdate, handleLoadedMetadata, formatTime }) => (
  <div>
    {/* Cover Art */}
    <div className="relative bg-gradient-to-br from-purple-900 to-pink-900 aspect-video sm:aspect-[2/1]">
      {oggpack.cover_path ? (
        <img
          src={`${API_URL}${oggpack.cover_path}`}
          alt={oggpack.title}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <Music className="w-16 h-16 sm:w-24 sm:h-24 text-white/30" />
        </div>
      )}
      
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 sm:p-6">
        <p className="text-sm text-purple-300 mb-1">Now Playing:</p>
        <h3 className="text-lg sm:text-xl font-bold text-white">{currentTrack?.name}</h3>
      </div>
    </div>

    {/* Controls */}
    <div className="p-4 sm:p-6 lg:p-8 bg-black/40">
      <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
        <button
          onClick={togglePlay}
          className="flex-shrink-0 flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
        >
          {isPlaying ? (
            <Pause className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          ) : (
            <Play className="w-6 h-6 sm:w-8 sm:h-8 text-white ml-1" />
          )}
        </button>

        <div className="flex-1">
          <input
            type="range"
            min="0"
            max="100"
            value={duration ? (currentTime / duration) * 100 : 0}
            onChange={handleSeek}
            className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between mt-2 text-xs sm:text-sm text-gray-400">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <button className="flex-shrink-0 p-2 sm:p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-all">
          <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-pink-400" />
        </button>
      </div>

      {/* Description */}
      {oggpack.description && (
        <div className="p-3 sm:p-4 bg-white/5 rounded-lg mb-4">
          <p className="text-gray-300 text-sm sm:text-base">{oggpack.description}</p>
        </div>
      )}

      {/* Metadata Grid */}
      {metadata && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {metadata.genre && (
            <div className="bg-white/5 p-3 rounded-lg">
              <p className="text-gray-400 text-xs mb-1">Genre</p>
              <p className="text-white font-medium text-sm">{metadata.genre}</p>
            </div>
          )}
          {metadata.bpm && (
            <div className="bg-white/5 p-3 rounded-lg">
              <p className="text-gray-400 text-xs mb-1">BPM</p>
              <p className="text-white font-medium text-sm">{metadata.bpm}</p>
            </div>
          )}
          {metadata.alternateTracks && (
            <div className="bg-white/5 p-3 rounded-lg">
              <p className="text-gray-400 text-xs mb-1">Versions</p>
              <p className="text-white font-medium text-sm">{metadata.alternateTracks.length + 1}</p>
            </div>
          )}
          {metadata.images && (
            <div className="bg-white/5 p-3 rounded-lg">
              <p className="text-gray-400 text-xs mb-1">Images</p>
              <p className="text-white font-medium text-sm">{metadata.images.length}</p>
            </div>
          )}
        </div>
      )}

      <audio
        ref={audioRef}
        src={currentTrack ? `${API_URL}${currentTrack.path}` : ''}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />
    </div>
  </div>
);

// Tracks Tab
const TracksTab = ({ tracks, currentTrack, playTrack }) => (
  <div className="p-4 sm:p-6">
    <h3 className="text-xl font-bold text-white mb-4">Alternate Versions</h3>
    <div className="space-y-2">
      {tracks.map((track, index) => (
        <button
          key={index}
          onClick={() => playTrack({ path: track.path, name: track.originalName })}
          className={`w-full flex items-center space-x-4 p-4 rounded-lg transition-all ${
            currentTrack?.path === track.path
              ? 'bg-purple-500/30 border border-purple-500/50'
              : 'bg-white/5 hover:bg-white/10'
          }`}
        >
          <Music className="w-5 h-5 text-purple-400 flex-shrink-0" />
          <div className="flex-1 text-left">
            <p className="text-white font-medium">{track.originalName}</p>
          </div>
          {currentTrack?.path === track.path && (
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
          )}
        </button>
      ))}
    </div>
  </div>
);

// Images Tab
const ImagesTab = ({ images }) => (
  <div className="p-4 sm:p-6">
    <h3 className="text-xl font-bold text-white mb-4">Gallery</h3>
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
      {images.map((img, index) => (
        <div key={index} className="group relative aspect-square">
          <img
            src={`${API_URL}${img.path}`}
            alt={img.filename}
            className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => window.open(`${API_URL}${img.path}`, '_blank')}
          />
        </div>
      ))}
    </div>
  </div>
);

// Videos Tab
const VideosTab = ({ videos }) => (
  <div className="p-4 sm:p-6">
    <h3 className="text-xl font-bold text-white mb-4">Videos</h3>
    <div className="space-y-4">
      {videos.map((video, index) => (
        <div key={index} className="bg-white/5 rounded-lg overflow-hidden">
          <video
            controls
            className="w-full"
            src={`${API_URL}${video.path}`}
          >
            Your browser does not support video playback.
          </video>
          <div className="p-3">
            <p className="text-gray-300 text-sm">{video.filename}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Text Tab
const TextTab = ({ lyrics, linerNotes, credits }) => (
  <div className="p-4 sm:p-6 space-y-6">
    {lyrics && (
      <div>
        <h3 className="text-xl font-bold text-white mb-4">Lyrics</h3>
        <div className="bg-white/5 p-4 rounded-lg">
          <pre className="text-gray-300 text-sm whitespace-pre-wrap font-mono leading-relaxed">
            {lyrics}
          </pre>
        </div>
      </div>
    )}

    {linerNotes && (
      <div>
        <h3 className="text-xl font-bold text-white mb-4">Liner Notes</h3>
        <div className="bg-white/5 p-4 rounded-lg">
          <p className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
            {linerNotes}
          </p>
        </div>
      </div>
    )}

    {credits && (
      <div>
        <h3 className="text-xl font-bold text-white mb-4">Credits</h3>
        <div className="bg-white/5 p-4 rounded-lg">
          <p className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
            {credits}
          </p>
        </div>
      </div>
    )}
  </div>
);

// PDFs Tab
const PdfsTab = ({ pdfs }) => (
  <div className="p-4 sm:p-6">
    <h3 className="text-xl font-bold text-white mb-4">Documents</h3>
    <div className="space-y-2">
      {pdfs.map((pdf, index) => (
        <a
          key={index}
          href={`${API_URL}${pdf.path}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-4 p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-all"
        >
          <FileText className="w-6 h-6 text-orange-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-white font-medium">{pdf.originalName}</p>
          </div>
          <Download className="w-5 h-5 text-gray-400" />
        </a>
      ))}
    </div>
  </div>
);

export default PlayerPreview;