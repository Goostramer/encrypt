import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Shield, Lock } from 'lucide-react';

const Navbar: React.FC = () => {
  const { isDarkMode } = useTheme();
  
  return (
    <nav className={`py-4 px-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Shield className="text-blue-500" size={24} />
          <span className="font-bold text-xl">CryptoShield</span>
        </div>
        
        <div className="flex items-center space-x-6">
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className={`flex items-center space-x-1 ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
          >
            <Lock size={16} />
            <span>GitHub</span>
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;