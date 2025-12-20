import api from './http';

// 구독하기
export function subscribe(categoryId) {
    return api.post(`/subscription/${categoryId}`);
}

// 구독 취소
export function unsubscribe(categoryId) {
    return api.delete(`/subscription/${categoryId}`);
}
