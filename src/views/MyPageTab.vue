<template>
  <div class="page-container text-white">
    <!-- 상단 헤더 (틱톡 스타일) -->
    <div class="header d-flex justify-content-center align-items-center py-3 border-bottom border-dark">
      <span class="fw-bold fs-5">{{ authStore.user?.nickname || '마이페이지' }}</span>
      <i class="bi bi-list position-absolute end-0 me-3 fs-4"></i>
    </div>

    <!-- 프로필 섹션 -->
    <div class="profile-section text-center mt-4">
      <div class="avatar-container mb-3 position-relative d-inline-block">
        <div class="avatar rounded-circle bg-secondary d-flex justify-content-center align-items-center">
             <i class="bi bi-person-fill text-white" style="font-size: 3rem;"></i>
        </div>
        <div class="add-icon bg-primary text-white rounded-circle position-absolute bottom-0 end-0 d-flex justify-content-center align-items-center">
            <i class="bi bi-plus"></i>
        </div>
      </div>
      
      <h3 class="fw-bold fs-4 mb-1">@{{ authStore.user?.nickname }}</h3>
      
      <!-- 팔로잉/팔로워 (더미 데이터 or 추후 구현) -->
      <div class="d-flex justify-content-center gap-4 my-3 text-center">
          <div>
              <div class="fw-bold fs-5">0</div>
              <div class="text-secondary small">팔로잉</div>
          </div>
          <div>
              <div class="fw-bold fs-5">0</div>
              <div class="text-secondary small">팔로워</div>
          </div>
          <div>
              <div class="fw-bold fs-5">0</div>
              <div class="text-secondary small">좋아요</div>
          </div>
      </div>
      
      <!-- 버튼 그룹 -->
      <div class="d-flex justify-content-center gap-2 px-4 mt-4">
        <button @click="$router.push('/profile/edit')" class="btn btn-dark border-secondary text-white flex-grow-1 py-2 fw-semibold">
            프로필 편집
        </button>
        <button @click="handleLogout" class="btn btn-dark border-secondary text-white flex-grow-0 px-3 py-2">
            <i class="bi bi-box-arrow-right"></i>
        </button>
      </div>

      <!-- 한줄 소개 -->
      <div class="mt-4 px-4 text-start">
         <p class="text-light text-break" style="white-space: pre-line;">{{ authStore.user?.intro || '자기소개를 입력해보세요.' }}</p>
      </div>
      
    </div>
    
    <!-- 탭 메뉴 (비디오/좋아요 등) placeholder -->
    <div class="d-flex border-top border-dark mt-4">
        <div class="flex-grow-1 text-center py-3 border-bottom border-white">
            <i class="bi bi-grid-3x3 fs-5"></i>
        </div>
        <div class="flex-grow-1 text-center py-3 text-secondary">
             <i class="bi bi-heart fs-5"></i>
        </div>
        <div class="flex-grow-1 text-center py-3 text-secondary">
             <i class="bi bi-lock fs-5"></i>
        </div>
    </div>
    
    <!-- 비디오 그리드 Placeholder -->
    <div class="row g-1 mt-0">
        <div class="col-4" v-for="n in 9" :key="n">
            <div class="bg-secondary bg-opacity-25 ratio ratio-1x1 d-flex justify-content-center align-items-center">
                <span class="text-secondary small">Video {{ n }}</span>
            </div>
        </div>
    </div>

  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

onMounted(async () => {
    // 마이페이지 진입 시 최신 정보 갱신
    if (authStore.isAuthenticated) {
        await authStore.fetchUserInfo();
    }
});

const handleLogout = () => {
  if (confirm('로그아웃 하시겠습니까?')) {
      authStore.logout();
  }
};
</script>

<style scoped>
.avatar {
    width: 96px;
    height: 96px;
    background-color: #333;
}

.add-icon {
    width: 24px;
    height: 24px;
    border: 2px solid #121212;
}

.btn-dark {
    background-color: #333;
    border-color: #444;
}

.btn-dark:hover {
    background-color: #444;
}

.text-secondary {
    color: #8c8c8c !important;
}
</style>
