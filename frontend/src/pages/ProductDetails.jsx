import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import Loading from '../components/Loading';
import './ProductDetails.css';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadProduct();
    window.scrollTo(0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadProduct = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/products/' + id);
      setProduct(res.data);
      setQuantity(1);
    } catch (err) {
      setError('Product not found.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      await addItem(product.id, quantity);
      setMessage('Added to cart!');
      setTimeout(() => setMessage(''), 2000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to add to cart.');
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      await addItem(product.id, quantity);
      navigate('/cart');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to add to cart.');
    }
  };

  if (loading) return <Loading />;

  if (error || !product) {
    return (
      <div className="product-details-empty">
        <p>{error || 'Product not found.'}</p>
        <Link to="/furniture">Back to Furniture</Link>
      </div>
    );
  }

  const displayPrice = product.discount_price || product.price;
  const hasDiscount = product.discount_price && product.discount_price < product.price;
  const outOfStock = product.stock_quantity === 0;

  return (
    <div className="product-details-page">
      <div className="product-details-main">
        <div className="product-details-image">
          <img
            src={product.image_url}
            alt={product.name}
            onError={(e) => { e.target.src = 'https://via.placeholder.com/500x500?text=FurniDecor'; }}
          />
        </div>

        <div className="product-details-info">
          <span className="product-details-category">{product.category_name}</span>
          <h1>{product.name}</h1>

          {product.rating > 0 && <div className="product-details-rating">Rated {product.rating} / 5</div>}

          <div className="product-details-price">
            <span className="price-current">Rs. {Number(displayPrice).toLocaleString('en-IN')}</span>
            {hasDiscount && (
              <span className="price-original">Rs. {Number(product.price).toLocaleString('en-IN')}</span>
            )}
          </div>

          <p className="product-details-description">{product.description}</p>

          <div className="product-details-specs">
            {product.material && <div><strong>Material:</strong> {product.material}</div>}
            {product.color && <div><strong>Color:</strong> {product.color}</div>}
            {product.dimensions && <div><strong>Dimensions:</strong> {product.dimensions}</div>}
            <div>
              <strong>Availability:</strong>{' '}
              {outOfStock ? 'Out of Stock' : product.stock_quantity + ' in stock'}
            </div>
          </div>

          {!outOfStock && (
            <div className="product-details-quantity">
              <label>Quantity</label>
              <div className="quantity-selector">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}>+</button>
              </div>
            </div>
          )}

          {message && <div className="product-details-message">{message}</div>}

          <div className="product-details-actions">
            <button
              className="btn btn-secondary"
              onClick={handleAddToCart}
              disabled={outOfStock}
            >
              {outOfStock ? 'Out of Stock' : 'Add to Cart'}
            </button>
            <button
              className="btn btn-primary"
              onClick={handleBuyNow}
              disabled={outOfStock}
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>

      {product.relatedProducts && product.relatedProducts.length > 0 && (
        <div className="product-details-related">
          <h2>Related Products</h2>
          <div className="related-grid">
            {product.relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
