<template>
<Teleport to="body">
  <div
    class="offcanvas offcanvas-bottom comment-sheet"
    tabindex="-1"
    id="commentOffcanvas"
    aria-labelledby="commentOffcanvasLabel"
    data-bs-scroll="true"
    data-bs-backdrop="false"
  >
    <!-- Glass Backdrop Layer (Manual implementation if bs-backdrop is false, or rely on CSS) -->

    <!-- Header -->
    <div class="offcanvas-header pt-3 pb-2 sticky-top glass-header z-3">
      <div class="w-100 text-center position-relative">
          <div class="drag-handle mx-auto mb-3"></div>
          <h5 class="offcanvas-title fs-6 fw-bold font-primary mb-1" id="commentOffcanvasLabel">
            댓글
          </h5>
          <button 
            type="button" 
            class="btn-close btn-close-white position-absolute top-50 end-0 translate-middle-y me-2" 
            data-bs-dismiss="offcanvas" 
            aria-label="Close"
          ></button>
      </div>
    </div>

    <!-- Body (List) -->
    <div class="offcanvas-body p-0 custom-scrollbar position-relative flex-grow-1 overflow-auto" ref="commentListRef">
        <!-- Skeleton Loading -->
        <div v-if="loading && comments.length === 0" class="p-3 mt-2">
             <SkeletonLoader :count="5" />
        </div>

        <!-- Empty State -->
        <div v-else-if="comments.length === 0" class="text-center py-5 mt-5">
            <div class="empty-icon mx-auto mb-3">
                <i class="bi bi-chat-square-text text-secondary opacity-25" style="font-size: 3rem;"></i>
            </div>
            <p class="text-secondary small fw-light">아직 댓글이 없습니다.<br>첫 번째 대화를 시작해보세요!</p>
        </div>

        <!-- Comment List -->
        <ul v-else class="list-group list-group-flush pb-5">
            <template v-for="comment in comments" :key="comment.commentId">
                <!-- Parent Comment -->
                <li class="list-group-item bg-transparent border-0 d-flex gap-3 align-items-start py-3 animate-fade-in">
                    <!-- Avatar -->
                    <div class="flex-shrink-0">
                        <!-- If user has image, show it. Else placeholder -->
                        <div class="avatar-circle gradient-border">
                            <img v-if="comment.profileImage" :src="comment.profileImage" alt="Profile" class="w-100 h-100 rounded-circle object-fit-cover">
                            <span v-else class="initials">{{ comment.nickname.charAt(0) }}</span>
                        </div>
                    </div>

                    <!-- Content -->
                    <div class="flex-grow-1 w-100">
                        <!-- Header Line: Nickname + Actions -->
                        <div class="d-flex justify-content-between align-items-start mb-1">
                            <div class="d-flex align-items-center gap-2">
                                <span class="fw-bold small text-white">{{ comment.nickname }}</span>
                                <span v-if="isOwner(comment)" class="badge bg-secondary bg-opacity-25 text-secondary x-small py-0 px-1">나</span>
                                <span class="text-secondary x-small">{{ formatTime(comment.createdAt) }}</span>
                                <span v-if="isEdited(comment)" class="text-secondary x-small">(수정됨)</span>
                            </div>
                        </div>

                        <!-- Edit Mode -->
                        <div v-if="editingCommentId === comment.commentId" class="mb-2">
                            <textarea 
                                v-model="editingContent" 
                                class="form-control bg-dark text-white border-secondary mb-2" 
                                rows="2"
                            ></textarea>
                            <div class="d-flex justify-content-end gap-2">
                                <button @click="cancelEdit" class="btn btn-sm btn-outline-secondary">취소</button>
                                <button @click="handleUpdate(comment.commentId)" class="btn btn-sm btn-accent text-black fw-bold">완료</button>
                            </div>
                        </div>

                        <!-- View Mode -->
                        <template v-else>
                            <p class="mb-2 small text-light text-break fw-light lh-base">{{ comment.content }}</p>
                            
                            <!-- Action Bar -->
                            <div class="d-flex gap-3 align-items-center">
                                <button 
                                    v-if="editingCommentId !== comment.commentId"
                                    @click="startReply(comment)"
                                    class="btn-action text-secondary"
                                >
                                    답글달기
                                </button>
                                
                                <template v-if="isOwner(comment) && editingCommentId !== comment.commentId">
                                    <button @click="startEdit(comment)" class="btn-action text-secondary">수정</button>
                                    <button @click="handlenrDelete(comment)" class="btn-action text-secondary">삭제</button>
                                </template>
                            </div>
                        </template>
                        
                        <!-- Replies List (Nested) -->
                        <div v-if="comment.replies && comment.replies.length > 0" class="mt-3 ps-2 border-start border-secondary border-opacity-25">
                            <div 
                                v-for="reply in comment.replies" 
                                :key="reply.commentId" 
                                class="d-flex gap-2 mt-3"
                            >
                                <div class="avatar-circle-sm flex-shrink-0 bg-dark text-secondary position-relative">
                                    <template v-if="reply.profileImage">
                                         <img :src="reply.profileImage" class="w-100 h-100 rounded-circle object-fit-cover">
                                         <!-- Small arrow overlay or separate? Keeping it simple for now, just avatar -->
                                    </template>
                                    <i v-else class="bi bi-arrow-return-right"></i>
                                </div>
                                <div class="flex-grow-1 w-100">
                                     <div class="d-flex justify-content-between align-items-start mb-1">
                                        <div class="d-flex align-items-center gap-2">
                                            <span class="fw-bold text-white small">{{ reply.nickname }}</span>
                                            <span v-if="isOwner(reply)" class="badge bg-secondary bg-opacity-25 text-secondary x-small py-0 px-1">나</span>
                                            <span class="text-secondary x-small">{{ formatTime(reply.createdAt) }}</span>
                                        </div>
                                     </div>

                                    <!-- Edit Mode (Reply) -->
                                    <div v-if="editingCommentId === reply.commentId" class="mt-1">
                                        <textarea 
                                            v-model="editingContent" 
                                            class="form-control bg-dark text-white border-secondary mb-2" 
                                            rows="2"
                                        ></textarea>
                                        <div class="d-flex justify-content-end gap-2">
                                            <button @click="cancelEdit" class="btn btn-sm btn-outline-secondary">취소</button>
                                            <button @click="handleUpdate(reply.commentId, comment.commentId)" class="btn btn-sm btn-accent text-black fw-bold">완료</button>
                                        </div>
                                    </div>
                                    
                                    <!-- View Mode (Reply) -->
                                    <template v-else>
                                        <p class="mb-1 small text-white-50 text-break fw-light lh-base">{{ reply.content }}</p>
                                        <div class="d-flex gap-3">
                                            <template v-if="isOwner(reply) && editingCommentId !== reply.commentId">
                                                <button @click="startEdit(reply)" class="btn-action x-small text-secondary">수정</button>
                                                <button @click="handlenrDelete(reply, comment.commentId)" class="btn-action x-small text-secondary">삭제</button>
                                            </template>
                                        </div>
                                    </template>
                                </div>
                            </div>
                        </div>
                    </div>
                </li>
            </template>
        </ul>
        
        <!-- Infinite Scroll Sentinel -->
        <div ref="sentinelRef" class="py-3 text-center" style="min-height: 20px;">
             <div v-if="loadingMore" class="spinner-border spinner-border-sm text-secondary" role="status"></div>
        </div>
        
        <!-- Bottom Spacer for Input -->
        <div style="height: 80px;"></div>
    </div>

    <!-- Footer (Input) -->
    <div class="input-area p-3 bg-black border-top border-secondary border-opacity-10 flex-shrink-0">
        <div v-if="replyingTo" class="d-flex justify-content-between align-items-center mb-2 px-2 reply-indicator">
            <span class="x-small text-secondary">
                <span class="text-accent fw-bold">@{{ replyingTo.nickname }}</span>에게 답글 작성 중
            </span>
            <button @click="cancelReply" class="btn btn-sm btn-close btn-close-white scale-75"></button>
        </div>
        <div class="d-flex gap-2 position-relative">
            <input 
                v-model="newComment" 
                @keyup.enter="handleCreate"
                type="text" 
                class="form-control modern-input ps-4" 
                :placeholder="replyingTo ? '따뜻한 답글을 남겨주세요...' : '댓글을 입력하세요...'"
            >
            <button 
                @click="handleCreate" 
                class="btn btn-accent btn-send d-flex align-items-center justify-content-center" 
                :disabled="!newComment.trim()"
            >
                <i class="bi bi-arrow-up-short fs-4"></i>
            </button>
        </div>
    </div>
  </div>
