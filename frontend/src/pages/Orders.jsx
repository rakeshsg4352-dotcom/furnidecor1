import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Loading from '../components/Loading';
import './Orders.css';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders');
      setOrders(res.data);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  if (orders.length === 0) {
    return (
      <div className="orders-empty">
        <h2>You have no orders yet.</h2>
        <Link to="/furniture" className="btn btn-primary">Explore Furniture</Link>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <h1>My Orders</h1>

      <div className="orders-list">
        {orders.map((order) => (
          <Link to={'/orders/' + order.id} key={order.id} className="order-card">
            <div className="order-card-header">
              <span className="order-id">FD{String(order.id).padStart(5, '0')}</span>
              <span className={'order-status status-' + order.order_status.toLowerCase()}>
                {order.order_status}
              </span>
            </div>
            <div className="order-card-body">
              <span>Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              <span className="order-total">Rs. {Number(order.total_amount).toLocaleString('en-IN')}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
