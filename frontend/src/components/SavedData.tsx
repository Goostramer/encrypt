// Import necessary React hooks for state management and side effects.
import React, { useState, useEffect } from 'react';
// Import the custom theme context hook to access theme-related states (e.g., isDarkMode).
import { useTheme } from '../context/ThemeContext';
// Import specific icons from 'lucide-react' for various UI elements.
import { 
  FileText, // Icon for text-based data.
  File, // Icon for file-based data.
  Key, // Icon for RSA key data.
  Trash2, // Icon for deleting items.
  Download, // Icon for downloading items.
  AlertCircle // Icon for displaying error messages.
} from 'lucide-react';
// Import the API service to interact with the backend for data operations.
import api from '../services/api';

// Define the interface for a single item of saved encrypted data.
interface SavedDataItem {
  _id: string; // Unique identifier for the saved item.
  name: string; // User-defined name for the item.
  type: 'text' | 'file' | 'rsa'; // Type of data: 'text', 'file', or 'rsa' (for keys).
  data: { // The encrypted data payload.
    ciphertext: string; // The encrypted content.
    iv: string; // Initialization Vector, crucial for decryption.
    salt?: string; // Optional salt, typically used in key derivation for password-based encryption.
    algorithm: string; // The encryption algorithm used (e.g., 'AES-GCM', 'RSA-OAEP').
  };
  metadata?: { // Optional metadata, particularly useful for file types.
    originalFileName?: string; // Original name of the file before encryption.
    fileSize?: number; // Original size of the file.
    mimeType?: string; // MIME type of the original file.
  };
  createdAt: string; // Timestamp when the item was created/saved.
}

