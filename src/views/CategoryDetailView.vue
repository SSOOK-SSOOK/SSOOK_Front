<template>
  <div class="page-container bg-black text-white pb-5">
    <div v-if="loading" class="d-flex justify-content-center py-5">
        <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
    </div>

    <div v-else-if="category" class="d-flex flex-column h-100">
        <!-- Header -->
        <div class="header d-flex align-items-center p-3 sticky-top bg-black z-3">
            <button @click="goBack" class="btn text-white p-0 me-3">
                <i class="bi bi-chevron-left fs-4"></i>
            </button>
            <h1 class="fs-5 fw-bold m-0 flex-grow-1 text-center pe-4">{{ category.name }}</h1>
             <button class="btn text-white p-0">
                <i class="bi bi-three-dots-vertical fs-5"></i>
            </button>
        </div>

        <!-- Banner / Info -->
        <div class="text-center p-4">
             <div class="d-inline-block rounded-circle overflow-hidden mb-3 border border-secondary" style="width: 80px; height: 80px;">
                <img v-if="category.imageUrl" :src="category.imageUrl" class="w-100 h-100 object-fit-cover" alt="">
                <div v-else class="w-100 h-100 bg-secondary d-flex justify-content-center align-items-center">
                    <i class="bi bi-hash fs-1 text-white opacity-50"></i>
                </div>
            </div>
            <h2 class="fw-bold fs-3 mb-2">{{ category.name }}</h2>
            <p class="text-secondary small px-4">{{ category.description }}</p>
        </div>

        <!-- Content Area -->
        <div class="flex-grow-1 px-3">
            
            <!-- CASE 1: Parent Category (Show Children) -->
            <div v-if="category.hasChildren && category.children && category.children.length > 0">
                <div class="d-flex flex-column gap-2 mt-4">
                     <div v-for="child in category.children" :key="child.categoryId" class="d-flex align-items-center bg-dark rounded p-3" @click="goToDetail(child.categoryId)">
                        <!-- Thumbnail -->
                        <div class="rounded bg-secondary overflow-hidden flex-shrink-0 me-3" style="width: 48px; height: 48px;">
                            <img v-if="child.imageUrl" :src="child.imageUrl" alt="" class="w-100 h-100 object-fit-cover">
                            <div v-else class="w-100 h-100 bg-light bg-opacity-10 d-flex justify-content-center align-items-center">
                                <i class="bi bi-hash fs-4 text-secondary"></i>
                            </div>
                        </div>
                        
                        <div class="flex-grow-1">
                            <div class="fw-semibold">{{ child.name }}</div>
                            <div class="small text-secondary text-truncate" style="max-width: 200px;">{{ child.description }}</div>
                        </div>
                        <i class="bi bi-chevron-right text-secondary"></i>
                    </div>
                </div>
            </div>

             <!-- CASE 2: Leaf Category (Show Subscribe & Videos) -->
             <div v-else>
                <!-- Subscribe Button -->
                <button 
                    @click="handleSubscribe"
                    class="btn w-100 rounded-pill fw-bold py-2 mb-4 fs-5 transition-all"
                    :class="category.isSubscribed ? 'btn-outline-secondary' : 'btn-neon'"
                >
                    {{ category.isSubscribed ? '구독중' : '구독' }}
                </button>

                <!-- Videos Grid -->
                <!-- <h3 class="fs-6 fw-bold mb-3">최신 쇼츠</h3> -->
                <div v-if="videoLoading" class="text-center py-5">
                    <div class="spinner-border text-primary spinner-border-sm" role="status"></div>
                </div>
                <div v-else-if="videos.length === 0" class="text-center text-secondary py-5">
                    등록된 영상이 없습니다.
                </div>
                <div v-else class="row g-2">
                    <div v-for="video in videos" :key="video.videoId" class="col-4">
                        <div class="ratio ratio-9x16 bg-secondary rounded overflow-hidden position-relative">
                             <img v-if="video.thumbnailUrl" :src="video.thumbnailUrl" class="w-100 h-100 object-fit-cover" alt="">
                             <div class="position-absolute bottom-0 start-0 w-100 p-1 text-white bg-gradient-overlay">
                                <div class="x-small d-flex align-items-center">
                                    <i class="bi bi-play-fill me-1"></i> {{ formatCount(video.viewCount) }}
                                </div>
                             </div>
                        </div>
                    </div>
                </div>
             </div>
        </div>
    </div>

    <!-- Error/Empty State -->
    <div v-else class="flex-grow-1 d-flex justify-content-center align-items-center text-secondary">
        <div class="text-center">
            <i class="bi bi-exclamation-triangle fs-1 mb-3"></i>
            <p>{{ errorMessage || '카테고리 정보를 불러올 수 없습니다.' }}</p>
        </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed, watch, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCategoryStore } from '@/stores/category';
import { useVideoStore } from '@/stores/video';
import { storeToRefs } from 'pinia';

const route = useRoute();
const router = useRouter();
const categoryStore = useCategoryStore();
const videoStore = useVideoStore();

const { currentCategory: category, loading } = storeToRefs(categoryStore);
const { videos, loading: videoLoading } = storeToRefs(videoStore);
const errorMessage = ref(null);

// Fetch data on mount and route param change
const loadData = async (id) => {
    errorMessage.value = null;
    try {
        await categoryStore.fetchCategory(id);
        
        // If leaf category (not parent), fetch related videos
        if (category.value && !category.value.hasChildren) {
            videoStore.resetVideos(); // Clear old videos
            await videoStore.fetchVideos(id);
        }
    } catch (err) {
        console.error("Load failed", err);
        // Debugging: Show detailed error
        let debugMsg = "";
        if (err.response) {
             debugMsg = `Status: ${err.response.status}, Msg: ${err.response.data?.message || JSON.stringify(err.response.data)}`;
        } else {
             debugMsg = `Error: ${err.message}`;
        }
        errorMessage.value = debugMsg;
        
        category.value = null;
    }
};

onMounted(() => {
    loadData(route.params.id);
});

// Watch for route ID changes (e.g., parent -> child navigation)
watch(
    () => route.params.id,
    (newId) => {
        if (newId) loadData(newId);
    }
);

const goBack = () => {
    router.back();
};

const goToDetail = (id) => {
    router.push(`/category/${id}`);
};

const handleSubscribe = async () => {
    if (category.value) {
        await categoryStore.toggleSubscription(category.value.categoryId);
        // Toggle locally for UI responsiveness (store might handle it, but update currentCategory)
        category.value.isSubscribed = !category.value.isSubscribed;
    }
};

const formatCount = (count) => {
    if (!count) return '0';
    if (count >= 10000) return (count / 10000).toFixed(1) + '만'; // KB format? using generic K/M
    if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
    return count;
};
</script>

<style scoped>
.page-container {
    min-height: 100vh;
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
.bg-gradient-overlay {
    background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%);
}
.x-small {
    font-size: 0.7rem;
}
</style>
