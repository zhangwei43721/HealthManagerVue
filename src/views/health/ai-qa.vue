<template>
  <transition name="chat-fade">
    <div v-if="visible" class="ai-chat-container ai-chat-popup">
      <!-- 关闭按钮 -->
      <button class="ai-chat-close" @click="$emit('close')" title="关闭">×</button>
      <el-card class="ai-chat-card" :body-style="{ padding: '0' }">
      <!-- 聊天头部 -->
      <div class="ai-chat-header">
        <div class="ai-assistant-info">
          <el-avatar :size="40" icon="el-icon-s-custom" :style="{ background: '#42b983' }" />
          <div class="ai-assistant-details">
            <h2 class="ai-chat-title">AI健康问答助手</h2>
            <span class="ai-status" :class="{ 'online': !loading }">
              {{ loading ? '思考中...' : '在线，随时为您解答' }}
            </span>
          </div>
        </div>
        <el-tooltip content="清空对话历史" placement="top">
          <el-button 
            type="text" 
            icon="el-icon-delete" 
            class="clear-btn" 
            :disabled="messages.length === 0 || loading"
            @click="clearMessages"
          />
        </el-tooltip>
      </div>

      <!-- 聊天消息区域 -->
      <div class="ai-chat-messages" ref="msgBox">
        <transition-group name="message-fade">
          <!-- 欢迎消息 -->
          <div v-if="messages.length === 0" key="welcome" class="welcome-container">
            <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f916.svg" class="robot-icon" alt="AI机器人" />
            <h3>您好！我是您的健康顾问</h3>
            <p>您可以向我咨询任何健康相关的问题，例如：</p>
            <div class="suggestion-chips">
              <div class="chip" @click="useExample('如何保持健康的生活方式？')">如何保持健康的生活方式？</div>
              <div class="chip" @click="useExample('每天应该喝多少水？')">每天应该喝多少水？</div>
              <div class="chip" @click="useExample('如何改善睡眠质量？')">如何改善睡眠质量？</div>
              <div class="chip" @click="useExample('运动后肌肉酸痛怎么缓解？')">运动后肌肉酸痛怎么缓解？</div>
            </div>
          </div>

          <!-- 消息列表 -->
          <div 
            v-for="(msg, idx) in messages" 
            :key="'msg-'+idx" 
            :class="['ai-msg', msg.role]"
          >
            <el-avatar 
              v-if="msg.role === 'user'" 
              icon="el-icon-user-solid" 
              :size="36" 
              class="msg-avatar"
            />
            <el-avatar 
              v-else 
              icon="el-icon-s-custom" 
              :size="36" 
              class="msg-avatar"
              :style="{ background: '#42b983' }" 
            />
            <div class="ai-msg-bubble">
              <div class="ai-msg-content" v-html="formatMessage(msg.content)"></div>
              <div class="msg-time">{{ msg.time || getCurrentTime() }}</div>
            </div>
          </div>
        </transition-group>
        
        <!-- 打字指示器 -->
        <div class="typing-indicator" v-if="isTyping">
          <el-avatar :size="36" icon="el-icon-s-custom" :style="{ background: '#42b983' }" class="msg-avatar" />
          <div class="ai-msg-bubble typing">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
          </div>
        </div>
      </div>
      
      <!-- 输入区域 -->
      <div class="ai-chat-input">
        <el-input
          class="message-input"
          type="textarea"
          v-model="input"
          :rows="1"
          autosize
          :maxlength="500"
          placeholder="请输入您的健康问题..."
          :disabled="loading"
        >
          <template slot="append">
            <el-button 
              :loading="loading" 
              :disabled="!input.trim()"
              @click="sendMsg"
            >
              发送
            </el-button>
          </template>
        </el-input>
        <div class="input-tips" v-if="input.length > 0">
          按Enter发送，Shift+Enter换行
        </div>
      </div>
    </el-card>
  </div>
  </transition>
</template>

<script>
import { escapeHtml, parseInline, parseMarkdown } from '@/utils/markdownParser';

