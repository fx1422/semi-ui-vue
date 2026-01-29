<template>
    <!-- Grid layout: wrap with Col -->
    <Col v-if="isGrid" v-bind="colProps">
        <li
            :class="itemCls"
            :style="style"
            @click="handleClick"
            @contextmenu="handleContextMenu"
            @mouseenter="props.onMouseEnter"
            @mouseleave="props.onMouseLeave"
        >
            <!-- Body (header + main) -->
            <div v-if="body" :class="bodyCls">
                <div v-if="slots.header || props.header" :class="`${prefixCls}-item-body-header`">
                    <slot name="header">
                        <component :is="props.header" v-if="isVNode(props.header)" />
                        <template v-else>{{ props.header }}</template>
                    </slot>
                </div>
                <div v-if="slots.main || props.main" :class="`${prefixCls}-item-body-main`">
                    <slot name="main">
                        <component :is="props.main" v-if="isVNode(props.main)" />
                        <template v-else>{{ props.main }}</template>
                    </slot>
                </div>
            </div>

            <!-- Children -->
            <slot></slot>

            <!-- Extra -->
            <div v-if="slots.extra || props.extra" :class="`${prefixCls}-item-extra`">
                <slot name="extra">
                    <component :is="props.extra" v-if="isVNode(props.extra)" />
                    <template v-else>{{ props.extra }}</template>
                </slot>
            </div>
        </li>
    </Col>

    <!-- Normal layout: just li -->
    <li
        v-else
        :class="itemCls"
        :style="style"
        @click="handleClick"
        @contextmenu="handleContextMenu"
        @mouseenter="props.onMouseEnter"
        @mouseleave="props.onMouseLeave"
    >
        <!-- Body (header + main) -->
        <div v-if="body" :class="bodyCls">
            <div v-if="slots.header || props.header" :class="`${prefixCls}-item-body-header`">
                <slot name="header">
                    <component :is="props.header" v-if="isVNode(props.header)" />
                    <template v-else>{{ props.header }}</template>
                </slot>
            </div>
            <div v-if="slots.main || props.main" :class="`${prefixCls}-item-body-main`">
                <slot name="main">
                    <component :is="props.main" v-if="isVNode(props.main)" />
                    <template v-else>{{ props.main }}</template>
                </slot>
            </div>
        </div>

        <!-- Children -->
        <slot></slot>

        <!-- Extra -->
        <div v-if="slots.extra || props.extra" :class="`${prefixCls}-item-extra`">
            <slot name="extra">
                <component :is="props.extra" v-if="isVNode(props.extra)" />
                <template v-else>{{ props.extra }}</template>
            </slot>
        </div>
    </li>
</template>

<script setup lang="ts">
import { computed, inject, isVNode, useSlots } from 'vue';
import classNames from 'classnames';
import { cssClasses } from '@douyinfe/semi-foundation/list/constants';
import type { ListItemProps } from './interface';
import { ListContextKey, type ListContextValue } from './context';
import Col from '../grid/Col.vue';

defineOptions({
    name: 'ListItem',
});

const props = withDefaults(defineProps<ListItemProps>(), {
    align: 'flex-start',
});

const slots = useSlots();
const prefixCls = cssClasses.PREFIX;

// Inject context (it's a Ref)
const contextRef = inject(ListContextKey, undefined);
const context = computed(() => {
    if (!contextRef || !contextRef.value) {
        return {
            grid: undefined,
            onClick: undefined,
            onRightClick: undefined,
        };
    }
    return contextRef.value;
});

// Check if has body content (from slots or props)
const body = computed(() => {
    return !!(slots.header || slots.main || props.header || props.main);
});

// Check if grid mode
const isGrid = computed(() => {
    return !!context.value?.grid;
});

// Item class names
const itemCls = computed(() => {
    return classNames(`${prefixCls}-item`, props.className);
});

// Body class names
const bodyCls = computed(() => {
    return classNames(`${prefixCls}-item-body`, {
        [`${prefixCls}-item-body-${props.align}`]: props.align,
    });
});

// Event handlers
const handleClick = (e: MouseEvent) => {
    const handler = props.onClick || context.value?.onClick;
    if (handler) {
        handler(e);
    }
};

const handleContextMenu = (e: MouseEvent) => {
    const handler = props.onRightClick || context.value?.onRightClick;
    if (handler) {
        handler(e);
    }
};

// Col props for grid layout
const colProps = computed(() => {
    if (!context.value?.grid) return {};

    const { gutter, justify, type, align, ...rest } = context.value.grid;
    return rest;
});
</script>
