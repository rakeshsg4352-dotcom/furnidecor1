import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Loading from '../components/Loading';
import './Cart.css';

export default function Cart() {
  const { items, subtotal, loading, updateQuantity, removeItem } = useCart();
  const navigate = useNavigate();

  const handleQuantityChange = async (cartItemId, newQty, stock) => {
    if (newQty < 1 || newQty > stock) return;
    try {
      await updateQuantity(cartItemId, newQty);
    } catch (err) {
      console.error('Failed to update quantity:', err);
    }
  };

  const handleRemove = async (cartItemId) => {
    try {
      await removeItem(cartItemId);
    } catch (err) {
      console.error('Failed to remove item:', err);
    }
  };

  if (loading) return <Loading />;

  if (items.length === 0) {
    return (
      <div className="cart-empty">
        <h2>Your cart is empty.</h2>
        <Link to="/furniture" className="btn btn-primary">Explore Furniture</Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1>Shopping Cart</h1>

      <div className="cart-layout">
        <div className="cart-items">
          {items.map((item) => {
            const price = item.discount_price || item.price;
            return (
              <div className="cart-item" key={item.cart_item_id}>
                <img
                  src={item.image_url}
                  alt={item.name}
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/100x100?text=FurniDecor'; }}
                />
                <div className="cart-item-info">
                  <h3>{item.name}</h3>
                  <p className="cart-item-price">Rs. {Number(price).toLocaleString('en-IN')}</p>
                </div>
                <div className="cart-item-qty">
                  <button onClick={() => handleQuantityChange(item.cart_item_id, item.quantity - 1, item.stock_quantity)}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => handleQuantityChange(item.cart_item_id, item.quantity + 1, item.stock_quantity)}>+</button>
                </div>
                <div className="cart-item-subtotal">
                  Rs. {(price * item.quantity).toLocaleString('en-IN')}
                </div>
                <button className="cart-item-remove" onClick={() => handleRemove(item.cart_item_id)}>
                  Remove
                </button>
              </div>
            );
          })}
        </div>

        <div className="cart-summary">
          <h3>Order Summary</h3>
          <div className="cart-summary-row">
            <span>Subtotal</span>
            <span>Rs. {Number(subtotal).toLocaleString('en-IN')}</span>
          </div>
          <div className="cart-summary-row">
            <span>Delivery</span>
            <span>Free</span>
          </div>
          <div className="cart-summary-row cart-summary-total">
            <span>Grand Total</span>
            <span>Rs. {Number(subtotal).toLocaleString('en-IN')}</span>
          </div>
          <button className="btn btn-primary cart-checkout-btn" onClick={() => navigate('/checkout')}>
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
