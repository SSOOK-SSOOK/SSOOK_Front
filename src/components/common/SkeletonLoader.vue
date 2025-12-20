<template>
  <div class="skeleton-loader animate-pulse">
    <div v-for="n in count" :key="n" class="d-flex gap-3 mb-4">
      <!-- Avatar Skeleton -->
      <div class="skeleton-avatar flex-shrink-0 bg-secondary bg-opacity-25 rounded-circle" style="width: 40px; height: 40px;"></div>
      
      <!-- Content Skeleton -->
      <div class="flex-grow-1">
        <div class="skeleton-text bg-secondary bg-opacity-25 rounded mb-2" style="width: 30%; height: 14px;"></div>
        <div class="skeleton-text bg-secondary bg-opacity-25 rounded mb-1" style="width: 80%; height: 12px;"></div>
        <div class="skeleton-text bg-secondary bg-opacity-25 rounded" style="width: 50%; height: 12px;"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
    count: {
        type: Number,
        default: 3
    }
});
</script>

<style scoped>
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .5;
  }
}
</style>
