import { invoke } from "@tauri-apps/api/core";

async function saveCanvas(id, layers, actions) {
  try {
    // Convert actions to the format expected by the backend
    const formattedActions = {};
    
    // Handle both single action and array of actions
    for (const [key, value] of Object.entries(actions)) {
      // Skip if value is null or undefined
      if (!value) continue;
      
      // Ensure value is always an array
      const actionArray = Array.isArray(value) ? value : [value];
      
      // Filter out any invalid actions and format the valid ones
      formattedActions[key] = actionArray
        .filter(action => action && action.action && action.fields) // Only include valid actions
        .map(action => ({
          action: action.action,
          option: action.option || '',
          fields: Object.entries(action.fields || {}).reduce((acc, [k, v]) => {
            acc[k] = String(v); // Convert all field values to strings
            return acc;
          }, {})
        }));
        
      // If no valid actions remain, delete the key
      if (formattedActions[key].length === 0) {
        delete formattedActions[key];
      }
    }

    await invoke('save_canvas_data', { 
      id, 
      layers,
      actions: formattedActions
    });
    
    console.log('Canvas data saved successfully');
  } catch (error) {
    console.error('Failed to save canvas data:', error);
    throw error;
  }
}

export default saveCanvas;