import request from '@/utils/request'

// AI健康问答 - SSE流式接口 (已由ai-qa.vue直接访问，这里提供为参考)
export function chatStream(question, conversationId) {
  // 拼接 baseURL，确保 EventSource 能正确请求后端
  // 从环境变量读取 base URL，由 Vue CLI 在构建时内联
  const base = process.env.VUE_APP_BASE_API;
  let url = `${base}/chatStream?question=${encodeURIComponent(question)}`;
  if (conversationId) {
    url += `&conversationId=${encodeURIComponent(conversationId)}`;
  }
  return url;
}

// 获取聊天历史记录
export function getChatHistory() {
  return request({
    url: '/viewHistory',
    method: 'get'
  });
}

// 重置聊天历史记录
export function resetChatHistory(conversationId) {
  return request({
    url: '/resetHistory',
    method: 'get',
    params: conversationId ? { conversationId } : {}
  });
}

// 生成用户健康模型
export function generateHealthModel(userId, healthData) {
  return request({
    url: '/ai/generate-health-model',
    method: 'post',
    data: {
      userId,
      healthData
    }
  });
}

// 基于健康模型为特定页面生成建议
export function generatePageSuggestion(userId, healthModel, page) {
  return request({
    url: '/ai/generate-page-suggestion',
    method: 'post',
    data: {
      userId,
      healthModel,
      page
    }
  });
}

// 直接获取特定页面的健康建议（不需要提供健康模型）
export function getPageSuggestion(userId, page) {
  return request({
    url: '/ai/page-suggestion',
    method: 'get',
    params: {
      userId,
      page
    }
  });
}

// 更新用户的健康模型（如有新数据）
export function updateHealthModel(userId, newHealthData) {
  return request({
    url: '/ai/update-health-model',
    method: 'put',
    data: {
      userId,
      newHealthData
    }
  });
}
