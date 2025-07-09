import React from 'react'
import { getCurrentWindow } from "@tauri-apps/api/window";
import notificationAccessCheck from "../../permissions/notificationCheck";
import {sendNotification} from "@tauri-apps/plugin-notification";
const TitleBar = () => {
  return (
    <div data-tauri-drag-region className="bg-primary top-0 right-0 left-0 fixed h-8 flex flex-row justify-between items-center overflow-hidden">
    <div className='flex flex-row justify-center items-center gap-2 px-2'>
      <img src="https://api.iconify.design/mdi:desktop-classic.svg" alt="icon" />
      <span>Desktop App</span>
    </div>
    <div className='flex flex-row top-0 justify-end gap-2 px-2'>
    <div  id="titlebar-minimize"
    onClick={() => {
      getCurrentWindow().minimize();
    }}>
      <img
        src="https://api.iconify.design/mdi:window-minimize.svg"
        alt="minimize"
      />
    </div>
    <div
    onClick={() => {
      getCurrentWindow().toggleMaximize();
    }
    }>
      <img
        src="https://api.iconify.design/mdi:window-maximize.svg"
        alt="maximize"
      />
    </div>
    <div
    onClick={() => {
      getCurrentWindow().hide();
      if (notificationAccessCheck()) {
        sendNotification({ title: 'Desktop App', body: 'The app is still running in the background.' });          
    }}}>
      <img src="https://api.iconify.design/mdi:close.svg" alt="close" />
    </div>
    </div>
  </div>
  )
}

export default TitleBar