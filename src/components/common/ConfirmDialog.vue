<template>
  <Transition name="fade">
    <div v-if="dialogStore.isVisible" class="dialog-overlay d-flex align-items-center justify-content-center">
      <div class="dialog-box bg-dark text-white p-4 rounded-4 shadow-lg text-center" style="max-width: 320px; width: 90%;">
        <h5 class="fw-bold mb-2">{{ dialogStore.title }}</h5>
        <p class="text-secondary small mb-4">{{ dialogStore.message }}</p>
        
        <div class="d-flex gap-2 justify-content-center">
          <button 
            @click="dialogStore.cancel" 
            class="btn btn-secondary flex-fill rounded-pill py-2"
          >
            취소
          </button>
          <button 
            @click="dialogStore.confirm" 
            class="btn btn-danger flex-fill rounded-pill py-2"
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { useDialogStore } from '@/stores/dialog';

const dialogStore = useDialogStore();
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 2000; /* Higher than offcanvas (1045) and toast (1060) */
}

.dialog-box {
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Animation */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
