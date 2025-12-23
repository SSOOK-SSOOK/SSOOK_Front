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
             <i class="bi bi-bar-chart-fill fs-5"></i>
        </div>
    </div>
    
    <!-- 탭 컨텐츠 -->
    <div class="content-area min-vh-50">
        
        <!-- Tab 1: Quiz -->
        <div v-if="activeTab === 'quiz'" class="text-center py-5 text-secondary fade-in">
            <i class="bi bi-pencil-fill fs-1 mb-3 d-block opacity-50"></i>
            <p>풀이한 퀴즈 내역이 없습니다.</p>
            <button @click="showQuizModal = true" class="btn btn-sm btn-outline-secondary rounded-pill mt-2">퀴즈 풀러가기</button>
        </div>
        <QuizModal v-model:isVisible="showQuizModal" />

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

        <!-- Tab 3: My Stats -->
        <div v-if="activeTab === 'bookmark'" class="fade-in px-3 py-4">
             <div v-if="loadingStats" class="text-center py-5">
                 <div class="spinner-border text-secondary" role="status"></div>
             </div>
             
             <div v-else class="text-center">
                <!-- Level Section -->
                <div class="mb-4">
                    <div class="d-inline-block position-relative">
                        <div class="level-circle border border-2 border-secondary rounded-circle d-flex flex-column justify-content-center align-items-center bg-black mx-auto">
                           <span class="fs-1">🌱</span>
                           <span class="fw-bold font-primary mt-1 text-white">Lv.{{ userStats?.level || 1 }}</span>
                        </div>
                        <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-dark">
                            {{ userStats?.totalViewCount || 0 }} views
                        </span>
                    </div>
                    <h4 class="mt-3 fw-bold text-white font-primary">
                        {{ getLevelTitle(userStats?.level || 1) }}
                    </h4>
                    <p class="text-secondary small">
                        총 <span class="text-accent fw-bold">{{ formatCount(userStats?.watchTime) }}분</span> 동안 성장했어요!
                    </p>
                </div>

                <!-- Stats Grid -->
                <div class="row g-3">
                    <!-- Streak -->
                    <div class="col-6">
                        <div class="bg-dark bg-opacity-50 p-3 rounded-4 h-100 border border-secondary border-opacity-25">
                            <i class="bi bi-fire fs-2 text-danger mb-2"></i>
                            <div class="text-secondary small mb-1">연속 학습</div>
                            <div class="fw-bold fs-4">{{ userStats?.streak || 0 }}일</div>
                        </div>
                    </div>
                    
                    <!-- Time Slot -->
                    <div class="col-6">
                        <div class="bg-dark bg-opacity-50 p-3 rounded-4 h-100 border border-secondary border-opacity-25">
                            <i class="bi bi-clock-history fs-2 text-info mb-2"></i>
                            <div class="text-secondary small mb-1">주 학습 시간</div>
                            <div class="fw-bold fs-5">{{ userStats?.timeTag || '-' }}</div>
                        </div>
                    </div>

                    <!-- Top Category -->
                    <div class="col-12">
                         <div class="bg-dark bg-opacity-50 p-3 rounded-4 border border-secondary border-opacity-25 d-flex align-items-center justify-content-between px-4">
                            <div class="text-start">
                                <div class="text-secondary small mb-1">최애 카테고리</div>
                                <div class="fw-bold fs-5 text-accent">{{ userStats?.topCategory || '아직 없음' }}</div>
                            </div>
                            <i class="bi bi-trophy-fill fs-1 text-warning opacity-50"></i>
                        </div>
                    </div>
                </div>

             </div>
        </div>

    </div>

  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import { getMyLikedVideos } from '@/api/video';
import { getUserStats } from '@/api/user';
import QuizModal from '@/components/quiz/QuizModal.vue';

const authStore = useAuthStore();
const router = useRouter(); 
const activeTab = ref('like'); 
const showQuizModal = ref(false); 
const likedVideos = ref([]);
const loadingLikes = ref(false);
const userStats = ref(null);
const loadingStats = ref(false);

onMounted(async () => {
    if (authStore.isAuthenticated) {
        await authStore.fetchUserInfo();
    }
    // 초기 로드 
    if (activeTab.value === 'like') {
        fetchLikedVideos();
    } else if (activeTab.value === 'bookmark') {
        fetchUserStats();
    }
});

watch(activeTab, (newTab) => {
    if (newTab === 'like') {
        fetchLikedVideos();
    } else if (newTab === 'bookmark') {
        fetchUserStats();
    }
});

const fetchLikedVideos = async () => {
    loadingLikes.value = true;
    try {
        const response = await getMyLikedVideos({ page: 1, size: 50 }); 
        likedVideos.value = response.data.data.videos;
    } catch (error) {
        console.error("Failed to fetch liked videos", error);
    } finally {
        loadingLikes.value = false;
    }
};

const fetchUserStats = async () => {
    loadingStats.value = true;
    getUserStats(
        (response) => {
            userStats.value = response.data.data;
            loadingStats.value = false;
        },
        (error) => {
            console.error("Failed to fetch user stats", error);
            loadingStats.value = false;
        }
    );
};

const getLevelTitle = (level) => {
    if (level >= 5) return "마스터 나무 🌳";
    if (level >= 4) return "무럭무럭 나무 🌲";
    if (level >= 3) return "쑥쑥 자라요 🌿";
    if (level >= 2) return "떡잎 발견 🌱";
    return "씨앗 심기 🌰";
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

.level-circle {
    width: 120px;
    height: 120px;
    border-color: var(--accent-color, #C0FF00) !important;
    box-shadow: 0 0 20px rgba(192, 255, 0, 0.2);
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
