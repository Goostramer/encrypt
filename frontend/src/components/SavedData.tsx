import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { FileText, File, Key, Trash2, Download, AlertCircle } from 'lucide-react';
import api from '../services/api';

interface SavedDataItem {
  _id: string;
  name: string;
  type: 'text' | 'file' | 'rsa';
  data: {
    ciphertext: string;
    iv: string;
    salt?: string;
    algorithm: string;
  };
  metadata?: {
    originalFileName?: string;
    fileSize?: number;
    mimeType?: string;
  };
  createdAt: string;
}

const SavedData: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { isAuthenticated } = useAuth();
  const [savedData, setSavedData] = useState<SavedDataItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'text' | 'file' | 'rsa'>('all');

  useEffect(() => {
    if (isAuthenticated) {
      fetchSavedData();
    }
  }, [isAuthenticated, activeFilter]);

  const fetchSavedData = async () => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const type = activeFilter !== 'all' ? activeFilter : undefined;
      const response = await api.getEncryptedData(type);
      // Handle both possible response structures
      setSavedData(Array.isArray(response) ? response : 
                  response.data && Array.isArray(response.data) ? response.data : 
                  response.data && response.data.encryptedData ? response.data.encryptedData : []);
    } catch (err) {
      setError('Failed to load saved data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      await api.deleteEncryptedData(id);
      setSavedData(savedData.filter(item => item._id !== id));
    } catch (err) {
      setError('Failed to delete item');
      console.error(err);
    }
  };

  const handleDownload = (item: SavedDataItem) => {
    // Create a JSON file with the encrypted data
    const dataStr = JSON.stringify(item.data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    // Create a download link
    const url = URL.createObjectURL(dataBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${item.name}.json`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'text':
        return <FileText size={16} />;
      case 'file':
        return <File size={16} />;
      case 'rsa':
        return <Key size={16} />;
      default:
        return <FileText size={16} />;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className={`p-4 rounded-md ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
        <p className="text-center">Please log in to view your saved data</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Your Saved Data</h2>
        <div className="flex space-x-2">
          {['all', 'text', 'file', 'rsa'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter as any)}
              className={`px-3 py-1 text-sm rounded-md ${
                activeFilter === filter
                  ? isDarkMode
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-500 text-white'
                  : isDarkMode
                  ? 'bg-gray-700 hover:bg-gray-600'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className={`p-3 rounded-md flex items-center ${isDarkMode ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-700'}`}>
          <AlertCircle size={18} className="mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8">
          <svg className="animate-spin h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : savedData.length === 0 ? (
        <div className={`p-8 rounded-md text-center ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
          <p className="text-lg">No saved data found</p>
          <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Encrypt some data and save it to see it here
          </p>
        </div>
      ) : (
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
              {savedData.map((item) => (
                <tr key={item._id} className={isDarkMode ? 'bg-gray-900' : 'bg-white'}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`p-1.5 rounded-md mr-2 ${
                        item.type === 'text'
                          ? 'bg-green-100 text-green-800'
                          : item.type === 'file'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {getTypeIcon(item.type)}
                      </span>
                      <span className="capitalize">{item.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium">{item.name}</div>
                    {item.type === 'file' && item.metadata?.originalFileName && (
                      <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {item.metadata.originalFileName}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {formatDate(item.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleDownload(item)}
                      className={`inline-flex items-center p-1.5 rounded-md mr-2 ${
                        isDarkMode
                          ? 'text-blue-400 hover:bg-gray-800'
                          : 'text-blue-600 hover:bg-gray-100'
                      }`}
                      title="Download"
                    >
                      <Download size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className={`inline-flex items-center p-1.5 rounded-md ${
                        isDarkMode
                          ? 'text-red-400 hover:bg-gray-800'
                          : 'text-red-600 hover:bg-gray-100'
                      }`}
                      title="Delete"
                    >
                      <Trash2 size={16} />
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

export default SavedData;
