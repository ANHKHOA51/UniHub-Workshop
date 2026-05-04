// ============================================================
// UniHub Workshop — Auth Context
// ============================================================

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { User, AuthTokens } from '@/types';
import { USE_MOCK_DATA } from '@/constants/config';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const TOKEN_KEY = 'unihub_access_token';
const REFRESH_KEY = 'unihub_refresh_token';
const USER_KEY = 'unihub_user';

/** Parse JWT payload without external library */
function parseJwtPayload(token: string): Record<string, unknown> {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return {};
  }
}

// ─── Mock login (khi chưa có Backend) ───────────────────────
async function mockLogin(email: string, _password: string): Promise<{ user: User; tokens: AuthTokens }> {
  // Giả lập delay mạng
  await new Promise((r) => setTimeout(r, 800));

  if (!email.includes('@')) {
    throw new Error('Email không hợp lệ');
  }

  return {
    user: {
      id: 'staff-001',
      email,
      fullName: 'Nguyễn Văn A',
      role: 'STAFF',
    },
    tokens: {
      accessToken: 'mock_access_token_' + Date.now(),
      refreshToken: 'mock_refresh_token_' + Date.now(),
    },
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // ─── Khôi phục session từ SecureStore ───────────────────
  useEffect(() => {
    (async () => {
      try {
        const userJson = await SecureStore.getItemAsync(USER_KEY);
        const token = await SecureStore.getItemAsync(TOKEN_KEY);

        if (userJson && token) {
          const user = JSON.parse(userJson) as User;
          setState({ user, isLoading: false, isAuthenticated: true });
        } else {
          setState({ user: null, isLoading: false, isAuthenticated: false });
        }
      } catch {
        setState({ user: null, isLoading: false, isAuthenticated: false });
      }
    })();
  }, []);

  // ─── Login ──────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string) => {
    setState((s) => ({ ...s, isLoading: true }));

    try {
      let user: User;
      let tokens: AuthTokens;

      if (USE_MOCK_DATA) {
        const result = await mockLogin(email, password);
        user = result.user;
        tokens = result.tokens;
      } else {
        // TODO: Real API call
        // const response = await api.post('/auth/login', { email, password });
        // user = response.data.user;
        // tokens = response.data.tokens;
        throw new Error('Real API not implemented');
      }

      // Chỉ cho phép role STAFF đăng nhập vào app check-in
      if (user.role !== 'STAFF') {
        throw new Error('Chỉ nhân sự check-in mới có quyền sử dụng ứng dụng này');
      }

      // Lưu vào SecureStore
      await SecureStore.setItemAsync(TOKEN_KEY, tokens.accessToken);
      await SecureStore.setItemAsync(REFRESH_KEY, tokens.refreshToken);
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));

      setState({ user, isLoading: false, isAuthenticated: true });
    } catch (error) {
      setState((s) => ({ ...s, isLoading: false }));
      throw error;
    }
  }, []);

  // ─── Logout ─────────────────────────────────────────────
  const logout = useCallback(async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
    setState({ user: null, isLoading: false, isAuthenticated: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
