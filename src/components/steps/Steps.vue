<template>
    <component :is="stepsComponent" v-bind="componentProps" @change="handleChange">
        <slot />
    </component>
</template>

<script setup lang="ts">
import { computed, provide } from 'vue';
import { StepsContextKey } from './context';
import BasicSteps from './BasicSteps.vue';
import FillSteps from './FillSteps.vue';
import NavSteps from './NavSteps.vue';
import type { StepsProps } from './interface';

const props = withDefaults(defineProps<StepsProps>(), {
    type: 'fill',
    size: 'default',
});

const emit = defineEmits<{
    change: [current: number];
}>();

// Provide context
provide(StepsContextKey, {
    type: props.type,
});

const stepsComponent = computed(() => {
    switch (props.type) {
        case 'fill':
            return FillSteps;
        case 'basic':
            return BasicSteps;
        case 'nav':
            return NavSteps;
        default:
            return FillSteps;
    }
});

const componentProps = computed(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { type, onChange, ...restProps } = props as any;
    // 明确排除 onChange，因为我们使用 @change 事件
    return restProps;
});

const handleChange = (current: number) => {
    emit('change', current);
};
</script>
