<template>
  <div class="page-container text-white">
    <!-- 상단 헤더 (틱톡 스타일) -->
    <div class="header d-flex justify-content-center align-items-center py-3 border-bottom border-dark">
      <span class="fw-bold fs-5 font-primary">{{ authStore.user?.nickname || '마이페이지' }}</span>
      <button class="btn btn-icon position-absolute end-0 me-3 text-white" @click="$router.push('/profile/edit')">
          <i class="bi bi-gear fs-4"></i>
      </button>
    </div>

    <!-- 프로필 섹션 -->
    <div class="profile-section text-center mt-4">
      <div class="avatar-container mb-3 position-relative d-inline-block">
        <div class="avatar rounded-circle bg-secondary d-flex justify-content-center align-items-center overflow-hidden gradient-border p-1">
             <div class="w-100 h-100 rounded-circle overflow-hidden bg-black">
                <img 
                    v-if="authStore.user?.profileImage" 
                    :src="authStore.user.profileImage" 
                    alt="Profile" 
                    class="w-100 h-100 object-fit-cover"
                >
                <i v-else class="bi bi-person-fill text-white" style="font-size: 3rem;"></i>
             </div>
        </div>
      </div>
      
      <h3 class="fw-bold fs-4 mb-1 font-primary">@{{ authStore.user?.nickname }}</h3>
      
      <!-- 한줄 소개 -->
      <div class="mt-3 px-4 text-center">
         <p class="text-secondary text-break small" style="white-space: pre-line;">{{ authStore.user?.intro || '자기소개를 입력해보세요.' }}</p>
      </div>
      
      <!-- 버튼 그룹 -->
      <div class="d-flex justify-content-center gap-2 px-4 mt-4">
        <button @click="$router.push('/profile/edit')" class="btn btn-dark border-secondary text-white flex-grow-1 py-2 fw-semibold rounded-pill">
            프로필 편집
        </button>
        <button @click="handleLogout" class="btn btn-dark border-secondary text-white flex-grow-0 px-3 py-2 rounded-pill">
            <i class="bi bi-box-arrow-right"></i>
        </button>
      </div>

    </div>
    
    <!-- 탭 메뉴 -->
    <div class="d-flex border-bottom border-dark mt-5 sticky-top bg-black z-2">
        <div 
            class="flex-grow-1 text-center py-3 cursor-pointer tab-item"
            :class="{ active: activeTab === 'quiz' }"
            @click="activeTab = 'quiz'"
        >
            <i class="bi bi-pencil-square fs-5"></i>
        </div>
        <div 
            class="flex-grow-1 text-center py-3 cursor-pointer tab-item"
            :class="{ active: activeTab === 'like' }"
            @click="activeTab = 'like'"
        >
             <i class="bi bi-heart-fill fs-5"></i>
        </div>
        <div 
            class="flex-grow-1 text-center py-3 cursor-pointer tab-item"
            :class="{ active: activeTab === 'bookmark' }"
            @click="activeTab = 'bookmark'"
        >
             <i class="bi bi-bookmark-fill fs-5"></i>
        </div>
    </div>
    
    <!-- 탭 컨텐츠 -->
    <div class="content-area min-vh-50">
        
        <!-- Tab 1: Quiz -->
        <div v-if="activeTab === 'quiz'" class="text-center py-5 text-secondary fade-in">
            <i class="bi bi-pencil-fill fs-1 mb-3 d-block opacity-50"></i>
            <p>풀이한 퀴즈 내역이 없습니다.</p>
            <button class="btn btn-sm btn-outline-secondary rounded-pill mt-2">퀴즈 풀러가기</button>
        </div>

        <!-- Tab 2: Liked Videos -->
        <div v-if="activeTab === 'like'" class="fade-in">
             <div v-if="loadingLikes" class="text-center py-5">
                 <div class="spinner-border text-secondary" role="status"></div>
             </div>
             
             <div v-else-if="likedVideos.length === 0" class="text-center py-5 text-secondary">
                 <i class="bi bi-heart fs-1 mb-3 d-block opacity-50"></i>
                 <p>좋아요 표시한 영상이 없습니다.</p>
             </div>

             <div v-else class="row g-1 mt-0">
                <div class="col-4" v-for="video in likedVideos" :key="video.videoId">
                    <!-- 3:4 Aspect Ratio for Shorts -->
                    <div 
                        @click="goToVideo(video.videoId)"
                        class="bg-black ratio position-relative video-thumbnail border border-secondary border-opacity-10 rounded-1 overflow-hidden" 
                        style="--bs-aspect-ratio: 133.33%;"
                    >
                        <img :src="video.thumbnailUrl" class="w-100 h-100 object-fit-cover" loading="lazy">
                        
                        <!-- Overlay Gradients -->
                        <div class="position-absolute w-100 h-100 top-0 start-0" style="background: linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 40%);"></div>

                        <i class="bi bi-heart-fill position-absolute bottom-0 end-0 m-2 text-accent small drop-shadow"></i>
                        <span class="position-absolute bottom-0 start-0 m-1 ms-2 text-white x-small text-shadow fw-bold">
                            <i class="bi bi-play-fill display-7"></i> {{ formatCount(video.viewCount) }}
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Tab 3: Bookmarks/Saved -->
        <div v-if="activeTab === 'bookmark'" class="text-center py-5 text-secondary fade-in">
             <i class="bi bi-bookmark-star fs-1 mb-3 d-block opacity-50"></i>
            <p>저장한 콘텐츠가 없습니다.</p>
        </div>

    </div>

  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import { getMyLikedVideos } from '@/api/video';

