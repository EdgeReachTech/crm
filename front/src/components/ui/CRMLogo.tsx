import React from 'react';

interface CRMLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export const CRMLogo: React.FC<CRMLogoProps> = ({ 
  size = 'md', 
  showText = true,
  className = ''
}) => {
  const sizes = {
    sm: {
      container: 'w-12 h-12',
      icon: 'w-6 h-6',
      title: 'text-xl',
      subtitle: 'text-sm'
    },
    md: {
      container: 'w-16 h-16',
      icon: 'w-8 h-8',
      title: 'text-2xl',
      subtitle: 'text-base'
    },
    lg: {
      container: 'w-20 h-20',
      icon: 'w-10 h-10',
      title: 'text-3xl',
      subtitle: 'text-lg'
    }
  };

  const currentSize = sizes[size];

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className={`inline-flex items-center justify-center ${currentSize.container} bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl shadow-lg mb-4`}>
        {/* Custom CRM Dashboard SVG Icon */}
        <svg 
          className={`${currentSize.icon} text-white`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          {/* Dashboard Frame */}
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" 
          />
          
          {/* Dashboard Columns */}
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M8 21l0-12" 
          />
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M16 21l0-12" 
          />
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M12 21l0-12" 
          />
          
          {/* Header Row */}
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M3 10h18" 
          />
          
          {/* Data Points */}
          <circle cx="6" cy="6" r="1" fill="currentColor" />
          <circle cx="9" cy="6" r="1" fill="currentColor" />
          <circle cx="12" cy="6" r="1" fill="currentColor" />
        </svg>
      </div>
      
      {showText && (
        <div className="text-center">
          <h1 className={`font-bold text-neutral-900 dark:text-neutral-100 mb-1 ${currentSize.title}`}>
            CRM Pro
          </h1>
          <p className={`text-neutral-600 dark:text-neutral-400 ${currentSize.subtitle}`}>
            Customer Relationship Management
          </p>
        </div>
      )}
    </div>
  );
};

// Additional CRM-related icons
export const CRMIcons = {
  // Success with checkmark and user
  UserSuccess: ({ className = "w-8 h-8" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
    </svg>
  ),

  // Pending approval with star and checkmark
  PendingApproval: ({ className = "w-8 h-8" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
    </svg>
  ),

  // Dashboard analytics
  Analytics: ({ className = "w-8 h-8" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),

  // Contact management
  Contacts: ({ className = "w-8 h-8" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
    </svg>
  ),

  // Sales pipeline
  Pipeline: ({ className = "w-8 h-8" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      <circle cx="12" cy="12" r="2" fill="currentColor" opacity="0.3" />
      <circle cx="6" cy="18" r="2" fill="currentColor" opacity="0.5" />
      <circle cx="21" cy="7" r="2" fill="currentColor" opacity="0.7" />
    </svg>
  )
};

export default CRMLogo;