</Teleport>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { getComments as getCommentList, createComment, createReply, deleteComment, updateComment } from '@/api/video';
import { useAuthStore } from '@/stores/auth';
import { useToastStore } from '@/stores/toast';
import { useDialogStore } from '@/stores/dialog';
import SkeletonLoader from '@/components/common/SkeletonLoader.vue';

// Props
const props = defineProps({
    videoId: {
        type: Number,
        default: null
    }
});

const authStore = useAuthStore();
const toastStore = useToastStore();
const dialogStore = useDialogStore();
const comments = ref([]);
const totalCount = ref(0);
const loading = ref(false); // Initial load
const loadingMore = ref(false); // Pagination
const newComment = ref('');
const commentListRef = ref(null);
const sentinelRef = ref(null);

const replyingTo = ref(null); 
const editingCommentId = ref(null);
const editingContent = ref('');

// Pagination state
const page = ref(1);
const size = 20; // Reduced size for infinite scroll
const hasMore = ref(true);
let observer = null;

const loadComments = async (id, isLoadMore = false) => {
    if (!id) return;
    
    if (isLoadMore) {
        if (!hasMore.value || loadingMore.value) return;
        loadingMore.value = true;
    } else {
        loading.value = true;
        page.value = 1;
        hasMore.value = true;
        comments.value = [];
    }

    replyingTo.value = null; 
    editingCommentId.value = null;

    try {
        const response = await getCommentList(id, { page: page.value, size: size });
        const data = response.data.data;
        const newContent = data.content || [];

        if (newContent.length < size) {
            hasMore.value = false;
        }

        if (isLoadMore) {
            comments.value = [...comments.value, ...newContent];
            page.value++;
        } else {
            comments.value = newContent;
            page.value++;
            // Setup observer after data is loaded and DOM is ready
            setTimeout(setupObserver, 200);
        }

    } catch (error) {
        console.error("Failed to load comments", error);
    } finally {
        loading.value = false;
        loadingMore.value = false;
    }
};

