<template>
  <transition name="bubble-container-fade">
    <div class="report-bubble-container" v-if="isLoggedIn && showBubble">
    <!-- 回形针图标 -->
    <div class="paperclip-icon" @click="toggleExpanded">
      <svg width="32" height="32" viewBox="0 0 32 32">
        <path d="M22,4V28H20V4H22M12,8V28H10V8H12M17,12V28H15V12H17Z" fill="#1976D2"/>
        <path d="M6,16V28H4V16H6Z" fill="#1976D2"/>
      </svg>
    </div>
    
    <!-- 气泡提示框 -->
    <transition name="bubble-fade" mode="out-in">
      <div v-if="expanded" class="report-bubble">
        <!-- 气泡尖角 -->
        <div class="bubble-arrow"></div>
        
        <!-- 气泡内容 -->
        <div class="bubble-content">
          <div class="bubble-header">
            <span class="bubble-title">AI健康建议</span>
            <button class="close-btn" @click="expanded = false">×</button>
          </div>
          
          <div class="bubble-body">
            <transition name="content-fade" mode="out-in">
              <div v-if="loading" key="loading" class="loading-indicator">
                <span class="dot"></span>
                <span class="dot"></span>
                <span class="dot"></span>
                <span>正在生成建议...</span>
              </div>
              <div v-else key="content" class="suggestion-text markdown-content" v-html="formatSuggestion(currentSuggestion)"></div>
            </transition>
          </div>
          
          <div class="bubble-footer">
            <span class="timestamp" v-if="generatedAt">{{ formatDate(generatedAt) }}</span>
            <button class="refresh-btn" @click="fetchCurrentPageSuggestion" :disabled="loading">
              <i class="el-icon-refresh"></i>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
  </transition>
</template>

<script>
import axios from 'axios';
import { mapGetters } from 'vuex';
import { parseMarkdown } from '@/utils/markdownParser';

export default {
  name: 'ReportSuggestionBubble',
  data() {
    return {
      expanded: false,
      loading: false,
      currentSuggestion: '',
      generatedAt: null,
      currentRoute: '',
      showBubble: false
    };
  },
  computed: {
    ...mapGetters([
      'token',
      'userId'
    ]),
    isLoggedIn() {
      return !!this.token;
    },
    // 根据当前路由判断应该显示哪种建议
    suggestionType() {
      const path = this.$route.path;
      
      if (path.includes('/health/assessment')) {
        return 'current';
      } else if (path.includes('/health/knowledge')) {
        return 'sport';
      } else if (path.includes('/health/log')) {
        return 'historical';
      }
      
      return null;
    }
  },
  watch: {
    // 监听路由变化，自动获取对应页面的建议
    '$route'(to) {
      this.currentRoute = to.path;
      // 只在三个特定页面显示气泡
      this.showBubble = this.shouldShowBubble(to.path);
      
      // 在知识库页面自动展开气泡
      if (to.path.includes('/health/knowledge')) {
        this.expanded = true;
      }
      
      if (this.showBubble && this.expanded) {
        this.fetchCurrentPageSuggestion();
      }
    }
  },
  mounted() {
    // 初始化当前路由
    this.currentRoute = this.$route.path;
    // 判断是否应该显示气泡
    this.showBubble = this.shouldShowBubble(this.currentRoute);
    
    // 如果是知识库页面，自动展开气泡
    if (this.currentRoute.includes('/health/knowledge')) {
      this.expanded = true;
    }
    
    // 如果是相关页面，预加载建议内容
    if (this.showBubble) {
      this.fetchCurrentPageSuggestion();
    }
  },
  methods: {
    shouldShowBubble(path) {
      return path.includes('/health/assessment') || 
             path.includes('/health/knowledge') || 
             path.includes('/health/log');
    },
    toggleExpanded() {
      this.expanded = !this.expanded;
      
      // 如果展开且没有内容，则获取建议
      if (this.expanded && !this.currentSuggestion) {
        this.fetchCurrentPageSuggestion();
      }
    },
    fetchCurrentPageSuggestion() {
      // 如果不在三个特定页面之一，不获取建议
      if (!this.suggestionType) return;
      
      // 重置当前建议和时间戳，触发动画效果
      this.currentSuggestion = '';
      this.generatedAt = null;
      this.loading = true;
      
      axios.get(`${process.env.VUE_APP_BASE_API}/ai-suggestions-specific/${this.suggestionType}`, {
        headers: {
          'X-Token': this.token
        }
      })
        .then(response => {
          if ((response.data.code === 0 || response.data.code === 20000) && response.data.data) {
            this.currentSuggestion = response.data.data.suggestion || '暂无建议';
            
            // 处理日期时间格式
            if (Array.isArray(response.data.data.generatedAt)) {
              // 处理数组格式的时间 [year, month, day, hour, minute, second]
              const [year, month, day, hour, minute, second] = response.data.data.generatedAt;
              this.generatedAt = new Date(year, month - 1, day, hour, minute, second).toISOString();
            } else {
              this.generatedAt = response.data.data.generatedAt;
            }
          } else {
            this.currentSuggestion = '暂无建议';
            this.generatedAt = null;
          }
        })
        .catch(error => {
          console.error('获取健康建议失败:', error);
          this.currentSuggestion = '获取建议失败，请稍后再试';
        })
        .finally(() => {
          this.loading = false;
        });
    },
    formatDate(dateString) {
      if (!dateString) return '';
      
      const date = new Date(dateString);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    },
    formatSuggestion(text) {
      if (!text) return '';
      
      // 使用markdownParser解析Markdown内容
      return parseMarkdown(text);
    }
  }
};
</script>

