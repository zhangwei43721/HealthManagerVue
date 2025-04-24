import request from '@/utils/request'

// AI健康问答 - SSE流式接口
export function chatStream(question) {
  // 拼接 baseURL，确保 EventSource 能正确请求后端
  // 从环境变量读取 base URL，由 Vue CLI 在构建时内联
  const base = process.env.VUE_APP_BASE_API;
  return `${base}/chatStream?question=${encodeURIComponent(question)}`;
}
