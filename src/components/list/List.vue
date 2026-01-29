<template>
    <div :class="wrapperCls" :style="style">
        <!-- Header -->
        <div v-if="header" :class="`${prefixCls}-header`" x-semi-prop="header">
            <component :is="header" v-if="isVNode(header)" />
            <template v-else>{{ header }}</template>
        </div>

        <!-- Spin wrapper -->
        <Spin :spinning="loading" size="large">
            <!-- Grid layout -->
            <Row v-if="props.grid" v-bind="rowProps">
                <component :is="item" v-for="(item, index) in childrenList" :key="item.key || `list-item-${index}`" />
                <slot></slot>
            </Row>
            <!-- Normal layout -->
            <ul v-else :class="`${prefixCls}-items`">
                <component :is="item" v-for="(item, index) in childrenList" :key="item.key || `list-item-${index}`" />
                <slot></slot>
            </ul>
        </Spin>

        <!-- Footer -->
        <div v-if="footer" :class="`${prefixCls}-footer`" x-semi-prop="footer">
            <component :is="footer" v-if="isVNode(footer)" />
            <template v-else>{{ footer }}</template>
        </div>

        <!-- Load More -->
        <component :is="loadMore" v-if="loadMore && isVNode(loadMore)" />
        <template v-else-if="loadMore">{{ loadMore }}</template>
    </div>
</template>

<script setup lang="ts">
import { computed, h, isVNode, cloneVNode, provide, useSlots } from 'vue';
import classNames from 'classnames';
import { cssClasses } from '@douyinfe/semi-foundation/list/constants';
import type { ListProps } from './interface';
import { ListContextKey, type ListContextValue } from './context';
import Spin from '../spin';
import Row from '../grid/Row.vue';
import LocaleConsumer from '../locale/LocaleConsumer.vue';

defineOptions({
    name: 'List',
});

const props = withDefaults(defineProps<ListProps>(), {
    bordered: false,
    split: true,
    loading: false,
    layout: 'vertical',
    size: 'default',
});

const emit = defineEmits<{
    click: [e: MouseEvent];
    rightClick: [e: MouseEvent];
}>();

const slots = useSlots();

const prefixCls = cssClasses.PREFIX;

// Render empty content
const renderEmpty = () => {
    if (props.emptyContent) {
        return h(
            'div',
            { class: `${prefixCls}-empty`, 'x-semi-prop': 'emptyContent' },
            isVNode(props.emptyContent) ? props.emptyContent : props.emptyContent
        );
    } else {
        return h(
            LocaleConsumer,
            { componentName: 'List' },
            {
                default: (locale: any) => h('div', { class: `${prefixCls}-empty` }, locale.emptyText),
            }
        );
    }
};

// Wrapper class names
const wrapperCls = computed(() => {
    return classNames(prefixCls, props.className, {
        [`${prefixCls}-flex`]: props.layout === 'horizontal',
        [`${prefixCls}-${props.size}`]: props.size,
        [`${prefixCls}-grid`]: props.grid,
        [`${prefixCls}-split`]: props.split,
        [`${prefixCls}-bordered`]: props.bordered,
    });
});

// Children list from dataSource
const childrenList = computed(() => {
    if (props.dataSource && props.dataSource.length) {
        const items = props.renderItem ? props.dataSource.map((item, index) => props.renderItem!(item, index)) : [];

        return items.map((child: any, index: number) => {
            const itemKey = child.key || `list-item-${index}`;
            // Clone VNode with key
            if (isVNode(child)) {
                return cloneVNode(child, { key: itemKey });
            }
            return child;
        });
    } else if (!slots.default) {
        // No dataSource and no slot children, show empty
        return [renderEmpty()];
    }
    return [];
});

// Row props for grid layout
const rowProps = computed(() => {
    if (!props.grid) return {};

    const result: any = { type: 'flex' };
    ['align', 'gutter', 'justify', 'type'].forEach((key) => {
        if (props.grid && key in props.grid) {
            result[key] = (props.grid as any)[key];
        }
    });
    return result;
});

// Context value
const contextValue = computed<ListContextValue>(() => ({
    grid: props.grid,
    onClick: (e: MouseEvent) => emit('click', e),
    onRightClick: (e: MouseEvent) => emit('rightClick', e),
}));

// Provide context
provide(ListContextKey, contextValue);
</script>
