import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { apiClient } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Product, ApiResponse, RootStackParamList } from '../types';
import { ProductFormModal } from '../components/ProductFormModal';
import { Ionicons } from '@expo/vector-icons';

type DetailRouteProp = RouteProp<RootStackParamList, 'ProductDetail'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ProductDetailScreen: React.FC = () => {
  const route = useRoute<DetailRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { productId } = route.params;
  const { user } = useAuth();
  const { addToCart } = useCart();
  const isAdmin = user?.role === 'admin';
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    apiClient
      .get<ApiResponse<Product>>(`/products/${productId}`)
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
  }, [productId, refreshKey]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, 1);
      setToastMsg(`Added "${product.name}" to cart!`);
      setTimeout(() => {
        setToastMsg(null);
      }, 2200);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${product?.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.delete(`/products/${productId}`);
              Alert.alert('Success', 'Product deleted successfully', [
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
            } catch {
              Alert.alert('Error', 'Failed to delete product.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading product details...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Product not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {toastMsg && (
        <View style={styles.toast}>
          <Ionicons name="checkmark-circle" size={20} color="#10b981" />
          <Text style={styles.toastText} numberOfLines={1}>
            {toastMsg}
          </Text>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image source={{ uri: product.imageUrl }} style={styles.image} />
        <View style={styles.detailsContainer}>
          <Text style={styles.category}>{product.category}</Text>
          <Text style={styles.title}>{product.name}</Text>

          <View style={styles.ratingRow}>
            <Text style={styles.rating}>★ {product.rating.toFixed(1)}</Text>
            <Text style={styles.stockText}>• {product.stock} items remaining</Text>
          </View>

          <Text style={styles.price}>${product.price.toFixed(2)}</Text>

          <View style={styles.divider} />

          <Text style={styles.sectionHeader}>Description</Text>
          <Text style={styles.description}>{product.description}</Text>
        </View>
      </ScrollView>

      {/* Floating Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomPriceLabel}>Total Price</Text>
          <Text style={styles.bottomPrice}>${product.price.toFixed(2)}</Text>
        </View>

        {isAdmin ? (
          <View style={styles.adminBottomRow}>
            <TouchableOpacity
              style={styles.editBottomBtn}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.editBottomBtnText}>Edit Product</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteBottomBtn}
              onPress={handleDelete}
            >
              <Text style={styles.deleteBottomBtnText}>Delete</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.buyBtn, product.stock === 0 && styles.disabledBtn]}
            onPress={handleAddToCart}
            disabled={product.stock === 0}
          >
            <Text style={styles.buyBtnText}>
              {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {isAdmin && (
        <ProductFormModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onSuccess={() => setRefreshKey((k) => k + 1)}
          initialProduct={product}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  image: {
    width: '100%',
    height: 300,
    backgroundColor: '#f1f5f9',
  },
  detailsContainer: {
    padding: 20,
  },
  category: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563eb',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0f172a',
    lineHeight: 28,
    marginBottom: 10,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f59e0b',
  },
  stockText: {
    fontSize: 13,
    color: '#64748b',
  },
  price: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0f172a',
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 20,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 24,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 4,
    elevation: 8,
  },
  bottomPriceLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  bottomPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  buyBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 8,
  },
  disabledBtn: {
    backgroundColor: '#94a3b8',
  },
  buyBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  adminBottomRow: {
    flexDirection: 'row',
    gap: 10,
  },
  editBottomBtn: {
    backgroundColor: '#f59e0b',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  editBottomBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  deleteBottomBtn: {
    backgroundColor: '#ef4444',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  deleteBottomBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  loadingText: {
    marginTop: 12,
    color: '#64748b',
    fontSize: 14,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 16,
  },
  toast: {
    position: 'absolute',
    top: 16,
    left: 20,
    right: 20,
    backgroundColor: '#0f172a',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 10,
    zIndex: 100,
  },
  toastText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
});
