import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Upload, Music, CheckCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const CreatorMode = ({ user }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    genre: '',
    bpm: '',
    lyrics: '',
    credits: ''
  });
  const [audioFile, setAudioFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [createdOggpackId, setCreatedOggpackId] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (e.target.name === 'audio') {
        setAudioFile(file);
      } else if (e.target.name === 'cover') {
        setCoverFile(file);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!audioFile) {
      setError('Please select an audio file');
      return;
    }

    setUploading(true);
    setError('');
    setProgress(0);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('file', audioFile);
      if (coverFile) formDataToSend.append('cover', coverFile);
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      
      const metadata = {
        genre: formData.genre,
        bpm: formData.bpm,
        lyrics: formData.lyrics,
        credits: formData.credits
      };
      formDataToSend.append('metadata', JSON.stringify(metadata));

      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/creator/upload`,
        formDataToSend,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percentCompleted);
          }
        }
      );

      setSuccess(true);
      setCreatedOggpackId(response.data.oggpack.id);
      
      // Reset form
      setTimeout(() => {
        setFormData({
          title: '',
          description: '',
          genre: '',
          bpm: '',
          lyrics: '',
          credits: ''
        });
        setAudioFile(null);
        setCoverFile(null);
        setProgress(0);
      }, 2000);
      
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed. Please try again.');
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 relative z-10">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-purple-500/20 p-4 sm:p-6 lg:p-8 shadow-2xl">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Create New OGGPack
          </h2>
          <p className="text-gray-400 text-sm sm:text-base">
            Upload your audio and let FFmpeg optimize it
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-green-300 font-medium mb-2">OGGPack created successfully!</p>
              <button
                onClick={() => navigate(`/preview/${createdOggpackId}`)}
                className="text-sm text-green-400 hover:text-green-300 underline"
              >
                Go to Player Preview →
              </button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          {/* Audio File Upload - Touch Friendly */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Audio File (MP3/OGG/WAV)
            </label>
            <div className="relative">
              <input
                type="file"
                name="audio"
                accept=".mp3,.ogg,.wav"
                onChange={handleFileChange}
                className="hidden"
                id="audio-upload"
                disabled={uploading}
              />
              <label
                htmlFor="audio-upload"
                className={`block border-2 border-dashed rounded-xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
                  audioFile
                    ? 'border-purple-500/50 bg-purple-500/10'
                    : 'border-purple-500/30 hover:border-purple-500/50 bg-white/5'
                } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {audioFile ? (
                  <Music className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-purple-400" />
                ) : (
                  <Upload className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-purple-400" />
                )}
                <p className="text-gray-300 mb-1 text-sm sm:text-base">
                  {audioFile ? audioFile.name : 'Tap to upload or drag & drop'}
                </p>
                <p className="text-gray-500 text-xs sm:text-sm">
                  {audioFile
                    ? `${(audioFile.size / 1024 / 1024).toFixed(2)} MB`
                    : 'MP3, OGG, WAV up to 50MB'}
                </p>
              </label>
            </div>
          </div>

          {/* Cover Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Cover Image (Optional)
            </label>
            <div className="relative">
              <input
                type="file"
                name="cover"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="cover-upload"
                disabled={uploading}
              />
              <label
                htmlFor="cover-upload"
                className={`block border-2 border-dashed rounded-xl p-4 sm:p-6 text-center cursor-pointer transition-all ${
                  coverFile
                    ? 'border-purple-500/50 bg-purple-500/10'
                    : 'border-purple-500/30 hover:border-purple-500/50 bg-white/5'
                } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Upload className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 text-purple-400" />
                <p className="text-gray-300 text-sm">
                  {coverFile ? coverFile.name : 'Add cover art'}
                </p>
              </label>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/5 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-base"
              placeholder="Track title"
              required
              disabled={uploading}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/5 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[100px] text-base"
              placeholder="Tell us about your track..."
              disabled={uploading}
            />
          </div>

          {/* Metadata Grid - Stack on Mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Genre
              </label>
              <input
                type="text"
                name="genre"
                value={formData.genre}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/5 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-base"
                placeholder="e.g. Electronic"
                disabled={uploading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                BPM
              </label>
              <input
                type="number"
                name="bpm"
                value={formData.bpm}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/5 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-base"
                placeholder="120"
                disabled={uploading}
              />
            </div>
          </div>

          {/* Lyrics */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Lyrics (Optional)
            </label>
            <textarea
              name="lyrics"
              value={formData.lyrics}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/5 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[120px] font-mono text-sm"
              placeholder="Verse 1:&#10;..."
              disabled={uploading}
            />
          </div>

          {/* Credits */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Credits (Optional)
            </label>
            <textarea
              name="credits"
              value={formData.credits}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/5 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[80px] text-base"
              placeholder="Produced by..., Mixed by..."
              disabled={uploading}
            />
          </div>

          {/* Progress Bar */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-300">
                <span>
                  {progress < 30 ? 'Uploading...' : progress < 70 ? 'Converting to OGG...' : 'Creating OGGPack...'}
                </span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Submit Button - Full Width */}
          <button
            type="submit"
            disabled={uploading || !audioFile}
            className="w-full py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed text-base sm:text-lg"
          >
            {uploading ? 'Processing...' : 'Create OGGPack'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreatorMode;