import React from 'react';

interface ShellProps {
  children: React.ReactNode;
  className?: string;
}

const Shell: React.FC<ShellProps> = ({ children, className = '' }) => {
  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {children}
    </div>
  );
};

export default Shell;
