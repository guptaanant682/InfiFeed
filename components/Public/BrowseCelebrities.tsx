import React, { useState, useEffect } from 'react';
import { type Celebrity, type PublicUser } from '../../types';
import { userService } from '../../services/userService';
import CelebrityCard from './CelebrityCard';
import Spinner from '../Common/Spinner';

interface BrowseCelebritiesProps {
  publicUser: PublicUser;
  onFollowToggle: (celebrityId: string) => Promise<void>;
}

const BrowseCelebrities: React.FC<BrowseCelebritiesProps> = ({ publicUser, onFollowToggle }) => {
  const [celebrities, setCelebrities] = useState<Celebrity[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCelebrities = async (): Promise<void> => {
      setIsLoading(true);
      const allCelebrities = await userService.getAllCelebrities();
      setCelebrities(allCelebrities);
      setIsLoading(false);
    };
    fetchCelebrities();
  }, []);

  if (isLoading) {
    return (
      <div className="text-center py-20">
        <Spinner size="lg" />
        <p className="text-gray-500 mt-4 text-lg">Discovering amazing stars...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-8 sm:mb-10">Discover Stars</h1>
      {celebrities.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-lg shadow p-8">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <p className="text-gray-500 text-lg">No celebrities available to follow at the moment. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {celebrities.map((celeb) => (
            <CelebrityCard
              key={celeb.id}
              celebrity={celeb}
              isFollowing={publicUser.following.includes(celeb.id)}
              onFollowToggle={onFollowToggle}
              currentUserId={publicUser.id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BrowseCelebrities;
