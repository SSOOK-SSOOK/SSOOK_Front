<template>
  <div class="shorts-container bg-black text-white">
    <!-- Video Feed -->
    <div class="video-feed" ref="feedContainer">
        <div 
            v-for="(video, index) in videoStore.videos" 
            :key="video.videoId" 
            class="video-item position-relative"
            :data-index="index"
            ref="videoItems"
        >
            <!-- YouTube Iframe Wrapper -->
            <div class="video-wrapper w-100 h-100">
                <!-- Poster/Thumbnail (Optional for optimization) -->
                <!-- <img v-if="!currentPlaying[index]" :src="video.thumbnailUrl" class="w-100 h-100 object-fit-cover position-absolute top-0 start-0 z-1"> -->
                
                <iframe 
                    v-if="shouldRender(index)"
                    class="youtube-iframe w-100 h-100"
                    :src="getYoutubeEmbedUrl(video.videoUrl, index === activeIndex)"
                    title="YouTube video player" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    allowfullscreen
                ></iframe>
            </div>

            <!-- Overlay-UI -->
            <div class="overlay position-absolute top-0 start-0 w-100 h-100 d-flex flex-column justify-content-between p-3 z-2 pointer-events-none">
                <!-- Top Gradient (Visibility) -->
                <div class="overlay-top"></div>

                <div class="d-flex align-items-end justify-content-between pb-5 mb-4">
                    <!-- Bottom Info: Add extra padding bottom to avoid overlapping with YouTube Controls if needed -->
                    <div class="text-start pointer-events-auto pb-4">

                        <h5 class="fw-bold mb-1 text-shadow">{{ video.title }}</h5>
                         <!-- <p class="small text-light text-shadow mb-0">#Shorts #Coding #Dev</p> -->
                    </div>



                    <!-- Right Sidebar Actions -->
                    <div class="d-flex flex-column align-items-center gap-4 pointer-events-auto">


                        <!-- Like -->
                        <div class="d-flex flex-column align-items-center">
                            <button @click="handleLike(video)" class="btn btn-icon text-white p-0">
                                <i 
                                    class="bi fs-1 shadow-icon heart-icon" 
                                    :class="{
                                        'bi-heart-fill text-danger': video.liked, 
                                        'bi-heart': !video.liked,
                                        'animate-heart': video.isAnimating
                                    }"
                                ></i>
                            </button>
                            <span class="small fw-bold text-shadow">{{ video.likeCount || 0 }}</span>
                        </div>

                        <!-- Comment -->
                        <div class="d-flex flex-column align-items-center">
                            <button @click="openCommentSheet(video.videoId)" class="btn btn-icon text-white p-0">
                                <i class="bi bi-chat-dots-fill fs-1 shadow-icon"></i>
                            </button>
                            <!-- Use video.commentCount from backend (Requires server restart) -->
                            <span class="small fw-bold text-shadow">{{ video.commentCount || 0 }}</span>
                        </div>

                        <!-- Share -->
                        <div class="d-flex flex-column align-items-center">
                             <button @click="handleShare(video)" class="btn btn-icon text-white p-0">
                                <i class="bi bi-share-fill fs-1 shadow-icon"></i>
                            </button>
                            <span class="small fw-bold text-shadow">공유</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Loading Indicator -->
        <div v-if="videoStore.loading" class="text-center py-5 text-secondary">
             <div class="spinner-border spinner-border-sm" role="status"></div>
        </div>
    </div>

    <!-- Comment Sheet -->
    <CommentSheet 
        ref="commentSheetRef" 
        :video-id="selectedVideoId" 
        @update-count="handleUpdateCount"
    />
  </div>
</template>

