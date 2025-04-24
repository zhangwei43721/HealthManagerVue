<template>
  <div class="ai-chat-container">
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
</template>

<script>
export default {
  name: 'AiHealthQA',
  data() {
    return {
      input: '',
      messages: [],
      loading: false,
      isTyping: false, // 打字动画状态
      eventSource: null,
      apiBaseUrl: process.env.VUE_APP_BASE_API, // 从 .env 文件读取后端地址
      typingTimer: null,
      chatHistory: [], // 历史会话记录
    };
  },
  
  created() {
    // 尝试从本地存储加载历史记录
    this.loadChatHistory();
  },
  
  computed: {
    /**
     * 检查是否有消息历史
     */
    hasMessages() {
      return this.messages.length > 0;
    },
  },
  
  created() {
    // 尝试从本地存储加载历史记录
    this.loadChatHistory();
  },
  
  mounted() {
    // 添加键盘事件监听器，处理Shift+Enter
    document.addEventListener('keydown', this.handleKeyDown);
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
    
 // formatMessage 函数现在直接调用重构后的 parseMarkdown
formatMessage(content) {
  if (!content) return '';
  // 直接调用新的解析函数
  return this.parseMarkdown(content);
},
    
    /**
 * 自定义Markdown解析函数 (重构版本)
 */
parseMarkdown(text) {
  if (!text) return '';

  const lines = text.split('\n');
  let html = '';
  let inCodeBlock = false;
  let codeLang = '';
  let codeContent = [];
  let inListType = null; // null, 'ul', 'ol'
  let currentParagraph = []; // 存储当前段落的行

  const closeList = () => {
    if (inListType === 'ul') html += '</ul>\n';
    if (inListType === 'ol') html += '</ol>\n';
    inListType = null;
  };

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      // 将段落行合并，并处理行内元素
      const paragraphText = currentParagraph.join('\n'); // 使用换行连接，如果需要<br>，可在parseInline处理
      html += `<p>${this.parseInline(paragraphText)}</p>\n`;
      currentParagraph = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 1. 代码块处理
    if (line.trim().startsWith('```')) {
      flushParagraph(); // 代码块开始前结束段落
      closeList();     // 代码块开始前结束列表
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeLang = line.trim().substring(3).trim();
        codeContent = []; // 重置代码内容
      } else {
        // 关闭代码块，转义并添加
        const langClass = codeLang ? `language-${this.escapeHtml(codeLang)}` : '';
        // 转义每一行代码内容
        const escapedCode = codeContent.map(codeLine => this.escapeHtml(codeLine)).join('\n');
        html += `<pre><code class="${langClass}">${escapedCode}</code></pre>\n`;
        inCodeBlock = false;
        codeLang = '';
      }
      continue; // 处理完代码块标记行，跳到下一行
    }

    if (inCodeBlock) {
      codeContent.push(line); // 收集代码行（稍后转义）
      continue;
    }

    // 2. 处理空行 (视为段落分隔符和列表结束符)
    if (line.trim() === '') {
      flushParagraph();
      closeList();
      continue; // 跳过空行本身
    }

    // 3. 标题处理 (H1-H3)
    if (line.startsWith('#')) {
       flushParagraph();
       closeList();
       if (line.startsWith('### ')) {
           html += `<h3>${this.parseInline(line.substring(4))}</h3>\n`;
       } else if (line.startsWith('## ')) {
           html += `<h2>${this.parseInline(line.substring(3))}</h2>\n`;
       } else if (line.startsWith('# ')) {
           html += `<h1>${this.parseInline(line.substring(2))}</h1>\n`;
       } else { // 如果#后没有空格，视为普通文本
          currentParagraph.push(line);
       }
       continue;
    }

    // 4. 列表项处理
    const ulMatch = line.match(/^(\s*)([-*+])\s+(.*)/); // 无序列表
    const olMatch = line.match(/^(\s*)(\d+)\.\s+(.*)/); // 有序列表

    if (ulMatch || olMatch) {
      flushParagraph(); // 列表项开始前结束段落

      const listType = ulMatch ? 'ul' : 'ol';
      const itemContent = ulMatch ? ulMatch[3] : olMatch[3];

      if (inListType !== listType) {
        closeList(); // 关闭不同类型的旧列表
        html += listType === 'ul' ? '<ul>\n' : '<ol>\n';
        inListType = listType;
      }

      // 添加列表项，处理行内元素
      html += `<li>${this.parseInline(itemContent)}</li>\n`;
      continue; // 处理完列表项，跳到下一行
    }

    // 5. 如果当前行不是列表项，但之前在列表中，则关闭列表
    if (inListType && !ulMatch && !olMatch) {
       closeList();
    }

    // 6. 引用处理 (简单版本，不支持嵌套)
    if (line.startsWith('> ')) {
        flushParagraph();
        closeList();
        html += `<blockquote><p>${this.parseInline(line.substring(2))}</p></blockquote>\n`; // 包裹在p标签内
        continue;
    }

    // 7. 水平线 (简单匹配)
    if (line.match(/^(\*\*\*|---|___)\s*$/)) {
        flushParagraph();
        closeList();
        html += '<hr>\n';
        continue;
    }

    // 8. 如果以上都不是，则视为段落内容
    currentParagraph.push(line);
  }

  // 循环结束后，处理剩余的段落和列表
  flushParagraph();
  closeList();

  // 添加 markdown-body 类以便于样式化
  return `<div class="markdown-body">${html.trim()}</div>`;
},
    
    /**
     * HTML转义函数，防止XSS
     */
     escapeHtml(unsafe) {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '\'');
},
    /**
 * 解析行内 Markdown 元素
 */
