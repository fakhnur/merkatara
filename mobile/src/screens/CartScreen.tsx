import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { CartItem } from '../types';
import { apiClient } from '../services/api';

export const CartScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { cart, updateQuantity, removeFromCart, clearCart, totalPrice, totalItems } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [checkingOut, setCheckingOut] = useState(false);

  const isAdmin = user?.role === 'admin';

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Sign In Required',
        'You need to sign in with a customer account before checking out.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => navigation.navigate('Login') },
        ]
      );
      return;
    }

    if (isAdmin) {
      Alert.alert('Restricted', 'Administrator accounts cannot place orders.');
      return;
    }

    if (cart.length === 0) return;

    setCheckingOut(true);

    try {
      const orderPayload = {
        items: cart.map((item) => ({
          productId: item.product._id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
        })),
        shippingAddress: {
          fullName: user?.name || 'Customer',
          address: 'Jl. Merdeka No. 45',
          city: 'Jakarta',
          postalCode: '10110',
          paymentMethod: 'Credit Card',
        },
      };

      const res = await apiClient.post('/orders', orderPayload);
      if (res.data.success) {
        clearCart();
        Alert.alert(
          'Order Confirmed!',
          `Thank you for your purchase! Total: $${totalPrice.toFixed(2)}. Inventory stock has been updated.`,
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('CatalogTab'),
            },
          ]
        );
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message;
        Alert.alert('Checkout Failed', typeof message === 'string' ? message : 'Failed to place order.');
      } else {
        Alert.alert('Error', 'Network error. Please check backend connection.');
      }
    } finally {
      setCheckingOut(false);
    }
  };

  const renderItem = ({ item }: { item: CartItem }) => (
    <View style={styles.cartCard}>
      <Image source={{ uri: item.product.imageUrl }} style={styles.productThumb} />
      <View style={styles.cardDetails}>
        <Text style={styles.productName} numberOfLines={1}>
          {item.product.name}
        </Text>
        <Text style={styles.productPrice}>${item.product.price.toFixed(2)}</Text>

        <View style={styles.quantityRow}>
          <View style={styles.stepperContainer}>
            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() => updateQuantity(item.product._id, item.quantity - 1)}
            >
              <Text style={styles.stepBtnText}>-</Text>
            </TouchableOpacity>

            <Text style={styles.qtyText}>{item.quantity}</Text>

            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() => updateQuantity(item.product._id, item.quantity + 1)}
            >
              <Text style={styles.stepBtnText}>+</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => removeFromCart(item.product._id)}
          >
            <Text style={styles.deleteText}>Remove</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
      <View style={styles.topBar}>
        <View>
          <Text style={styles.topBarTitle}>Shopping Cart</Text>
          <Text style={styles.topBarSubtitle}>{totalItems} item(s) in cart</Text>
        </View>
        {cart.length > 0 && !isAdmin && (
          <TouchableOpacity onPress={clearCart} style={styles.clearBtn}>
            <Text style={styles.clearBtnText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {isAdmin ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyTitle}>Cart Restricted for Admin</Text>
          <Text style={styles.emptySubtitle}>
            Administrator accounts are reserved for catalog maintenance. Please use a customer account to checkout.
          </Text>
          <TouchableOpacity
            style={styles.shopBtn}
            onPress={() => navigation.navigate('CatalogTab')}
          >
            <Text style={styles.shopBtnText}>Return to Catalog</Text>
          </TouchableOpacity>
        </View>
      ) : cart.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={{ fontSize: 48, marginBottom: 12 }}>🛒</Text>
          <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
          <Text style={styles.emptySubtitle}>
            Looks like you have not added any products to your shopping cart yet.
          </Text>
          <TouchableOpacity
            style={styles.shopBtn}
            onPress={() => navigation.navigate('CatalogTab')}
          >
            <Text style={styles.shopBtnText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <FlatList
            data={cart}
            keyExtractor={(item) => item.product._id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
          />

          {/* Checkout Bar */}
          <View style={styles.checkoutBar}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total ({totalItems} items):</Text>
              <Text style={styles.summaryAmount}>${totalPrice.toFixed(2)}</Text>
            </View>

            <TouchableOpacity
              style={[styles.checkoutBtn, checkingOut && { opacity: 0.7 }]}
              onPress={handleCheckout}
              disabled={checkingOut}
            >
              {checkingOut ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.checkoutBtnText}>
                  Proceed to Checkout (${totalPrice.toFixed(2)})
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  topBar: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topBarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  topBarSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  clearBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#fee2e2',
    borderRadius: 6,
  },
  clearBtnText: {
    color: '#dc2626',
    fontSize: 12,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 120,
  },
  cartCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  productThumb: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    marginRight: 14,
  },
  cardDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 8,
  },
  quantityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    backgroundColor: '#f8fafc',
    overflow: 'hidden',
  },
  stepBtn: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: '#ffffff',
  },
  stepBtnText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#334155',
  },
  qtyText: {
    minWidth: 32,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 14,
    color: '#0f172a',
  },
  deleteBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  deleteText: {
    fontSize: 12,
    color: '#dc2626',
    fontWeight: '600',
  },
  checkoutBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 4,
    elevation: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  summaryAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  checkoutBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  checkoutBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  shopBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 8,
  },
  shopBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
