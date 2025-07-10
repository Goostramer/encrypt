import { Buffer } from 'buffer';

// Type definitions
export type EncryptionAlgorithm = 'AES-GCM' | 'AES-CBC' | 'RSA-OAEP';
export type HashAlgorithm = 'SHA-256' | 'SHA-384' | 'SHA-512';

export interface EncryptedData {
  ciphertext: string; // Base64 encoded
  iv: string;         // Base64 encoded
  salt?: string;      // Base64 encoded (for password-based encryption)
  algorithm: EncryptionAlgorithm;
}

export interface RSAKeyPair {
  publicKey: string;  // PEM format
  privateKey: string; // PEM format
}

// Utility functions for encoding/decoding
export const bufferToBase64 = (buffer: ArrayBuffer): string => {
  return Buffer.from(buffer).toString('base64');
};

export const base64ToBuffer = (base64: string): ArrayBuffer => {
  const buffer = Buffer.from(base64, 'base64');
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
};

export const stringToBuffer = (str: string): ArrayBuffer => {
  return new TextEncoder().encode(str);
};

export const bufferToString = (buffer: ArrayBuffer): string => {
  return new TextDecoder().decode(buffer);
};

// Generate a random key for AES encryption
export const generateAESKey = async (bits: 128 | 192 | 256 = 256): Promise<CryptoKey> => {
  return await window.crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: bits,
    },
    true, // extractable
    ['encrypt', 'decrypt']
  );
};

// Export AES key to raw format and convert to base64
export const exportAESKey = async (key: CryptoKey): Promise<string> => {
  const exported = await window.crypto.subtle.exportKey('raw', key);
  return bufferToBase64(exported);
};

// Import AES key from base64 string
export const importAESKey = async (keyData: string, algorithm: EncryptionAlgorithm = 'AES-GCM'): Promise<CryptoKey> => {
  const keyBuffer = base64ToBuffer(keyData);
  return await window.crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: algorithm },
    true, // extractable
    ['encrypt', 'decrypt']
  );
};

// Derive a key from a password using PBKDF2
export const deriveKeyFromPassword = async (
  password: string,
  salt: ArrayBuffer | null = null,
  iterations: number = 100000
): Promise<{ key: CryptoKey; salt: ArrayBuffer }> => {
  // Generate a random salt if not provided
  if (!salt) {
    salt = window.crypto.getRandomValues(new Uint8Array(16));
  }

  // Import the password as a key
  const passwordKey = await window.crypto.subtle.importKey(
    'raw',
    stringToBuffer(password),
    { name: 'PBKDF2' },
    false, // not extractable
    ['deriveKey']
  );

  // Derive a key using PBKDF2
  const derivedKey = await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations,
      hash: 'SHA-256',
    },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    true, // extractable
    ['encrypt', 'decrypt']
  );

  return { key: derivedKey, salt };
};

// AES encryption function
export const encryptAES = async (
  data: string | ArrayBuffer,
  key: CryptoKey,
  algorithm: EncryptionAlgorithm = 'AES-GCM'
): Promise<EncryptedData> => {
  // Generate a random IV
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  // Convert string to ArrayBuffer if necessary
  const dataBuffer = typeof data === 'string' ? stringToBuffer(data) : data;

  // Encrypt the data
  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: algorithm,
      iv,
    },
    key,
    dataBuffer
  );

  // Convert the encrypted data and IV to base64
  return {
    ciphertext: bufferToBase64(encryptedBuffer),
    iv: bufferToBase64(iv),
    algorithm,
  };
};

// AES decryption function
export const decryptAES = async (
  encryptedData: EncryptedData,
  key: CryptoKey
): Promise<ArrayBuffer> => {
  // Convert base64 data back to buffers
  const ciphertext = base64ToBuffer(encryptedData.ciphertext);
  const iv = base64ToBuffer(encryptedData.iv);

  // Decrypt the data
  return await window.crypto.subtle.decrypt(
    {
      name: encryptedData.algorithm,
      iv,
    },
    key,
    ciphertext
  );
};

// Password-based encryption (combines deriveKeyFromPassword and encryptAES)
export const encryptWithPassword = async (
  data: string | ArrayBuffer,
  password: string,
  salt: ArrayBuffer | null = null
): Promise<EncryptedData> => {
  const { key, salt: usedSalt } = await deriveKeyFromPassword(password, salt);
  const encryptedData = await encryptAES(data, key);
  
  return {
    ...encryptedData,
    salt: bufferToBase64(usedSalt),
  };
};

// Password-based decryption
export const decryptWithPassword = async (
  encryptedData: EncryptedData,
  password: string
): Promise<ArrayBuffer> => {
  if (!encryptedData.salt) {
    throw new Error('Salt is required for password-based decryption');
  }
  
  const salt = base64ToBuffer(encryptedData.salt);
  const { key } = await deriveKeyFromPassword(password, salt);
  
  return await decryptAES(encryptedData, key);
};

// Generate RSA key pair
export const generateRSAKeyPair = async (modulusLength: number = 2048): Promise<CryptoKeyPair> => {
  return await window.crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength,
      publicExponent: new Uint8Array([1, 0, 1]), // 65537
      hash: 'SHA-256',
    },
    true, // extractable
    ['encrypt', 'decrypt']
  );
};

