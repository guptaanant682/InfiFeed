
import React, { useState } from 'react';
import Button from '../Common/Button';
import { UserRole, AppView } from '../../types';

interface SignupFormProps {
  onSignup: (username: string, email: string, role: UserRole) => Promise<void>;
  onNavigate: (view: AppView) => void; // To navigate back to Login
}

const SignupForm: React.FC<SignupFormProps> = ({ onSignup, onNavigate }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // Conceptual, not used in onSignup placeholder
  const [role, setRole] = useState<UserRole>(UserRole.PUBLIC);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !email.trim() || !password.trim()) {
      setError('All fields are required.');
      return;
    }
    // Basic email validation
    if (!/\S+@\S+\.\S+/.test(email)) {
        setError('Please enter a valid email address.');
        return;
    }

    setIsLoading(true);
    try {
      // The onSignup in App.tsx is a placeholder and doesn't use the password.
      await onSignup(username, email, role); 
      // Successful conceptual signup, App.tsx will navigate to LOGIN.
    } catch (err: any) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 sm:p-10 rounded-xl shadow-2xl w-full max-w-lg">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-primary-600">Create Account</h1>
        <p className="text-gray-500 mt-1">Join InfiFeed Today!</p>
        <p className="text-xs text-gray-400 mt-1">(Conceptual Signup - Requires Backend)</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="signup-username" className="block text-sm font-medium text-gray-700">Username</label>
          <input
            type="text"
            id="signup-username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            required
            disabled={isLoading}
          />
        </div>
        <div>
          <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            id="signup-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            required
            disabled={isLoading}
          />
        </div>
        <div>
          <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            id="signup-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            required
            disabled={isLoading}
          />
        </div>
        <div>
          <label htmlFor="signup-role" className="block text-sm font-medium text-gray-700">Account Type</label>
          <select
            id="signup-role"
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="mt-1 block w-full pl-3 pr-10 py-2.5 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-lg shadow-sm"
            disabled={isLoading}
          >
            <option value={UserRole.PUBLIC}>Public User</option>
            <option value={UserRole.CELEBRITY}>Celebrity</option>
          </select>
        </div>
        {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
        <Button type="submit" fullWidth isLoading={isLoading} disabled={isLoading} size="lg">
          {isLoading ? 'Creating Account...' : 'Sign Up'}
        </Button>
      </form>
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?
          <Button variant="ghost" onClick={() => onNavigate('LOGIN')} className="text-primary-600 hover:text-primary-700 font-semibold ml-1 !p-0 !shadow-none">
            Sign In
          </Button>
        </p>
      </div>
    </div>
  );
};

export default SignupForm;
