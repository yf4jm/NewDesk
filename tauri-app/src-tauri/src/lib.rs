// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
mod apps;
mod commands;
use tauri::menu::{MenuBuilder};
use tauri::tray::TrayIconBuilder;
use tauri::Manager;
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_notification::init())
        .setup(|app| {
            let menu = MenuBuilder::new(app)
                .text("open", "Open")
                .text("quit", "Quit")
                .build()?;
            let tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .show_menu_on_left_click(true)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "quit" => {
                        println!("quit menu item was clicked");
                        app.exit(0);
                    }
                    "open" => {
                        println!("open menu item was clicked");
                        if let Some(window) = app.get_webview_window("main") {
                            window.show().unwrap();
                            window.set_focus().unwrap();
                        }
                    }
                    _ => {
                        println!("menu item {:?} not handled", event.id);
                    }
                })
                .build(app);

            Ok(())
        })
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            commands::install_app,
            commands::get_apps_manifest,
            commands::get_app_component_path,
            apps::file_manager::commands::read_dir,
            apps::file_manager::commands::list_drives,
            apps::task_manager::commands::save_projects_data,
            apps::task_manager::commands::load_projects_data,
            apps::desktop::commands::save_canvas_data,
            apps::desktop::commands::retrieve_canvas_data,
            // Add more as needed
        ])
        .manage(apps::desktop::commands::CanvasStorage::new("resources\\data\\desktop_data"))
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
