import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';

function CreatorMode({ token }) {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [cover, setCover] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [credits, setCredits] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState('');
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file || !title) {
      alert('Please provide a file and title');
      return;
    }

    console.log('Starting upload...', { fileName: file.name, fileSize: file.size, title, apiUrl: API_URL });
    
    setUploading(true);
    setProgress('Uploading file...');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('description', description);
      if (cover) formData.append('cover', cover);
      
      const metadata = {
        lyrics: lyrics || '',
        credits: credits || ''
      };
      formData.append('metadata', JSON.stringify(metadata));

      console.log('Sending request to:', API_URL + '/api/creator/upload');
      setProgress('Converting to OGG...');
      
      const { data } = await axios.post(API_URL + '/api/creator/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': 'Bearer ' + token
        },
        timeout: 300000,
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log('Upload progress:', percentCompleted + '%');
          if (percentCompleted < 100) {
            setProgress('Uploading: ' + percentCompleted + '%');
          } else {
            setProgress('Processing audio...');
          }
        }
      });

      console.log('Upload successful:', data);
      setProgress('Creating .oggpack...');
      setResult(data.oggpack);
      setProgress('Complete!');
      
      setFile(null);
      setCover(null);
      setTitle('');
      setDescription('');
      setLyrics('');
      setCredits('');
      
      const fileInputs = document.querySelectorAll('input[type="file"]');
      fileInputs.forEach(input => input.value = '');
      
    } catch (err) {
      console.error('Upload error:', err);
      const errorMsg = err.response?.data?.error || err.message || 'Upload failed';
      setProgress('Error: ' + errorMsg);
      alert('Upload failed: ' + errorMsg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Creator Mode</h1>

      {result ? (
        <div className="bg-gray-800 p-6 rounded-xl border border-green-500">
          <h2 className="text-2xl font-bold text-green-400 mb-4">OGGPack Created!</h2>
          <div className="space-y-3 mb-6">
            <p><span className="text-gray-400">Title:</span> <span className="font-semibold">{result.title}</span></p>
            <p><span className="text-gray-400">ID:</span> <span className="text-sm text-gray-300">{result.id}</span></p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => navigate('/preview/' + result.id)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold"
            >
              Preview in Player
            </button>
            <button
              onClick={() => setResult(null)}
              className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg"
            >
              Upload Another
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-xl space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Audio File (MP3, OGG, WAV, etc.)</label>
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full text-gray-300"
              disabled={uploading}
            />
            {file && <p className="mt-2 text-sm text-gray-400">Selected: {file.name} ({Math.round(file.size / 1024 / 1024 * 100) / 100} MB)</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Cover Image (Optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setCover(e.target.files[0])}
              className="w-full text-gray-300"
              disabled={uploading}
            />
            {cover && <p className="mt-2 text-sm text-gray-400">Selected: {cover.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full"
              disabled={uploading}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full h-24"
              disabled={uploading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Lyrics</label>
            <textarea
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              className="w-full h-32"
              placeholder="Enter song lyrics..."
              disabled={uploading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Credits</label>
            <textarea
              value={credits}
              onChange={(e) => setCredits(e.target.value)}
              className="w-full h-24"
              placeholder="Producer, Engineer, etc."
              disabled={uploading}
            />
          </div>

          {progress && (
            <div className={uploading ? 'bg-blue-500/10 border border-blue-500 text-blue-400 px-4 py-3 rounded-lg' : 'bg-green-500/10 border border-green-500 text-green-400 px-4 py-3 rounded-lg'}>
              {progress}
            </div>
          )}

          <button
            type="submit"
            disabled={uploading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 rounded-lg disabled:opacity-50"
          >
            {uploading ? 'Processing...' : 'Upload & Convert to OGG'}
          </button>
        </form>
      )}
    </div>
  );
}

export default CreatorMode;