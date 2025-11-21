// 定义全局配置接口
interface AppConfig {
  API_BASE_URL?: string;
  MOCK_DELAY?: number;
}

// 安全地获取全局配置
const getConfig = (): AppConfig => {
  if (typeof window !== 'undefined' && (window as any).APP_CONFIG) {
    return (window as any).APP_CONFIG;
  }
  return {};
};

const config = getConfig();

export const API_BASE_URL = config.API_BASE_URL || "http://localhost:8000";

export const MOCK_DELAY = config.MOCK_DELAY ?? 800; // Simulate network latency for mock data

export const STATUS_COLORS = {
  completed: "bg-green-100 text-green-700 border-green-200",
  processing: "bg-blue-100 text-blue-700 border-blue-200",
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  failed: "bg-red-100 text-red-700 border-red-200",
  cancelled: "bg-gray-100 text-gray-700 border-gray-200",
};

export const FILE_TYPE_ICONS: Record<string, string> = {
  pdf: "file-text",
  txt: "file",
  docx: "file-type-doc",
  doc: "file-type-doc",
  md: "file-code",
  html: "globe",
};