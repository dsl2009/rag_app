import React, { useEffect, useState, useCallback } from 'react';
import { TaskItem } from '../types';
import { apiService } from '../services/apiService';
import { Activity, RefreshCw, CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react';
import { STATUS_COLORS } from '../constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const TaskMonitor: React.FC = () => {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchTasks = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const res = await apiService.getRecentTasks();
      if (res.success && res.tasks) {
        setTasks(res.tasks);
      }
    } catch (e) {
      console.error(e);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks(true);
    const interval = setInterval(() => {
      if (autoRefresh) fetchTasks(false);
    }, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchTasks]);

  // Calculate Chart Data
  const statusCounts = tasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.keys(statusCounts).map(status => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    count: statusCounts[status],
    color: status === 'completed' ? '#22c55e' : status === 'failed' ? '#ef4444' : status === 'processing' ? '#3b82f6' : '#eab308'
  }));

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Task Monitor</h2>
          <p className="text-slate-500 mt-1">Track ingestion and background processes.</p>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
            <input 
              type="checkbox" 
              checked={autoRefresh} 
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            Auto-refresh
          </label>
          <button 
            onClick={() => fetchTasks(true)}
            className="p-2 text-slate-500 hover:text-blue-600 transition-colors rounded-full hover:bg-blue-50"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Section */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="font-semibold text-slate-800 mb-6">Task Status Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task List */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800">Recent Activities</h3>
          </div>
          <div className="overflow-y-auto max-h-[600px] p-6 space-y-4">
            {tasks.map((task) => (
              <div key={task.task_id} className="group p-4 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    {task.status === 'completed' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                    {task.status === 'failed' && <XCircle className="w-5 h-5 text-red-500" />}
                    {task.status === 'processing' && <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />}
                    {task.status === 'pending' && <Clock className="w-5 h-5 text-yellow-500" />}
                    
                    <div>
                      <h4 className="font-medium text-slate-900 text-sm">
                        {task.task_type.toUpperCase()} - <span className="text-slate-500">{task.task_id}</span>
                      </h4>
                      <p className="text-xs text-slate-500">{task.file_path}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium border ${STATUS_COLORS[task.status]}`}>
                    {task.status}
                  </span>
                </div>
                
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Progress</span>
                    <span>{task.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        task.status === 'failed' ? 'bg-red-500' : 
                        task.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    {task.message || (task.error_message ? `Error: ${task.error_message}` : 'No status message')}
                  </p>
                  <div className="text-[10px] text-slate-300 mt-1 text-right">
                    Started: {task.start_time ? new Date(task.start_time).toLocaleTimeString() : '-'}
                  </div>
                </div>
              </div>
            ))}
            {tasks.length === 0 && (
              <div className="text-center text-slate-400 py-8">No recent tasks</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};