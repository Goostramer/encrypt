// API service for communicating with the backend

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Encryption API calls
export const saveEncryptedText = async (data: any) => {
  const response = await fetch(`${API_URL}/encryption/data`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Failed to save encrypted text');
  return await response.json();
};

export const saveEncryptedFile = async (data: any) => {
  const response = await fetch(`${API_URL}/encryption/file`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Failed to save encrypted file');
  return await response.json();
};

export const getEncryptedData = async (type?: string) => {
  const url = type ? `${API_URL}/encryption/data?type=${type}` : `${API_URL}/encryption/data`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch encrypted data');
  return await response.json();
};

export const getEncryptedDataById = async (id: string) => {
  const response = await fetch(`${API_URL}/encryption/data/${id}`);
  if (!response.ok) throw new Error('Failed to fetch encrypted data by ID');
  return await response.json();
};

export const deleteEncryptedData = async (id: string) => {
  const response = await fetch(`${API_URL}/encryption/data/${id}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Failed to delete encrypted data');
  return await response.json();
};

export const saveKeyPair = async (data: any) => {
  const response = await fetch(`${API_URL}/encryption/keys`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Failed to save key pair');
  return await response.json();
};

export const getKeyPairs = async () => {
  const response = await fetch(`${API_URL}/encryption/keys`);
  if (!response.ok) throw new Error('Failed to fetch key pairs');
  return await response.json();
};

export const getKeyPairById = async (id: string) => {
  const response = await fetch(`${API_URL}/encryption/keys/${id}`);
  if (!response.ok) throw new Error('Failed to fetch key pair by ID');
  return await response.json();
};

export const deleteKeyPair = async (id: string) => {
  const response = await fetch(`${API_URL}/encryption/keys/${id}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Failed to delete key pair');
  return await response.json();
};

export const checkBackendStatus = async () => {
  const response = await fetch(`${API_URL}/status`);
  if (!response.ok) throw new Error('Failed to check backend status');
  return await response.json();
};

export default {
  saveEncryptedText,
  saveEncryptedFile,
  getEncryptedData,
  getEncryptedDataById,
  deleteEncryptedData,
  saveKeyPair,
  getKeyPairs,
  getKeyPairById,
  deleteKeyPair,
  checkBackendStatus
};
