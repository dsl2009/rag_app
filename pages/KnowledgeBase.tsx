
import React, { useEffect, useState } from 'react';
import { DocumentItem } from '../types';
import { apiService } from '../services/apiService';
import { Database, RefreshCw, Trash2, FileCheck, Clock, Layers, FileText } from 'lucide-react';
import { STATUS_COLORS } from '../constants';
import { useToast } from '../components/Toast';
import { useLanguage } from '../contexts/LanguageContext';

export const KnowledgeBase: React.FC = () => {
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());
  const { showToast } = useToast();
  const { t } = useLanguage();

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const res = await apiService.listDocuments();
      if (res.success && res.documents) {
        setDocs(res.documents);
      }
    } catch (e) {
      console.error(e);
      showToast(t('common.error'), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const toggleSelect = (path: string) => {
    const newSet = new Set(selectedDocs);
    if (newSet.has(path)) newSet.delete(path);
    else newSet.add(path);
    setSelectedDocs(newSet);
  };

  const handleDeleteSelected = async () => {
    if (selectedDocs.size === 0) return;
    if (!confirm(t('knowledgeBase.deleteConfirm', { count: selectedDocs.size }))) return;

    try {
      const res = await apiService.deleteDocuments(Array.from(selectedDocs));
      if (res.success) {
        showToast(t('common.success'), "success");
        setSelectedDocs(new Set());
        await fetchDocs();
      } else {
        showToast(res.message || t('common.error'), "error");
      }
    } catch (e) {
      showToast(t('common.error'), "error");
    }
  };

  const stats = {
    total: docs.length,
    chunks: docs.reduce((acc, doc) => acc + doc.chunks_count, 0),
    completed: docs.filter(d => d.status === 'completed').length,
    processing: docs.filter(d => d.status === 'processing').length,
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">{t('knowledgeBase.title')}</h2>
          <p className="text-slate-500 mt-1 text-lg">{t('knowledgeBase.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
           {selectedDocs.size > 0 && (
            <button 
              onClick={handleDeleteSelected}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 text-sm font-bold rounded-xl hover:bg-red-100 transition-all border border-red-100 shadow-sm hover:shadow active:scale-95"
            >
              <Trash2 className="w-4 h-4" />
              {t('knowledgeBase.deleteSelected', { count: selectedDocs.size })}
            </button>
          )}
          <button 
            onClick={fetchDocs} 
            className="p-2.5 text-slate-500 hover:text-blue-600 transition-all rounded-full hover:bg-blue-50 border border-transparent hover:border-blue-100"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-5 hover:shadow-md transition-shadow relative overflow-hidden group">
           <div className="absolute right-0 top-0 w-24 h-24 bg-slate-50 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-150 group-hover:bg-slate-100"></div>
           <div className="relative p-3.5 rounded-xl bg-slate-100 text-slate-600 shadow-sm group-hover:scale-110 transition-transform">
            <FileCheck className="w-6 h-6" />
          </div>
          <div className="relative">
            <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider">{t('knowledgeBase.stats.documents')}</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">{stats.total}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-5 hover:shadow-md transition-shadow relative overflow-hidden group">
           <div className="absolute right-0 top-0 w-24 h-24 bg-blue-50 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-150 group-hover:bg-blue-100"></div>
           <div className="relative p-3.5 rounded-xl bg-blue-50 text-blue-600 shadow-sm group-hover:scale-110 transition-transform">
            <Layers className="w-6 h-6" />
          </div>
          <div className="relative">
            <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider">{t('knowledgeBase.stats.totalChunks')}</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">{stats.chunks}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-5 hover:shadow-md transition-shadow relative overflow-hidden group">
           <div className="absolute right-0 top-0 w-24 h-24 bg-green-50 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-150 group-hover:bg-green-100"></div>
           <div className="relative p-3.5 rounded-xl bg-green-50 text-green-600 shadow-sm group-hover:scale-110 transition-transform">
            <Database className="w-6 h-6" />
          </div>
          <div className="relative">
            <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider">{t('knowledgeBase.stats.activeIndex')}</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">{stats.completed}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-5 hover:shadow-md transition-shadow relative overflow-hidden group">
           <div className="absolute right-0 top-0 w-24 h-24 bg-yellow-50 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-150 group-hover:bg-yellow-100"></div>
           <div className="relative p-3.5 rounded-xl bg-yellow-50 text-yellow-600 shadow-sm group-hover:scale-110 transition-transform">
            <Clock className="w-6 h-6" />
          </div>
          <div className="relative">
            <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider">{t('knowledgeBase.stats.processing')}</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">{stats.processing}</p>
          </div>
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 w-12">
                  <input 
                    type="checkbox" 
                    onChange={(e) => {
                      if (e.target.checked) setSelectedDocs(new Set(docs.map(d => d.original_path)));
                      else setSelectedDocs(new Set());
                    }}
                    checked={docs.length > 0 && selectedDocs.size === docs.length}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                  />
                </th>
                <th className="px-6 py-4">{t('knowledgeBase.table.docName')}</th>
                <th className="px-6 py-4">{t('knowledgeBase.table.status')}</th>
                <th className="px-6 py-4">{t('knowledgeBase.table.chunks')}</th>
                <th className="px-6 py-4">{t('knowledgeBase.table.type')}</th>
                <th className="px-6 py-4">{t('knowledgeBase.table.indexedDate')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {docs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center">
                        <Database className="w-12 h-12 opacity-20 mb-3" />
                        <p className="text-lg font-medium">{t('knowledgeBase.table.emptyTitle')}</p>
                        <p className="text-sm mt-1 opacity-70">{t('knowledgeBase.table.emptySub')}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                docs.map((doc) => (
                  <tr 
                    key={doc.original_path} 
                    className={`
                        hover:bg-slate-50/80 transition-colors cursor-pointer
                        ${selectedDocs.has(doc.original_path) ? 'bg-blue-50/40' : ''}
                    `}
                    onClick={(e) => {
                        if ((e.target as HTMLElement).closest('input')) return;
                        toggleSelect(doc.original_path);
                    }}
                  >
                    <td className="px-6 py-4">
                      <input 
                        type="checkbox" 
                        checked={selectedDocs.has(doc.original_path)}
                        onChange={() => toggleSelect(doc.original_path)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                             <div className={`p-2 rounded-lg ${selectedDocs.has(doc.original_path) ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                                <FileText className="w-4 h-4" />
                             </div>
                             <span className="font-medium text-slate-700">{doc.file_name}</span>
                        </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[doc.status] || 'bg-gray-100 text-gray-800'}`}>
                         {/* Typically status codes are English (API), but we can map them if needed, or leave as tech terms */}
                        {t(`common.${doc.status}`) || doc.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 font-mono">{doc.chunks_count}</td>
                    <td className="px-6 py-4 text-sm text-slate-500 uppercase tracking-wider font-bold text-xs">{doc.file_type}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {doc.add_time ? new Date(doc.add_time).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
