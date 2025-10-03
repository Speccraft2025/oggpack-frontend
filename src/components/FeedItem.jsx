import React, { useState } from 'react';
import axios from 'axios';
import API_URL from '../api';

function FeedItem({ post, token, onUpdate }) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [voteCount, setVoteCount] = useState(post.vote_count || 0);
  const [hasVoted, setHasVoted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleVote = async () => {
    if (hasVoted) return;
    try {
      const { data } = await axios.post(`${API_URL}/api/social/posts/${post.id}/vote`, {}, { headers: { Authorization: 'Bearer ' + token } });
      setVoteCount(data.vote_count);
      setHasVoted(true);
    } catch (err) {
      console.error('Vote failed:', err);
    }
  };

  const loadComments = async () => {
    if (comments.length > 0) {
      setShowComments(!showComments);
      return;
    }
    try {
      const { data } = await axios.get(`${API_URL}/api/social/posts/${post.id}/comments`);
      setComments(data.comments || []);
      setShowComments(true);
    } catch (err) {
      console.error('Failed to load comments:', err);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const { data } = await axios.post(`${API_URL}/api/social/posts/${post.id}/comments`, { body: newComment }, { headers: { Authorization: 'Bearer ' + token } });
      setComments([...comments, data.comment]);
      setNewComment('');
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
          {post.username?.[0]?.toUpperCase() || 'U'}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white">{post.display_name || post.username}</h3>
          <p className="text-sm text-gray-400">{new Date(post.created_at).toLocaleDateString()}</p>
        </div>
      </div>

      {post.caption && (
        <p className="text-gray-300 mb-4">{post.caption}</p>
      )}

      {post.oggpack_title && (
        <div className="bg-gray-900 p-4 rounded-lg mb-4">
          <h4 className="text-white font-bold mb-2">{post.oggpack_title}</h4>
          {post.oggpack_description && (
            <p className="text-gray-400 text-sm mb-3">{post.oggpack_description}</p>
          )}
          {post.file_path && (
            <audio 
              controls 
              className="w-full"
              src={`${API_URL}${post.file_path}`}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            >
              Your browser does not support audio playback.
            </audio>
          )}
        </div>
      )}

      <div className="flex items-center gap-6 pt-4 border-t border-gray-700">
        <button 
          onClick={handleVote}
          disabled={hasVoted}
          className={`flex items-center gap-2 ${hasVoted ? 'text-purple-400' : 'text-gray-400 hover:text-purple-400'} transition-colors disabled:cursor-not-allowed`}
        >
          <span className="text-2xl">{hasVoted ? '⬆' : '↑'}</span>
          <span className="font-bold">{voteCount}</span>
        </button>
        
        <button 
          onClick={loadComments}
          className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors"
        >
          <span className="text-xl">💬</span>
          <span>{post.comment_count || 0}</span>
        </button>
      </div>

      {showComments && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
            {comments.length === 0 ? (
              <p className="text-gray-500 text-sm">No comments yet</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="bg-gray-900 p-3 rounded">
                  <p className="text-white font-semibold text-sm">{comment.username}</p>
                  <p className="text-gray-300 text-sm">{comment.body}</p>
                </div>
              ))
            )}
          </div>
          <div className="flex gap-2">
            <input 
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 px-3 py-2 rounded bg-gray-700 border border-gray-600 text-white text-sm"
              onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
            />
            <button 
              onClick={handleAddComment}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded font-semibold text-sm transition-colors"
            >
              Post
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default FeedItem;