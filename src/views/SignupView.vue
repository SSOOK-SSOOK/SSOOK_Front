<template>
  <div class="signup-container d-flex flex-column justify-content-center align-items-center app-text app-bg">
    <div class="logo mb-4">
      <h2 class="fw-bold app-text">회원가입</h2>
    </div>

    <form @submit.prevent="handleSignup" class="w-100 p-4" style="max-width: 400px;">
      <div class="mb-3">
        <label class="form-label app-text-secondary small">이메일 (아이디)</label>
        <input 
          v-model="email" 
          type="email" 
          class="form-control app-card app-text border-secondary" 
          placeholder="example@email.com"
          required
        >
      </div>
      
      <div class="mb-3">
        <label class="form-label app-text-secondary small">비밀번호</label>
        <input 
          v-model="password" 
          type="password" 
          class="form-control app-card app-text border-secondary" 
          placeholder="비밀번호 입력"
          required
        >
      </div>

      <div class="mb-3">
        <label class="form-label app-text-secondary small">닉네임</label>
        <input 
          v-model="nickname" 
          type="text" 
          class="form-control app-card app-text border-secondary" 
          placeholder="닉네임 입력"
          required
        >
      </div>

       <div class="mb-5">
        <label class="form-label app-text-secondary small">한줄 소개</label>
        <textarea 
          v-model="intro" 
          class="form-control app-card app-text border-secondary" 
          placeholder="자기소개를 입력해주세요"
          rows="3"
        ></textarea>
      </div>

      <button type="submit" class="btn btn-primary w-100 py-3 fw-bold neon-btn mb-3">
        가입하기
      </button>
      
      <div class="text-center">
        <router-link to="/login" class="app-text-secondary text-decoration-none small">
          이미 계정이 있으신가요? <span class="app-text fw-bold">로그인</span>
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

const email = ref('');
const password = ref('');
const nickname = ref('');
const intro = ref('');

const handleSignup = async () => {
  try {
    await authStore.signup({
        email: email.value, // DB Schema says 'email', API calls it 'loginId' in some places. Let's send both or clarify. 
        // Based on API_SPEC "Request: { loginId, password, nickname, ... }"
        // Schema: email VARCHAR(100) NOT NULL UNIQUE
        // I will map email input to loginId field for API consistency.
        loginId: email.value,
        password: password.value,
        nickname: nickname.value,
        intro: intro.value
    });
    alert('회원가입이 완료되었습니다! 로그인해주세요.');
    router.push('/login');
  } catch (error) {
    alert('회원가입에 실패했습니다.');
    console.error(error);
  }
};
</script>

<style scoped>
.signup-container {
  min-height: 100vh;
}

.neon-btn {
  background-color: var(--accent-color);
  border: none;
  box-shadow: 0 0 15px rgba(254, 44, 85, 0.4);
  transition: all 0.3s ease;
}

.neon-btn:hover {
  background-color: #e0244a;
  box-shadow: 0 0 25px rgba(254, 44, 85, 0.6);
  transform: translateY(-2px);
}
</style>
