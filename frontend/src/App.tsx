// Import React and necessary hooks for state management.
import React, { useState } from 'react';
// Import ThemeProvider and useTheme from the custom ThemeContext for theme management.
import { ThemeProvider, useTheme } from './context/ThemeContext';
// Import BackendStatusProvider and useBackendStatus from the custom BackendStatusContext for backend status.
import { BackendStatusProvider, useBackendStatus } from './context/BackendStatusContext';
// Import icons from 'lucide-react' for various UI elements.
import { Sun, Moon, Save, Database, AlertTriangle } from 'lucide-react';
// Import various components used within the application.
import Navbar from './components/Navbar'; // Navigation bar component.
import TextEncryption from './components/TextEncryption'; // Component for text encryption/decryption.
import FileEncryption from './components/FileEncryption'; // Component for file encryption/decryption.
import RSAEncryption from './components/RSAEncryption'; // Component for RSA encryption/decryption.
import KeyGenerator from './components/KeyGenerator'; // Component for generating cryptographic keys.
import Footer from './components/Footer'; // Footer component.
import SavedData from './components/SavedData'; // Component to display and manage saved encrypted data.

// Main application content component, wrapped by theme and backend status providers.
const AppContent = () => {
  // State to manage the currently active tab in the main content area.
  const [activeTab, setActiveTab] = useState('text');
  // State to toggle between showing encryption tools and saved data.
  const [showSavedData, setShowSavedData] = useState(false);
  // Access theme-related states and functions from the ThemeContext.
  const { isDarkMode, toggleTheme } = useTheme();
  // Access backend status from the BackendStatusContext.
  const { backendStatus } = useBackendStatus();

  // Render the main application layout.
  return (
    // Main container div with dynamic background and text colors based on the theme.
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      {/* Conditional rendering for fallback mode alert. */}
      {/* Fallback mode alert removed as requested. */}
      <Navbar /> {/* Render the Navbar component. */}
      
      {/* Main content area, centered with max width and padding. */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header section with app title and action buttons. */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Secure Encryption App</h1> {/* Application title. */}
          <div className="flex items-center space-x-2">
            {/* Button to toggle between encryption tools and saved data views. */}
            <button
              onClick={() => setShowSavedData(!showSavedData)} // Toggle showSavedData state on click.
              className={`p-2 rounded-md flex items-center ${
                showSavedData // Conditional styling based on showSavedData state and theme.
                  ? isDarkMode 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-blue-500 text-white'
                  : isDarkMode 
                    ? 'bg-gray-800 text-blue-400' 
                    : 'bg-gray-200 text-blue-600'
              }`}
              aria-label="Toggle saved data" // Accessibility label.
            >
              {showSavedData ? <Save size={20} /> : <Database size={20} />} {/* Dynamic icon based on view. */}
              <span className="ml-2 text-sm font-medium">
                {showSavedData ? 'Encryption Tools' : 'Saved Data'} {/* Dynamic button text. */}
              </span>
            </button>
            {/* Button to toggle between light and dark themes. */}
            <button 
              onClick={toggleTheme} // Call toggleTheme function from ThemeContext.
              className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-800 text-yellow-400' : 'bg-gray-200 text-gray-800'}`}
              aria-label="Toggle theme" // Accessibility label.
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />} {/* Dynamic icon based on theme. */}
            </button>
          </div>
        </div>
        
        {/* Conditional rendering: show SavedData component or encryption tool tabs. */}
        {showSavedData ? (
          <SavedData /> // Render SavedData component if showSavedData is true.
        ) : (
          // Container for encryption tool tabs and their respective components.
          <div className={`mb-8 rounded-lg overflow-hidden border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            {/* Tab navigation buttons. */}
            <div className={`flex flex-wrap ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
              {/* Map through tab names to create navigation buttons. */}
              {['text', 'file', 'rsa', 'keys'].map((tab) => (
                <button
                  key={tab} // Unique key for each tab button.
                  className={`px-6 py-3 font-medium transition-colors capitalize ${
                    activeTab === tab // Conditional styling for active tab.
                      ? isDarkMode 
                        ? 'bg-gray-900 text-blue-400 border-b-2 border-blue-500' 
                        : 'bg-white text-blue-600 border-b-2 border-blue-500'
                      : '' // No specific styling if not active.
                  }`}
                  onClick={() => setActiveTab(tab)} // Set active tab on click.
                >
                  {/* Dynamic tab text: 'RSA' for rsa, 'Key Generator' for keys, otherwise 'X Encryption'. */}
                  {tab === 'rsa' ? 'RSA' : tab === 'keys' ? 'Key Generator' : `${tab} Encryption`}
                </button>
              ))}
            </div>
            
            {/* Content area for the active tab. */}
            <div className={`p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
              {/* Conditional rendering of components based on the activeTab state. */}
              {activeTab === 'text' && <TextEncryption />} {/* Render TextEncryption if 'text' tab is active. */}
              {activeTab === 'file' && <FileEncryption />} {/* Render FileEncryption if 'file' tab is active. */}
              {activeTab === 'rsa' && <RSAEncryption />} {/* Render RSAEncryption if 'rsa' tab is active. */}
              {activeTab === 'keys' && <KeyGenerator />} {/* Render KeyGenerator if 'keys' tab is active. */}
            </div>
          </div>
        )}
      </main>
      
      <Footer /> {/* Render the Footer component. */}
    </div>
  );
};

// Root App component that sets up context providers.
function App() {
  // State for dark mode, initialized by checking localStorage or system preference.
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme'); // Try to get theme from localStorage.
    // If a theme is saved, use it; otherwise, check system preference.
    return savedTheme ? savedTheme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Function to toggle the theme (dark/light).
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode); // Toggle the isDarkMode state.
    // Save the new theme preference to localStorage.
    localStorage.setItem('theme', !isDarkMode ? 'dark' : 'light');
  };

  // Provide theme and backend status contexts to the AppContent.
  return (
    <ThemeProvider value={{ isDarkMode, toggleTheme }}> {/* Provides theme state and toggle function. */}
      <BackendStatusProvider> {/* Provides backend status. */}
        <AppContent /> {/* Renders the main application content. */}
      </BackendStatusProvider>
    </ThemeProvider>
  );
}

// Export the main App component as the default export.
export default App;