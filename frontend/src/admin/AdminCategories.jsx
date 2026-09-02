import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Loading from '../components/Loading';
import './Admin.css';

const emptyForm = { name: '', description: '', image_url: '' };

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setError('');
    setShowModal(true);
  };

  const openEditModal = (cat) => {
    setEditingId(cat.id);
    setFormData({ name: cat.name, description: cat.description || '', image_url: cat.image_url || '' });
    setError('');
    setShowModal(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name) {
      setError('Category name is required.');
      return;
    }

    try {
      if (editingId) {
        await api.put('/categories/' + editingId, formData);
      } else {
        await api.post('/categories', formData);
      }
      setShowModal(false);
      loadCategories();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save category.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category? Products in it will become uncategorized.')) return;
    try {
      await api.delete('/categories/' + id);
      loadCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete category.');
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="admin-page">
      <div className="admin-sidebar">
        <h3>Admin Panel</h3>
        <Link to="/admin">Dashboard</Link>
        <Link to="/admin/products">Products</Link>
        <Link to="/admin/categories" className="active">Categories</Link>
        <Link to="/admin/rooms">Rooms</Link>
        <Link to="/admin/orders">Orders</Link>
        <Link to="/admin/inventory">Inventory</Link>
        <Link to="/admin/users">Users</Link>
      </div>

      <div className="admin-content">
        <div className="admin-content-header">
          <h1>Categories</h1>
          <button className="admin-btn" onClick={openAddModal}>Add Category</button>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id}>
                  <td><img src={c.image_url} alt={c.name} onError={(e) => { e.target.src = 'https://via.placeholder.com/40x40'; }} /></td>
                  <td>{c.name}</td>
                  <td>{c.description}</td>
                  <td>
                    <div className="admin-table-actions">
                      <button className="admin-link-btn" onClick={() => openEditModal(c)}>Edit</button>
                      <button className="admin-link-btn danger" onClick={() => handleDelete(c.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingId ? 'Edit Category' : 'Add Category'}</h2>
            {error && <div className="admin-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="admin-form-group">
                <label>Name</label>
                <input name="name" value={formData.name} onChange={handleChange} />
              </div>
              <div className="admin-form-group">
                <label>Description</label>
                <textarea name="description" rows={3} value={formData.description} onChange={handleChange} />
              </div>
              <div className="admin-form-group">
                <label>Image URL</label>
                <input name="image_url" value={formData.image_url} onChange={handleChange} />
              </div>
              <div className="admin-modal-actions">
                <button type="button" className="admin-modal-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="admin-btn">{editingId ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
