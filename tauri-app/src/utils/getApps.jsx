import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
const getApps = async () => {
    const response = await invoke("get_apps_manifest");
    let parsed; 
    try {
      parsed = JSON.parse(response);
    } catch (e) {
      parsed = [];
      console.error("Failed to parse apps manifest:", e, response);
    }
    return parsed || [];
    // console.log("Apps Manifest: ", parsed);
  }
    export default getApps;