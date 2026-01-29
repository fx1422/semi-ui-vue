<template>
    <div
        role="button"
        :aria-label="ariaLabel"
        aria-roledescription="Sort data with this column"
        tabindex="-1"
        :class="`${prefixCls}-column-sorter-wrapper`"
        @mousedown.left.prevent.stop="handleMouseDown"
        @click.prevent.stop="handleClick"
        @keypress="handleKeyPress"
    >
        <slot name="title">
            <span v-if="title" :class="`${prefixCls}-row-head-title`">{{ title }}</span>
        </slot>
        <div v-if="!sortIcon || typeof sortIcon !== 'function'" :class="`${prefixCls}-column-sorter`" :style="style">
            <span :class="upCls">
                <IconCaretup size="default" />
            </span>
            <span :class="downCls">
                <IconCaretdown size="default" />
            </span>
        </div>
        <component :is="() => sortIcon({ sortOrder })" v-else />
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import classnames from 'classnames';
import { cssClasses, strings } from '@douyinfe/semi-foundation/table/constants';
import { IconCaretup, IconCaretdown } from '../icons';
import type { SortIcon, SortOrder } from './interface';
import type { CSSProperties } from 'vue';

defineOptions({
    name: 'SemiColumnSorter',
});

interface Props {
    className?: string;
    style?: CSSProperties;
    onClick?: (e: MouseEvent) => void;
    prefixCls?: string;
    sortOrder?: SortOrder;
    title?: any;
    sortIcon?: SortIcon;
    showTooltip?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    prefixCls: cssClasses.PREFIX,
    onClick: () => {},
    sortOrder: false,
    showTooltip: false,
});

const upCls = computed(() =>
    classnames(`${props.prefixCls}-column-sorter-up`, {
        on: props.sortOrder === strings.SORT_DIRECTIONS[0],
    })
);

const downCls = computed(() =>
    classnames(`${props.prefixCls}-column-sorter-down`, {
        on: props.sortOrder === strings.SORT_DIRECTIONS[1],
    })
);

const ariaLabel = computed(() => {
    return `Current sort order is ${props.sortOrder ? `${props.sortOrder}ing` : 'none'}`;
});

// 排序图标渲染逻辑在模板中处理

const handleMouseDown = (e: MouseEvent) => {
    // 使用 mousedown 触发排序，避免 click 在 DOM 更新后被重复触发导致递归更新
    props.onClick(e);
};

const handleClick = (_e: MouseEvent) => {
    // 仅用于吞掉 click，避免冒泡到 HeaderCell 的 clickToSort 再触发一次排序
};

const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
        props.onClick(e as any);
    }
};
</script>
