import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [subtotal, setSubtotal] = useState('0.00');
  const [itemCount, setItemCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Whenever login state changes, refresh the cart.
  // If the user just logged out, clear the cart from view.
  useEffect(() => {
    if (isAuthenticated) {
      refreshCart();
    } else {
      setItems([]);
      setSubtotal('0.00');
      setItemCount(0);
    }
  }, [isAuthenticated]);

  const refreshCart = async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    try {
      const response = await api.get('/cart');
      setItems(response.data.items);
      setSubtotal(response.data.subtotal);
      setItemCount(response.data.itemCount);
    } catch (error) {
      console.error('Failed to load cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (productId, quantity = 1) => {
    await api.post('/cart/items', { product_id: productId, quantity });
    await refreshCart();
  };

  const updateQuantity = async (cartItemId, quantity) => {
    await api.put('/cart/items/' + cartItemId, { quantity });
    await refreshCart();
  };

  const removeItem = async (cartItemId) => {
    await api.delete('/cart/items/' + cartItemId);
    await refreshCart();
  };

  const clearCart = () => {
    setItems([]);
    setSubtotal('0.00');
    setItemCount(0);
  };

  const value = {
    items,
    subtotal,
    itemCount,
    loading,
    addItem,
    updateQuantity,
    removeItem,
    refreshCart,
    clearCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
