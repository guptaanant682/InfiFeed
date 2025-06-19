
import React, { useState } from 'react';
import Button from '../Common/Button';
import { POST_CATEGORIES } from '../../constants';
import { PostCategory } from '../../types';

interface PostFormProps {
  onCreatePost: (content: string, imageUrls?: string[], category?: PostCategory) => Promise<void>;
}

const PostForm: React.FC<PostFormProps> = ({ onCreatePost }) => {
  const [content, setContent] = useState<string>('');
  const [imageUrlsInput, setImageUrlsInput] = useState<string>(''); // Comma-separated
  const [category, setCategory] = useState<PostCategory>(PostCategory.GENERAL);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');
    if (!content.trim()) {
      setError('Post content cannot be empty.');
      return;
    }

    const urls = imageUrlsInput.split(',')
      .map(url => url.trim())
      .filter(url => url !== '');

    if (urls.some(url => !url.match(/^https?:\/\/.+/))) {
        setError('One or more image URLs are invalid. Please use full URLs (e.g., http://example.com/image.png) separated by commas.');
        return;
    }

    setIsLoading(true);
    try {
      await onCreatePost(content, urls.length > 0 ? urls : undefined, category);
      setContent('');
      setImageUrlsInput('');
      setCategory(PostCategory.GENERAL);
    } catch (err) {
      setError('Failed to create post. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg mb-8">
      <h3 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-3">Create New Post</h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="postContent" className="block text-sm font-medium text-gray-700 mb-1">
            What's on your mind?
          </label>
          <textarea
            id="postContent"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition duration-150"
            placeholder="Share your thoughts, news, or updates..."
            required
            disabled={isLoading}
            aria-required="true"
          />
        </div>
        <div>
          <label htmlFor="imageUrls" className="block text-sm font-medium text-gray-700 mb-1">
            Image URLs (Optional, comma-separated)
          </label>
          <input
            type="text" // Changed from 'url' to 'text' for comma-separated list
            id="imageUrls"
            value={imageUrlsInput}
            onChange={(e) => setImageUrlsInput(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition duration-150"
            placeholder="https://example.com/image1.jpg, https://example.com/image2.png"
            disabled={isLoading}
          />
           <p className="mt-2 text-xs text-gray-500">
            Tip: Use services like <code className="bg-gray-100 p-0.5 rounded text-gray-700">picsum.photos</code> for placeholder images. Separate multiple URLs with a comma.
          </p>
        </div>
        <div>
          <label htmlFor="postCategory" className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            id="postCategory"
            value={category}
            onChange={(e) => setCategory(e.target.value as PostCategory)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md shadow-sm transition duration-150"
            disabled={isLoading}
          >
            {POST_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
        <div className="flex justify-end">
          <Button type="submit" isLoading={isLoading} disabled={isLoading || !content.trim()} size="lg">
            {isLoading ? 'Posting...' : 'Create Post'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PostForm;
