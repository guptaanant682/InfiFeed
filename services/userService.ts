
import { type User, type Celebrity, type PublicUser, UserRole } from '../types';

let usersDB: User[] = [];

export const userService = {
  initializeUsers: (initialUsers: User[]): void => {
    usersDB = [...initialUsers];
  },

  getAllUsers: async (): Promise<User[]> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return [...usersDB];
  },

  getUserById: (userId: string): User | Celebrity | PublicUser | undefined => {
    // No async needed for this mock, but in real app it would be
    return usersDB.find(user => user.id === userId);
  },

  findUserByUsername: (username: string): User | undefined => {
    return usersDB.find(user => user.username.toLowerCase() === username.toLowerCase());
  },
  
  getAllCelebrities: async (): Promise<Celebrity[]> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return usersDB.filter(user => user.role === UserRole.CELEBRITY) as Celebrity[];
  },

  toggleFollowCelebrity: async (publicUserId: string, celebrityIdToToggle: string): Promise<PublicUser | null> => {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay

    const publicUser = usersDB.find(u => u.id === publicUserId && u.role === UserRole.PUBLIC) as PublicUser | undefined;
    const celebrity = usersDB.find(u => u.id === celebrityIdToToggle && u.role === UserRole.CELEBRITY) as Celebrity | undefined;

    if (!publicUser || !celebrity) {
      console.error("User or Celebrity not found for follow toggle.");
      return null;
    }

    const isCurrentlyFollowing = publicUser.following.includes(celebrityIdToToggle);

    if (isCurrentlyFollowing) {
      // Unfollow
      publicUser.following = publicUser.following.filter(id => id !== celebrityIdToToggle);
      celebrity.followers = celebrity.followers.filter(id => id !== publicUserId);
    } else {
      // Follow
      publicUser.following.push(celebrityIdToToggle);
      if (!celebrity.followers.includes(publicUserId)) { // Ensure no duplicates
         celebrity.followers.push(publicUserId);
      }
    }
    
    // Update in DB (in-memory)
    usersDB = usersDB.map(u => {
      if (u.id === publicUserId) return publicUser;
      if (u.id === celebrityIdToToggle) return celebrity;
      return u;
    });
    
    return { ...publicUser }; // Return a copy of the updated user
  },
};
    