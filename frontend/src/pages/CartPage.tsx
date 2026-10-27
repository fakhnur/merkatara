import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export const CartPage: React.FC = () => {
  const { cart, updateQuantity, removeFromCart, clearCart, totalPrice } = useCart();
  const { user } = useAuth();

  if (user?.role === 'admin') {
    return (
      <div style={{ maxWidth: '600px', margin: '3rem auto', textAlign: 'center', background: 'var(--surface)', padding: '3rem 2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Cart Not Available for Admins</h2>
        <p style={{ color: 'var(--text-muted)', margin: '1rem 0 2rem' }}>
          Administrator accounts cannot perform shopping transactions.
        </p>
        <Link to="/products" className="btn btn-primary">
          Back to Products &rarr;
        </Link>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1.5rem', background: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
        <h2>Your Cart is Empty</h2>
        <p style={{ color: 'var(--text-muted)', margin: '1rem 0 2rem' }}>
          Looks like you haven't added anything to your cart yet.
        </p>
        <Link to="/products" className="btn btn-primary">
          Start Shopping &rarr;
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Shopping Cart</h1>
        <button onClick={clearCart} className="btn btn-secondary btn-sm">
          Clear Cart
        </button>
      </div>

      <div className="cart-grid">
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
          <table className="cart-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th style={{ textAlign: 'center' }}>Quantity</th>
                <th>Subtotal</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {cart.map(({ product, quantity }) => (
                <tr key={product._id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                      />
                      <div>
                        <Link to={`/products/${product._id}`} style={{ fontWeight: 600 }}>
                          {product.name}
                        </Link>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{product.category}</p>
                      </div>
                    </div>
                  </td>
                  <td>${product.price.toFixed(2)}</td>
                  <td style={{ textAlign: 'center' }}>
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => updateQuantity(product._id, quantity - 1)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.2rem 0.6rem' }}
                      >
                        -
                      </button>
                      <span style={{ minWidth: '36px', textAlign: 'center', fontWeight: 600, display: 'inline-block' }}>
                        {quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(product._id, quantity + 1)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.2rem 0.6rem' }}
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td style={{ fontWeight: 700 }}>
                    ${(product.price * quantity).toFixed(2)}
                  </td>
                  <td>
                    <button
                      onClick={() => removeFromCart(product._id)}
                      className="btn btn-danger btn-sm"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="order-summary-card">
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Order Summary</h3>
          <div className="flex justify-between" style={{ color: 'var(--text-muted)' }}>
            <span>Subtotal</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between" style={{ color: 'var(--text-muted)' }}>
            <span>Estimated Shipping</span>
            <span style={{ color: 'var(--success)', fontWeight: 600 }}>FREE</span>
          </div>
          <div
            className="flex justify-between"
            style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', fontSize: '1.15rem', fontWeight: 800 }}
          >
            <span>Total</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
          <Link to="/checkout" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '0.5rem' }}>
            Proceed to Checkout &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
};
