import { createContext, useState, useEffect, useRef } from 'react';
import { App } from 'antd';
import axios from 'axios';
import { API_BASE_URL } from '../config';
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
  logoutUser: async () => {},
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
  function getCookie(name: string) {
    return document.cookie
      .split('; ')
      .find((row) => row.startsWith(name + '='))
      ?.split('=')[1];
  }

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
      const res = await axios.post(
        `${API_BASE_URL}/api/auth/refresh`,
        { refreshToken: getCookie('refreshToken') },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
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
  //login
  async function loginUser(data: LoginInterface): Promise<boolean> {
    const res = await axios.post(`${API_BASE_URL}/api/auth/login`, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
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
    document.cookie = `refreshToken=${response.refreshToken}; Path=/; Max-Age=${
      7 * 24 * 60 * 60
    }`;

    scheduleTokenRefresh(response.accessToken);
    return true;
  }
  // register
  async function registerUser(data: RegisterInterface): Promise<boolean> {
    const res = await axios.post(`${API_BASE_URL}/api/auth/register`, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await res.data;

    if (response.message !== 'User registered') {
      message.error(response.message);
      return false;
    }

    message.success('Registration successful!');
    return true;
  }
  // logoutUser
  async function logoutUser() {
    setCurrentLoggedInUserData(null);
    if (refreshTimeout.current) {
      clearTimeout(refreshTimeout.current);
    }
    await axios.post(
      `${API_BASE_URL}/api/auth/logout`,
      { refreshToken: getCookie('refreshToken') },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }

  /* ================= AUTO LOGIN ON APP LOAD ================= */

  useEffect(() => {
    if (currentLoggedInUserData?.accessToken) {
      scheduleTokenRefresh(currentLoggedInUserData.accessToken);
    } else {
      refreshAccessToken();
    }

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
        logoutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