parseInline(text) {
  if (!text) return '';
  let html = this.escapeHtml(text); // 先转义，防止链接等注入

  // 处理行内代码 (```code```) - 优先级高，避免内部内容被其他规则处理
  html = html.replace(/`([^`]+)`/g, (match, codeContent) => {
    // 不需要再次转义 codeContent，因为它已经被 escapeHtml 处理过了
    return `<code>${codeContent}</code>`;
  });

  // 处理粗体 (**)
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  // 处理斜体 (*) - 注意避免匹配 **
  html = html.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>'); // 使用否定查找来避免匹配 **

  // 处理链接 [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, linkText, url) => {
    // 对 URL 进行基础验证或保持原样，但确保 text 是转义过的
    const safeUrl = url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/') ? url : '#'; // 简单URL过滤
    return `<a href="${this.escapeHtml(safeUrl)}" target="_blank" rel="noopener noreferrer">${linkText}</a>`; // linkText 已经转义
  });

  // 处理自动链接 (简单版本，匹配 http/https)
  html = html.replace(/(https?:\/\/[^\s<]+)/g, (match, url) => {
       return `<a href="${this.escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${this.escapeHtml(url)}</a>`;
   });

  return html;
},
    /**
     * 清空所有消息
     */
    clearMessages() {
      this.$confirm('确定要清空所有对话历史吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.messages = [];
        this.saveChatHistory();
        this.$message({
          type: 'success',
          message: '对话历史已清空'
        });
      }).catch(() => {});
    },
    
    /**
     * 保存聊天历史到本地存储
     */
    saveChatHistory() {
      try {
        localStorage.setItem('health-qa-history', JSON.stringify(this.messages));
      } catch (e) {
        console.error('保存聊天历史失败:', e);
      }
    },
    
    /**
     * 从本地存储加载聊天历史
     */
    loadChatHistory() {
      try {
        const savedHistory = localStorage.getItem('health-qa-history');
        if (savedHistory) {
          this.messages = JSON.parse(savedHistory);
        }
      } catch (e) {
        console.error('加载聊天历史失败:', e);
      }
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
      
      // 保存聊天历史
      this.saveChatHistory();
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

      // 创建SSE连接
      this.eventSource = new EventSource(`${this.apiBaseUrl}/chatStream?question=${encodeURIComponent(question)}`);
      
      // 连接打开事件
      this.eventSource.onopen = () => {
        console.log("SSE连接已打开");
      };

      // 消息接收事件
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
          
          // 保存更新后的聊天历史
          this.saveChatHistory();
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
        this.isTyping = false;
        this.loading = false;
        
        // 显示错误消息
        if (currentAiMessageIndex !== -1) {
          const errorMsg = "\n\n[连接错误，请稍后重试或检查服务器状态]";
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
        
        // 保存聊天历史
        this.saveChatHistory();
      };
    },
  },
};
</script>

