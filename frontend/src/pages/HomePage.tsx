import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Product, ApiResponse } from '../types';
import { apiClient } from '../services/api';
import { ProductCard } from '../components/ProductCard';

export const HomePage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await apiClient.get<ApiResponse<Product[]>>('/products');
        if (response.data.success) {
          setFeaturedProducts(response.data.data.slice(0, 8));
        }
      } catch (err) {
        console.error('Failed to load featured products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  return (
    <div>
      <section className="hero">
        <h1>Discover Premium Essentials for Modern Living</h1>
        <p>
          Curated electronics, minimalist accessories, and organic apparel. Built with high performance, strict TypeScript, and instant zero-configuration delivery.
        </p>
        <div>
          <Link to="/products" className="btn btn-secondary btn-lg">
            Shop Catalog Now &rarr;
          </Link>
        </div>
      </section>

      <section style={{ marginBottom: '3rem' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Featured Products</h2>
            <p style={{ color: 'var(--text-muted)' }}>Handpicked top-rated products from our catalog</p>
          </div>
          <Link to="/products" className="btn btn-secondary btn-sm">
            View All &rarr;
          </Link>
        </div>

        {loading ? (
          <p>Loading featured products...</p>
        ) : (
          <div className="product-grid">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
