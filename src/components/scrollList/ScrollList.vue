<template>
    <div :class="clsWrapper" :style="style" v-bind="getDataAttr()">
        <div v-if="header" :class="clsHeader">
            <div :class="`${clsHeader}-title`" :x-semi-prop="props['x-semi-header-alias'] || 'header'">
                <component :is="normalizedHeader" v-if="normalizedHeader" />
                <template v-else>{{ header }}</template>
            </div>
            <div :class="`${clsWrapper}-line`" />
        </div>
        <div
            :class="`${clsWrapper}-body`"
            :style="{
                height: props.bodyHeight ? props.bodyHeight : '',
                flex: props.bodyHeight ? 'none' : '',
            }"
            x-semi-prop="children"
        >
            <slot />
        </div>
        <div v-if="footer" :class="`${clsWrapper}-footer`" :x-semi-prop="props['x-semi-footer-alias'] || 'footer'">
            <component :is="normalizedFooter" v-if="normalizedFooter" />
            <template v-else>{{ footer }}</template>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, isVNode, h, Fragment, type CSSProperties, type VNode } from 'vue';
import classnames from 'classnames';
import { cssClasses } from '@douyinfe/semi-foundation/scrollList/constants';
import Foundation from '@douyinfe/semi-foundation/scrollList/foundation';
import { useBaseComponent } from '../_utils/useBaseComponent';

interface ScrollListProps {
    header?: any;
    footer?: any;
    bodyHeight?: number | string;
    prefixCls?: string;
    className?: string;
    style?: CSSProperties;
    'x-semi-header-alias'?: string;
    'x-semi-footer-alias'?: string;
}

const props = withDefaults(defineProps<ScrollListProps>(), {});

// 检查值是否是 VNode 或 VNode 数组
const isVNodeOrArray = (value: any): boolean => {
    if (!value) return false;
    if (isVNode(value)) return true;
    if (Array.isArray(value)) {
        return value.length > 0 && value.every((item) => isVNode(item));
    }
    return false;
};

// 规范化 VNode 或 VNode 数组为单个 VNode（使用 Fragment 包装数组）
const normalizeVNode = (value: any): VNode | null => {
    if (!value) return null;
    if (isVNode(value)) return value;
    if (Array.isArray(value) && value.length > 0 && value.every((item) => isVNode(item))) {
        return h(Fragment, null, value);
    }
    return null;
};

const normalizedHeader = computed(() => normalizeVNode(props.header));
const normalizedFooter = computed(() => normalizeVNode(props.footer));

const filteredProps = computed(() => {
    const filtered: Record<string, any> = {};
    for (const key in props) {
        const value = props[key];
        if (key === 'header' || key === 'footer') {
            if (isVNodeOrArray(value)) {
                continue;
            }
        }
        filtered[key] = value;
    }
    return filtered;
});

const { adapter, getDataAttr } = useBaseComponent(filteredProps, {});
const foundation = new Foundation(adapter);

const clsWrapper = computed(() =>
    classnames(props.className, {
        [props.prefixCls || cssClasses.PREFIX]: true,
    })
);

const clsHeader = computed(() =>
    classnames({
        [`${props.prefixCls || cssClasses.PREFIX}-header`]: true,
    })
);
</script>
