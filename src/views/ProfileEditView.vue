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
        <!-- Profile Image Selection -->
        <div class="mb-5">
            <p class="text-secondary small mb-3">프로필 이미지 선택</p>
            <div class="row g-3 justify-content-center">
                <div 
                    v-for="(img, index) in profileImages" 
                    :key="index"
                    class="col-4 position-relative cursor-pointer text-center"
                    @click="selectImage(img)"
                >
                    <img 
                        :src="img" 
                        class="avatar rounded opacity-75 object-fit-cover" 
                        :class="{ 'border border-2 border-danger opacity-100': form.profileImage === img }"
                        alt="Profile Option"
                    >
                    <div v-if="form.profileImage === img" class="position-absolute top-0 end-0 p-1 me-2">
                        <i class="bi bi-check-circle-fill text-danger bg-white rounded-circle" style="font-size: 0.8rem;"></i>
                    </div>
                </div>
            </div>
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
import { useToastStore } from '@/stores/toast';
import { useDialogStore } from '@/stores/dialog';
import { updateMyInfo, withdraw, getProfileImages } from '@/api/user';

const router = useRouter();
const authStore = useAuthStore();
const toastStore = useToastStore();
const dialogStore = useDialogStore();
const isLoading = ref(false);
const profileImages = ref([]);

const form = reactive({
    nickname: '',
    intro: '',
    profileImage: ''
});

onMounted(async () => {
    // 1. 내 정보 가져오기
    if (!authStore.user) {
        await authStore.fetchUserInfo();
    }
    if (authStore.user) {
        form.nickname = authStore.user.nickname;
        form.intro = authStore.user.intro;
        // 이미지가 없으면 기본값 (profile9.png) 설정
        form.profileImage = authStore.user.profileImage || '/images/profile9.png';
    }

    // 2. 프로필 이미지 목록 가져오기
    try {
        const response = await getProfileImages();
        // API response structure: { status: "SUCCESS", message: "...", data: [...] }
        profileImages.value = response.data.data;
    } catch (error) {
        console.error("Failed to fetch profile images:", error);
    }
});

const selectImage = (img) => {
    form.profileImage = img;
};

const handleSave = async () => {
    if (!form.nickname.trim()) {
        toastStore.addToast('닉네임을 입력해주세요.', 'warning');
        return;
    }

    try {
        isLoading.value = true;
        await updateMyInfo({
            nickname: form.nickname,
            intro: form.intro,
            profileImage: form.profileImage
        });
        
        // Update Store
        await authStore.fetchUserInfo();
        
        toastStore.addToast('저장되었습니다.', 'success');
        router.push('/mypage');
    } catch (error) {
        console.error(error);
        toastStore.addToast('저장에 실패했습니다.', 'error');
    } finally {
        isLoading.value = false;
    }
};

const handleWithdraw = async () => {
    const confirmed = await dialogStore.showConfirm(
        '회원 탈퇴', 
        '정말로 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.'
    );
    
    if (!confirmed) return;

    try {
        await withdraw(authStore.user.userId);
        toastStore.addToast('탈퇴 처리가 완료되었습니다.', 'info');
        authStore.logout();
    } catch (error) {
        console.error(error);
        toastStore.addToast('회원 탈퇴에 실패했습니다.', 'error');
    }
};
</script>

<style scoped>
.avatar {
    width: 80px;
    height: 80px;
    transition: all 0.2s;
}
.cursor-pointer {
    cursor: pointer;
}
.object-fit-cover {
    object-fit: cover;
}
</style>
