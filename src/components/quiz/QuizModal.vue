<template>
  <Teleport to="body">
    <div v-if="isVisible" class="quiz-modal-backdrop" @click="close">
      <div class="quiz-modal-content" @click.stop>
        
        <!-- Header -->
        <div class="modal-header d-flex justify-content-between align-items-center mb-4">
          <h5 class="m-0 fw-bold font-primary text-accent">
            <i class="bi bi-robot me-2"></i>AI 퀴즈 마스터
          </h5>
          <button @click="close" class="btn-close btn-close-white"></button>
        </div>

        <!-- 1. Setup Phase -->
        <div v-if="phase === 'SETUP'" class="text-center fade-in">
          <div class="mb-4">
            <i class="bi bi-lightbulb-fill fs-1 text-warning mb-3 d-block"></i>
            <h4 class="fw-bold text-white mb-2">어떤 주제로 <br>퀴즈를 풀어볼까요?</h4>
            <p class="text-secondary small">관심있는 키워드를 입력하면 AI가 실시간으로 문제를 만들어드려요!</p>
          </div>
          
          <input 
            v-model="keyword" 
            @keyup.enter="startQuiz"
            type="text" 
            class="form-control bg-dark border-secondary text-white text-center py-3 mb-4 fs-5" 
            placeholder="예: Java, Spring, React..."
            autofocus
          >
          
          <button 
            @click="startQuiz" 
            class="btn btn-accent w-100 py-3 fw-bold fs-5 rounded-pill"
            :disabled="!keyword.trim()"
          >
            퀴즈 생성하기
          </button>
        </div>

        <!-- 2. Loading Phase -->
        <div v-else-if="phase === 'LOADING'" class="text-center py-5 fade-in">
          <div class="spinner-border text-accent mb-4" style="width: 3rem; height: 3rem;" role="status"></div>
          <h5 class="fw-bold text-white mb-2">AI가 문제를 출제하고 있어요...</h5>
          <p class="text-secondary small typing-text">{{ loadingMessage }}</p>
        </div>

        <!-- 3. Playing Phase -->
        <div v-else-if="phase === 'PLAYING'" class="fade-in">
          <div class="d-flex justify-content-between text-secondary small mb-3">
            <span>Question {{ currentIndex + 1 }} / {{ questions.length }}</span>
            <span>Score: {{ score * 10 }}</span>
          </div>

          <!-- Progress Bar -->
          <div class="progress mb-4" style="height: 6px; background-color: #333;">
            <div 
              class="progress-bar bg-accent" 
              role="progressbar" 
              :style="{ width: ((currentIndex + 1) / questions.length) * 100 + '%' }"
            ></div>
          </div>

          <div class="question-box mb-4">
            <h5 class="fw-bold text-white lh-base">{{ currentQuestion.question }}</h5>
          </div>

          <div class="d-grid gap-3">
            <button 
              v-for="(option, idx) in currentQuestion.options" 
              :key="idx"
              @click="submitAnswer(idx)"
              class="btn btn-outline-secondary text-start py-3 px-4 position-relative option-btn"
              :class="{ 
                'correct': showResult && idx === currentQuestion.answer,
                'wrong': showResult && idx === selectedAnswer && idx !== currentQuestion.answer
              }"
              :disabled="showResult"
            >
              <span class="badge bg-dark me-2">{{ ['A', 'B', 'C', 'D'][idx] }}</span>
              {{ option }}
              
              <!-- Result Icons -->
              <i v-if="showResult && idx === currentQuestion.answer" class="bi bi-check-circle-fill text-success position-absolute end-0 top-50 translate-middle-y me-3 fs-5"></i>
              <i v-if="showResult && idx === selectedAnswer && idx !== currentQuestion.answer" class="bi bi-x-circle-fill text-danger position-absolute end-0 top-50 translate-middle-y me-3 fs-5"></i>
            </button>
          </div>

          <!-- Explanation / Next -->
          <div v-if="showResult" class="mt-4 p-3 bg-dark bg-opacity-50 rounded border border-secondary border-opacity-25 fade-in">
            <p class="mb-3 text-light small"><span class="text-info fw-bold">해설:</span> {{ currentQuestion.explanation }}</p>
            <button @click="nextQuestion" class="btn btn-primary w-100 fw-bold">
              {{ isLastQuestion ? '결과 보기' : '다음 문제' }}
            </button>
          </div>
        </div>

        <!-- 4. Result Phase -->
        <div v-else-if="phase === 'RESULT'" class="text-center fade-in">
          <div class="mb-4">
            <div class="score-circle mx-auto mb-3 d-flex flex-column justify-content-center align-items-center">
               <span class="display-4 fw-bold text-accent">{{ score }}</span>
               <span class="text-secondary small">/ {{ questions.length }}</span>
            </div>
            <h3 class="fw-bold text-white">{{ resultMessage }}</h3>
          </div>

          <div class="d-grid gap-2">
            <button @click="reset" class="btn btn-accent fw-bold py-3 rounded-pill">다시 도전하기</button>
            <button @click="close" class="btn btn-dark text-white border-secondary fw-bold py-3 rounded-pill">닫기</button>
          </div>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue';
