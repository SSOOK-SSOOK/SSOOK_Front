<template>
  <nav class="bottom-nav navbar fixed-bottom">
    <div class="container-fluid d-flex justify-content-around">
      <router-link to="/" class="nav-link text-center" active-class="active">
        <i class="bi bi-house-door-fill fs-4"></i>
        <div class="small-text">쇼츠</div>
      </router-link>
      
      <router-link to="/category" class="nav-link text-center" active-class="active">
        <i class="bi bi-search fs-4"></i>
        <div class="small-text">카테고리</div>
      </router-link>
      
      <router-link to="/subscribe" class="nav-link text-center" active-class="active">
        <i class="bi bi-heart-fill fs-4"></i>
        <div class="small-text">구독</div>
      </router-link>
      
      <router-link to="/mypage" class="nav-link text-center" active-class="active">
        <i class="bi bi-person-fill fs-4"></i>
        <div class="small-text">MY</div>
      </router-link>
    </div>
  </nav>
</template>

<style scoped>
.bottom-nav {
  max-width: 720px;
  margin: 0 auto;
  left: 0; 
  right: 0;
  background-color: var(--nav-bg) !important;
  border-top: 1px solid #333;
}

.nav-link {
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  transition: color 0.2s;
}

.nav-link.active {
  color: var(--text-color);
}

/* 틱톡 스타일: 텍스트 없이 아이콘만 강조하거나, 선택된 아이콘에 포인트 컬러 */
/* 여기서는 요청대로 포인트 컬러 적용 */
.nav-link.active i {
  color: var(--accent-color); 
  text-shadow: 0 0 8px rgba(254, 44, 85, 0.5); /* Neon Glow Effect */
}

.small-text {
  font-size: 0.7rem;
  margin-top: 2px;
}
</style>
