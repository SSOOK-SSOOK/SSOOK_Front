<template>
  <div class="page-container text-white pb-5">
    <!-- Header -->
    <div class="header p-3 border-bottom border-secondary position-sticky top-0 bg-black z-3">
      <h1 class="fw-bold fs-4 m-0">카테고리</h1>
    </div>

    <!-- Loading State -->
    <div v-if="categoryStore.loading" class="d-flex justify-content-center py-5">
        <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
    </div>

    <!-- Category List -->
    <div v-else class="px-3 py-2">
        <div v-for="section in categoryStore.groupedCategories" :key="section.categoryId" class="mb-4">
            <!-- Section Header (Parent Category) -->
             <div class="d-flex justify-content-between align-items-center mb-2">
                <h2 class="fs-5 fw-bold text-white m-0 section-title">{{ section.name }}</h2>
                <!-- If parent itself can be subscribed (no children case logic, but here we show button if needed. 
                     Request said 'If parent has no children, it acts as header AND item'. 
                     Let's check if it has children. If not, show subscribe button next to header?) -->
                <button 
                    v-if="section.children.length === 0"
                    @click="handleSubscribe(section.categoryId)"
                    class="btn btn-sm rounded-pill fw-bold transition-all"
                    :class="section.isSubscribed ? 'btn-outline-secondary' : 'btn-neon'"
                >
                    {{ section.isSubscribed ? '구독중' : '구독' }}
                </button>
             </div>

            <!-- Children List -->
            <div v-if="section.children.length > 0" class="d-flex flex-column gap-2">
                <div v-for="item in section.children" :key="item.categoryId" class="category-item d-flex align-items-center bg-dark rounded p-2">
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
                        <div class="small text-secondary text-truncate" style="max-width: 150px;">{{ item.description }}</div>
                    </div>

                    <!-- Subscribe Button -->
                     <button 
                        @click="handleSubscribe(item.categoryId)"
                        class="btn btn-sm rounded-pill fw-bold transition-all ms-2"
                        :class="item.isSubscribed ? 'btn-outline-secondary' : 'btn-neon'"
                        style="min-width: 70px;"
                    >
                        {{ item.isSubscribed ? '구독중' : '구독' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useCategoryStore } from '@/stores/category';

const categoryStore = useCategoryStore();

onMounted(() => {
    categoryStore.fetchCategories();
});

const handleSubscribe = async (categoryId) => {
    await categoryStore.toggleSubscription(categoryId);
};
</script>

<style scoped>
.page-container {
    min-height: 100vh;
    padding-bottom: 80px; /* BottomNav height */
}

.section-title {
    border-left: 4px solid var(--accent-color);
    padding-left: 10px;
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
    background-color: #e0244a; /* slightly darker */
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
</style>
