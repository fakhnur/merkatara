import * as SecureStore from 'expo-secure-store';
import { User, CartItem } from '../types';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';
const CART_KEY = 'auth_cart';

export const saveToken = async (token: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } catch (error) {
    console.error('Failed to save token to SecureStore:', error);
  }
};

export const getToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch (error) {
    console.error('Failed to read token from SecureStore:', error);
    return null;
  }
};

export const deleteToken = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch (error) {
    console.error('Failed to delete token from SecureStore:', error);
  }
};

export const saveUser = async (user: User): Promise<void> => {
  try {
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Failed to save user to SecureStore:', error);
  }
};

export const getUser = async (): Promise<User | null> => {
  try {
    const raw = await SecureStore.getItemAsync(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error('Failed to read user from SecureStore:', error);
    return null;
  }
};

export const deleteUser = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(USER_KEY);
  } catch (error) {
    console.error('Failed to delete user from SecureStore:', error);
  }
};

export const saveCart = async (cart: CartItem[]): Promise<void> => {
  try {
    await SecureStore.setItemAsync(CART_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error('Failed to save cart to SecureStore:', error);
  }
};

export const getCart = async (): Promise<CartItem[]> => {
  try {
    const raw = await SecureStore.getItemAsync(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error('Failed to read cart from SecureStore:', error);
    return [];
  }
};

export const clearStoredCart = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(CART_KEY);
  } catch (error) {
    console.error('Failed to clear stored cart:', error);
  }
};
