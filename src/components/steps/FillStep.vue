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
        <div :class="leftCls">
            <template v-if="props.icon">
                <component :is="props.icon" />
            </template>
            <template v-else-if="props.status === 'error'">
                <IconAlertCircle :size="'extra-large'" />
            </template>
            <template v-else-if="props.status === 'wait' || props.status === 'process'">
                <span :class="`${props.prefixCls}-number-icon`">{{ props.stepNumber }}</span>
            </template>
            <template v-else-if="props.status === 'finish'">
                <IconTickCircle :size="'extra-large'" />
            </template>
            <template v-else-if="props.status === 'warning'">
                <IconAlertTriangle :size="'extra-large'" />
            </template>
        </div>
        <div :class="`${prefixCls}-content`">
            <div :class="`${prefixCls}-title`" :title="typeof title === 'string' ? title : undefined">
                <span :class="`${prefixCls}-title-text`">
                    <slot name="title">{{ title }}</slot>
                </span>
            </div>
            <div :class="`${prefixCls}-description`" :title="typeof description === 'string' ? description : undefined">
                <slot name="description">{{ description }}</slot>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import classnames from 'classnames';
import { stepsClasses as css } from '@douyinfe/semi-foundation/steps/constants';
import { IconTickCircle, IconAlertCircle, IconAlertTriangle } from '../icons';
import type { FillStepProps } from './interface';

const props = withDefaults(defineProps<FillStepProps>(), {
    prefixCls: css.ITEM,
    status: 'wait',
    className: '',
});

const emit = defineEmits<{
    click: [e: MouseEvent];
}>();

const leftCls = computed(() => {
    const progress = props.status === 'process' && !props.icon;
    return classnames({
        [`${props.prefixCls}-left`]: true,
        [`${props.prefixCls}-icon`]: !!props.icon,
        [`${props.prefixCls}-plain`]: !props.icon,
        [`${props.prefixCls}-icon-process`]: progress,
        [`${props.prefixCls}-hover`]: props.onChange || props.onClick,
    });
});

const classString = computed(() => {
    return classnames(
        {
            [props.prefixCls]: true,
            [`${props.prefixCls}-${props.status}`]: Boolean(props.status),
            [`${props.prefixCls}-${props.status}-hover`]: Boolean(props.status) && (props.onChange || props.onClick),
            [`${props.prefixCls}-${props.status}-active`]: Boolean(props.status) && (props.onChange || props.onClick),
            [`${props.prefixCls}-clickable`]: props.onChange || props.onClick,
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
