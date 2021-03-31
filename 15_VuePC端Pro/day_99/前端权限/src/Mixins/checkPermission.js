export default {
  methods: {
    checkPermission(key) {
      return this.$store.getters.roles.points.includes(key)
    }
  }
}
