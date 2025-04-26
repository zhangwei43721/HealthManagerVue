const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  menuList: state => state.user.menuList,
  userId: state => state.user.userId,
  healthData: state => state.user.healthData,
  healthModel: state => state.user.healthModel,
  healthSuggestions: state => state.user.healthSuggestions,
  
  // 获取特定页面的健康建议的便捷方法
  getPageSuggestion: state => page => state.user.healthSuggestions[page] || null,

  visitedViews: state => state.tagsView.visitedViews,
  cachedViews: state => state.tagsView.cachedViews,   
  permission_routes: state => state.permission.routes
}

export default getters
