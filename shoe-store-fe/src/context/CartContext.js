import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { isAuthenticated, token } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [hasSynced, setHasSynced] = useState(false);

  // Reset hasSynced khi login/logout thay đổi
useEffect(() => {
  setHasSynced(false);
}, [isAuthenticated]);

useEffect(() => {
  if (isAuthenticated && !hasSynced) {
    syncCartOnLogin();
    setHasSynced(true);
  }
}, [isAuthenticated, hasSynced]);


  // Load cart from localStorage or server based on auth state
  const loadCart = useCallback(async () => {
    if (isAuthenticated && token) {
      try {
        const res = await axios.get('http://localhost:8080/api/cart', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const enrichedCartItems = (res.data || []).map(item => ({
          ...item,
          product: {
            ...item.product,
            sizes: item.product.sizes || [],
            colors: item.product.colors || [],
          },
        }));
        setCartItems(enrichedCartItems);
      } catch (err) {
        console.error('Error fetching cart from server:', err);
        setCartItems([]);
      }
    } else {
      const localCart = localStorage.getItem('cart');
      const parsedCart = localCart ? JSON.parse(localCart) : [];
      const enrichedCartItems = parsedCart.map(item => ({
        ...item,
        product: {
          ...item.product,
          sizes: item.product.sizes || [],
          colors: item.product.colors || [],
        },
      }));
      setCartItems(enrichedCartItems);
    }
  }, [isAuthenticated, token]);
  
  

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  // Helper update localStorage
  const updateLocalStorage = (cart) => {
    localStorage.setItem('cart', JSON.stringify(cart));
  };

  // Add or update item in cart state
  const upsertCartItem = (items, newItem) => {
    const index = items.findIndex(
      (item) =>
        item.product.id === newItem.product.id &&
        item.size === newItem.size &&
        item.color === newItem.color
    );
    if (index >= 0) {
      items[index].quantity += newItem.quantity;
    } else {
      items.push(newItem);
    }
    return [...items];
  };

  // Add to cart function
  const addToCart = async (item) => {
    const quantityToAdd = item.quantity ?? 1;
  
    // Kiểm tra xem item này đã tồn tại trong cartItems chưa (ở local)
    const existingItemIndex = cartItems.findIndex(
      (i) =>
        i.product.id === item.product.id &&
        i.size === item.size &&
        i.color === item.color
    );
  
    let updatedCart;
  
    if (existingItemIndex >= 0) {
      // Item đã có, tăng quantity
      updatedCart = [...cartItems];
      updatedCart[existingItemIndex].quantity += quantityToAdd;
    } else {
      // Item chưa có, thêm mới
      updatedCart = [...cartItems, { ...item, quantity: quantityToAdd }];
    }
  
    setCartItems(updatedCart);
  
    if (!isAuthenticated) {
      updateLocalStorage(updatedCart);
    } else {
      try {
        if (existingItemIndex >= 0) {
          // Gọi PUT để update số lượng nếu đã có item trên server
          await axios.put(
            `http://localhost:8080/api/cart/${item.product.id}/${item.size}/${item.color}`,
            { quantity: updatedCart[existingItemIndex].quantity },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } else {
          // Gọi POST để thêm mới item nếu chưa có trên server
          await axios.post(
            'http://localhost:8080/api/cart',
            {
              product: {
                id: item.product.id,
                name: item.product.name,
                price: item.product.price,
                imageUrl: item.product.imageUrl,
                gender: item.product.gender,
                sizes: item.product.sizes,
                colors: item.product.colors,
              },
              size: item.size,
              color: item.color,
              quantity: quantityToAdd,
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
      } catch (error) {
        console.error('Error adding to cart on server:', error.response?.data || error.message);
      }
    }
  };
  
  
  
  const replaceItem = async (oldItem, newItem) => {
    const updatedCart = cartItems.map((item) => {
      if (
        item.product.id === oldItem.product.id &&
        item.size === oldItem.size &&
        item.color === oldItem.color
      ) {
        return {
          ...item,
          size: newItem.size,
          color: newItem.color,
        };
      }
      return item;
    });
  
    setCartItems(updatedCart);
  
    if (!isAuthenticated) {
      updateLocalStorage(updatedCart);
    } else {
      try {
        // Gọi API update trực tiếp nếu backend hỗ trợ đổi size/color
        await axios.put(
          `http://localhost:8080/api/cart/update-details/${oldItem.product.id}/${oldItem.size}/${oldItem.color}`,
          {
            newSize: newItem.size,
            newColor: newItem.color,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } catch (error) {
        console.error("Error updating item details on server:", error);
      }
    }
  };
  
  
  

  // Update quantity
  const updateQuantity = async (productId, size, color, newQuantity) => {
    if (newQuantity < 1) return; // Optionally block quantity < 1

    const updatedCart = cartItems.map((item) =>
      item.product.id === productId && item.size === size && item.color === color
        ? { ...item, quantity: newQuantity }
        : item
    );

    setCartItems(updatedCart);
    if (!isAuthenticated) {
      updateLocalStorage(updatedCart);
    } else {
      try {
        await axios.put(
          `http://localhost:8080/api/cart/${productId}/${size}/${color}`,
          { quantity: newQuantity },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (error) {
        console.error('Error updating quantity on server:', error);
      }
    }
  };

  // Remove from cart
  const removeFromCart = async (productId, size, color) => {
    const updatedCart = cartItems.filter(
      (item) =>
        !(
          item.product.id === productId &&
          item.size === size &&
          item.color === color
        )
    );
    setCartItems(updatedCart);
    if (!isAuthenticated) {
      updateLocalStorage(updatedCart);
    } else {
      try {
        await axios.delete(
          `http://localhost:8080/api/cart/${productId}/${size}/${color}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (error) {
        console.error('Error removing item from server cart:', error);
      }
    }
  };

  // Clear all cart
  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cart');
  };

  // Clear cart in database
  const clearCartInDatabase = async () => {
    if (!isAuthenticated || !token) return;
    try {
      await axios.delete('http://localhost:8080/api/cart', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCartItems([]);
    } catch (error) {
      console.error('Error clearing cart in server:', error);
    }
  };

  // Sync local cart to server on login (merge)
const syncCartOnLogin = async () => {
  if (!isAuthenticated || !token) return;

  const localCart = JSON.parse(localStorage.getItem('cart')) || [];
  if (localCart.length === 0) {
    await loadCart();
    return;
  }

  try {
    // Gọi API /api/cart/merge gửi toàn bộ localCart
    await axios.post(
      'http://localhost:8080/api/cart/merge',
      localCart,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    // Sau khi merge thành công, lấy lại cart mới từ server
    const res = await axios.get('http://localhost:8080/api/cart', {
      headers: { Authorization: `Bearer ${token}` },
    });

    setCartItems(res.data || []);
    localStorage.removeItem('cart'); // Xóa cart local sau khi merge
  } catch (error) {
    console.error('Error merging cart on login:', error);
  }
};


  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        clearCartInDatabase,
        syncCartOnLogin,
        replaceItem,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
