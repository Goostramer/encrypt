import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { 
  Copy, 
  Check, 
  Key, 
  RefreshCw, 
  Lock, 
  Unlock 
} from 'lucide-react';
import { 
  generateRSAKeyPair, 
  exportRSAKeyPair, 
  importRSAPublicKey, 
  importRSAPrivateKey, 
  encryptRSA, 
  decryptRSA, 
  RSAKeyPair 
} from '../utils/cryptoUtils';

const RSAEncryption: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [isGeneratingKeys, setIsGeneratingKeys] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [keySize, setKeySize] = useState<number>(2048);
  const [copied, setCopied] = useState<string | null>(null);

  // Load keys from localStorage on component mount
  useEffect(() => {
    const savedKeys = localStorage.getItem('rsaKeyPair');
    if (savedKeys) {
      try {
        const parsedKeys = JSON.parse(savedKeys) as RSAKeyPair;
        setPublicKey(parsedKeys.publicKey);
        setPrivateKey(parsedKeys.privateKey);
      } catch (err) {
        console.error('Failed to parse saved RSA keys', err);
      }
    }
  }, []);

  const generateKeys = async () => {
    setIsGeneratingKeys(true);
    setError('');
    
    try {
      const cryptoKeyPair = await generateRSAKeyPair(keySize);
      const exportedKeyPair = await exportRSAKeyPair(cryptoKeyPair);
      
      setPublicKey(exportedKeyPair.publicKey);
      setPrivateKey(exportedKeyPair.privateKey);
      
      // Save keys to localStorage
      localStorage.setItem('rsaKeyPair', JSON.stringify(exportedKeyPair));
    } catch (err) {
      setError(`Key generation failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsGeneratingKeys(false);
    }
  };

  const handleEncrypt = async () => {
    if (!inputText.trim()) {
      setError('Please enter text to encrypt');
      return;
    }
    if (!publicKey.trim()) {
      setError('Please enter or generate a public key');
      return;
    }

    setError('');
    setIsProcessing(true);
    
    try {
      // Import the public key
      const importedPublicKey = await importRSAPublicKey(publicKey);
      
      // Encrypt the data
      const encryptedData = await encryptRSA(inputText, importedPublicKey);
      setOutputText(encryptedData);
    } catch (err) {
      setError(`Encryption failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecrypt = async () => {
    if (!inputText.trim()) {
      setError('Please enter encrypted text to decrypt');
      return;
    }
    if (!privateKey.trim()) {
      setError('Please enter or generate a private key');
      return;
    }

    setError('');
    setIsProcessing(true);
    
    try {
      // Import the private key
      const importedPrivateKey = await importRSAPrivateKey(privateKey);
      
      // Decrypt the data
      const decryptedData = await decryptRSA(inputText, importedPrivateKey);
      setOutputText(decryptedData);
    } catch (err) {
      setError(`Decryption failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const switchMode = (newMode: 'encrypt' | 'decrypt') => {
    setMode(newMode);
    setInputText(''); // Clear input
    setOutputText(''); // Clear output
    setPublicKey(''); // Clear public key
    setPrivateKey(''); // Clear private key
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
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium">RSA Key Pair</h3>
          <div className="flex items-center space-x-2">
            <select
              value={keySize}
              onChange={(e) => setKeySize(Number(e.target.value))}
              className={`text-sm p-1 rounded ${
                isDarkMode 
                  ? 'bg-gray-700 text-gray-200 border-gray-600' 
                  : 'bg-white text-gray-800 border-gray-300'
              } border`}
            >
              <option value={1024}>1024 bits</option>
              <option value={2048}>2048 bits</option>
              <option value={4096}>4096 bits</option>
            </select>
            <button
              onClick={generateKeys}
              disabled={isGeneratingKeys}
              className={`flex items-center px-3 py-1 text-sm rounded-md transition-colors ${
                isGeneratingKeys
                  ? isDarkMode
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : isDarkMode
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {isGeneratingKeys ? (
                <RefreshCw size={14} className="mr-1 animate-spin" />
              ) : (
                <Key size={14} className="mr-1" />
              )}
              {isGeneratingKeys ? 'Generating...' : 'Generate Keys'}
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label 
                htmlFor="publicKey" 
                className="block text-sm font-medium"
              >
                Public Key (for encryption)
              </label>
              <button
                onClick={() => copyToClipboard(publicKey, 'public')}
                className={`flex items-center text-xs px-1.5 py-0.5 rounded ${
                  isDarkMode 
                    ? 'bg-gray-700 text-blue-400 hover:bg-gray-600' 
                    : 'bg-gray-200 text-blue-600 hover:bg-gray-300'
                }`}
              >
                {copied === 'public' ? (
                  <>
                    <Check size={10} className="mr-1" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy size={10} className="mr-1" />
                    Copy
                  </>
                )}
              </button>
            </div>
            <textarea
              id="publicKey"
              value={publicKey}
              onChange={(e) => setPublicKey(e.target.value)}
              className={`w-full h-32 p-2 text-xs font-mono rounded-md ${
                isDarkMode 
                  ? 'bg-gray-700 text-gray-100' 
                  : 'bg-white text-gray-900 border border-gray-300'
              }`}
              placeholder="Paste public key here or generate new keys..."
            />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <label 
                htmlFor="privateKey" 
                className="block text-sm font-medium"
              >
                Private Key (for decryption)
              </label>
              <button
                onClick={() => copyToClipboard(privateKey, 'private')}
                className={`flex items-center text-xs px-1.5 py-0.5 rounded ${
                  isDarkMode 
                    ? 'bg-gray-700 text-blue-400 hover:bg-gray-600' 
                    : 'bg-gray-200 text-blue-600 hover:bg-gray-300'
                }`}
              >
                {copied === 'private' ? (
                  <>
                    <Check size={10} className="mr-1" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy size={10} className="mr-1" />
                    Copy
                  </>
                )}
              </button>
            </div>
            <textarea
              id="privateKey"
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
              className={`w-full h-32 p-2 text-xs font-mono rounded-md ${
                isDarkMode 
                  ? 'bg-gray-700 text-gray-100' 
                  : 'bg-white text-gray-900 border border-gray-300'
              }`}
              placeholder="Paste private key here or generate new keys..."
            />
          </div>
        </div>
      </div>

      <div className={`p-4 rounded-md ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
        <label 
          htmlFor="rsaInput" 
          className="block mb-2 text-sm font-medium"
        >
          {mode === 'encrypt' ? 'Text to Encrypt' : 'Encrypted Text to Decrypt'}
        </label>
        <textarea
          id="rsaInput"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className={`w-full h-24 p-3 rounded-md ${
            isDarkMode 
              ? 'bg-gray-700 text-gray-100 placeholder-gray-400' 
              : 'bg-white text-gray-900 placeholder-gray-500 border border-gray-300'
          }`}
          placeholder={
            mode === 'encrypt' 
              ? 'Enter text to encrypt with RSA...' 
              : 'Paste encrypted text here...'
          }
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
              Encrypt with RSA
            </>
          ) : (
            <>
              <Unlock size={18} className="mr-2" />
              Decrypt with RSA
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
              onClick={() => copyToClipboard(outputText, 'output')}
              className={`flex items-center text-xs px-2 py-1 rounded ${
                isDarkMode 
                  ? 'bg-gray-700 text-blue-400 hover:bg-gray-600' 
                  : 'bg-gray-200 text-blue-600 hover:bg-gray-300'
              }`}
            >
              {copied === 'output' ? (
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
            className={`w-full h-24 p-3 rounded-md overflow-auto ${
              isDarkMode 
                ? 'bg-gray-700 text-gray-100' 
                : 'bg-white text-gray-900 border border-gray-300'
            }`}
          >
            <pre className="whitespace-pre-wrap break-all">{outputText}</pre>
          </div>
        </div>
      )}

      <div className={`p-4 rounded-md ${isDarkMode ? 'bg-yellow-900/20' : 'bg-yellow-50'} text-sm ${isDarkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
        <p className="flex items-start">
          <Key size={14} className="mr-2 mt-0.5 flex-shrink-0" />
          <span>
            <strong>Important security note:</strong> Keep your private key secure and never share it. 
            The public key can be shared with others who want to send you encrypted messages.
          </span>
        </p>
      </div>
    </div>
  );
};

export default RSAEncryption;