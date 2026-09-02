import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Loading from '../components/Loading';
import './Profile.css';

export default function Profile() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({ name: '', phone: '', address: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get('/auth/profile');
      setFormData({
        name: res.data.name || '',
        phone: res.data.phone || '',
        address: res.data.address || ''
      });
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!formData.name) {
      setError('Name is required.');
      return;
    }

    setSaving(true);
    try {
      await api.put('/auth/profile', formData);
      setMessage('Profile updated successfully.');
      setTimeout(() => setMessage(''), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="profile-page">
      <h1>My Profile</h1>

      <div className="profile-card">
        <div className="profile-readonly">
          <span className="label">Email</span>
          <span>{user?.email}</span>
        </div>
        <div className="profile-readonly">
          <span className="label">Account Type</span>
          <span>{user?.role}</span>
        </div>

        {message && <div className="profile-message">{message}</div>}
        {error && <div className="profile-error">{error}</div>}

        <form onSubmit={handleSubmit} className="profile-form">
          <label>
            Full Name
            <input name="name" value={formData.name} onChange={handleChange} />
          </label>
          <label>
            Phone
            <input name="phone" value={formData.phone} onChange={handleChange} />
          </label>
          <label>
            Address
            <textarea name="address" rows={3} value={formData.address} onChange={handleChange} />
          </label>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
