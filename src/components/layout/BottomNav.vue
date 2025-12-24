<template>
  <nav class="bottom-nav navbar px-3">
    <div class="d-flex w-100 justify-content-between align-items-center">
      <router-link to="/" class="nav-link text-center flex-grow-1" active-class="active">
        <i class="bi bi-house-door-fill fs-4"></i>
        <div class="small-text">쇼츠</div>
      </router-link>
      
      <router-link to="/category" class="nav-link text-center flex-grow-1" active-class="active">
        <i class="bi bi-search fs-4"></i>
        <div class="small-text">카테고리</div>
      </router-link>
      
      <router-link to="/subscribe" class="nav-link text-center flex-grow-1" active-class="active">
        <i class="bi bi-heart-fill fs-4"></i>
        <div class="small-text">구독</div>
      </router-link>
      
      <router-link to="/mypage" class="nav-link text-center flex-grow-1" active-class="active">
        <i class="bi bi-person-fill fs-4"></i>
        <div class="small-text">MY</div>
      </router-link>
    </div>
  </nav>
</template>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 720px;
  z-index: 1030;
  margin: 0 auto;
  background-color: var(--nav-bg) !important;
  border-top: 1px solid var(--card-border);
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.nav-link {
  color: var(--text-secondary);
  opacity: 0.8; 
  text-decoration: none;
  transition: color 0.2s;
}

.nav-link.active {
  color: var(--text-color);
  opacity: 1;
}

.nav-link.active i {
  color: var(--accent-color); 
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.4); 
}

.small-text {
  font-size: 0.7rem;
  margin-top: 2px;
}
</style>
