import React, { useEffect, useCallback, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const AddAppModal = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isOpen = searchParams.get('add_app_modal') === 'open';
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPrivate: false,
    distFolder: null
  });
  
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const items = e.dataTransfer.items;
    if (items) {
      const processEntry = async (entry, path = '') => {
        if (entry.isFile) {
          entry.file(file => {
            setUploadedFiles(prev => [...prev, { path: path + file.name, file }]);
          });
        } else if (entry.isDirectory) {
          const reader = entry.createReader();
          reader.readEntries(entries => {
            entries.forEach(ent => {
              processEntry(ent, path + entry.name + '/');
            });
          });
        }
      };

      [...items].forEach(item => {
        if (item.webkitGetAsEntry) {
          const entry = item.webkitGetAsEntry();
          if (entry && entry.isDirectory && entry.name === 'dist') {
            setUploadedFiles([]); // Clear previous files
            setFormData(prev => ({ ...prev, distFolder: entry }));
            processEntry(entry);
          } else {
            alert('Please drop a dist folder');
          }
        }
      });
    }
  }, []);

  const handleFileSelect = useCallback((e) => {
    const files = e.target.files;
    if (files) {
      setUploadedFiles([]); // Clear previous files
      const fileArray = Array.from(files);
      if (fileArray.some(file => file.webkitRelativePath.includes('dist'))) {
        setFormData(prev => ({ ...prev, distFolder: files[0] }));
        fileArray.forEach(file => {
          setUploadedFiles(prev => [...prev, {
            path: file.webkitRelativePath,
            file
          }]);
        });
      } else {
        alert('Please select a dist folder');
      }
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    console.log("Uploaded files:", uploadedFiles);
    
    handleCloseModal();
  };

  const handleCloseModal = useCallback(() => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete('add_app_modal');
    navigate({ search: newSearchParams.toString() }, { replace: true });
    const modal = document.getElementById('add_app_modal');
    if (modal) modal.close();
  }, [searchParams, navigate]);

  useEffect(() => {
    const modal = document.getElementById('add_app_modal');
    if (isOpen && modal) {
      modal.showModal();
    } else if (!isOpen && modal && modal.open) {
      modal.close();
    }
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        handleCloseModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleCloseModal]);

  if (!isOpen) return null;

  return (
    <dialog id="add_app_modal" className="modal" onClose={handleCloseModal}>
      <div className="modal-box max-w-2xl">
        <h3 className="font-bold text-2xl mb-6">Add New App</h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">App Name</span>
            </label>
            <input 
              type="text" 
              className="input input-bordered w-full" 
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Description</span>
            </label>
            <textarea 
              className="textarea textarea-bordered h-24" 
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              required
            />
          </div>

          <div 
            className={`form-control w-full h-32 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer
              ${dragActive ? 'border-primary bg-base-200' : 'border-base-300'}
              ${formData.distFolder ? 'bg-success/10' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              webkitdirectory="true"
              directory="true"
              className="hidden"
              onChange={handleFileSelect}
              multiple
            />
            {formData.distFolder ? (
              <div className="text-center">
                <p className="text-success">✓ dist folder uploaded</p>
                <p className="text-sm opacity-70">{uploadedFiles.length} files</p>
                {uploadedFiles.length > 0 && (
                  <p className="text-xs opacity-50">Including: {uploadedFiles[0].path}</p>
                )}
              </div>
            ) : (
              <div className="text-center">
                <p>Drag and drop your dist folder here</p>
                <p className="text-sm opacity-70">or click to browse</p>
              </div>
            )}
          </div>

          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Private App</span>
              <input 
                type="checkbox" 
                className="toggle toggle-primary" 
                checked={formData.isPrivate}
                onChange={(e) => setFormData(prev => ({ ...prev, isPrivate: e.target.checked }))}
              />
            </label>
          </div>

          <div className="modal-action">
            <button type="button" className="btn" onClick={handleCloseModal}>Cancel</button>
            <button type="submit" className="btn btn-primary">Add App</button>
          </div>
        </form>
      </div>
      <form method="dialog" className="modal-backdrop" onClick={handleCloseModal}>
        <button type="button">close</button>
      </form>
    </dialog>
  );
};

export default AddAppModal;