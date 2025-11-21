
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { apiService } from '../services/apiService';
import { Send, User, Bot, Zap, Trash2, BookOpen, Sparkles } from 'lucide-react';
import { useToast } from '../components/Toast';
import { useLanguage } from '../contexts/LanguageContext';

export const Chat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();
  const { t } = useLanguage();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await apiService.query(input);
      if (res.success && res.answer) {
        const botMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: res.answer,
          timestamp: new Date().toISOString(),
          metrics: {
            retrieval_time: res.retrieval_time || 0,
            generation_time: res.generation_time || 0,
            total_time: res.total_time || 0
          },
          retrieved_texts: res.retrieved_texts
        };
        setMessages(prev => [...prev, botMsg]);
      } else {
        throw new Error(res.message || "Unknown error");
      }
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: t('chat.errorResponse'),
        timestamp: new Date().toISOString(),
        is_error: true
      };
      setMessages(prev => [...prev, errorMsg]);
      showToast(t('common.error'), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex gap-6 animate-in fade-in duration-500">
      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
        
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white/80 backdrop-blur-md z-10 absolute top-0 w-full">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl text-white shadow-md shadow-blue-200">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">{t('chat.assistantName')}</h3>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                {t('chat.online')}
              </p>
            </div>
          </div>
          <button 
            onClick={() => setMessages([])}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title={t('chat.clearChat')}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto pt-20 pb-24 px-4 sm:px-8 space-y-8 bg-slate-50">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60 select-none">
              <div className="w-24 h-24 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center mb-6">
                <Bot className="w-10 h-10 text-slate-300" />
              </div>
              <h2 className="text-xl font-semibold text-slate-600 mb-2">{t('chat.welcomeTitle')}</h2>
              <p className="text-sm text-slate-400">{t('chat.welcomeSub')}</p>
            </div>
          )}
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''} group`}>
              {/* Avatar */}
              <div className={`
                w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm mt-1
                ${msg.role === 'user' 
                  ? 'bg-slate-800 text-white' 
                  : 'bg-gradient-to-br from-blue-600 to-blue-700 text-white'
                }
              `}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              
              <div className={`flex flex-col max-w-[85%] lg:max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                
                {/* Role Name */}
                <span className="text-[11px] text-slate-400 mb-1 px-1">
                    {msg.role === 'user' ? t('chat.you') : t('chat.assistantName')}
                </span>

                {/* Bubble */}
                <div className={`
                  px-6 py-4 rounded-2xl shadow-sm text-[15px] leading-relaxed tracking-wide
                  ${msg.role === 'user' 
                    ? 'bg-slate-800 text-white rounded-tr-none shadow-md shadow-slate-200' 
                    : msg.is_error 
                      ? 'bg-red-50 text-red-600 border border-red-100 rounded-tl-none'
                      : 'bg-white text-slate-700 border border-slate-200/60 rounded-tl-none shadow-sm'
                  }
                `}>
                  {msg.content}
                </div>

                {/* Assistant Extras */}
                {msg.role === 'assistant' && !msg.is_error && (
                  <div className="mt-3 space-y-3 w-full animate-in fade-in slide-in-from-top-2 duration-300">
                    
                    {/* Sources Accordion */}
                    {msg.retrieved_texts && msg.retrieved_texts.length > 0 && (
                      <div className="text-xs">
                          <details className="group/details">
                            <summary className="list-none cursor-pointer inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-medium bg-blue-50/50 hover:bg-blue-50 px-2.5 py-1.5 rounded-md transition-colors select-none">
                                <BookOpen className="w-3.5 h-3.5" />
                                {t('chat.viewSources', { count: msg.retrieved_texts.length })}
                            </summary>
                            <div className="mt-3 space-y-2 pl-1">
                            {msg.retrieved_texts.map((text, idx) => (
                                <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200/60 text-xs text-slate-600 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500/20"></div>
                                    <div className="flex justify-between mb-1.5 text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                                        <span className="text-blue-600 truncate max-w-[150px]">{text.source || t('chat.unknownSource')}</span>
                                        <span>{t('chat.relevance')}: {(text.distance * 100).toFixed(1)}%</span>
                                    </div>
                                    <p className="line-clamp-2 italic text-slate-500">"{text.text}"</p>
                                </div>
                            ))}
                            </div>
                          </details>
                      </div>
                    )}

                    {/* Metrics Footer */}
                    {msg.metrics && (
                      <div className="flex items-center gap-4 pt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400 uppercase tracking-wide bg-slate-100 px-2 py-1 rounded-md">
                          <Zap className="w-3 h-3 text-yellow-500" /> 
                          <span>{msg.metrics.total_time.toFixed(2)}s</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
             <div className="flex gap-4">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-sm">
                    <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="flex items-center gap-1 bg-white border border-slate-100 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm h-[52px]">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 w-full bg-white border-t border-slate-100 p-4 sm:p-5">
          <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('chat.inputPlaceholder')}
              disabled={loading}
              className="w-full pl-5 pr-14 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-[15px] disabled:opacity-50 shadow-inner placeholder:text-slate-400"
            />
            <button 
              type="submit" 
              disabled={!input.trim() || loading}
              className="absolute right-2.5 top-2.5 p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed transition-all transform active:scale-95"
            >
              {loading ? <Zap className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </form>
          <p className="text-center text-[10px] text-slate-400 mt-2">{t('chat.disclaimer')}</p>
        </div>
      </div>
    </div>
  );
};
