import { getCurrentWindow } from '@tauri-apps/api/window';
import { WebviewWindow } from '@tauri-apps/api/webviewWindow'

async function openApp(label, url, options = {}) {
  try {
    const defaultOptions = {
      url,
      title: label,
      width: window.screen.availWidth,
      height: window.screen.availHeight,
      center: true,
      resizable: true,
      fullscreen: false,
      maximizable: true,
    };

    // Merge default options with provided options
    const windowOptions = {
      ...defaultOptions,
      ...options,
    };

    const win = new WebviewWindow(label, windowOptions);

    const iconPath = 'C:/Users/yf4jm/Documents/GitHub/tauri-app/tauri-app/public/fm-icon.png'; // Path to your icon file

    // Set icon after creation
    win.once('tauri://created', async () => {
      try {
        // Method 1: Using app resources (recommended)
        console.log(iconPath);
        
        await win.setIcon(iconPath);
        
        console.log(`Window "${label}" created with icon`);
      } catch (iconError) {
        console.error('Error setting icon:', iconError);
      }
    });

    win.once('tauri://error', (e) => {
      console.error(`Window "${label}" creation failed:`, e);
    });

  } catch (error) {
    console.error('Error creating window:', error);
  }
}

export default openApp;