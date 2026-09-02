import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Loading from '../components/Loading';
import './Admin.css';

const STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/orders');
      setOrders(res.data);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await api.put('/admin/orders/' + orderId + '/status', { order_status: newStatus });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, order_status: newStatus } : o))
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status.');
    } finally {
      setUpdatingId(null);
    }
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
        <Link to="/admin/orders" className="active">Orders</Link>
        <Link to="/admin/inventory">Inventory</Link>
        <Link to="/admin/users">Users</Link>
      </div>

      <div className="admin-content">
        <h1>Orders</h1>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>FD{String(o.id).padStart(5, '0')}</td>
                  <td>{o.customer_name}<br /><span style={{ fontSize: '12px', color: '#a89d8f' }}>{o.customer_email}</span></td>
                  <td>Rs. {Number(o.total_amount).toLocaleString('en-IN')}</td>
                  <td>{o.payment_method === 'COD' ? 'Cash on Delivery' : 'Demo Online'}</td>
                  <td>{new Date(o.created_at).toLocaleDateString('en-IN')}</td>
                  <td>
                    <select
                      value={o.order_status}
                      onChange={(e) => handleStatusChange(o.id, e.target.value)}
                      disabled={updatingId === o.id}
                      style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #e3d9cb', fontSize: '13px' }}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
