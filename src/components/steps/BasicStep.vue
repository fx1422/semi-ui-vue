<template>
    <div
        :role="role"
        :aria-label="props['aria-label']"
        tabindex="0"
        aria-current="step"
        :class="classString"
        :style="style"
        @click="handleClick"
        @keydown="handleKeyDown"
    >
        <div :class="`${prefixCls}-container`">
            <div :class="`${prefixCls}-left`">
                <span :class="iconCls">
                    <template v-if="props.icon">
                        <component :is="props.icon" />
                    </template>
                    <template v-else-if="props.status === 'error'">
                        <IconAlertCircle :size="stepSizeMapIconSize[props.size || 'default']" />
                    </template>
                    <template v-else-if="props.status === 'wait' || props.status === 'process'">
                        <span :class="`${props.prefixCls}-number-icon`">{{ props.stepNumber }}</span>
                    </template>
                    <template v-else-if="props.status === 'finish'">
                        <IconTickCircle :size="stepSizeMapIconSize[props.size || 'default']" />
                    </template>
                    <template v-else-if="props.status === 'warning'">
                        <IconAlertTriangle :size="stepSizeMapIconSize[props.size || 'default']" />
                    </template>
                </span>
            </div>
            <div :class="`${prefixCls}-content`">
                <div :class="`${prefixCls}-title`">
                    <div :class="`${prefixCls}-title-text`">
                        <slot name="title">{{ title }}</slot>
                    </div>
                </div>
                <div v-if="$slots.description || description" :class="`${prefixCls}-description`">
                    <slot name="description">{{ description }}</slot>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue';
import classnames from 'classnames';
import { stepsClasses as css } from '@douyinfe/semi-foundation/steps/constants';
import { IconTickCircle, IconAlertCircle, IconAlertTriangle } from '../icons';
import type { BasicStepProps } from './interface';

const stepSizeMapIconSize = {
    small: 'large',
    default: 'extra-large',
} as const;

const props = withDefaults(defineProps<BasicStepProps>(), {
    prefixCls: css.ITEM,
    active: false,
    done: false,
    status: 'wait',
    className: '',
});

const emit = defineEmits<{
    click: [e: MouseEvent];
}>();

const slots = useSlots();

const iconCls = computed(() => {
    return classnames({
        [`${props.prefixCls}-icon`]: true,
        [`${props.prefixCls}-custom-icon`]: !!props.icon,
        [`${props.prefixCls}-icon-process`]: props.status === 'process' && !props.icon,
    });
});

const classString = computed(() => {
    return classnames(
        props.prefixCls,
        `${props.prefixCls}-${props.status}`,
        {
            [`${props.prefixCls}-active`]: props.active,
            [`${props.prefixCls}-done`]: props.done,
            [`${props.prefixCls}-hover`]: props.onChange || props.onClick,
            [`${props.prefixCls}-clickable`]: props.onChange || props.onClick,
            [`${props.prefixCls}-${props.status}-hover`]: props.onChange || props.onClick,
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
