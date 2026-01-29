<template>
    <section :class="cls" :style="props.style">
        <h5 v-if="props.text" class="section-text">{{ props.text }}</h5>
        <slot></slot>
    </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import classNames from 'classnames';
import { cssClasses } from '@douyinfe/semi-foundation/form/constants';

defineOptions({ name: 'SemiFormSection', inheritAttrs: false });

export interface SectionProps {
    className?: string;
    style?: Record<string, any>;
    text?: string;
}

const props = defineProps<SectionProps>();

const prefix = cssClasses.PREFIX;

const cls = computed(() =>
    classNames(
        {
            [`${prefix}-section`]: true,
        },
        props.className
    )
);
</script>

<style scoped>
.section-text {
    margin: 0 0 16px 0;
    font-size: 14px;
    font-weight: 600;
    color: var(--semi-color-text-0);
}
</style>
