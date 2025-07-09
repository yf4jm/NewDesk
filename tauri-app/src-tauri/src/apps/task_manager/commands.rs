use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};
#[derive(Serialize, Deserialize, Clone)]
pub struct Task {
    pub id: String,
    pub name: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct Column {
    pub id: String,
    pub name: String,
    pub color: Option<String>,
    pub sort_order: String,
    pub tasks: Vec<Task>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct Project {
    pub id: String,
    pub name: String,
    pub columns: Vec<Column>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct ProjectsData {
    pub projects: Vec<Project>,
}

fn get_data_path() -> PathBuf {
    let mut path = std::env::current_dir().unwrap();
    path.push("resources/data/projects.json");
    path
}

#[tauri::command]
pub fn save_projects_data(data: ProjectsData) -> Result<(), String> {
    let path = get_data_path();
    let json = serde_json::to_string_pretty(&data).map_err(|e| e.to_string())?;
    fs::create_dir_all(path.parent().unwrap()).map_err(|e| e.to_string())?;
    fs::write(path, json).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn load_projects_data() -> Result<ProjectsData, String> {
    let path = get_data_path();
    if !path.exists() {
        return Ok(ProjectsData { projects: vec![] });
    }
    let json = fs::read_to_string(path).map_err(|e| e.to_string())?;
    let data: ProjectsData = serde_json::from_str(&json).map_err(|e| e.to_string())?;
    Ok(data)
}
