import { invoke } from "@tauri-apps/api/core";

async function retrieveCanvas(id) {
  try {
    const data = await invoke('retrieve_canvas_data', { id });
    
    // Return data directly without modifying the actions structure
    return {
      layers: data.layers,
      actions: data.actions || {}
    };
  } catch (error) {
    console.error('Failed to retrieve canvas data:', error);
    throw error;
  }
}

export default retrieveCanvas;