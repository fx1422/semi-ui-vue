<template>
    <ul :class="classString" :style="style" :aria-label="ariaLabel">
        <component :is="item" v-for="(item, idx) in items" :key="`timeline-item-${idx}`" />
    </ul>
</template>

<script setup lang="ts">
import { computed, useSlots, cloneVNode, Fragment, Comment, Text, h } from 'vue';
import classNames from 'classnames';
import { cssClasses } from '@douyinfe/semi-foundation/timeline/constants';
import type { TimelineProps } from './interface';
import TimelineItem from './TimelineItem.vue';

const prefixCls = cssClasses.PREFIX;

const props = withDefaults(defineProps<TimelineProps>(), {
    mode: 'left',
});

const slots = useSlots();

const ariaLabel = computed(() => props.ariaLabel);

const classString = computed(() => {
    return classNames(prefixCls, props.className, { [`${prefixCls}-${props.mode}`]: props.mode });
});

// Get position class for an item
const getPosCls = (ele: any, idx: number) => {
    const { mode } = props;

    if (mode === 'alternate') {
        if (ele.props && ele.props.position) {
            return `${prefixCls}-item-${ele.props.position}`;
        }
        return idx % 2 === 0 ? `${prefixCls}-item-left` : `${prefixCls}-item-right`;
    }

    if (mode === 'center') {
        if (ele.props && ele.props.position) {
            return `${prefixCls}-item-${ele.props.position}`;
        }
        return `${prefixCls}-item-left`;
    }

    if (mode === 'left' || mode === 'right') {
        return `${prefixCls}-item-${mode}`;
    }

    if (ele.props && ele.props.position) {
        return `${prefixCls}-item-${ele.props.position}`;
    }

    return '';
};

// Add className to items based on position
const addClassName = (itemsList: any[]) => {
    return itemsList.map((ele, idx) => {
        if (ele && ele.type && ele.props) {
            const positionCls = getPosCls(ele, idx);
            const newProps = {
                ...ele.props,
                className: classNames(ele.props.className, positionCls),
            };
            return cloneVNode(ele, newProps);
        }
        return ele;
    });
};

// Flatten children, removing fragments, comments, and text nodes
const flattenChildren = (children: any[]): any[] => {
    const result: any[] = [];

    for (const child of children) {
        if (!child) continue;

        if (typeof child === 'string' || typeof child === 'number') {
            continue; // Skip text nodes
        }

        if (child.type === Fragment) {
            // Recursively flatten fragments
            if (child.children && Array.isArray(child.children)) {
                result.push(...flattenChildren(child.children));
            }
        } else if (child.type === Comment || child.type === Text) {
            // Skip comments and text nodes
            continue;
        } else {
            result.push(child);
        }
    }

    return result;
};

const items = computed(() => {
    // If dataSource is provided, use it
    if (props.dataSource && props.dataSource.length) {
        const dataItems = props.dataSource.map((item, index) => {
            const { content, ...rest } = item;
            return h(TimelineItem, { key: `timeline-item-${index}`, ...rest }, () => content);
        });
        return addClassName(dataItems);
    }

    // Otherwise, use children from slots
    const children = slots.default?.() || [];
    const flatChildren = flattenChildren(children);
    return addClassName(flatChildren);
});
</script>
