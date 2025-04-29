<template>
  <div class="ai-chat-container">
    <el-card class="ai-chat-card" :body-style="{ padding: '0' }">
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

      <div class="ai-chat-messages" ref="msgBox">
        <transition-group name="message-fade">
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

        <div class="typing-indicator" v-if="isTyping">
          <el-avatar :size="36" icon="el-icon-s-custom" :style="{ background: '#42b983' }" class="msg-avatar" />
          <div class="ai-msg-bubble typing">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
          </div>
        </div>
      </div>

      <div class="ai-chat-input">
        <div class="input-container">
          <el-input
            class="message-input"
            type="textarea"
            v-model="input"
            :rows="1"
            autosize
            :maxlength="500"
            placeholder="请输入您的健康问题..."
            :disabled="loading"
            @keydown.enter.native="handleKeyDown"
          />

          <div class="action-buttons">
            <el-tooltip content="上传图片" placement="top">
              <el-button
                type="primary"
                icon="el-icon-camera"
                circle
                :disabled="loading"
                @click="handlePhotoUpload"
                class="action-btn photo-btn"
              />
            </el-tooltip>

            <el-button
              type="primary"
              icon="el-icon-s-promotion"
              circle
              :loading="loading || photoUploading"
              :disabled="!input.trim() && !photoFile"
              @click="sendMsg"
              class="action-btn send-btn"
            />
          </div>

          <input
            type="file"
            ref="photoInput"
            accept="image/*"
            style="display: none"
            @change="onPhotoSelected"
          />
        </div>

        <div class="input-tips" v-if="input.length > 0">
          按Enter发送，Shift+Enter换行
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { escapeHtml, parseMarkdown } from '@/utils/markdownParser'; // 假设 markdownParser 在此路径

