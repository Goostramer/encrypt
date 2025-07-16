// Import React library and necessary hooks for state management and side effects.
import React, { useState } from 'react';
// Import the custom theme context hook to determine dark mode status.
import { useTheme } from '../context/ThemeContext';
// Import icons from 'lucide-react' for various UI elements.
import { 
  Copy, // Icon for copying text to clipboard.
  Check, // Icon to indicate success or completion (e.g., copied).
  RefreshCw, // Icon for generating or refreshing.
  Shield, // Icon often associated with security or random data.
  Key, // Icon representing a cryptographic key.
  Hash // Icon representing a hash function.
} from 'lucide-react';
// Import utility functions for cryptographic operations.
import { 
  generateAESKey, // Function to generate an AES cryptographic key.
  exportAESKey, // Function to export a CryptoKey object into a usable format (e.g., base64).
  hashData, // Function to compute a cryptographic hash of given data.
  bufferToBase64 // Utility to convert an ArrayBuffer to a Base64 string.
} from '../utils/cryptoUtils';

// Define the functional React component for generating various cryptographic keys.
const KeyGenerator: React.FC = () => {
  // Access the current theme mode (dark or light) from the context.
  const { isDarkMode } = useTheme();
  
  // State to store the currently generated key or hash.
  const [generatedKey, setGeneratedKey] = useState('');
  // State to control which type of key/data is being generated ('aes', 'random', or 'hash').
  const [keyType, setKeyType] = useState<'aes' | 'random' | 'hash'>('aes');
  // State for AES key size (128, 192, or 256 bits).
  const [keySize, setKeySize] = useState<128 | 192 | 256>(256);
  // State to indicate if a key generation process is currently underway.
  const [isGenerating, setIsGenerating] = useState(false);
  // State for the length of random bytes to generate.
  const [randomLength, setRandomLength] = useState(32);
  // State to store the custom input text when generating a hash.
  const [customInput, setCustomInput] = useState('');
  // State for the hashing algorithm to use ('SHA-256', 'SHA-384', or 'SHA-512').
  const [hashAlgorithm, setHashAlgorithm] = useState<'SHA-256' | 'SHA-384' | 'SHA-512'>('SHA-256');
  // State to indicate if the generated key has been copied to the clipboard.
  const [copied, setCopied] = useState(false);

  // Asynchronous function to handle the key generation process based on the selected type.
  const generateKey = async () => {
    // Set generating state to true to show loading indicators.
    setIsGenerating(true);
    // Clear any previously generated key.
    setGeneratedKey('');
    
    try {
      // Conditional logic to generate different types of keys/data.
      if (keyType === 'aes') {
        // Generate an AES cryptographic key.
        const key = await generateAESKey(keySize);
        // Export the generated AES key into a string format.
        const exportedKey = await exportAESKey(key);
        // Set the exported key to the state.
        setGeneratedKey(exportedKey);
      } else if (keyType === 'random') {
        // Generate cryptographically secure random bytes.
        const randomBytes = window.crypto.getRandomValues(new Uint8Array(randomLength));
        // Convert the random bytes to a Base64 string and set to state.
        setGeneratedKey(bufferToBase64(randomBytes));
      } else if (keyType === 'hash') {
        // Check if custom input is provided for hashing.
        if (!customInput.trim()) {
          throw new Error('Please enter text to hash'); // Throw error if input is empty.
        }
        // Hash the custom input using the selected algorithm.
        const hash = await hashData(customInput, hashAlgorithm);
        // Set the generated hash to the state.
        setGeneratedKey(hash);
      }
    } catch (err) {
      // Catch and log any errors during key generation.
      console.error('Key generation failed:', err);
      // Display an error message to the user.
      setGeneratedKey('Error: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      // Always set generating state to false after the process completes or fails.
      setIsGenerating(false);
    }
  };

  // Function to copy the generated key to the clipboard.
  const copyToClipboard = () => {
    // Use the Clipboard API to write the generated key to clipboard.
    navigator.clipboard.writeText(generatedKey).then(() => {
      setCopied(true); // Set copied state to true to show feedback.
      // Reset copied state after 2 seconds.
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Helper function to return the appropriate icon based on the selected key type.
  const getKeyTypeIcon = () => {
    switch (keyType) {
      case 'aes':
        return <Key size={20} />; // Key icon for AES.
      case 'random':
        return <Shield size={20} />; // Shield icon for random bytes.
      case 'hash':
        return <Hash size={20} />; // Hash icon for hash generator.
      default:
        return <Key size={20} />; // Default to Key icon.
    }
  };

  // Render the component's UI.
  return (
    <div className="space-y-6">
      {/* Section for selecting the type of key to generate. */}
      <div className="flex flex-wrap gap-2 justify-center mb-4">
        {/* Button to select AES Key generation. */}
        <button
          onClick={() => setKeyType('aes')} // Set keyType to 'aes' on click.
          className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            keyType === 'aes' // Conditional styling based on active key type and dark mode.
              ? isDarkMode
                ? 'bg-blue-600 text-white'
                : 'bg-blue-500 text-white'
              : isDarkMode
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <Key size={16} className="mr-2" /> {/* Key icon. */}
          AES Key
        </button>
        {/* Button to select Random Bytes generation. */}
        <button
          onClick={() => setKeyType('random')} // Set keyType to 'random' on click.
          className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            keyType === 'random' // Conditional styling based on active key type and dark mode.
              ? isDarkMode
                ? 'bg-blue-600 text-white'
                : 'bg-blue-500 text-white'
              : isDarkMode
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <Shield size={16} className="mr-2" /> {/* Shield icon. */}
          Random Bytes
        </button>
        {/* Button to select Hash Generator. */}
        <button
          onClick={() => setKeyType('hash')} // Set keyType to 'hash' on click.
          className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            keyType === 'hash' // Conditional styling based on active key type and dark mode.
              ? isDarkMode
                ? 'bg-blue-600 text-white'
                : 'bg-blue-500 text-white'
              : isDarkMode
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <Hash size={16} className="mr-2" /> {/* Hash icon. */}
          Hash Generator
        </button>
      </div>

      {/* Main generation options and output area. */}
      <div className={`p-5 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
        <div className="mb-6">
          {/* Section title with dynamic icon and text based on key type. */}
          <h3 className="flex items-center text-lg font-medium mb-4">
            {getKeyTypeIcon()} {/* Render the appropriate icon. */}
            <span className="ml-2">
              {keyType === 'aes' 
                ? 'AES Key Generator' 
                : keyType === 'random' 
                ? 'Random Bytes Generator' 
                : 'Hash Generator'}
            </span>
          </h3>

          {/* AES Key specific options (Key Size). */}
          {keyType === 'aes' && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Key Size</label>
              <div className="flex space-x-2">
                {[128, 192, 256].map((size) => (
                  <button
                    key={size}
                    onClick={() => setKeySize(size as 128 | 192 | 256)} // Set AES key size.
                    className={`px-3 py-2 rounded-md text-sm transition-colors ${
                      keySize === size // Conditional styling for active size button.
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

          {/* Random Bytes specific options (Length). */}
          {keyType === 'random' && (
            <div className="mb-4">
              <label htmlFor="randomLength" className="block text-sm font-medium mb-2">
                Length (bytes)
              </label>
              <input
                id="randomLength"
                type="number"
                min="8" // Minimum length for random bytes.
                max="64" // Maximum length for random bytes.
                value={randomLength} // Controlled component value.
                onChange={(e) => setRandomLength(Number(e.target.value))} // Update random length state.
                className={`w-full p-3 rounded-md ${
                  isDarkMode // Conditional styling for input field.
                    ? 'bg-gray-700 text-gray-100' 
                    : 'bg-white text-gray-900 border border-gray-300'
                }`}
              />
            </div>
          )}

          {/* Hash Generator specific options (Text Input and Algorithm). */}
          {keyType === 'hash' && (
            <>
              <div className="mb-4">
                <label htmlFor="customInput" className="block text-sm font-medium mb-2">
                  Text to Hash
                </label>
                <textarea
                  id="customInput"
                  value={customInput} // Controlled component value.
                  onChange={(e) => setCustomInput(e.target.value)} // Update custom input state.
                  className={`w-full h-24 p-3 rounded-md ${
                    isDarkMode // Conditional styling for textarea.
                      ? 'bg-gray-700 text-gray-100 placeholder-gray-400' 
                      : 'bg-white text-gray-900 placeholder-gray-500 border border-gray-300'
                  }`}
                  placeholder="Enter text to generate hash..." // Placeholder text.
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Hash Algorithm</label>
                <div className="flex flex-wrap gap-2">
                  {['SHA-256', 'SHA-384', 'SHA-512'].map((algo) => (
                    <button
                      key={algo}
                      onClick={() => setHashAlgorithm(algo as 'SHA-256' | 'SHA-384' | 'SHA-512')} // Set hash algorithm.
                      className={`px-3 py-2 rounded-md text-sm transition-colors ${
                        hashAlgorithm === algo // Conditional styling for active algorithm button.
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

          {/* Main Generate button. */}
          <button
            onClick={generateKey} // Call the generateKey function on click.
            disabled={isGenerating} // Disable button while generating.
            className={`w-full flex items-center justify-center px-4 py-3 rounded-md font-medium transition-colors ${
              isGenerating // Conditional styling for disabled/enabled state and dark mode.
                ? isDarkMode
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : isDarkMode
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {isGenerating ? (
              // Display loading state.
              <>
                <RefreshCw size={18} className="mr-2 animate-spin" /> {/* Spinning refresh icon. */}
                Generating...
              </>
            ) : (
              // Display generate button text based on key type.
              <>
                <RefreshCw size={18} className="mr-2" /> {/* Refresh icon. */}
                {keyType === 'aes' 
                  ? 'Generate AES Key' 
                  : keyType === 'random' 
                  ? 'Generate Random Bytes' 
                  : 'Generate Hash'}
              </>
            )}
          </button>
        </div>

        {/* Display area for the generated key/hash. */}
        {generatedKey && (
          <div className={`p-4 rounded-md ${
            isDarkMode ? 'bg-gray-700' : 'bg-white border border-gray-300' // Conditional styling.
          }`}>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium">
                {keyType === 'aes' 
                  ? 'Generated AES Key' 
                  : keyType === 'random' 
                  ? 'Random Bytes' 
                  : `${hashAlgorithm} Hash`} {/* Dynamic label for the generated output. */}
              </label>
              {/* Button to copy the generated key to clipboard. */}
              <button
                onClick={copyToClipboard} // Call copy function.
                className={`flex items-center text-xs px-2 py-1 rounded ${
                  isDarkMode // Conditional styling for copy button.
                    ? 'bg-gray-600 text-blue-400 hover:bg-gray-500' 
                    : 'bg-gray-200 text-blue-600 hover:bg-gray-300'
                }`}
              >
                {copied ? (
                  // Display 'Copied!' feedback.
                  <>
                    <Check size={12} className="mr-1" /> {/* Check icon. */}
                    Copied!
                  </>
                ) : (
                  // Display 'Copy' button.
                  <>
                    <Copy size={12} className="mr-1" /> {/* Copy icon. */}
                    Copy
                  </>
                )}
              </button>
            </div>
            {/* Display the generated key/hash in a monospace font, allowing text wrapping. */}
            <div
              className={`w-full p-3 rounded-md font-mono text-sm break-all ${
                isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-gray-100 text-gray-800' // Conditional styling.
              }`}
            >
              {generatedKey}
            </div>
          </div>
        )}
      </div>

      {/* Usage information section. */}
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

// Export the KeyGenerator component as the default export.
export default KeyGenerator;