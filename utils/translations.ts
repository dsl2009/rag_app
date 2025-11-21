
export const translations = {
  en: {
    common: {
      delete: "Delete",
      cancel: "Cancel",
      confirm: "Confirm",
      success: "Success",
      error: "Error",
      loading: "Loading...",
      refresh: "Refresh",
      actions: "Actions",
      noData: "No data available",
      processing: "Processing",
      completed: "Completed",
      failed: "Failed",
      pending: "Pending",
      unknown: "Unknown"
    },
    sidebar: {
      title: "Knowledge",
      subtitle: "Admin Dashboard",
      status: "API Status: Connected",
      fileUpload: "File Upload",
      knowledgeBase: "Knowledge Base",
      taskMonitor: "Task Monitor",
      chat: "Q&A Chat"
    },
    fileUpload: {
      title: "File Management",
      subtitle: "Upload and organize your raw documents.",
      dragDrop: "Drag & drop or click to browse",
      uploading: "Uploading...",
      dropHere: "Drop file here",
      uploadNew: "Upload New File",
      supportText: "Support PDF, DOCX, TXT.",
      availableFiles: "Available Files",
      processFiles: "Process {{count}} Files",
      noFiles: "No files uploaded yet",
      noFilesSub: "Upload documents to get started",
      fileName: "File Name",
      size: "Size",
      modified: "Modified",
      uploadSuccess: "Successfully uploaded {{name}}",
      deleteConfirm: "Are you sure you want to delete this file?",
      addToKbSuccess: "Added {{count}} files to processing queue"
    },
    knowledgeBase: {
      title: "Knowledge Base",
      subtitle: "Manage your processed documents and vector indices.",
      deleteSelected: "Delete Selected ({{count}})",
      stats: {
        documents: "Documents",
        totalChunks: "Total Chunks",
        activeIndex: "Active Index",
        processing: "Processing"
      },
      table: {
        docName: "Document Name",
        status: "Status",
        chunks: "Chunks",
        type: "Type",
        indexedDate: "Indexed Date",
        emptyTitle: "Knowledge Base is empty",
        emptySub: "Upload and process files to see them here"
      },
      deleteConfirm: "Delete {{count}} documents from Knowledge Base?"
    },
    taskMonitor: {
      title: "Task Monitor",
      subtitle: "Track ingestion and background processes.",
      autoRefresh: "Auto-refresh",
      chartTitle: "Task Status Distribution",
      recentActivity: "Recent Activities",
      progress: "Progress",
      started: "Started",
      noTasks: "No recent tasks"
    },
    chat: {
      assistantName: "AI Assistant",
      online: "Online",
      clearChat: "Clear Chat",
      welcomeTitle: "How can I help you today?",
      welcomeSub: "Ask questions about your uploaded documents.",
      inputPlaceholder: "Ask anything regarding your knowledge base...",
      disclaimer: "AI generated responses can be inaccurate. Please verify important information.",
      you: "You",
      viewSources: "View {{count}} Sources",
      relevance: "Relevance",
      unknownSource: "Unknown Source",
      errorResponse: "Sorry, I encountered an error processing your request."
    }
  },
  zh: {
    common: {
      delete: "删除",
      cancel: "取消",
      confirm: "确认",
      success: "成功",
      error: "错误",
      loading: "加载中...",
      refresh: "刷新",
      actions: "操作",
      noData: "暂无数据",
      processing: "处理中",
      completed: "已完成",
      failed: "失败",
      pending: "等待中",
      unknown: "未知"
    },
    sidebar: {
      title: "知识库",
      subtitle: "管理控制台",
      status: "API 状态: 已连接",
      fileUpload: "文件上传",
      knowledgeBase: "知识库管理",
      taskMonitor: "任务监控",
      chat: "智能问答"
    },
    fileUpload: {
      title: "文件管理",
      subtitle: "上传并整理您的原始文档。",
      dragDrop: "拖拽或点击上传文件",
      uploading: "上传中...",
      dropHere: "释放文件",
      uploadNew: "上传新文件",
      supportText: "支持 PDF, DOCX, TXT 格式",
      availableFiles: "文件列表",
      processFiles: "处理 {{count}} 个文件",
      noFiles: "暂无文件",
      noFilesSub: "请上传文档以开始使用",
      fileName: "文件名",
      size: "大小",
      modified: "修改时间",
      uploadSuccess: "成功上传 {{name}}",
      deleteConfirm: "确定要删除此文件吗？",
      addToKbSuccess: "已将 {{count}} 个文件加入处理队列"
    },
    knowledgeBase: {
      title: "知识库管理",
      subtitle: "管理已处理文档及向量索引。",
      deleteSelected: "删除选中 ({{count}})",
      stats: {
        documents: "文档总数",
        totalChunks: "切片总数",
        activeIndex: "活跃索引",
        processing: "处理中"
      },
      table: {
        docName: "文档名称",
        status: "状态",
        chunks: "切片数",
        type: "类型",
        indexedDate: "索引时间",
        emptyTitle: "知识库为空",
        emptySub: "上传并处理文件后将在此显示"
      },
      deleteConfirm: "确定从知识库删除 {{count}} 个文档吗？"
    },
    taskMonitor: {
      title: "任务监控",
      subtitle: "追踪文档解析与后台处理进度。",
      autoRefresh: "自动刷新",
      chartTitle: "任务状态分布",
      recentActivity: "近期活动",
      progress: "进度",
      started: "开始于",
      noTasks: "暂无近期任务"
    },
    chat: {
      assistantName: "AI 助手",
      online: "在线",
      clearChat: "清空对话",
      welcomeTitle: "今天有什么可以帮您？",
      welcomeSub: "关于您的文档，尽情提问。",
      inputPlaceholder: "输入关于知识库的问题...",
      disclaimer: "AI 生成的内容可能不准确，请核实重要信息。",
      you: "您",
      viewSources: "查看 {{count}} 个来源",
      relevance: "相关度",
      unknownSource: "未知来源",
      errorResponse: "抱歉，处理您的请求时遇到错误。"
    }
  }
};
