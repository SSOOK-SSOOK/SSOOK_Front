import { createRouter, createWebHistory } from 'vue-router'
import ShortsTab from '../views/ShortsTab.vue'
import CategoryTab from '../views/CategoryTab.vue'
import SubscribeTab from '../views/SubscribeTab.vue'
import MyPageTab from '../views/MyPageTab.vue'

const routes = [
    { path: '/', component: ShortsTab },
    { path: '/category', component: CategoryTab },
    { path: '/subscribe', component: SubscribeTab },
    { path: '/mypage', component: MyPageTab },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router