const authStore = useAuthStore();
const router = useRouter(); 
const activeTab = ref('like'); 
const likedVideos = ref([]);
const loadingLikes = ref(false);

onMounted(async () => {
    if (authStore.isAuthenticated) {
        await authStore.fetchUserInfo();
    }
    // 초기 로드 (like 탭이 기본이므로)
    if (activeTab.value === 'like') {
        fetchLikedVideos();
    }
});

watch(activeTab, (newTab) => {
    if (newTab === 'like') {
        fetchLikedVideos();
    }
});

const fetchLikedVideos = async () => {
    loadingLikes.value = true;
    try {
        const response = await getMyLikedVideos({ page: 1, size: 50 }); // 가져올 개수
        likedVideos.value = response.data.data.videos;
    } catch (error) {
        console.error("Failed to fetch liked videos", error);
    } finally {
        loadingLikes.value = false;
    }
};

const formatCount = (num) => {
    if (!num) return '0';
    if (num >= 10000) return (num / 10000).toFixed(1) + '만';
    if (num >= 1000) return (num / 1000).toFixed(1) + '천';
    return num;
};

const goToVideo = (videoId) => {
    router.push({ path: '/', query: { videoId } });
};

const handleLogout = () => {
  if (confirm('로그아웃 하시겠습니까?')) {
      authStore.logout();
  }
};
</script>

<style scoped>
.page-container {
    padding-bottom: 80px;
}

.font-primary {
    font-family: 'Pretendard', sans-serif;
}

.avatar {
    width: 96px;
    height: 96px;
}

.gradient-border {
    background: linear-gradient(45deg, var(--accent-color, #C0FF00), #333);
}

.btn-dark {
    background-color: rgba(255, 255, 255, 0.1);
    border-color: transparent;
}
.btn-dark:hover {
    background-color: rgba(255, 255, 255, 0.2);
}

.tab-item {
    color: #888;
    border-bottom: 2px solid transparent;
    transition: all 0.2s;
    cursor: pointer;
}
.tab-item.active {
    color: var(--accent-color, #C0FF00); 
    border-bottom-color: var(--accent-color, #C0FF00);
}
.tab-item:hover {
    color: white;
}

.video-thumbnail {
    cursor: pointer;
    transition: filter 0.2s;
}
.video-thumbnail:active {
    filter: brightness(0.8);
}

.text-accent {
    color: var(--accent-color, #C0FF00);
}

.x-small {
    font-size: 0.75rem;
}

.text-shadow {
    text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
}

.drop-shadow {
    filter: drop-shadow(0 1px 2px rgba(0,0,0,0.5));
}

/* Animation */
.fade-in {
    animation: fadeIn 0.3s ease-out;
}
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}
</style>
