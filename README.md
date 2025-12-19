# 🌱 쑥쑥 - Frontend

**개발자를 위한 숏폼 지식 공유 플랫폼, 쑥쑥** <br>
빠르고 가볍게, 핵심 개발 지식을 영상으로 공유하고 성장하세요!

## 📖 프로젝트 소개 (Overview)
쑥쑥은 바쁜 현대 개발자들을 위해 만들어진 **숏폼(Shorts) 기반의 학습 플랫폼**입니다. <br>
긴 강의 대신 핵심만 담은 짧은 영상을 통해 기술 트렌드를 익히고, 관심 있는 분야(Category)를 구독하여 나만의 학습 피드를 만들 수 있습니다.

본 리포지토리는 **Vue.js 3**로 구축된 **모바일 웹(Mobile Web)** 프론트엔드 프로젝트입니다.

## 🛠 기술 스택 (Tech Stack)

### Environment
![NodeJS](https://img.shields.io/badge/node.js-v18.0.0+-339933?style=flat&logo=node.js&logoColor=white)
![NPM](https://img.shields.io/badge/npm-v9.0.0+-CB3837?style=flat&logo=npm&logoColor=white)

### Framework & Library
![Vue.js](https://img.shields.io/badge/vue.js-3.x-4FC08D?style=flat&logo=vue.js&logoColor=white)
![Vite](https://img.shields.io/badge/vite-4.x-646CFF?style=flat&logo=vite&logoColor=white)
![Pinia](https://img.shields.io/badge/pinia-2.x-FFE466?style=flat&logo=pinia&logoColor=black)
![Vue Router](https://img.shields.io/badge/vue_router-4.x-4FC08D?style=flat&logo=vue.js&logoColor=white)
![Axios](https://img.shields.io/badge/axios-1.x-5A29E4?style=flat&logo=axios&logoColor=white)

### UI / UX
![Bootstrap 5](https://img.shields.io/badge/bootstrap-5.3-7952B3?style=flat&logo=bootstrap&logoColor=white)
![Bootstrap Icons](https://img.shields.io/badge/bootstrap_icons-1.10-7952B3?style=flat&logo=bootstrap&logoColor=white)

## 📱 주요 기능 (Key Features)

### 1️⃣ 쇼츠 (Shorts) - 메인 피드
- 유튜브 쇼츠, 틱톡 스타일의 **세로 스크롤 비디오 플레이어**
- 내가 **구독한 카테고리**의 영상만 큐레이션하여 재생
- 좋아요, 댓글, 공유하기 기능 제공

### 2️⃣ 카테고리 (Category)
- 다양한 개발 주제(Java, Vue, CS 등) 탐색 및 검색
- 관심 있는 분야 **'구독' 및 '구독 취소'** 기능

### 3️⃣ 구독 관리 (Subscribe)
- 나의 구독 리스트 한눈에 보기
- 불필요한 카테고리 관리

### 4️⃣ 마이페이지 (MyPage)
- 내 프로필 정보 관리
- 회원 탈퇴 기능

## 📂 폴더 구조 (Directory Structure)
```bash
src/
├── api/            # Axios API 호출 모듈 (도메인별 분리)
├── assets/         # 정적 리소스 (Images, CSS)
├── components/     # UI 컴포넌트
│   ├── common/     # 공통 컴포넌트 (Buttons, Modals)
│   ├── layout/     # 레이아웃 (BottomNav 등)
│   └── shorts/     # 비디오 플레이어 관련
├── views/          # 페이지 단위 컴포넌트 (Views)
├── stores/         # Pinia 상태 관리 (Global State)
├── router/         # Vue Router 설정
└── App.vue         # Root Component
