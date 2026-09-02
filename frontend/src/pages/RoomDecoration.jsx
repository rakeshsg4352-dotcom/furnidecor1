import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import RoomCard from '../components/RoomCard';
import Loading from '../components/Loading';
import './RoomDecoration.css';

export default function RoomDecoration() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();

  const [rooms, setRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState(id ? parseInt(id) : null);
  const [recommendations, setRecommendations] = useState([]);
  const [roomInfo, setRoomInfo] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadRooms();
  }, []);

  useEffect(() => {
    if (selectedRoomId) {
      loadRecommendations(selectedRoomId);
      setSelectedItems([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRoomId]);

  const loadRooms = async () => {
    setLoadingRooms(true);
    try {
      const res = await api.get('/rooms');
      setRooms(res.data);

      if (!selectedRoomId && res.data.length > 0) {
        setSelectedRoomId(res.data[0].id);
      }
    } catch (error) {
      console.error('Failed to load rooms:', error);
    } finally {
      setLoadingRooms(false);
    }
  };

  const loadRecommendations = async (roomId) => {
    setLoadingRecs(true);
    try {
      const res = await api.get('/rooms/' + roomId + '/recommendations');
      setRoomInfo(res.data.room);
      setRecommendations(res.data.recommendations);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    } finally {
      setLoadingRecs(false);
    }
  };

  const handleSelectRoom = (roomId) => {
    setSelectedRoomId(roomId);
    navigate('/rooms/' + roomId);
  };

  const toggleSelectItem = (product) => {
    setSelectedItems((prev) => {
      const exists = prev.find((p) => p.id === product.id);
      if (exists) {
        return prev.filter((p) => p.id !== product.id);
      }
      return [...prev, product];
    });
  };

  const removeSelectedItem = (productId) => {
    setSelectedItems((prev) => prev.filter((p) => p.id !== productId));
  };

  const handleAddAllToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (selectedItems.length === 0) {
      setMessage('Select at least one item first.');
      setTimeout(() => setMessage(''), 2000);
      return;
    }
    try {
      for (const item of selectedItems) {
        await addItem(item.id, 1);
      }
      setMessage('All selected items added to cart!');
      setTimeout(() => setMessage(''), 2500);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to add items to cart.');
    }
  };

  if (loadingRooms) return <Loading />;

  return (
    <div className="room-decoration-page">
      <div className="room-decoration-header">
        <h1>Design Your Space</h1>
        <p>Select a room and discover furniture curated just for it.</p>
      </div>

      <div className="room-select-grid">
        {rooms.map((room) => (
          <RoomCard
            key={room.id}
            room={room}
            selected={room.id === selectedRoomId}
            onClick={handleSelectRoom}
          />
        ))}
      </div>

      {loadingRecs ? (
        <Loading />
      ) : (
        roomInfo && (
          <div className="room-decoration-body">
            <div className="room-recommendations">
              <h2>Recommended for {roomInfo.name}</h2>
              <div className="recommendation-grid">
                {recommendations.map((product) => {
                  const isSelected = selectedItems.some((p) => p.id === product.id);
                  const price = product.discount_price || product.price;
                  return (
                    <div
                      className={'recommendation-card' + (isSelected ? ' selected' : '')}
                      key={product.id}
                      onClick={() => toggleSelectItem(product)}
                    >
                      <img
                        src={product.image_url}
                        alt={product.name}
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/200x200?text=FurniDecor'; }}
                      />
                      <div className="recommendation-info">
                        <span className="recommendation-name">{product.name}</span>
                        <span className="recommendation-price">Rs. {Number(price).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="recommendation-check">{isSelected ? '?' : '+'}</div>
                      <Link
                        to={'/product/' + product.id}
                        className="recommendation-view"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View Product
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="room-preview">
              <h3>Your Room Preview</h3>
              <div className="room-preview-box">
                {selectedItems.length === 0 ? (
                  <p className="room-preview-empty">Select furniture from the left to preview it here.</p>
                ) : (
                  <div className="room-preview-items">
                    {selectedItems.map((item) => (
                      <div className="room-preview-item" key={item.id}>
                        <img
                          src={item.image_url}
                          alt={item.name}
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/80x80?text=FurniDecor'; }}
                        />
                        <span>{item.name}</span>
                        <button onClick={() => removeSelectedItem(item.id)}>Remove</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {message && <div className="room-preview-message">{message}</div>}

              <button className="btn btn-primary room-preview-btn" onClick={handleAddAllToCart}>
                Add Selected to Cart
              </button>
            </div>
          </div>
        )
      )}
    </div>
  );
}
