import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Lock, Unlock, Copy, Check, RefreshCw } from 'lucide-react';
import { 
  encryptWithPassword, 
  decryptWithPassword, 
  bufferToString,
  EncryptedData 
} from '../utils/cryptoUtils';

const TextEncryption: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [inputText, setInputText] = useState('');
  const [password, setPassword] = useState('');
  const [outputText, setOutputText] = useState('');
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState('');

  const handleEncrypt = async () => {
    if (!inputText.trim()) {
      setError('Please enter text to encrypt');
      return;
    }
    if (!password.trim()) {
      setError('Please enter a password');
      return;
    }

    setError('');
    setIsProcessing(true);
    
    try {
      const encryptedData = await encryptWithPassword(inputText, password);
      setOutputText(JSON.stringify(encryptedData));
    } catch (err) {
      setError(`Encryption failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecrypt = async () => {
    if (!inputText.trim()) {
      setError('Please enter encrypted data to decrypt');
      return;
    }
    if (!password.trim()) {
      setError('Please enter a password');
      return;
    }

    setError('');
    setIsProcessing(true);
    
    try {
      // Parse the encrypted data
      const encryptedData: EncryptedData = JSON.parse(inputText);
      const decryptedBuffer = await decryptWithPassword(encryptedData, password);
      const decryptedText = bufferToString(decryptedBuffer);
      setOutputText(decryptedText);
    } catch (err) {
      setError(`Decryption failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(outputText).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
    let generatedPassword = '';
    for (let i = 0; i < 16; i++) {
      generatedPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(generatedPassword);
  };

  const switchMode = (newMode: 'encrypt' | 'decrypt') => {
    setMode(newMode);
    setOutputText('');
    setError('');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-center space-x-2 mb-6">
        <button
          onClick={() => switchMode('encrypt')}
          className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            mode === 'encrypt'
              ? isDarkMode
                ? 'bg-blue-600 text-white'
                : 'bg-blue-500 text-white'
              : isDarkMode
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <Lock size={16} className="mr-2" />
          Encrypt
        </button>
        <button
          onClick={() => switchMode('decrypt')}
          className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            mode === 'decrypt'
              ? isDarkMode
                ? 'bg-blue-600 text-white'
                : 'bg-blue-500 text-white'
              : isDarkMode
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <Unlock size={16} className="mr-2" />
          Decrypt
        </button>
      </div>

      <div className={`p-4 rounded-md ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
        <label 
          htmlFor="inputText" 
          className="block mb-2 text-sm font-medium"
        >
          {mode === 'encrypt' ? 'Text to Encrypt' : 'Encrypted Data (JSON)'}
        </label>
        <textarea
          id="inputText"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className={`w-full h-32 p-3 rounded-md ${
            isDarkMode 
              ? 'bg-gray-700 text-gray-100 placeholder-gray-400' 
              : 'bg-white text-gray-900 placeholder-gray-500 border border-gray-300'
          }`}
          placeholder={
            mode === 'encrypt' 
              ? 'Enter text to encrypt...' 
              : 'Paste encrypted JSON data here...'
          }
        />
      </div>

      <div className={`p-4 rounded-md ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
        <div className="flex items-center justify-between mb-2">
          <label 
            htmlFor="password" 
            className="block text-sm font-medium"
          >
            Password
          </label>
          <button
            onClick={handleGeneratePassword}
            className={`flex items-center text-xs px-2 py-1 rounded ${
              isDarkMode 
                ? 'bg-gray-700 text-blue-400 hover:bg-gray-600' 
                : 'bg-gray-200 text-blue-600 hover:bg-gray-300'
            }`}
          >
            <RefreshCw size={12} className="mr-1" />
            Generate
          </button>
        </div>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={`w-full p-3 rounded-md ${
            isDarkMode 
              ? 'bg-gray-700 text-gray-100 placeholder-gray-400' 
              : 'bg-white text-gray-900 placeholder-gray-500 border border-gray-300'
          }`}
          placeholder="Enter password..."
        />
      </div>

      {error && (
        <div className={`p-3 rounded-md ${isDarkMode ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-700'}`}>
          {error}
        </div>
      )}

      <div className="flex justify-center">
        <button
          onClick={mode === 'encrypt' ? handleEncrypt : handleDecrypt}
          disabled={isProcessing}
          className={`flex items-center px-6 py-3 rounded-md font-medium transition-colors ${
            isProcessing
              ? isDarkMode
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : isDarkMode
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {isProcessing ? (
            <>
              <RefreshCw size={18} className="mr-2 animate-spin" />
              Processing...
            </>
          ) : mode === 'encrypt' ? (
            <>
              <Lock size={18} className="mr-2" />
              Encrypt
            </>
          ) : (
            <>
              <Unlock size={18} className="mr-2" />
              Decrypt
            </>
          )}
        </button>
      </div>

      {outputText && (
        <div className={`p-4 rounded-md ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium">
              {mode === 'encrypt' ? 'Encrypted Result' : 'Decrypted Text'}
            </label>
            <button
              onClick={handleCopyToClipboard}
              className={`flex items-center text-xs px-2 py-1 rounded ${
                isDarkMode 
                  ? 'bg-gray-700 text-blue-400 hover:bg-gray-600' 
                  : 'bg-gray-200 text-blue-600 hover:bg-gray-300'
              }`}
            >
              {isCopied ? (
                <>
                  <Check size={12} className="mr-1" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={12} className="mr-1" />
                  Copy
                </>
              )}
            </button>
          </div>
          <div 
            className={`w-full h-32 p-3 rounded-md overflow-auto ${
              isDarkMode 
                ? 'bg-gray-700 text-gray-100' 
                : 'bg-white text-gray-900 border border-gray-300'
            }`}
          >
            <pre className="whitespace-pre-wrap break-all">{outputText}</pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default TextEncryption;