<style lang="scss" scoped>
/* 主要变量 */
$primary-color: #42b983;
$secondary-color: #e6f0fc;
$border-color: #e0e6ed;
$text-color: #2c3e50;
$light-text: #5e6d82;
$background-color: #f5f7fa;
$user-msg-bg: #e6f7ff;
$ai-msg-bg: #f0f9eb;
$shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
$border-radius: 12px;
$transition: all 0.3s ease;

/* 容器样式 */
.ai-chat-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 70vh;
  padding: 20px;
  background-color: $background-color;
}

/* 聊天卡片 */
.ai-chat-card {
  width: 90%;
  max-width: 800px;
  min-height: 600px;
  display: flex;
  flex-direction: column;
  border-radius: $border-radius;
  box-shadow: $shadow;
  overflow: hidden;
  background: white;
  transition: $transition;
}

/* 头部样式 */
.ai-chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background-color: white;
  border-bottom: 1px solid $border-color;
  
  .ai-assistant-info {
    display: flex;
    align-items: center;
    
    .ai-assistant-details {
      margin-left: 12px;
      
      .ai-chat-title {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: $text-color;
      }
      
      .ai-status {
        font-size: 12px;
        color: $light-text;
        display: block;
        margin-top: 2px;
        
        &.online {
          color: $primary-color;
          
          &:before {
            content: '';
            display: inline-block;
            width: 8px;
            height: 8px;
            background-color: $primary-color;
            border-radius: 50%;
            margin-right: 5px;
          }
        }
      }
    }
  }
  
  .clear-btn {
    color: $light-text;
    font-size: 16px;
    
    &:hover {
      color: #f56c6c;
    }
  }
}

/* 消息区域 */
.ai-chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: white;
  min-height: 400px;
  max-height: 500px;
  scrollbar-width: thin;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: rgba(144, 147, 153, 0.3);
    border-radius: 3px;
  }
}

/* 欢迎容器 */
.welcome-container {
  text-align: center;
  padding: 30px 20px;
  color: $light-text;
  
  .robot-icon {
    width: 80px;
    height: 80px;
    margin-bottom: 20px;
    animation: float 3s ease-in-out infinite;
  }
  
  h3 {
    font-size: 22px;
    font-weight: 600;
    margin-bottom: 16px;
    color: $text-color;
  }
  
  p {
    margin-bottom: 20px;
    font-size: 16px;
  }
  
  .suggestion-chips {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
    margin-top: 20px;
    
    .chip {
      background-color: $secondary-color;
      color: $text-color;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 14px;
      cursor: pointer;
      transition: $transition;
      border: 1px solid $border-color;
      
      &:hover {
        background-color: $primary-color;
        color: white;
        transform: translateY(-2px);
      }
    }
  }
}

/* 消息样式 */
.ai-msg {
  display: flex;
  align-items: flex-start;
  margin-bottom: 20px;
  animation: fadeIn 0.3s ease;
  
  .msg-avatar {
    flex-shrink: 0;
    margin-top: 4px;
  }
  
  .ai-msg-bubble {
    position: relative;
    margin-left: 12px;
    max-width: 85%;
    
    .ai-msg-content {
      padding: 12px 16px;
      border-radius: 12px;
      word-break: break-word;
      font-size: 15px;
      line-height: 1.5;
      color: $text-color;
      
      a {
        color: $primary-color;
        text-decoration: underline;
        
        &:hover {
          opacity: 0.8;
        }
      }
    }
    
    .msg-time {
      font-size: 12px;
      color: $light-text;
      margin-top: 4px;
      text-align: right;
    }
  }
  
  &.user {
    flex-direction: row-reverse;
    
    .ai-msg-bubble {
      margin-right: 12px;
      margin-left: 0;
      
      .ai-msg-content {
        background: $user-msg-bg;
        border-top-right-radius: 4px;
      }
      
      .msg-time {
        text-align: left;
      }
    }
  }
  
  &.ai {
    .ai-msg-bubble {
      .ai-msg-content {
        background: $ai-msg-bg;
        border-top-left-radius: 4px;
      }
    }
  }
}

