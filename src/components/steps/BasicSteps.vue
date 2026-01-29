<template>
    <div :aria-label="props['aria-label']" :class="wrapperCls" :style="style" v-bind="dataAttrs">
        <template v-for="(child, index) in childrenArray" :key="index">
            <component :is="child.type" v-bind="getChildProps(child, index)" />
        </template>
    </div>
</template>

<script setup lang="ts">
import { computed, useSlots, VNode, Comment, Fragment, Text } from 'vue';
import classnames from 'classnames';
import { stepsClasses as css } from '@douyinfe/semi-foundation/steps/constants';
import getDataAttr from '@douyinfe/semi-foundation/utils/getDataAttr';
import type { BasicStepsProps } from './interface';

const props = withDefaults(defineProps<BasicStepsProps>(), {
    prefixCls: css.PREFIX,
    current: 0,
    direction: 'horizontal',
    initial: 0,
    hasLine: true,
    status: 'process',
});

const emit = defineEmits<{
    change: [current: number];
}>();

const slots = useSlots();

// Filter valid children (excluding comments, text nodes, etc.)
const childrenArray = computed(() => {
    const children = slots.default?.() || [];
    const filtered: VNode[] = [];

    const flatten = (vnodes: VNode[]) => {
        vnodes.forEach((vnode) => {
            if (vnode.type === Comment) return;
            if (vnode.type === Text && !vnode.children?.toString().trim()) return;
            if (vnode.type === Fragment && Array.isArray(vnode.children)) {
                flatten(vnode.children as VNode[]);
            } else if (vnode.type !== Text) {
                filtered.push(vnode);
            }
        });
    };

    flatten(children);
    return filtered;
});

const getChildProps = (child: VNode, index: number) => {
    const stepNumber = props.initial + index;
    const originalProps = child.props || {};

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const childProps: Record<string, any> = {
        stepNumber: `${stepNumber + 1}`,
        size: props.size,
        // Only copy specific props we need, not all props
        title: originalProps.title,
        description: originalProps.description,
        icon: originalProps.icon,
        style: originalProps.style,
        className: originalProps.className,
        'aria-label': originalProps['aria-label'],
        onClick: originalProps.onClick,
    };

    if (props.status === 'error' && index === props.current - 1) {
        childProps.className = `${props.prefixCls}-next-error`;
    }

    if (!originalProps.status) {
        if (stepNumber === props.current) {
            childProps.status = props.status;
        } else if (stepNumber < props.current) {
            childProps.status = 'finish';
        } else {
            childProps.status = 'wait';
        }
    } else {
        childProps.status = originalProps.status;
    }

    childProps.active = stepNumber === props.current;
    childProps.done = stepNumber < props.current;

    // 添加点击处理
    childProps.onChange = () => {
        if (index !== props.current) {
            emit('change', index + props.initial);
        }
    };

    return childProps;
};

const wrapperCls = computed(() => {
    return classnames(props.className, {
        [`${props.prefixCls}-basic`]: true,
        [`${props.prefixCls}-${props.direction}`]: true,
        [`${props.prefixCls}-${props.size}`]: props.size !== 'default',
        [`${props.prefixCls}-hasline`]: props.hasLine,
    });
});

const dataAttrs = computed(() => {
    const restProps: Record<string, unknown> = {};
    Object.keys(props).forEach((key) => {
        if (key.startsWith('data-') || key.startsWith('aria-')) {
            restProps[key] = (props as Record<string, unknown>)[key];
        }
    });
    return getDataAttr(restProps);
});
</script>
