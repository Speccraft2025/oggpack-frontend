import React, { useState, useRef } from 'react';
import axios from 'axios';

function FeedItem({ post, token, currentUser, onUpdate }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [voteCount, setVoteCount] = useState(post.vote_count || 0);
  const [hasVoted, setHasVoted] = useState(false);
  const [showMetadata, setShowMetadata] = useState(false);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleVote = async () => {
    if (hasVoted) return;
    try {
      const { data } = await axios.post('/api/social/posts/' + post.id + '/vote', {}, { headers: { Authorization: 'Bearer ' + token } });
      setVoteCount(data.vote_count);
      setHasVoted(true);
    } catch (err) {
      if (err.response?.data?.error === 'Already voted') {
        setHasVoted(true);
      }
    }
  };

  const loadComments = async () => {
    try {
      const { data } = await axios.get('/api/social/posts/' + post.id + '/comments');
      setComments(data.comments || []);
      setShowComments(true);
    } catch (err) {}
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const { data } = await axios.post('/api/social/posts/' + post.id + '/comments', { body: newComment }, { headers: { Authorization: 'Bearer ' + token } });
      setComments(data.comments || []);
      setNewComment('');
    } catch (err) {}
  };

  const metadata = post.metadata_json ? JSON.parse(post.metadata_json) : {};

  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center font-bold">
            {post.display_name[0].toUpperCase()}
          </div>
          <div>
            <p className="font-semibold">{post.display_name}</p>
            <p className="text-gray-400 text-sm">@{post.username}</p>
          </div>
        </div>
        {post.caption && <p className="mt-3 text-gray-300">{post.caption}</p>}
      </div>
      {post.cover_path && <img src={'/' + post.cover_path} alt="Cover" className="w-full h-64 object-cover" />}
      <div className="p-4">
        <h3 className="text-xl font-bold mb-2">{post.oggpack_title}</h3>
        <div className="bg-gray-900 rounded-lg p-3 mb-4">
          <audio ref={audioRef} src={'/' + post.file_path} onEnded={() => setIsPlaying(false)} className="w-full mb-2" controls />
          <button onClick={togglePlay} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-semibold">
            {isPlaying ? '⏸ Pause' : '▶ Play'}
          </button>
        </div>
        {(metadata.lyrics || metadata.credits) && (
          <>
            <button onClick={() => setShowMetadata(!showMetadata)} className="text-purple-400 hover:text-purple-300 text-sm mb-2">
              {showMetadata ? '▼ Hide' : '▶ Show'} Metadata
            </button>
            {showMetadata && (
              <div className="bg-gray-900 rounded-lg p-3 mb-4 text-sm space-y-2">
                {metadata.lyrics && (
                  <div>
                    <p className="font-semibold mb-1">Lyrics:</p>
                    <pre className="text-gray-300 whitespace-pre-wrap text-xs">{metadata.lyrics}</pre>
                  </div>
                )}
                {metadata.credits && (
                  <div>
                    <p className="font-semibold mb-1">Credits:</p>
                    <p className="text-gray-300 text-xs">{metadata.credits}</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
        <div className="flex items-center space-x-6 text-gray-400">
          <button onClick={handleVote} disabled={hasVoted} className={(hasVoted ? 'text-purple-400' : 'hover:text-purple-400') + ' flex items-center space-x-2 disabled:cursor-not-allowed'}>
            <span>{hasVoted ? '👍' : '👍'}</span>
            <span>{voteCount}</span>
          </button>
          <button onClick={() => showComments ? setShowComments(false) : loadComments()} className="flex items-center space-x-2 hover:text-purple-400">
            <span>💬</span>
            <span>{post.comment_count || 0}</span>
          </button>
        </div>
        {showComments && (
          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {comments.length === 0 ? (
                <p className="text-gray-500 text-sm">No comments yet</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="bg-gray-900 p-3 rounded-lg">
                    <p className="font-semibold text-sm">{comment.display_name}</p>
                    <p className="text-gray-300 text-sm">{comment.body}</p>
                  </div>
                ))
              )}
            </div>
            <form onSubmit={handleAddComment} className="flex space-x-2">
              <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Add a comment..." className="flex-1 text-sm" />
              <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm">Post</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default FeedItem;