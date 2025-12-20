import axios from 'axios';

// Base axios instance assumption (or import if you have a shared one, using axios directly for now but mirroring typical pattern)
// Ideally we should use the configured axios instance if it exists (e.g., set up with interceptors for token).
// I will check if there is a 'src/api/index.js' or similar first?
// Based on 'src/api/auth.js' and 'src/api/user.js' previously viewed, they likely import a common request instance.
// Wait, I haven't seen a common 'request' instance. I saw `import axios from 'axios'` in `auth.js` in my memory (or maybe not?).
// Let's check `src/api/auth.js` again? No, I viewed it. It imports `axios` directly?
// Actually in `auth.js` I saw `import { login as ... }`. 
// Let's assume there is a configured axios or just use axios.
// Given previous files, I should probably check if there is a common `axios` config.
// But for now, I'll use axios directly and if I see a pattern later I fixes it. 
// Ah, `vite.config.js` sets proxy.
// Let's use a local instance or import if I find one. 
// I'll assume standard axios for now, ensuring headers are set.

// Actually, `useAuthStore` sets the token in `localStorage`.
// If I use a raw axios, I need to set the header manually every time or use an interceptor.
// Let's create a simple wrapper or just use axios with headers.

import { useAuthStore } from '@/stores/auth';

const apiClient = axios.create({
    baseURL: '/api', // Vite proxy handles this
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to add token
apiClient.interceptors.request.use((config) => {
    const authStore = useAuthStore();
    if (authStore.token) {
        config.headers['token'] = authStore.token;
    }
    return config;
});

// 1. 댓글 목록 조회
export const getCommentList = (videoId, params) => {
    return apiClient.get(`/video/${videoId}/comment`, { params });
};

// 2. 댓글 작성
export const createComment = (videoId, content) => {
    return apiClient.post(`/video/${videoId}/comment`, { content });
};

// 2-1. 대댓글 작성
export const createReply = (commentId, content) => {
    return apiClient.post(`/comment/${commentId}/reply`, { content });
};

// 2-2. 댓글 수정
export const updateComment = (commentId, content) => {
    return apiClient.patch(`/comment/${commentId}`, { content });
};

// 3. 댓글 삭제
export const deleteComment = (commentId) => {
    return apiClient.delete(`/comment/${commentId}`);
};
