import api from "./http";

// 내 성과 통계 조회
function getUserStats() {
    return api.get(`/users/stats`);
}

// 프로필 이미지 목록 조회
function getProfileImages() {
    return api.get(`/users/profile-images`);
}

// 내 정보 조회 (Promise 반환)
function getMyInfo() {
    return api.get('/users/me');
}

// 내 정보 수정
function updateMyInfo(data) {
    return api.patch('/users/me', data);
}

// 회원 탈퇴
function withdraw(userId) {
    // userId is needed for path var as per controller
    return api.delete(`/users/${userId}`);
}

// 비밀번호 변경
function changePassword(data) {
    return api.patch('/users/me/password', data);
}

export {
    getUserStats,
    getProfileImages,
    getMyInfo,
    updateMyInfo,
    withdraw,
    changePassword
};
