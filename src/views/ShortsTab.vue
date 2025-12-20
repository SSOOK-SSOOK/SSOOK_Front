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
                        <div class="mb-2">
                             <span class="badge bg-secondary bg-opacity-50 text-white mb-1"><i class="bi bi-person-circle me-1"></i> SsookSsook</span>
                        </div>
                        <h5 class="fw-bold mb-1 text-shadow">{{ video.title }}</h5>
                         <!-- <p class="small text-light text-shadow mb-0">#Shorts #Coding #Dev</p> -->
                    </div>

                    <!-- Mute Toggle (Absolute Top Right) -->
                    <div class="position-absolute top-0 end-0 p-3 mt-4 pointer-events-auto z-3">
                        <button @click="toggleMute" class="btn btn-dark bg-opacity-50 rounded-circle text-white p-2">
                            <i class="bi" :class="isMuted ? 'bi-volume-mute-fill' : 'bi-volume-up-fill'"></i>
                        </button>
                    </div>

                    <!-- Right Sidebar Actions -->
                    <div class="d-flex flex-column align-items-center gap-4 pointer-events-auto">
                        <!-- Like Profile (Avatar) -->
                        <div class="position-relative">
                           <div class="avatar-circle border border-white">
                                <i class="bi bi-person-fill fs-4"></i>
                           </div>
                           <div class="plus-badge"><i class="bi bi-plus text-white small"></i></div>
                        </div>

                        <!-- Like -->
                        <div class="d-flex flex-column align-items-center">
                            <button @click="handleLike(video.videoId)" class="btn btn-icon text-white p-0">
                                <i class="bi bi-heart-fill fs-1 shadow-icon" style="color: #fe2c55;"></i> <!-- Hardcoded active for demo, logic needed -->
                            </button>
                            <span class="small fw-bold text-shadow">0</span>
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
                             <button class="btn btn-icon text-white p-0">
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
import { useVideoStore } from '@/stores/video';
import CommentSheet from '@/components/comment/CommentSheet.vue';
import { Offcanvas } from 'bootstrap';

const videoStore = useVideoStore();
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

// Extract ID logic
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
    // controls=0: Hide controls
    // autoplay=1: Autoplay if strict interaction allowed (muted helps)
    // mute=1: Required for autoplay on most browsers
    // loop=1: Loop
    // playlist={id}: Required for loop to work
    // rel=0: No related videos from other channels
    // playsinline=1: iOS inline
    const playState = isPlaying ? '1' : '0';
    const origin = window.location.origin;
    // Changed controls=0 to controls=1 to allow seeking
    return `https://www.youtube.com/embed/${id}?autoplay=${playState}&mute=1&controls=1&loop=1&playlist=${id}&rel=0&playsinline=1&enablejsapi=1&origin=${origin}&modestbranding=1`;
};

// Only render iframe if near active index to save resources (Lazy render)
const shouldRender = (index) => {
    return Math.abs(activeIndex.value - index) <= 1; 
};

onMounted(async () => {
    await videoStore.fetchVideos();
    console.log('[DEBUG ShortsTab] Videos:', videoStore.videos);
    
    // Setup Intersection Observer for snapping/active detection
    const options = {
        root: feedContainer.value,
        threshold: 0.6 // Trigger when 60% visible
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const index = parseInt(entry.target.getAttribute('data-index'));
                activeIndex.value = index;
                
                // Infinite Scroll Trigger
                if (index >= videoStore.videos.length - 2) {
                    videoStore.fetchVideos();
                }
            }
        });
    }, options);

    // Watch for new items to observe
    watch(() => videoStore.videos.length, async () => {
        await nextTick();
        // Re-observe all? or just last ones. For simplicity re-observe new calls.
        if (videoItems.value) {
            videoItems.value.forEach(el => observer.observe(el));
        }
    }, { immediate: true });
});

const isMuted = ref(true); // Default muted for autoplay

const toggleMute = () => {
    isMuted.value = !isMuted.value;
    const command = isMuted.value ? 'mute' : 'unMute';
    
    // Send command to ALL iframes or just the active one?
    // Best to send to active one.
    const activeItem = videoItems.value[activeIndex.value];
    if (activeItem) {
        const iframe = activeItem.querySelector('iframe');
        if (iframe) {
            iframe.contentWindow.postMessage(JSON.stringify({
                event: 'command',
                func: command,
                args: []
            }), '*');
        }
    }
};

// Also sync mute state when changing videos? 
// TikTok keeps mute state across videos. 
// YouTube iframe resets state on reload. 
// We need to apply current mute state when a new video beomes active.
watch(activeIndex, async () => {
    await nextTick();
    // Apply current mute preference to new active video
    const command = isMuted.value ? 'mute' : 'unMute';
    const activeItem = videoItems.value[activeIndex.value];
    if (activeItem) {
        const iframe = activeItem.querySelector('iframe');
        // Give iframe a moment to load? Iframe might not be ready. 
        // YouTube API handles queuing but postMessage might be missed if too early.
        // For simple iframe, we might just rely on user clicking again if it fails, 
        // or set timeout. But let's try sending it.
        if (iframe) {
             // Send twice to be sure? Or wait for 'onReady' event (hard without full API).
             // Simple approach: Send it.
             setTimeout(() => {
                iframe.contentWindow.postMessage(JSON.stringify({
                    event: 'command',
                    func: command,
                    args: []
                }), '*');
             }, 500); // 500ms delay to allow player init
        }
    }
});

const handleLike = (videoId) => {
    videoStore.toggleLike(videoId);
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
    transform: scale(0.8);
}
</style>
