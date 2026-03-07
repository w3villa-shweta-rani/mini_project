import { useState, useEffect, useRef, useCallback } from 'react';
import useAuth from '../hooks/useAuth';
import api from '../services/api';
import { getInitials } from '../utils/helpers';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const Profile = () => {
  const { user, refreshUser, updateUserLocally } = useAuth();
  const [form, setForm] = useState({ name: '', address: '', location: { lat: null, lng: null } });
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const autocompleteRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  // Initialize form
  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        address: user.address || '',
        location: user.location || { lat: null, lng: null },
      });
    }
  }, [user]);

  // Load Google Maps script
  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY || window.google) {
      if (window.google) setMapLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.onload = () => setMapLoaded(true);
    document.head.appendChild(script);

    return () => {
      // cleanup
    };
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !window.google) return;

    const defaultCenter = form.location?.lat
      ? { lat: form.location.lat, lng: form.location.lng }
      : { lat: 28.6139, lng: 77.209 }; // Default: New Delhi

    const map = new window.google.maps.Map(mapRef.current, {
      center: defaultCenter,
      zoom: 13,
      styles: [
        { elementType: 'geometry', stylers: [{ color: '#1a1a2e' }] },
        { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1a2e' }] },
        { elementType: 'labels.text.fill', stylers: [{ color: '#8892b0' }] },
        { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#16213e' }] },
        { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0f0f1a' }] },
      ],
    });

    mapInstanceRef.current = map;

    if (form.location?.lat) {
      markerRef.current = new window.google.maps.Marker({
        position: defaultCenter,
        map,
        title: user?.name,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: '#6c63ff',
          fillOpacity: 1,
          strokeColor: '#f50057',
          strokeWeight: 2,
          scale: 10,
        },
      });
    }

    // Setup autocomplete
    if (inputRef.current) {
      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current);
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (!place.geometry) return;

        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const address = place.formatted_address;

        setForm(prev => ({ ...prev, address, location: { lat, lng } }));
        map.setCenter({ lat, lng });
        map.setZoom(15);

        if (markerRef.current) {
          markerRef.current.setPosition({ lat, lng });
        } else {
          markerRef.current = new window.google.maps.Marker({
            position: { lat, lng },
            map,
            title: address,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              fillColor: '#6c63ff',
              fillOpacity: 1,
              strokeColor: '#f50057',
              strokeWeight: 2,
              scale: 10,
            },
          });
        }
      });
      autocompleteRef.current = autocomplete;
    }
  }, [mapLoaded]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await api.put('/user/profile', {
        name: form.name,
        address: form.address,
        location: form.location,
      });
      if (res.data.success) {
        setSuccess('Profile updated successfully!');
        updateUserLocally(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB.');
      return;
    }
    setSelectedFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleImageUpload = async () => {
    if (!selectedFile) return;
    setImageLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('profileImage', selectedFile);
      const res = await api.post('/user/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        setSuccess('Profile image uploaded!');
        updateUserLocally({ profileImage: res.data.data.profileImage });
        setSelectedFile(null);
        setImagePreview(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Image upload failed.');
    } finally {
      setImageLoading(false);
    }
  };

  const handleDownload = async () => {
    setDownloadLoading(true);
    try {
      const res = await api.get('/user/download-profile');
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gamerhub-profile-${user?.name?.replace(/\s+/g, '-')}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download profile.');
    } finally {
      setDownloadLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white mb-1">My Profile</h1>
          <p className="text-gray-400">Manage your gaming identity</p>
        </div>
        <button onClick={handleDownload} disabled={downloadLoading}
                className="btn-outline text-sm flex items-center gap-2">
          {downloadLoading ? '...' : '📥 Download Profile'}
        </button>
      </div>

      {success && <div className="alert alert-success mb-6">✅ {success}</div>}
      {error && <div className="alert alert-error mb-6">⚠️ {error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Avatar */}
        <div className="lg:col-span-1">
          <div className="glass-card p-6 text-center">
            <div className="relative inline-block mb-4">
              {imagePreview || user?.profileImage ? (
                <img src={imagePreview || user.profileImage} alt={user?.name}
                     className="w-28 h-28 rounded-full object-cover border-4 border-primary/40 mx-auto" />
              ) : (
                <div className="w-28 h-28 rounded-full flex items-center justify-center text-4xl font-bold text-white mx-auto border-4 border-primary/30"
                     style={{ background: 'linear-gradient(135deg, #6c63ff, #f50057)' }}>
                  {getInitials(user?.name)}
                </div>
              )}
              <button onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 w-9 h-9 rounded-full flex items-center justify-center text-white border-2 border-dark"
                      style={{ background: 'linear-gradient(135deg, #6c63ff, #f50057)' }}>
                📷
              </button>
            </div>

            <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                   onChange={handleImageSelect} />

            <h3 className="text-lg font-bold text-white">{user?.name}</h3>
            <p className="text-gray-400 text-sm">{user?.email}</p>

            <div className="mt-4 space-y-2">
              {imagePreview && (
                <button onClick={handleImageUpload} disabled={imageLoading}
                        className="btn-primary w-full justify-center text-sm py-2">
                  {imageLoading ? '⏳ Uploading...' : '⬆️ Upload Image'}
                </button>
              )}
              {imagePreview && (
                <button onClick={() => { setImagePreview(null); setSelectedFile(null); }}
                        className="w-full py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                  Cancel
                </button>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-white/10 space-y-2 text-left">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Plan</span>
                <span className="font-semibold text-white">{user?.planType}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Verified</span>
                <span className={user?.isVerified ? 'text-green-400' : 'text-red-400'}>
                  {user?.isVerified ? '✓ Yes' : '✗ No'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Provider</span>
                <span className="text-white capitalize">{user?.socialProvider}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Form + Map */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Form */}
          <form onSubmit={handleSubmit} className="glass-card p-6">
            <h2 className="text-lg font-bold text-white mb-5">Personal Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Full Name</label>
                <input type="text" name="name" value={form.name} onChange={handleChange}
                       placeholder="Your name" className="input-field" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
                <input type="email" value={user?.email || ''} disabled
                       className="input-field opacity-50 cursor-not-allowed" />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  📍 Address (with Google Maps Autocomplete)
                </label>
                <input
                  ref={inputRef}
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Start typing your address..."
                  className="input-field"
                />
                {!GOOGLE_MAPS_API_KEY && (
                  <p className="text-xs text-yellow-400 mt-1">⚠️ Add VITE_GOOGLE_MAPS_API_KEY to enable autocomplete</p>
                )}
              </div>

              {form.location?.lat && (
                <div className="text-xs text-gray-500 bg-white/5 rounded-lg px-3 py-2">
                  📍 Coordinates: {form.location.lat.toFixed(6)}, {form.location.lng.toFixed(6)}
                </div>
              )}
            </div>

            <button type="submit" disabled={loading}
                    className="btn-primary mt-6 justify-center py-3">
              {loading ? '⏳ Saving...' : '💾 Save Changes'}
            </button>
          </form>

          {/* Map */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-bold text-white mb-4">📍 Location Map</h2>
            {GOOGLE_MAPS_API_KEY ? (
              <div ref={mapRef} className="w-full h-64 rounded-xl overflow-hidden border border-white/10" />
            ) : (
              <div className="w-full h-64 rounded-xl flex flex-col items-center justify-center border border-white/10 bg-white/5 text-center px-6">
                <p className="text-4xl mb-3">🗺️</p>
                <p className="text-gray-300 font-semibold mb-1">Google Maps Preview</p>
                <p className="text-gray-500 text-sm">Add <code className="text-primary">VITE_GOOGLE_MAPS_API_KEY</code> to your .env file to enable the map.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
