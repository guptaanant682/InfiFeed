
import React, { useState, useRef, useCallback } from 'react';
import Button from '../Common/Button';
import { TYPING_INDICATOR_TIMEOUT } from '../../constants';

interface AddCommentFormProps {
  onSubmit: (content: string) => Promise<void>;
  onTyping: (isTyping: boolean) => void;
}

const AddCommentForm: React.FC<AddCommentFormProps> = ({ onSubmit, onTyping }) => {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const typingTimeoutRef = useRef<number | null>(null);

  const handleTyping = useCallback(() => {
    onTyping(true);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = window.setTimeout(() => {
      onTyping(false);
    }, TYPING_INDICATOR_TIMEOUT);
  }, [onTyping]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!content.trim()) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    onTyping(false); 
    setIsLoading(true);

    try {
      await onSubmit(content);
      setContent(''); 
    } catch (error) {
      console.error("Error submitting comment from form:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    if (e.target.value.trim() !== '') {
        handleTyping();
    } else {
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        onTyping(false);
    }
     // Auto-resize textarea
    const target = e.target as HTMLTextAreaElement;
    target.style.height = 'auto';
    target.style.height = `${Math.min(target.scrollHeight, 120)}px`; // Max height ~5 lines
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-start space-x-2 my-2 py-2 border-t border-b border-gray-100">
      <textarea
        value={content}
        onChange={handleInputChange}
        placeholder="Add a comment..."
        rows={1}
        className="flex-grow p-2 text-sm border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-primary-500 focus:border-primary-500 resize-none transition-all duration-150 overflow-y-auto"
        style={{minHeight: '40px'}} // Minimum height for one line
        disabled={isLoading}
        required
        aria-label="Add a comment"
      />
      <Button 
        type="submit" 
        size="sm"
        isLoading={isLoading} 
        disabled={isLoading || !content.trim()}
        className="h-full self-end py-[9px]" 
      >
        Post
      </Button>
    </form>
  );
};

export default AddCommentForm;
