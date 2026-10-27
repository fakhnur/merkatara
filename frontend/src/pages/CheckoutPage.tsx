import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/api';
export const CheckoutPage: React.FC = () => {
  const { cart, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || '',
    address: 'Jl. Sudirman No. 123',
    city: 'Jakarta',
    postalCode: '10220',
    paymentMethod: 'Credit Card',
  });

  const [orderPlaced, setOrderPlaced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const orderPayload = {
        items: cart.map((item) => ({
          productId: item.product._id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
        })),
        shippingAddress,
      };

      const response = await apiClient.post('/orders', orderPayload);
      if (response.data.success) {
        setOrderPlaced(true);
        clearCart();
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message;
        setError(typeof message === 'string' ? message : 'Failed to place order.');
      } else {
        setError('Network error. Failed to place order.');
      }
    } finally {
      setLoading(false);
    }
  };
  if (user?.role === 'admin') {
    return (
      <div style={{ maxWidth: '600px', margin: '3rem auto', textAlign: 'center', background: 'var(--surface)', padding: '3rem 2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Checkout Restricted</h2>
        <p style={{ color: 'var(--text-muted)', margin: '1rem 0 2rem' }}>
          Administrator accounts cannot place orders. Please switch to a customer account to checkout.
        </p>
        <Link to="/products" className="btn btn-primary">
          Return to Products &rarr;
        </Link>
      </div>
    );
  }


  if (orderPlaced) {
    return (
      <div style={{ maxWidth: '540px', margin: '3rem auto', textAlign: 'center', background: 'var(--surface)', padding: '3rem 2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
        <div style={{ fontSize: '3rem', color: 'var(--success)', marginBottom: '1rem' }}>✓</div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Order Confirmed!</h2>
        <p style={{ color: 'var(--text-muted)', margin: '1rem 0 2rem' }}>
          Thank you for your purchase, <strong>{shippingAddress.fullName}</strong>. Your order is being processed and will be delivered shortly.
        </p>
        <button onClick={() => navigate('/products')} className="btn btn-primary">
          Continue Shopping
        </button>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
        <h2>No items to checkout</h2>
        <p style={{ margin: '1rem 0' }}>Your cart is currently empty.</p>
        <Link to="/products" className="btn btn-primary">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '2rem' }}>Checkout</h1>

      <div className="cart-grid">
        <form onSubmit={handleSubmit} style={{ background: 'var(--surface)', padding: '2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>Shipping Information</h2>
          {error && <div className="alert alert-danger">{error}</div>}
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              required
              className="form-input"
              value={shippingAddress.fullName}
              onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Delivery Address</label>
            <input
              type="text"
              required
              className="form-input"
              value={shippingAddress.address}
              onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
            />
          </div>

          <div className="flex gap-2">
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">City</label>
              <input
                type="text"
                required
                className="form-input"
                value={shippingAddress.city}
                onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Postal Code</label>
              <input
                type="text"
                required
                className="form-input"
                value={shippingAddress.postalCode}
                onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Payment Method</label>
            <select
              className="form-input"
              value={shippingAddress.paymentMethod}
              onChange={(e) => setShippingAddress({ ...shippingAddress, paymentMethod: e.target.value })}
            >
              <option value="Credit Card">Credit Card / Debit Online</option>
              <option value="Bank Transfer">Bank Transfer (Virtual Account)</option>
              <option value="E-Wallet">E-Wallet (GoPay, OVO, Dana)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '1rem' }}
          >
            {loading ? 'Processing Order...' : `Confirm & Place Order ($${totalPrice.toFixed(2)})`}
          </button>
        </form>

        <div className="order-summary-card">
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Summary ({cart.length} items)</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '300px', overflowY: 'auto' }}>
            {cart.map(({ product, quantity }) => (
              <div key={product._id} className="flex justify-between items-center" style={{ fontSize: '0.875rem' }}>
                <span style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {quantity}x {product.name}
                </span>
                <span>${(product.price * quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '0.5rem' }}>
            <div className="flex justify-between" style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              <span>Subtotal</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between" style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              <span>Shipping</span>
              <span style={{ color: 'var(--success)', fontWeight: 600 }}>FREE</span>
            </div>
            <div className="flex justify-between" style={{ fontSize: '1.2rem', fontWeight: 800 }}>
              <span>Total</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
