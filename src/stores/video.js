import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getVideoList, toggleLike as apiToggleLike } from '@/api/video';

export const useVideoStore = defineStore('video', () => {
    const videos = ref([]);
    const loading = ref(false);
    const hasMore = ref(true);
    const page = ref(1);
    const size = ref(10); // Batch size

    const fetchVideos = async (options = {}) => { // Changed to accept options object or categoryId
        if (loading.value || !hasMore.value) return;

        // Backward compatibility if options is just an ID (though usually null)
        let categoryId = null;
        let sortedType = null;
        let onlySubscribed = false;

        if (typeof options === 'object' && options !== null) {
            categoryId = options.categoryId;
            sortedType = options.sortedType;
            onlySubscribed = options.onlySubscribed;
        } else {
            categoryId = options;
        }

        loading.value = true;
        try {
            const params = {
                page: page.value,
                size: size.value
            };
            if (categoryId) params.categoryId = categoryId;
            if (sortedType) params.sortedType = sortedType;
            if (onlySubscribed) params.onlySubscribed = true;

            const response = await getVideoList(params);

            // API Spec says: Map<String, List<VideoResponseDto>> Key: "videos"
            // Let's assume response.data.data.videos based on previous patterns
            const newVideos = response.data.data.videos || [];

            if (newVideos.length < size.value) {
                hasMore.value = false;
            }

            if (page.value === 1) {
                videos.value = newVideos;
            } else {
                videos.value = [...videos.value, ...newVideos];
            }

            page.value++;

        } catch (error) {
            console.error('Failed to fetch videos:', error);
        } finally {
            loading.value = false;
        }
    };

    const resetVideos = () => {
        videos.value = [];
        page.value = 1;
        hasMore.value = true;
        loading.value = false; // Force reset loading state
    };

    const toggleLike = async (videoId) => {
        const video = videos.value.find(v => v.videoId === videoId);
        if (!video) return;

        // Optimistic update logic if we had 'isLiked' in DTO. 
        // Assuming DTO has viewCount, but maybe not isLiked for user?
        // Let's just call API for now. Optimistic UI requires knowing current state.
        // Assuming video object has 'isLiked' and 'likeCount'.

        // Only if these fields exist
        /*
        const originalState = video.isLiked;
        video.isLiked = !originalState;
        video.likeCount += video.isLiked ? 1 : -1;
        */

        try {
            await apiToggleLike(videoId);
            // Ideally we get the new state back or just trust the toggle
        } catch (error) {
            console.error('Like failed', error);
            // Revert if needed
        }
    };

    return {
        videos,
        loading,
        hasMore,
        fetchVideos,
        resetVideos,
        toggleLike
    };
});
