import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

export const useThemeStore = defineStore('theme', () => {
    // Default to dark mode if no preference found
    const isDarkMode = ref(localStorage.getItem('theme') !== 'light');

    const toggleTheme = () => {
        isDarkMode.value = !isDarkMode.value;
    };

    const applyTheme = () => {
        if (isDarkMode.value) {
            document.body.classList.remove('light-mode');
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
            document.body.classList.add('light-mode');
        }
        localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light');
    };

    // Watch for changes and apply
    watch(isDarkMode, applyTheme);

    // Initial apply
    applyTheme();

    return {
        isDarkMode,
        toggleTheme
    };
});
