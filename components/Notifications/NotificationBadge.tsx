import React from 'react';

interface NotificationBadgeProps {
  count: number;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ count }) => {
  if (count === 0) return null;

  return (
    <span 
      className="ml-1.5 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-red-50 bg-red-500 rounded-full animate-fade-in-fast"
      aria-label={`${count} unread notifications`}
      title={`${count} unread notifications`}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
};

// Add a simple fade-in animation to tailwind.config if desired, or use existing Tailwind animation utilities.
// For example, in index.html's tailwind.config:
// extend: {
//   animation: {
//     'fade-in-fast': 'fadeIn 0.2s ease-out',
//   },
//   keyframes: {
//     fadeIn: {
//       '0%': { opacity: 0 },
//       '100%': { opacity: 1 },
//     }
//   }
// }


export default NotificationBadge;
