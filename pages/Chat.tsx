import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { apiService } from '../services/apiService';
import { Send, User, Bot, Zap, FileText, Trash2, Save, BookOpen } from 'lucide-react';

export const Chat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
        content: "Sorry, I encountered an error processing your request.",
        timestamp: new Date().toISOString(),
        is_error: true
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex gap-6">
      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg text-white shadow-blue-200">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">AI Assistant</h3>
              <p className="text-xs text-slate-500">Connected to Knowledge Base</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setMessages([])}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Clear Chat"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
              <BookOpen className="w-16 h-16 mb-4" />
              <p className="text-lg font-medium">Ask a question about your documents</p>
            </div>
          )}
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                msg.role === 'user' ? 'bg-slate-700 text-white' : 'bg-blue-600 text-white'
              }`}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              
              <div className={`flex flex-col max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`px-5 py-3.5 rounded-2xl shadow-sm text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-slate-800 text-white rounded-tr-none' 
                    : msg.is_error 
                      ? 'bg-red-50 text-red-600 border border-red-100 rounded-tl-none'
                      : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                }`}>
                  {msg.content}
                </div>

                {/* Metrics & Sources for Assistant */}
                {msg.role === 'assistant' && !msg.is_error && (
                  <div className="mt-3 space-y-3 w-full">
                    {/* Performance Metrics */}
                    {msg.metrics && (
                      <div className="flex gap-4 text-[10px] font-medium text-slate-400 uppercase tracking-wide">
                        <span className="flex items-center gap-1">
                          <Zap className="w-3 h-3" /> Retrieval: {msg.metrics.retrieval_time.toFixed(2)}s
                        </span>
                        <span>Generation: {msg.metrics.generation_time.toFixed(2)}s</span>
                      </div>
                    )}

                    {/* Citations */}
                    {msg.retrieved_texts && msg.retrieved_texts.length > 0 && (
                      <details className="group">
                        <summary className="list-none cursor-pointer text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 select-none">
                          <BookOpen className="w-3 h-3" />
                          View {msg.retrieved_texts.length} Sources
                        </summary>
                        <div className="mt-3 space-y-2 pl-2 border-l-2 border-blue-100">
                          {msg.retrieved_texts.map((text, idx) => (
                            <div key={idx} className="bg-white p-3 rounded border border-slate-100 text-xs text-slate-600 shadow-sm">
                              <div className="flex justify-between mb-1 text-[10px] text-slate-400">
                                <span className="font-semibold text-blue-500">{text.source || 'Unknown Source'}</span>
                                <span>Score: {text.distance.toFixed(4)}</span>
                              </div>
                              <p className="line-clamp-3 italic">"{text.text}"</p>
                            </div>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-100">
          <form onSubmit={handleSubmit} className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question here..."
              disabled={loading}
              className="w-full pl-4 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm disabled:opacity-50"
            />
            <button 
              type="submit" 
              disabled={!input.trim() || loading}
              className="absolute right-2 top-2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              {loading ? <Zap className="w-5 h-5 animate-pulse" /> : <Send className="w-5 h-5" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};