import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      await addItem(product.id, 1);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  const displayPrice = product.discount_price || product.price;
  const hasDiscount = product.discount_price && product.discount_price < product.price;

  return (
    <Link to={'/product/' + product.id} className="product-card">
      <div className="product-card-image">
        <img
          src={product.image_url}
          alt={product.name}
          onError={(e) => { e.target.src = 'https://via.placeholder.com/300x300?text=FurniDecor'; }}
        />
      </div>
      <div className="product-card-body">
        <span className="product-card-category">{product.category_name || ''}</span>
        <h3 className="product-card-name">{product.name}</h3>
        <div className="product-card-price">
          <span className="price-current">Rs. {Number(displayPrice).toLocaleString('en-IN')}</span>
          {hasDiscount && (
            <span className="price-original">Rs. {Number(product.price).toLocaleString('en-IN')}</span>
          )}
        </div>
        {product.rating > 0 && (
          <div className="product-card-rating">Rated {product.rating} / 5</div>
        )}
        <button className="product-card-btn" onClick={handleAddToCart}>
          Add to Cart
        </button>
      </div>
    </Link>
  );
}
