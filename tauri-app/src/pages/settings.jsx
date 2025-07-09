import React, { useState } from 'react';
import BackButton from '../components/backButton';

import GeneralSettings from '../components/settings/generalSettings';
import DisplaySettings from '../components/settings/displaySettings';
const SettingsPage = () => {
  const [pageContent, setPageContent] = useState(<GeneralSettings />);

  return (
    <>
      <BackButton />
      <div className="flex h-screen">
        {/* Sidebar */}
        <nav className="w-48 border-r border-gray-300 p-4">
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => setPageContent(<GeneralSettings />)}
                className="w-full text-left px-2 py-1 rounded hover:bg-gray-100"
              >
                Settings
              </button>
            </li>
            <li>
              <button
                onClick={() => setPageContent(<DisplaySettings />)}
                className="w-full text-left px-2 py-1 rounded hover:bg-gray-100"
              >
                Display
              </button>
            </li>
            <li>
              <button
                onClick={() => setPageContent('Notifications')}
                className="w-full text-left px-2 py-1 rounded hover:bg-gray-100"
              >
                Notifications
              </button>
            </li>
          </ul>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <h1 className="text-2xl font-semibold">{pageContent}</h1>
        </main>
      </div>
    </>
  );
};

export default SettingsPage;
