<template>
  <div 
    class="offcanvas offcanvas-bottom bg-dark text-white mx-auto" 
    tabindex="-1" 
    id="commentOffcanvas" 
    ref="offcanvasRef"
    aria-labelledby="commentOffcanvasLabel"
    style="height: 70vh; border-top-left-radius: 16px; border-top-right-radius: 16px; max-width: 720px;"
  >
    <!-- Header -->
    <div class="offcanvas-header border-bottom border-secondary">
      <h5 class="offcanvas-title fs-6 fw-bold mx-auto" id="commentOffcanvasLabel">
        댓글
      </h5>
      <button 
        type="button" 
        class="btn-close btn-close-white position-absolute end-0 me-3" 
        data-bs-dismiss="offcanvas" 
        aria-label="Close"
      ></button>
    </div>

    <!-- Body (List) -->
    <div class="offcanvas-body p-0 custom-scrollbar" ref="commentListRef">
        <!-- Skeleton Loading (Initial) -->
        <div v-if="loading && comments.length === 0" class="p-3">
             <SkeletonLoader :count="5" />
        </div>

        <!-- Empty State -->
        <div v-else-if="comments.length === 0" class="text-center py-5 text-secondary small">
            <p>아직 댓글이 없습니다.<br>첫 번째 댓글을 남겨보세요!</p>
        </div>

        <!-- Comment List -->
        <ul v-else class="list-group list-group-flush">
            <template v-for="comment in comments" :key="comment.commentId">
                <!-- Parent Comment -->
                <li class="list-group-item bg-dark text-white border-0 d-flex gap-3 align-items-start py-3">
                    <!-- Avatar -->
                    <div class="flex-shrink-0">
                        <div class="avatar-circle bg-secondary">
                            <i class="bi bi-person-fill text-white-50"></i>
                        </div>
                    </div>

                    <!-- Content -->
                    <div class="flex-grow-1 w-100">
                        <!-- Header Line: Nickname + Actions -->
                        <div class="d-flex justify-content-between align-items-start mb-1">
                            <div class="d-flex align-items-center gap-2">
                                <span class="fw-bold small text-light">{{ comment.nickname }}</span>
                                <span v-if="isEdited(comment)" class="text-secondary" style="font-size: 0.7rem;">(수정됨)</span>
                            </div>
                            <div class="d-flex gap-2">
                                <!-- Reply Button (Always visible unless editing self) -->
                                <button 
                                    v-if="editingCommentId !== comment.commentId"
                                    @click="startReply(comment)"
                                    class="btn btn-link text-secondary p-0"
                                    style="font-size: 0.8rem; text-decoration: none;"
                                >
                                    답글
                                </button>
                                <!-- Owner Actions -->
                                <template v-if="isOwner(comment) && editingCommentId !== comment.commentId">
                                    <button 
                                        @click="startEdit(comment)" 
                                        class="btn btn-link text-secondary p-0"
                                        style="font-size: 0.8rem; text-decoration: none;"
                                    >
                                        수정
                                    </button>
                                    <button 
                                        @click="handlenrDelete(comment)" 
                                        class="btn btn-link text-secondary p-0"
                                        style="font-size: 0.8rem;"
                                    >
                                        <i class="bi bi-trash"></i>
                                    </button>
                                </template>
                            </div>
                        </div>

                        <!-- Edit Mode -->
                        <div v-if="editingCommentId === comment.commentId" class="mb-2">
                            <textarea 
                                v-model="editingContent" 
                                class="form-control bg-secondary bg-opacity-10 text-white border-secondary mb-2" 
                                rows="2"
                            ></textarea>
                            <div class="d-flex justify-content-end gap-2">
                                <button @click="cancelEdit" class="btn btn-sm btn-outline-secondary">취소</button>
                                <button @click="handleUpdate(comment.commentId)" class="btn btn-sm btn-primary">저장</button>
                            </div>
                        </div>

                        <!-- View Mode -->
                        <template v-else>
                            <p class="mb-1 small text-white text-break">{{ comment.content }}</p>
                            <span class="text-secondary" style="font-size: 0.7rem;">{{ formatTime(comment.createdAt) }}</span>
                        </template>
                        
                        <!-- Replies List (Nested) -->
                        <div v-if="comment.replies && comment.replies.length > 0" class="mt-2 text-start">
                            <div 
                                v-for="reply in comment.replies" 
                                :key="reply.commentId" 
                                class="d-flex gap-2 mt-2"
                            >
                                <div class="avatar-circle-sm bg-secondary flex-shrink-0">
                                    <i class="bi bi-person-fill text-white-50" style="font-size: 0.7rem;"></i>
                                </div>
                                <div class="flex-grow-1 w-100">
                                     <div class="d-flex justify-content-between align-items-start">
                                        <div class="d-flex align-items-center gap-2">
                                            <span class="fw-bold text-light" style="font-size: 0.8rem;">{{ reply.nickname }}</span>
                                            <span v-if="isEdited(reply)" class="text-secondary" style="font-size: 0.65rem;">(수정됨)</span>
                                        </div>
                                         <!-- Owner Actions (Reply) -->
                                        <div class="d-flex gap-2" v-if="isOwner(reply) && editingCommentId !== reply.commentId">
                                            <button 
                                                @click="startEdit(reply)" 
                                                class="btn btn-link text-secondary p-0"
                                                style="font-size: 0.7rem; text-decoration: none;"
                                            >
                                                수정
                                            </button>
                                            <button 
                                                @click="handlenrDelete(reply, comment.commentId)" 
                                                class="btn btn-link text-secondary p-0"
                                                style="font-size: 0.7rem;"
                                            >
                                                <i class="bi bi-trash"></i>
                                            </button>
                                        </div>
                                     </div>

                                    <!-- Edit Mode (Reply) -->
                                    <div v-if="editingCommentId === reply.commentId" class="mt-1">
                                        <textarea 
                                            v-model="editingContent" 
                                            class="form-control bg-secondary bg-opacity-10 text-white border-secondary mb-2" 
                                            rows="2"
                                            style="font-size: 0.8rem;"
                                        ></textarea>
                                        <div class="d-flex justify-content-end gap-2">
                                            <button @click="cancelEdit" class="btn btn-sm btn-outline-secondary" style="font-size: 0.7rem;">취소</button>
                                            <button @click="handleUpdate(reply.commentId, comment.commentId)" class="btn btn-sm btn-primary" style="font-size: 0.7rem;">저장</button>
                                        </div>
                                    </div>
                                    
                                    <!-- View Mode (Reply) -->
                                    <template v-else>
                                        <p class="mb-0 small text-white-50 text-break">{{ reply.content }}</p>
                                        <span class="text-secondary" style="font-size: 0.65rem;">{{ formatTime(reply.createdAt) }}</span>
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
             <!-- Using Skeleton for pagination loading too, or just spinner -->
             <div v-if="loadingMore" class="spinner-border spinner-border-sm text-secondary" role="status"></div>
        </div>
    </div>

    <!-- Footer (Input) -->
    <div class="offcanvas-footer p-3 border-top border-secondary bg-dark" style="position: sticky; bottom: 0;">
        <div v-if="replyingTo" class="d-flex justify-content-between align-items-center mb-2 px-1">
            <span class="small text-secondary">
                <span class="text-primary">@{{ replyingTo.nickname }}</span>님에게 답글 남기는 중
            </span>
            <button @click="cancelReply" class="btn btn-sm btn-close btn-close-white"></button>
        </div>
        <div class="d-flex gap-2">
            <input 
                v-model="newComment" 
                @keyup.enter="handleCreate"
                type="text" 
                class="form-control bg-secondary bg-opacity-25 text-white border-0 rounded-pill" 
                :placeholder="replyingTo ? '답글 추가...' : '댓글 추가...'"
            >
            <button 
                @click="handleCreate" 
                class="btn rounded-circle btn-primary d-flex align-items-center justify-content-center" 
                style="width: 38px; height: 38px; background-color: var(--accent-color); border: none;"
                :disabled="!newComment.trim()"
            >
                <i class="bi bi-arrow-up-short fs-4 text-white"></i>
            </button>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { getCommentList, createComment, createReply, deleteComment, updateComment } from '@/api/comment';
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
        toastStore.addToast('댓글 수정에 실패했습니다.', 'error');
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
            toastStore.addToast('답글 작성에 실패했습니다.', 'error');
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
        toastStore.addToast('댓글 작성에 실패했습니다.', 'error');
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
.avatar-circle-sm {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>
