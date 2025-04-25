<template>
  <section class="app-main">
    <keep-alive :include="cachedViews">
      <router-view v-if="!$route.meta.noCache" :key="$route.fullPath" />
    </keep-alive>
    <router-view v-if="$route.meta.noCache" :key="$route.fullPath" />
  </section>
</template>

<script>
export default {
  name: 'AppMain',
  computed: {
    cachedViews() {
      return this.$store.state.tagsView.cachedViews
    }
  }
}
</script>

<style scoped>
.app-main {
  min-height: 100vh;
  width: 100%;
  position: relative;
  overflow: hidden;
}
</style>
