import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { registerRootComponent } from 'expo';
import { AuthProvider } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <CartProvider>
          <StatusBar style="auto" />
          <AppNavigator />
        </CartProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

registerRootComponent(App);
