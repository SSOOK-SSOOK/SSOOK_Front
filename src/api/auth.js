import api from './http';

// 로그인
export function login(loginId, password) {
    return api.post('/users/login', { email: loginId, password });
}

// 회원가입
export function signup(data) {
    // data: { loginId, password, nickname, ... }
    return api.post('/users/signup', data);
}