// Export RSA key pair to PEM format
export const exportRSAKeyPair = async (keyPair: CryptoKeyPair): Promise<RSAKeyPair> => {
  // Export public key
  const publicKeyBuffer = await window.crypto.subtle.exportKey('spki', keyPair.publicKey);
  const publicKeyBase64 = bufferToBase64(publicKeyBuffer);
  const publicKeyPEM = `-----BEGIN PUBLIC KEY-----\n${publicKeyBase64}\n-----END PUBLIC KEY-----`;

  // Export private key
  const privateKeyBuffer = await window.crypto.subtle.exportKey('pkcs8', keyPair.privateKey);
  const privateKeyBase64 = bufferToBase64(privateKeyBuffer);
  const privateKeyPEM = `-----BEGIN PRIVATE KEY-----\n${privateKeyBase64}\n-----END PRIVATE KEY-----`;

  return {
    publicKey: publicKeyPEM,
    privateKey: privateKeyPEM,
  };
};

// Import RSA public key from PEM format
export const importRSAPublicKey = async (publicKeyPEM: string): Promise<CryptoKey> => {
  // Remove PEM header and footer and decode
  const pemContent = publicKeyPEM
    .replace('-----BEGIN PUBLIC KEY-----', '')
    .replace('-----END PUBLIC KEY-----', '')
    .replace(/\s/g, '');
  
  const keyBuffer = base64ToBuffer(pemContent);
  
  return await window.crypto.subtle.importKey(
    'spki',
    keyBuffer,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
    true, // extractable
    ['encrypt']
  );
};

// Import RSA private key from PEM format
export const importRSAPrivateKey = async (privateKeyPEM: string): Promise<CryptoKey> => {
  // Remove PEM header and footer and decode
  const pemContent = privateKeyPEM
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s/g, '');
  
  const keyBuffer = base64ToBuffer(pemContent);
  
  return await window.crypto.subtle.importKey(
    'pkcs8',
    keyBuffer,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
    true, // extractable
    ['decrypt']
  );
};

// RSA encryption function
export const encryptRSA = async (data: string, publicKey: CryptoKey): Promise<string> => {
  const dataBuffer = stringToBuffer(data);
  
  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'RSA-OAEP',
    },
    publicKey,
    dataBuffer
  );
  
  return bufferToBase64(encryptedBuffer);
};

// RSA decryption function
export const decryptRSA = async (encryptedData: string, privateKey: CryptoKey): Promise<string> => {
  const encryptedBuffer = base64ToBuffer(encryptedData);
  
  const decryptedBuffer = await window.crypto.subtle.decrypt(
    {
      name: 'RSA-OAEP',
    },
    privateKey,
    encryptedBuffer
  );
  
  return bufferToString(decryptedBuffer);
};

// Hash function using SHA-256
export const hashData = async (data: string, algorithm: HashAlgorithm = 'SHA-256'): Promise<string> => {
  const dataBuffer = stringToBuffer(data);
  const hashBuffer = await window.crypto.subtle.digest(algorithm, dataBuffer);
  return bufferToBase64(hashBuffer);
};

// Utility function for handling file encryption
export const encryptFile = async (
  file: File,
  password: string,
  onProgress?: (progress: number) => void
): Promise<{ encryptedFile: Blob; encryptedData: EncryptedData }> => {
  // Read the file as ArrayBuffer
  const fileBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });

  // Report initial progress
  if (onProgress) onProgress(0.1);

  // Derive a key from the password
  const { key, salt } = await deriveKeyFromPassword(password);
  
  // Report key derivation progress
  if (onProgress) onProgress(0.3);
  
  // Generate a random IV
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  
  // Encrypt the file data
  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    fileBuffer
  );
  
  // Report encryption progress
  if (onProgress) onProgress(0.8);
  
  // Create a Blob from the encrypted data
  const encryptedFile = new Blob([encryptedBuffer], { type: 'application/octet-stream' });
  
  // Create the encryption metadata
  const encryptedData: EncryptedData = {
    ciphertext: '', // We don't store the ciphertext here since it's in the Blob
    iv: bufferToBase64(iv),
    salt: bufferToBase64(salt),
    algorithm: 'AES-GCM',
  };
  
  // Report completion
  if (onProgress) onProgress(1);
  
  return { encryptedFile, encryptedData };
};

// Utility function for handling file decryption
export const decryptFile = async (
  encryptedFile: File,
  encryptedData: EncryptedData,
  password: string,
  onProgress?: (progress: number) => void
): Promise<Blob> => {
  // Read the encrypted file as ArrayBuffer
  const encryptedBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(encryptedFile);
  });
  
  // Report initial progress
  if (onProgress) onProgress(0.1);
  
  // Derive the key from the password and salt
  const salt = base64ToBuffer(encryptedData.salt!);
  const { key } = await deriveKeyFromPassword(password, salt);
  
  // Report key derivation progress
  if (onProgress) onProgress(0.3);
  
  // Decrypt the file data
  const iv = base64ToBuffer(encryptedData.iv);
  const decryptedBuffer = await window.crypto.subtle.decrypt(
    {
      name: encryptedData.algorithm,
      iv,
    },
    key,
    encryptedBuffer
  );
  
  // Report decryption progress
  if (onProgress) onProgress(0.8);
  
  // Create a Blob from the decrypted data
  const decryptedFile = new Blob([decryptedBuffer]);
  
  // Report completion
  if (onProgress) onProgress(1);
  
  return decryptedFile;
};