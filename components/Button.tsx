import React from 'react';
import { playSound } from '../utils/soundManager';
import { SOUND_FILES } from '../constants';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  noSound?: boolean; // Option to disable sound for specific buttons
}

const Button: React.FC<ButtonProps> = ({ children, className, variant = 'primary', size = 'md', onClick, noSound = false, ...props }) => {
  const baseStyles = 'font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-75 transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 active:brightness-90 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] shadow-md hover:shadow-lg';
  
  let variantStyles = '';
  switch (variant) {
    case 'primary':
      variantStyles = 'bg-pink-500 hover:bg-pink-600 text-white focus:ring-pink-400 hover:shadow-pink-500/30';
      break;
    case 'secondary':
      variantStyles = 'bg-purple-500 hover:bg-purple-600 text-white focus:ring-purple-400 hover:shadow-purple-500/30';
      break;
    case 'danger':
      variantStyles = 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-400 hover:shadow-red-500/30';
      break;
  }

  let sizeStyles = '';
  switch (size) {
    case 'sm':
      sizeStyles = 'px-3 py-1.5 text-sm';
      break;
    case 'md':
      sizeStyles = 'px-4 py-2 text-base';
      break;
    case 'lg':
      sizeStyles = 'px-6 py-3 text-lg';
      break;
  }

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!noSound) {
      playSound('CLICK');
    }
    if (onClick) {
      onClick(event);
    }
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;