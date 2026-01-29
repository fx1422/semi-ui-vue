<template>
    <slot
        :animationClassName="currentClassName || ''"
        :animationStyle="extraStyle"
        :animationEventsNeedBind="animationEventsNeedBind"
        :isAnimating="isAnimating"
    />
</template>

<script lang="ts" setup>
import { ref, watch, onMounted, computed, CSSProperties } from 'vue';

// 禁用自动属性继承，因为根节点是 slot（fragment）
defineOptions({
    inheritAttrs: false,
});

interface CSSAnimationProps {
    startClassName?: string;
    endClassName?: string;
    animationState: 'enter' | 'leave';
    onAnimationEnd?: (stoppedByAnother: boolean) => void;
    onAnimationStart?: () => void;
    motion?: boolean;
    replayKey?: string;
    fillMode?: 'backwards' | 'both' | 'forwards' | 'none';
}

const props = withDefaults(defineProps<CSSAnimationProps>(), {
    motion: true,
    replayKey: '',
});

const currentClassName = ref(props.startClassName);
const isAnimating = ref(true);

const extraStyle = computed(
    (): CSSProperties => ({
        animationFillMode: props.fillMode,
    })
);

const handleAnimationStart = () => {
    props.onAnimationStart?.();
};

const handleAnimationEnd = () => {
    currentClassName.value = props.endClassName;
    isAnimating.value = false;
    props.onAnimationEnd?.(false);
};

const animationEventsNeedBind = computed(() => {
    if (props.motion) {
        return {
            onAnimationstart: handleAnimationStart,
            onAnimationend: handleAnimationEnd,
        };
    }
    return {};
});

onMounted(() => {
    props.onAnimationStart?.();
    if (!props.motion) {
        props.onAnimationEnd?.(false);
        isAnimating.value = false;
    }
});

watch([() => props.startClassName, () => props.replayKey, () => props.motion], () => {
    currentClassName.value = props.startClassName;
    isAnimating.value = true;
    props.onAnimationStart?.();
    if (!props.motion) {
        props.onAnimationEnd?.(isAnimating.value);
        isAnimating.value = false;
    }
});
</script>
