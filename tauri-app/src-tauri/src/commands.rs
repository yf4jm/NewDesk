use regex::Regex;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::{Path, PathBuf};
use walkdir::WalkDir;

#[derive(Serialize, Deserialize)]
pub struct NewAppInfo {
    pub name: String,
    pub description: String,
    pub author: String,
    pub license: String,
}

#[derive(Serialize, Deserialize)]
pub struct ExternalAppInfo {
    pub name: String,
    pub description: String,
    pub path: String, // e.g. "/apps/my_new_app.bundle.js"
}

#[tauri::command]
pub async fn install_app(repo_url: String, app_name: String) -> Result<(), String> {
    let apps_dir = "../apps";

    if Path::new(&format!("{}/{}", apps_dir, app_name)).exists() {
        println!("App {} is already installed.", app_name);
        return Ok(()); // Already installed
    }

    let status = std::process::Command::new("git")
        .arg("clone")
        .arg(&repo_url)
        .arg(format!("{}/{}", apps_dir, app_name))
        .status()
        .map_err(|e| e.to_string())?;

    if status.success() {
        println!("App {} installed successfully.", app_name);
        Ok(())
    } else {
        Err("Git clone failed".to_string())
    }
}

#[tauri::command]
pub async fn get_apps_manifest() -> Result<String, String> {
    let apps_dir = "resources/data";
    let manifest_path = format!("{}/apps_manifest.json", apps_dir);

    if !Path::new(&manifest_path).exists() {
        return Err("Manifest file does not exist".to_string());
    }

    let manifest_content = fs::read_to_string(manifest_path).map_err(|e| e.to_string())?;

    Ok(manifest_content)
}

#[tauri::command]
pub async fn get_app_component_path(app_name: &str) -> Result<(), String> {
    let project_dir = "src";
    let mut component_imports = HashMap::new();

    // Step 1: Walk and find potential entry files
    for entry in WalkDir::new(project_dir)
        .into_iter()
        .filter_map(Result::ok)
        .filter(|e| {
            e.path().is_file()
                && e.path().extension().map_or(false, |ext| {
                    ext == "js" || ext == "jsx" || ext == "ts" || ext == "tsx"
                })
        })
    {
        let path = entry.path();
        if let Ok(content) = fs::read_to_string(path) {
            if content.contains("ReactDOM.render") || content.contains("createRoot(") {
                println!("[Entry Point Found] → {}", path.display());
                let render_component_re = Regex::new(r"<([A-Z][A-Za-z0-9_]*)\s*/?>").unwrap();

                let mut found_components = vec![];
                for cap in render_component_re.captures_iter(&content) {
                    found_components.push(cap[1].to_string());
                }

                // Try to get the last one inside render()
                if !found_components.is_empty() {
                    let root_component = found_components.last().unwrap();
                    println!("→ Root component: `{}`", root_component);

                    let import_re = Regex::new(&format!(
                        r#"import\s+{0}\s+from\s+['"](.+)['"]"#,
                        root_component
                    ))
                    .unwrap();

                    if let Some(cap2) = import_re.captures(&content) {
                        let import_path = cap2[1].to_string();
                        component_imports.insert(root_component.to_string(), import_path);
                    }
                }
            }
        }
    }

    // Step 2: Locate the component file
    for (component, rel_path) in component_imports {
        let candidate_paths = vec![
            format!("{}/{}.jsx", project_dir, rel_path),
            format!("{}/{}.js", project_dir, rel_path),
            format!("{}/{}.tsx", project_dir, rel_path),
            format!("{}/{}.ts", project_dir, rel_path),
            format!("{}/index.jsx", format!("{}/{}", project_dir, rel_path)),
            format!("{}/index.js", format!("{}/{}", project_dir, rel_path)),
        ];

        for path in candidate_paths {
            if Path::new(&path).exists() {
                println!(
                    "✅ Main component `{}` is in: {}",
                    component,
                    path.replace("/./", "/")
                );
                return Ok(());
            }
        }
    }

    println!("⚠️ Could not identify main component file.");
    Err("Could not identify main component file.".to_string())
}

#[tauri::command]
pub async fn add_app_from_template(app_info: NewAppInfo) -> Result<(), String> {
    let template_dir = Path::new("templates/default");
    let apps_dir = Path::new("apps");
    let new_app_dir = apps_dir.join(&app_info.name);

    // 1. Copy template to new app directory
    if new_app_dir.exists() {
        return Err("App already exists".to_string());
    }
    fs::create_dir_all(&new_app_dir).map_err(|e| e.to_string())?;
    for entry in fs::read_dir(template_dir).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        let dest = new_app_dir.join(entry.file_name());
        if entry.path().is_file() {
            fs::copy(entry.path(), &dest).map_err(|e| e.to_string())?;
        } else if entry.path().is_dir() {
            // Recursively copy directories if needed
            fs_extra::dir::copy(
                entry.path(),
                &new_app_dir,
                &fs_extra::dir::CopyOptions::new().content_only(true),
            )
            .map_err(|e| e.to_string())?;
        }
    }

    // 2. Update apps_manifest.json
    let manifest_path = Path::new("resources/data/apps_manifest.json");
    let mut manifest: serde_json::Value = if manifest_path.exists() {
        let content = fs::read_to_string(&manifest_path).map_err(|e| e.to_string())?;
        serde_json::from_str(&content).map_err(|e| e.to_string())?
    } else {
        serde_json::json!({ "apps": [] })
    };

    let app_entry = serde_json::json!({
        "name": app_info.name,
        "version": "1.0.0",
        "description": app_info.description,
        "author": app_info.author,
        "license": app_info.license,
        "path": format!("./apps/{}/app.jsx", app_info.name)
    });

    manifest["apps"].as_array_mut().unwrap().push(app_entry);

    fs::write(
        &manifest_path,
        serde_json::to_string_pretty(&manifest).unwrap(),
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn add_external_app(app_info: ExternalAppInfo) -> Result<(), String> {
    let manifest_path = Path::new("resources/data/apps_manifest.json");
    let mut manifest: serde_json::Value = if manifest_path.exists() {
        let content = fs::read_to_string(&manifest_path).map_err(|e| e.to_string())?;
        serde_json::from_str(&content).map_err(|e| e.to_string())?
    } else {
        serde_json::json!({ "apps": [] })
    };

    let app_entry = serde_json::json!({
        "name": app_info.name,
        "type": "external",
        "description": app_info.description,
        "path": app_info.path
    });

    manifest["apps"].as_array_mut().unwrap().push(app_entry);

    fs::write(
        &manifest_path,
        serde_json::to_string_pretty(&manifest).unwrap(),
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}
