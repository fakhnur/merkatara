import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ProductListScreen } from '../screens/ProductListScreen';
import { ProductDetailScreen } from '../screens/ProductDetailScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { AddProductScreen } from '../screens/AddProductScreen';
import { CartScreen } from '../screens/CartScreen';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { RootStackParamList } from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

const MainTabs: React.FC = () => {
  const { user } = useAuth();
  const { totalItems } = useCart();
  const isAdmin = user?.role === 'admin';

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#64748b',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e2e8f0',
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="CatalogTab"
        component={ProductListScreen}
        options={{
          tabBarLabel: 'Catalog',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size || 22} color={color} />
          ),
        }}
      />

      {isAdmin ? (
        <Tab.Screen
          name="AddProductTab"
          component={AddProductScreen}
          options={{
            tabBarLabel: 'Add Item',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="add-circle-outline" size={size || 24} color={color} />
            ),
          }}
        />
      ) : (
        <Tab.Screen
          name="CartTab"
          component={CartScreen}
          options={{
            tabBarLabel: 'Cart',
            tabBarBadge: totalItems > 0 ? totalItems : undefined,
            tabBarBadgeStyle: {
              backgroundColor: '#2563eb',
              fontSize: 10,
              fontWeight: 'bold',
            },
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="cart-outline" size={size || 24} color={color} />
            ),
          }}
        />
      )}

      <Tab.Screen
        name="AccountTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: isAdmin ? 'Admin' : 'Account',
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name={isAdmin ? 'shield-checkmark-outline' : 'person-outline'}
              size={size || 22}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="MainTabs"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#2563eb',
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerBackTitle: 'Back',
        }}
      >
        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ProductDetail"
          component={ProductDetailScreen}
          options={({ route }) => ({
            title: route.params.title || 'Product Details',
          })}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ title: 'Sign In' }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ title: 'Create Account' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
