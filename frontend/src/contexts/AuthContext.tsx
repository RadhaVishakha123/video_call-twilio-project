import { createContext, useState, useEffect, useRef } from 'react';
import { App } from 'antd';
import { api } from '../services/axios';
import {
  UserContextInterface,
  LoginInterface,
  RegisterInterface,
  User,
} from '../helper/type';

export const AuthContext = createContext<UserContextInterface>({
  currentLoggedInUserData: null,
  setCurrentLoggedInUserData: () => {},
  isAuthenticated: false,
  loginUser: async () => false,
  registerUser: async () => false,
});

export default function AuthContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const message = App.useApp().message;
  const refreshTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [currentLoggedInUserData, setCurrentLoggedInUserData] =
    useState<User | null>(null);

  const isAuthenticated = !!currentLoggedInUserData;

  /* ================= HELPERS ================= */

  function getTokenIssueTime(token: string) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.iat * 1000;
    } catch {
      return Date.now();
    }
  }

  function scheduleTokenRefresh(token: string) {
    if (refreshTimeout.current) {
      clearTimeout(refreshTimeout.current);
    }

    const issuedAt = getTokenIssueTime(token);
    const now = Date.now();
    const msUntilRefresh = issuedAt + 55 * 60 * 1000 - now;

    refreshTimeout.current = setTimeout(() => {
      refreshAccessToken();
    }, Math.max(msUntilRefresh, 5000));
  }

  /* ================= API CALLS ================= */

  async function refreshAccessToken() {
    try {
      const res = await api.post(
        '/api/auth/refresh',
        currentLoggedInUserData?.accessToken
      );
      const data = res.data;

      setCurrentLoggedInUserData({
        user: data.user,
        accessToken: data.accessToken,
      });

      scheduleTokenRefresh(data.accessToken);
    } catch (err) {
      console.log('Refresh failed:', err);
      setCurrentLoggedInUserData(null);
    }
  }

  async function loginUser(data: LoginInterface): Promise<boolean> {
    const res = await api.post('/api/auth/login', data);
    const response = await res.data;
    if (response.message !== 'Login success') {
      message.error(response.message);
      return false;
    }

    message.success('Welcome!');

    setCurrentLoggedInUserData({
      user: response.user,
      accessToken: response.accessToken,
    });

    scheduleTokenRefresh(response.accessToken);
    return true;
  }

  async function registerUser(data: RegisterInterface): Promise<boolean> {
    const res = await api.post('/api/auth/register', data);

    const response = await res.data;

    if (response.message !== 'User registered') {
      message.error(response.message);
      return false;
    }

    message.success('Registration successful!');
    return true;
  }

  /* ================= AUTO LOGIN ON APP LOAD ================= */

  useEffect(() => {
    refreshAccessToken();

    return () => {
      if (refreshTimeout.current) {
        clearTimeout(refreshTimeout.current);
      }
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        currentLoggedInUserData,
        setCurrentLoggedInUserData,
        isAuthenticated,
        loginUser,
        registerUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
