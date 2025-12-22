<template>
  <div class="page-container pb-5">
    <!-- Header -->
    <div class="header p-3 sticky-top glass-header z-3 d-flex align-items-center justify-content-between">
      <h1 class="fw-bold fs-4 m-0 font-primary text-white">
        내 구독 <span class="text-accent custom-badge">{{ categoryStore.subscribedCategories.length }}</span>
      </h1>
    </div>

    <!-- Empty State -->
    <div v-if="!categoryStore.loading && categoryStore.subscribedCategories.length === 0" class="d-flex flex-column align-items-center justify-content-center py-5 mt-5 fade-in">
        <div class="empty-icon-wrapper mb-4">
            <i class="bi bi-bookmark-heart fs-1 text-accent"></i>
        </div>
        <p class="text-white fw-bold fs-5 mb-1">구독한 카테고리가 없어요</p>
        <p class="text-secondary small mb-4">관심 있는 주제를 찾아보세요!</p>
        <button @click="$router.push('/category')" class="btn btn-neon rounded-pill px-4 py-2 fw-bold">
            카테고리 둘러보기
        </button>
    </div>

    <!-- Subscribed List -->
    <div class="px-3 py-2 list-container" v-else>
        <div 
            v-for="(item, index) in categoryStore.subscribedCategories" 
            :key="item.categoryId" 
            class="subscription-card d-flex align-items-center p-3 mb-3"
            :style="{ animationDelay: `${index * 50}ms` }"
        >
            <!-- Thumbnail -->
            <div class="thumbnail-wrapper me-3 flex-shrink-0">
                <img 
                    v-if="item.imageUrl && !imageErrors[item.categoryId]" 
                    :src="item.imageUrl" 
                    alt="" 
                    class="thumbnail-img rounded-circle"
                    @error="handleImageError(item.categoryId)"
                >
                <div v-else class="thumbnail-placeholder rounded-circle">
                    <span class="fs-4 fw-bold text-accent">{{ item.name.charAt(0) }}</span>
                </div>
            </div>
            
            <!-- Info -->
            <div class="flex-grow-1" @click="$router.push(`/category/${item.categoryId}`)" style="cursor: pointer; min-width: 0;">
                <div class="fw-bold text-white fs-5 mb-1 text-truncate">{{ item.name }}</div>
                <div class="small text-secondary text-truncate">{{ item.description || '새로운 영상을 기다려보세요' }}</div>
            </div>

            <!-- Unsubscribe Button -->
            <button 
                @click="handleUnsubscribe(item.categoryId)"
                class="btn-subscribed ms-2 flex-shrink-0"
                aria-label="Unsubscribe"
            >
                <i class="bi bi-check-circle-fill text-accent fs-4"></i>
            </button>
        </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useCategoryStore } from '@/stores/category';

const categoryStore = useCategoryStore();
const imageErrors = ref({}); // Track broken images

onMounted(() => {
    // Ensure we have the latest data
    if (categoryStore.categories.length === 0) {
        categoryStore.fetchCategories();
    }
});

const handleUnsubscribe = async (categoryId) => {
    await categoryStore.toggleSubscription(categoryId);
};

const handleImageError = (id) => {
    imageErrors.value[id] = true;
};
</script>

<style scoped>
.page-container {
    min-height: 100vh;
    background-color: #000;
    padding-bottom: 80px; 
}

.glass-header {
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.font-primary {
    font-family: 'Pretendard', sans-serif;
    letter-spacing: -0.5px;
}

.text-accent {
    color: var(--accent-color);
}

.custom-badge {
    font-size: 0.9rem;
    vertical-align: top;
    font-weight: 800;
}

/* Empty State */
.empty-icon-wrapper {
    width: 80px;
    height: 80px;
    background: radial-gradient(circle, rgba(192, 255, 0, 0.2) 0%, transparent 70%);
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0 0 20px rgba(192, 255, 0, 0.1);
}

.btn-neon {
    background-color: var(--accent-color);
    color: #000;
    border: none;
    transition: all 0.2s ease;
}
.btn-neon:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(192, 255, 0, 0.4);
    background-color: #b0e600;
}

/* Subscription Card */
.subscription-card {
    background: rgba(20, 20, 20, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 16px;
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    position: relative;
    overflow: hidden;
    animation: slideUp 0.5s ease-out forwards;
    opacity: 0;
    transform: translateY(20px);
}

.subscription-card:hover {
    background: rgba(30, 30, 30, 0.8);
    border-color: rgba(192, 255, 0, 0.3);
    transform: translateY(-2px) scale(1.01);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}

.thumbnail-wrapper {
    width: 60px;
    height: 60px;
    /* remove border-radius 12px if we want circle */
    /* but we set rounded-circle on img, so wrapper needs it too or removed */
    border-radius: 50%; 
    overflow: hidden;
    box-shadow: 0 4px 10px rgba(0,0,0,0.3);
}

.thumbnail-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
}
.subscription-card:hover .thumbnail-img {
    transform: scale(1.1);
}

.thumbnail-placeholder {
    width: 100%;
    height: 100%;
    background-color: #1a1a1a;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 1px solid rgba(255, 255, 255, 0.05);
}

.btn-subscribed {
    background: none;
    border: none;
    padding: 8px;
    border-radius: 50%;
    transition: transform 0.2s ease;
}
.btn-subscribed:hover {
    transform: scale(1.2);
    background-color: rgba(192, 255, 0, 0.1);
}
.btn-subscribed:active {
    transform: scale(0.9);
}

@keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

.fade-in {
    animation: fadeIn 0.5s ease-out;
}
@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}
</style>
