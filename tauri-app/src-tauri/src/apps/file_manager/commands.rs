use serde::Serialize;
use std::fs;
use std::path::PathBuf;

#[derive(Serialize)]
pub struct FileEntry {
    pub name: String,
    pub is_dir: bool,
}

#[tauri::command]
pub fn read_dir(path: String) -> Result<Vec<FileEntry>, String> {
    let path_buf = PathBuf::from(path);
    if !path_buf.exists() || !path_buf.is_dir() {
        return Err("Path does not exist or is not a directory".into());
    }

    let mut entries = Vec::new();

    for entry in fs::read_dir(path_buf).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        let metadata = entry.metadata().map_err(|e| e.to_string())?;

        entries.push(FileEntry {
            name: entry.file_name().to_string_lossy().to_string(),
            is_dir: metadata.is_dir(),
        });
    }

    Ok(entries)
}
#[tauri::command]
pub fn list_drives() -> Result<Vec<String>, String> {
    #[cfg(target_os = "windows")]
    {
        use winapi::um::fileapi::GetLogicalDriveStringsW;

        let mut buffer: [u16; 256] = [0; 256];
        let len = unsafe { GetLogicalDriveStringsW(buffer.len() as u32, buffer.as_mut_ptr()) };

        if len == 0 {
            return Err("Failed to get drives".into());
        }

        let drives = buffer[..len as usize]
            .split(|&c| c == 0)
            .filter_map(|slice| {
                if slice.is_empty() {
                    None
                } else {
                    Some(String::from_utf16_lossy(slice))
                }
            })
            .collect();

        Ok(drives)
    }

    #[cfg(not(target_os = "windows"))]
    {
        Ok(vec!["/".to_string()])
    }
}
