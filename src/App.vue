<template>
  <div id="app">
    <router-view />
    <!-- 报告提示悬浮球 -->
    <ReportSuggestionBubble />
  </div>
</template>

<script>
import ReportSuggestionBubble from './components/ReportSuggestionBubble.vue';
import { mapGetters } from 'vuex'

export default {
  name: 'App',
  components: { ReportSuggestionBubble },
  data() {
    return {}
  },
  computed: {
    ...mapGetters([
      'token'
    ]),
    isLoggedIn() {
      return !!this.token
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
