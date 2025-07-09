import { invoke } from "@tauri-apps/api/core"

const installApp = (repo_url, app_name) => {
    console.log("repo_url: {}", repo_url);
    console.log("app_name: {}", app_name);
  return invoke("install_app", { "repoUrl":repo_url, "appName":app_name })
    .then((response) => {
      console.log(`App ${app_name} installed successfully`, response)
      return response
    })
    .catch((error) => {
      console.error(`Failed to install app ${app_name}`, error)
      throw error
    })
}

export default installApp
