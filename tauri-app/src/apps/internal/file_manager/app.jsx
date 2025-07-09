import React, { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useSearchParams } from "react-router-dom";
import {
  Folder,
  File as FileIcon,
  HardDrive,
  ArrowUp,
  Search,
  SortAsc,
  SortDesc,
} from "lucide-react";

function FileManagerApp() {
  const [searchParams, setSearchParams] = useSearchParams();
  const pathParam = searchParams.get("path") || "";
  const [drives, setDrives] = useState([]);
  const [entries, setEntries] = useState([]);
  const [error, setError] = useState(null);

  // UI state
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortDir, setSortDir] = useState("asc");

  // Load drives on mount
  useEffect(() => {
    invoke("list_drives")
      .then(setDrives)
      .catch((err) => setError(err.toString()));
  }, []);

  // Load directory whenever path changes (via URL param)
  useEffect(() => {
    if (!pathParam) {
      setEntries([]);
      return;
    }
    invoke("read_dir", { path: pathParam })
      .then(setEntries)
      .catch((err) => {
        setEntries([]);
        setError(err.toString());
      });
  }, [pathParam]);

  const enterFolder = (folderName) => {
    let newPath = pathParam;
    if (!newPath.endsWith("/") && !newPath.endsWith("\\")) {
      newPath += "/";
    }
    newPath += folderName;
    setSearchParams({ path: newPath });
    setSearch(""); // Clear search bar when entering a folder
  };

  const goUp = () => {
    if (!pathParam || pathParam === "/") return;
    if (pathParam.match(/^[a-zA-Z]:[\\/]?$/)) {
      setSearchParams({});
      return;
    }
    const parts = pathParam.split(/[\\/]/).filter(Boolean);
    parts.pop();
    let newPath = parts.join("/");
    if (pathParam.match(/^[a-zA-Z]:/)) {
      newPath = newPath ? newPath : pathParam.slice(0, 2);
      if (!newPath.endsWith("/")) newPath += "/";
    } else {
      newPath = "/" + newPath;
    }
    setSearchParams({ path: newPath });
  };

  // --- Breadcrumb Navigation ---
  const getBreadcrumbs = () => {
    if (!pathParam) return [];
    const isWin = /^[a-zA-Z]:/.test(pathParam);
    let parts = pathParam.split(/[\\/]/).filter(Boolean);
    let crumbs = [];
    let acc = isWin ? parts[0] : "";
    if (isWin) {
      crumbs.push({ label: parts[0], path: parts[0] + "/" });
      parts = parts.slice(1);
    }
    parts.forEach((part, idx) => {
      acc = isWin
        ? acc + "/" + part
        : acc
        ? acc + "/" + part
        : "/" + part;
      crumbs.push({ label: part, path: acc + (isWin || idx < parts.length - 1 ? "/" : "") });
    });
    return crumbs;
  };

  // --- Sorting and Filtering ---
  const filteredEntries = entries
    .filter((e) =>
      !search
        ? true
        : e.name.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      let cmp = 0;
      if (sortBy === "name") {
        cmp = a.name.localeCompare(b.name);
      } else if (sortBy === "type") {
        cmp = (a.is_dir === b.is_dir) ? 0 : a.is_dir ? -1 : 1;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

  // --- UI ---
  if (!pathParam) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen font-sans text-gray-800 flex flex-col items-center">
        <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <HardDrive className="w-6 h-6 text-blue-600" /> Select Drive
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-6">
          {drives.map((drive) => (
            <button
              key={drive}
              onClick={() => setSearchParams({ path: drive })}
              className="flex flex-col items-center p-5 bg-white rounded-xl shadow hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              <HardDrive className="w-10 h-10 mb-2 text-blue-500" />
              <div className="text-base font-semibold">{drive}</div>
            </button>
          ))}
        </div>
        {error && <div className="mt-4 text-red-600">{error}</div>}
      </div>
    );
  }

  // --- Breadcrumbs ---
  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans text-gray-800">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={goUp}
            className={`p-2 rounded-md text-white flex items-center gap-1 ${
              pathParam === "/" ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            title="Go Up"
          >
            <ArrowUp className="w-5 h-5" />
            Up
          </button>
          <nav className="ml-2 flex items-center text-sm font-medium select-text">
            Path:
            <span className="ml-1 flex items-center flex-wrap">
              {breadcrumbs.map((crumb, idx) => (
                <span key={crumb.path} className="flex items-center">
                  <button
                    className={`font-mono px-1 rounded hover:bg-blue-100 transition ${
                      idx === breadcrumbs.length - 1
                        ? "text-blue-700 font-bold cursor-default"
                        : "text-blue-600 underline cursor-pointer"
                    }`}
                    disabled={idx === breadcrumbs.length - 1}
                    onClick={() => {
                      if (idx !== breadcrumbs.length - 1) {
                        setSearchParams({ path: crumb.path });
                        setSearch("");
                      }
                    }}
                    tabIndex={0}
                  >
                    {crumb.label}
                  </button>
                  {idx < breadcrumbs.length - 1 && (
                    <span className="mx-1 text-gray-400">/</span>
                  )}
                </span>
              ))}
            </span>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search files/folders"
              className="pl-8 pr-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-400 outline-none text-sm"
            />
          </div>
          <div className="flex items-center gap-1">
            <label className="text-xs text-gray-500 mr-1">Sort by</label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="px-2 py-1 rounded border text-sm"
            >
              <option value="name">Name</option>
              <option value="type">Type</option>
            </select>
            <button
              onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
              className="ml-1 p-1 rounded hover:bg-blue-100"
              title="Toggle sort direction"
            >
              {sortDir === "asc" ? (
                <SortAsc className="w-4 h-4" />
              ) : (
                <SortDesc className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {error && <div className="mb-4 text-red-600">{error}</div>}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-6">
        {filteredEntries.map(({ name, is_dir }) => (
          <div
            key={name}
            onDoubleClick={() => {
              if (is_dir) {
                enterFolder(name);
              } else {
                // You can add file open logic here if needed
              }
            }}
            role={is_dir ? "button" : "presentation"}
            tabIndex={is_dir ? 0 : -1}
            onKeyPress={e => is_dir && (e.key === "Enter" || e.key === " ") && enterFolder(name)}
            className={`flex flex-col items-center p-5 rounded-xl shadow cursor-pointer select-none transition border
              ${is_dir
                ? "bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                : "bg-gray-100"
              }`}
          >
            <div className="mb-2">
              {is_dir ? (
                <Folder className="w-10 h-10 text-blue-400" />
              ) : (
                <FileIcon className="w-10 h-10 text-gray-400" />
              )}
            </div>
            <div className="text-center truncate w-full text-sm font-medium" title={name}>
              {name}
            </div>
          </div>
        ))}
      </div>
      {filteredEntries.length === 0 && (
        <div className="text-center text-gray-400 mt-12 text-lg">
          No files or folders found.
        </div>
      )}
    </div>
  );
}

export default FileManagerApp;
