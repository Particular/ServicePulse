<script>
export default {
  name: "AutoRefresh",
  emits: ["tick"],
  data: () => ({
    intervalRef: undefined
  }),
  props: {
    interval: Number,
    isActive: Boolean
  },
  created() {
    this.intervalRef = setInterval(() => {
      if (this.isActive) {
        console.log("Tick emitted.");
        this.$emit("tick");
      } else {
        console.log("No tick was emitted.");
      }
    }, this.interval);
  },
  unmounted() {
    clearInterval(this.intervalRef);
  },
};
</script>

<template>
    <!-- AutoRefresh -->
</template>