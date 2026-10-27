import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/api';

const CATEGORIES = ['Electronics', 'Apparel', 'Accessories', 'Home & Living'];

export const AddProductScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('10');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!name.trim()) {
      setError('Product name is required');
      return;
    }

    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      setError('Price must be greater than 0');
      return;
    }

    const numStock = parseInt(stock, 10);
    if (isNaN(numStock) || numStock < 0) {
      setError('Stock cannot be negative');
      return;
    }

    if (!imageUrl.trim()) {
      setError('Image URL is required');
      return;
    }

    if (!description.trim()) {
      setError('Description is required');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const payload = {
        name: name.trim(),
        category,
        price: numPrice,
        stock: numStock,
        imageUrl: imageUrl.trim(),
        description: description.trim(),
      };

      await apiClient.post('/products', payload);

      // Reset form
      setName('');
      setPrice('');
      setStock('10');
      setImageUrl('');
      setDescription('');

      Alert.alert('Success', 'Product created successfully and added to catalog!', [
        {
          text: 'View Catalog',
          onPress: () => {
            navigation.navigate('CatalogTab');
          },
        },
      ]);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message;
        setError(typeof message === 'string' ? message : 'Failed to create product');
      } else {
        setError('Network error. Failed to save product.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <View style={[styles.container, { paddingTop: Math.max(insets.top, 16), justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#0f172a', marginBottom: 8 }}>
          Administrator Only
        </Text>
        <Text style={{ color: '#64748b', textAlign: 'center', fontSize: 14 }}>
          This section is reserved for inventory maintenance. Please log in with an administrator account.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>Add New Product</Text>
        <Text style={styles.topBarSubtitle}>Create and publish a new item to catalog</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Text style={styles.label}>Product Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Ergonomic Precision Mouse"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Category</Text>
          <View style={styles.categoryRow}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryChip, category === cat && styles.categoryChipActive]}
                onPress={() => setCategory(cat)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    category === cat && styles.categoryChipTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.row}>
            <View style={[styles.col, { marginRight: 8 }]}>
              <Text style={styles.label}>Price ($)</Text>
              <TextInput
                style={styles.input}
                placeholder="49.99"
                keyboardType="decimal-pad"
                value={price}
                onChangeText={setPrice}
              />
            </View>

            <View style={[styles.col, { marginLeft: 8 }]}>
              <Text style={styles.label}>Stock Quantity</Text>
              <TextInput
                style={styles.input}
                placeholder="20"
                keyboardType="number-pad"
                value={stock}
                onChangeText={setStock}
              />
            </View>
          </View>

          <Text style={styles.label}>Image URL</Text>
          <TextInput
            style={styles.input}
            placeholder="https://images.unsplash.com/..."
            autoCapitalize="none"
            value={imageUrl}
            onChangeText={setImageUrl}
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Detailed features, dimensions, and specifications..."
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
          />

          <TouchableOpacity style={styles.submitBtn} onPress={handleCreate} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.submitBtnText}>Publish Product to Catalog</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 14,
    backgroundColor: '#ffffff',
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
  },
  col: {
    flex: 1,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  categoryChipActive: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  categoryChipText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: '#2563eb',
    fontWeight: '700',
  },
  errorBox: {
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 14,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 13,
  },
  submitBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
