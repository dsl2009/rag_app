
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { FileUpload } from './pages/FileUpload';
import { KnowledgeBase } from './pages/KnowledgeBase';
import { TaskMonitor } from './pages/TaskMonitor';
import { Chat } from './pages/Chat';
import { ToastProvider } from './components/Toast';
import { LanguageProvider } from './contexts/LanguageContext';

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <ToastProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<FileUpload />} />
              <Route path="/knowledge" element={<KnowledgeBase />} />
              <Route path="/tasks" element={<TaskMonitor />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </Router>
      </ToastProvider>
    </LanguageProvider>
  );
};

export default App;
