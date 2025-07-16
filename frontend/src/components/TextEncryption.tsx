// Import necessary React hooks for state management.
import React, { useState } from 'react';
// Import the custom theme context hook to access theme-related states (e.g., isDarkMode).
import { useTheme } from '../context/ThemeContext';
// Import specific icons from 'lucide-react' for various UI elements.
import { 
  Lock, // Icon for encryption (closed lock).
  Unlock, // Icon for decryption (open lock).
  Copy, // Icon for copying text to clipboard.
  Check, // Icon to indicate success or completion (e.g., copied).
  RefreshCw // Icon for generating or refreshing (e.g., password).
} from 'lucide-react';
// Import utility functions and types for cryptographic operations.
import { 
  encryptWithPassword, // Function to encrypt text using a password.
  decryptWithPassword, // Function to decrypt text using a password.
  bufferToString, // Utility to convert an ArrayBuffer to a string.
  EncryptedData // Type definition for the structure of encrypted data.
} from '../utils/cryptoUtils';

// Define the functional React component for text encryption and decryption.
const TextEncryption: React.FC = () => {
  // Access the 'isDarkMode' state from the theme context to apply dynamic styling.
  const { isDarkMode } = useTheme();
  // State to store the input text for encryption or decryption.
  const [inputText, setInputText] = useState('');
  // State to store the password entered by the user.
  const [password, setPassword] = useState('');
  // State to store the output text (encrypted JSON or decrypted plain text).
  const [outputText, setOutputText] = useState('');
  // State to control the current mode: 'encrypt' or 'decrypt'.
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  // State to indicate if an encryption or decryption process is currently underway.
  const [isProcessing, setIsProcessing] = useState(false);
  // State to indicate if the output text has been copied to the clipboard.
  const [isCopied, setIsCopied] = useState(false);
  // State to store any error messages.
  const [error, setError] = useState('');

  // Asynchronous function to handle the encryption process.
  const handleEncrypt = async () => {
    // Validate if input text is provided.
    if (!inputText.trim()) {
      setError('Please enter text to encrypt');
      return;
    }
    // Validate if a password is provided.
    if (!password.trim()) {
      setError('Please enter a password');
      return;
    }

    setError(''); // Clear any previous errors.
    setIsProcessing(true); // Set processing state to true.
    
    try {
      // Call the encryptWithPassword utility function to encrypt the input text.
      const encryptedData = await encryptWithPassword(inputText, password);
      // Convert the encrypted data object to a JSON string for display/copying.
      setOutputText(JSON.stringify(encryptedData));
    } catch (err) {
      // Catch and display any errors that occur during encryption.
      setError(`Encryption failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false); // Always set processing state to false after completion or error.
    }
  };

  // Asynchronous function to handle the decryption process.
  const handleDecrypt = async () => {
    // Validate if encrypted data is provided in the input field.
    if (!inputText.trim()) {
      setError('Please enter encrypted data to decrypt');
      return;
    }
    // Validate if a password is provided.
    if (!password.trim()) {
      setError('Please enter a password');
      return;
    }

    setError(''); // Clear any previous errors.
    setIsProcessing(true); // Set processing state to true.
    
    try {
      // Parse the input text, assuming it's a JSON string representing EncryptedData.
      const encryptedData: EncryptedData = JSON.parse(inputText);
      // Call the decryptWithPassword utility function to decrypt the data.
      const decryptedBuffer = await decryptWithPassword(encryptedData, password);
      // Convert the decrypted ArrayBuffer to a readable string.
      const decryptedText = bufferToString(decryptedBuffer);
      setOutputText(decryptedText); // Set the decrypted text to the output state.
    } catch (err) {
      // Catch and display any errors that occur during decryption.
      setError(`Decryption failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false); // Always set processing state to false.
    }
  };

  // Function to copy the output text to the clipboard.
  const handleCopyToClipboard = () => {
    // Use the Clipboard API to write the output text to clipboard.
    navigator.clipboard.writeText(outputText).then(() => {
      setIsCopied(true); // Set copied state to true to show feedback.
      // Reset copied state to false after 2 seconds.
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  // Function to generate a random, strong password.
  const handleGeneratePassword = () => {
    // Define characters to be used in the generated password.
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
    let generatedPassword = '';
    // Generate a 16-character random password.
    for (let i = 0; i < 16; i++) {
      generatedPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(generatedPassword); // Set the generated password to the state.
  };

  // Function to switch between encryption and decryption modes.
  const switchMode = (newMode: 'encrypt' | 'decrypt') => {
    setMode(newMode); // Set the new mode.
    setInputText(''); // Clear the input text.
    setOutputText(''); // Clear the output text.
    setPassword(''); // Clear the password for a fresh start in the new mode.
    setError(''); // Clear any error messages.
  };

  // Render the component's UI.
  return (
    <div className="space-y-6">
      {/* Mode selection buttons (Encrypt / Decrypt). */}
      <div className="flex justify-center space-x-2 mb-6">
        {/* Encrypt mode button. */}
        <button
          onClick={() => switchMode('encrypt')} // Switch to encrypt mode on click.
          className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            mode === 'encrypt' // Conditional styling based on active mode and dark mode.
              ? isDarkMode
                ? 'bg-blue-600 text-white'
                : 'bg-blue-500 text-white'
              : isDarkMode
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <Lock size={16} className="mr-2" /> {/* Lock icon. */}
          Encrypt
        </button>
        {/* Decrypt mode button. */}
        <button
          onClick={() => switchMode('decrypt')} // Switch to decrypt mode on click.
          className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            mode === 'decrypt' // Conditional styling based on active mode and dark mode.
              ? isDarkMode
                ? 'bg-blue-600 text-white'
                : 'bg-blue-500 text-white'
              : isDarkMode
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <Unlock size={16} className="mr-2" /> {/* Unlock icon. */}
          Decrypt
        </button>
      </div>

      {/* Input text area for data to be encrypted/decrypted. */}
      <div className={`p-4 rounded-md ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
        <label 
          htmlFor="inputText" 
          className="block mb-2 text-sm font-medium"
        >
          {mode === 'encrypt' ? 'Text to Encrypt' : 'Encrypted Data (JSON)'} {/* Dynamic label based on mode. */}
        </label>
        <textarea
          id="inputText"
          value={inputText} // Controlled component: value from state.
          onChange={(e) => setInputText(e.target.value)} // Update input text state on change.
          className={`w-full h-32 p-3 rounded-md ${
            isDarkMode // Conditional styling for the textarea.
              ? 'bg-gray-700 text-gray-100 placeholder-gray-400' 
              : 'bg-white text-gray-900 placeholder-gray-500 border border-gray-300'
          }`}
          placeholder={
            mode === 'encrypt' 
              ? 'Enter text to encrypt...' 
              : 'Paste encrypted JSON data here...'
          } // Dynamic placeholder text.
        />
      </div>

      {/* Password input section. */}
      <div className={`p-4 rounded-md ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
        <div className="flex items-center justify-between mb-2">
          <label 
            htmlFor="password" 
            className="block text-sm font-medium"
          >
            Password {/* Label for password input. */}
          </label>
          {/* Button to generate a random password. */}
          <button
            onClick={handleGeneratePassword} // Call password generation function.
            className={`flex items-center text-xs px-2 py-1 rounded ${
              isDarkMode // Conditional styling for the generate password button.
                ? 'bg-gray-700 text-blue-400 hover:bg-gray-600' 
                : 'bg-gray-200 text-blue-600 hover:bg-gray-300'
            }`}
          >
            <RefreshCw size={12} className="mr-1" /> {/* Refresh icon. */}
            Generate
          </button>
        </div>
        <input
          id="password"
          type="password" // Input type set to 'password' for masked input.
          value={password} // Controlled component: value from state.
          onChange={(e) => setPassword(e.target.value)} // Update password state on change.
          className={`w-full p-3 rounded-md ${
            isDarkMode // Conditional styling for the password input.
              ? 'bg-gray-700 text-gray-100 placeholder-gray-400' 
              : 'bg-white text-gray-900 placeholder-gray-500 border border-gray-300'
          }`}
          placeholder="Enter password..." // Placeholder text.
        />
      </div>

      {/* Error message display. */}
      {error && (
        <div className={`p-3 rounded-md ${isDarkMode ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-700'}`}>
          {error} {/* Display the error message. */}
        </div>
      )}

      {/* Main action button (Encrypt / Decrypt). */}
      <div className="flex justify-center">
        <button
          onClick={mode === 'encrypt' ? handleEncrypt : handleDecrypt} // Call appropriate handler based on current mode.
          disabled={isProcessing} // Disable button while an operation is in progress.
          className={`flex items-center px-6 py-3 rounded-md font-medium transition-colors ${
            isProcessing // Conditional styling for disabled/enabled state and dark mode.
              ? isDarkMode
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : isDarkMode
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {isProcessing ? (
            // Display loading state with a spinning icon.
            <>
              <RefreshCw size={18} className="mr-2 animate-spin" /> {/* Spinning refresh icon. */}
              Processing...
            </>
          ) : mode === 'encrypt' ? (
            // Display encrypt button content.
            <>
              <Lock size={18} className="mr-2" /> {/* Lock icon. */}
              Encrypt
            </>
          ) : (
            // Display decrypt button content.
            <>
              <Unlock size={18} className="mr-2" /> {/* Unlock icon. */}
              Decrypt
            </>
          )}
        </button>
      </div>

      {/* Output text area for encrypted/decrypted result. */}
      {outputText && (
        <div className={`p-4 rounded-md ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium">
              {mode === 'encrypt' ? 'Encrypted Result' : 'Decrypted Text'} {/* Dynamic label based on mode. */}
            </label>
            {/* Button to copy output text to clipboard. */}
            <button
              onClick={handleCopyToClipboard} // Call copy function.
              className={`flex items-center text-xs px-2 py-1 rounded ${
                isDarkMode // Conditional styling for the copy button.
                  ? 'bg-gray-700 text-blue-400 hover:bg-gray-600' 
                  : 'bg-gray-200 text-blue-600 hover:bg-gray-300'
              }`}
            >
              {isCopied ? (
                // Feedback when text is copied.
                <>
                  <Check size={12} className="mr-1" /> {/* Check icon. */}
                  Copied!
                </>
              ) : (
                // Copy button.
                <>
                  <Copy size={12} className="mr-1" /> {/* Copy icon. */}
                  Copy
                </>
              )}
            </button>
          </div>
          {/* Display the output text in a scrollable, pre-formatted, and breakable div. */}
          <div 
            className={`w-full h-32 p-3 rounded-md overflow-auto ${
              isDarkMode // Conditional styling for the output display area.
                ? 'bg-gray-700 text-gray-100' 
                : 'bg-white text-gray-900 border border-gray-300'
            }`}
          >
            <pre className="whitespace-pre-wrap break-all">{outputText}</pre> {/* Pre-formatted text with wrapping. */}
          </div>
        </div>
      )}
    </div>
  );
};

// Export the TextEncryption component as the default export.
export default TextEncryption;