<template>
    <div :class="wrapperCls" :style="wrapperStyle" v-bind="dataAttr">
        <div
            v-if="mask"
            aria-hidden="true"
            :class="[`${prefixCls}-mask`, maskClassName || '']"
            :style="maskStyle"
            @click="handleMaskClick"
            @animationstart="maskExtraProps?.onAnimationstart"
            @animationend="maskExtraProps?.onAnimationend"
        />
        <div
            role="dialog"
            tabindex="-1"
            :class="[
                `${prefixCls}-inner`,
                `${prefixCls}-inner-wrap`,
                dialogClassName || '',
                `${prefixCls}-size-${size}`,
            ]"
            :style="dialogStyle"
            @animationstart="wrapperExtraProps?.onAnimationstart"
            @animationend="wrapperExtraProps?.onAnimationend"
        >
            <div :class="`${prefixCls}-content`">
                <div :class="`${prefixCls}-header`" role="heading" aria-level="1" :style="headerStyle">
                    <div v-if="title" :class="`${prefixCls}-title`" x-semi-prop="title">
                        <component :is="title" v-if="isVNode(title)" />
                        <template v-else>{{ title }}</template>
                    </div>
                    <IconButton
                        v-if="closable"
                        key="close-btn"
                        :class="`${prefixCls}-close`"
                        type="tertiary"
                        :icon="closeIcon || h(IconClose)"
                        theme="borderless"
                        size="small"
                        @click="close"
                    />
                </div>
                <div :class="`${prefixCls}-body`" :style="bodyStyle" x-semi-prop="children">
                    <slot></slot>
                </div>
                <div v-if="footer" :class="`${prefixCls}-footer`" x-semi-prop="footer">
                    <component :is="footer" v-if="isVNode(footer)" />
                    <template v-else>{{ footer }}</template>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, h, useAttrs, isVNode, type CSSProperties } from 'vue';
import classNames from 'classnames';
import { cssClasses } from '@douyinfe/semi-foundation/sideSheet/constants';
import IconButton from '../iconButton/IconButton.vue';
import { IconClose } from '../icons';
import type { SideSheetContentProps } from './interface';
import getDataAttr from '@douyinfe/semi-foundation/utils/getDataAttr';

defineOptions({
    name: 'SideSheetContent',
    inheritAttrs: false,
});

const props = defineProps<SideSheetContentProps>();

const attrs = useAttrs();
const prefixCls = cssClasses.PREFIX;

const handleMaskClick = (e: MouseEvent) => {
    if (props.maskClosable && e.target === e.currentTarget) {
        close(e);
    }
};

const close = (e: MouseEvent) => {
    e?.stopPropagation?.();
    e?.preventDefault?.();
    if (props.onClose && typeof props.onClose === 'function') {
        props.onClose(e);
    }
};

const wrapperCls = computed(() => {
    return classNames(props.className, {
        [`${prefixCls}-fixed`]: !props.mask,
        [`${prefixCls}-size-${props.size}`]: !props.mask,
    });
});

const wrapperStyle = computed<CSSProperties>(() => {
    const style: CSSProperties = {};
    if (!props.mask && props.width) {
        style.width = props.width;
    }
    return style;
});

const dialogStyle = computed<CSSProperties>(() => {
    const style: CSSProperties = { ...props.style };
    if (props.width) {
        style.width = props.width;
        // When the mask is false, the width is set on the wrapper. At this time, sidesheet-inner does not need to set the width again
        if (!props.mask) {
            style.width = '100%';
        }
    }
    if (props.height) {
        style.height = props.height;
    }
    return style;
});

const dataAttr = computed(() => {
    return getDataAttr(attrs);
});
</script>
