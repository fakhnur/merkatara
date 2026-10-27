import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

interface ProductCardProps {
  product: Product;
  onEdit?: (product: Product) => void;
  onDelete?: (productId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onEdit,
  onDelete,
}) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <div className="product-card">
      <Link to={`/products/${product._id}`} className="product-image-wrap">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="product-image"
          loading="lazy"
        />
      </Link>
      <div className="product-body">
        <div className="flex justify-between items-center" style={{ marginBottom: '0.25rem' }}>
          <span className="product-category">{product.category}</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Stock: <strong>{product.stock}</strong>
          </span>
        </div>
        <Link to={`/products/${product._id}`}>
          <h3 className="product-title">{product.name}</h3>
        </Link>
        <p className="product-desc">{product.description}</p>
        <div className="product-footer">
          <span className="product-price">${product.price.toFixed(2)}</span>

          {isAdmin ? (
            <div className="flex gap-1">
              {onEdit && (
                <button
                  type="button"
                  onClick={() => onEdit(product)}
                  className="btn btn-warning btn-sm"
                  title="Edit Product"
                >
                  Edit
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(product._id)}
                  className="btn btn-danger btn-sm"
                  title="Maintenance: Delete Product"
                >
                  Delete
                </button>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => addToCart(product, 1)}
              className="btn btn-primary btn-sm"
            >
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