import { generateQuiz } from '@/api/ai';
import { useToastStore } from '@/stores/toast';

const props = defineProps({
  isVisible: Boolean
});

const emit = defineEmits(['update:isVisible']);
const toastStore = useToastStore();

const phase = ref('SETUP'); // SETUP, LOADING, PLAYING, RESULT
const keyword = ref('');
const questions = ref([]);
const currentIndex = ref(0);
const score = ref(0);
const showResult = ref(false);
const selectedAnswer = ref(null);
const loadingMessage = ref('관련된 지식을 검색하고 있습니다...');

const currentQuestion = computed(() => questions.value[currentIndex.value]);
const isLastQuestion = computed(() => currentIndex.value === questions.value.length - 1);

const resultMessage = computed(() => {
  const percentage = (score.value / questions.value.length) * 100;
  if (percentage === 100) return '완벽해요! AI도 놀라겠는데요? 🤖';
  if (percentage >= 70) return '훌륭합니다! 조금만 더 하면 마스터! 👍';
  if (percentage >= 40) return '좋은 시도였어요! 복습해볼까요? 📚';
  return '힘내세요! 다시 도전해보세요 💪';
});

const close = () => {
  emit('update:isVisible', false);
  // Reset logic is separate, driven by 'reset' button or next open
};

const reset = () => {
  phase.value = 'SETUP';
  keyword.value = '';
  questions.value = [];
  currentIndex.value = 0;
  score.value = 0;
  showResult.value = false;
  selectedAnswer.value = null;
};

const startQuiz = async () => {
  if (!keyword.value.trim()) return;
  
  phase.value = 'LOADING';
  loadingMessage.value = `'${keyword.value}'에 대한 문제를 출제중입니다...`;
  
  // Fun loading messages
  const messages = [
    '난이도를 조절하고 있습니다...', 
    '매력적인 보기를 만드는 중...',
    '정답을 숨기는 중...'
  ];
  let msgIdx = 0;
  const interval = setInterval(() => {
    if (msgIdx < messages.length) {
      loadingMessage.value = messages[msgIdx++];
    }
  }, 1500);

  try {
    const response = await generateQuiz(keyword.value);
    questions.value = response.data.data;
    
    if (questions.value.length === 0) {
      throw new Error('문제가 생성되지 않았습니다.');
    }
    
    clearInterval(interval);
    phase.value = 'PLAYING';
    
  } catch (error) {
    clearInterval(interval);
    console.error(error);
    toastStore.addToast('퀴즈 생성에 실패했습니다. 다시 시도해주세요.', 'error');
    phase.value = 'SETUP';
  }
};

const submitAnswer = (idx) => {
  if (showResult.value) return;
  
  selectedAnswer.value = idx;
  showResult.value = true;
  
  if (idx === currentQuestion.value.answer) {
    score.value++;
    // Optional: Sound effect or confetti
  }
};

const nextQuestion = () => {
  showResult.value = false;
  selectedAnswer.value = null;
  
  if (isLastQuestion.value) {
    phase.value = 'RESULT';
  } else {
    currentIndex.value++;
  }
};

</script>

<style scoped>
.quiz-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(5px);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.quiz-modal-content {
  background-color: #1a1a1a;
  width: 100%;
  max-width: 500px;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.5);
  border: 1px solid rgba(255,255,255,0.1);
  position: relative;
  overflow: hidden;
}

.text-accent {
  color: var(--accent-color, #C0FF00);
}

.btn-accent {
  background-color: var(--accent-color, #C0FF00);
  color: black;
  border: none;
  transition: transform 0.2s;
}
.btn-accent:active {
  transform: scale(0.98);
}

.option-btn {
  border-color: rgba(255,255,255,0.1);
  color: #ddd;
  background-color: rgba(255,255,255,0.05);
  transition: all 0.2s;
}
.option-btn:hover:not(:disabled) {
  background-color: rgba(255,255,255,0.1);
  border-color: rgba(255,255,255,0.3);
}

.option-btn.correct {
  border-color: #28a745;
  background-color: rgba(40, 167, 69, 0.1);
  color: #28a745;
}

.option-btn.wrong {
  border-color: #dc3545;
  background-color: rgba(220, 53, 69, 0.1);
  color: #dc3545;
}

.score-circle {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  border: 4px solid var(--accent-color, #C0FF00);
  background-color: #111;
  box-shadow: 0 0 30px rgba(192, 255, 0, 0.1);
}

.fade-in {
  animation: fadeIn 0.4s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.typing-text::after {
  content: '...';
  animation: dots 1.5s infinite;
}
@keyframes dots {
  0%, 20% { content: '.'; }
  40% { content: '..'; }
  60%, 100% { content: '...'; }
}
</style>
