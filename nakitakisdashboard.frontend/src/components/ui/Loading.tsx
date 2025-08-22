import React from 'react';

interface LoadingProps {
  type?: 'spinner' | 'dots' | 'pulse' | 'bars';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

const Loading: React.FC<LoadingProps> = ({
  type = 'spinner',
  size = 'md',
  text,
  fullScreen = false,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  const renderSpinner = () => (
    <div className={`loading-spinner ${sizeClasses[size]}`}></div>
  );

  const renderDots = () => (
    <div className="loading-dots">
      <div></div>
      <div></div>
      <div></div>
    </div>
  );

  const renderPulse = () => (
    <div className={`${sizeClasses[size]} bg-primary-600 rounded-full animate-pulse-slow`}></div>
  );

  const renderBars = () => (
    <div className="flex space-x-1">
      {[0, 1, 2, 3].map((i) => (
        <div 
          key={i}
          className="w-1 bg-primary-600 rounded-full animate-bounce"
          style={{
            height: size === 'sm' ? '16px' : size === 'md' ? '24px' : size === 'lg' ? '32px' : '40px',
            animationDelay: `${i * 0.1}s`
          }}
        ></div>
      ))}
    </div>
  );

  const renderLoadingIcon = () => {
    switch (type) {
      case 'dots': return renderDots();
      case 'pulse': return renderPulse();
      case 'bars': return renderBars();
      default: return renderSpinner();
    }
  };

  const content = (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      {renderLoadingIcon()}
      {text && (
        <p className={`text-gray-600 dark:text-gray-400 font-medium ${textSizeClasses[size]}`}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
};

// Specialized loading components
export const LoadingSpinner: React.FC<Omit<LoadingProps, 'type'>> = (props) => (
  <Loading {...props} type="spinner" />
);

export const LoadingDots: React.FC<Omit<LoadingProps, 'type'>> = (props) => (
  <Loading {...props} type="dots" />
);

export const LoadingBars: React.FC<Omit<LoadingProps, 'type'>> = (props) => (
  <Loading {...props} type="bars" />
);

export const LoadingPulse: React.FC<Omit<LoadingProps, 'type'>> = (props) => (
  <Loading {...props} type="pulse" />
);

// Full screen loading overlay
export const LoadingOverlay: React.FC<{ text?: string }> = ({ text = "Yükleniyor..." }) => (
  <Loading fullScreen text={text} size="lg" />
);

// Inline loading for buttons
export const ButtonLoading: React.FC = () => (
  <LoadingSpinner size="sm" className="inline-flex" />
);

export default Loading;