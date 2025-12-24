<template>
  <div class="page-container app-text app-bg pb-5">
    <!-- Header -->
    <div class="header p-3 border-bottom border-secondary position-sticky top-0 app-bg z-3 transition-colors">
      <h1 class="fw-bold fs-4 m-0 mb-3">카테고리</h1>
      
      <!-- Search Input -->
      <div class="position-relative">
        <input 
            type="text" 
            class="form-control rounded-pill app-card app-text border-0 ps-5" 
            placeholder="카테고리 검색..."
            v-model="searchKeyword"
            @keyup.enter="handleSearch"
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
                <h2 class="fs-5 fw-bold mb-3 app-text">요즘 뜨는 쇼츠</h2>
                 <div class="d-flex overflow-x-auto gap-3 pb-3 no-scrollbar">
                    <!-- Placeholder items -->
                    <div v-for="i in 3" :key="i" class="flex-shrink-0" style="width: 140px;">
                        <div class="ratio ratio-9x16 bg-secondary bg-opacity-25 rounded-3 mb-2 d-flex align-items-center justify-content-center">
                            <i class="bi bi-play-btn fs-4 app-text-secondary opacity-50"></i>
                        </div>
                        <div class="small fw-semibold text-truncate app-text">데이터 사이언스 입문...</div>
                        <div class="x-small app-text-secondary">코딩하는 김교수</div>
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

const categoryStore = useCategoryStore();
const searchKeyword = ref('');
const router = useRouter();

onMounted(() => {
    categoryStore.fetchCategories();
});

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
</style>
