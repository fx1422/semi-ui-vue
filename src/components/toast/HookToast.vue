<template>
    <Toast v-if="visible" v-bind="toastProps" @close="handleClose">
        <!-- Pass through slot content to Toast component -->
        <slot />
    </Toast>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import Toast from './Toast.vue';
import type { ToastProps } from './interface';

interface HookToastProps extends ToastProps {
    afterClose?: (id: string) => void;
}

const props = defineProps<HookToastProps>();

const visible = ref(true);

const toastProps = computed(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { afterClose, ...rest } = props;
    return rest;
});

const handleClose = (_id?: string) => {
    visible.value = false;
};

watch(visible, (newVal) => {
    if (!newVal && props.afterClose && props.id) {
        props.afterClose(props.id);
    }
});

defineExpose({
    close: () => {
        visible.value = false;
    },
});
</script>
