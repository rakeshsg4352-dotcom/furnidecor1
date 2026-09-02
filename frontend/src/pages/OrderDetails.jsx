import { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import api from '../services/api';
import Loading from '../components/Loading';
import './OrderDetails.css';

export default function OrderDetails() {
  const { id } = useParams();
  const location = useLocation();
  const justPlaced = location.state?.justPlaced;
  const orderIdLabel = location.state?.orderId;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadOrder = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/orders/' + id);
      setOrder(res.data);
    } catch (err) {
      setError('Order not found.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  if (error || !order) {
    return (
      <div className="order-details-empty">
        <p>{error || 'Order not found.'}</p>
        <Link to="/orders">Back to My Orders</Link>
      </div>
    );
  }

  return (
    <div className="order-details-page">
      {justPlaced && (
        <div className="order-success-banner">
          <h2>Order placed successfully!</h2>
          <p>Order ID: {orderIdLabel || ('FD' + String(order.id).padStart(5, '0'))}</p>
        </div>
      )}

      <div className="order-details-header">
        <h1>Order FD{String(order.id).padStart(5, '0')}</h1>
        <span className={'order-status status-' + order.order_status.toLowerCase()}>
          {order.order_status}
        </span>
      </div>

      <div className="order-details-meta">
        <div>
          <span className="label">Order Date</span>
          <span>{new Date(order.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
        <div>
          <span className="label">Payment Method</span>
          <span>{order.payment_method === 'COD' ? 'Cash on Delivery' : 'Demo Online Payment'}</span>
        </div>
        <div>
          <span className="label">Shipping Address</span>
          <span>{order.shipping_address}</span>
        </div>
      </div>

      <div className="order-details-items">
        <h3>Items</h3>
        {order.items.map((item, index) => (
          <div className="order-details-item" key={index}>
            <img
              src={item.image_url}
              alt={item.name}
              onError={(e) => { e.target.src = 'https://via.placeholder.com/70x70?text=FurniDecor'; }}
            />
            <div className="order-details-item-info">
              <span>{item.name}</span>
              <span className="order-details-item-qty">Qty: {item.quantity}</span>
            </div>
            <span className="order-details-item-price">
              Rs. {(item.price * item.quantity).toLocaleString('en-IN')}
            </span>
          </div>
        ))}
      </div>

      <div className="order-details-total">
        <span>Total</span>
        <span>Rs. {Number(order.total_amount).toLocaleString('en-IN')}</span>
      </div>

      <Link to="/orders" className="order-details-back">Back to My Orders</Link>
    </div>
  );
}
