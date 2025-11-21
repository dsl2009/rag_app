import React, { useEffect, useState, useRef } from 'react';
import { FileItem } from '../types';
import { apiService } from '../services/apiService';
import { Upload, Trash2, FileText, CheckCircle, AlertCircle, RefreshCw, Plus, Database } from 'lucide-react';

export const FileUpload: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const response = await apiService.listFiles();
      if (response.success && response.files) {
        setFiles(response.files);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const res = await apiService.uploadFile(file);
      if (res.success) {
        await fetchFiles();
      } else {
        alert(`Upload failed: ${res.message}`);
      }
    } catch (e) {
      console.error("Upload error:", e);
      alert("Upload failed");
    } finally {
      setUploading(false);
      // Reset input so the same file can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const toggleSelect = (path: string) => {
    const newSet = new Set(selectedFiles);
    if (newSet.has(path)) newSet.delete(path);
    else newSet.add(path);
    setSelectedFiles(newSet);
  };

  const handleDelete = async (path: string) => {
    if (!confirm("Are you sure you want to delete this file?")) return;
    const filename = path.split('/').pop() || path;
    await apiService.deleteFile(filename);
    fetchFiles();
  };

  const handleAddToKB = async () => {
    if (selectedFiles.size === 0) return;
    try {
      const res = await apiService.addDocuments(Array.from(selectedFiles));
      if (res.success) {
        alert(`Successfully added to processing queue. Task ID: ${res.task_id}`);
        setSelectedFiles(new Set());
      }
    } catch (e) {
      alert("Failed to add to KB");
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">File Management</h2>
          <p className="text-slate-500 mt-1">Upload and manage raw files before processing.</p>
        </div>
        <button 
          onClick={fetchFiles} 
          className="p-2 text-slate-500 hover:text-blue-600 transition-colors rounded-full hover:bg-blue-50"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Section */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-600" />
              Upload New File
            </h3>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group"
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleFileSelect}
                disabled={uploading}
              />
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                {uploading ? (
                  <RefreshCw className="w-6 h-6 animate-spin" />
                ) : (
                  <Plus className="w-6 h-6" />
                )}
              </div>
              <p className="text-sm font-medium text-slate-700">Click to browse</p>
              <p className="text-xs text-slate-400 mt-1">PDF, DOCX, TXT supported</p>
            </div>
          </div>
        </div>

        {/* File List Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-semibold text-lg">Uploaded Files ({files.length})</h3>
              {selectedFiles.size > 0 && (
                <button 
                  onClick={handleAddToKB}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <Database className="w-4 h-4" />
                  Add {selectedFiles.size} to Knowledge Base
                </button>
              )}
            </div>
            
            <div className="flex-1 overflow-y-auto max-h-[500px] p-2">
              {files.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                  <FileText className="w-12 h-12 mb-2 opacity-50" />
                  <p>No files uploaded yet</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 sticky top-0 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3 w-12">
                        <input 
                          type="checkbox" 
                          onChange={(e) => {
                            if (e.target.checked) setSelectedFiles(new Set(files.map(f => f.path)));
                            else setSelectedFiles(new Set());
                          }}
                          checked={files.length > 0 && selectedFiles.size === files.length}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-4 py-3">File Name</th>
                      <th className="px-4 py-3">Size</th>
                      <th className="px-4 py-3">Modified</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {files.map((file) => (
                      <tr key={file.path} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-4 py-3">
                          <input 
                            type="checkbox" 
                            checked={selectedFiles.has(file.path)}
                            onChange={() => toggleSelect(file.path)}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-blue-50 text-blue-600 flex items-center justify-center">
                              <FileText className="w-4 h-4" />
                            </div>
                            <span className="font-medium text-slate-700">{file.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-500">{formatSize(file.size)}</td>
                        <td className="px-4 py-3 text-sm text-slate-500">
                          {new Date(file.modified).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button 
                            onClick={() => handleDelete(file.path)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                            title="Delete File"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};