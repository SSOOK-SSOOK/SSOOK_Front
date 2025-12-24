<template>
  <div class="login-container d-flex flex-column justify-content-center align-items-center app-text app-bg">
    <div class="logo mb-5">
      <h1 class="fw-bold neon-text">쑥쑥</h1>
      <p class="app-text-secondary small">숏폼 학습 플랫폼</p>
    </div>

    <form @submit.prevent="handleLogin" class="w-100 p-4" style="max-width: 400px;">
      <div class="mb-3">
        <label class="form-label app-text-secondary small">아이디</label>
        <input 
          v-model="loginId" 
          type="text" 
          class="form-control app-card app-text border-secondary" 
          placeholder="아이디를 입력하세요"
          required
        >
      </div>
      <div class="mb-5">
        <label class="form-label app-text-secondary small">비밀번호</label>
        <input 
          v-model="password" 
          type="password" 
          class="form-control app-card app-text border-secondary" 
          placeholder="비밀번호를 입력하세요"
          required
        >
      </div>

      <button type="submit" class="btn btn-primary w-100 py-3 fw-bold neon-btn mb-3 text-black">
        로그인
      </button>
      
      <div class="text-center">
        <router-link to="/signup" class="app-text-secondary text-decoration-none small">
          계정이 없으신가요? <span class="app-text fw-bold">회원가입</span>
        </router-link>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const loginId = ref('');
const password = ref('');

const handleLogin = async () => {
  try {
    await authStore.login(loginId.value, password.value);
    router.push('/');
  } catch (error) {
    alert('로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.');
  }
};
</script>

<style scoped>
.login-container {
  min-height: 100vh;
}

.neon-text {
  color: #fff;
  text-shadow: 0 0 10px rgba(192, 255, 0, 0.7), 0 0 20px rgba(192, 255, 0, 0.5);
  font-size: 3rem;
  letter-spacing: -1px;
}

.neon-btn {
  background-color: var(--accent-color);
  border: none;
  box-shadow: 0 0 15px rgba(192, 255, 0, 0.4);
  transition: all 0.3s ease;
}

.neon-btn:hover {
  background-color: #aed900;
  box-shadow: 0 0 25px rgba(192, 255, 0, 0.6);
  transform: translateY(-2px);
}
</style>
