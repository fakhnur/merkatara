import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ProfileScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated, logout } = useAuth();
  const navigation = useNavigation<NavigationProp>();

  const isAdmin = user?.role === 'admin';

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>Account & Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {isAuthenticated && user ? (
          <View style={styles.userCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user.name.charAt(0).toUpperCase()}
              </Text>
            </View>

            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>

            <View style={[styles.roleBadge, isAdmin ? styles.adminBadge : styles.customerBadge]}>
              <Text style={[styles.roleText, isAdmin ? styles.adminText : styles.customerText]}>
                {isAdmin ? 'ADMINISTRATOR' : 'CUSTOMER'}
              </Text>
            </View>


            <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
              <Text style={styles.logoutBtnText}>Logout</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.guestCard}>
            <Text style={styles.guestTitle}>Welcome to Merkatara</Text>
            <Text style={styles.guestSubtitle}>
              Sign in to manage inventory or access personalized features.
            </Text>

            <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
              <TouchableOpacity
                style={[styles.signInBtn, { flex: 1, paddingHorizontal: 0, alignItems: 'center' }]}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.signInBtnText}>Sign In</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.signInBtn, styles.registerOutlineBtn, { flex: 1, paddingHorizontal: 0, alignItems: 'center' }]}
                onPress={() => navigation.navigate('Register')}
              >
                <Text style={styles.registerOutlineText}>Register</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

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
  content: {
    padding: 20,
  },
  userCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  userEmail: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
    marginBottom: 12,
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 20,
  },
  adminBadge: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  customerBadge: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  roleText: {
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  adminText: {
    color: '#334155',
  },
  customerText: {
    color: '#2563eb',
  },
  adminInfoBox: {
    width: '100%',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 20,
  },
  adminInfoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 4,
  },
  adminInfoDesc: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 18,
    marginBottom: 12,
  },
  addProductBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  addProductBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  logoutBtn: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
  },
  logoutBtnText: {
    color: '#dc2626',
    fontSize: 15,
    fontWeight: 'bold',
  },
  guestCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginTop: 20,
  },
  guestTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 8,
  },
  guestSubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  signInBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  signInBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  registerOutlineBtn: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#2563eb',
  },
  registerOutlineText: {
    color: '#2563eb',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
