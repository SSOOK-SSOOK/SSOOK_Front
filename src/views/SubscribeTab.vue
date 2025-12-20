<template>
  <div class="page-container text-white pb-5">
    <!-- Header -->
    <div class="header p-3 border-bottom border-secondary position-sticky top-0 bg-black z-3">
      <h1 class="fw-bold fs-4 m-0">내 구독</h1>
    </div>

    <!-- Empty State -->
    <div v-if="!categoryStore.loading && categoryStore.subscribedCategories.length === 0" class="d-flex flex-column align-items-center justify-content-center py-5 mt-5">
        <i class="bi bi-heart-break fs-1 text-secondary mb-3"></i>
        <p class="text-secondary">아직 구독한 카테고리가 없습니다.</p>
        <button @click="$router.push('/category')" class="btn btn-outline-light mt-3">
            카테고리 둘러보기
        </button>
    </div>

    <!-- Subscribed List -->
    <div class="px-3 py-2">
        <div v-for="item in categoryStore.subscribedCategories" :key="item.categoryId" class="category-item d-flex align-items-center bg-dark rounded p-3 mb-2 animate-item">
            <!-- Thumbnail -->
            <div class="thumbnail me-3 rounded bg-secondary overflow-hidden flex-shrink-0">
                <img v-if="item.imageUrl" :src="item.imageUrl" alt="" class="w-100 h-100 object-fit-cover">
                <div v-else class="w-100 h-100 d-flex justify-content-center align-items-center bg-light bg-opacity-10">
                    <i class="bi bi-check-lg fs-4 text-success"></i>
                </div>
            </div>
            
            <!-- Info -->
            <div class="flex-grow-1">
                <div class="fw-semibold">{{ item.name }}</div>
                <div class="small text-secondary">{{ item.description || '구독중인 카테고리' }}</div>
            </div>

            <!-- Unsubscribe Button -->
                <button 
                @click="handleUnsubscribe(item.categoryId)"
                class="btn btn-sm btn-outline-secondary rounded-pill fw-bold ms-2"
                style="min-width: 80px;"
            >
                구독중
            </button>
        </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useCategoryStore } from '@/stores/category';

const categoryStore = useCategoryStore();

onMounted(() => {
    // Ensure we have the latest data
    if (categoryStore.categories.length === 0) {
        categoryStore.fetchCategories();
    }
});

const handleUnsubscribe = async (categoryId) => {
    // Store handles toggle. Since it's currently true, it will become false (unsubscribe).
    await categoryStore.toggleSubscription(categoryId);
};
</script>

<style scoped>
.page-container {
    min-height: 100vh;
    padding-bottom: 80px; 
}
.thumbnail {
    width: 56px;
    height: 56px;
}
.animate-item {
    transition: all 0.3s ease;
}
</style>
