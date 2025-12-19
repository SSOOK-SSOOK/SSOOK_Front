
import axios from 'axios';

// API_SPEC.md에 따라 Base URL 설정 (Proxy 사용 예정이므로 /api 아님, 그냥 /api라고 해도 되는데 spec상 /users, /video 등이 root에 있음.
// 그러나 CORS 문제 해결을 위해 Vite Proxy를 /api -> http://localhost:8080 으로 설정하는 것이 일반적이나,
// API_SPEC.md에서 Base URL: http://localhost:8080 라고 했고, "Vite Proxy 설정 시 /api로 접근 가능하도록 설정 권장"이라고 되어 있으니
// baseURL을 '/api'로 설정하겠습니다.
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: 토큰 자동 주입
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['token'] = token; // API_SPEC: "Request Header에 token: {JWT}를 포함"
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
