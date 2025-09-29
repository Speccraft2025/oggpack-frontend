import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';

function ConcertRoom({ token, user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const wsRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [concert, setConcert] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [reactionCount, setReactionCount] = useState(0);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    fetchConcert();
    connectWebSocket();
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConcert = async () => {
    try {
      const { data } = await axios.get(API_URL + '/api/concerts/' + id);
      setConcert(data.concert);
      setMessages(data.chats || []);
      setReactionCount(data.reaction_count || 0);
    } catch (err) {
      console.error('Fetch concert error:', err);
    }
  };

  const connectWebSocket = () => {
    const wsUrl = API_URL.replace('https://', 'wss://').replace('http://', 'ws://');
    const ws = new WebSocket(wsUrl + '/api/concerts/' + id + '/ws');

    ws.onopen = () => {
      console.log('WebSocket connected');
      setConnected(true);
      ws.send(JSON.stringify({ type: 'join', payload: { userId: user.id, displayName: user.display_name } }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'history') {
        setMessages(data.payload.chats || []);
      } else if (data.type === 'join') {
        setMessages(prev => [...prev, { id: Date.now(), user_id: 'system', display_name: 'System', message: data.payload.displayName + ' joined the concert', created_at: data.payload.timestamp }]);
      } else if (data.type === 'chat') {
        setMessages(prev => [...prev, data.payload]);
      } else if (data.type === 'reaction') {
        setReactionCount(data.payload.total_count);
        setMessages(prev => [...prev, { id: Date.now(), user_id: 'system', display_name: 'System', message: data.payload.displayName + ' reacted with ' + data.payload.reaction_type, created_at: data.payload.timestamp }]);
      } else if (data.type === 'leave') {
        setMessages(prev => [...prev, { id: Date.now(), user_id: 'system', display_name: 'System', message: data.payload.displayName + ' left the concert', created_at: new Date().toISOString() }]);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setConnected(false);
    };

    ws.onerror = (error) => console.error('WebSocket error:', error);
    wsRef.current = ws;
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !wsRef.current || !connected) return;
    wsRef.current.send(JSON.stringify({ type: 'chat', payload: { userId: user.id, message: newMessage.trim() } }));
    setNewMessage('');
  };

  const sendReaction = () => {
    if (!wsRef.current || !connected) return;
    wsRef.current.send(JSON.stringify({ type: 'reaction', payload: { userId: user.id, reaction_type: 'fire' } }));
  };

  if (!concert) return <div className="max-w-4xl mx-auto p-6 text-center"><div className="animate-pulse">Loading concert...</div></div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <button onClick={() => navigate('/social')} className="mb-6 text-gray-400 hover:text-white">← Back to Feed</button>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gradient-to-r from-pink-900 to-purple-900 p-6 rounded-xl border border-pink-500">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{concert.title}</h1>
                <p className="text-gray-300">Hosted by {concert.display_name}</p>
              </div>
              <div className={'px-3 py-1 rounded-full text-sm ' + (connected ? 'bg-green-500' : 'bg-red-500')}>
                {connected ? '🟢 Live' : '🔴 Disconnected'}
              </div>
            </div>
            {concert.description && <p className="text-gray-200">{concert.description}</p>}
          </div>
          <div className="bg-gray-800 p-6 rounded-xl">
            <div className="h-48 bg-gradient-to-br from-purple-900 to-pink-900 rounded-lg flex items-center justify-center mb-4">
              <div className="text-6xl">🎵</div>
            </div>
            <p className="text-center text-gray-400 mb-4">Audio player would display setlist here</p>
            <div className="flex items-center justify-center space-x-6">
              <button onClick={sendReaction} disabled={!connected} className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-3 rounded-full font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed">
                🔥 React
              </button>
              <div className="text-2xl font-bold">{reactionCount} 🔥</div>
            </div>
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="bg-gray-800 rounded-xl flex flex-col h-[600px]">
            <div className="p-4 border-b border-gray-700">
              <h2 className="text-xl font-bold">Live Chat</h2>
              <p className="text-sm text-gray-400">{messages.length} messages</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <p className="text-gray-500 text-center text-sm">No messages yet. Start the conversation!</p>
              ) : (
                messages.map((msg, index) => (
                  <div key={msg.id || index} className={msg.user_id === 'system' ? 'text-center text-gray-500 text-sm italic' : 'bg-gray-900 p-3 rounded-lg'}>
                    {msg.user_id !== 'system' && (
                      <>
                        <p className="font-semibold text-sm text-purple-400">{msg.display_name || msg.username}</p>
                        <p className="text-gray-300 text-sm break-words">{msg.message}</p>
                      </>
                    )}
                    {msg.user_id === 'system' && <p>{msg.message}</p>}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={sendMessage} className="p-4 border-t border-gray-700">
              <div className="flex space-x-2">
                <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder={connected ? "Send a message..." : "Connecting..."} disabled={!connected} className="flex-1 text-sm" maxLength={500} />
                <button type="submit" disabled={!connected || !newMessage.trim()} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConcertRoom;