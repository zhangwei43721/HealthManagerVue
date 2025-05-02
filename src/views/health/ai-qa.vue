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
import axios from 'axios';

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
      visible: true,
      isMounted: false,
      historyLoaded: false
    };
  },

  computed: {
    hasMessages() {
      return this.messages.length > 0;
    },
    token() {
      return this.$store.getters.token;
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
    token: {
      immediate: true,
      handler(newToken, oldToken) {
        console.log(`[Token Watcher] Triggered. New Token: ${!!newToken}, Old Token: ${!!oldToken}`);
        if (newToken) {
          this.tryLoadHistory();
        } else {
          console.log('[Token Watcher] Token removed. Clearing messages and resetting flags.');
          this.messages = [];
          this.conversationId = null;
          this.pageSuggestion = null;
          this.historyLoaded = false;
          this.isMounted = false;
        }
      }
    }
  },

  created() {
    console.log('[Created Hook] Component created.');
  },

  mounted() {
    console.log('[Mounted Hook] Component mounted.');
    this.isMounted = true;
    this.tryLoadHistory();
    this.scrollToBottom();
  },

  beforeDestroy() {
    this.isMounted = false;
    if (this.eventSource) {
        this.eventSource.close();
        this.eventSource = null;
    }
    if (this.typingTimer) clearTimeout(this.typingTimer);
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
    },

    async sendMsg() {
      const userContent = this.input.trim();
      const photo = this.photoFile;

      if (!userContent && !photo) return;

      const token = this.$store.getters.token;
      if (!token) {
          console.error('[SendMsg Check Failed] token is falsy');
          this.$message.error('无法获取认证信息，请重新登录。');
          return;
      }

      this.loading = true;
      this.isTyping = true;
      this.photoUploading = !!photo;
      this.input = '';
      const tempPhotoFile = this.photoFile;
      this.photoFile = null;
      if (this.$refs.photoInput) this.$refs.photoInput.value = null;

      this.scrollToBottom();

      const assistantMessage = {
          role: 'assistant',
          content: '',
          time: this.getCurrentTime(),
          isLoading: true
      };
      this.messages.push(assistantMessage);
      const assistantMsgIndex = this.messages.length - 1;

      this.scrollToBottom();

      const formData = new FormData();
      const encoder = new TextEncoder();
      
      const contentToSend = (tempPhotoFile && !userContent) ? ' ' : userContent;
      console.log(`[SendMsg] Content being sent in 'message' part: '${contentToSend}'`);

      const messageBytes = encoder.encode(contentToSend);
      const messageBlob = new Blob([messageBytes], { type: 'text/plain; charset=utf-8' });
      formData.append('message', messageBlob, 'message.txt');

      if (tempPhotoFile) {
          formData.append('file', tempPhotoFile);
      }
      if (this.conversationId) {
        formData.append('conversationId', this.conversationId);
      }

      try {
        const response = await fetch(`${this.apiBaseUrl}/chatStream`, {
          method: 'POST',
          headers: {
            'X-Token': token
          },
          body: formData
        });

        if (!response.ok) {
          let errorBody = '未知错误';
          try {
            errorBody = await response.text();
          } catch (e) {/* ignore */}
          throw new Error(`请求失败 (${response.status}): ${errorBody || response.statusText}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('text/event-stream')) {
           console.warn('Response Content-Type is not text/event-stream, treating as plain text.');
           const responseText = await response.text();
           this.handleNonStreamResponse(responseText, assistantMsgIndex);
        } else {
           this.handleStreamResponse(response, assistantMsgIndex, assistantMessage.time);
        }

      } catch (error) {
         console.error('[SendMsg Error] Full error object caught:', error);
         console.error('[SendMsg Error] Error message property:', error.message);
         console.error('[SendMsg Error] Error name property:', error.name);
        
        this.loading = false;
        this.isTyping = false;
        this.photoUploading = false;
        const errorMsg = error.response && error.response.data ? error.response.data.message || error.response.data : '发送失败，请检查网络或联系管理员';
        if (assistantMsgIndex !== -1 && assistantMsgIndex < this.messages.length) {
          this.$set(this.messages[assistantMsgIndex], 'content', `[请求错误: ${errorMsg}]`);
          this.$set(this.messages[assistantMsgIndex], 'isLoading', false);
          this.$set(this.messages[assistantMsgIndex], 'time', this.getCurrentTime());
        } else {
           console.error('[SendMsg Error] Invalid assistantMsgIndex when handling error.')
        }
      }
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
      const imageDivRegex = /^(<(?:div class="uploaded-image"|div class="detection-result-image")>.*?<\/div>)/s;
      const match = content.match(imageDivRegex);

      if (match) {
        const imageHtml = match[1];
        const restContent = content.substring(imageHtml.length);

        return imageHtml + parseMarkdown(restContent || '');
      } else {
        return parseMarkdown(content);
      }
    },

    loadChatHistoryFromServer() {
      const token = this.$store.getters.token;
      console.log('[Load History] Starting fetch for /viewHistory (Token assumed available)');
      
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
        console.error('[Load History] Failed:', error.message);
        this.historyLoaded = false;
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
                this.loading = false;
                this.isTyping = false;
                return;
            }

            buffer += decoder.decode(value, { stream: true });
            const events = buffer.split('\n\n');
            buffer = events.pop();

            events.forEach(eventString => {
                if (!eventString.trim()) return;

                let eventName = 'message';
                let eventData = '';

                const lines = eventString.split('\n');
                lines.forEach(line => {
                    if (line.startsWith('event:')) {
                        eventName = line.substring('event:'.length).trim();
                    } else if (line.startsWith('data:')) {
                        eventData += line.substring('data:'.length).trim() + '\n';
                    }
                });

                eventData = eventData.trim();

                this.handleSseEvent(eventName, eventData, messageIndex, time);
            });

            reader.read().then(processChunk).catch(error => {
                console.error('Error reading stream:', error);
                this.handleSSEError(messageIndex, time, `读取流错误: ${error.message}`);
                if (tempImageUrl) URL.revokeObjectURL(tempImageUrl);
                this.loading = false;
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
                 const imageHtml = `<div class="detection-result-image"><img src="${eventData}" alt="AI检测结果" style="max-width: 200px; max-height: 200px; border-radius: 4px; margin-bottom: 5px;" /></div>`;
                 this.$set(this.messages, messageIndex, { ...currentMsg, content: imageHtml + (currentMsg.content || '') });
                 this.scrollToBottom();
             }
         } else if (eventData === '[DONE]') {
            console.log('Received [DONE] signal.');
         } else if (eventName === 'message' || eventName === 'data') {
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

    tryLoadHistory() {
      console.log(`[Try Load History] Attempting. isMounted: ${this.isMounted}, token: ${!!this.token}, historyLoaded: ${this.historyLoaded}`);
      if (this.isMounted && this.token && !this.historyLoaded) {
        console.log('[Try Load History] Conditions met. Setting flag and calling loadChatHistoryFromServer().');
        this.historyLoaded = true;
        this.loadChatHistoryFromServer();
        if (this.pageName && this.showPreGeneratedAdvice) {
           console.log('[Try Load History] Also loading page suggestion.');
           this.loadPageSuggestion(this.pageName);
        }
      } else {
        console.log('[Try Load History] Conditions not met or already loaded. Skipping.');
      }
    },

    readFileAsDataURL(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve(e.target.result);
        };
        reader.onerror = (e) => {
          reject(e.target.error);
        };
        reader.readAsDataURL(file);
      });
    },

    handleNonStreamResponse(responseText, messageIndex) {
      if (messageIndex !== -1 && messageIndex < this.messages.length) {
        const currentMsg = this.messages[messageIndex];
        this.$set(this.messages, messageIndex, {
          ...currentMsg,
          content: currentMsg.content ? currentMsg.content + '\n' + responseText : responseText
        });
        this.scrollToBottom();
      } else {
        console.error('[Handle Non-Stream Response] Invalid messageIndex');
      }
    },
  },
};
</script>

<style lang="scss" scoped src="@/styles/ai-qa.scss"></style>