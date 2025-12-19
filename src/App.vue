<template>
  <div class="app-layout">
    <main class="content-area">
      <router-view />
    </main>
    <BottomNav />
  </div>
</template>

<script setup>
import BottomNav from './components/layout/BottomNav.vue'
</script>

<style>
/* 전역 스타일 */
body {
  background-color: #f0f2f5; /* 데스크탑 배경색 */
  margin: 0;
}

.app-layout {
  max-width: 480px;
  min-height: 100vh;
  margin: 0 auto;
  background-color: #ffffff;
  position: relative;
  box-shadow: 0 0 15px rgba(0,0,0,0.1); /* 앱 느낌 나는 그림자 */
  padding-bottom: 60px; /* 하단 네비게이션 높이만큼 여백 */
}

/* 스크롤바 숨기기 등 모바일 느낌 추가 가능 */
</style>
