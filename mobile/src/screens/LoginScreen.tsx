import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/api';
import { AuthResponse, RootStackParamList } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const navigation = useNavigation<NavigationProp>();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in both fields');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', {
        email,
        password,
      });

      if (response.data.success) {
        await login(response.data.data.token, response.data.data.user);
        navigation.navigate('MainTabs');
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message;
        setError(typeof message === 'string' ? message : 'Invalid email or password');
      } else {
        setError('Network error. Check backend connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Merkatara</Text>
        <Text style={styles.subtitle}>Sign in with your account to sync cart and orders</Text>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <Text style={styles.label}>Email Address</Text>
        <TextInput
          style={styles.input}
          placeholder="user@market.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Sign In</Text>
          )}
        </TouchableOpacity>

        <View style={styles.demoSection}>
          <Text style={styles.demoTitle}>Quick Fill Demo Credentials:</Text>
          <View style={styles.demoRow}>
            <TouchableOpacity
              style={styles.demoButton}
              onPress={() => handleQuickFill('admin@market.com', 'admin123')}
            >
              <Text style={styles.demoButtonText}>Admin</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.demoButton}
              onPress={() => handleQuickFill('user@market.com', 'user123')}
            >
              <Text style={styles.demoButtonText}>Customer</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerLink}>Register</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 20,
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
    fontSize: 15,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#2563eb',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorBox: {
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 13,
    textAlign: 'center',
  },
  demoSection: {
    marginTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 16,
  },
  demoTitle: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 10,
  },
  demoRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  demoButton: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  demoButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#64748b',
  },
  registerLink: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: 'bold',
  },
});
