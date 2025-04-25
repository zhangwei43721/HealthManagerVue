/**
 * iOS设备菜单修复混入
 * 解决iOS设备上点击菜单触发mouseleave事件的bug
 */
export default {
  computed: {
    /**
     * 获取当前设备类型
     * @returns {string} 设备类型 ('mobile'或'desktop')
     */
    device() {
      return this.$store.state.app.device
    }
  },
  mounted() {
    // 组件挂载后立即修复iOS设备上的bug
    this.fixBugIniOS()
  },
  methods: {
    /**
     * 修复iOS设备上的菜单mouseleave事件bug
     * 在移动设备上阻止菜单的自动关闭行为
     */
    fixBugIniOS() {
      try {
        const $subMenu = this.$refs.subMenu
        if ($subMenu && $subMenu.handleMouseleave) {
          const handleMouseleave = $subMenu.handleMouseleave
          $subMenu.handleMouseleave = (e) => {
            // 在移动设备上不触发mouseleave事件处理
            if (this.device === 'mobile') {
              return
            }
            handleMouseleave(e)
          }
        }
      } catch (error) {
        console.error('修复iOS菜单bug时出错:', error)
      }
    }
  }
}
