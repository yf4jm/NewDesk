import {
    isPermissionGranted,
    requestPermission,
    
  } from '@tauri-apps/plugin-notification';
  // when using `"withGlobalTauri": true`, you may use
  // const { isPermissionGranted, requestPermission, sendNotification, } = window.__TAURI__.notification;
  
  const notificationAccessCheck = async () => {
    // Check if the user has granted permission to send notifications
    let permissionGranted = await isPermissionGranted();
    
    // If not, we need to request it
    if (!permissionGranted) {
      const permission = await requestPermission();
      permissionGranted = permission === 'granted';
    }
    
    return permissionGranted;
  };

  export default notificationAccessCheck;
