export interface FileItem {
  name: string;
  path: string;
  size: number;
  modified: string;
}

export interface DocumentItem {
  original_path: string;
  file_name: string;
  file_type: string;
  status: 'completed' | 'processing' | 'pending' | 'failed';
  chunks_count: number;
  file_size?: number;
  add_time?: string;
}

export interface TaskItem {
  task_id: string;
  task_type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  file_path?: string;
  start_time?: string;
  end_time?: string;
  last_update?: string;
  message?: string;
  error_message?: string;
}

export interface RetrievalChunk {
  text: string;
  distance: number;
  source?: string;
}

export interface ChatMetrics {
  retrieval_time: number;
  generation_time: number;
  total_time: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  metrics?: ChatMetrics;
  retrieved_texts?: RetrievalChunk[];
  is_error?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  // Handle variations in API response structure based on Python code
  files?: T;
  documents?: T;
  tasks?: T;
  task?: T;
  task_id?: string;
  answer?: string;
  retrieved_texts?: RetrievalChunk[];
  retrieval_time?: number;
  generation_time?: number;
  total_time?: number;
  successful_deletions?: number;
  failed_deletions?: number;
}