const setupObserver = () => {
    if (observer) observer.disconnect();
    
    observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore.value && !loading.value && !loadingMore.value) {
            loadComments(props.videoId, true);
        }
    }, {
        root: commentListRef.value,
        threshold: 0.1
    });

    if (sentinelRef.value) {
        observer.observe(sentinelRef.value);
    }
};

const startReply = (comment) => {
    replyingTo.value = comment;
    editingCommentId.value = null;
};

const cancelReply = () => {
    replyingTo.value = null;
    newComment.value = '';
};

// Edit Logic
const startEdit = (comment) => {
    editingCommentId.value = comment.commentId;
    editingContent.value = comment.content;
    replyingTo.value = null;
};

const cancelEdit = () => {
    editingCommentId.value = null;
    editingContent.value = '';
};

const handleUpdate = async (commentId, parentId = null) => {
    if (!editingContent.value.trim()) return;

    try {
        await updateComment(commentId, editingContent.value);
        
        // Update local state
        if (parentId) {
            const parent = comments.value.find(c => c.commentId === parentId);
            if (parent && parent.replies) {
                const reply = parent.replies.find(r => r.commentId === commentId);
                if (reply) {
                    reply.content = editingContent.value;
                    reply.updatedAt = new Date().toISOString(); // Optimistic update
                }
            }
        } else {
            const comment = comments.value.find(c => c.commentId === commentId);
            if (comment) {
                comment.content = editingContent.value;
                comment.updatedAt = new Date().toISOString(); // Optimistic update
            }
        }

        cancelEdit();
        toastStore.addToast('댓글이 수정되었습니다.', 'success');

    } catch (error) {
        console.error("Failed to update comment", error);
        const message = error.response?.data?.message || '댓글 수정에 실패했습니다.';
        toastStore.addToast(message, 'error');
    }
};

// Define emits
const emit = defineEmits(['update-count']);

const handleCreate = async () => {
    if (!newComment.value.trim()) return;
    
    // Reply Mode
    if (replyingTo.value) {
        try {
            const response = await createReply(replyingTo.value.commentId, newComment.value);
            const createdReply = response.data.data;

            // Find parent and push query
            const parent = comments.value.find(c => c.commentId === replyingTo.value.commentId);
            if (parent) {
                if (!parent.replies) parent.replies = [];
                parent.replies.push(createdReply);
            } else {
                 await loadComments(props.videoId);
            }
            
            newComment.value = '';
            cancelReply();
            
            emit('update-count', { videoId: props.videoId, delta: 1 });
            toastStore.addToast('답글이 등록되었습니다.', 'success');

        } catch (error) {
            console.error("Failed to post reply", error);
            const message = error.response?.data?.message || '답글 작성에 실패했습니다.';
            toastStore.addToast(message, 'error');
        }
        return;
    }

    // Normal Comment Mode
    if (!props.videoId) return;
    try {
        const response = await createComment(props.videoId, newComment.value);
        const createdComment = response.data.data; 
        
        comments.value.unshift(createdComment);
        totalCount.value++;
        newComment.value = '';

        if (commentListRef.value) {
            commentListRef.value.scrollTop = 0;
        }

        emit('update-count', { videoId: props.videoId, delta: 1 });
        toastStore.addToast('댓글이 등록되었습니다.', 'success');

    } catch (error) {
        console.error("Failed to post comment", error);
        
        const message = error.response?.data?.message || '댓글 작성에 실패했습니다.';
        toastStore.addToast(message, 'error');
    }
};