<script setup>
import { onMounted, ref, watch, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { useVideoStore } from '@/stores/video';
import CommentSheet from '@/components/comment/CommentSheet.vue';
import { Offcanvas } from 'bootstrap';
import { toggleLike, getVideoDetail } from '@/api/video';
import { useToastStore } from '@/stores/toast';

const videoStore = useVideoStore();
const toastStore = useToastStore();
const route = useRoute(); // Moved to top level
const feedContainer = ref(null);
const videoItems = ref([]);
const activeIndex = ref(0);
const selectedVideoId = ref(null);
const commentSheetRef = ref(null);

const openCommentSheet = (videoId) => {
    selectedVideoId.value = videoId;
    // Trigger load on component
    if (commentSheetRef.value) {
        commentSheetRef.value.loadComments(videoId);
    }
    
    // Open Offcanvas
    const el = document.getElementById('commentOffcanvas');
    if (el) {
        const bsOffcanvas = Offcanvas.getOrCreateInstance(el);
        bsOffcanvas.show();
    }
};

const getYoutubeId = (url) => {
    if (!url) return '';
    // Added 'shorts/' to the regex
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
    const match = url.match(regExp);
    const id = (match && match[2].length === 11) ? match[2] : null;
    return id;
};

const getYoutubeEmbedUrl = (url, isPlaying) => {
    const id = getYoutubeId(url);
    if (!id) return '';
    const playState = isPlaying ? '1' : '0';
    const origin = window.location.origin;
    return `https://www.youtube.com/embed/${id}?autoplay=${playState}&mute=1&controls=1&loop=1&playlist=${id}&rel=0&playsinline=1&enablejsapi=1&origin=${origin}&modestbranding=1`;
};

const shouldRender = (index) => {
    return Math.abs(activeIndex.value - index) <= 1; 
};

onMounted(async () => {
    // 1. Reset store to ensure clean state (Fixes navigation issues)
    videoStore.resetVideos();
    
    // 2. Fetch initial video list
    await videoStore.fetchVideos();
    
    // 3. Check for navigation query (Direct Link)
    // Route is now available from top scope
    if (route.query.videoId) {
        const targetId = parseInt(route.query.videoId);
        const index = videoStore.videos.findIndex(v => v.videoId === targetId);
        
        if (index !== -1) {
            // Found in initial list
            activeIndex.value = index;
            await nextTick();
            const targetElement = videoItems.value[index];
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'auto' });
            }
        } else {
            // Not in initial list -> Fetch specific video
            try {
                const { data } = await getVideoDetail(targetId);
                const videoData = data.data; 
                if (videoData) {
                    // Prepend successfully
                    videoStore.videos.unshift(videoData);
                    activeIndex.value = 0;
                    await nextTick();
                    if (feedContainer.value) feedContainer.value.scrollTop = 0;
                }
            } catch (e) {
                console.error("Failed to fetch target video", e);
                // Fallback: Just play first video
                activeIndex.value = 0;
            }
        }
    } else {
        // Normal entry
        activeIndex.value = 0;
        await nextTick();
        if (feedContainer.value) feedContainer.value.scrollTop = 0;
    }

    // 4. Setup Intersection Observer
    const options = {
        root: feedContainer.value,
        threshold: 0.6 
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const index = parseInt(entry.target.getAttribute('data-index'));
                activeIndex.value = index;
                
                if (index >= videoStore.videos.length - 2) {
                    videoStore.fetchVideos();
                }
            }
        });
    }, options);

    // 5. Watch for changes
    watch(() => videoStore.videos.length, async () => {
        await nextTick();
        if (videoItems.value) {
            videoItems.value.forEach(el => observer.observe(el));
        }
    }, { immediate: true });

    // 6. Increment View Count on Active Index Change
    watch(activeIndex, (newIndex) => {
        if (videoStore.videos.length > newIndex) {
            const videoId = videoStore.videos[newIndex].videoId;
            incrementViewCount(videoId);
        }
    }, { immediate: true });
});

const incrementViewCount = async (videoId) => {
    try {
        // Fire and forget - just to trigger backend increment
        await getVideoDetail(videoId);
        // Optionally update local view count if we want real-time feedback
        // const video = videoStore.videos.find(v => v.videoId === videoId);
        // if(video) video.viewCount++; 
    } catch (e) {
        console.error("Failed to increment view count", e);
    }
};



