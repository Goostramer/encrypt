import React, { useState, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { 
  FileUp, 
  Lock, 
  Unlock, 
  Download, 
  Trash2, 
  RefreshCw, 
  Check, 
  FileWarning 
} from 'lucide-react';
import { 
  encryptFile, 
  decryptFile, 
  EncryptedData 
} from '../utils/cryptoUtils';

const FileEncryption: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [file, setFile] = useState<File | null>(null);
  const [encryptedMetadata, setEncryptedMetadata] = useState<EncryptedData | null>(null);
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ url: string; filename: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
      setResult(null);
    }
  };

  const handleEncrypt = async () => {
    if (!file) {
      setError('Please select a file to encrypt');
      return;
    }
    if (!password) {
      setError('Please enter a password');
      return;
    }

    setError('');
    setIsProcessing(true);
    setProgress(0);

    try {
      const { encryptedFile, encryptedData } = await encryptFile(
        file,
        password,
        (progressValue) => setProgress(progressValue)
      );

      // Create download URL
      const downloadUrl = URL.createObjectURL(encryptedFile);
      const encryptedFilename = `${file.name}.encrypted`;

      // Save the metadata
      setEncryptedMetadata(encryptedData);
      
      // Set the result
      setResult({
        url: downloadUrl,
        filename: encryptedFilename
      });

      // Save metadata to localStorage for future decryption
      const storedMetadata = JSON.parse(localStorage.getItem('encryptedFiles') || '{}');
      storedMetadata[encryptedFilename] = encryptedData;
      localStorage.setItem('encryptedFiles', JSON.stringify(storedMetadata));
      
    } catch (err) {
      setError(`Encryption failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecrypt = async () => {
    if (!file) {
      setError('Please select an encrypted file');
      return;
    }
    if (!password) {
      setError('Please enter the password');
      return;
    }

    setError('');
    setIsProcessing(true);
    setProgress(0);

    try {
      // Try to get the metadata from localStorage
      const storedMetadata = JSON.parse(localStorage.getItem('encryptedFiles') || '{}');
      let fileMetadata = encryptedMetadata;

      if (!fileMetadata) {
        // Try to find the metadata by filename
        fileMetadata = storedMetadata[file.name] || null;

        if (!fileMetadata) {
          throw new Error('Encryption metadata not found. Please provide the original encryption metadata.');
        }
      }

      const decryptedFile = await decryptFile(
        file,
        fileMetadata,
        password,
        (progressValue) => setProgress(progressValue)
      );

      // Create download URL
      const downloadUrl = URL.createObjectURL(decryptedFile);
      
      // Remove the .encrypted extension if present
      let decryptedFilename = file.name;
      if (decryptedFilename.endsWith('.encrypted')) {
        decryptedFilename = decryptedFilename.slice(0, -10);
      }

      // Set the result
      setResult({
        url: downloadUrl,
        filename: decryptedFilename
      });
      
    } catch (err) {
      setError(`Decryption failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setError('');
      setResult(null);
    }
  };

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
    let generatedPassword = '';
    for (let i = 0; i < 16; i++) {
      generatedPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(generatedPassword);
  };

  const clearFile = () => {
    setFile(null);
    setResult(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const switchMode = (newMode: 'encrypt' | 'decrypt') => {
    setMode(newMode);
    clearFile();
    setPassword(''); // Clear password
    setProgress(0);
    setEncryptedMetadata(null);
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

      <div 
        className={`border-2 border-dashed rounded-lg p-6 text-center ${
          isDarkMode 
            ? 'border-gray-600 hover:border-gray-500' 
            : 'border-gray-300 hover:border-gray-400'
        } transition-colors`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <input
          type="file"
          onChange={handleFileChange}
          className="hidden"
          ref={fileInputRef}
          id="fileInput"
        />
        
        {file ? (
          <div className="space-y-3">
            <div className={`flex items-center justify-center p-3 rounded-md ${
              isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
            }`}>
              <div className="flex-1 truncate">{file.name}</div>
              <div className="ml-2 text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</div>
              <button 
                onClick={clearFile}
                className={`ml-2 p-1 rounded-full ${
                  isDarkMode 
                    ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ) : (
          <label htmlFor="fileInput" className="cursor-pointer block">
            <FileUp className={`mx-auto h-12 w-12 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <p className="mt-2 text-sm font-medium">
              Drag and drop a file here, or click to select
            </p>
            <p className={`mt-1 text-xs ${
              isDarkMode ? 'text-gray-500' : 'text-gray-400'
            }`}>
              {mode === 'encrypt' ? 'Any file type supported' : 'Select an encrypted file'}
            </p>
          </label>
        )}
      </div>

      <div className={`p-4 rounded-md ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
        <div className="flex items-center justify-between mb-2">
          <label 
            htmlFor="filePassword" 
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
          id="filePassword"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={`w-full p-3 rounded-md ${
            isDarkMode 
              ? 'bg-gray-700 text-gray-100 placeholder-gray-400' 
              : 'bg-white text-gray-900 placeholder-gray-500 border border-gray-300'
          }`}
          placeholder="Enter password for file encryption/decryption..."
        />
      </div>

      {error && (
        <div className={`p-3 rounded-md ${isDarkMode ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-700'}`}>
          <div className="flex items-start">
            <FileWarning size={18} className="mr-2 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {isProcessing && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Processing...</span>
            <span>{Math.round(progress * 100)}%</span>
          </div>
          <div className={`h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
            <div 
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${progress * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      <div className="flex justify-center">
        <button
          onClick={mode === 'encrypt' ? handleEncrypt : handleDecrypt}
          disabled={isProcessing || !file}
          className={`flex items-center px-6 py-3 rounded-md font-medium transition-colors ${
            isProcessing || !file
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
              Encrypt File
            </>
          ) : (
            <>
              <Unlock size={18} className="mr-2" />
              Decrypt File
            </>
          )}
        </button>
      </div>

      {result && (
        <div className={`p-4 rounded-md ${isDarkMode ? 'bg-green-900/20' : 'bg-green-50'} border ${isDarkMode ? 'border-green-800/30' : 'border-green-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Check size={18} className={`mr-2 ${isDarkMode ? 'text-green-400' : 'text-green-500'}`} />
              <span className={`font-medium ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>
                {mode === 'encrypt' ? 'File encrypted successfully!' : 'File decrypted successfully!'}
              </span>
            </div>
            <a
              href={result.url}
              download={result.filename}
              className={`flex items-center px-3 py-1 rounded-md text-sm ${
                isDarkMode
                  ? 'bg-green-800/30 text-green-300 hover:bg-green-800/50'
                  : 'bg-green-100 text-green-800 hover:bg-green-200'
              }`}
            >
              <Download size={14} className="mr-1" />
              Download
            </a>
          </div>
        </div>
      )}

      <div className={`p-4 rounded-md ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'} text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        <p className="flex items-start">
          <Lock size={14} className="mr-2 mt-0.5 flex-shrink-0" />
          All encryption and decryption is performed locally in your browser. Files are never uploaded to any server.
        </p>
      </div>
    </div>
  );
};

export default FileEncryption;