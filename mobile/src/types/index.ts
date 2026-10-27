export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  imageUrl: string;
  rating: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data: {
    token: string;
    user: User;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  count?: number;
  data: T;
}

export type RootStackParamList = {
  MainTabs: { screen?: string } | undefined;
  ProductList: undefined;
  ProductDetail: { productId: string; title: string };
  Login: undefined;
  Register: undefined;
  Profile: undefined;
  Cart: undefined;
};
