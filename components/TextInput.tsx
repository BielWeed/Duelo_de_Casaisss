
import React from 'react';
import { PT_BR } from '../utils/translations';

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  ({ label, id, error, className, value, maxLength, ...props }, ref) => {
    const isAtMaxLength = value && maxLength && String(value).length >= maxLength;

    let inputBorderClasses = 'border-purple-500 focus:border-pink-500 focus:ring-pink-500';
    if (error) {
      inputBorderClasses = 'border-red-500 focus:border-red-500 focus:ring-red-500';
    } else if (isAtMaxLength) {
      inputBorderClasses = 'border-orange-400 focus:border-orange-500 focus:ring-orange-500';
    }

    return (
      <div className={`group mb-4 focus-within:ring-2 focus-within:ring-pink-400 focus-within:ring-opacity-60 rounded-lg p-0.5 ${className}`}>
        <label
          htmlFor={id}
          className={`block text-sm font-medium text-purple-200 mb-1 px-1
                      group-focus-within:text-pink-300
                      group-focus-within:-translate-y-1 group-focus-within:scale-90 origin-top-left
                      transition-all duration-200 ease-out`}
        >
          {label}
        </label>
        <input
          id={id}
          type="text"
          value={value}
          maxLength={maxLength}
          className={`block w-full px-3 py-2 bg-purple-800 bg-opacity-40 border rounded-md shadow-sm placeholder-purple-200 focus:outline-none sm:text-sm text-white ${inputBorderClasses}`}
          ref={ref}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-300 px-1">{error}</p>}
        {!error && isAtMaxLength && <p className="mt-1 text-xs text-orange-300 px-1">{PT_BR.maxLengthReached}</p>}
      </div>
    );
  }
);

TextInput.displayName = 'TextInput';

export default TextInput;