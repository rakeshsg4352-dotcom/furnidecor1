import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import CategoryCard from '../components/CategoryCard';
import Loading from '../components/Loading';
import './Home.css';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    setLoading(true);
    try {
      const [productsRes, categoriesRes, roomsRes] = await Promise.all([
        api.get('/products?sort=featured&limit=8'),
        api.get('/categories'),
        api.get('/rooms')
      ]);

      setFeaturedProducts(productsRes.data.products.filter((p) => p.featured));
      setCategories(categoriesRes.data.slice(0, 6));
      setRooms(roomsRes.data.slice(0, 5));
    } catch (error) {
      console.error('Failed to load home page data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1>Transform Your Space. Define Your Style.</h1>
          <p>Discover modern furniture and inspiring designs created for the way you live and work.</p>
          <div className="hero-buttons">
            <Link to="/furniture" className="btn btn-primary">Explore Furniture</Link>
            <Link to="/rooms" className="btn btn-secondary">Design Your Space</Link>
          </div>
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Shop by Category</h2>
        <div className="category-grid">
          {categories.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Featured Products</h2>
        <div className="product-grid">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="section room-inspiration">
        <h2 className="section-title">Room Inspiration</h2>
        <div className="room-grid">
          {rooms.map((room) => (
            <Link to={'/rooms/' + room.id} key={room.id} className="room-card">
              <img src={room.image_url} alt={room.name} onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300?text=FurniDecor'; }} />
              <span>{room.name}</span>
            </Link>
          ))}
        </div>
        <div className="section-cta">
          <Link to="/rooms" className="btn btn-primary">Design Your Space</Link>
        </div>
      </section>

      <section className="section why-choose">
        <h2 className="section-title">Why Choose FurniDecor</h2>
        <div className="why-grid">
          <div className="why-item">
            <h3>Premium Quality</h3>
            <p>Crafted from the finest materials to last for years.</p>
          </div>
          <div className="why-item">
            <h3>Modern Designs</h3>
            <p>Curated styles that fit contemporary homes and offices.</p>
          </div>
          <div className="why-item">
            <h3>Affordable Prices</h3>
            <p>Premium furniture without the premium price tag.</p>
          </div>
          <div className="why-item">
            <h3>Secure Shopping</h3>
            <p>Your data and payments are always protected.</p>
          </div>
          <div className="why-item">
            <h3>Reliable Delivery</h3>
            <p>Fast, trackable delivery straight to your door.</p>
          </div>
          <div className="why-item">
            <h3>Customer Support</h3>
            <p>We're here to help before and after your purchase.</p>
          </div>
        </div>
      </section>

      <section className="cta-banner">
        <h2>Your dream space starts here.</h2>
        <Link to="/furniture" className="btn btn-primary">Explore Collection</Link>
      </section>
    </div>
  );
}
