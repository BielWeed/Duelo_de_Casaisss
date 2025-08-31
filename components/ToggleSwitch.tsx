import React from 'react';

interface ToggleSwitchProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ id, checked, onChange, label }) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.checked);
  };

  return (
    <div className="flex items-center justify-between mb-4">
      <span className="text-sm font-medium text-purple-200">{label}</span>
      <label htmlFor={id} className="inline-flex relative items-center cursor-pointer">
        <input
          type="checkbox"
          id={id}
          className="sr-only peer"
          checked={checked}
          onChange={handleChange}
        />
        <div className="w-11 h-6 bg-purple-700 bg-opacity-60 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
      </label>
    </div>
  );
};

export default ToggleSwitch;