import { User } from '../models/User';
import { Product } from '../models/Product';

export const autoSeedIfEmpty = async (): Promise<void> => {
  try {
    let seeded = false;

    // Check & seed Admin user
    const existingAdmin = await User.findOne({ email: 'admin@market.com' });
    if (!existingAdmin) {
      await User.create({
        name: 'System Admin',
        email: 'admin@market.com',
        password: 'admin123',
        role: 'admin',
      });
      seeded = true;
    }

    // Check & seed Regular user
    const existingUser = await User.findOne({ email: 'user@market.com' });
    if (!existingUser) {
      await User.create({
        name: 'Demo Customer',
        email: 'user@market.com',
        password: 'user123',
        role: 'user',
      });
      seeded = true;
    }

    // Check & seed sample products
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      const sampleProducts = [
        {
          name: 'Wireless Noise-Canceling Headphones',
          description: 'Premium over-ear wireless headphones with active noise cancellation, 30-hour battery life, and high-fidelity audio drivers.',
          price: 199.99,
          category: 'Electronics',
          stock: 45,
          imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
          rating: 4.8,
        },
        {
          name: 'Ultra-Slim Mechanical Keyboard',
          description: 'Low-profile mechanical keyboard with customizable RGB backlighting, hot-swappable switches, and multi-device Bluetooth connectivity.',
          price: 89.99,
          category: 'Electronics',
          stock: 30,
          imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80',
          rating: 4.6,
        },
        {
          name: 'Ergonomic Precision Mouse',
          description: 'Wireless ergonomic mouse designed to reduce wrist strain with adjustable DPI optical sensor and ultra-fast scroll wheel.',
          price: 59.99,
          category: 'Electronics',
          stock: 60,
          imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80',
          rating: 4.5,
        },
        {
          name: 'Classic Minimalist Backpack',
          description: 'Water-resistant everyday commuter backpack with padded 15-inch laptop sleeve and organized interior dividers.',
          price: 74.99,
          category: 'Accessories',
          stock: 25,
          imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80',
          rating: 4.7,
        },
        {
          name: 'Stainless Steel Insulated Water Bottle',
          description: 'Double-walled vacuum insulated flask keeping beverages cold for 24 hours or hot for 12 hours. BPA-free 750ml.',
          price: 24.99,
          category: 'Accessories',
          stock: 100,
          imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80',
          rating: 4.9,
        },
        {
          name: 'Organic Cotton Crewneck T-Shirt',
          description: '100% certified organic ring-spun combed cotton t-shirt with a modern tailored unisex fit.',
          price: 29.99,
          category: 'Apparel',
          stock: 80,
          imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80',
          rating: 4.4,
        },
        {
          name: 'Vintage Denim Trucker Jacket',
          description: 'Durable heavyweight cotton denim jacket with button flap chest pockets and adjustable waist tabs.',
          price: 119.99,
          category: 'Apparel',
          stock: 20,
          imageUrl: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&auto=format&fit=crop&q=80',
          rating: 4.7,
        },
        {
          name: 'Smart Fitness Tracker Watch',
          description: 'Comprehensive health monitoring including heart rate, SpO2, sleep tracking, GPS activity logging, and 7-day battery life.',
          price: 149.99,
          category: 'Electronics',
          stock: 35,
          imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
          rating: 4.6,
        },
      ];
      await Product.insertMany(sampleProducts);
      seeded = true;
    }

    if (seeded) {
      console.log('Database seeded successfully');
    }
  } catch (error) {
    console.error('Seeding error:', error);
  }
};
