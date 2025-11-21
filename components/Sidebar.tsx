
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UploadCloud, Database, Activity, MessageSquare, Box, Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { t, language, setLanguage } = useLanguage();
  
  const navItems = [
    { path: '/', label: t('sidebar.fileUpload'), icon: UploadCloud },
    { path: '/knowledge', label: t('sidebar.knowledgeBase'), icon: Database },
    { path: '/tasks', label: t('sidebar.taskMonitor'), icon: Activity },
    { path: '/chat', label: t('sidebar.chat'), icon: MessageSquare },
  ];

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'zh' : 'en');
  };

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col h-screen fixed left-0 top-0 shadow-xl z-50">
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="p-2 bg-blue-600 rounded-lg">
          <Box className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg tracking-tight">Knowledge<span className="text-blue-400">Base</span></h1>
          <p className="text-xs text-slate-400">{t('sidebar.subtitle')}</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-3">
        {/* Language Toggle */}
        <button 
          onClick={toggleLanguage}
          className="w-full flex items-center gap-3 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-slate-300 text-sm"
        >
          <Globe className="w-4 h-4" />
          <span>{language === 'en' ? 'English' : '中文'}</span>
          <span className="ml-auto text-xs opacity-50 border border-slate-600 px-1.5 rounded">
            {language === 'en' ? 'Switch to ZH' : 'Switch to EN'}
          </span>
        </button>

        <div className="flex items-center gap-2 px-4 py-2 rounded-md bg-slate-800/50 text-xs text-slate-400">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          {t('sidebar.status')}
        </div>
      </div>
    </aside>
  );
};
