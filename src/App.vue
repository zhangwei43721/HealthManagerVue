<template>
  <div id="app">
    <router-view />
    <!-- 聊天气泡按钮 -->
    <button v-if="!showChat" class="chat-bubble-btn" @click="showChat = true" title="智能健康问答">
      <svg width="32" height="32" viewBox="0 0 32 32">
        <circle cx="16" cy="16" r="16" fill="#42b983"/>
        <text x="16" y="22" fill="#fff" font-size="16" font-family="Arial" text-anchor="middle">AI</text>
      </svg>
    </button>
    <!-- 聊天弹窗 -->
    <AiHealthQA v-if="showChat" :visible="showChat" @close="showChat = false" />
  </div>
</template>

<script>
import AiHealthQA from './views/health/ai-qa.vue';

export default {
  name: 'App',
  components: { AiHealthQA },
  data() {
    return {
      showChat: false
    }
  }
}
</script>

<style>
.app-main{
  padding: 10px;
  background-color: rgb(247, 250, 250);
}
.el-card{
  margin-bottom:15px;
}
.chat-bubble-btn {
  position: fixed;
  right: 36px;
  bottom: 36px;
  z-index: 9998;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  background: #fff;
  box-shadow: 0 4px 18px rgba(66,185,131,0.16);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: box-shadow 0.2s;
}
.chat-bubble-btn:hover {
  box-shadow: 0 6px 24px rgba(66,185,131,0.25);
  background: #f6fffa;
}
</style>
