import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Loading from '../components/Loading';
import './Checkout.css';

export default function Checkout() {
  const { items, subtotal, loading, clearCart, refreshCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState(user?.address || '');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [error, setError] = useState('');
  const [placing, setPlacing] = useState(false);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError('');

    if (!shippingAddress.trim()) {
      setError('Please enter a shipping address.');
      return;
    }

    setPlacing(true);
    try {
      const res = await api.post('/orders', {
        shipping_address: shippingAddress,
        payment_method: paymentMethod
      });

      clearCart();
      navigate('/orders/' + res.data.id, { state: { justPlaced: true, orderId: res.data.orderId } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
      await refreshCart();
    } finally {
      setPlacing(false);
    }
  };

  if (loading) return <Loading />;

  if (items.length === 0) {
    return (
      <div className="checkout-empty">
        <h2>Your cart is empty.</h2>
        <p>Add some furniture before checking out.</p>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <h1>Checkout</h1>

      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={handlePlaceOrder}>
          <div className="checkout-section">
            <h3>Shipping Address</h3>
            <textarea
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              placeholder="Enter your full shipping address"
              rows={4}
            />
          </div>

          <div className="checkout-section">
            <h3>Payment Method</h3>
            <label className="checkout-radio">
              <input
                type="radio"
                name="payment"
                value="COD"
                checked={paymentMethod === 'COD'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              Cash on Delivery
            </label>
            <label className="checkout-radio">
              <input
                type="radio"
                name="payment"
                value="DEMO_ONLINE"
                checked={paymentMethod === 'DEMO_ONLINE'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              Demo Online Payment
            </label>
          </div>

          {error && <div className="checkout-error">{error}</div>}

          <button type="submit" className="btn btn-primary checkout-submit" disabled={placing}>
            {placing ? 'Placing Order...' : 'Place Order'}
          </button>
        </form>

        <div className="checkout-summary">
          <h3>Order Summary</h3>
          {items.map((item) => {
            const price = item.discount_price || item.price;
            return (
              <div className="checkout-summary-item" key={item.cart_item_id}>
                <span>{item.name} x {item.quantity}</span>
                <span>Rs. {(price * item.quantity).toLocaleString('en-IN')}</span>
              </div>
            );
          })}
          <div className="checkout-summary-total">
            <span>Grand Total</span>
            <span>Rs. {Number(subtotal).toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