export default {
  name: 'AiHealthQA',
  props: {
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
      isTyping: false,
      eventSource: null,
      apiBaseUrl: process.env.VUE_APP_BASE_API || '/api', // 提供一个默认值
      typingTimer: null,
      conversationId: null,
      pageSuggestion: null,
      photoFile: null,
      photoUploading: false,
      visible: true // 假设组件是可见的，用于 page suggestion 逻辑
    };
  },

  computed: {
    hasMessages() {
      return this.messages.length > 0;
    },
    userId() {
      // 确保 $store 和 getters 存在
      return this.$store && this.$store.getters && this.$store.getters.userId;
    },
    currentPageSuggestion() {
      if (!this.pageName || !this.$store || !this.$store.getters || !this.$store.getters.getPageSuggestion) return null;
      return this.$store.getters.getPageSuggestion(this.pageName);
    }
  },

  watch: {
    pageName: {
      immediate: true,
      handler(newPage) {
        if (newPage && this.showPreGeneratedAdvice && this.userId) { // 确保 userId 存在
          this.loadPageSuggestion(newPage);
        }
      }
    },
    userId: { // 监听 userId 变化，例如登录后
      handler(newUserId) {
        if (newUserId) {
          this.loadChatHistoryFromServer();
          if (this.pageName && this.showPreGeneratedAdvice) {
            this.loadPageSuggestion(this.pageName);
          }
        } else {
          // 用户登出或未登录，清空消息和状态
          this.messages = [];
          this.conversationId = null;
          this.pageSuggestion = null;
        }
      }
    }
  },

  created() {
    if (this.userId) { // 仅在 userId 存在时加载
        if (this.pageName && this.showPreGeneratedAdvice) {
          this.loadPageSuggestion(this.pageName);
        }
        this.loadChatHistoryFromServer();
    }
  },

  mounted() {
    // 使用 .native 修饰符后，不需要手动监听 keydown
    // document.addEventListener('keydown', this.handleKeyDown);

    // 检查 store 和 userId 是否准备好
    if (this.userId) {
      // 如果 created 时已加载，这里可能不需要重复加载，除非有特殊逻辑
      // this.loadChatHistoryFromServer();
      if (this.showPreGeneratedAdvice && this.pageSuggestion && !this.hasMessages) {
        this.displayPageSuggestion();
      }
    }
    this.scrollToBottom();
  },

  beforeDestroy() {
    if (this.eventSource) {
        this.eventSource.close();
        this.eventSource = null;
    }
    if (this.typingTimer) clearTimeout(this.typingTimer);
    // document.removeEventListener('keydown', this.handleKeyDown);
  },

  methods: {
    handleKeyDown(e) {
      if (e.key === 'Enter' && e.shiftKey) {
        return; // 允许换行
      }
      if (e.key === 'Enter' && !this.loading && (this.input.trim() || this.photoFile)) {
        e.preventDefault();
        this.sendMsg();
      }
    },

    handlePhotoUpload() {
      if (this.loading || this.photoUploading) return;
      this.$refs.photoInput.click();
    },

    onPhotoSelected(event) {
      const file = event.target.files[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        this.$message.error('请选择图片文件');
        event.target.value = null; // 清空选择
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        this.$message.error('图片大小不能超过5MB');
        event.target.value = null; // 清空选择
        return;
      }

      this.photoFile = file;
      this.$message.success('图片已选择，点击发送按钮或按Enter上传');
      // 不需要清空 event.target.value，因为文件引用已保存在 photoFile
    },

    uploadPhoto() {
      if (!this.photoFile || this.loading || this.photoUploading) return;

      this.photoUploading = true;
      this.loading = true; // 统一loading状态

      // --- 修改点: 如果 input 为空，发送一个空格 ---
      const userMessage = this.input ? this.input.trim() : ' ';
      // --- 结束修改点 ---

      const imageUrl = URL.createObjectURL(this.photoFile);
      this.messages.push({
        role: 'user',
        content: `<div class="uploaded-image"><img src="${imageUrl}" alt="用户上传图片" style="max-width: 200px; max-height: 200px; border-radius: 4px;" /></div>${this.input.trim() ? `<p>${escapeHtml(this.input.trim())}</p>` : ''}`, // 显示原始未处理的输入
        time: this.getCurrentTime()
      });

      const currentPhotoFile = this.photoFile;
      this.photoFile = null;
      this.input = '';
      this.$refs.photoInput.value = '';
      this.scrollToBottom();

      const time = this.getCurrentTime();
      const aiMessagePlaceholderIndex = this.messages.length; // 预留索引
      this.messages.push({ role: 'ai', content: '', time: time });

      const token = this.$store.getters.token;
      if (!token) {
        this.handleSSEError(aiMessagePlaceholderIndex, time, "认证失败，请重新登录");
        URL.revokeObjectURL(imageUrl); // 清理URL
        this.photoUploading = false;
        this.loading = false;
        return;
      }

      this.isTyping = true;

      const formData = new FormData();
      formData.append('token', token);
      formData.append('message', userMessage); // 发送处理后的 message (可能是空格)
      formData.append('file', currentPhotoFile);

      if (this.conversationId && this.conversationId !== 'new') {
        formData.append('conversationId', this.conversationId);
      }

      fetch(`${this.apiBaseUrl}/chatStream`, {
        method: 'POST',
        body: formData
      })
      .then(response => {
        this.isTyping = false; // 收到响应就停止打字动画

        if (response.ok) {
          this.handleStreamResponse(response, aiMessagePlaceholderIndex, time, imageUrl);
        } else {
          response.text().then(text => {
            let errorMsg = `服务器错误 ${response.status}`;
            try {
                const errJson = JSON.parse(text);
                errorMsg = `${errorMsg}: ${errJson.error || errJson.message || text}`;
            } catch(e) {
                errorMsg = `${errorMsg}: ${text}`;
            }
            throw new Error(errorMsg);
          }).catch(err => {
             // 如果 text() 也失败，使用原始错误
             throw new Error(`服务器响应错误: ${response.status} ${response.statusText}`);
          });
        }
      })
      .catch(error => {
        console.error('发送图片和消息失败:', error);
        this.handleSSEError(aiMessagePlaceholderIndex, time, `请求失败: ${error.message}`);
        URL.revokeObjectURL(imageUrl); // 清理URL
      })
      .finally(() => {
        // 注意：loading 和 photoUploading 的最终 false 状态应该在流处理结束后设置
        // 这里先置 photoUploading 为 false，loading 等待 stream 结束
         this.photoUploading = false;
         // this.loading = false; // 移动到 handleStreamResponse 或 handleSSEError 的完成/错误逻辑中
         this.isTyping = false; // 确保停止
      });
    },

    useExample(question) {
      this.input = question;
      this.sendMsg();
    },

    getCurrentTime() {
      const now = new Date();
      return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    },

    formatMessage(content) {
      if (typeof content !== 'string') {
        return '';
      }
      // 正则表达式匹配开头的用户图片 div 或 AI 图片 div
      // 使用非捕获组 (?:...) 来匹配两种 class
      const imageDivRegex = /^(<(?:div class="uploaded-image"|div class="detection-result-image")>.*?<\/div>)/s;
      const match = content.match(imageDivRegex);

      if (match) {
        // 如果找到了图片 div 在开头
        const imageHtml = match[1]; // 提取完整的图片 HTML
        const restContent = content.substring(imageHtml.length); // 获取图片之后的内容

        // 直接返回图片 HTML，并对剩余内容应用 Markdown 解析
        // 注意：用户消息中可能已经包含了 <p> 标签，parseMarkdown 不应再次处理它
        // 简单地拼接即可，浏览器会处理块级元素
        return imageHtml + parseMarkdown(restContent || '');
      } else {
        // 如果开头没有图片 div，则像以前一样，对整个内容应用 Markdown 解析
        return parseMarkdown(content);
      }
    },

    loadChatHistoryFromServer() {
      const token = this.$store.getters.token;
      if (!token || !this.userId) {
        console.log('用户未登录或Token无效，不加载历史记录');
        this.messages = []; // 确保清空
        this.conversationId = null;
        return;
      }

      fetch(`${this.apiBaseUrl}/viewHistory`, {
        method: 'GET',
        headers: { 'X-Token': token, 'Content-Type': 'application/json' }
      })
      .then(response => {
        if (!response.ok) {
           return response.json().catch(() => null).then(errBody => {
               throw new Error(`网络响应异常 (${response.status}): ${errBody ? JSON.stringify(errBody) : response.statusText}`);
           });
        }
        return response.json();
      })
      .then(data => {
        if (data && Array.isArray(data) && data.length > 0) {
          data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          const latestConversationId = data[0].conversationId;

          if (latestConversationId) {
             this.conversationId = latestConversationId;
             const latestConversationMessages = data
               .filter(msg => msg.conversationId === latestConversationId)
               .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

             this.messages = latestConversationMessages.map(msg => ({
                role: msg.role === 'user' ? 'user' : 'ai',
                content: msg.content,
                time: this.formatTimestamp(msg.timestamp)
             }));
             this.$nextTick(this.scrollToBottom);
          } else {
             this.messages = [];
             this.conversationId = null;
          }
        } else {
            this.messages = [];
            this.conversationId = null;
        }
      })
      .catch(error => {
        console.error('加载聊天历史失败:', error.message);
        this.messages = [];
        this.conversationId = null;
      });
    },

    formatTimestamp(timestamp) {
      if (!timestamp) return this.getCurrentTime();
      try {
          const date = new Date(timestamp);
          if (isNaN(date.getTime())) return this.getCurrentTime();
          return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
      } catch (e) {
          return this.getCurrentTime();
      }
    },

    clearMessages() {
      if (this.messages.length === 0) {
        // this.$message.info('当前没有对话历史可清空');
        return;
      }
      this.$confirm('确定要清空当前对话的所有历史记录吗?', '提示', {
        confirmButtonText: '确定清空', cancelButtonText: '取消', type: 'warning'
      }).then(() => {
        const token = this.$store.getters.token;
        if (!token) {
          this.$message.error('认证失败，无法清空历史');
          return;
        }
        const url = `${this.apiBaseUrl}/resetHistory${this.conversationId ? `?conversationId=${this.conversationId}` : ''}`;
        fetch(url, { method: 'GET', headers: { 'X-Token': token }})
        .then(response => {
          if (!response.ok) {
             return response.text().then(text => {
                 throw new Error(`清空历史失败 (${response.status}): ${text || response.statusText}`);
             });
          }
          return response.text();
        })
        .then(message => {
          this.messages = [];
          this.conversationId = null;
          this.input = '';
          this.photoFile = null;
          if(this.$refs.photoInput) this.$refs.photoInput.value = '';
          this.$message.success('对话历史已清空');
          this.$nextTick(this.scrollToBottom);
        })
        .catch(error => {
          console.error('清空聊天历史操作失败:', error.message);
          this.$message.error(`清空历史失败: ${error.message}`);
        });
      }).catch(() => {
        // this.$message.info('已取消清空操作');
      });
    },

    sendMsg() {
      const hasTextInput = this.input && this.input.trim();
      const hasPhotoInput = this.photoFile;

      if (!hasTextInput && !hasPhotoInput) {
        // this.$message.warning('请输入问题或选择要上传的图片');
        return;
      }
      if (this.loading || this.photoUploading) return;

      if (hasPhotoInput) {
        this.uploadPhoto();
      } else if (hasTextInput) {
        this.sendTextMessage();
      }
    },

    sendTextMessage() {
        const question = this.input.trim();
        if (!question) return; // 防止发送空消息

        const time = this.getCurrentTime();
        this.messages.push({ role: 'user', content: escapeHtml(question), time: time }); // 转义用户输入显示
        this.input = '';
        this.scrollToBottom();

        this.loading = true;
        this.isTyping = true;

        const aiMessagePlaceholderIndex = this.messages.length;
        this.messages.push({ role: 'ai', content: '', time: time });

        const token = this.$store.getters.token;
        if (!token) {
          this.handleSSEError(aiMessagePlaceholderIndex, time, "认证失败，请重新登录");
          return;
        }

        const formData = new FormData();
        formData.append('token', token);
        formData.append('message', question); // 发送原始未转义的问题
        if (this.conversationId && this.conversationId !== 'new') {
          formData.append('conversationId', this.conversationId);
        }

        fetch(`${this.apiBaseUrl}/chatStream`, {
          method: 'POST',
          body: formData
        })
        .then(response => {
          this.isTyping = false;
          if (response.ok) {
            this.handleStreamResponse(response, aiMessagePlaceholderIndex, time);
          } else {
            response.text().then(text => {
              let errorMsg = `服务器错误 ${response.status}`;
              try {
                  const errJson = JSON.parse(text);
                  errorMsg = `${errorMsg}: ${errJson.error || errJson.message || text}`;
              } catch(e) {
                  errorMsg = `${errorMsg}: ${text}`;
              }
              throw new Error(errorMsg);
            }).catch(err => {
               throw new Error(`服务器响应错误: ${response.status} ${response.statusText}`);
            });
          }
        })
        .catch(error => {
          console.error('发送文本消息失败:', error);
          this.handleSSEError(aiMessagePlaceholderIndex, time, `请求失败: ${error.message}`);
        })
        .finally(() => {
           // loading 的最终 false 状态应该在流处理结束后设置
           // this.loading = false; // 移动到 handleStreamResponse 或 handleSSEError
           this.isTyping = false;
        });
    },

    scrollToBottom() {
      this.$nextTick(() => {
        const msgBox = this.$refs.msgBox;
        if (msgBox) {
          msgBox.scrollTop = msgBox.scrollHeight;
        }
      });
    },

    handleStreamResponse(response, messageIndex, time, tempImageUrl = null) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        const processChunk = ({ done, value }) => {
            if (done) {
                console.log('Stream finished.');
                if (tempImageUrl) URL.revokeObjectURL(tempImageUrl);
                this.loading = false; // 最终设置 loading 状态
                this.isTyping = false;
                return;
            }

            buffer += decoder.decode(value, { stream: true });
            const events = buffer.split('\n\n');
            buffer = events.pop(); // Keep the last (potentially incomplete) event in buffer

            events.forEach(eventString => {
                if (!eventString.trim()) return;

                let eventName = 'message'; // Default SSE event name
                let eventData = '';

                const lines = eventString.split('\n');
                lines.forEach(line => {
                    if (line.startsWith('event:')) {
                        eventName = line.substring('event:'.length).trim();
                    } else if (line.startsWith('data:')) {
                        eventData += line.substring('data:'.length).trim() + '\n'; // Accumulate multi-line data
                    }
                });

                eventData = eventData.trim(); // Remove trailing newline

                this.handleSseEvent(eventName, eventData, messageIndex, time);
            });

            reader.read().then(processChunk).catch(error => {
                console.error('Error reading stream:', error);
                this.handleSSEError(messageIndex, time, `读取流错误: ${error.message}`);
                if (tempImageUrl) URL.revokeObjectURL(tempImageUrl);
                this.loading = false; // 确保在错误时也设置 loading
                this.isTyping = false;
            });
        };

        reader.read().then(processChunk).catch(error => {
             console.error('Error starting stream reading:', error);
             this.handleSSEError(messageIndex, time, `启动读取流错误: ${error.message}`);
             if (tempImageUrl) URL.revokeObjectURL(tempImageUrl);
             this.loading = false;
             this.isTyping = false;
        });
    },

    handleSseEvent(eventName, eventData, messageIndex, time) {
         if (eventName === 'conversationId') {
            console.log('Received conversationId:', eventData);
            this.conversationId = eventData;
         } else if (eventName === 'detectionResultImage') {
            console.log('Received detectionResultImage:', eventData);
             if (messageIndex !== -1 && messageIndex < this.messages.length) {
                 const currentMsg = this.messages[messageIndex];
                 // Prepend image, assuming text follows
                 const imageHtml = `<div class="detection-result-image"><img src="${eventData}" alt="AI检测结果" style="max-width: 200px; max-height: 200px; border-radius: 4px; margin-bottom: 5px;" /></div>`;
                 this.$set(this.messages, messageIndex, { ...currentMsg, content: imageHtml + (currentMsg.content || '') });
                 this.scrollToBottom();
             }
         } else if (eventData === '[DONE]') {
            console.log('Received [DONE] signal.');
            // Actual completion is handled when reader.read() returns done: true
         } else if (eventName === 'message' || eventName === 'data') { // Handle default message/data event
             try {
                 const jsonChunk = JSON.parse(eventData);
                 const contentChunk = jsonChunk.choices?.[0]?.delta?.content;
                 if (contentChunk !== null && contentChunk !== undefined) {
                     if (messageIndex !== -1 && messageIndex < this.messages.length) {
                         const currentMsg = this.messages[messageIndex];
                         this.$set(this.messages, messageIndex, { ...currentMsg, content: (currentMsg.content || '') + contentChunk });
                         this.scrollToBottom();
                     }
                 } else if (jsonChunk.error) {
                    this.handleSSEError(messageIndex, time, `AI处理错误: ${jsonChunk.error.message || JSON.stringify(jsonChunk.error)}`);
                 }
             } catch (err) {
                 // If JSON parsing fails, treat as plain text chunk (might happen with some models/errors)
                 if (messageIndex !== -1 && messageIndex < this.messages.length) {
                     const currentMsg = this.messages[messageIndex];
                     this.$set(this.messages, messageIndex, { ...currentMsg, content: (currentMsg.content || '') + eventData });
                     this.scrollToBottom();
                 }
             }
         } else if (eventName === 'error') {
             console.error('Received error event from SSE:', eventData);
             this.handleSSEError(messageIndex, time, `服务器推送错误: ${eventData}`);
         }
    },

    handleSSEError(messageIndex, time, errorMessage = null) {
      this.isTyping = false;
      this.loading = false;
      this.photoUploading = false;

      const finalErrorMessage = errorMessage || "发生未知错误";
      console.error("SSE Error:", finalErrorMessage);

      if (messageIndex !== -1 && messageIndex < this.messages.length) {
        const errorDisplayMsg = `<span style="color: red;">[错误: ${escapeHtml(finalErrorMessage)}]</span>`;
        const currentMsg = this.messages[messageIndex];
        const currentContent = currentMsg.content || '';
        // Avoid appending duplicate error messages
        if (!currentContent.includes(errorDisplayMsg)) {
             this.$set(this.messages, messageIndex, {
               ...currentMsg,
               content: currentContent ? currentContent + '\n' + errorDisplayMsg : errorDisplayMsg
             });
        }
      } else {
         this.messages.push({
            role: 'ai',
            content: `<span style="color: red;">[错误: ${escapeHtml(finalErrorMessage)}]</span>`,
            time: this.getCurrentTime()
         });
      }
      this.scrollToBottom();

      if (this.eventSource) {
        this.eventSource.close();
        this.eventSource = null;
      }
    },

    loadPageSuggestion(pageName) {
      if (!pageName || !this.userId || !this.showPreGeneratedAdvice) return;
      if (!this.$store || !this.$store.dispatch) {
          console.error("Vuex store or dispatch not available.");
          return;
      }

      const suggestion = this.$store.getters.getPageSuggestion ? this.$store.getters.getPageSuggestion(pageName) : null;
      if (suggestion) {
        this.pageSuggestion = suggestion;
        if (!this.hasMessages && this.visible) this.displayPageSuggestion();
        return;
      }

      this.$store.dispatch('user/getPageSuggestion', pageName)
        .then(suggestion => {
          if (suggestion) {
             this.pageSuggestion = suggestion;
             if (!this.hasMessages && this.visible) this.displayPageSuggestion();
          }
        })
        .catch(error => {
          console.error(`加载页面 '${pageName}' 建议失败:`, error);
        });
    },

    displayPageSuggestion() {
      if (!this.pageSuggestion || this.hasMessages) return;
      const suggestionContent = this.pageSuggestion.content || this.pageSuggestion;
      this.messages.push({
        role: 'ai',
        content: `<strong>针对您的健康状况，关于${this.getPageDisplayName()}的建议：</strong><br><br>${suggestionContent}`,
        time: this.getCurrentTime()
      });
      this.$nextTick(this.scrollToBottom);
    },

    getPageDisplayName() {
      const pageNames = {
        'healthAssessment': '健康评估', 'diet': '饮食计划', 'exercise': '运动建议',
        'sleep': '睡眠质量', 'mentalHealth': '心理健康'
      };
      return pageNames[this.pageName] || this.pageName;
    },
  },
};
</script>

<style lang="scss" scoped src="@/styles/ai-qa.scss"></style>