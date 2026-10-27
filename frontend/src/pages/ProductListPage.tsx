import React, { useEffect, useState } from 'react';
import { Product, ApiResponse } from '../types';
import { apiClient } from '../services/api';
import { ProductCard } from '../components/ProductCard';
import { ProductFormModal } from '../components/ProductFormModal';
import { useAuth } from '../context/AuthContext';

export const ProductListPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  // Admin Maintenance State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    let active = true;
    const params: Record<string, string> = {};
    if (selectedCategory !== 'All') {
      params.category = selectedCategory;
    }
    if (searchQuery.trim()) {
      params.search = searchQuery.trim();
    }

    apiClient
      .get<ApiResponse<Product[]>>('/products', { params })
      .then((res) => {
        if (active && res.data.success) {
          setProducts(res.data.data);
          setCategories((prev) => {
            if (prev.length === 1) {
              const uniqueCats = Array.from(new Set(res.data.data.map((p) => p.category)));
              return ['All', ...uniqueCats];
            }
            return prev;
          });
        }
      })
      .catch((err) => {
        console.error('Failed to fetch products:', err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [selectedCategory, searchQuery, refreshKey]);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this product?');
    if (!confirmDelete) return;

    try {
      await apiClient.delete(`/products/${productId}`);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      console.error('Failed to delete product:', err);
      alert('Failed to delete product. Please check admin permissions.');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.25rem' }}>Product Catalog</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Browse our complete range of products.
          </p>
        </div>

        {isAdmin && (
          <button onClick={handleOpenAddModal} className="btn btn-primary">
            + Add New Product
          </button>
        )}
      </div>

      {/* Filter and Search Controls */}
      <div
        className="flex items-center justify-between gap-2"
        style={{
          flexWrap: 'wrap',
          background: 'var(--surface)',
          padding: '1.25rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)',
          marginBottom: '2rem',
        }}
      >
        <div className="flex items-center gap-1" style={{ flexWrap: 'wrap' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`btn btn-sm ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div style={{ minWidth: '240px' }}>
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
          />
        </div>
      </div>

      {/* Product List Grid */}
      {loading ? (
        <p>Loading catalog items...</p>
      ) : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
          <h3>No products found</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Try adjusting your search query or category filter.
          </p>
        </div>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onEdit={isAdmin ? handleOpenEditModal : undefined}
              onDelete={isAdmin ? handleDeleteProduct : undefined}
            />
          ))}
        </div>
      )}

      {/* Admin Product Form Modal */}
      {isAdmin && (
        <ProductFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => setRefreshKey((k) => k + 1)}
          initialProduct={editingProduct}
        />
      )}
    </div>
  );
};
