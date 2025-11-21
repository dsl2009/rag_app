
import React, { useEffect, useState, useRef } from 'react';
import { FileItem } from '../types';
import { apiService } from '../services/apiService';
import { Upload, Trash2, FileText, RefreshCw, Database, File as FileIcon } from 'lucide-react';
import { useToast } from '../components/Toast';
import { useLanguage } from '../contexts/LanguageContext';

export const FileUpload: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();
  const { t } = useLanguage();

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const response = await apiService.listFiles();
      if (response.success && response.files) {
        setFiles(response.files);
      }
    } catch (e) {
      console.error(e);
      showToast(t('common.error'), "error");
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const res = await apiService.uploadFile(file);
      if (res.success) {
        showToast(t('fileUpload.uploadSuccess', { name: file.name }), "success");
        await fetchFiles();
      } else {
        showToast(`${t('common.error')}: ${res.message}`, "error");
      }
    } catch (e) {
      console.error("Upload error:", e);
      showToast(t('common.error'), "error");
    } finally {
      setUploading(false);
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
    if (!confirm(t('fileUpload.deleteConfirm'))) return;
    
    const filename = path.split('/').pop() || path;
    
    try {
      const res = await apiService.deleteFile(filename);
      if (res.success) {
        if (selectedFiles.has(path)) {
          const newSet = new Set(selectedFiles);
          newSet.delete(path);
          setSelectedFiles(newSet);
        }
        showToast(t('common.success'), "success");
        await fetchFiles();
      } else {
        showToast(`${t('common.delete')} ${t('common.failed')}: ${res.message}`, "error");
      }
    } catch (e) {
      showToast(t('common.error'), "error");
    }
  };

  const handleAddToKB = async () => {
    if (selectedFiles.size === 0) return;
    try {
      const res = await apiService.addDocuments(Array.from(selectedFiles));
      if (res.success) {
        showToast(t('fileUpload.addToKbSuccess', { count: selectedFiles.size }), "success");
        setSelectedFiles(new Set());
      } else {
        showToast(res.message || t('common.error'), "warning");
      }
    } catch (e) {
      showToast(t('common.error'), "error");
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
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">{t('fileUpload.title')}</h2>
          <p className="text-slate-500 mt-1 text-lg">{t('fileUpload.subtitle')}</p>
        </div>
        <button 
          onClick={fetchFiles} 
          className="p-2.5 text-slate-500 hover:text-blue-600 transition-all rounded-full hover:bg-blue-50 border border-transparent hover:border-blue-100"
          title={t('common.refresh')}
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Section */}
        <div className="lg:col-span-1">
          <div 
            className={`
              relative h-64 rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center text-center p-6 cursor-pointer overflow-hidden bg-white
              ${isDragging 
                ? 'border-blue-500 bg-blue-50/50 scale-[1.02] shadow-lg' 
                : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50'
              }
              ${uploading ? 'opacity-50 pointer-events-none' : ''}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleFileSelect}
              disabled={uploading}
            />
            
            <div className={`
              w-16 h-16 mb-4 rounded-2xl flex items-center justify-center transition-all duration-500
              ${isDragging ? 'bg-blue-500 text-white shadow-blue-200 shadow-lg' : 'bg-blue-50 text-blue-600'}
            `}>
              {uploading ? (
                <RefreshCw className="w-8 h-8 animate-spin" />
              ) : (
                <Upload className="w-8 h-8" />
              )}
            </div>
            
            <h3 className="font-semibold text-slate-800 text-lg mb-1">
              {uploading ? t('fileUpload.uploading') : isDragging ? t('fileUpload.dropHere') : t('fileUpload.uploadNew')}
            </h3>
            <p className="text-sm text-slate-500 max-w-[200px] mx-auto">
              {t('fileUpload.supportText')}
            </p>
          </div>
        </div>

        {/* File List Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 flex flex-col h-full overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
              <div className="flex items-center gap-2">
                <div className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs font-bold">
                  {files.length}
                </div>
                <h3 className="font-semibold text-slate-700">{t('fileUpload.availableFiles')}</h3>
              </div>
              
              {selectedFiles.size > 0 && (
                <button 
                  onClick={handleAddToKB}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 hover:shadow-md hover:shadow-blue-200 transition-all active:scale-95"
                >
                  <Database className="w-4 h-4" />
                  {t('fileUpload.processFiles', { count: selectedFiles.size })}
                </button>
              )}
            </div>
            
            <div className="flex-1 overflow-y-auto max-h-[500px]">
              {files.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                  <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                    <FileIcon className="w-8 h-8 opacity-50" />
                  </div>
                  <p className="font-medium">{t('fileUpload.noFiles')}</p>
                  <p className="text-sm mt-1 text-slate-400">{t('fileUpload.noFilesSub')}</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50/50 sticky top-0 text-xs font-semibold text-slate-500 uppercase tracking-wider backdrop-blur-sm">
                    <tr>
                      <th className="px-6 py-4 w-12">
                        <input 
                          type="checkbox" 
                          onChange={(e) => {
                            if (e.target.checked) setSelectedFiles(new Set(files.map(f => f.path)));
                            else setSelectedFiles(new Set());
                          }}
                          checked={files.length > 0 && selectedFiles.size === files.length}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                        />
                      </th>
                      <th className="px-6 py-4">{t('fileUpload.fileName')}</th>
                      <th className="px-6 py-4">{t('fileUpload.size')}</th>
                      <th className="px-6 py-4">{t('fileUpload.modified')}</th>
                      <th className="px-6 py-4 text-right">{t('common.actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {files.map((file) => (
                      <tr 
                        key={file.path} 
                        className={`
                          group transition-colors cursor-pointer
                          ${selectedFiles.has(file.path) ? 'bg-blue-50/40' : 'hover:bg-slate-50/80'}
                        `}
                        onClick={(e) => {
                          if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input')) return;
                          toggleSelect(file.path);
                        }}
                      >
                        <td className="px-6 py-4">
                          <input 
                            type="checkbox" 
                            checked={selectedFiles.has(file.path)}
                            onChange={() => toggleSelect(file.path)}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${selectedFiles.has(file.path) ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500 group-hover:bg-white group-hover:shadow-sm'}`}>
                              <FileText className="w-5 h-5" />
                            </div>
                            <span className={`font-medium ${selectedFiles.has(file.path) ? 'text-blue-700' : 'text-slate-700'}`}>
                              {file.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500 font-mono">{formatSize(file.size)}</td>
                        <td className="px-6 py-4 text-sm text-slate-500">
                          {new Date(file.modified).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDelete(file.path); }}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                            title={t('common.delete')}
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
