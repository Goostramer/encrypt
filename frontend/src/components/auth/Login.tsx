import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { LogIn, AlertCircle } from 'lucide-react';

interface LoginProps {
  onToggleForm: () => void;
}

const Login: React.FC<LoginProps> = ({ onToggleForm }) => {
  const { login } = useAuth();
  const { isDarkMode } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password');
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`p-6 rounded-lg shadow-md ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <h2 className="text-2xl font-bold mb-6 text-center">Log In</h2>
      
      {error && (
        <div className={`p-3 mb-4 rounded-md flex items-center ${isDarkMode ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-700'}`}>
          <AlertCircle size={18} className="mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label 
            htmlFor="email" 
            className="block mb-1 text-sm font-medium"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full p-3 rounded-md ${
              isDarkMode 
                ? 'bg-gray-700 text-gray-100 placeholder-gray-400' 
                : 'bg-white text-gray-900 placeholder-gray-500 border border-gray-300'
            }`}
            placeholder="Enter your email"
            disabled={isLoading}
          />
        </div>
        
        <div>
          <label 
            htmlFor="password" 
            className="block mb-1 text-sm font-medium"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full p-3 rounded-md ${
              isDarkMode 
                ? 'bg-gray-700 text-gray-100 placeholder-gray-400' 
                : 'bg-white text-gray-900 placeholder-gray-500 border border-gray-300'
            }`}
            placeholder="Enter your password"
            disabled={isLoading}
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full flex justify-center items-center py-3 px-4 rounded-md font-medium transition-colors ${
            isLoading
              ? isDarkMode
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : isDarkMode
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {isLoading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Logging in...
            </span>
          ) : (
            <>
              <LogIn size={18} className="mr-2" />
              Log In
            </>
          )}
        </button>
      </form>
      
      <div className="mt-4 text-center">
        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Don't have an account?{' '}
          <button
            onClick={onToggleForm}
            className={`font-medium ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
          >
            Register
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
