import api from './http';

// 내 정보 조회
export function getMyInfo() {
    return api.get('/users/me');
}

// 내 정보 수정
export function updateMyInfo(data) {
    // data: { nickname, ... }
    return api.patch('/users/me', data);
}

// 회원 탈퇴
export function withdraw(userId) {
    return api.delete(`/users/${userId}`);
}

// 프로필 이미지 목록 조회
export function getProfileImages() {
    return api.get('/users/profile-images');
}