<style lang="scss" scoped>
$primary-color: #42b983;
$bubble-bg: #f8f9fa;
$border-color: #e0e6ed;
$text-color: #2c3e50;
$shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

.report-bubble-container {
  position: fixed;
  right: 20px;
  bottom: 20px; /* 改回到屏幕右下角 */
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  transform-origin: center right;
}

.paperclip-icon {
  width: 40px;
  height: 40px;
  background-color: white;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  box-shadow: $shadow;
  transition: all 0.3s ease;
  margin-left: 15px;
  animation: bounce 1s ease-in-out;
  order: 2; /* 改变显示顺序，让气泡显示在左边 */
  
  &:hover {
    transform: scale(1.1);
  }
}

@keyframes bounce {
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.2); }
  70% { transform: scale(0.9); }
  100% { transform: scale(1); opacity: 1; }
}

.report-bubble {
  position: relative;
  max-width: 400px;
  background-color: $bubble-bg;
  border-radius: 12px;
  box-shadow: $shadow;
  margin-right: 15px;
  border: 1px solid $border-color;
  overflow: hidden;
}

.bubble-arrow {
  position: absolute;
  bottom: 20px;
  right: -10px;
  width: 0;
  height: 0;
  border-top: 10px solid transparent;
  border-bottom: 10px solid transparent;
  border-left: 10px solid $bubble-bg;
  
  &:after {
    content: '';
    position: absolute;
    top: -10px;
    left: -11px;
    width: 0;
    height: 0;
    border-top: 10px solid transparent;
    border-bottom: 10px solid transparent;
    border-left: 10px solid $border-color;
    z-index: -1;
  }
}

.bubble-content {
  display: flex;
  flex-direction: column;
}

.bubble-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background-color: $primary-color;
  color: white;
  
  .bubble-title {
    font-weight: 600;
    font-size: 16px;
  }
  
  .close-btn {
    background: transparent;
    border: none;
    color: white;
    font-size: 20px;
    cursor: pointer;
    padding: 0;
    line-height: 1;
    
    &:hover {
      opacity: 0.8;
    }
  }
}

.bubble-body {
  padding: 15px;
  min-height: 100px;
  max-height: 400px;
  overflow-y: auto;
  
  .suggestion-text {
    font-size: 14px;
    line-height: 1.5;
    color: $text-color;
  }
  
  .markdown-content {
    :deep(.markdown-body) {
      h1, h2, h3 {
        margin-top: 12px;
        margin-bottom: 8px;
        font-weight: 600;
      }
      
      h1 { font-size: 18px; }
      h2 { font-size: 16px; }
      h3 { font-size: 15px; }
      
      ul, ol {
        padding-left: 20px;
        margin-bottom: 10px;
      }
      
      p {
        margin-bottom: 8px;
      }
      
      blockquote {
        padding-left: 10px;
        border-left: 3px solid $primary-color;
        color: #666;
        margin: 8px 0;
      }
      
      hr {
        border: none;
        border-top: 1px solid $border-color;
        margin: 10px 0;
      }
    }
  }
  
  .loading-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100px;
    
    .dot {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: $primary-color;
      margin: 0 3px;
      animation: dot-pulse 1.4s infinite ease-in-out;
      
      &:nth-child(1) {
        animation-delay: 0s;
      }
      
      &:nth-child(2) {
        animation-delay: 0.2s;
      }
      
      &:nth-child(3) {
        animation-delay: 0.4s;
      }
    }
    
    span:not(.dot) {
      margin-left: 10px;
      color: $text-color;
    }
  }
}

.bubble-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 15px;
  border-top: 1px solid $border-color;
  background-color: #f0f2f5;
  
  .timestamp {
    font-size: 12px;
    color: #666;
  }
  
  .refresh-btn {
    background: transparent;
    border: none;
    color: $primary-color;
    cursor: pointer;
    padding: 5px;
    transition: transform 0.3s ease;
    
    &:hover:not(:disabled) {
      transform: rotate(180deg);
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}

// 动画效果
.bubble-fade-enter-active {
  transition: opacity 0.4s, transform 0.4s;
}

.bubble-fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.bubble-fade-enter, .bubble-fade-leave-to {
  opacity: 0;
  transform: scale(0.8);
  transform-origin: center right;
}

// 内容切换动画
.content-fade-enter-active, .content-fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.content-fade-enter, .content-fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
  transform-origin: center;
}

// 容器动画效果
.bubble-container-fade-enter-active {
  transition: opacity 0.5s, transform 0.5s;
  transition-delay: 0.3s;
}

.bubble-container-fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.bubble-container-fade-enter, .bubble-container-fade-leave-to {
  opacity: 0;
  transform: scale(0.9);
  transform-origin: center right;
}

@keyframes dot-pulse {
  0%, 80%, 100% { 
    transform: scale(0);
  }
  40% { 
    transform: scale(1.0);
  }
}
</style>
