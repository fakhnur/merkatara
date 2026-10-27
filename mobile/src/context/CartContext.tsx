import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, CartItem } from '../types';
import { getCart, saveCart, clearStoredCart } from '../services/storage';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const restoreCart = async () => {
      const savedCart = await getCart();
      if (savedCart && savedCart.length > 0) {
        setCart(savedCart);
      }
    };
    restoreCart();
  }, []);

  const addToCart = (product: Product, quantity = 1) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product._id === product._id);
      let newCart: CartItem[];
      if (existing) {
        newCart = prevCart.map((item) =>
          item.product._id === product._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        newCart = [...prevCart, { product, quantity }];
      }
      saveCart(newCart);
      return newCart;
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => {
      const newCart = prevCart.filter((item) => item.product._id !== productId);
      saveCart(newCart);
      return newCart;
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) => {
      const newCart = prevCart.map((item) =>
        item.product._id === productId ? { ...item, quantity } : item
      );
      saveCart(newCart);
      return newCart;
    });
  };

  const clearCart = () => {
    setCart([]);
    clearStoredCart();
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
