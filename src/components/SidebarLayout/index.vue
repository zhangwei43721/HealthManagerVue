<template>
  <div class="sidebar-container" :class="{'has-logo':showLogo}">
    <!-- 显示Logo组件，确保始终显示 -->
    <logo v-if="showLogo" :collapse="isCollapse" />
    
    <!-- 使用el-scrollbar并设置样式确保默认展开 -->
    <el-scrollbar wrap-class="scrollbar-wrapper" class="sidebar-scrollbar">
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :background-color="variables.menuBg"
        :text-color="variables.menuText"
        :unique-opened="false"
        :active-text-color="variables.menuActiveText"
        :collapse-transition="false"
        :default-openeds="defaultOpeneds"
        mode="vertical"
      >
        <!-- 渲染菜单项，为每个路由创建一个sidebar-item组件 -->
        <sidebar-item 
          v-for="route in routes" 
          :key="route.path" 
          :item="route" 
          :base-path="route.path" 
        />
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script>
/**
 * 侧边栏组件
 * 负责显示应用的导航菜单，支持折叠/展开、高亮当前路由等功能
 */
import { mapGetters } from 'vuex'
import Logo from './Logo'
import SidebarItem from './SidebarItem'
import variables from '@/styles/variables.scss'

export default {
  name: 'Sidebar',
  components: { SidebarItem, Logo },
  data() {
    return {
      // 默认展开的菜单列表，自动展开所有菜单
      defaultOpeneds: []
    }
  },
  
  methods: {
    /**
     * 生成默认展开的菜单ID列表
     * 递归遍历菜单树，提取所有菜单项的ID
     */
    generateDefaultOpeneds() {
      // 监听菜单数据变化，当数据加载完成后生成默认展开列表
      this.$watch(
        'routes',
        (newRoutes) => {
          if (newRoutes && newRoutes.length > 0) {
            this.defaultOpeneds = this.getMenuIds(newRoutes);
          }
        },
        { immediate: true }
      );
    },
    
    /**
     * 递归提取菜单ID
     * @param {Array} menus 菜单数组
     * @returns {Array} ID数组
     */
    getMenuIds(menus) {
      const ids = [];
      if (!menus || menus.length === 0) return ids;
      
      menus.forEach(menu => {
        if (menu.path) {
          ids.push(menu.path);
        }
        if (menu.children && menu.children.length > 0) {
          ids.push(...this.getMenuIds(menu.children));
        }
      });
      
      return ids;
    }
  },
  
  created() {
    // 初始化时自动生成默认展开的菜单ID列表
    this.generateDefaultOpeneds()
  },
  computed: {
    ...mapGetters([
      'sidebar',
      'menuList'
    ]),
    /**
     * 获取路由列表
     * @returns {Array} 菜单路由数组
     */
    routes() {
      // 确保即使menuList为空也返回一个数组
      return this.menuList || [];
    },
    /**
     * 获取当前激活的菜单项
     * @returns {string} 当前激活的菜单路径
     */
    activeMenu() {
      const route = this.$route
      const { meta, path } = route
      // 如果路由元数据中设置了activeMenu，则使用它来高亮菜单
      if (meta && meta.activeMenu) {
        return meta.activeMenu
      }
      // 否则使用当前路径
      return path
    },
    /**
     * 是否显示Logo
     * @returns {boolean} 是否显示Logo
     */
    showLogo() {
      return this.$store.state.settings.sidebarLogo
    },
    /**
     * 获取样式变量
     * @returns {Object} SCSS变量对象
     */
    variables() {
      return variables
    },
    /**
     * 侧边栏是否折叠
     * @returns {boolean} 是否折叠
     */
    isCollapse() {
      return !this.sidebar.opened
    }
  }
}
</script>

<style lang="scss" scoped>
.sidebar-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  
  // 确保logo区域正确显示
  .sidebar-logo-container {
    flex-shrink: 0;
  }
  
  // 滚动区域样式优化
  .sidebar-scrollbar {
    flex: 1;
    overflow: hidden;
    
    // 确保滚动条默认展开
    ::v-deep .scrollbar-wrapper {
      overflow-x: hidden !important;
      
      // 自定义滚动条样式
      &::-webkit-scrollbar {
        width: 6px;
      }
      
      &::-webkit-scrollbar-thumb {
        background-color: rgba(144, 147, 153, 0.3);
        border-radius: 3px;
      }
      
      // 确保菜单项正确显示
      .el-menu {
        border: none;
        width: 100%;
      }
    }
    
    // 修复el-scrollbar在某些浏览器下的兼容性问题
    ::v-deep .el-scrollbar__bar.is-vertical {
      right: 0;
    }
    
    ::v-deep .el-scrollbar__view {
      height: 100%;
    }
  }
}
</style>
