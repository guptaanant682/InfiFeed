
import React, { useState } from 'react';
import { INITIAL_CELEBRITIES, INITIAL_PUBLIC_USERS } from '../../constants';
import Button from '../Common/Button';
import { authService } from '../../services/authService'; // For placeholder functions
import { AppView } from '../../types';

interface LoginFormProps {
  onLogin: (username: string) => Promise<void>;
  onNavigate: (view: AppView) => void; // To navigate to Signup
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, onNavigate }) => {
  const [username, setUsername] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!username.trim()) {
      alert('Please enter a username.');
      return;
    }
    setIsLoading(true);
    await onLogin(username);
    setIsLoading(false);
  };

  const quickLogin = async (name: string): Promise<void> => {
    setUsername(name); 
    setIsLoading(true);
    await onLogin(name);
    setIsLoading(false);
  }

  const handleConceptualAuth = (method: string) => {
    let message = `"${method}" authentication selected. This feature requires backend implementation.`;
    switch (method) {
        case 'Google':
            authService.initiateGoogleLogin();
            break;
        case 'Phone':
            authService.loginWithPhoneNumber('123-456-7890'); // Example phone
            break;
        default:
            alert(message);
    }
  };


  return (
    <div className="bg-white p-8 sm:p-10 rounded-xl shadow-2xl w-full max-w-lg transform transition-all duration-500 ease-in-out">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-primary-600">InfiFeed</h1>
        <p className="text-gray-500 mt-2">Connect, Share, and Message.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 sr-only">
            Username (Demo Login)
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter demo username"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition duration-150 text-lg"
            required
            disabled={isLoading}
            aria-label="Username for demo login"
          />
        </div>
        <Button type="submit" fullWidth isLoading={isLoading} disabled={isLoading || !username.trim()} size="lg">
          {isLoading ? 'Signing In...' : 'Sign In with Demo User'}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Don't have a demo account? 
          <Button variant="ghost" onClick={() => onNavigate('SIGNUP')} className="text-primary-600 hover:text-primary-700 font-semibold ml-1 !p-0 !shadow-none">
            Sign Up
          </Button>
          <span className="text-xs block text-gray-500">(Conceptual: requires backend)</span>
        </p>
      </div>
      
      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-xs text-gray-500 mb-3 text-center uppercase font-semibold">Or use a demo account</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {INITIAL_CELEBRITIES.map(c => (
             <Button 
                key={c.id} 
                onClick={() => quickLogin(c.username)} 
                variant="outline" 
                size="sm" 
                fullWidth 
                disabled={isLoading}
                className="hover:bg-primary-50"
              >
              {c.username} (Celeb)
            </Button>
          ))}
          {INITIAL_PUBLIC_USERS.map(p => (
            <Button 
              key={p.id} 
              onClick={() => quickLogin(p.username)} 
              variant="outline" 
              size="sm" 
              fullWidth 
              disabled={isLoading}
              className="hover:bg-gray-100"
            >
              {p.username} (Public)
            </Button>
          ))}
        </div>
      </div>

       <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-xs text-gray-500 mb-3 text-center uppercase font-semibold">Conceptual Login Methods</p>
        <div className="space-y-3">
            <Button 
                onClick={() => handleConceptualAuth('Google')} 
                variant="outline" 
                fullWidth 
                disabled={isLoading}
                icon={<svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M22.56,12.25C22.56,11.47,22.49,10.72,22.36,10H12V14.5H18.36C18.04,16.09,17.22,17.43,15.97,18.25V21H19.78C21.66,19.26,22.56,16.03,22.56,12.25Z" fill="#4285F4"/><path d="M12,23C15.24,23,17.95,21.89,19.78,20L15.97,17.25C14.95,17.95,13.58,18.36,12,18.36C9.11,18.36,6.67,16.53,5.73,13.96H1.79V16.97C3.59,20.53,7.46,23,12,23Z" fill="#34A853"/><path d="M5.73,14.04C5.54,13.48,5.44,12.89,5.44,12.25C5.44,11.61,5.54,11.02,5.73,10.46V7.45H1.79C1.23,8.64,0.91,10.06,0.91,11.5C0.91,12.94,1.23,14.36,1.79,15.55L5.73,14.04Z" fill="#FBBC05"/><path d="M12,5.64C13.63,5.64,15.04,6.23,16.11,7.21L19.86,3.46C17.95,1.72,15.24,0.5,12,0.5C7.46,0.5,3.59,2.97,1.79,6.54L5.73,9.55C6.67,6.97,9.11,5.64,12,5.64Z" fill="#EA4335"/></svg>}
            >
                Sign in with Google
            </Button>
            <Button 
                onClick={() => handleConceptualAuth('Phone')} 
                variant="outline" 
                fullWidth 
                disabled={isLoading}
                icon={<svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M6.54 5c.06.89.21 1.76.45 2.59l-1.2 1.2c-.41-1.2-.67-2.47-.76-3.79h1.51m9.36 14.46c.89.24 1.76.39 2.59.45v1.51c-1.32-.09-2.59-.35-3.79-.76l1.2-1.2M7.5 3H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.49c0-.55-.45-1-1-1-1.24 0-2.45-.2-3.57-.57-.1-.04-.21-.05-.31-.05-.26 0-.51.1-.71.29l-2.2 2.2c-2.83-1.45-5.15-3.76-6.59-6.59l2.2-2.2c.28-.28.36-.67.25-1.02C8.7 6.45 8.5 5.25 8.5 4c0-.55-.45-1-1-1z"/></svg>}
            >
                Sign in with Phone
            </Button>
            <p className="text-xs text-gray-400 text-center">(These require backend implementation)</p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
