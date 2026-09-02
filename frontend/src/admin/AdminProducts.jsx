import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Loading from '../components/Loading';
import './Admin.css';

const emptyForm = {
  name: '', description: '', category_id: '', price: '', discount_price: '',
  material: '', color: '', dimensions: '', stock_quantity: '', image_url: '',
  featured: false, status: 'ACTIVE'
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        api.get('/products?limit=100'),
        api.get('/categories')
      ]);
      setProducts(productsRes.data.products);
      setCategories(categoriesRes.data);
    } catch (err) {
      console.error('Failed to load products:', err);
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

  const openEditModal = (product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      category_id: product.category_id || '',
      price: product.price || '',
      discount_price: product.discount_price || '',
      material: product.material || '',
      color: product.color || '',
      dimensions: product.dimensions || '',
      stock_quantity: product.stock_quantity || '',
      image_url: product.image_url || '',
      featured: !!product.featured,
      status: product.status || 'ACTIVE'
    });
    setError('');
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.price) {
      setError('Name and price are required.');
      return;
    }

    try {
      if (editingId) {
        await api.put('/products/' + editingId, formData);
      } else {
        await api.post('/products', formData);
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete('/products/' + id);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete product.');
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="admin-page">
      <div className="admin-sidebar">
        <h3>Admin Panel</h3>
        <Link to="/admin">Dashboard</Link>
        <Link to="/admin/products" className="active">Products</Link>
        <Link to="/admin/categories">Categories</Link>
        <Link to="/admin/rooms">Rooms</Link>
        <Link to="/admin/orders">Orders</Link>
        <Link to="/admin/inventory">Inventory</Link>
        <Link to="/admin/users">Users</Link>
      </div>

      <div className="admin-content">
        <div className="admin-content-header">
          <h1>Products</h1>
          <button className="admin-btn" onClick={openAddModal}>Add Product</button>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Featured</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td><img src={p.image_url} alt={p.name} onError={(e) => { e.target.src = 'https://via.placeholder.com/40x40'; }} /></td>
                  <td>{p.name}</td>
                  <td>{p.category_name || '-'}</td>
                  <td>Rs. {Number(p.price).toLocaleString('en-IN')}</td>
                  <td>{p.stock_quantity}</td>
                  <td>{p.featured ? 'Yes' : 'No'}</td>
                  <td>{p.status}</td>
                  <td>
                    <div className="admin-table-actions">
                      <button className="admin-link-btn" onClick={() => openEditModal(p)}>Edit</button>
                      <button className="admin-link-btn danger" onClick={() => handleDelete(p.id)}>Delete</button>
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
            <h2>{editingId ? 'Edit Product' : 'Add Product'}</h2>

            {error && <div className="admin-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="admin-form-group">
                <label>Product Name</label>
                <input name="name" value={formData.name} onChange={handleChange} />
              </div>

              <div className="admin-form-group">
                <label>Description</label>
                <textarea name="description" rows={3} value={formData.description} onChange={handleChange} />
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Category</label>
                  <select name="category_id" value={formData.category_id} onChange={handleChange}>
                    <option value="">Select category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="admin-form-group">
                  <label>Status</label>
                  <select name="status" value={formData.status} onChange={handleChange}>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Price</label>
                  <input type="number" name="price" value={formData.price} onChange={handleChange} />
                </div>
                <div className="admin-form-group">
                  <label>Discount Price</label>
                  <input type="number" name="discount_price" value={formData.discount_price} onChange={handleChange} />
                </div>
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Material</label>
                  <input name="material" value={formData.material} onChange={handleChange} />
                </div>
                <div className="admin-form-group">
                  <label>Color</label>
                  <input name="color" value={formData.color} onChange={handleChange} />
                </div>
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Dimensions</label>
                  <input name="dimensions" value={formData.dimensions} onChange={handleChange} />
                </div>
                <div className="admin-form-group">
                  <label>Stock Quantity</label>
                  <input type="number" name="stock_quantity" value={formData.stock_quantity} onChange={handleChange} />
                </div>
              </div>

              <div className="admin-form-group">
                <label>Image URL</label>
                <input name="image_url" value={formData.image_url} onChange={handleChange} />
              </div>

              <div className="admin-form-group">
                <label>
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleChange}
                    style={{ width: 'auto', marginRight: '8px' }}
                  />
                  Featured Product
                </label>
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
