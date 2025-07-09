import { invoke } from "@tauri-apps/api/core";

export async function addExternalApp({ name, description, path }) {
  await invoke("add_external_app", { appInfo: { name, description, path } });
}
