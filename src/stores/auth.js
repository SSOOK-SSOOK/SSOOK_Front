import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { login as apiLogin, signup as apiSignup } from '@/api/auth';
import { getMyInfo } from '@/api/user';
import router from '@/router';

export const useAuthStore = defineStore('auth', () => {
    const token = ref(localStorage.getItem('token') || '');
    const user = ref(null);

    const isAuthenticated = computed(() => !!token.value);

    const setToken = (newToken) => {
        token.value = newToken;
        localStorage.setItem('token', newToken);
    };

    const clearToken = () => {
        token.value = '';
        user.value = null;
        localStorage.removeItem('token');
    };

    const login = async (loginId, password) => {
        try {
            const response = await apiLogin(loginId, password);
            // API_SPEC: Login response might return token in header, or data. 
            // Spec says: "로그인 성공 시 Response Header에 token 키로 JWT가 전달됩니다."
            // Axios interceptor or here we need to extract header.
            // Let's assume the component/api call handles header extraction or we do it here.
            // Since `api.post` returns the response object, we can access headers.

            const authToken = response.headers['token'] || response.data.token;
            // Fallback to data.token just in case, but spec says header.

            if (authToken) {
                setToken(authToken);
                await fetchUserInfo();
                return true;
            } else {
                throw new Error('토큰을 찾을 수 없습니다.');
            }
        } catch (error) {
            console.error('로그인 실패:', error);
            throw error;
        }
    };

    const signup = async (signupData) => {
        await apiSignup(signupData);
    };

    const logout = () => {
        clearToken();
        router.push('/login');
    };

    const fetchUserInfo = async () => {
        try {
            const response = await getMyInfo();
            user.value = response.data.data; // Assuming response structure { status, message, data: { ... } }
        } catch (error) {
            console.error('내 정보 조회 실패:', error);
            // Token might be invalid
            clearToken();
        }
    };

    return {
        token,
        user,
        isAuthenticated,
        login,
        signup,
        logout,
        fetchUserInfo
    };
});
