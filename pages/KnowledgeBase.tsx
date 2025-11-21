import React, { useEffect, useState } from 'react';
import { DocumentItem } from '../types';
import { apiService } from '../services/apiService';
import { Database, RefreshCw, Trash2, FileCheck, AlertTriangle, Clock, Layers } from 'lucide-react';
import { STATUS_COLORS } from '../constants';

export const KnowledgeBase: React.FC = () => {
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const res = await apiService.listDocuments();
      if (res.success && res.documents) {
        setDocs(res.documents);
      }
    } catch (e) {
      console.error(e);
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
    if (!confirm(`Delete ${selectedDocs.size} documents from Knowledge Base?`)) return;

    try {
      const res = await apiService.deleteDocuments(Array.from(selectedDocs));
      if (res.success) {
        setSelectedDocs(new Set());
        fetchDocs();
      }
    } catch (e) {
      alert("Failed to delete documents");
    }
  };

  const stats = {
    total: docs.length,
    chunks: docs.reduce((acc, doc) => acc + doc.chunks_count, 0),
    completed: docs.filter(d => d.status === 'completed').length,
    processing: docs.filter(d => d.status === 'processing').length,
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Knowledge Base</h2>
          <p className="text-slate-500 mt-1">Manage processed documents and vector store.</p>
        </div>
        <div className="flex items-center gap-3">
           {selectedDocs.size > 0 && (
            <button 
              onClick={handleDeleteSelected}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors border border-red-200"
            >
              <Trash2 className="w-4 h-4" />
              Delete Selected ({selectedDocs.size})
            </button>
          )}
          <button 
            onClick={fetchDocs} 
            className="p-2 text-slate-500 hover:text-blue-600 transition-colors rounded-full hover:bg-blue-50"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-3 rounded-full bg-slate-100 text-slate-600">
            <FileCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Total Documents</p>
            <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-3 rounded-full bg-blue-50 text-blue-600">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Total Chunks</p>
            <p className="text-2xl font-bold text-slate-800">{stats.chunks}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-3 rounded-full bg-green-50 text-green-600">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Indexed</p>
            <p className="text-2xl font-bold text-slate-800">{stats.completed}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-3 rounded-full bg-yellow-50 text-yellow-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Processing</p>
            <p className="text-2xl font-bold text-slate-800">{stats.processing}</p>
          </div>
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 w-12">
                  <input 
                    type="checkbox" 
                    onChange={(e) => {
                      if (e.target.checked) setSelectedDocs(new Set(docs.map(d => d.original_path)));
                      else setSelectedDocs(new Set());
                    }}
                    checked={docs.length > 0 && selectedDocs.size === docs.length}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-4">Document Name</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Chunks</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Indexed Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {docs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No documents found in knowledge base
                  </td>
                </tr>
              ) : (
                docs.map((doc) => (
                  <tr key={doc.original_path} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <input 
                        type="checkbox" 
                        checked={selectedDocs.has(doc.original_path)}
                        onChange={() => toggleSelect(doc.original_path)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">{doc.file_name}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[doc.status] || 'bg-gray-100 text-gray-800'}`}>
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{doc.chunks_count}</td>
                    <td className="px-6 py-4 text-sm text-slate-500 uppercase">{doc.file_type}</td>
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