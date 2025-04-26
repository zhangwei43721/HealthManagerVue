<template>
  <!-- tags-view 区域已被移除 -->
</template>

<script>
import ScrollPane from '../TagsViewLayout/ScrollPane.vue'
export default {
  name: 'TagsView',
  components: { ScrollPane },
  data() {
    return {
      visible: false,
      top: 0,
      left: 0,
      selectedTag: {},
    }
  },
  computed: {
    visitedViews() {
      return this.$store.state.tagsView.visitedViews
    }
  },
  methods: {
    isActive(tag) {
      return tag.path === this.$route.path
    },
    isAffix(tag) {
      return tag.meta && tag.meta.affix
    },
    handleScroll() {},
    openMenu(tag, e) {
      this.visible = true
      this.selectedTag = tag
      this.left = e.clientX
      this.top = e.clientY
      document.body.addEventListener('click', this.closeMenu)
    },
    closeMenu() {
      this.visible = false
      document.body.removeEventListener('click', this.closeMenu)
    },
    closeSelectedTag(tag) {
      this.$store.dispatch('tagsView/delView', tag)
    },
    closeOthersTags() {
      this.$store.dispatch('tagsView/delOthersViews', this.selectedTag)
      this.closeMenu()
    },
    closeAllTags() {
      this.$store.dispatch('tagsView/delAllViews')
      this.closeMenu()
    }
  }
}
</script>

<style scoped>
.tags-view-container {
  background: #fff;
  border-bottom: 1px solid #d8dce5;
  height: 34px;
  line-height: 34px;
  position: relative;
  user-select: none;
}
.tags-view-wrapper {
  height: 34px;
  white-space: nowrap;
  overflow-x: auto;
  overflow-y: hidden;
}
.tags-view-item {
  display: inline-block;
  height: 26px;
  line-height: 26px;
  border-radius: 2px;
  color: #495060;
  background: #f5f7fa;
  margin: 4px 4px 0 0;
  padding: 0 10px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}
.tags-view-item.active {
  background: #409eff;
  color: #fff;
}
.tags-view-item .el-icon-close {
  margin-left: 8px;
  font-size: 12px;
  cursor: pointer;
}
.contextmenu {
  position: absolute;
  list-style-type: none;
  padding: 5px 0;
  margin: 0;
  background: #fff;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
  border-radius: 2px;
  font-size: 14px;
  z-index: 1000;
}
.contextmenu li {
  padding: 0 20px;
  height: 28px;
  line-height: 28px;
  cursor: pointer;
}
.contextmenu li:hover {
  background: #ecf5ff;
  color: #409eff;
}
</style>
