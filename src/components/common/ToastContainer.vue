<template>
  <div class="toast-container fixed-bottom p-3 start-50 translate-middle-x" style="z-index: 1060; pointer-events: none;">
    <TransitionGroup name="toast-slide">
      <div 
        v-for="toast in toastStore.toasts" 
        :key="toast.id"
        class="toast-item d-flex align-items-center justify-content-between p-3 mb-2 rounded shadow-sm"
        :class="getToastClass(toast.type)"
      >
        <div class="d-flex align-items-center gap-2">
            <i :class="getIconClass(toast.type)"></i>
            <span class="fw-medium">{{ toast.message }}</span>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { useToastStore } from '@/stores/toast';

const toastStore = useToastStore();

const getToastClass = (type) => {
    switch(type) {
        case 'success': return 'bg-dark text-white border border-success border-opacity-50'; // Dark theme customized
        case 'error': return 'bg-dark text-white border border-danger border-opacity-50';
        case 'warning': return 'bg-dark text-white border border-warning border-opacity-50';
        default: return 'bg-dark text-white border border-secondary border-opacity-50 text-light';
    }
    // Alternatively, for a more "glass" look:
    // return 'glass-toast text-white';
};

const getIconClass = (type) => {
    switch(type) {
        case 'success': return 'bi bi-check-circle-fill text-success';
        case 'error': return 'bi bi-exclamation-circle-fill text-danger';
        case 'warning': return 'bi bi-exclamation-triangle-fill text-warning';
        default: return 'bi bi-info-circle-fill text-info';
    }
};
</script>

<style scoped>
.toast-container {
    width: 100%;
    max-width: 400px;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.toast-item {
    pointer-events: auto; /* allow clicking if we add close buttons later */
    width: 100%;
    backdrop-filter: blur(10px);
    background: rgba(33, 37, 41, 0.95) !important; /* bootstrap dark usually, enforcing slight transparency */
    box-shadow: 0 4px 12px rgba(0,0,0,0.3) !important;
}

/* Transitions */
.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-slide-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.toast-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}
</style>
