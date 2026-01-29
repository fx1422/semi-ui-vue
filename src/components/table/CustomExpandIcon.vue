<template>
    <span
        role="button"
        aria-label="Expand this row"
        tabindex="-1"
        :class="`${prefixCls}-expand-icon`"
        @click="handleClick"
        @mouseenter="onMouseEnter"
        @mouseleave="onMouseLeave"
        @keypress="handleKeyPress"
    >
        <IconChevronRight v-if="componentType === 'expand' && (motion || !expanded)" :class="motionIconCls" />
        <IconChevronDown v-else-if="componentType === 'expand' && !motion && expanded" :class="motionIconCls" />
        <IconTreeTriangleRight
            v-else-if="componentType === 'tree' && (motion || !expanded)"
            size="small"
            :class="motionIconCls"
        />
        <IconTreeTriangleDown
            v-else-if="componentType === 'tree' && !motion && expanded"
            size="small"
            :class="motionIconCls"
        />
        <component :is="expandIconComponent" v-else-if="expandIcon" />
    </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { IconChevronRight, IconChevronDown, IconTreeTriangleDown, IconTreeTriangleRight } from '../icons';
import { cssClasses } from '@douyinfe/semi-foundation/table/constants';
import isEnterPress from '@douyinfe/semi-foundation/utils/isEnterPress';
import type { ExpandIcon } from './interface';

defineOptions({
    name: 'SemiCustomExpandIcon',
});

interface Props {
    expanded?: boolean;
    componentType?: 'tree' | 'expand';
    onClick?: (nextExpand: boolean, e: MouseEvent) => void;
    onMouseEnter?: (e: MouseEvent) => void;
    onMouseLeave?: (e: MouseEvent) => void;
    expandIcon?: ExpandIcon;
    prefixCls?: string;
    motion?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    componentType: 'expand',
    prefixCls: cssClasses.PREFIX,
    motion: true,
    onClick: () => {},
    onMouseEnter: () => {},
    onMouseLeave: () => {},
});

const expandIconComponent = computed(() => {
    if (typeof props.expandIcon === 'function') {
        return () => props.expandIcon(props.expanded);
    }
    return () => props.expandIcon;
});

const motionIconCls = computed(() => {
    if (!props.motion) {
        return '';
    }
    return `${props.prefixCls}-expandedIcon-${props.expanded ? 'show' : 'hide'}`;
});

const handleClick = (e: MouseEvent) => {
    if (typeof props.onClick === 'function') {
        props.onClick(!props.expanded, e);
    }
};

const handleKeyPress = (e: KeyboardEvent) => {
    if (isEnterPress(e)) {
        handleClick(e as any);
    }
};
</script>
