import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Shield } from 'lucide-react';

const Footer: React.FC = () => {
  const { isDarkMode } = useTheme();
  
  return (
    <footer className={`py-6 px-6 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Shield className="text-blue-500" size={20} />
            <span className="font-bold">CryptoShield</span>
          </div>
          
          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            &copy; {new Date().getFullYear()} CryptoShield. All cryptographic operations performed in-browser.
          </div>
        </div>
        
        <div className={`mt-4 pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          <p>This application uses Web Crypto API for secure cryptographic operations. No data leaves your browser.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;