<template>
  <nav class="bottom-nav navbar fixed-bottom navbar-light bg-white border-top">
    <div class="container-fluid d-flex justify-content-around">
      <router-link to="/" class="nav-link text-center" active-class="active">
        <i class="bi bi-house-door fs-4"></i>
        <div class="small-text">쇼츠</div>
      </router-link>
      
      <router-link to="/category" class="nav-link text-center" active-class="active">
        <i class="bi bi-grid fs-4"></i>
        <div class="small-text">카테고리</div>
      </router-link>
      
      <router-link to="/subscribe" class="nav-link text-center" active-class="active">
        <i class="bi bi-heart fs-4"></i>
        <div class="small-text">구독</div>
      </router-link>
      
      <router-link to="/mypage" class="nav-link text-center" active-class="active">
        <i class="bi bi-person fs-4"></i>
        <div class="small-text">MY</div>
      </router-link>
    </div>
  </nav>
</template>

<style scoped>
.bottom-nav {
  max-width: 480px; /* 모바일 앱 스타일 폭 제한 */
  margin: 0 auto;
  left: 0; 
  right: 0;
}
.nav-link {
  color: #6c757d;
  text-decoration: none;
}
.nav-link.active {
  color: #0d6efd; /* Bootstrap Primary Color or Custom */
  font-weight: bold;
}
.small-text {
  font-size: 0.75rem;
}
</style>
