import React, { useState } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { BackendStatusProvider, useBackendStatus } from './context/BackendStatusContext';
import { Sun, Moon, Save, Database, AlertTriangle } from 'lucide-react';
import Navbar from './components/Navbar';
import TextEncryption from './components/TextEncryption';
import FileEncryption from './components/FileEncryption';
import RSAEncryption from './components/RSAEncryption';
import KeyGenerator from './components/KeyGenerator';
import Footer from './components/Footer';

import SavedData from './components/SavedData';

// Main app wrapper component
const AppContent = () => {
  const [activeTab, setActiveTab] = useState('text');
  const [showSavedData, setShowSavedData] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();
  const { backendStatus } = useBackendStatus();

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      {backendStatus.fallbackMode && (
        <div className={`p-2 text-center ${isDarkMode ? 'bg-yellow-800 text-yellow-200' : 'bg-yellow-200 text-yellow-800'}`}>
          <div className="flex items-center justify-center">
            <AlertTriangle size={16} className="mr-2" />
            <span>Running in fallback mode. Data will not be saved to the database.</span>
          </div>
        </div>
      )}
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Secure Encryption App</h1>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSavedData(!showSavedData)}
              className={`p-2 rounded-md flex items-center ${
                showSavedData
                  ? isDarkMode 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-blue-500 text-white'
                  : isDarkMode 
                    ? 'bg-gray-800 text-blue-400' 
                    : 'bg-gray-200 text-blue-600'
              }`}
              aria-label="Toggle saved data"
            >
              {showSavedData ? <Save size={20} /> : <Database size={20} />}
              <span className="ml-2 text-sm font-medium">
                {showSavedData ? 'Encryption Tools' : 'Saved Data'}
              </span>
            </button>
            <button 
              onClick={toggleTheme} 
              className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-800 text-yellow-400' : 'bg-gray-200 text-gray-800'}`}
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
        
        {showSavedData ? (
          <SavedData />
        ) : (
          <div className={`mb-8 rounded-lg overflow-hidden border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className={`flex flex-wrap ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
              {['text', 'file', 'rsa', 'keys'].map((tab) => (
                <button
                  key={tab}
                  className={`px-6 py-3 font-medium transition-colors capitalize ${
                    activeTab === tab 
                      ? isDarkMode 
                        ? 'bg-gray-900 text-blue-400 border-b-2 border-blue-500' 
                        : 'bg-white text-blue-600 border-b-2 border-blue-500'
                      : ''
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === 'rsa' ? 'RSA' : tab === 'keys' ? 'Key Generator' : `${tab} Encryption`}
                </button>
              ))}
            </div>
            
            <div className={`p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
              {activeTab === 'text' && <TextEncryption />}
              {activeTab === 'file' && <FileEncryption />}
              {activeTab === 'rsa' && <RSAEncryption />}
              {activeTab === 'keys' && <KeyGenerator />}
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    localStorage.setItem('theme', !isDarkMode ? 'dark' : 'light');
  };

  return (
    <ThemeProvider value={{ isDarkMode, toggleTheme }}>
      <BackendStatusProvider>
        <AppContent />
      </BackendStatusProvider>
    </ThemeProvider>
  );
}

export default App;