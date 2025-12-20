import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import ShortsTab from '../views/ShortsTab.vue'
import CategoryTab from '../views/CategoryTab.vue'
import SubscribeTab from '../views/SubscribeTab.vue'
import MyPageTab from '../views/MyPageTab.vue'
import LoginView from '../views/LoginView.vue'
import SignupView from '../views/SignupView.vue'
import ProfileEditView from '../views/ProfileEditView.vue'

const routes = [
    {
        path: '/',
        component: ShortsTab,
        meta: { requiresAuth: true }
    },
    {
        path: '/category',
        component: CategoryTab,
        meta: { requiresAuth: true }
    },
    {
        path: '/subscribe',
        component: SubscribeTab,
        meta: { requiresAuth: true }
    },
    {
        path: '/mypage',
        component: MyPageTab,
        meta: { requiresAuth: true }
    },
    {
        path: '/profile/edit',
        component: ProfileEditView,
        meta: { requiresAuth: true, hideBottomNav: true }
    },
    {
        path: '/login',
        component: LoginView,
        meta: { hideBottomNav: true }
    },
    {
        path: '/signup',
        component: SignupView,
        meta: { hideBottomNav: true }
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

// Navigation Guard
router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();
    const isAuthenticated = authStore.isAuthenticated;

    // 1. If route requires auth and user is NOT authenticated -> Redirect to Login
    if (to.meta.requiresAuth && !isAuthenticated) {
        next('/login');
        return;
    }

    // 2. If user is authenticated and tries to go to Login or Signup -> Redirect to Home
    if (isAuthenticated && (to.path === '/login' || to.path === '/signup')) {
        next('/');
        return;
    }

    next();
});

export default router
