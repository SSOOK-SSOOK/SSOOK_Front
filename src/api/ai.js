import api from "./http";

// AI 퀴즈 생성 API
function generateQuiz(keyword) {
    return api.post(`/ai/quiz`, { keyword });
}

export {
    generateQuiz
};
