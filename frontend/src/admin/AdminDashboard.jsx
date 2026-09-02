import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Loading from '../components/Loading';
import './Admin.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/dashboard');
      setStats(res.data);
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (!stats) return null;

  return (
    <div className="admin-page">
      <div className="admin-sidebar">
        <h3>Admin Panel</h3>
        <Link to="/admin" className="active">Dashboard</Link>
        <Link to="/admin/products">Products</Link>
        <Link to="/admin/categories">Categories</Link>
        <Link to="/admin/rooms">Rooms</Link>
        <Link to="/admin/orders">Orders</Link>
        <Link to="/admin/inventory">Inventory</Link>
        <Link to="/admin/users">Users</Link>
      </div>

      <div className="admin-content">
        <h1>Dashboard</h1>

        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-label">Total Products</span>
            <span className="stat-value">{stats.totalProducts}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Total Users</span>
            <span className="stat-value">{stats.totalUsers}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Total Orders</span>
            <span className="stat-value">{stats.totalOrders}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Pending Orders</span>
            <span className="stat-value">{stats.pendingOrders}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Delivered Orders</span>
            <span className="stat-value">{stats.deliveredOrders}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Total Revenue</span>
            <span className="stat-value">Rs. {Number(stats.totalRevenue).toLocaleString('en-IN')}</span>
          </div>
          <div className="stat-card warning">
            <span className="stat-label">Low Stock Products</span>
            <span className="stat-value">{stats.lowStockProducts}</span>
          </div>
          <div className="stat-card danger">
            <span className="stat-label">Out of Stock</span>
            <span className="stat-value">{stats.outOfStockProducts}</span>
          </div>
        </div>

        <div className="admin-panels">
          <div className="admin-panel">
            <h3>Orders by Status</h3>
            {stats.ordersByStatus.length === 0 ? (
              <p className="admin-panel-empty">No orders yet.</p>
            ) : (
              stats.ordersByStatus.map((row) => (
                <div className="admin-panel-row" key={row.order_status}>
                  <span>{row.order_status}</span>
                  <span>{row.count}</span>
                </div>
              ))
            )}
          </div>

          <div className="admin-panel">
            <h3>Revenue by Category</h3>
            {stats.revenueByCategory.length === 0 ? (
              <p className="admin-panel-empty">No sales yet.</p>
            ) : (
              stats.revenueByCategory.map((row, i) => (
                <div className="admin-panel-row" key={i}>
                  <span>{row.category || 'Uncategorized'}</span>
                  <span>Rs. {Number(row.revenue).toLocaleString('en-IN')}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