const handlenrDelete = async (target, parentId = null) => {
    const confirmed = await dialogStore.showConfirm('삭제 확인', '정말 이 댓글을 삭제하시겠습니까?');
    if (!confirmed) return;

    try {
        await deleteComment(target.commentId);
        
        if (parentId) {
            // It was a reply
            const parent = comments.value.find(c => c.commentId === parentId);
            if (parent && parent.replies) {
                parent.replies = parent.replies.filter(r => r.commentId !== target.commentId);
            }
        } else {
            // Top level
            comments.value = comments.value.filter(c => c.commentId !== target.commentId);
            totalCount.value--;
        }
        
        emit('update-count', { videoId: props.videoId, delta: -1 });
        toastStore.addToast('댓글이 삭제되었습니다.', 'success');

    } catch (error) {
        console.error("Failed to delete comment", error);
        toastStore.addToast('댓글 삭제에 실패했습니다.', 'error');
    }
};

const isOwner = (commentOrAuthorId) => {
    const user = authStore.user;
    if (typeof commentOrAuthorId === 'object' && commentOrAuthorId !== null) {
        if (commentOrAuthorId.isMyComment || commentOrAuthorId.myComment) return true;
        const authorId = commentOrAuthorId.userId;
        return user && user.userId == authorId;
    }
    return user && user.userId == commentOrAuthorId;
};

// Check if updated time is significantly different from created time
const isEdited = (comment) => {
    if (!comment.updatedAt || !comment.createdAt) return false;
    const created = new Date(comment.createdAt).getTime();
    const updated = new Date(comment.updatedAt).getTime();
    return updated > created + 1000; // 1 second buffer
};

const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = (now - date) / 1000;

    if (diff < 60) return '방금 전';
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
};

defineExpose({
    loadComments
});
</script>

<style scoped>
.comment-sheet {
    height: 75vh !important;
    border-top-left-radius: 20px;
    border-top-right-radius: 20px;
    max-width: 720px;
    background-color: rgba(20, 20, 20, 0.95); /* Semi-transparent black */
    backdrop-filter: blur(10px); /* Glassmorphism */
    box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
    margin: 0 auto; /* Center horizontally */
    left: 0;
    right: 0;
}

.glass-header {
    background: rgba(20, 20, 20, 0.8);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.drag-handle {
    width: 40px;
    height: 4px;
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
}

.text-accent {
    color: var(--accent-color);
}

.btn-accent {
    background-color: var(--accent-color);
    border: none;
    transition: transform 0.2s;
}
.btn-accent:active {
    transform: scale(0.95);
}

.avatar-circle {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background-color: #333;
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: bold;
    color: white;
    font-size: 0.9rem;
    position: relative;
    overflow: hidden;
}

/* Gradient border for sophisticated look */
.gradient-border {
    background: linear-gradient(#121212, #121212) padding-box,
                linear-gradient(45deg, var(--accent-color), #333) border-box;
    border: 1px solid transparent;
}

.avatar-circle-sm {
    width: 20px;
    height: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.modern-input {
    background-color: rgba(255, 255, 255, 0.1);
    border: none;
    border-radius: 25px;
    color: white;
    padding-top: 10px;
    padding-bottom: 10px;
    transition: all 0.3s;
}
.modern-input:focus {
    background-color: rgba(255, 255, 255, 0.15);
    box-shadow: 0 0 0 1px var(--accent-color);
    color: white;
}
.modern-input::placeholder {
    color: rgba(255, 255, 255, 0.4);
    font-size: 0.9rem;
    font-weight: 300;
}

.btn-send {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    flex-shrink: 0;
}
.btn-send:disabled {
    background-color: #333;
    color: #555;
    opacity: 0.5;
}

.btn-action {
    background: none;
    border: none;
    padding: 0;
    font-size: 0.75rem;
    cursor: pointer;
    font-weight: 500;
}
.btn-action:hover {
    text-decoration: underline;
    color: white !important;
}

.x-small {
    font-size: 0.7rem;
}

.animate-fade-in {
    animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(5px); }
    to { opacity: 1; transform: translateY(0); }
}

.custom-scrollbar::-webkit-scrollbar {
    width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
}
</style>
