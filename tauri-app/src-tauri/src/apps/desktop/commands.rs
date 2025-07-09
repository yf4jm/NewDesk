use std::collections::HashMap;
use std::fs::{File, create_dir_all};
use std::io::{Read, Write};
use std::path::Path;
use serde::{Deserialize, Serialize};
use tauri::State;

#[derive(Serialize, Deserialize, Debug)]
pub struct TileAction { // Make TileAction public
    pub action: String,
    pub option: String,
    pub fields: HashMap<String, String>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct CanvasData { // Make CanvasData public
    pub id: String,
    pub layers: Vec<HashMap<String, Vec<u32>>>,
    pub actions: HashMap<String, Vec<TileAction>>, // Key is tile position (e.g., "x-y")
}

#[derive(Default)]
pub struct CanvasStorage { // Make CanvasStorage public
    pub storage_path: String,
}

impl CanvasStorage {
    pub fn new(storage_path: &str) -> Self { // Make new() public
        Self {
            storage_path: storage_path.to_string(),
        }
    }

    pub fn save_canvas_data(&self, data: CanvasData) -> Result<(), String> { // Make save_canvas_data public
        let storage_dir = Path::new(&self.storage_path);
        if !storage_dir.exists() {
            create_dir_all(storage_dir).map_err(|e| format!("Failed to create storage directory: {}", e))?;
        }

        let file_path = storage_dir.join(format!("{}.json", data.id));
        let serialized_data = serde_json::to_string(&data).map_err(|e| format!("Failed to serialize data: {}", e))?;
        let mut file = File::create(&file_path).map_err(|e| format!("Failed to create file: {}", e))?;
        file.write_all(serialized_data.as_bytes()).map_err(|e| format!("Failed to write data to file: {}", e))?;
        // Optionally, you can also log the saved data
        
        Ok(())
    }

    pub fn retrieve_canvas_data(&self, id: &str) -> Result<CanvasData, String> { // Make retrieve_canvas_data public
        let file_path = Path::new(&self.storage_path).join(format!("{}.json", id));
        let mut file = File::open(&file_path).map_err(|e| format!("Failed to open file: {}", e))?;
        let mut contents = String::new();
        file.read_to_string(&mut contents).map_err(|e| format!("Failed to read file: {}", e))?;
        let data: CanvasData = serde_json::from_str(&contents).map_err(|e| format!("Failed to deserialize data: {}", e))?;
        Ok(data)
    }
}

#[tauri::command]
pub fn save_canvas_data(state: State<CanvasStorage>, id: String, layers: Vec<HashMap<String, Vec<u32>>>, actions: HashMap<String, Vec<TileAction>>) -> Result<(), String> {
    let canvas_data = CanvasData { id, layers, actions };
    state.save_canvas_data(canvas_data)
}

#[tauri::command]
pub fn retrieve_canvas_data(state: State<CanvasStorage>, id: String) -> Result<CanvasData, String> {
    state.retrieve_canvas_data(&id)
}