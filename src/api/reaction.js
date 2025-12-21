import api from '@/api/http';

/**
 * 좋아요 등록/취소 토글
 * @param {Number} videoId 
 * @returns {Promise} { liked: boolean, likeCount: number }
 */
export const toggleLike = async (videoId) => {
    return api.post(`/video/${videoId}/like`);
};
