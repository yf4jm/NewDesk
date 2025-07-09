import React from 'react';
import ToggleInput from '../inputs/toggleInput'; // assuming you'll pass value/onChange props

const GeneralSettings = () => {
  const [APIkeys, setAPIkeys] = React.useState({
    gimini: '',
    openai: '',
    anthropic: ''
  });

  const handleChange = (key) => (e) => {
    setAPIkeys((prev) => ({ ...prev, [key]: e.target.value }));

  };

  return (
    <>
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold mb-4">General Settings</h1>
        <p className="mb-2">Manage your general settings below:</p>

        <div className=" p-4 rounded-lg">
          <div className="flex flex-col gap-4 text-base-content bg-base-200 p-4 rounded-lg">
            <h1 className="text-2xl font-semibold mb-4">API Keys</h1>
            <p className="mb-2">Manage your API keys below:</p>

            <div className="flex flex-col gap-4 mt-4">
              {Object.entries(APIkeys).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  <label htmlFor={`api-key-${key}`} className="font-medium capitalize">
                    {key} API Key:
                  </label>
                  <ToggleInput
                    id={`api-key-${key}`}
                    value={value}
                    onChange={handleChange(key)}
                  />
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default GeneralSettings;
