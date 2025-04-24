<template>
  <!-- 外部图标模式 -->
  <div 
    v-if="isExternal" 
    :style="styleExternalIcon" 
    class="svg-external-icon svg-icon" 
    v-on="$listeners" 
  />
  <!-- SVG图标模式 -->
  <svg 
    v-else 
    :class="svgClass" 
    aria-hidden="true" 
    v-on="$listeners"
  >
    <use :xlink:href="iconName" />
  </svg>
</template>

<script>
/**
 * SVG图标组件
 * 支持两种模式：
 * 1. 内部SVG图标（使用图标ID引用）
 * 2. 外部图标（使用完整URL引用）
 */
import { isExternal } from '@/utils/validate'

export default {
  name: 'SvgIcon',
  props: {
    /**
     * 图标类名或URL
     * 如果是内部图标，则为图标ID（不包含'icon-'前缀）
     * 如果是外部图标，则为完整URL路径
     */
    iconClass: {
      type: String,
      required: true
    },
    /**
     * 额外的CSS类名
     * 用于自定义图标样式
     */
    className: {
      type: String,
      default: ''
    }
  },
  computed: {
    /**
     * 判断是否为外部图标
     * @returns {boolean} 如果是URL格式则返回true
     */
    isExternal() {
      return isExternal(this.iconClass)
    },
    /**
     * 生成内部图标的完整ID
     * @returns {string} 带前缀的图标ID
     */
    iconName() {
      return `#icon-${this.iconClass}`
    },
    /**
     * 生成SVG的CSS类名
     * @returns {string} 组合后的CSS类名
     */
    svgClass() {
      return this.className ? `svg-icon ${this.className}` : 'svg-icon'
    },
    /**
     * 生成外部图标的样式对象
     * 使用CSS mask属性显示外部图标
     * @returns {Object} 样式对象
     */
    styleExternalIcon() {
      return {
        mask: `url(${this.iconClass}) no-repeat 50% 50%`,
        '-webkit-mask': `url(${this.iconClass}) no-repeat 50% 50%`
      }
    }
  }
}
</script>

<style scoped>
.svg-icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
  fill: currentColor;
  overflow: hidden;
}

.svg-external-icon {
  background-color: currentColor;
  mask-size: cover!important;
  display: inline-block;
}
</style>
