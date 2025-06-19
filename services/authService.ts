
import { type User, UserRole } from '../types';
import { userService } from './userService'; 
import { MOCK_TOKEN_EXPIRY_MS } from '../constants';

const LOCAL_STORAGE_KEY = 'chronoFeedAuthToken';

interface MockToken {
  user: User; 
  generatedAt: number;
}

export const authService = {
  login: async (username: string): Promise<User | null> => {
    await new Promise(resolve => setTimeout(resolve, 500)); 
    
    const user = userService.findUserByUsername(username);
    if (user) {
      const tokenData: MockToken = { 
        user: { ...user }, 
        generatedAt: Date.now() 
      };
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tokenData));
        return user; 
      } catch (e) {
        console.error("Failed to save token to localStorage", e);
        return null; 
      }
    }
    return null;
  },

  logout: (): void => {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (e) {
      console.error("Failed to remove token from localStorage", e);
    }
  },

  getCurrentUser: (): User | null => {
    try {
      const tokenJson = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!tokenJson) {
        return null;
      }
      const tokenData: MockToken = JSON.parse(tokenJson);
      
      if (Date.now() - tokenData.generatedAt > MOCK_TOKEN_EXPIRY_MS) {
        localStorage.removeItem(LOCAL_STORAGE_KEY); 
        return null;
      }

      if (!tokenData.user || !tokenData.user.id || !Object.values(UserRole).includes(tokenData.user.role)) {
         localStorage.removeItem(LOCAL_STORAGE_KEY); 
         return null;
      }
      
      const freshUser = userService.getUserById(tokenData.user.id);
      if (freshUser) {
        return freshUser; 
      } else {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        return null;
      }

    } catch (e) {
      console.error("Failed to retrieve or parse token from localStorage", e);
      try { localStorage.removeItem(LOCAL_STORAGE_KEY); } catch (removeError) {}
      return null;
    }
  },

  // --- Placeholder functions for new auth methods ---
  signUpWithEmailPassword: async (username: string, email: string, role: UserRole /*, password_plaintext: string */): Promise<User | null> => {
    console.log('[AuthService Placeholder] Attempting to sign up with Email/Password:', { username, email, role });
    alert(`Conceptual: Sign up with Email/Password for ${username}. Requires backend implementation.`);
    // Simulate creating a new user and adding to userService (for demo purposes only)
    // In a real app, this would be a backend call.
    // This mock won't persist if userService re-initializes from constants.
    // For a slightly better mock, one might add to userService IF it's not re-initialized on app load.
    // const newUser = userService.createUser(username, email, role, 'some-unique-id'); // userService would need this
    // if (newUser) return authService.login(username); // Auto-login after signup
    return null; 
  },

  loginWithPhoneNumber: async (phoneNumber: string): Promise<User | null> => {
    console.log('[AuthService Placeholder] Attempting to login with Phone Number:', phoneNumber);
    alert(`Conceptual: Login with Phone Number ${phoneNumber}. Requires backend and SMS OTP service.`);
    // Mock: Find if a user has this phone number (if User type included it)
    // const user = usersDB.find(u => u.phoneNumber === phoneNumber);
    // if (user) return authService.login(user.username);
    return null;
  },

  initiateGoogleLogin: (): void => {
    console.log('[AuthService Placeholder] Initiating Google Login flow.');
    alert('Conceptual: Initiate Google Login. Requires backend, Google Cloud project, and OAuth handling.');
    // In a real app, this would redirect to Google's OAuth consent screen.
  },
};
