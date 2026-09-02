import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Loading from '../components/Loading';
import './Admin.css';

export default function AdminInventory() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/inventory');
      setInventory(res.data);
    } catch (err) {
      console.error('Failed to load inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  const badgeClass = (status) => {
    if (status === 'In Stock') return 'badge badge-instock';
    if (status === 'Low Stock') return 'badge badge-lowstock';
    return 'badge badge-outofstock';
  };

  if (loading) return <Loading />;

  return (
    <div className="admin-page">
      <div className="admin-sidebar">
        <h3>Admin Panel</h3>
        <Link to="/admin">Dashboard</Link>
        <Link to="/admin/products">Products</Link>
        <Link to="/admin/categories">Categories</Link>
        <Link to="/admin/rooms">Rooms</Link>
        <Link to="/admin/orders">Orders</Link>
        <Link to="/admin/inventory" className="active">Inventory</Link>
        <Link to="/admin/users">Users</Link>
      </div>

      <div className="admin-content">
        <h1>Inventory</h1>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Product</th>
                <th>Current Stock</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => (
                <tr key={item.id}>
                  <td><img src={item.image_url} alt={item.name} onError={(e) => { e.target.src = 'https://via.placeholder.com/40x40'; }} /></td>
                  <td>{item.name}</td>
                  <td>{item.stock_quantity}</td>
                  <td><span className={badgeClass(item.stock_status)}>{item.stock_status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
