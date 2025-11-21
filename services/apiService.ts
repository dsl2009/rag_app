import { API_BASE_URL, MOCK_DELAY } from '../constants';
import { ApiResponse, FileItem, DocumentItem, TaskItem } from '../types';

// Helper to handle API errors or return mock data if backend is offline
async function fetchWithMockFallback<T>(
  endpoint: string, 
  options: RequestInit = {}, 
  mockData: T
): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    // NOTE: For read operations, strict error handling might be looser, 
    // but for consistency, we usually want to mock only on network failures.
    // However, to keep the "demo" feel alive even if endpoints 404, we keep this pattern for GET requests.
    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.warn(`API connection failed for ${endpoint}. Using mock data.`, error);
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockData), MOCK_DELAY);
    });
  }
}

export const apiService = {
  // Health Check
  healthCheck: async (): Promise<{ status: string }> => {
    return fetchWithMockFallback('/health', {}, { status: 'healthy' });
  },

  // Files
  uploadFile: async (file: File): Promise<ApiResponse<any>> => {
    const formData = new FormData();
    formData.append('file', file);
    
    // Try real upload first
    try {
      const response = await fetch(`${API_BASE_URL}/files/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        // If server returns 4xx/5xx, we return the error message, NOT the mock success
        const errData = await response.json().catch(() => ({}));
        return { success: false, message: errData.message || `Upload failed: ${response.statusText}` };
      }
      return await response.json();
    } catch (error) {
      console.warn("Real upload failed (Network Error), falling back to mock.", error);
      // Only fall back to mock if the server is completely unreachable (Network Error)
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ 
            success: true, 
            message: "File uploaded successfully (Mock Mode)", 
            data: { filename: file.name } 
          } as any);
        }, 1500);
      });
    }
  },

  listFiles: async (): Promise<ApiResponse<FileItem[]>> => {
    const mockFiles: FileItem[] = [
      { name: "company_handbook.pdf", path: "/uploads/company_handbook.pdf", size: 2450000, modified: new Date().toISOString() },
      { name: "project_specs.docx", path: "/uploads/project_specs.docx", size: 12000, modified: new Date(Date.now() - 86400000).toISOString() },
      { name: "notes.txt", path: "/uploads/notes.txt", size: 450, modified: new Date(Date.now() - 172800000).toISOString() },
    ];
    const response = await fetchWithMockFallback('/files/list', {}, { success: true, files: mockFiles });
    return response;
  },

  deleteFile: async (filename: string): Promise<ApiResponse<any>> => {
    try {
      // Encode filename to handle spaces and special characters
      const response = await fetch(`${API_BASE_URL}/files/${encodeURIComponent(filename)}`, { 
        method: 'DELETE' 
      });

      if (!response.ok) {
        // Return failure if server responds with error
        const errData = await response.json().catch(() => ({}));
        return { success: false, message: errData.message || `Delete failed: ${response.statusText}` };
      }
      
      return await response.json();
    } catch (error) {
      console.warn("Delete request failed (Network Error), using mock.", error);
      // Fallback only on network error
      return new Promise((resolve) => {
        setTimeout(() => resolve({ success: true, message: 'Deleted (Mock)' }), MOCK_DELAY);
      });
    }
  },

  // Knowledge Base Documents
  addDocuments: async (filePaths: string[]): Promise<ApiResponse<any>> => {
    return fetchWithMockFallback('/documents/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file_paths: filePaths })
    }, { success: true, task_id: `task_${Date.now()}`, message: "Documents added to queue" });
  },

  listDocuments: async (): Promise<ApiResponse<DocumentItem[]>> => {
    const mockDocs: DocumentItem[] = [
      { original_path: "/uploads/company_handbook.pdf", file_name: "company_handbook.pdf", file_type: "pdf", status: "completed", chunks_count: 145, file_size: 2450000, add_time: new Date().toISOString() },
      { original_path: "/uploads/project_specs.docx", file_name: "project_specs.docx", file_type: "docx", status: "processing", chunks_count: 0, file_size: 12000, add_time: new Date().toISOString() },
      { original_path: "/uploads/legacy_data.txt", file_name: "legacy_data.txt", file_type: "txt", status: "failed", chunks_count: 0, file_size: 5000, add_time: new Date(Date.now() - 1000000).toISOString() },
    ];
    const response = await fetchWithMockFallback('/documents', {}, { success: true, documents: mockDocs });
    return response;
  },

  deleteDocuments: async (filePaths: string[]): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/documents/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file_paths: filePaths })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        return { success: false, message: errData.message || `Delete KB failed: ${response.statusText}` };
      }
      return await response.json();
    } catch (error) {
       console.warn("KB Delete request failed (Network Error), using mock.", error);
       return new Promise((resolve) => {
         setTimeout(() => resolve({ 
           success: true, 
           successful_deletions: filePaths.length, 
           failed_deletions: 0 
         }), MOCK_DELAY);
       });
    }
  },

  // Tasks
  getRecentTasks: async (): Promise<ApiResponse<TaskItem[]>> => {
    const mockTasks: TaskItem[] = [
      { task_id: "t_123", task_type: "ingestion", status: "completed", progress: 100, file_path: "company_handbook.pdf", start_time: new Date().toISOString(), message: "Successfully indexed" },
      { task_id: "t_124", task_type: "ingestion", status: "processing", progress: 45, file_path: "project_specs.docx", start_time: new Date().toISOString(), message: "Generating embeddings..." },
      { task_id: "t_125", task_type: "deletion", status: "pending", progress: 0, file_path: "old_doc.pdf", start_time: new Date().toISOString(), message: "Waiting in queue" },
    ];
    const response = await fetchWithMockFallback('/tasks/recent', {}, { success: true, tasks: mockTasks });
    return response;
  },

  // Query
  query: async (question: string, limit: number = 3): Promise<ApiResponse<any>> => {
    // Mock RAG response
    const mockResponse = {
      success: true,
      answer: "Based on the provided documents, the project specifications require a modular architecture using React and Python. The system must support real-time updates and robust error handling as detailed in section 4.2 of the technical requirements.",
      retrieval_time: 0.15,
      generation_time: 1.2,
      total_time: 1.35,
      retrieved_texts: [
        { text: "Section 4.2: Technical Requirements. The system shall be built using a React frontend and Python FastAPI backend.", distance: 0.85, source: "project_specs.docx" },
        { text: "Real-time capabilities are essential for the task monitoring dashboard.", distance: 0.78, source: "project_specs.docx" },
        { text: "Error handling must be implemented at both the service and UI layers.", distance: 0.72, source: "architecture_guidelines.pdf" }
      ]
    };
    
    return fetchWithMockFallback('/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, limit })
    }, mockResponse);
  }
};