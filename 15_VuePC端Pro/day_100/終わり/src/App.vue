<template>
  <div id="app" :class="style">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',
  computed: {
    style() {
      let themeClassName = ''
      switch (this.$store.state.settings.theme) {
        case '#409EFF':
          themeClassName = 'skyblue-theme'
          break
        case '#1890FF':
          themeClassName = 'deepblue-theme'
          break
        case '#304156':
          themeClassName = 'molv-theme'
          break
        default:
          themeClassName = 'default-theme'
      }
      return {
        [themeClassName]: true
      }
    }
  }
}
</script>
