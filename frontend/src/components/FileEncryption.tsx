// Import necessary React hooks and components.
import React, { useState, useRef } from 'react';
// Import the theme context to access dark mode state.
import { useTheme } from '../context/ThemeContext';
// Import icons from lucide-react for UI elements.
import { 
  FileUp, // Icon for file upload
  Lock, // Icon for encryption (lock closed)
  Unlock, // Icon for decryption (lock open)
  Download, // Icon for downloading files
  Trash2, // Icon for deleting/clearing files
  RefreshCw, // Icon for refreshing or generating (e.g., password)
  Check, // Icon for success
  FileWarning // Icon for warnings/errors
} from 'lucide-react';
// Import encryption and decryption utility functions and types.
import { 
  encryptFile, // Function to encrypt a file
  decryptFile, // Function to decrypt a file
  EncryptedData // Type definition for encrypted metadata
} from '../utils/cryptoUtils';

// Define the functional React component for file encryption/decryption.
const FileEncryption: React.FC = () => {
  // Access the dark mode state from the theme context.
  const { isDarkMode } = useTheme();
  // State to store the selected file.
  const [file, setFile] = useState<File | null>(null);
  // State to store the encrypted metadata (e.g., IV, salt) needed for decryption.
  const [encryptedMetadata, setEncryptedMetadata] = useState<EncryptedData | null>(null);
  // State to store the password entered by the user.
  const [password, setPassword] = useState('');
  // State to control the current mode: 'encrypt' or 'decrypt'.
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  // State to indicate if a process (encryption/decryption) is ongoing.
  const [isProcessing, setIsProcessing] = useState(false);
  // State to track the progress of the operation (0 to 1).
  const [progress, setProgress] = useState(0);
  // State to store any error messages.
  const [error, setError] = useState('');
  // State to store the result of the operation (download URL and filename).
  const [result, setResult] = useState<{ url: string; filename: string } | null>(null);
  // Ref to directly access the file input element (for clearing its value).
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handler for when a file is selected via the input field.
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Check if files exist and the first file is selected.
    if (e.target.files && e.target.files[0]) {
      // Set the selected file to state.
      setFile(e.target.files[0]);
      // Clear any previous errors.
      setError('');
      // Clear any previous results.
      setResult(null);
    }
  };

  // Handler for the encryption process.
  const handleEncrypt = async () => {
    // Validate if a file is selected.
    if (!file) {
      setError('Please select a file to encrypt');
      return;
    }
    // Validate if a password is provided.
    if (!password) {
      setError('Please enter a password');
      return;
    }

    // Clear previous errors.
    setError('');
    // Set processing state to true.
    setIsProcessing(true);
    // Reset progress to 0.
    setProgress(0);

    try {
      // Call the encryptFile utility function.
      // It returns the encrypted file (Blob) and metadata.
      const { encryptedFile, encryptedData } = await encryptFile(
        file, // The file to encrypt
        password, // The password for encryption
        (progressValue) => setProgress(progressValue) // Callback for progress updates
      );

      // Create a URL for the encrypted file, allowing it to be downloaded.
      const downloadUrl = URL.createObjectURL(encryptedFile);
      // Construct the filename for the encrypted file.
      const encryptedFilename = `${file.name}.encrypted`;

      // Save the encryption metadata to state.
      setEncryptedMetadata(encryptedData);
      
      // Set the result state with the download URL and filename.
      setResult({
        url: downloadUrl,
        filename: encryptedFilename
      });

      // Save metadata to localStorage for future decryption
      const storedMetadata = JSON.parse(localStorage.getItem('encryptedFiles') || '{}');
      storedMetadata[encryptedFilename] = encryptedData;
      localStorage.setItem('encryptedFiles', JSON.stringify(storedMetadata));
      
    } catch (err) {
      // Catch and display any errors during encryption.
      setError(`Encryption failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      // Always set processing state to false after completion or error.
      setIsProcessing(false);
    }
  };

  // Handler for the decryption process.
  const handleDecrypt = async () => {
    // Validate if an encrypted file is selected.
    if (!file) {
      setError('Please select an encrypted file');
      return;
    }
    // Validate if a password is provided.
    if (!password) {
      setError('Please enter the password');
      return;
    }

    // Clear previous errors.
    setError('');
    // Set processing state to true.
    setIsProcessing(true);
    // Reset progress to 0.
    setProgress(0);

    try {
      // Try to get the metadata from localStorage first.
      const storedMetadata = JSON.parse(localStorage.getItem('encryptedFiles') || '{}');
      let fileMetadata = encryptedMetadata; // Start with metadata from state if available

      if (!fileMetadata) {
        // If not in state, try to find the metadata by filename in localStorage.
        fileMetadata = storedMetadata[file.name] || null;

        // If metadata is still not found, throw an error.
        if (!fileMetadata) {
          throw new Error('Encryption metadata not found. Please provide the original encryption metadata.');
        }
      }

      // Call the decryptFile utility function.
      const decryptedFile = await decryptFile(
        file, // The encrypted file to decrypt
        fileMetadata, // The metadata required for decryption
        password, // The password for decryption
        (progressValue) => setProgress(progressValue) // Callback for progress updates
      );

      // Create a URL for the decrypted file.
      const downloadUrl = URL.createObjectURL(decryptedFile);
      
      // Determine the filename for the decrypted file, removing '.encrypted' if present.
      let decryptedFilename = file.name;
      if (decryptedFilename.endsWith('.encrypted')) {
        decryptedFilename = decryptedFilename.slice(0, -10);
      }

      // Set the result state with the download URL and filename.
      setResult({
        url: downloadUrl,
        filename: decryptedFilename
      });
      
    } catch (err) {
      // Catch and display any errors during decryption.
      setError(`Decryption failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      // Always set processing state to false.
      setIsProcessing(false);
    }
  };

  // Handler for file drop events (drag and drop).
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    // Prevent default browser behavior for drag/drop.
    e.preventDefault();
    e.stopPropagation();
    
    // Check if files were dropped and select the first one.
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      // Set the dropped file to state.
      setFile(e.dataTransfer.files[0]);
      // Clear errors and results.
      setError('');
      setResult(null);
    }
  };

  // Handler to generate a random password.
  const handleGeneratePassword = () => {
    // Define characters to use in the password.
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
    let generatedPassword = '';
    // Generate a 16-character random password.
    for (let i = 0; i < 16; i++) {
      generatedPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    // Set the generated password to state.
    setPassword(generatedPassword);
  };

  // Function to clear the selected file and reset related states.
  const clearFile = () => {
    setFile(null); // Clear the file.
    setResult(null); // Clear any previous results.
    setError(''); // Clear errors.
    // Reset the file input element's value to allow re-selecting the same file.
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Function to switch between encryption and decryption modes.
  const switchMode = (newMode: 'encrypt' | 'decrypt') => {
    setMode(newMode); // Set the new mode.
    clearFile(); // Clear the current file selection.
    setPassword(''); // Clear the password for the new mode.
    setProgress(0); // Reset progress.
    setEncryptedMetadata(null); // Clear metadata.
  };

  // Render the component's UI.
  return (
    <div className="space-y-6">
      {/* Mode selection buttons */}
      <div className="flex justify-center space-x-2 mb-6">
        {/* Encrypt button */}
        <button
          onClick={() => switchMode('encrypt')} // Switch to encrypt mode on click
          className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            mode === 'encrypt'
              ? isDarkMode // Apply dark mode specific styles if active
                ? 'bg-blue-600 text-white'
                : 'bg-blue-500 text-white'
              : isDarkMode // Apply dark mode specific styles if inactive
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <Lock size={16} className="mr-2" /> {/* Lock icon */}
          Encrypt
        </button>
        {/* Decrypt button */}
        <button
          onClick={() => switchMode('decrypt')} // Switch to decrypt mode on click
          className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            mode === 'decrypt'
              ? isDarkMode // Apply dark mode specific styles if active
                ? 'bg-blue-600 text-white'
                : 'bg-blue-500 text-white'
              : isDarkMode // Apply dark mode specific styles if inactive
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <Unlock size={16} className="mr-2" /> {/* Unlock icon */}
          Decrypt
        </button>
      </div>

      {/* File drop area / display */}
      <div 
        className={`border-2 border-dashed rounded-lg p-6 text-center ${
          isDarkMode // Apply dark mode specific styles for border
            ? 'border-gray-600 hover:border-gray-500' 
            : 'border-gray-300 hover:border-gray-400'
        } transition-colors`}
        onDragOver={(e) => e.preventDefault()} // Allow dropping by preventing default behavior
        onDrop={handleDrop} // Handle file drop
      >
        {/* Hidden file input */}
        <input
          type="file"
          onChange={handleFileChange} // Handle file selection
          className="hidden" // Hide the default input
          ref={fileInputRef} // Assign ref to clear value
          id="fileInput" // ID for label association
        />
        
        {/* Conditional rendering based on whether a file is selected */}
        {file ? (
          // Display selected file information
          <div className="space-y-3">
            <div className={`flex items-center justify-center p-3 rounded-md ${
              isDarkMode ? 'bg-gray-800' : 'bg-gray-100' // Background color based on theme
            }`}>
              <div className="flex-1 truncate">{file.name}</div> {/* File name, truncated if long */}
              <div className="ml-2 text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</div> {/* File size */}
              <button 
                onClick={clearFile} // Button to clear the selected file
                className={`ml-2 p-1 rounded-full ${
                  isDarkMode // Styles for clear button based on theme
                    ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Trash2 size={16} /> {/* Trash icon */}
              </button>
            </div>
          </div>
        ) : (
          // Display drag and drop prompt if no file is selected
          <label htmlFor="fileInput" className="cursor-pointer block">
            <FileUp className={`mx-auto h-12 w-12 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500' // Icon color based on theme
            }`} />
            <p className="mt-2 text-sm font-medium">
              Drag and drop a file here, or click to select
            </p>
            <p className={`mt-1 text-xs ${
              isDarkMode ? 'text-gray-500' : 'text-gray-400' // Text color based on theme
            }`}>
              {mode === 'encrypt' ? 'Any file type supported' : 'Select an encrypted file'} {/* Contextual text */}
            </p>
          </label>
        )}
      </div>

      {/* Password input section */}
      <div className={`p-4 rounded-md ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
        <div className="flex items-center justify-between mb-2">
          <label 
            htmlFor="filePassword" 
            className="block text-sm font-medium"
          >
            Password
          </label>
          {/* Generate password button */}
          <button
            onClick={handleGeneratePassword} // Call password generation function
            className={`flex items-center text-xs px-2 py-1 rounded ${
              isDarkMode // Styles for generate button based on theme
                ? 'bg-gray-700 text-blue-400 hover:bg-gray-600' 
                : 'bg-gray-200 text-blue-600 hover:bg-gray-300'
            }`}
          >
            <RefreshCw size={12} className="mr-1" /> {/* Refresh icon */}
            Generate
          </button>
        </div>
        <input
          id="filePassword"
          type="password" // Input type for password
          value={password} // Controlled component: value from state
          onChange={(e) => setPassword(e.target.value)} // Update password state on change
          className={`w-full p-3 rounded-md ${
            isDarkMode // Styles for password input based on theme
              ? 'bg-gray-700 text-gray-100 placeholder-gray-400' 
              : 'bg-white text-gray-900 placeholder-gray-500 border border-gray-300'
          }`}
          placeholder="Enter password for file encryption/decryption..." // Placeholder text
        />
      </div>

      {/* Error message display */}
      {error && (
        <div className={`p-3 rounded-md ${isDarkMode ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-700'}`}>
          <div className="flex items-start">
            <FileWarning size={18} className="mr-2 mt-0.5 flex-shrink-0" /> {/* Warning icon */}
            <span>{error}</span> {/* Error message text */}
          </div>
        </div>
      )}

      {/* Processing progress bar */}
      {isProcessing && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Processing...</span> {/* Processing text */}
            <span>{Math.round(progress * 100)}%</span> {/* Progress percentage */}
          </div>
          <div className={`h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
            <div 
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${progress * 100}%` }} // Dynamic width based on progress
            ></div>
          </div>
        </div>
      )}

      {/* Main action button (Encrypt/Decrypt) */}
      <div className="flex justify-center">
        <button
          onClick={mode === 'encrypt' ? handleEncrypt : handleDecrypt} // Call appropriate handler based on mode
          disabled={isProcessing || !file} // Disable button if processing or no file selected
          className={`flex items-center px-6 py-3 rounded-md font-medium transition-colors ${
            isProcessing || !file // Styles for disabled state
              ? isDarkMode
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : isDarkMode // Styles for active state
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {isProcessing ? (
            // Display processing state
            <>
              <RefreshCw size={18} className="mr-2 animate-spin" /> {/* Spinning refresh icon */}
              Processing...
            </>
          ) : mode === 'encrypt' ? (
            // Display encrypt button content
            <>
              <Lock size={18} className="mr-2" /> {/* Lock icon */}
              Encrypt File
            </>
          ) : (
            // Display decrypt button content
            <>
              <Unlock size={18} className="mr-2" /> {/* Unlock icon */}
              Decrypt File
            </>
          )}
        </button>
      </div>

      {/* Result display (download link) */}
      {result && (
        <div className={`p-4 rounded-md ${isDarkMode ? 'bg-green-900/20' : 'bg-green-50'} border ${isDarkMode ? 'border-green-800/30' : 'border-green-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Check size={18} className={`mr-2 ${isDarkMode ? 'text-green-400' : 'text-green-500'}`} /> {/* Check icon */}
              <span className={`font-medium ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>
                {mode === 'encrypt' ? 'File encrypted successfully!' : 'File decrypted successfully!'} {/* Success message */}
              </span>
            </div>
            {/* Download link */}
            <a
              href={result.url} // Download URL
              download={result.filename} // Suggested filename for download
              className={`flex items-center px-3 py-1 rounded-md text-sm ${
                isDarkMode // Styles for download button based on theme
                  ? 'bg-green-800/30 text-green-300 hover:bg-green-800/50'
                  : 'bg-green-100 text-green-800 hover:bg-green-200'
              }`}
            >
              <Download size={14} className="mr-1" /> {/* Download icon */}
              Download
            </a>
          </div>
        </div>
      )}

      {/* Privacy information / disclaimer */}
      <div className={`p-4 rounded-md ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'} text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        <p className="flex items-start">
          <Lock size={14} className="mr-2 mt-0.5 flex-shrink-0" /> {/* Lock icon */}
          All encryption and decryption is performed locally in your browser. Files are never uploaded to any server. {/* Privacy statement */}
        </p>
      </div>
    </div>
  );
};

// Export the component as default.
export default FileEncryption;