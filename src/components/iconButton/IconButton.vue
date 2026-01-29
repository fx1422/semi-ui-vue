<template>
    <Button
        v-bind="{ ...mergedButtonProps, ...eventListeners }"
        :class="iconBtnCls"
        :className="iconBtnCls"
        :style="finalStyle"
    >
        <template v-if="iconPosition === 'left'">
            <component :is="SpinIcon" v-if="loading && !props.disabled" :class="`${prefixCls}-content-loading-icon`" />
            <component :is="icon" v-else-if="icon" v-bind="iconProps" />
            <span v-if="hasChildren" :class="btnTextCls" :x-semi-prop="xSemiProp">
                <slot></slot>
            </span>
        </template>
        <template v-else>
            <span v-if="hasChildren" :class="btnTextCls" :x-semi-prop="xSemiProp">
                <slot></slot>
            </span>
            <component :is="SpinIcon" v-if="loading && !props.disabled" :class="`${prefixCls}-content-loading-icon`" />
            <component :is="icon" v-else-if="icon" v-bind="iconProps" />
        </template>
    </Button>
</template>

<script setup lang="ts">
import { computed, useSlots, Text, useAttrs, isVNode, type VNode } from 'vue';
import classNames from 'classnames';
import { cssClasses, strings } from '@douyinfe/semi-foundation/button/constants';
import Button from '../button/Button.vue';
import SpinIcon from '../spin/SpinIcon.vue';
import type { IconButtonProps } from './interface';

defineOptions({
    name: 'IconButton',
});

const props = withDefaults(defineProps<IconButtonProps>(), {
    iconPosition: strings.DEFAULT_ICON_POSITION || 'left',
    prefixCls: cssClasses.PREFIX,
    loading: false,
    noHorizontalPadding: false,
});

const slots = useSlots();
const attrs = useAttrs();

const xSemiProp = computed(() => {
    return (props as any)['x-semi-children-alias'] || 'children';
});

const hasChildren = computed(() => {
    if (!slots.default) {
        return false;
    }
    try {
        const slotContent = slots.default();
        if (slotContent == null) {
            return false;
        }
        if (Array.isArray(slotContent)) {
            const validNodes = slotContent.filter((node: any) => {
                if (typeof node === 'string') {
                    return node.trim().length > 0;
                }
                if (isVNode(node)) {
                    return node.type !== Text || (node.children as string)?.trim().length > 0;
                }
                return node != null;
            });
            return validNodes.length > 0;
        }
        if (typeof slotContent === 'string') {
            return (slotContent as string).trim().length > 0;
        }
        if (isVNode(slotContent)) {
            return (
                (slotContent as VNode).type !== Text || ((slotContent as VNode).children as string)?.trim().length > 0
            );
        }
        return slotContent != null;
    } catch (e) {
        return true;
    }
});

const btnTextCls = computed(() => {
    const { prefixCls, iconPosition } = props;
    return classNames({
        [`${prefixCls}-content-left`]: iconPosition === 'right',
        [`${prefixCls}-content-right`]: iconPosition === 'left',
    });
});

const iconBtnCls = computed(() => {
    const { prefixCls, className, loading } = props;
    return classNames(className, `${prefixCls}-with-icon`, {
        [`${prefixCls}-with-icon-only`]: !hasChildren.value,
        [`${prefixCls}-loading`]: loading,
    });
});

const iconProps = computed(() => {
    const { iconSize, iconStyle } = props;
    const iconAttrs: any = {};
    if (iconSize) {
        iconAttrs.size = iconSize;
    }
    if (iconStyle) {
        iconAttrs.style = iconStyle;
    }
    return iconAttrs;
});

const finalStyle = computed(() => {
    const { style, noHorizontalPadding } = props;
    const computedStyle: any = { ...style };

    if (Array.isArray(noHorizontalPadding)) {
        if (noHorizontalPadding.includes('left')) {
            computedStyle.paddingLeft = 0;
        }
        if (noHorizontalPadding.includes('right')) {
            computedStyle.paddingRight = 0;
        }
    } else if (noHorizontalPadding === true) {
        computedStyle.paddingLeft = 0;
        computedStyle.paddingRight = 0;
    } else if (typeof noHorizontalPadding === 'string') {
        if (noHorizontalPadding === 'left') {
            computedStyle.paddingLeft = 0;
        }
        if (noHorizontalPadding === 'right') {
            computedStyle.paddingRight = 0;
        }
    }

    return computedStyle;
});

const buttonProps = computed(() => {
    const { ...rest } = props;

    return {
        ...rest,
        icon: undefined,
        iconPosition: undefined,
    };
});

const mergedButtonProps = computed(() => {
    const eventKeys = Object.keys(attrs).filter((key) => key.startsWith('on'));
    const restAttrs: any = {};
    Object.keys(attrs).forEach((key) => {
        if (!eventKeys.includes(key)) {
            restAttrs[key] = (attrs as any)[key];
        }
    });
    return {
        ...buttonProps.value,
        ...restAttrs,
    };
});

const eventListeners = computed(() => {
    const listeners: any = {};
    Object.keys(attrs).forEach((key) => {
        if (key.startsWith('on') && typeof (attrs as any)[key] === 'function') {
            listeners[key] = (attrs as any)[key];
        }
    });
    return listeners;
});
</script>
