
import React from 'react';
import { type User } from '../../types';

interface UserSearchDropdownProps {
  results: User[];
  onItemClick: (userId: string) => void;
}

const UserSearchDropdown: React.FC<UserSearchDropdownProps> = ({ results, onItemClick }) => {
  if (results.length === 0) {
    return null;
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
      <ul>
        {results.map(user => (
          <li
            key={user.id}
            onClick={() => onItemClick(user.id)}
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-3 text-sm"
          >
            <img 
              src={user.profilePictureUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=random&size=32`}
              alt={user.username}
              className="w-8 h-8 rounded-full object-cover"
            />
            <span>{user.username}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserSearchDropdown;
