<template>
    <div
        :role="role"
        :aria-label="props['aria-label']"
        aria-current="step"
        tabindex="0"
        :class="classString"
        :style="style"
        @click="handleClick"
        @keydown="handleKeyDown"
    >
        <div :class="`${prefixCls}-container`">
            <div :class="`${prefixCls}-content`">
                <div :class="`${prefixCls}-title`">
                    <slot name="title">{{ title }}</slot>
                </div>
            </div>
            <div v-if="index !== total - 1" :class="`${prefixCls}-icon`">
                <IconChevronRight size="small" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import classnames from 'classnames';
import { stepsClasses as css } from '@douyinfe/semi-foundation/steps/constants';
import { IconChevronRight } from '../icons';
import type { NavStepProps } from './interface';

const props = withDefaults(defineProps<NavStepProps>(), {
    prefixCls: css.ITEM,
    active: false,
    className: '',
});

const emit = defineEmits<{
    click: [e: MouseEvent];
}>();

const classString = computed(() => {
    return classnames(
        props.prefixCls,
        {
            [`${props.prefixCls}-active`]: props.active,
        },
        props.className
    );
});

const handleClick = (e: MouseEvent) => {
    emit('click', e);
    if (props.onClick) {
        props.onClick(e);
    }
    if (props.onChange) {
        props.onChange();
    }
};

const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
        if (props.onKeyDown) {
            props.onKeyDown(e);
        }
        if (props.onChange) {
            props.onChange();
        }
    }
};
</script>
