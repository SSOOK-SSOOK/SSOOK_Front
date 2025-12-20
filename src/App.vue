<template>
  <div class="app-layout">
    <main class="content-area">
      <router-view />
    </main>
    <BottomNav v-if="!$route.meta.hideBottomNav" />
    <ToastContainer />
    <ConfirmDialog />
  </div>
</template>

<script setup>
import BottomNav from './components/layout/BottomNav.vue'
import ToastContainer from './components/common/ToastContainer.vue'
import ConfirmDialog from './components/common/ConfirmDialog.vue'
</script>

<style>
/* 전역 스타일은 style.css에서 관리하지만, 레이아웃 관련은 여기서 보강 */
.app-layout {
  max-width: 720px; /* TikTok Style Layout Width */
  margin: 0 auto;
  min-height: 100vh;
  background-color: var(--bg-color);
  position: relative;
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.05);
  padding-bottom: 60px; /* Bottom Nav Height */
  overflow-x: hidden;
}
</style>
