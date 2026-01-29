<template>
    <button
        :id="id"
        :class="buttonClasses"
        :type="htmlType"
        :disabled="disabled"
        :aria-disabled="disabled"
        :style="buttonStyle"
        v-bind="$attrs"
        @click="handleClick"
        @mousedown="handleMouseDown"
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave"
    >
        <span :class="contentClasses" :x-semi-prop="xSemiProp" @click="handleContentClick">
            <template v-if="iconPosition === 'left' && (icon || (loading && !hasIconButtonClass))">
                <component
                    :is="SpinIcon"
                    v-if="loading && !disabled && !hasIconButtonClass"
                    :class="`${prefixCls}-content-loading-icon`"
                />
                <component :is="icon" v-else-if="icon" v-bind="iconStyle ? { style: iconStyle } : {}" />
            </template>

            <span v-if="hasChildren && !hasIconButtonClass" :class="btnTextCls">
                <slot></slot>
            </span>
            <slot v-else></slot>

            <template v-if="iconPosition === 'right' && (icon || (loading && !hasIconButtonClass))">
                <component
                    :is="SpinIcon"
                    v-if="loading && !disabled && !hasIconButtonClass"
                    :class="`${prefixCls}-content-loading-icon`"
                />
                <component :is="icon" v-else-if="icon" v-bind="iconStyle ? { style: iconStyle } : {}" />
            </template>
        </span>
    </button>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue';
import classNames from 'classnames';
import { cssClasses } from '@douyinfe/semi-foundation/button/constants';
import SpinIcon from '../spin/SpinIcon.vue';
import type { ButtonProps } from './interface';

defineOptions({
    inheritAttrs: false,
});

const props = withDefaults(defineProps<ButtonProps>(), {
    disabled: false,
    size: 'default',
    type: 'primary',
    theme: 'light',
    block: false,
    htmlType: 'button',
    prefixCls: cssClasses.PREFIX,
    iconPosition: 'left',
    loading: false,
    noHorizontalPadding: false,
});

const emit = defineEmits<{
    click: [e: MouseEvent];
    mousedown: [e: MouseEvent];
    mouseenter: [e: MouseEvent];
    mouseleave: [e: MouseEvent];
}>();

const slots = useSlots();
const hasChildren = computed(() => {
    if (!slots.default) {
        return false;
    }
    try {
        const slotContent = slots.default();
        if (Array.isArray(slotContent)) {
            return (
                slotContent.length > 0 &&
                slotContent.some((node: any) => {
                    if (typeof node === 'string') {
                        return node.trim().length > 0;
                    }
                    if (node == null) {
                        return false;
                    }
                    if (typeof node === 'object' && node.type) {
                        if (node.type === Symbol.for('v-cmt')) {
                            return false;
                        }
                    }
                    return true;
                })
            );
        }
        if (slotContent == null) {
            return false;
        }
        if (typeof slotContent === 'string') {
            return (slotContent as string).trim().length > 0;
        }
        return true;
    } catch (e) {
        return false;
    }
});

const buttonStyle = computed(() => {
    const style = { ...props.style };
    const { noHorizontalPadding } = props;

    if (Array.isArray(noHorizontalPadding)) {
        if (noHorizontalPadding.includes('left')) {
            style.paddingLeft = '0';
        }
        if (noHorizontalPadding.includes('right')) {
            style.paddingRight = '0';
        }
    } else if (noHorizontalPadding === true) {
        style.paddingLeft = '0';
        style.paddingRight = '0';
    } else if (typeof noHorizontalPadding === 'string') {
        if (noHorizontalPadding === 'left') {
            style.paddingLeft = '0';
        }
        if (noHorizontalPadding === 'right') {
            style.paddingRight = '0';
        }
    }

    return style;
});

const btnTextCls = computed(() => {
    if (!hasChildren.value) {
        return '';
    }
    const hasIcon = Boolean(props.icon) || props.loading;
    if (!hasIcon) {
        return '';
    }
    return classNames({
        [`${props.prefixCls}-content-left`]: props.iconPosition === 'right',
        [`${props.prefixCls}-content-right`]: props.iconPosition === 'left',
    });
});

const buttonClasses = computed(() => {
    const hasIcon = Boolean(props.icon);
    const isLoading = Boolean(props.loading);

    return classNames(
        props.prefixCls,
        {
            [`${props.prefixCls}-${props.type}`]: !props.disabled && props.type,
            [`${props.prefixCls}-disabled`]: props.disabled,
            [`${props.prefixCls}-size-large`]: props.size === 'large',
            [`${props.prefixCls}-size-small`]: props.size === 'small',
            [`${props.prefixCls}-light`]: props.theme === 'light',
            [`${props.prefixCls}-block`]: props.block,
            [`${props.prefixCls}-circle`]: props.circle,
            [`${props.prefixCls}-borderless`]: props.theme === 'borderless',
            [`${props.prefixCls}-outline`]: props.theme === 'outline',
            [`${props.prefixCls}-${props.type}-disabled`]: props.disabled && props.type,
            [`${props.prefixCls}-with-icon`]: hasIcon || isLoading,
            [`${props.prefixCls}-with-icon-only`]: (hasIcon || isLoading) && !hasChildren.value,
            [`${props.prefixCls}-loading`]: isLoading,
        },
        props.className
    );
});

const contentClasses = computed(() => {
    return classNames(`${props.prefixCls}-content`, props.contentClassName);
});

const hasIconButtonClass = computed(() => {
    const hasIcon = Boolean(props.icon);
    if (hasIcon) {
        return false;
    }
    const classNameStr = String(props.className || '');
    const buttonClassesStr = String(buttonClasses.value || '');
    return classNameStr.includes('-with-icon') || buttonClassesStr.includes('-with-icon');
});

const xSemiProp = computed(() => {
    if (props.className && props.className.includes('-with-icon')) {
        return undefined;
    }
    return 'children';
});

const handleClick = (e: MouseEvent) => {
    if (!props.disabled) {
        emit('click', e);
    }
};

const handleMouseDown = (e: MouseEvent) => {
    emit('mousedown', e);
};

const handleMouseEnter = (e: MouseEvent) => {
    emit('mouseenter', e);
};

const handleMouseLeave = (e: MouseEvent) => {
    emit('mouseleave', e);
};

const handleContentClick = (e: MouseEvent) => {
    if (props.disabled) {
        e.stopPropagation();
    }
};
</script>
