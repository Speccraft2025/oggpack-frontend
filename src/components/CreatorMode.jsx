import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Upload, Music, Image as ImageIcon, FileText, Film, Trash2, CheckCircle, Plus } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const CreatorMode = ({ user }) => {
  const navigate = useNavigate();
  
  // Track files
  const [mainTrack, setMainTrack] = useState(null);
  const [alternateTracks, setAlternateTracks] = useState([]);
  
  // Media files
  const [coverImage, setCoverImage] = useState(null);
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [gifs, setGifs] = useState([]);
  const [pdfs, setPdfs] = useState([]);
  
  // Metadata
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    genre: '',
    bpm: '',
    lyrics: '',
    linerNotes: '',
    credits: ''
  });
  
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [createdOggpackId, setCreatedOggpackId] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // File handlers
  const handleMainTrack = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.includes('audio')) {
        setError('Main track must be an audio file (MP3, OGG, WAV)');
        return;
      }
      setMainTrack(file);
      setError('');
    }
  };

  const handleAlternateTrack = (e) => {
    const files = Array.from(e.target.files);
    const audioFiles = files.filter(f => f.type.includes('audio'));
    setAlternateTracks([...alternateTracks, ...audioFiles]);
  };

  const handleCoverImage = (e) => {
    const file = e.target.files[0];
    if (file && file.type.includes('image')) {
      setCoverImage(file);
    }
  };

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    const imageFiles = files.filter(f => f.type.includes('image') && !f.type.includes('gif'));
    setImages([...images, ...imageFiles]);
  };

  const handleGifs = (e) => {
    const files = Array.from(e.target.files);
    const gifFiles = files.filter(f => f.type.includes('gif') || f.name.toLowerCase().endsWith('.gif'));
    setGifs([...gifs, ...gifFiles]);
  };

  const handleVideos = (e) => {
    const files = Array.from(e.target.files);
    const videoFiles = files.filter(f => f.type.includes('video') || f.name.toLowerCase().endsWith('.mp4'));
    setVideos([...videos, ...videoFiles]);
  };

  const handlePdfs = (e) => {
    const files = Array.from(e.target.files);
    const pdfFiles = files.filter(f => f.type.includes('pdf') || f.name.toLowerCase().endsWith('.pdf'));
    setPdfs([...pdfs, ...pdfFiles]);
  };

  // Remove file handlers
  const removeAlternateTrack = (index) => {
    setAlternateTracks(alternateTracks.filter((_, i) => i !== index));
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const removeGif = (index) => {
    setGifs(gifs.filter((_, i) => i !== index));
  };

  const removeVideo = (index) => {
    setVideos(videos.filter((_, i) => i !== index));
  };

  const removePdf = (index) => {
    setPdfs(pdfs.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!mainTrack) {
      setError('Please select a main track');
      return;
    }

    if (!formData.title.trim()) {
      setError('Please enter a title');
      return;
    }

    setUploading(true);
    setError('');
    setProgress(0);

    try {
      const formDataToSend = new FormData();
      
      // Main track
      formDataToSend.append('file', mainTrack);
      
      // Alternate tracks
      alternateTracks.forEach((track, index) => {
        formDataToSend.append(`alternate_track_${index}`, track);
      });
      
      // Cover image
      if (coverImage) {
        formDataToSend.append('cover', coverImage);
      }
      
      // Additional images
      images.forEach((img, index) => {
        formDataToSend.append(`image_${index}`, img);
      });
      
      // GIFs
      gifs.forEach((gif, index) => {
        formDataToSend.append(`gif_${index}`, gif);
      });
      
      // Videos
      videos.forEach((video, index) => {
        formDataToSend.append(`video_${index}`, video);
      });
      
      // PDFs
      pdfs.forEach((pdf, index) => {
        formDataToSend.append(`pdf_${index}`, pdf);
      });
      
      // Basic metadata
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      
      // Extended metadata
      const metadata = {
        genre: formData.genre,
        bpm: formData.bpm,
        lyrics: formData.lyrics,
        linerNotes: formData.linerNotes,
        credits: formData.credits,
        alternateTracksCount: alternateTracks.length,
        imagesCount: images.length,
        gifsCount: gifs.length,
        videosCount: videos.length,
        pdfsCount: pdfs.length
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
      
      // Reset form after 2 seconds
      setTimeout(() => {
        resetForm();
      }, 2000);
      
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed. Please try again.');
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      genre: '',
      bpm: '',
      lyrics: '',
      linerNotes: '',
      credits: ''
    });
    setMainTrack(null);
    setAlternateTracks([]);
    setCoverImage(null);
    setImages([]);
    setGifs([]);
    setVideos([]);
    setPdfs([]);
    setProgress(0);
    setSuccess(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 relative z-10">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-purple-500/20 p-4 sm:p-6 lg:p-8 shadow-2xl">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Create OGG Experience Package
          </h2>
          <p className="text-gray-400 text-sm sm:text-base">
            Upload your complete multimedia experience
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
                Preview Your Experience →
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
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Main Track Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Main Track * (MP3/OGG/WAV)
            </label>
            <input
              type="file"
              accept=".mp3,.ogg,.wav,audio/*"
              onChange={handleMainTrack}
              className="hidden"
              id="main-track"
              disabled={uploading}
            />
            <label
              htmlFor="main-track"
              className={`block border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                mainTrack
                  ? 'border-purple-500/50 bg-purple-500/10'
                  : 'border-purple-500/30 hover:border-purple-500/50 bg-white/5'
              } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Music className="w-10 h-10 mx-auto mb-3 text-purple-400" />
              <p className="text-gray-300 mb-1 text-sm">
                {mainTrack ? mainTrack.name : 'Upload main track'}
              </p>
              <p className="text-gray-500 text-xs">
                {mainTrack ? `${(mainTrack.size / 1024 / 1024).toFixed(2)} MB` : 'Required'}
              </p>
            </label>
          </div>

          {/* Alternate Tracks */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Alternate Versions (Instrumental, Acoustic, Remix, etc.)
            </label>
            <input
              type="file"
              accept=".mp3,.ogg,.wav,audio/*"
              onChange={handleAlternateTrack}
              className="hidden"
              id="alternate-tracks"
              multiple
              disabled={uploading}
            />
            <label
              htmlFor="alternate-tracks"
              className="block border-2 border-dashed border-blue-500/30 hover:border-blue-500/50 rounded-xl p-4 text-center cursor-pointer transition-all bg-white/5"
            >
              <Plus className="w-8 h-8 mx-auto mb-2 text-blue-400" />
              <p className="text-gray-300 text-sm">Add alternate tracks</p>
            </label>
            
            {alternateTracks.length > 0 && (
              <div className="mt-3 space-y-2">
                {alternateTracks.map((track, index) => (
                  <div key={index} className="flex items-center justify-between bg-white/5 p-3 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Music className="w-4 h-4 text-blue-400" />
                      <span className="text-gray-300 text-sm">{track.name}</span>
                      <span className="text-gray-500 text-xs">
                        {(track.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAlternateTrack(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Title & Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/5 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Track title"
                required
                disabled={uploading}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/5 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[80px]"
                placeholder="Describe your experience..."
                disabled={uploading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Genre</label>
              <input
                type="text"
                name="genre"
                value={formData.genre}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/5 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Electronic, Hip-Hop, etc."
                disabled={uploading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">BPM</label>
              <input
                type="number"
                name="bpm"
                value={formData.bpm}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/5 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="120"
                disabled={uploading}
              />
            </div>
          </div>

          {/* Cover Image */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Cover Artwork
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverImage}
              className="hidden"
              id="cover-image"
              disabled={uploading}
            />
            <label
              htmlFor="cover-image"
              className="block border-2 border-dashed border-pink-500/30 hover:border-pink-500/50 rounded-xl p-4 text-center cursor-pointer transition-all bg-white/5"
            >
              {coverImage ? (
                <div className="flex items-center justify-center space-x-3">
                  <ImageIcon className="w-6 h-6 text-pink-400" />
                  <span className="text-gray-300 text-sm">{coverImage.name}</span>
                </div>
              ) : (
                <>
                  <ImageIcon className="w-8 h-8 mx-auto mb-2 text-pink-400" />
                  <p className="text-gray-300 text-sm">Add cover artwork</p>
                </>
              )}
            </label>
          </div>

          {/* Additional Images */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Additional Images (Photos, Artwork, etc.)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImages}
              className="hidden"
              id="images"
              multiple
              disabled={uploading}
            />
            <label
              htmlFor="images"
              className="block border-2 border-dashed border-green-500/30 hover:border-green-500/50 rounded-xl p-4 text-center cursor-pointer transition-all bg-white/5"
            >
              <ImageIcon className="w-8 h-8 mx-auto mb-2 text-green-400" />
              <p className="text-gray-300 text-sm">Add images</p>
            </label>
            
            {images.length > 0 && (
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {images.map((img, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(img)}
                      alt={img.name}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* GIFs */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              GIFs (Animations, Visual Effects)
            </label>
            <input
              type="file"
              accept=".gif,image/gif"
              onChange={handleGifs}
              className="hidden"
              id="gifs"
              multiple
              disabled={uploading}
            />
            <label
              htmlFor="gifs"
              className="block border-2 border-dashed border-yellow-500/30 hover:border-yellow-500/50 rounded-xl p-4 text-center cursor-pointer transition-all bg-white/5"
            >
              <Film className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
              <p className="text-gray-300 text-sm">Add GIFs</p>
            </label>
            
            {gifs.length > 0 && (
              <div className="mt-3 space-y-2">
                {gifs.map((gif, index) => (
                  <div key={index} className="flex items-center justify-between bg-white/5 p-3 rounded-lg">
                    <span className="text-gray-300 text-sm">{gif.name}</span>
                    <button
                      type="button"
                      onClick={() => removeGif(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Videos */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Videos (MP4 - Music Videos, Behind the Scenes, etc.)
            </label>
            <input
              type="file"
              accept=".mp4,video/mp4"
              onChange={handleVideos}
              className="hidden"
              id="videos"
              multiple
              disabled={uploading}
            />
            <label
              htmlFor="videos"
              className="block border-2 border-dashed border-red-500/30 hover:border-red-500/50 rounded-xl p-4 text-center cursor-pointer transition-all bg-white/5"
            >
              <Film className="w-8 h-8 mx-auto mb-2 text-red-400" />
              <p className="text-gray-300 text-sm">Add videos</p>
            </label>
            
            {videos.length > 0 && (
              <div className="mt-3 space-y-2">
                {videos.map((video, index) => (
                  <div key={index} className="flex items-center justify-between bg-white/5 p-3 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Film className="w-4 h-4 text-red-400" />
                      <span className="text-gray-300 text-sm">{video.name}</span>
                      <span className="text-gray-500 text-xs">
                        {(video.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeVideo(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* PDFs */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              PDFs (Liner Notes, Booklets, etc.)
            </label>
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={handlePdfs}
              className="hidden"
              id="pdfs"
              multiple
              disabled={uploading}
            />
            <label
              htmlFor="pdfs"
              className="block border-2 border-dashed border-orange-500/30 hover:border-orange-500/50 rounded-xl p-4 text-center cursor-pointer transition-all bg-white/5"
            >
              <FileText className="w-8 h-8 mx-auto mb-2 text-orange-400" />
              <p className="text-gray-300 text-sm">Add PDFs</p>
            </label>
            
            {pdfs.length > 0 && (
              <div className="mt-3 space-y-2">
                {pdfs.map((pdf, index) => (
                  <div key={index} className="flex items-center justify-between bg-white/5 p-3 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-4 h-4 text-orange-400" />
                      <span className="text-gray-300 text-sm">{pdf.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removePdf(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Lyrics */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Lyrics</label>
            <textarea
              name="lyrics"
              value={formData.lyrics}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/5 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[150px] font-mono text-sm"
              placeholder="Verse 1:&#10;..."
              disabled={uploading}
            />
          </div>

          {/* Liner Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Liner Notes</label>
            <textarea
              name="linerNotes"
              value={formData.linerNotes}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/5 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[120px]"
              placeholder="Story behind the song, recording process, inspiration..."
              disabled={uploading}
            />
          </div>

          {/* Credits */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Credits</label>
            <textarea
              name="credits"
              value={formData.credits}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/5 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[80px]"
              placeholder="Produced by..., Mixed by..., Mastered by..."
              disabled={uploading}
            />
          </div>

          {/* Progress Bar */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-300">
                <span>
                  {progress < 30 ? 'Uploading files...' : 
                   progress < 70 ? 'Converting audio...' : 
                   'Creating OGGPack...'}
                </span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={uploading || !mainTrack}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            {uploading ? 'Creating Experience...' : 'Create OGG Experience'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreatorMode;