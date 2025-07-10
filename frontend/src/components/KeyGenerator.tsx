import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { 
  Copy, 
  Check, 
  RefreshCw, 
  Shield, 
  Key, 
  Hash
} from 'lucide-react';
import { 
  generateAESKey, 
  exportAESKey, 
  hashData, 
  bufferToBase64
} from '../utils/cryptoUtils';

const KeyGenerator: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [generatedKey, setGeneratedKey] = useState('');
  const [keyType, setKeyType] = useState<'aes' | 'random' | 'hash'>('aes');
  const [keySize, setKeySize] = useState<128 | 192 | 256>(256);
  const [isGenerating, setIsGenerating] = useState(false);
  const [randomLength, setRandomLength] = useState(32);
  const [customInput, setCustomInput] = useState('');
  const [hashAlgorithm, setHashAlgorithm] = useState<'SHA-256' | 'SHA-384' | 'SHA-512'>('SHA-256');
  const [copied, setCopied] = useState(false);

  const generateKey = async () => {
    setIsGenerating(true);
    setGeneratedKey('');
    
    try {
      if (keyType === 'aes') {
        // Generate AES key
        const key = await generateAESKey(keySize);
        const exportedKey = await exportAESKey(key);
        setGeneratedKey(exportedKey);
      } else if (keyType === 'random') {
        // Generate random bytes
        const randomBytes = window.crypto.getRandomValues(new Uint8Array(randomLength));
        setGeneratedKey(bufferToBase64(randomBytes));
      } else if (keyType === 'hash') {
        // Generate hash of input
        if (!customInput.trim()) {
          throw new Error('Please enter text to hash');
        }
        const hash = await hashData(customInput, hashAlgorithm);
        setGeneratedKey(hash);
      }
    } catch (err) {
      console.error('Key generation failed:', err);
      setGeneratedKey('Error: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedKey).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const getKeyTypeIcon = () => {
    switch (keyType) {
      case 'aes':
        return <Key size={20} />;
      case 'random':
        return <Shield size={20} />;
      case 'hash':
        return <Hash size={20} />;
      default:
        return <Key size={20} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 justify-center mb-4">
        <button
          onClick={() => setKeyType('aes')}
          className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            keyType === 'aes'
              ? isDarkMode
                ? 'bg-blue-600 text-white'
                : 'bg-blue-500 text-white'
              : isDarkMode
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <Key size={16} className="mr-2" />
          AES Key
        </button>
        <button
          onClick={() => setKeyType('random')}
          className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            keyType === 'random'
              ? isDarkMode
                ? 'bg-blue-600 text-white'
                : 'bg-blue-500 text-white'
              : isDarkMode
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <Shield size={16} className="mr-2" />
          Random Bytes
        </button>
        <button
          onClick={() => setKeyType('hash')}
          className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            keyType === 'hash'
              ? isDarkMode
                ? 'bg-blue-600 text-white'
                : 'bg-blue-500 text-white'
              : isDarkMode
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <Hash size={16} className="mr-2" />
          Hash Generator
        </button>
      </div>

      <div className={`p-5 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
        <div className="mb-6">
          <h3 className="flex items-center text-lg font-medium mb-4">
            {getKeyTypeIcon()}
            <span className="ml-2">
              {keyType === 'aes' 
                ? 'AES Key Generator' 
                : keyType === 'random' 
                ? 'Random Bytes Generator' 
                : 'Hash Generator'}
            </span>
          </h3>

          {keyType === 'aes' && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Key Size</label>
              <div className="flex space-x-2">
                {[128, 192, 256].map((size) => (
                  <button
                    key={size}
                    onClick={() => setKeySize(size as 128 | 192 | 256)}
                    className={`px-3 py-2 rounded-md text-sm transition-colors ${
                      keySize === size
                        ? isDarkMode
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-500 text-white'
                        : isDarkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {size} bits
                  </button>
                ))}
              </div>
            </div>
          )}

          {keyType === 'random' && (
            <div className="mb-4">
              <label htmlFor="randomLength" className="block text-sm font-medium mb-2">
                Length (bytes)
              </label>
              <input
                id="randomLength"
                type="number"
                min="8"
                max="64"
                value={randomLength}
                onChange={(e) => setRandomLength(Number(e.target.value))}
                className={`w-full p-3 rounded-md ${
                  isDarkMode 
                    ? 'bg-gray-700 text-gray-100' 
                    : 'bg-white text-gray-900 border border-gray-300'
                }`}
              />
            </div>
          )}

          {keyType === 'hash' && (
            <>
              <div className="mb-4">
                <label htmlFor="customInput" className="block text-sm font-medium mb-2">
                  Text to Hash
                </label>
                <textarea
                  id="customInput"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  className={`w-full h-24 p-3 rounded-md ${
                    isDarkMode 
                      ? 'bg-gray-700 text-gray-100 placeholder-gray-400' 
                      : 'bg-white text-gray-900 placeholder-gray-500 border border-gray-300'
                  }`}
                  placeholder="Enter text to generate hash..."
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Hash Algorithm</label>
                <div className="flex flex-wrap gap-2">
                  {['SHA-256', 'SHA-384', 'SHA-512'].map((algo) => (
                    <button
                      key={algo}
                      onClick={() => setHashAlgorithm(algo as 'SHA-256' | 'SHA-384' | 'SHA-512')}
                      className={`px-3 py-2 rounded-md text-sm transition-colors ${
                        hashAlgorithm === algo
                          ? isDarkMode
                            ? 'bg-blue-600 text-white'
                            : 'bg-blue-500 text-white'
                          : isDarkMode
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {algo}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <button
            onClick={generateKey}
            disabled={isGenerating}
            className={`w-full flex items-center justify-center px-4 py-3 rounded-md font-medium transition-colors ${
              isGenerating
                ? isDarkMode
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : isDarkMode
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {isGenerating ? (
              <>
                <RefreshCw size={18} className="mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <RefreshCw size={18} className="mr-2" />
                {keyType === 'aes' 
                  ? 'Generate AES Key' 
                  : keyType === 'random' 
                  ? 'Generate Random Bytes' 
                  : 'Generate Hash'}
              </>
            )}
          </button>
        </div>

        {generatedKey && (
          <div className={`p-4 rounded-md ${
            isDarkMode ? 'bg-gray-700' : 'bg-white border border-gray-300'
          }`}>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium">
                {keyType === 'aes' 
                  ? 'Generated AES Key' 
                  : keyType === 'random' 
                  ? 'Random Bytes' 
                  : `${hashAlgorithm} Hash`}
              </label>
              <button
                onClick={copyToClipboard}
                className={`flex items-center text-xs px-2 py-1 rounded ${
                  isDarkMode 
                    ? 'bg-gray-600 text-blue-400 hover:bg-gray-500' 
                    : 'bg-gray-200 text-blue-600 hover:bg-gray-300'
                }`}
              >
                {copied ? (
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
              className={`w-full p-3 rounded-md font-mono text-sm break-all ${
                isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-gray-100 text-gray-800'
              }`}
            >
              {generatedKey}
            </div>
          </div>
        )}
      </div>

      <div className={`p-4 rounded-md ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'} text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        <p className="mb-2">
          <strong>Usage:</strong>
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>AES Keys:</strong> Use for symmetric encryption of files or text
          </li>
          <li>
            <strong>Random Bytes:</strong> Use for secure tokens, salts, or initialization vectors
          </li>
          <li>
            <strong>Hash Generator:</strong> Use for data integrity verification or password hashing
          </li>
        </ul>
      </div>
    </div>
  );
};

export default KeyGenerator;