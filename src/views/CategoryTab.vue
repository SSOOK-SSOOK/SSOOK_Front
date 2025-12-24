<template>
  <div class="page-container app-text app-bg pb-5">
    <!-- Header -->
    <div class="header d-flex justify-content-center align-items-center py-3 sticky-top glass-header z-3 border-bottom transition-colors" :class="isDarkMode ? 'border-dark' : 'border-light'" style="min-height: 72px;">
      <h1 class="fw-bold fs-5 font-primary m-0">카테고리</h1>
      
      <!-- Search Button (Right Aligned) -->
      <div class="position-absolute end-0 me-3 z-3">
          <button @click="openSearchModal" class="btn btn-icon app-text">
             <i class="bi bi-search fs-4"></i>
          </button>
      </div>
    </div>

    <!-- Collapsible Search Bar -->
    <div v-if="isSearchOpen" class="px-3 py-2 app-bg border-bottom border-secondary fade-in d-flex align-items-center gap-2">
        <button @click="closeSearch" class="btn btn-icon app-text p-1">
            <i class="bi bi-arrow-left fs-4"></i>
        </button>
        <div class="position-relative flex-grow-1">
            <input 
                type="text" 
                class="form-control rounded-pill app-card app-text border-secondary ps-5" 
                placeholder="관심있는 분야를 검색해보세요"
                v-model="searchKeyword"
                @keyup.enter="handleSearch"
                autofocus
            >
            <i class="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 app-text-secondary"></i>
        </div>
    </div>

    <!-- Loading State -->
    <div v-if="categoryStore.loading" class="d-flex justify-content-center py-5">
        <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
    </div>

    <!-- Category List -->
    <div v-else class="px-3 py-2">
        <!-- Parent Categories Grid (No Search) -->
        <template v-if="!searchKeyword">
            <div class="row g-3">
                <div 
                    v-for="section in categoryStore.groupedCategories" 
                    :key="section.categoryId" 
                    class="col-6"
                >
                    <div 
                        class="category-card position-relative overflow-hidden rounded-4 ratio ratio-1x1 app-card border border-secondary border-opacity-10"
                        @click="goToDetail(section.categoryId)"
                    >
                        <!-- Image -->
                         <img 
                            v-if="section.imageUrl" 
                            :src="section.imageUrl" 
                            class="w-100 h-100 object-fit-cover opacity-75" 
                            alt=""
                        >
                        <div v-else class="w-100 h-100 bg-secondary d-flex align-items-center justify-content-center opacity-25">
                            <i class="bi bi-grid-fill fs-1 app-text"></i>
                        </div>

                        <!-- Text Overlay -->
                         <div class="position-absolute bottom-0 start-0 w-100 p-3 text-center bg-gradient-overlay">
                            <!-- Force white text on overlay, add shadow for safety -->
                            <h3 class="fs-6 fw-bold m-0 text-white text-shadow-sm">{{ section.name }}</h3>
                         </div>
                    </div>
                </div>
            </div>
            
            <!-- Trending Shorts Section -->
             <div class="mt-5 mb-3">
                <h2 class="fs-5 fw-bold mb-3 app-text">요즘 뜨는 쇼츠 🔥</h2> <!-- Added Fire Emoji -->
                 <div class="d-flex overflow-x-auto gap-3 pb-3 no-scrollbar align-items-stretch" style="min-height: 200px;">
                    
                    <div v-if="loadingTrending" class="d-flex align-items-center justify-content-center w-100 text-secondary">
                        <div class="spinner-border spinner-border-sm me-2" role="status"></div>
                        <span class="small">불러오는 중...</span>
                    </div>

                    <div v-else-if="trendingVideos.length === 0" class="text-secondary small w-100 text-center py-4">
                        데이터가 충분하지 않아요 😅
                    </div>

                    <div v-else v-for="(video, i) in trendingVideos" :key="video.videoId" 
                         class="flex-shrink-0 position-relative cursor-pointer" 
                         style="width: 140px;"
                         @click="goToVideo(video.videoId)"
                    >
                        <div class="ratio ratio-9x16 bg-secondary bg-opacity-25 rounded-3 mb-2 overflow-hidden border border-secondary border-opacity-10">
                            <!-- Wrapper for Ratio Content -->
                            <div class="w-100 h-100 position-relative">
                                <!-- Thumbnail or Fallback -->
                                <img v-if="video.thumbnailUrl" :src="video.thumbnailUrl" class="w-100 h-100 object-fit-cover" loading="lazy" @error="video.thumbnailUrl = null">
                                <div v-else class="w-100 h-100 d-flex align-items-center justify-content-center bg-dark">
                                    <i class="bi bi-play-btn-fill fs-1 text-secondary opacity-50"></i>
                                </div>

                                <!-- Rank Badge (Now safe from ratio expansion) -->
                                <div class="position-absolute top-0 start-0 m-2 z-3 filter-drop-shadow" style="font-size: 1.5rem;">
                                    {{ i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1 }}
                                </div>
                                
                                <!-- View Count Overlay -->
                                <div class="position-absolute bottom-0 start-0 w-100 p-2 bg-gradient-overlay z-2" style="height: auto;">
                                    <span class="text-white x-small fw-bold text-shadow-sm">
                                        <i class="bi bi-play-fill"></i> {{ formatCount(video.viewCount) }}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div class="small fw-bold text-truncate app-text">{{ video.title }}</div>
                    </div>
                 </div>
             </div>
        </template>

        <!-- Search Results (Flat List) -->
        <template v-else>
            <div v-if="categoryStore.categories.length === 0" class="text-center app-text-secondary py-5">
                검색 결과가 없습니다.
            </div>
            <div v-else class="d-flex flex-column gap-2">
                 <div v-for="item in categoryStore.categories" :key="item.categoryId" class="category-item d-flex align-items-center app-card rounded p-2" @click="goToDetail(item.categoryId)">
                    <!-- Thumbnail -->
                    <div class="thumbnail me-3 rounded bg-secondary overflow-hidden flex-shrink-0">
                        <img v-if="item.imageUrl" :src="item.imageUrl" alt="" class="w-100 h-100 object-fit-cover">
                        <div v-else class="w-100 h-100 d-flex justify-content-center align-items-center bg-light bg-opacity-10">
                            <i class="bi bi-hash fs-4 text-secondary"></i>
                        </div>
                    </div>
                    
                    <!-- Info -->
                    <div class="flex-grow-1">
                        <div class="fw-semibold">{{ item.name }}</div>
                        <div class="small app-text-secondary text-truncate" style="max-width: 150px;">{{ item.description }}</div>
                    </div>

                    <!-- Subscribe Button (Only for leaf nodes) -->
                     <button 
                        v-if="!item.hasChildren"
                        @click.stop="handleSubscribe(item.categoryId)"
                        class="btn btn-sm rounded-pill fw-bold transition-all ms-2"
                        :class="item.isSubscribed ? 'btn-outline-secondary' : 'btn-neon'"
                        style="min-width: 70px;"
                    >
                        {{ item.isSubscribed ? '구독중' : '구독' }}
                    </button>
                    <i v-else class="bi bi-chevron-right app-text-secondary ms-2"></i>
                </div>
            </div>
        </template>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useCategoryStore } from '@/stores/category';
