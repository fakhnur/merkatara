import React, { useState } from 'react';
import axios from 'axios';
import { Product } from '../types';
import { apiClient } from '../services/api';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialProduct?: Product | null;
}

const ProductFormContent: React.FC<{
  initialProduct?: Product | null;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ initialProduct, onClose, onSuccess }) => {
  const isEdit = !!initialProduct;
  const [name, setName] = useState(initialProduct?.name || '');
  const [description, setDescription] = useState(initialProduct?.description || '');
  const [price, setPrice] = useState<number | ''>(initialProduct?.price ?? '');
  const [category, setCategory] = useState(initialProduct?.category || 'Electronics');
  const [stock, setStock] = useState<number | ''>(initialProduct?.stock ?? 10);
  const [imageUrl, setImageUrl] = useState(initialProduct?.imageUrl || '');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (price === '' || price <= 0) {
      setError('Price must be greater than 0');
      return;
    }

    if (stock === '' || stock < 0) {
      setError('Stock cannot be negative');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name,
        description,
        price: Number(price),
        category,
        stock: Number(stock),
        imageUrl,
      };

      if (isEdit && initialProduct) {
        await apiClient.put(`/products/${initialProduct._id}`, payload);
      } else {
        await apiClient.post('/products', payload);
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message;
        setError(typeof message === 'string' ? message : 'Operation failed');
      } else {
        setError('Network error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>
          {isEdit ? 'Edit Product' : 'Add New Product'}
        </h2>
        <button onClick={onClose} style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}>
          ×
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Product Name</label>
          <input
            type="text"
            required
            className="form-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Ergonomic Office Chair"
          />
        </div>

        <div className="flex gap-2">
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Category</label>
            <select
              className="form-input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="Electronics">Electronics</option>
              <option value="Apparel">Apparel</option>
              <option value="Accessories">Accessories</option>
              <option value="Home & Living">Home & Living</option>
            </select>
          </div>

          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Price ($)</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              className="form-input"
              value={price}
              onChange={(e) => setPrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
            />
          </div>

          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Stock Quantity</label>
            <input
              type="number"
              min="0"
              required
              className="form-input"
              value={stock}
              onChange={(e) => setStock(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Image URL</label>
          <input
            type="url"
            required
            className="form-input"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://images.unsplash.com/..."
          />
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            required
            rows={4}
            className="form-input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detailed product specifications and highlights..."
            style={{ resize: 'vertical' }}
          />
        </div>

        <div className="flex justify-between items-center gap-2" style={{ marginTop: '1.5rem' }}>
          <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn btn-primary" style={{ flex: 1 }}>
            {loading ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialProduct,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <ProductFormContent
        key={initialProduct?._id || 'new'}
        initialProduct={initialProduct}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    </div>
  );
};
