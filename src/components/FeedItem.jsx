import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Play, Pause, Heart, MessageCircle, Radio, ChevronDown, ChevronUp } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const FeedItem = ({ post, user, onUpdate }) => {
  const navigate = useNavigate();
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasVoted, setHasVoted] = useState(post.user_has_voted);
  const [voteCount, setVoteCount] = useState(post.vote_count);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

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

  const handleVote = async () => {
    if (hasVoted) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/api/social/posts/${post.id}/vote`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setHasVoted(true);
      setVoteCount(voteCount + 1);
    } catch (err) {
      console.error('Failed to vote:', err);
    }
  };

  const fetchComments = async () => {
    if (comments.length > 0) {
      setShowComments(!showComments);
      return;
    }

    setLoadingComments(true);
    setShowComments(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/api/social/posts/${post.id}/comments`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments(response.data.comments || []);
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmittingComment(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/social/posts/${post.id}/comments`,
        { body: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments([...comments, response.data.comment]);
      setNewComment('');
    } catch (err) {
      console.error('Failed to post comment:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-purple-500/20 overflow-hidden shadow-xl">
      {/* Post Header - Mobile Optimized */}
      <div className="p-4 sm:p-6 border-b border-purple-500/20">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm sm:text-base">
              {(post.display_name || post.username)?.charAt(0)?.toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold text-base sm:text-lg truncate">
              {post.display_name || post.username}
            </h3>
            <p className="text-gray-400 text-xs sm:text-sm">
              {new Date(post.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>

        {post.caption && (
          <p className="text-gray-300 mt-3 text-sm sm:text-base leading-relaxed">{post.caption}</p>
        )}
      </div>

      {/* Concert Badge */}
      {post.is_concert && (
        <div className="px-4 sm:px-6 py-3 bg-gradient-to-r from-pink-600/20 to-red-600/20 border-b border-pink-500/20">
          <div className="flex items-center space-x-2">
            <Radio className="w-4 h-4 sm:w-5 sm:h-5 text-pink-400" />
            <span className="text-pink-300 font-semibold text-sm sm:text-base">Live Concert Event</span>
          </div>
          {post.concert_start_time && (
            <p className="text-pink-200 text-xs sm:text-sm mt-1">
              {new Date(post.concert_start_time).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          )}
        </div>
      )}

      {/* Track Info */}
      <div className="p-4 sm:p-6 bg-black/20">
        <h4 className="text-white font-bold text-lg sm:text-xl mb-2">{post.oggpack_title}</h4>
        {post.oggpack_description && (
          <p className="text-gray-400 text-sm sm:text-base mb-4 line-clamp-2">
            {post.oggpack_description}
          </p>
        )}

        {/* Audio Player - Touch Friendly */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <button
            onClick={togglePlay}
            className="flex-shrink-0 flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg active:scale-95"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            ) : (
              <Play className="w-5 h-5 sm:w-6 sm:h-6 text-white ml-0.5" />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <div className="h-1.5 sm:h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-600 to-pink-600 w-0" />
            </div>
          </div>
        </div>

        <audio
          ref={audioRef}
          src={post.oggpack_file_path ? `${API_URL}${post.oggpack_file_path}` : ''}
          onEnded={() => setIsPlaying(false)}
        />
      </div>

      {/* Actions - Mobile Optimized */}
      <div className="p-4 sm:p-6 border-t border-purple-500/20">
        <div className="flex items-center justify-between">
          {/* Vote Button */}
          <button
            onClick={handleVote}
            disabled={hasVoted}
            className={`flex items-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all text-sm sm:text-base ${
              hasVoted
                ? 'bg-pink-500/30 text-pink-300 cursor-not-allowed'
                : 'bg-white/10 text-gray-300 hover:bg-pink-500/20 hover:text-pink-300 active:scale-95'
            }`}
          >
            <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${hasVoted ? 'fill-current' : ''}`} />
            <span>{voteCount}</span>
          </button>

          {/* Comments Button */}
          <button
            onClick={fetchComments}
            className="flex items-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all bg-white/10 text-gray-300 hover:bg-white/20 active:scale-95 text-sm sm:text-base"
          >
            <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>{post.comment_count || 0}</span>
            {showComments ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {/* Concert Join Button */}
          {post.is_concert && post.concert_id && (
            <button
              onClick={() => navigate(`/concert/${post.concert_id}`)}
              className="flex items-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium bg-gradient-to-r from-pink-600 to-red-600 text-white hover:from-pink-700 hover:to-red-700 transition-all shadow-lg active:scale-95 text-sm sm:text-base"
            >
              <Radio className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Join Concert</span>
              <span className="sm:hidden">Join</span>
            </button>
          )}
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-purple-500/20 bg-black/20">
          <div className="p-4 sm:p-6 max-h-96 overflow-y-auto">
            {loadingComments ? (
              <p className="text-gray-400 text-center text-sm">Loading comments...</p>
            ) : comments.length === 0 ? (
              <p className="text-gray-400 text-center text-sm">No comments yet. Be the first!</p>
            ) : (
              <div className="space-y-3 sm:space-y-4 mb-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="bg-white/5 p-3 sm:p-4 rounded-lg">
                    <div className="flex items-start space-x-2 sm:space-x-3">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs sm:text-sm font-bold">
                          {(comment.display_name || comment.username)?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-purple-300 font-semibold text-xs sm:text-sm">
                          {comment.display_name || comment.username}
                        </p>
                        <p className="text-gray-300 text-sm sm:text-base mt-1 break-words">{comment.body}</p>
                        <p className="text-gray-500 text-xs mt-1">
                          {new Date(comment.created_at).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Comment Input */}
            <form onSubmit={handleCommentSubmit} className="flex space-x-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-white/5 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
                disabled={submittingComment}
              />
              <button
                type="submit"
                disabled={submittingComment || !newComment.trim()}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all text-sm sm:text-base"
              >
                {submittingComment ? '...' : 'Post'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedItem;