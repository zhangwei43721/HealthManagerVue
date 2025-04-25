<template>
  <section class="app-main">
    <!-- 页面切换动画效果 -->
    <transition name="fade-transform" mode="out-in">
      <!-- 缓存页面视图，提高性能 -->
      <keep-alive :include="cachedViews">
        <!-- 路由视图，使用路由路径作为key确保组件正确重新渲染 -->
        <router-view :key="key" />
      </keep-alive>
    </transition>
  </section>
</template>

<script>
/**
 * 主内容区组件
 * 负责显示当前路由对应的页面内容
 * 支持页面缓存和过渡动画
 */
export default {
  name: 'AppMain',
  computed: {
    /**
     * 路由视图的唯一标识符
     * 用于强制组件重新渲染
     * @returns {string} 当前路由路径
     */
    key() {
      return this.$route.path
    },
    /**
     * 需要缓存的视图列表
     * 从状态管理中获取需要缓存的视图名称
     * @returns {Array} 缓存的视图名称数组
     */
    cachedViews() {
      return this.$store.state.tagsView.cachedViews || []
    }
  }
}
</script>

<style scoped>
.app-main {
  /* 50px = 导航栏高度 */
  min-height: calc(100vh - 50px);
  width: 100%;
  position: relative;
  overflow: hidden;
  background-color: #f8f9fa;
  font-family: 'Helvetica Neue', Arial, sans-serif;
}
.fixed-header+.app-main {
  padding-top: 50px;
}
</style>

<style lang="scss">
// fix css style bug in open el-dialog
.el-popup-parent--hidden {
  .fixed-header {
    padding-right: 15px;
  }
}
</style>
