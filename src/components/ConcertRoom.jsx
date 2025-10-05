import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Play, Pause, Heart, Send, X, Users, Music, Flame } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const WS_URL = API_URL.replace('http', 'ws').replace('https', 'wss');

const ConcertRoom = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const audioRef = useRef(null);
  const messagesEndRef = useRef(null);
  const wsRef = useRef(null);

  const [concert, setConcert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [viewers, setViewers] = useState(1);
  const [reactions, setReactions] = useState({ heart: 0, fire: 0 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [setlist, setSetlist] = useState([]);

  useEffect(() => {
    fetchConcert();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConcert = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/social/concerts/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConcert(response.data.concert);
      setSetlist(response.data.setlist || []);
      connectWebSocket();
    } catch (err) {
      console.error('Failed to fetch concert:', err);
      alert('Concert not found');
      navigate('/social');
    } finally {
      setLoading(false);
    }
  };

  const connectWebSocket = () => {
    const ws = new WebSocket(`${WS_URL}/api/concerts/${id}/ws`);
    
    ws.onopen = () => {
      setConnected(true);
      ws.send(JSON.stringify({
        type: 'join',
        payload: {
          userId: user.id,
          displayName: user.display_name || user.username
        }
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'chat':
          setMessages(prev => [...prev, {
            id: Date.now(),
            user_id: data.payload.userId,
            display_name: data.payload.displayName,
            message: data.payload.message,
            timestamp: new Date().toISOString()
          }]);
          break;
        case 'reaction':
          setReactions(prev => ({
            ...prev,
            [data.payload.reaction_type]: (prev[data.payload.reaction_type] || 0) + 1
          }));
          setTimeout(() => {
            setReactions(prev => ({
              ...prev,
              [data.payload.reaction_type]: Math.max(0, prev[data.payload.reaction_type] - 1)
            }));
          }, 3000);
          break;
        case 'join':
          setMessages(prev => [...prev, {
            id: Date.now(),
            user_id: 'system',
            message: `${data.payload.displayName} joined the concert`,
            timestamp: new Date().toISOString()
          }]);
          setViewers(prev => prev + 1);
          break;
      }
    };

    ws.onclose = () => {
      setConnected(false);
    };

    wsRef.current = ws;
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !connected) return;

    wsRef.current.send(JSON.stringify({
      type: 'chat',
      payload: {
        userId: user.id,
        displayName: user.display_name || user.username,
        message: newMessage
      }
    }));

    setNewMessage('');
  };

  const sendReaction = (reactionType) => {
    if (!connected) return;

    wsRef.current.send(JSON.stringify({
      type: 'reaction',
      payload: {
        userId: user.id,
        reaction_type: reactionType
      }
    }));
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <p className="text-white text-lg">Loading concert...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative z-10 pb-20 sm:pb-0">
      {/* Mobile: Close Button */}
      <button
        onClick={() => navigate('/social')}
        className="fixed top-4 right-4 z-50 sm:hidden w-10 h-10 bg-black/80 backdrop-blur-lg rounded-full flex items-center justify-center text-white border border-white/20 hover:bg-black/90"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Desktop: Header */}
      <div className="hidden sm:block bg-black/40 backdrop-blur-lg border-b border-pink-500/20 py-4">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">{concert.title}</h1>
            <p className="text-gray-400 text-sm">{concert.description}</p>
          </div>
          <button
            onClick={() => navigate('/social')}
            className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all"
          >
            Leave Concert
          </button>
        </div>
      </div>

      {/* Main Content - Stack on Mobile, Side by Side on Desktop */}
      <div className="h-screen sm:h-[calc(100vh-80px)] flex flex-col sm:flex-row">
        {/* Left: Player + Setlist (Mobile: Collapsed, Desktop: Full) */}
        <div className="sm:flex-1 sm:border-r sm:border-purple-500/20 flex flex-col">
          {/* Mobile Header */}
          <div className="sm:hidden bg-black/40 backdrop-blur-lg border-b border-pink-500/20 p-4">
            <h1 className="text-xl font-bold text-white truncate">{concert.title}</h1>
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-300">
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>{viewers}</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-red-400 font-medium">LIVE</span>
              </div>
            </div>
          </div>

          {/* Player Section */}
          <div className="bg-black/20 p-4 sm:p-6">
            {setlist.length > 0 && setlist[currentTrackIndex] && (
              <>
                <div className="bg-gradient-to-br from-purple-900 to-pink-900 rounded-xl p-6 sm:p-8 mb-4 sm:mb-6 aspect-video sm:aspect-square flex items-center justify-center relative overflow-hidden">
                  <Music className="w-16 h-16 sm:w-24 sm:h-24 text-white/30 absolute" />
                  <div className="relative z-10 text-center">
                    <h3 className="text-white font-bold text-lg sm:text-2xl mb-2">
                      {setlist[currentTrackIndex].title}
                    </h3>
                    <p className="text-gray-300 text-sm">
                      Track {currentTrackIndex + 1} of {setlist.length}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-center space-x-4 mb-4">
                  <button
                    onClick={togglePlay}
                    className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg active:scale-95"
                  >
                    {isPlaying ? (
                      <Pause className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                    ) : (
                      <Play className="w-7 h-7 sm:w-8 sm:h-8 text-white ml-1" />
                    )}
                  </button>

                  <button
                    onClick={() => sendReaction('heart')}
                    className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-pink-500/20 rounded-full hover:bg-pink-500/30 transition-all active:scale-95"
                  >
                    <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-pink-400" />
                  </button>

                  <button
                    onClick={() => sendReaction('fire')}
                    className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-orange-500/20 rounded-full hover:bg-orange-500/30 transition-all active:scale-95"
                  >
                    <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400" />
                  </button>
                </div>

                <audio
                  ref={audioRef}
                  src={setlist[currentTrackIndex].file_path ? `${API_URL}${setlist[currentTrackIndex].file_path}` : ''}
                  onEnded={() => {
                    if (currentTrackIndex < setlist.length - 1) {
                      setCurrentTrackIndex(currentTrackIndex + 1);
                      setIsPlaying(true);
                    } else {
                      setIsPlaying(false);
                    }
                  }}
                />
              </>
            )}
          </div>

          {/* Setlist - Desktop Only */}
          <div className="hidden sm:block flex-1 overflow-y-auto p-6 bg-black/10">
            <h3 className="text-white font-bold mb-4">Setlist</h3>
            <div className="space-y-2">
              {setlist.map((track, index) => (
                <div
                  key={track.id}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    index === currentTrackIndex
                      ? 'bg-purple-500/30 border border-purple-500/50'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                  onClick={() => setCurrentTrackIndex(index)}
                >
                  <p className="text-white font-medium text-sm">{track.title}</p>
                  <p className="text-gray-400 text-xs">{track.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Chat (Mobile: Bottom Sheet, Desktop: Sidebar) */}
        <div className="sm:w-96 flex flex-col bg-black/40 backdrop-blur-lg border-t sm:border-t-0 border-purple-500/20 fixed sm:relative bottom-0 left-0 right-0 h-96 sm:h-auto">
          {/* Desktop Stats */}
          <div className="hidden sm:flex items-center justify-between p-4 border-b border-purple-500/20">
            <div className="flex items-center space-x-2 text-gray-300">
              <Users className="w-4 h-4" />
              <span className="text-sm">{viewers} watching</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-red-400 text-sm font-medium">LIVE</span>
            </div>
          </div>

          {/* Reactions Overlay */}
          {(reactions.heart > 0 || reactions.fire > 0) && (
            <div className="absolute top-0 left-0 right-0 p-4 pointer-events-none z-10 flex justify-center space-x-2">
              {reactions.heart > 0 && (
                <div className="flex items-center space-x-1 bg-pink-500/30 backdrop-blur-sm px-3 py-1 rounded-full">
                  <Heart className="w-4 h-4 text-pink-400" />
                  <span className="text-white font-bold">{reactions.heart}</span>
                </div>
              )}
              {reactions.fire > 0 && (
                <div className="flex items-center space-x-1 bg-orange-500/30 backdrop-blur-sm px-3 py-1 rounded-full">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span className="text-white font-bold">{reactions.fire}</span>
                </div>
              )}
            </div>
          )}

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <p className="text-gray-500 text-center text-sm">Chat is empty. Say hi!</p>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={msg.user_id === 'system' ? 'text-center' : ''}
                >
                  {msg.user_id === 'system' ? (
                    <p className="text-gray-500 text-xs italic">{msg.message}</p>
                  ) : (
                    <div className="bg-white/5 p-3 rounded-lg">
                      <div className="flex items-center space-x-2 mb-1">
                        <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-xs">
                          {msg.display_name?.charAt(0)?.toUpperCase()}
                        </div>
                        <span className="text-sm font-semibold text-purple-300">
                          {msg.display_name}
                        </span>
                      </div>
                      <p className="text-sm text-gray-200 ml-8 break-words">{msg.message}</p>
                    </div>
                  )}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-purple-500/20 bg-black/60">
            <form onSubmit={sendMessage} className="flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={connected ? "Send a message..." : "Connecting..."}
                disabled={!connected}
                className="flex-1 px-3 py-2 sm:px-4 sm:py-3 bg-white/5 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
                maxLength={500}
              />
              <button
                type="submit"
                disabled={!connected || !newMessage.trim()}
                className="px-4 py-2 sm:px-6 sm:py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
              >
                <Send className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConcertRoom;