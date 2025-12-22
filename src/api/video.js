import api from './http';

// 영상 목록 조회
export function getVideoList(params) {
    // params: { page, size, categoryId, ... }
    return api.get('/video', { params });
}

// 영상 상세 조회
export function getVideoDetail(videoId) {
    return api.get(`/video/${videoId}`);
}

// 좋아요 토글
export function toggleLike(videoId) {
    return api.post(`/video/${videoId}/like`);
}

// 댓글 목록 조회
export function getComments(videoId, params) {
    // params: { page, size }
    return api.get(`/video/${videoId}/comment`, { params });
}

// 댓글 작성
export function createComment(videoId, content) {
    return api.post(`/video/${videoId}/comment`, { content });
}

// 대댓글 작성
export function createReply(commentId, content) {
    return api.post(`/comment/${commentId}/reply`, { content });
}

// 댓글 수정
export function updateComment(commentId, content) {
    return api.patch(`/comment/${commentId}`, { content });
}

// 댓글 삭제
export function deleteComment(commentId) {
    return api.delete(`/comment/${commentId}`);
}

// 내가 좋아요한 영상 목록 조회
export function getMyLikedVideos(params) {
    return api.get('/video/my-likes', { params });
}
