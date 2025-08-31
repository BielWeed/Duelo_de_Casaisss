
import React from 'react';

interface SelectInputProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: { value: string; label: string }[];
}

const SelectInput: React.FC<SelectInputProps> = ({ label, id, error, options, className, ...props }) => {
  return (
    <div className={`group mb-4 ${className}`}>
      <label
        htmlFor={id}
        className={`block text-sm font-medium text-purple-200 mb-1
                    group-focus-within:text-pink-300
                    group-focus-within:-translate-y-1 group-focus-within:scale-90 origin-top-left
                    transition-all duration-200 ease-out`}
      >
        {label}
      </label>
      <select
        id={id}
        className={`mt-1 block w-full pl-3 pr-10 py-2 text-base bg-purple-800 bg-opacity-40 border-purple-500 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm rounded-md text-white appearance-none ${error ? 'border-red-500' : ''}`}
        {...props}
      >
        {options.map(option => (
          <option key={option.value} value={option.value} className="text-white bg-purple-700 hover:bg-pink-500">
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-300">{error}</p>}
    </div>
  );
};

export default SelectInput;