const handleLike = async (video) => {
    // 1. Optimistic Update (UI 즉시 반영)
    const previousState = { liked: video.liked, count: video.likeCount };
    
    // Toggle state locally
    video.liked = !video.liked;
    video.likeCount = video.liked ? (video.likeCount || 0) + 1 : (video.likeCount || 0) - 1;
    if (video.likeCount < 0) video.likeCount = 0;

    // Trigger Animation
    if (video.liked) {
        video.isAnimating = true;
        setTimeout(() => video.isAnimating = false, 300); // 300ms matches CSS animation
    }

    try {
        // 2. Call API
        const response = await toggleLike(video.videoId);
        const data = response.data.data;

        // 3. Sync with Server (Optional, but ensures accuracy)
        video.liked = data.liked;
        video.likeCount = data.likeCount;

    } catch (error) {
        console.error("Failed to toggle like", error);
        // 4. Rollback on Error
        video.liked = previousState.liked;
        video.likeCount = previousState.count;
        toastStore.addToast('좋아요 처리에 실패했습니다.', 'error');
    }
};

const handleUpdateCount = ({ videoId, delta }) => {
    const video = videoStore.videos.find(v => v.videoId === videoId);
    if (video) {
        // Init if undefined
        if (typeof video.commentCount !== 'number') {
            video.commentCount = 0;
        }
        video.commentCount += delta;
        if (video.commentCount < 0) video.commentCount = 0;
    }
};

const handleShare = async (video) => {
    try {
        const id = getYoutubeId(video.videoUrl);
        if (!id) {
            toastStore.addToast('공유할 수 없는 영상입니다.', 'error');
            return;
        }

        const shortsUrl = `https://www.youtube.com/shorts/${id}`;
        
        // Clipboard API requires secure context (HTTPS) or localhost
        await navigator.clipboard.writeText(shortsUrl);
        
        toastStore.addToast('링크가 클립보드에 복사되었습니다.', 'success');
    } catch (error) {
        console.error('Share failed:', error);
        toastStore.addToast('클립보드 복사에 실패했습니다.', 'error');
    }
};
</script>

<style scoped>
.shorts-container {
    height: 100vh; /* 100% of viewport */
    width: 100%;
    overflow: hidden;
    /* Important: Add padding so YouTube controls (bottom) are not covered by BottomNav (~60-70px) */
    padding-bottom: 74px; 
    background-color: black;
}

.video-feed {
    height: 100%;
    overflow-y: scroll;
    scroll-snap-type: y mandatory;
    scrollbar-width: none; /* Hide scrollbar Firefox */
}
.video-feed::-webkit-scrollbar {
    display: none; /* Hide scrollbar Chrome/Safari */
}

.video-item {
    height: 100%; /* Each video takes full container height */
    width: 100%;
    scroll-snap-align: start;
    position: relative;
    background-color: #000;
}

.video-wrapper {
    /* Center video? YouTube shorts are usually 9:16. */
    /* If screen is wider, black bars. If taller, black bars. */
    display: flex;
    justify-content: center;
    align-items: center;
}

.youtube-iframe {
    /* Use object-fit cover equivalent strategy or just 100% */
    /* Many embedded shorts have aspect ratio issues. CSS aspect-ratio might help */
    width: 100%;
    height: 100%;
    /* Allow interaction to use native controls (Seek/Pause) */
    pointer-events: auto; 
}

/* UI Overlay */
.pointer-events-none { pointer-events: none; }
.pointer-events-auto { pointer-events: auto; }

.text-shadow {
    text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
}

.shadow-icon {
    filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.5));
}

.avatar-circle {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background-color: #333;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
}

.plus-badge {
    position: absolute;
    bottom: -5px;
    left: 50%;
    transform: translateX(-50%);
    background-color: var(--accent-color);
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
}

.btn-icon {
    border: none;
    background: transparent;
    transition: transform 0.2s;
}

.btn-icon:active {
    transform: scale(0.9);
}

@keyframes popHearth {
    0% { transform: scale(1); }
    50% { transform: scale(1.3); }
    100% { transform: scale(1); }
}

.animate-heart {
    animation: popHearth 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.text-danger {
    color: #fe2c55 !important;
}
</style>
