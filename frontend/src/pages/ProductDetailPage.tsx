import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Product, ApiResponse } from '../types';
import { apiClient } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ProductFormModal } from '../components/ProductFormModal';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [addedMessage, setAddedMessage] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const { addToCart } = useCart();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    let active = true;
    apiClient
      .get<ApiResponse<Product>>(`/products/${id}`)
      .then((res) => {
        if (active && res.data.success) {
          setProduct(res.data.data);
        }
      })
      .catch((err) => {
        console.error('Failed to load product details:', err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id, refreshKey]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      setAddedMessage(true);
      setTimeout(() => setAddedMessage(false), 2500);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm('Are you sure you want to delete this product?');
    if (!confirmDelete || !id) return;

    try {
      await apiClient.delete(`/products/${id}`);
      navigate('/products', { replace: true });
    } catch (err) {
      console.error('Failed to delete product:', err);
      alert('Failed to delete product.');
    }
  };

  if (loading) {
    return <p>Loading product details...</p>;
  }

  if (!product) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <h2>Product Not Found</h2>
        <p style={{ marginTop: '1rem' }}>
          <Link to="/products" className="btn btn-secondary">
            &larr; Back to Catalog
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/products" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          &larr; Back to Products
        </Link>
      </div>

      <div className="detail-grid">
        <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', background: '#f8fafc' }}>
          <img
            src={product.imageUrl}
            alt={product.name}
            style={{ width: '100%', height: '100%', maxHeight: '450px', objectFit: 'cover' }}
          />
        </div>

        <div className="flex flex-col justify-between">
          <div>
            <div style={{ marginBottom: '0.25rem' }}>
              <span className="product-category">{product.category}</span>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: '0.5rem 0' }}>{product.name}</h1>
            <div className="flex items-center gap-1" style={{ marginBottom: '1rem', color: 'var(--warning)' }}>
              <span>★ {product.rating.toFixed(1)}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>• ({product.stock} in stock)</span>
            </div>
            <p style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1.5rem' }}>
              ${product.price.toFixed(2)}
            </p>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>About this item</h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: '1.7' }}>{product.description}</p>
            </div>
          </div>

          <div>
            {isAdmin ? (
              <div className="flex gap-2" style={{ marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="btn btn-warning btn-lg"
                  style={{ flex: 1 }}
                >
                  Edit Product
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="btn btn-danger btn-lg"
                  style={{ flex: 1 }}
                >
                  Delete Product
                </button>
              </div>
            ) : (
              <div>
                {addedMessage && (
                  <div className="alert alert-success">
                    Added {quantity} item(s) to your cart!
                  </div>
                )}
                <div className="flex items-center gap-2" style={{ marginTop: '1rem' }}>
                  <div className="flex items-center gap-1">
                    <span className="form-label" style={{ marginBottom: 0, marginRight: '0.25rem' }}>
                      Qty:
                    </span>
                    <div
                      className="flex items-center"
                      style={{
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--surface)',
                        overflow: 'hidden',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="btn btn-secondary"
                        style={{ border: 'none', borderRadius: 0, padding: '0.5rem 0.75rem', fontWeight: 700 }}
                        disabled={quantity <= 1}
                      >
                        -
                      </button>
                      <span
                        style={{
                          minWidth: '40px',
                          textAlign: 'center',
                          fontWeight: 700,
                          fontSize: '0.95rem',
                          display: 'inline-block',
                        }}
                      >
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                        className="btn btn-secondary"
                        style={{ border: 'none', borderRadius: 0, padding: '0.5rem 0.75rem', fontWeight: 700 }}
                        disabled={quantity >= product.stock}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className="btn btn-primary btn-lg"
                    style={{ flex: 1 }}
                  >
                    {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {isAdmin && (
        <ProductFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => setRefreshKey((k) => k + 1)}
          initialProduct={product}
        />
      )}
    </div>
  );
};