import { useRouter } from 'vue-router';
import { useThemeStore } from '@/stores/theme';
import { storeToRefs } from 'pinia';
import { getTrendingVideos } from '@/api/video'; // Import API

const categoryStore = useCategoryStore();
const searchKeyword = ref('');
const router = useRouter();
const themeStore = useThemeStore();
const { isDarkMode } = storeToRefs(themeStore);

const trendingVideos = ref([]);
const loadingTrending = ref(false);

onMounted(() => {
    categoryStore.fetchCategories();
    fetchTrending();
});

const fetchTrending = async () => {
    loadingTrending.value = true;
    try {
        const response = await getTrendingVideos();
        // Assuming response structure: { success: true, data: { videos: [...] } }
        trendingVideos.value = response.data.data.videos || [];
    } catch (e) {
        console.error("Failed to fetch trending videos", e);
    } finally {
        loadingTrending.value = false;
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

// Since we removed inline input, we should probably have a modal or standard search bar.
// Re-adding the search bar as a togglable element or a cleaner persistent bar below header?
// User asked to "center title", usually implies standard standard header.
// Let's implement a clean Search Overlay (similar to Shorts) or just a togglable input.

const isSearchOpen = ref(false);

const openSearchModal = () => {
    isSearchOpen.value = true;
    // Note: autofocus handled by 'autofocus' attribute, 
    // but better to use template ref nextTick if reliable focus is needed.
};

const closeSearch = () => {
    isSearchOpen.value = false;
    searchKeyword.value = '';
    categoryStore.fetchCategories(); // Reset to initial grid state
};

const handleSearch = () => {
    categoryStore.fetchCategories(searchKeyword.value);
};

const handleSubscribe = async (categoryId) => {
    await categoryStore.toggleSubscription(categoryId);
};

const goToDetail = (categoryId) => {
    router.push(`/category/${categoryId}`);
};
</script>

<style scoped>
.page-container {
    min-height: 100vh;
    padding-bottom: 80px; 
}

/* Gradients & Cards */
.bg-gradient-overlay {
    background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%);
}
.category-card {
    transition: transform 0.2s ease;
    cursor: pointer;
}
.category-card:active {
    transform: scale(0.96);
}

.thumbnail {
    width: 48px;
    height: 48px;
}

.btn-neon {
    background-color: var(--accent-color);
    color: white;
    border: none;
}
.btn-neon:hover {
    background-color: #e0244a; 
}
.btn-outline-secondary {
    color: #ccc;
    border-color: #666;
}
.btn-outline-secondary:hover {
    background-color: #333;
    color: white;
}
.transition-all {
    transition: all 0.2s ease;
}

.no-scrollbar::-webkit-scrollbar {
    display: none;
}
.no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
.x-small {
    font-size: 0.75rem;
}
.text-shadow-sm {
    text-shadow: 0 1px 3px rgba(0,0,0,0.8);
}
.btn-icon {
    background: transparent;
    border: none;
    padding: 8px; /* Restoring padding for touch target and height */
    border-radius: 50%;
    transition: background-color 0.2s;
}
.btn-icon:hover {
    background-color: rgba(255, 255, 255, 0.1);
}
.glass-header {
    background: rgba(var(--bg-rgb), 0.85); /* Need to ensure --bg-rgb works or use fallback rgba(0,0,0,0.85) for dark */
    backdrop-filter: blur(12px);
}
/* Fallback if var not set globally or locally yet (it should be in style.css or root) */
:root {
    --bg-rgb: 20, 20, 20;
}
body.light-mode {
    --bg-rgb: 255, 255, 255;
}

.font-primary {
    font-family: 'Pretendard', sans-serif;
}
.bg-accent {
    background-color: var(--accent-color);
}
</style>