export default {
  name: 'AiHealthQA',
  props: {
    visible: {
      type: Boolean,
      default: true
    },
    pageName: {
      type: String,
      default: ''
    },
    showPreGeneratedAdvice: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      input: '',
      messages: [],
      loading: false,
      isTyping: false, // 打字动画状态
      eventSource: null,
      apiBaseUrl: process.env.VUE_APP_BASE_API, // 从 .env 文件读取后端地址
      typingTimer: null,
      conversationId: null, // 当前对话ID
      pageSuggestion: null // 当前页面的预生成建议
    };
  },
  
  computed: {
    /**
     * 检查是否有消息历史
     */
    hasMessages() {
      return this.messages.length > 0;
    },
    
    /**
     * 从 Vuex 获取用户 ID
     */
    userId() {
      return this.$store.getters.userId;
    },
    
    /**
     * 从 Vuex 获取当前页面的健康建议
     */
    currentPageSuggestion() {
      if (!this.pageName) return null;
      return this.$store.getters.getPageSuggestion(this.pageName);
    }
  },
  
  watch: {
    // 监听页面名称变化，加载对应的预生成建议
    pageName: {
      immediate: true,
      handler(newPage) {
        if (newPage && this.showPreGeneratedAdvice) {
          this.loadPageSuggestion(newPage);
        }
      }
    },
    
    // 监听可见性，当变为可见时，如果有页面建议且未显示，则自动显示
    visible(isVisible) {
      if (isVisible && this.showPreGeneratedAdvice && this.pageName && !this.hasMessages) {
        this.displayPageSuggestion();
      }
    }
  },
  
  created() {
    // 如果有页面名称，尝试加载页面特定的建议
    if (this.pageName && this.showPreGeneratedAdvice) {
      this.loadPageSuggestion(this.pageName);
    }
    
    // 加载历史记录
    this.loadChatHistoryFromServer();
  },
  
  mounted() {
    // 添加键盘事件监听器，处理Shift+Enter
    document.addEventListener('keydown', this.handleKeyDown);
    
    // 初始显示页面建议
    if (this.visible && this.showPreGeneratedAdvice && this.pageName) {
      this.$nextTick(() => {
        this.displayPageSuggestion();
      });
    }
  },
  
  beforeDestroy() {
    // 清理资源
    if (this.eventSource) this.eventSource.close();
    if (this.typingTimer) clearTimeout(this.typingTimer);
    document.removeEventListener('keydown', this.handleKeyDown);
  },
  
  methods: {
    /**
     * 处理键盘事件
     */
    handleKeyDown(e) {
      // 如果按下Shift+Enter，阻止默认的发送行为
      if (e.key === 'Enter' && e.shiftKey) {
        // 允许换行，不需要做任何事
      } else if (e.key === 'Enter' && !e.shiftKey && !this.loading && this.input.trim()) {
        // 如果只按Enter且输入框有内容，发送消息
        e.preventDefault();
        this.sendMsg();
      }
    },
    
    /**
     * 使用示例问题
     */
    useExample(question) {
      this.input = question;
      this.sendMsg();
    },
    
    /**
     * 获取当前时间格式化字符串
     */
    getCurrentTime() {
      const now = new Date();
      return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    },
    
    formatMessage(content) {
      return content ? parseMarkdown(content) : '';
    },
    
    /**
     * 从服务器加载聊天历史
     */
    loadChatHistoryFromServer() {
      const token = this.$store.getters.token;
      if (!token) {
        console.error('未找到用户token，无法加载聊天历史');
        return;
      }
      
      fetch(`${this.apiBaseUrl}/viewHistory`, {
        method: 'GET',
        headers: {
          'X-Token': token,
          'Content-Type': 'application/json'
        }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('网络响应异常');
        }
        return response.json();
      })
      .then(data => {
        if (data && data.length > 0) {
          // 获取最新的对话ID
          const latestConversationId = data[0].conversationId;
          this.conversationId = latestConversationId;
          
          // 过滤出最新对话的消息
          const latestConversation = data.filter(msg => msg.conversationId === latestConversationId);
          
          // 转换格式为组件内使用的格式
          this.messages = latestConversation.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'ai',
            content: msg.content,
            time: this.formatTimestamp(msg.timestamp)
          }));
          
          console.log(`已加载对话ID ${latestConversationId} 的历史记录，共 ${this.messages.length} 条消息`);
        }
      })
      .catch(error => {
        console.error('加载聊天历史失败:', error);
      });
    },
    
    /**
     * 格式化时间戳为时间字符串
     */
    formatTimestamp(timestamp) {
      if (!timestamp) return this.getCurrentTime();
      
      const date = new Date(timestamp);
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    },
    
    /**
     * 重置/清空聊天历史
     */
    clearMessages() {
      this.$confirm('确定要清空所有对话历史吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const token = this.$store.getters.token;
        if (!token) {
          console.error('未找到用户token，无法清空聊天历史');
          return;
        }
        
        // 调用后端API清空历史
        fetch(`${this.apiBaseUrl}/resetHistory${this.conversationId ? `?conversationId=${this.conversationId}` : ''}`, {
          method: 'GET',
          headers: {
            'X-Token': token
          }
        })
        .then(response => {
          if (!response.ok) {
            throw new Error('清空历史失败');
          }
          return response.text();
        })
        .then(message => {
          this.messages = [];
          this.conversationId = null;
          
          this.$message({
            type: 'success',
            message: '对话历史已清空'
          });
          console.log('清空结果:', message);
        })
        .catch(error => {
          console.error('清空聊天历史失败:', error);
          this.$message({
            type: 'error',
            message: '清空历史失败，请稍后重试'
          });
        });
      }).catch(() => {});
    },
    
    /**
     * 发送消息到AI
     */
    sendMsg() {
      if (!this.input.trim() || this.loading) return;
      
      const question = this.input.trim();
      const time = this.getCurrentTime();
      
      // 添加用户消息
      this.messages.push({ 
        role: 'user', 
        content: question,
        time: time
      });
      
      // 清空输入框
      this.input = '';
      
      // 滚动到底部
      this.scrollToBottom();
      
      // 显示AI正在输入的状态
      this.isTyping = true;
      this.loading = true;
      
      // 开始SSE连接
      this.startSSE(question);
    },
    
    /**
     * 滚动到消息区域底部
     */
    scrollToBottom() {
      this.$nextTick(() => {
        if (this.$refs.msgBox) {
          this.$refs.msgBox.scrollTop = this.$refs.msgBox.scrollHeight;
        }
      });
    },
    
    /**
     * 启动SSE连接获取AI回复
     */
    startSSE(question) {
      // 关闭之前的连接
      if (this.eventSource) {
        this.eventSource.close();
      }
      
      // 准备AI消息
      const time = this.getCurrentTime();
      let currentAiMessageIndex = -1;
      
      // 创建新的AI消息
      this.messages.push({ 
        role: 'ai', 
        content: '',
        time: time
      });
      currentAiMessageIndex = this.messages.length - 1;
      
      // 获取token
      const token = this.$store.getters.token;
      if (!token) {
        console.error('未找到用户token，无法发送聊天请求');
        this.handleSSEError(currentAiMessageIndex, time, "认证失败，请重新登录");
        return;
      }

      // 构建SSE URL
      let sseUrl = `${this.apiBaseUrl}/chatStream?question=${encodeURIComponent(question)}`;
      // 如果有会话ID，则附加
      if (this.conversationId) {
        sseUrl += `&conversationId=${this.conversationId}`;
      }
      // 将 Token 添加为查询参数
      if (token) {
        sseUrl += `&token=${encodeURIComponent(token)}`;
      } else {
        console.error('未找到用户token，无法建立SSE连接');
        this.handleSSEError(currentAiMessageIndex, time, "认证失败，请重新登录");
        return;
      }

      // 创建SSE连接 - 移除 headers 选项
      this.eventSource = new EventSource(sseUrl);
      
      // 连接打开事件
      this.eventSource.onopen = () => {
        console.log("SSE连接已打开");
      };
      
      // 监听特殊事件：conversationId
      this.eventSource.addEventListener('conversationId', (event) => {
        const newConversationId = event.data;
        console.log(`收到新的会话ID: ${newConversationId}`);
        this.conversationId = newConversationId;
      });
      
      // 监听特殊事件：error
      this.eventSource.addEventListener('error', (event) => {
        const errorMessage = event.data || "服务器错误，请稍后重试";
        console.error(`SSE错误事件: ${errorMessage}`);
        this.handleSSEError(currentAiMessageIndex, time, errorMessage);
      });

      // 常规消息接收事件
      this.eventSource.onmessage = (event) => {
        // 隐藏打字动画，显示实际内容
        this.isTyping = false;
        
        const rawData = event.data;
        
        // 检查是否为结束标记
        if (rawData === '[DONE]') {
          console.log("流式响应完成");
          this.loading = false;
          
          if (this.eventSource) {
            this.eventSource.close();
          }
          return;
        }

        // 解析JSON响应
        try {
          const jsonChunk = JSON.parse(rawData);
          const contentChunk = jsonChunk.choices?.[0]?.delta?.content;

          if (contentChunk !== null && contentChunk !== undefined) {
            // 更新AI消息内容
            if (currentAiMessageIndex !== -1) {
              const updatedContent = this.messages[currentAiMessageIndex].content + contentChunk;
              this.$set(this.messages, currentAiMessageIndex, { 
                role: 'ai', 
                content: updatedContent,
                time: time
              });
            }

            // 滚动到底部
            this.scrollToBottom();
          }
        } catch (err) {
          console.error('解析SSE数据错误:', err);
        }
      };

      // 错误处理
      this.eventSource.onerror = (err) => {
        console.error("SSE连接错误:", err);
        this.handleSSEError(currentAiMessageIndex, time);
      };
    },
    
    /**
     * 处理SSE错误
     */
    handleSSEError(currentAiMessageIndex, time, errorMessage = null) {
      this.isTyping = false;
      this.loading = false;
      
      // 显示错误消息
      if (currentAiMessageIndex !== -1) {
        const errorMsg = `\n\n[${errorMessage || "连接错误，请稍后重试或检查服务器状态"}]`;
        const updatedContent = this.messages[currentAiMessageIndex].content || errorMsg;
        
        // 如果内容为空，直接显示错误消息，否则追加
        this.$set(this.messages, currentAiMessageIndex, { 
          role: 'ai', 
          content: updatedContent.trim() ? updatedContent + errorMsg : errorMsg,
          time: time
        });
      }

      if (this.eventSource) {
        this.eventSource.close();
      }
    },
    
    /**
     * 加载特定页面的预生成建议
     */
    loadPageSuggestion(pageName) {
      if (!pageName || !this.userId) return;
      
      // 如果Vuex中已有该页面的建议，直接使用
      const suggestion = this.$store.getters.getPageSuggestion(pageName);
      if (suggestion) {
        this.pageSuggestion = suggestion;
        return;
      }
      
      // 否则调用 action 获取
      this.$store.dispatch('user/getPageSuggestion', pageName)
        .then(suggestion => {
          this.pageSuggestion = suggestion;
          if (this.visible && this.showPreGeneratedAdvice && !this.hasMessages) {
            this.displayPageSuggestion();
          }
        })
        .catch(error => {
          console.error('加载页面建议失败:', error);
        });
    },
    
    /**
     * 显示预生成的页面建议
     */
    displayPageSuggestion() {
      // 如果没有预生成建议或已有消息，则不显示
      if (!this.pageSuggestion || this.hasMessages) return;
      
      // 添加AI消息，显示预生成的建议
      this.messages.push({
        role: 'ai',
        content: `<strong>针对您的健康状况，关于${this.getPageDisplayName()}的建议：</strong><br><br>${this.pageSuggestion.content || this.pageSuggestion}`,
        time: this.getCurrentTime()
      });
      
      // 滚动到底部
      this.$nextTick(() => {
        this.scrollToBottom();
      });
    },
    
    /**
     * 获取页面的显示名称
     */
    getPageDisplayName() {
      const pageNames = {
        'healthAssessment': '健康评估',
        'diet': '饮食计划',
        'exercise': '运动建议',
        'sleep': '睡眠质量',
        'mentalHealth': '心理健康'
      };
      
      return pageNames[this.pageName] || this.pageName;
    },
  },
};
</script>

<style lang="scss" scoped src="@/styles/ai-qa.scss"></style>