/* 打字动画 */
.typing-indicator {
  .ai-msg-bubble.typing {
    padding: 12px 16px;
    background: $ai-msg-bg;
    border-radius: 12px;
    border-top-left-radius: 4px;
    width: 60px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    
    .dot {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: $primary-color;
      margin: 0 3px;
      opacity: 0.6;
      animation: bounce 1.5s infinite ease-in-out;
      
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
  }
}

/* 输入区域 */
.ai-chat-input {
  padding: 16px 20px;
  border-top: 1px solid $border-color;
  background-color: white;
  position: relative;
  
  .message-input {
    .el-textarea__inner {
      border-radius: 20px;
      padding-right: 100px;
      resize: none;
      transition: $transition;
      min-height: 44px !important;
      
      &:focus {
        border-color: $primary-color;
        box-shadow: 0 0 0 2px rgba(66, 185, 131, 0.2);
      }
    }
    
    .el-input-group__append {
      background-color: $primary-color;
      border-color: $primary-color;
      color: white;
      border-top-right-radius: 20px;
      border-bottom-right-radius: 20px;
      padding: 0 16px;
      
      .el-button {
        color: white;
        border: none;
        background: transparent;
        padding: 0;
        font-weight: 500;
      }
    }
  }
  
  .input-tips {
    position: absolute;
    right: 120px;
    bottom: 12px;
    font-size: 12px;
    color: $light-text;
    pointer-events: none;
  }
}

/* 动画 */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes bounce {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-4px); }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* Markdown样式 */
.markdown-body {
  font-size: 15px;
  line-height: 1.6;
  word-wrap: break-word;
  
  h1, h2, h3, h4, h5, h6 {
    margin-top: 16px;
    margin-bottom: 12px;
    font-weight: 600;
    line-height: 1.25;
  }
  
  h1 { font-size: 20px; }
  h2 { font-size: 18px; }
  h3 { font-size: 16px; }
  
  p {
    margin-top: 0;
    margin-bottom: 12px;
  }
  
  a {
    color: $primary-color;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  img {
    max-width: 100%;
    box-sizing: border-box;
    border-radius: 4px;
  }
  
  code {
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
    padding: 0.2em 0.4em;
    margin: 0;
    font-size: 85%;
    background-color: rgba(27, 31, 35, 0.05);
    border-radius: 3px;
  }
  
  pre {
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
    word-wrap: normal;
    padding: 16px;
    overflow: auto;
    font-size: 85%;
    line-height: 1.45;
    background-color: #f6f8fa;
    border-radius: 6px;
    margin-bottom: 16px;
    
    code {
      padding: 0;
      margin: 0;
      background-color: transparent;
      border: 0;
      word-break: normal;
      white-space: pre;
    }
  }
  
  blockquote {
    padding: 0 1em;
    color: #6a737d;
    border-left: 0.25em solid #dfe2e5;
    margin: 0 0 16px 0;
    
    > :first-child { margin-top: 0; }
    > :last-child { margin-bottom: 0; }
  }
  
  table {
    border-collapse: collapse;
    width: 100%;
    margin-bottom: 16px;
    
    th, td {
      padding: 6px 13px;
      border: 1px solid #dfe2e5;
    }
    
    tr {
      background-color: #fff;
      border-top: 1px solid #c6cbd1;
      
      &:nth-child(2n) {
        background-color: #f6f8fa;
      }
    }
  }
  
  ul, ol {
    padding-left: 2em;
    margin-bottom: 16px;
    
    li {
      margin-bottom: 4px;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
  
  hr {
    height: 0.25em;
    padding: 0;
    margin: 24px 0;
    background-color: #e1e4e8;
    border: 0;
  }
}

/* 过渡效果 */
.message-fade-enter-active, .message-fade-leave-active {
  transition: all 0.3s;
}

.message-fade-enter, .message-fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* 响应式调整 */
@media screen and (max-width: 768px) {
  .ai-chat-card {
    width: 100%;
    max-width: none;
    min-height: calc(100vh - 40px);
    margin: 0;
    border-radius: 0;
  }
  
  .ai-chat-messages {
    max-height: none;
  }
  
  .ai-msg .ai-msg-bubble {
    max-width: 75%;
  }
  
  .suggestion-chips .chip {
    font-size: 12px;
    padding: 6px 12px;
  }
}
</style>
