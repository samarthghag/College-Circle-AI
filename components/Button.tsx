
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className, ...props }) => {
  const baseStyles = "px-6 py-3 rounded-md font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all duration-150 ease-in-out";
  
  const primaryStyles = "bg-amber-500 text-slate-900 hover:bg-amber-600 focus:ring-amber-400 disabled:bg-amber-700/50 disabled:text-slate-400 disabled:cursor-not-allowed";
  const secondaryStyles = "bg-slate-600 text-slate-100 hover:bg-slate-500 focus:ring-slate-400 disabled:bg-slate-700/50 disabled:text-slate-400 disabled:cursor-not-allowed";

  const styles = variant === 'primary' ? primaryStyles : secondaryStyles;

  return (
    <button
      className={`${baseStyles} ${styles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
