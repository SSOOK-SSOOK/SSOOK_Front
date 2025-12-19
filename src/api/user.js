import api from './http';

// 회원가입
export function signup(data) {
    // data: { loginId, password, nickname, ... }
    return api.post('/users/signup', data);
}

// 로그인
export function login(loginId, password) {
    return api.post('/users/login', { loginId, password });
}

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
