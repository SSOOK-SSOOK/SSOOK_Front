<template>
  <div class="page-container text-white bg-black min-vh-100">
    <!-- Header -->
    <div class="header d-flex align-items-center justify-content-between px-3 py-3 border-bottom border-secondary">
      <button @click="$router.go(-1)" class="btn btn-link text-white p-0 text-decoration-none">
        <i class="bi bi-chevron-left fs-4"></i>
      </button>
      <span class="fw-bold fs-6">프로필 편집</span>
      <button @click="handleSave" class="btn btn-link text-white p-0 text-decoration-none fw-bold text-danger" :disabled="isLoading">
        저장
      </button>
    </div>

    <!-- Edit Form -->
    <div class="p-4">
        <!-- Avatar Change Placeholder -->
        <div class="text-center mb-5">
            <div class="position-relative d-inline-block">
                <div class="avatar rounded-circle bg-secondary d-flex justify-content-center align-items-center opacity-75">
                    <i class="bi bi-camera-fill text-white fs-3"></i>
                </div>
            </div>
            <p class="text-secondary small mt-2">사진 변경</p>
        </div>

        <div class="mb-4">
            <label class="form-label text-secondary small">닉네임</label>
            <input 
                v-model="form.nickname" 
                type="text" 
                class="form-control bg-dark text-white border-secondary"
                placeholder="닉네임"
            >
        </div>

        <div class="mb-4">
            <label class="form-label text-secondary small">소개</label>
            <textarea 
                v-model="form.intro" 
                class="form-control bg-dark text-white border-secondary" 
                rows="3" 
                placeholder="소개"
            ></textarea>
        </div>

        <!-- Withdraw Button -->
        <div class="mt-5 text-center pt-5 border-top border-secondary">
             <button @click="handleWithdraw" class="btn btn-link text-danger text-decoration-none small">
                 회원 탈퇴
             </button>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { updateMyInfo, withdraw } from '@/api/user';

const router = useRouter();
const authStore = useAuthStore();
const isLoading = ref(false);

const form = reactive({
    nickname: '',
    intro: ''
});

onMounted(async () => {
    if (!authStore.user) {
        await authStore.fetchUserInfo();
    }
    if (authStore.user) {
        form.nickname = authStore.user.nickname;
        form.intro = authStore.user.intro;
    }
});

const handleSave = async () => {
    if (!form.nickname.trim()) {
        alert('닉네임을 입력해주세요.');
        return;
    }

    try {
        isLoading.value = true;
        await updateMyInfo({
            nickname: form.nickname,
            intro: form.intro
        });
        
        // Update Store
        await authStore.fetchUserInfo();
        
        alert('저장되었습니다.');
        router.push('/mypage');
    } catch (error) {
        console.error(error);
        alert('저장에 실패했습니다.');
    } finally {
        isLoading.value = false;
    }
};

const handleWithdraw = async () => {
    if (!confirm('정말로 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;

    try {
        await withdraw(authStore.user.userId);
        alert('탈퇴 처리가 완료되었습니다.');
        authStore.logout();
    } catch (error) {
        console.error(error);
        alert('회원 탈퇴에 실패했습니다.');
    }
};
</script>

<style scoped>
.avatar {
    width: 96px;
    height: 96px;
}
</style>
