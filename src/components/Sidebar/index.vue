<template>
  <div class="sidebar-container" :class="{'has-logo':showLogo}">
    <!-- 显示Logo组件，确保始终显示 -->
    <logo v-if="showLogo" :collapse="isCollapse" />
    <el-scrollbar wrap-class="scrollbar-wrapper" class="sidebar-scrollbar">
      <el-menu
        :default-active="activeMenu"
        :default-openeds="defaultOpeneds"
        :collapse="isCollapse"
        :background-color="variables.menuBg"
        :text-color="variables.menuText"
        :unique-opened="false"
        :active-text-color="variables.menuActiveText"
        :collapse-transition="false"
      >
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
import { mapGetters } from 'vuex'
import Logo from '../SidebarLayout/Logo.vue'
import SidebarItem from '../SidebarLayout/SidebarItem.vue'
import variables from '@/styles/variables.scss'

export default {
  name: 'Sidebar',
  components: { SidebarItem, Logo },
  computed: {
    ...mapGetters([
      'sidebar',
      'menuList'
    ]),
    routes() {
      return this.menuList || [];
    },
    isCollapse() {
      return !this.sidebar.opened
    },
    activeMenu() {
      const route = this.$route
      const { meta, path } = route
      if (meta && meta.activeMenu) {
        return meta.activeMenu
      }
      return path
    },
    showLogo() {
      return this.$store.state.settings.sidebarLogo
    },
    variables() {
      return variables
    }
  },
  data() {
    return {
      defaultOpeneds: []
    }
  },
  created() {
    this.generateDefaultOpeneds()
  },
  methods: {
    generateDefaultOpeneds() {
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
  }
}
</script>

<style lang="scss" scoped>
.sidebar-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  .sidebar-logo-container {
    flex-shrink: 0;
  }
  .sidebar-scrollbar {
    flex: 1;
    overflow: hidden;
    ::v-deep .scrollbar-wrapper {
      overflow-x: hidden !important;
      &::-webkit-scrollbar {
        width: 6px;
      }
      &::-webkit-scrollbar-thumb {
        background-color: rgba(144, 147, 153, 0.3);
        border-radius: 3px;
      }
      .el-menu {
        border: none;
        width: 100%;
      }
    }
    ::v-deep .el-scrollbar__bar.is-vertical {
      right: 0;
    }
    ::v-deep .el-scrollbar__view {
      height: 100%;
    }
  }
}
</style>