// Define the functional React component named SavedData.
const SavedData: React.FC = () => {
  // Access the 'isDarkMode' state from the theme context to apply dynamic styling.
  const { isDarkMode } = useTheme();
  // State to store the array of fetched saved data items.
  const [savedData, setSavedData] = useState<SavedDataItem[]>([]);
  // State to indicate if data is currently being loaded from the API.
  const [isLoading, setIsLoading] = useState(false);
  // State to store any error messages encountered during API calls.
  const [error, setError] = useState('');
  // State to manage the active filter for displaying data ('all', 'text', 'file', 'rsa').
  const [activeFilter, setActiveFilter] = useState<'all' | 'text' | 'file' | 'rsa'>('all');

  // useEffect hook to fetch saved data whenever the 'activeFilter' changes.
  useEffect(() => {
    fetchSavedData(); // Call the data fetching function.
  }, [activeFilter]); // Dependency array: re-run effect when activeFilter changes.

  // Asynchronous function to fetch saved data from the backend API.
  const fetchSavedData = async () => {
    setIsLoading(true); // Set loading state to true.
    setError(''); // Clear any previous error messages.
    try {
      // Determine the type filter to send to the API. If 'all', send undefined.
      const type = activeFilter !== 'all' ? activeFilter : undefined;
      // Make an API call to get encrypted data, optionally filtered by type.
      const response = await api.getEncryptedData(type);
      // Set the fetched data to the 'savedData' state.
      // Includes robust checks for various response structures.
      setSavedData(Array.isArray(response) ? response : 
                   response.data && Array.isArray(response.data) ? response.data : 
                   response.data && response.data.encryptedData ? response.data.encryptedData : []);
    } catch (err) {
      // Catch and set an error message if the API call fails.
      setError('Failed to load saved data');
      console.error(err); // Log the error for debugging.
    } finally {
      setIsLoading(false); // Always set loading state to false after the operation.
    }
  };

  // Asynchronous function to handle the deletion of a saved item.
  const handleDelete = async (id: string) => {
    // Prompt user for confirmation before deleting. If cancelled, return.
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      // Make an API call to delete the encrypted data by its ID.
      await api.deleteEncryptedData(id);
      // Update the 'savedData' state by filtering out the deleted item.
      setSavedData(savedData.filter(item => item._id !== id));
    } catch (err) {
      // Catch and set an error message if deletion fails.
      setError('Failed to delete item');
      console.error(err); // Log the error for debugging.
    }
  };

  // Function to handle downloading the raw encrypted data of an item.
  const handleDownload = (item: SavedDataItem) => {
    // Convert the item's data (ciphertext, iv, etc.) to a formatted JSON string.
    const dataStr = JSON.stringify(item.data, null, 2);
    // Create a Blob object from the JSON string with 'application/json' MIME type.
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    // Create a URL for the Blob.
    const url = URL.createObjectURL(dataBlob);
    // Create a temporary anchor element to trigger the download.
    const a = document.createElement('a');
    a.href = url; // Set the href to the Blob URL.
    a.download = `${item.name}.json`; // Set the download filename.
    document.body.appendChild(a); // Append the anchor to the document body.
    a.click(); // Programmatically click the anchor to start download.
    URL.revokeObjectURL(url); // Revoke the Blob URL to free up resources.
    document.body.removeChild(a); // Remove the temporary anchor element.
  };

  // Function to format a date string into a localized date and time string.
  const formatDate = (dateString: string) => {
    const date = new Date(dateString); // Create a Date object from the string.
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString(); // Format and return.
  };

  // Function to return the appropriate icon based on the data type.
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'text':
        return <FileText size={16} />; // Icon for text data.
      case 'file':
        return <File size={16} />; // Icon for file data.
      case 'rsa':
        return <Key size={16} />; // Icon for RSA key data.
      default:
        return <FileText size={16} />; // Default icon.
    }
  };

  // Render the component's UI.
  return (
    <div className="space-y-4">
      {/* Header section with title and filter buttons. */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Your Saved Data</h2> {/* Section title. */}
        <div className="flex space-x-2">
          {/* Map through filter options to create filter buttons. */}
          {['all', 'text', 'file', 'rsa'].map((filter) => (
            <button
              key={filter} // Unique key for each button.
              onClick={() => setActiveFilter(filter as any)} // Set active filter on click.
              className={`px-3 py-1 text-sm rounded-md ${
                activeFilter === filter // Conditional styling for active filter button.
                  ? isDarkMode
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-500 text-white'
                  : isDarkMode
                  ? 'bg-gray-700 hover:bg-gray-600'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)} {/* Capitalize first letter for display. */}
            </button>
          ))}
        </div>
      </div>

      {/* Error message display. */}
      {error && (
        <div className={`p-3 rounded-md flex items-center ${isDarkMode ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-700'}`}>
          <AlertCircle size={18} className="mr-2 flex-shrink-0" /> {/* Alert icon. */}
          <span>{error}</span> {/* Error message text. */}
        </div>
      )}

      {/* Conditional rendering based on loading state and data availability. */}
      {isLoading ? (
        // Loading spinner when data is being fetched.
        <div className="flex justify-center py-8">
          <svg className="animate-spin h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : savedData.length === 0 ? (
        // Message displayed when no saved data is found.
        <div className={`p-8 rounded-md text-center ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
          <p className="text-lg">No saved data found</p>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
            Encrypt some data and save it to see it here
          </p>
        </div>
      ) : (
        // Table to display saved data when available.
        <div className={`rounded-md overflow-hidden border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className={isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}>
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Created</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {/* Map through savedData to render each item as a table row. */}
              {savedData.map((item) => (
                <tr key={item._id} className={isDarkMode ? 'bg-gray-900' : 'bg-white'}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`p-1.5 rounded-md mr-2 ${
                        item.type === 'text' // Conditional background and text color based on item type.
                          ? 'bg-green-100 text-green-800'
                          : item.type === 'file'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {getTypeIcon(item.type)} {/* Display type-specific icon. */}
                      </span>
                      <span className="capitalize">{item.type}</span> {/* Display capitalized type. */}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium">{item.name}</div> {/* Item name. */}
                    {item.type === 'file' && item.metadata?.originalFileName && (
                      <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {item.metadata.originalFileName} {/* Display original filename for file type. */}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {formatDate(item.createdAt)} {/* Formatted creation date. */}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {/* Download button. */}
                    <button
                      onClick={() => handleDownload(item)} // Call download handler.
                      className={`inline-flex items-center p-1.5 rounded-md mr-2 ${
                        isDarkMode // Conditional styling for download button.
                          ? 'text-blue-400 hover:bg-gray-800'
                          : 'text-blue-600 hover:bg-gray-100'
                      }`}
                      title="Download" // Tooltip.
                    >
                      <Download size={16} /> {/* Download icon. */}
                    </button>
                    {/* Delete button. */}
                    <button
                      onClick={() => handleDelete(item._id)} // Call delete handler.
                      className={`inline-flex items-center p-1.5 rounded-md ${
                        isDarkMode // Conditional styling for delete button.
                          ? 'text-red-400 hover:bg-gray-800'
                          : 'text-red-600 hover:bg-gray-100'
                      }`}
                      title="Delete" // Tooltip.
                    >
                      <Trash2 size={16} /> {/* Trash icon. */}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// Export the SavedData component as the default export.
export default SavedData;