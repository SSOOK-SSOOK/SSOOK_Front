<template>
  <div class="p-3 text-white">
    <h2>마이페이지</h2>
    
    <div v-if="authStore.user" class="profile-section mt-5 text-center">
        <div class="avatar bg-secondary rounded-circle d-inline-block mb-3" style="width: 100px; height: 100px;"></div>
        <h3 class="fw-bold">{{ authStore.user.nickname }}</h3>
        <p class="text-secondary">{{ authStore.user.email }}</p>
        <p class="text-light mt-3">{{ authStore.user.intro || '자기소개가 없습니다.' }}</p>
    </div>
    <div v-else class="text-center mt-5">
      <div class="spinner-border text-light" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <div class="mt-5 d-grid gap-2 col-8 mx-auto">
      <button @click="handleLogout" class="btn btn-outline-danger py-2 fw-bold">
        로그아웃
      </button>
    </div>

    <div class="mt-3 text-center">
       <button @click="handleWithdraw" class="btn btn-link text-secondary text-decoration-none small">
        회원 탈퇴
      </button>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { withdraw } from '@/api/user'; // Assuming withdraw logic exists
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

onMounted(() => {
  if (!authStore.user) {
    authStore.fetchUserInfo();
  }
});

const handleLogout = () => {
  authStore.logout();
};

const handleWithdraw = async () => {
  if(confirm('정말로 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
     try {
       await withdraw(authStore.user.user_id); // Assuming user object has user_id
       alert('탈퇴되었습니다.');
       authStore.logout();
     } catch (e) {
       console.error(e);
       alert('탈퇴 처리에 실패했습니다.');
     }
  }
}
</script>
