import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { getCategories } from '@/api/category';
import { subscribe, unsubscribe } from '@/api/subscription';

export const useCategoryStore = defineStore('category', () => {
    const categories = ref([]);
    const loading = ref(false);

    // Group categories by parentId
    // Structure: [ { ...parent, children: [ ... ] }, ... ]
    const groupedCategories = computed(() => {
        const parents = categories.value.filter(c => !c.parentId);
        const children = categories.value.filter(c => c.parentId);

        return parents.map(parent => ({
            ...parent,
            children: children.filter(child => child.parentId === parent.categoryId)
        }));
    });

    // Subscribed categories (Flattened list of items I am subscribed to)
    const subscribedCategories = computed(() => {
        return categories.value.filter(c => c.isSubscribed);
    });

    const fetchCategories = async () => {
        loading.value = true;
        try {
            const response = await getCategories({ page: 1, perPage: 100 }); // Fetch enough
            // API Response: { status, message, data: { content: [], ... } } or just list?
            // PageResponse usually has 'content' or 'list'. Checking PageResponse.java might be needed but assuming 'content' based on typical Spring Page.
            // Wait, previous API calls showed keys like 'data' in Axios response. 
            // Let's assume response.data.data.content or response.data.data if it's a list.
            // CategoryController returns ApiResponse<PageResponse<CategoryResponseDto>>.
            // So `response.data` is ApiResponse. `response.data.data` is PageResponse. 
            // PageResponse probably has `content` field.

            // Let's verify PageResponse structure if possible, but standard is 'content'.
            // I'll assume 'items' or 'content'. Let's try to handle both or inspect.
            // For now, assume `content`.

            const pageData = response.data.data;
            if (Array.isArray(pageData)) {
                categories.value = pageData;
            } else if (pageData && Array.isArray(pageData.content)) {
                categories.value = pageData.content;
            } else {
                categories.value = [];
            }

        } catch (error) {
            console.error('Failed to fetch categories:', error);
        } finally {
            loading.value = false;
        }
    };

    const toggleSubscription = async (categoryId) => {
        const category = categories.value.find(c => c.categoryId === categoryId);
        if (!category) return;

        const originalState = category.isSubscribed;
        // Optimistic Update
        category.isSubscribed = !originalState;

        try {
            if (originalState) {
                await unsubscribe(categoryId);
            } else {
                await subscribe(categoryId);
            }
        } catch (error) {
            // Revert on failure
            category.isSubscribed = originalState;
            console.error('Subscription failed:', error);
            alert('작업에 실패했습니다.');
        }
    };

    return {
        categories,
        loading,
        groupedCategories,
        subscribedCategories,
        fetchCategories,
        toggleSubscription
    };
});
