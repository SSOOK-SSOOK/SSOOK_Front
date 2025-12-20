import api from './http';

// 카테고리 목록 조회
export function getCategories(params) {
    // params: { page, perPage }
    return api.get('/category', { params });
}

// 카테고리 상세 조회
export function getCategoryDetail(categoryId) {
    return api.get(`/category/${categoryId}`);
}
