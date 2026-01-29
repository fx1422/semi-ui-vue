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
import type { NavStepsProps } from './interface';

const props = withDefaults(defineProps<NavStepsProps>(), {
    prefixCls: css.PREFIX,
    current: 0,
    size: 'default',
    initial: 0,
});

const emit = defineEmits<{
    change: [current: number];
}>();

const slots = useSlots();

// Filter valid children
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
    const total = childrenArray.value.length;
    const originalProps = child.props || {};

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const childProps: Record<string, any> = {
        index,
        total,
        // Only copy specific props we need, not all props
        title: originalProps.title,
        description: originalProps.description,
        icon: originalProps.icon,
        style: originalProps.style,
        className: originalProps.className,
        'aria-label': originalProps['aria-label'],
        onClick: originalProps.onClick,
    };

    childProps.active = index === props.current;

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
        [`${props.prefixCls}-nav`]: true,
        [`${props.prefixCls}-${props.size}`]: props.size !== 'default',
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
