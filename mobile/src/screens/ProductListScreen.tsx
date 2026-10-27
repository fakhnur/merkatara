import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { apiClient } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Ionicons } from '@expo/vector-icons';
import { Product, ApiResponse, RootStackParamList } from '../types';
import { ProductFormModal } from '../components/ProductFormModal';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ProductList'>;

export const ProductListScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Admin Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems } = useCart();
  const isAdmin = user?.role === 'admin';
  const navigation = useNavigation<NavigationProp>();

  const loadProducts = () => {
    apiClient
      .get<ApiResponse<Product[]>>('/products')
      .then((res) => {
        if (res.data.success) {
          setProducts(res.data.data);
          setErrorMsg(null);
        }
      })
      .catch((err) => {
        console.error('Mobile failed to fetch products:', err);
        setErrorMsg('Failed to connect to backend.');
      })
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadProducts();
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setModalVisible(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setModalVisible(true);
  };

  const handleDelete = (productId: string, productName: string) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${productName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.delete(`/products/${productId}`);
              loadProducts();
            } catch {
              Alert.alert('Error', 'Failed to delete product.');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() =>
        navigation.navigate('ProductDetail', {
          productId: item._id,
          title: item.name,
        })
      }
    >
      <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardCategory}>{item.category}</Text>
          <Text style={styles.stockText}>Stock: {item.stock}</Text>
        </View>

        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.name}
        </Text>

        <View style={styles.cardFooter}>
          <View>
            <Text style={styles.cardPrice}>${item.price.toFixed(2)}</Text>
            <Text style={styles.cardRating}>★ {item.rating.toFixed(1)}</Text>
          </View>

          {isAdmin ? (
            <View style={styles.adminActionRow}>
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => handleOpenEdit(item)}
              >
                <Text style={styles.editBtnText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDelete(item._id, item.name)}
              >
                <Text style={styles.deleteBtnText}>Delete</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header Bar with Safe Area Insets for visibility */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) + 8 }]}>
        <View style={styles.headerTextGroup}>
          <Text style={styles.headerTitle}>Merkatara</Text>
          <Text style={styles.headerSubtitle}>
            {isAdmin
              ? 'Admin Mode • Inventory Management'
              : isAuthenticated
                ? `Welcome, ${user?.name}`
                : 'Modern Marketplace'}
          </Text>
        </View>

        <View style={styles.headerActionGroup}>
          {!isAdmin && (
            <TouchableOpacity
              style={styles.headerCartBtn}
              onPress={() => navigation.navigate('MainTabs', { screen: 'CartTab' })}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="cart-outline" size={24} color="#0f172a" />
              {totalItems > 0 && (
                <View style={styles.headerCartBadge}>
                  <Text style={styles.headerCartBadgeText}>{totalItems}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}

          {isAuthenticated ? (
            <TouchableOpacity style={styles.authBtn} onPress={logout}>
              <Text style={styles.authBtnText}>Logout</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ flexDirection: 'row', gap: 6 }}>
              <TouchableOpacity
                style={[styles.authBtn, styles.loginBtn]}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={[styles.authBtnText, styles.loginBtnText]}>Login</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.authBtn, styles.registerHeaderBtn]}
                onPress={() => navigation.navigate('Register')}
              >
                <Text style={[styles.authBtnText, styles.registerHeaderBtnText]}>Register</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Main Product List */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563eb']} />
          }
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              {errorMsg ? (
                <View style={{ alignItems: 'center', maxWidth: 300 }}>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#dc2626', marginBottom: 8, textAlign: 'center' }}>
                    Connection Failed
                  </Text>
                  <Text style={{ color: '#64748b', fontSize: 13, textAlign: 'center', marginBottom: 6 }}>
                    {errorMsg}
                  </Text>
                  <Text style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', marginBottom: 16 }}>
                    Target: {apiClient.defaults.baseURL}
                  </Text>
                  <TouchableOpacity
                    style={[styles.authBtn, styles.loginBtn, { paddingHorizontal: 24, paddingVertical: 10 }]}
                    onPress={onRefresh}
                  >
                    <Text style={[styles.authBtnText, styles.loginBtnText]}>Retry Connection</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <Text style={styles.emptyText}>No products available.</Text>
              )}
            </View>
          }
        />
      )}
      {/* Admin Floating Action Button to Add Product */}
      {isAdmin && (
        <TouchableOpacity
          style={styles.fab}
          activeOpacity={0.85}
          onPress={handleOpenAdd}
        >
          <Ionicons name="add" size={32} color="#ffffff" />
        </TouchableOpacity>
      )}

      {/* Admin Add/Edit Modal */}
      {isAdmin && (
        <ProductFormModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onSuccess={loadProducts}
          initialProduct={editingProduct}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  headerTextGroup: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  headerActionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerCartBtn: {
    position: 'relative',
    padding: 6,
    marginRight: 4,
  },
  headerCartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#2563eb',
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  headerCartBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  registerHeaderBtn: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  registerHeaderBtnText: {
    color: '#2563eb',
    fontWeight: '700',
  },
  addHeaderBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  addHeaderBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  authBtn: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  authBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  loginBtn: {
    backgroundColor: '#2563eb',
  },
  loginBtnText: {
    color: '#ffffff',
  },
  listContainer: {
    padding: 16,
    gap: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  cardImage: {
    width: '100%',
    height: 190,
    backgroundColor: '#f1f5f9',
  },
  cardContent: {
    padding: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardCategory: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563eb',
    textTransform: 'uppercase',
  },
  stockText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    lineHeight: 22,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 12,
  },
  cardPrice: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  cardRating: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f59e0b',
    marginTop: 2,
  },
  adminActionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  editBtn: {
    backgroundColor: '#f59e0b',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  editBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  deleteBtn: {
    backgroundColor: '#ef4444',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  deleteBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    color: '#64748b',
    fontSize: 14,
  },
  emptyText: {
    color: '#64748b',
    fontSize: 15,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    backgroundColor: '#2563eb',
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 8,
    zIndex: 50,
  },
  fabIcon: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 34,
  },
});
