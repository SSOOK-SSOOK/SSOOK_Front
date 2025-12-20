import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useDialogStore = defineStore('dialog', () => {
    const isVisible = ref(false);
    const title = ref('');
    const message = ref('');
    const resolvePromise = ref(null);

    const showConfirm = (titleText, messageText) => {
        title.value = titleText;
        message.value = messageText;
        isVisible.value = true;

        return new Promise((resolve) => {
            resolvePromise.value = resolve;
        });
    };

    const confirm = () => {
        isVisible.value = false;
        if (resolvePromise.value) {
            resolvePromise.value(true);
            resolvePromise.value = null;
        }
    };

    const cancel = () => {
        isVisible.value = false;
        if (resolvePromise.value) {
            resolvePromise.value(false);
            resolvePromise.value = null;
        }
    };

    return {
        isVisible,
        title,
        message,
        showConfirm,
        confirm,
        cancel
    };
});
