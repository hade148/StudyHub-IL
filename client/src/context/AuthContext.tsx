import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import api from '../utils/api';

interface User {
  id: string;
  fullName: string;
  email: string;
  role?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  institution?: string;
  fieldOfStudy?: string;
  website?: string;
  interests?: string[];
  createdAt?: string;
  _count?: {
    summaries: number;
    forumPosts: number;
    forumComments: number;
    ratings: number;
  };
}

interface ProfileUpdateData {
  fullName?: string;
  bio?: string;
  location?: string;
  institution?: string;
  fieldOfStudy?: string;
  website?: string;
  interests?: string[];
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  register: (fullName: string, email: string, password: string) => Promise<{ user: User; emailSent?: boolean }>;
  logout: () => void;
  updateProfile: (data: ProfileUpdateData) => Promise<User>;
  uploadAvatar: (file: File) => Promise<User>;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      // Verify token is still valid and get fresh user data
      api.get('/auth/me')
        .then(res => {
          setUser(res.data);
          localStorage.setItem('user', JSON.stringify(res.data));
        })
        .catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const res = await api.post('/auth/login', { email, password });
    const { token, user } = res.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
    return user;
  };

  const register = async (fullName: string, email: string, password: string): Promise<{ user: User; emailSent?: boolean }> => {
    const res = await api.post('/auth/register', { fullName, email, password });
    const { token, user, emailSent } = res.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
    return { user, emailSent };
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateProfile = async (data: ProfileUpdateData): Promise<User> => {
    const res = await api.put('/auth/profile', data);
    const updatedUser = res.data.user;
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    return updatedUser;
  };

  const uploadAvatar = async (file: File): Promise<User> => {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const res = await api.post('/auth/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    const updatedUser = res.data.user;
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    return updatedUser;
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile, uploadAvatar, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};