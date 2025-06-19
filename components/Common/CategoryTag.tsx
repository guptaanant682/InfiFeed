
import React from 'react';
import { PostCategory } from '../../types';

interface CategoryTagProps {
  category: PostCategory;
  className?: string;
  size?: 'sm' | 'xs';
}

const CategoryTag: React.FC<CategoryTagProps> = ({ category, className = '', size = 'xs' }) => {
  let bgColor = 'bg-gray-200';
  let textColor = 'text-gray-700';

  switch (category) {
    case PostCategory.MUSIC:
      bgColor = 'bg-purple-100'; textColor = 'text-purple-700'; break;
    case PostCategory.SPORTS:
      bgColor = 'bg-blue-100'; textColor = 'text-blue-700'; break;
    case PostCategory.LIFESTYLE:
      bgColor = 'bg-pink-100'; textColor = 'text-pink-700'; break;
    case PostCategory.TECH:
      bgColor = 'bg-indigo-100'; textColor = 'text-indigo-700'; break;
    case PostCategory.FOOD:
      bgColor = 'bg-yellow-100'; textColor = 'text-yellow-700'; break;
    case PostCategory.ART:
      bgColor = 'bg-red-100'; textColor = 'text-red-700'; break;
    case PostCategory.TRAVEL:
      bgColor = 'bg-green-100'; textColor = 'text-green-700'; break;
    case PostCategory.GENERAL:
    default:
      bgColor = 'bg-gray-100'; textColor = 'text-gray-600'; break;
  }
  
  const sizeStyles = {
    sm: 'px-2.5 py-1 text-sm rounded-md',
    xs: 'px-2 py-0.5 text-xs rounded',
  }

  return (
    <span 
      className={`inline-block font-medium ${sizeStyles[size]} ${bgColor} ${textColor} ${className}`}
    >
      {category}
    </span>
  );
};

export default CategoryTag;
