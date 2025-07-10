// API service for communicating with the backend

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface SavedEncryptedData {
  _id: string;
  name: string;
  type: 'text' | 'file' | 'rsa';
  data: {
    ciphertext: string;
    iv: string;
    salt?: string;
    algorithm: string;
  };
  metadata?: {
    originalFileName?: string;
    fileSize?: number;
    mimeType?: string;
  };
  createdAt: string;
}

export interface SavedKeyPair {
  _id: string;
  name: string;
  publicKey: string;
  encryptedPrivateKey: {
    ciphertext: string;
    iv: string;
    salt?: string;
    algorithm: string;
  };
  keySize: number;
  createdAt: string;
}

// Helper function to get auth token from local storage
const getToken = (): string | null => {
  return localStorage.getItem('token');
};

// Helper function for API requests
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers
  };
  
  const config = {
    ...options,
    headers
  };
  
  const response = await fetch(`${API_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Something went wrong');
  }
  
  return await response.json();
};

// Auth API calls
export const login = async (credentials: LoginCredentials) => {
  const response = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  });
  
  // Save token to local storage
  if (response.token) {
    localStorage.setItem('token', response.token);
  }
  
  return response;
};

export const register = async (userData: RegisterData) => {
  const response = await apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  });
  
  // Save token to local storage
  if (response.token) {
    localStorage.setItem('token', response.token);
  }
  
  return response;
};

export const getCurrentUser = async () => {
  return await apiRequest('/auth/me');
};

export const logout = () => {
  localStorage.removeItem('token');
};

// Encrypted data API calls
export const saveEncryptedText = async (name: string, data: any) => {
  return await apiRequest('/encryption/data', {
    method: 'POST',
    body: JSON.stringify({ name, data })
  });
};

export const saveEncryptedFile = async (name: string, data: any, metadata: any) => {
  return await apiRequest('/encryption/file', {
    method: 'POST',
    body: JSON.stringify({ name, data, metadata })
  });
};

export const getEncryptedData = async (type?: string) => {
  const endpoint = type ? `/encryption/data?type=${type}` : '/encryption/data';
  return await apiRequest(endpoint);
};

export const getEncryptedDataById = async (id: string) => {
  return await apiRequest(`/encryption/data/${id}`);
};

export const deleteEncryptedData = async (id: string) => {
  return await apiRequest(`/encryption/data/${id}`, {
    method: 'DELETE'
  });
};

// Key pair API calls
export const saveKeyPair = async (name: string, publicKey: string, encryptedPrivateKey: any, keySize: number) => {
  return await apiRequest('/encryption/keys', {
    method: 'POST',
    body: JSON.stringify({ name, publicKey, encryptedPrivateKey, keySize })
  });
};

export const getKeyPairs = async () => {
  return await apiRequest('/encryption/keys');
};

export const getKeyPairById = async (id: string) => {
  return await apiRequest(`/encryption/keys/${id}`);
};

export const deleteKeyPair = async (id: string) => {
  return await apiRequest(`/encryption/keys/${id}`, {
    method: 'DELETE'
  });
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!getToken();
};

// Check the backend status
export const checkBackendStatus = async () => {
  try {
    const response = await fetch(`${API_URL}/status`);
    if (!response.ok) {
      throw new Error('Backend status check failed');
    }
    return await response.json();
  } catch (error) {
    console.error('Backend status check error:', error);
    return { status: 'error', mongoDBConnected: false, fallbackMode: true };
  }
};

export default {
  login,
  register,
  getCurrentUser,
  logout,
  saveEncryptedText,
  saveEncryptedFile,
  getEncryptedData,
  getEncryptedDataById,
  deleteEncryptedData,
  saveKeyPair,
  getKeyPairs,
  getKeyPairById,
  deleteKeyPair,
  isAuthenticated,
  checkBackendStatus
};
