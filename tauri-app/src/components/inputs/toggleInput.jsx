import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const TogglePasswordInput = ({ value, onChange }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full max-w-2xl relative">
      <input
        type={showPassword ? 'text' : 'password'}
        placeholder="Enter your API key"
        className="w-full px-4 py-2 pr-10 border border-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        value={value}
        onChange={onChange}
      />
      <button
        type="button"
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 flex items-center justify-center rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={() => setShowPassword((prev) => !prev)}
        tabIndex={-1}
      >
        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </div>
  );
};

export default TogglePasswordInput;
