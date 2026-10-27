import React, { useState } from 'react';
import {
  Modal,
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
import axios from 'axios';
import { Product } from '../types';
import { apiClient } from '../services/api';

interface ProductFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialProduct?: Product | null;
}

const CATEGORIES = ['Electronics', 'Apparel', 'Accessories', 'Home & Living'];

const ProductFormContent: React.FC<{
  initialProduct?: Product | null;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ initialProduct, onClose, onSuccess }) => {
  const isEdit = !!initialProduct;

  const [name, setName] = useState(initialProduct?.name || '');
  const [category, setCategory] = useState(initialProduct?.category || 'Electronics');
  const [price, setPrice] = useState(initialProduct ? String(initialProduct.price) : '');
  const [stock, setStock] = useState(initialProduct ? String(initialProduct.stock) : '10');
  const [imageUrl, setImageUrl] = useState(initialProduct?.imageUrl || '');
  const [description, setDescription] = useState(initialProduct?.description || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
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

      if (isEdit && initialProduct) {
        await apiClient.put(`/products/${initialProduct._id}`, payload);
      } else {
        await apiClient.post('/products', payload);
      }

      Alert.alert(
        'Success',
        isEdit ? 'Product updated successfully!' : 'Product created successfully!',
        [{ text: 'OK', onPress: () => { onSuccess(); onClose(); } }]
      );
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message;
        setError(typeof message === 'string' ? message : 'Failed to save product');
      } else {
        setError('Network error while saving product');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.modalCard}>
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>{isEdit ? 'Edit Product' : 'Add New Product'}</Text>
        <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.closeBtn}>✕</Text>
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>Product Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Wireless Noise-Canceling Headphones"
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
              placeholder="99.99"
              keyboardType="decimal-pad"
              value={price}
              onChangeText={setPrice}
            />
          </View>

          <View style={[styles.col, { marginLeft: 8 }]}>
            <Text style={styles.label}>Stock Quantity</Text>
            <TextInput
              style={styles.input}
              placeholder="25"
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
          placeholder="Detailed specifications and product features..."
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
        />
      </ScrollView>

      <View style={styles.footerRow}>
        <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Text style={styles.submitBtnText}>{isEdit ? 'Save Changes' : 'Create Product'}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  visible,
  onClose,
  onSuccess,
  initialProduct,
}) => {
  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <ProductFormContent
          key={initialProduct?._id || 'new'}
          initialProduct={initialProduct}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  closeBtn: {
    fontSize: 20,
    color: '#64748b',
    fontWeight: 'bold',
  },
  formScroll: {
    maxHeight: 400,
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
    padding: 10,
    fontSize: 14,
    marginBottom: 14,
    backgroundColor: '#f8fafc',
  },
  textArea: {
    height: 80,
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
    backgroundColor: '#f8fafc',
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
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 13,
  },
  footerRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#475569',
  },
  submitBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#2563eb',
    alignItems: 'center',
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});
