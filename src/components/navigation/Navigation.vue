<template>
    <div :class="finalCls" :style="finalStyle">
        <div :class="`${prefixCls}-inner`">
            <div :class="headerListOuterCls">
                <!-- 优先使用插槽，如果没有插槽则使用 props -->
                <template v-if="hasHeaderSlot">
                    <Header>
                        <template #default>
                            <slot name="header" />
                        </template>
                    </Header>
                </template>
                <template v-else-if="processedHeaders.length">
                    <component :is="header" v-for="(header, idx) in processedHeaders" :key="`header-${idx}`" />
                </template>
                <div :style="bodyStyle as any" :class="`${prefixCls}-list-wrapper`">
                    <ul role="menu" :aria-orientation="mode" :class="`${prefixCls}-list`">
                        <template v-if="items && items.length && itemElems.length">
                            <component :is="item" v-for="(item, idx) in itemElems" :key="`item-${idx}`" />
                        </template>
                        <slot></slot>
                    </ul>
                </div>
            </div>
            <!-- 优先使用插槽，如果没有插槽则使用 props -->
            <template v-if="hasFooterSlot">
                <Footer>
                    <template #default>
                        <slot name="footer" />
                    </template>
                </Footer>
            </template>
            <template v-else-if="processedFooters.length">
                <component :is="footer" v-for="(footer, idx) in processedFooters" :key="`footer-${idx}`" />
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, reactive, provide, watch, h, isVNode, VNode, onMounted, nextTick, ref, useSlots } from 'vue';
import classNames from 'classnames';
import { cssClasses, numbers } from '@douyinfe/semi-foundation/navigation/constants';
import NavigationFoundation, { NavigationAdapter } from '@douyinfe/semi-foundation/navigation/foundation';
import { useFoundation } from '../_utils';
import type { NavProps, NavState, ItemKey, OnSelectedData } from './interface';
import { NavContextKey } from './context';
import SubNav from './SubNav.vue';
import Item from './Item.vue';
import Header from './Header.vue';
import Footer from './Footer.vue';
import { isEqual } from 'lodash-es';

defineOptions({
    name: 'Navigation',
});

const props = withDefaults(defineProps<NavProps>(), {
    subNavCloseDelay: numbers.DEFAULT_SUBNAV_CLOSE_DELAY,
    subNavOpenDelay: numbers.DEFAULT_SUBNAV_OPEN_DELAY,
    tooltipHideDelay: numbers.DEFAULT_TOOLTIP_HIDE_DELAY,
    tooltipShowDelay: numbers.DEFAULT_TOOLTIP_SHOW_DELAY,
    toggleIconPosition: 'right',
    limitIndent: true,
    prefixCls: cssClasses.PREFIX,
    subNavMotion: true,
    mode: 'vertical',
});

const emit = defineEmits<{
    'update:isCollapsed': [value: boolean];
    'update:selectedKeys': [value: ItemKey[]];
    'update:openKeys': [value: ItemKey[]];
    click: [data: { itemKey?: ItemKey; domEvent?: MouseEvent; isOpen?: boolean }];
    collapseChange: [isCollapse: boolean];
    deselect: [data?: any];
    openChange: [data: { itemKey?: ItemKey; openKeys?: ItemKey[]; domEvent?: MouseEvent; isOpen?: boolean }];
    select: [data: OnSelectedData];
}>();

// State management
const state = reactive<NavState>({
    isCollapsed: props.isCollapsed ?? props.defaultIsCollapsed ?? false,
    openKeys: props.openKeys ?? props.defaultOpenKeys ?? [],
    items: [],
    itemKeysMap: {},
    selectedKeys: props.selectedKeys ?? props.defaultSelectedKeys ?? [],
});

const createAddKeysFn = (keyName: keyof NavState) => {
    return (...keys: ItemKey[]) => {
        const handleKeys = new Set((state[keyName] as ItemKey[]).map((k) => String(k)));
        keys.forEach((key) => {
            if (key !== undefined && key !== null) {
                handleKeys.add(String(key));
            }
        });
        (state[keyName] as ItemKey[]) = Array.from(handleKeys);
    };
};

const createRemoveKeysFn = (keyName: keyof NavState) => {
    return (...keys: ItemKey[]) => {
        const handleKeys = new Set((state[keyName] as ItemKey[]).map((k) => String(k)));
        keys.forEach((key) => {
            if (key !== undefined && key !== null) {
                handleKeys.delete(String(key));
            }
        });
        (state[keyName] as ItemKey[]) = Array.from(handleKeys);
    };
};

// Cache for itemElems
const cache = new Map<string, any>();

const adapter: NavigationAdapter<NavProps, NavState> = {
    // Base adapter methods
    getContext: () => ({}),
    getContexts: () => ({}),
    getProp: (key: string) => (props as any)[key],
    getProps: () => props,
    getState: (key: string) => (state as any)[key],
    getStates: () => state,
    setState: (states: Partial<NavState>) => {
        Object.assign(state, states);
    },

    getCache: (key: string) => cache.get(key),
    setCache: (key: string, value: any) => {
        cache.set(key, value);
    },
    getCaches: () => cache,
    stopPropagation: (e: any) => {
        e.stopPropagation();
    },
    persistEvent: (e: any) => {},
    // Navigation specific methods
    notifySelect: (...args) => emit('select', ...args),
    notifyOpenChange: (...args) => emit('openChange', ...args),
    setIsCollapsed: (isCollapsed: boolean) => {
        // 更新内部 state（无论是否受控）
        state.isCollapsed = isCollapsed;
        // 发出 v-model 更新事件（Vue 需要这个来同步外部状态）
        emit('update:isCollapsed', isCollapsed);
    },
    notifyCollapseChange: (...args) => emit('collapseChange', ...args),
    updateItems: (items: any[]) => {
        state.items = [...items];
    },
    setItemKeysMap: (itemKeysMap: any) => {
        state.itemKeysMap = { ...itemKeysMap };
    },
    addSelectedKeys: createAddKeysFn('selectedKeys'),
    removeSelectedKeys: createRemoveKeysFn('selectedKeys'),
    updateSelectedKeys: (selectedKeys: ItemKey[], includeParentKeys = true) => {
        let willUpdateSelectedKeys = selectedKeys;
        if (includeParentKeys) {
            const parentSelectKeys = foundation.selectLevelZeroParentKeys(null, selectedKeys);
            willUpdateSelectedKeys = Array.from(new Set(selectedKeys.concat(parentSelectKeys)));
        }
        state.selectedKeys = willUpdateSelectedKeys;
        emit('update:selectedKeys', willUpdateSelectedKeys);
    },
    updateOpenKeys: (openKeys: ItemKey[]) => {
        state.openKeys = [...openKeys];
        emit('update:openKeys', openKeys);
    },
    addOpenKeys: createAddKeysFn('openKeys'),
    removeOpenKeys: createRemoveKeysFn('openKeys'),
    setItemsChanged: (isChanged: boolean) => {
        itemsChanged.value = isChanged;
    },
};

const itemsChanged = ref(true);
const slots = useSlots();

const { foundation } = useFoundation(NavigationFoundation, adapter, state);

// Initialize - call init if items are provided
// Note: In Vue, slots are not available during setup, so we only initialize with items
if (props.items && props.items.length) {
    const calcState = foundation.init('constructor');
    if (calcState) {
        Object.assign(state, calcState);
    }
}

// Initialize with children after mount
onMounted(async () => {
    await nextTick();
    // If no items prop is provided, we rely on children (slots)
    // Foundation will handle this through the renderItems function
    if (!props.items || !props.items.length) {
        // Initialize with empty state, children will be rendered through slots
        foundation.handleItemsChange(false);
    }
});

// Watch for prop changes
watch(
    () => props.isCollapsed,
    (newVal) => {
        // 只有在受控模式下，才从 props 同步到 state
        // 如果 props.isCollapsed 变化了，说明是外部更新（通过 v-model）
        if (newVal !== undefined && newVal !== state.isCollapsed) {
            state.isCollapsed = newVal;
        }
    }
);

// Watch items和children变化 - 完全按照React版本的componentDidUpdate
watch(
    [() => props.items],
    (newItems, oldItems) => {
        // 如果items变化，重新init
        if (newItems !== oldItems) {
            itemsChanged.value = true;
            if (newItems && newItems.length) {
                foundation.init();
            } else {
                foundation.handleItemsChange(false);
            }
        }
    },
    { deep: true }
);

// Watch selectedKeys和openKeys - 完全按照React版本的componentDidUpdate逻辑
watch(
    () => props.selectedKeys,
    (newVal, oldVal) => {
        if (newVal && !isEqual(oldVal, newVal)) {
            // 先处理itemsChange（如果items没变）
            if (props.items === props.items) {
                foundation.handleItemsChange(false);
            }
            adapter.updateSelectedKeys(newVal);
            const willOpenKeys = foundation.getWillOpenKeys(state.itemKeysMap);
            adapter.updateOpenKeys(willOpenKeys);
        }
    },
    { deep: true }
);

watch(
    () => props.openKeys,
    (newVal, oldVal) => {
        if (newVal && !isEqual(oldVal, newVal)) {
            // 先处理itemsChange（如果items没变）
            if (props.items === props.items) {
                foundation.handleItemsChange(false);
            }
            adapter.updateOpenKeys(newVal);
        }
    },
    { deep: true }
);

const onCollapseChange = (isCollapsed?: boolean) => {
    // 如果传入了参数，使用传入的值；否则切换当前状态
    const newIsCollapsed = isCollapsed !== undefined ? isCollapsed : !state.isCollapsed;

    // 直接调用 adapter.setIsCollapsed，它会更新 state 并 emit 事件
    adapter.setIsCollapsed(newIsCollapsed);

    // 通知外部 collapseChange 事件（foundation 的 handleCollapseChange 也会调用这个）
    adapter.notifyCollapseChange(newIsCollapsed);
};

// Render items recursively - 完全按照React版本
const renderItems = (items: any[] = [], level = 0): any[] => {
    const { expandIcon, subDropdownProps } = props;
    return items.map((item: any, idx: number) => {
        if (Array.isArray(item.items) && item.items.length) {
            // 从 item 中排除 items 属性，避免冲突
            const { items: _, ...itemProps } = item;
            return h(
                SubNav,
                {
                    key: item.itemKey || String(level) + idx,
                    level, // level 必须在 ...itemProps 之前，防止被覆盖
                    ...itemProps,
                    expandIcon: expandIcon,
                    subDropdownProps: subDropdownProps,
                },
                {
                    default: () => renderItems(item.items, level + 1),
                }
            );
        } else {
            // 同样，level 必须在 ...item 之前
            return h(Item, {
                key: item.itemKey || String(level) + idx,
                level,
                ...item,
            });
        }
    });
};

// Process headers and footers - 支持插槽和 props 两种方式
const processedHeaders = computed(() => {
    const result: any[] = [];

    // 处理props.header（向后兼容）
    if (props.header) {
        if (isVNode(props.header)) {
            result.push(h(Header, { key: 0 }, () => [props.header]));
        } else if (typeof props.header === 'object') {
            result.push(h(Header, { key: 0, ...(props.header as any) }));
        }
    }

    return result;
});

const processedFooters = computed(() => {
    const result: any[] = [];

    // 处理props.footer（向后兼容）
    if (props.footer) {
        if (isVNode(props.footer)) {
            result.push(h(Footer, { key: 0 }, () => [props.footer]));
        } else if (typeof props.footer === 'object') {
            result.push(h(Footer, { key: 0, ...(props.footer as any) }));
        }
    }

    return result;
});

// 检查是否有 header 和 footer 插槽
const hasHeaderSlot = computed(() => Boolean(slots.header));
const hasFooterSlot = computed(() => Boolean(slots.footer));

const finalCls = computed(() =>
    classNames(props.prefixCls, (props as any).class || (props as any).className, {
        [`${props.prefixCls}-collapsed`]: state.isCollapsed,
        [`${props.prefixCls}-horizontal`]: props.mode === 'horizontal',
        [`${props.prefixCls}-vertical`]: props.mode === 'vertical',
    })
);

const headerListOuterCls = computed(() =>
    classNames(`${props.prefixCls}-header-list-outer`, {
        [`${props.prefixCls}-header-list-outer-collapsed`]: state.isCollapsed,
    })
);

const finalStyle = computed(() => props.style as any);
const bodyStyle = computed(() => props.bodyStyle as any);

// itemElems - 完全按照React版本使用缓存
const itemElems = computed(() => {
    if (itemsChanged.value && props.items && props.items.length) {
        const rendered = renderItems(state.items);
        adapter.setCache('itemElems', rendered);
        itemsChanged.value = false;
        return rendered;
    }
    return adapter.getCache('itemElems') || [];
});

// Watch items变化，重置itemsChanged
watch(
    [() => props.items],
    () => {
        itemsChanged.value = true;
        if (props.items && props.items.length) {
            foundation.init();
        } else {
            foundation.handleItemsChange(false);
        }
    },
    { deep: true }
);

// Provide context - 使用computed确保完全响应式
const navContextValue = computed(() => ({
    subNavCloseDelay: props.subNavCloseDelay,
    subNavOpenDelay: props.subNavOpenDelay,
    subNavMotion: props.subNavMotion,
    tooltipShowDelay: props.tooltipShowDelay,
    tooltipHideDelay: props.tooltipHideDelay,
    openKeys: state.openKeys, // 直接引用reactive state
    openKeysIsControlled: props.openKeys !== undefined && props.mode === 'vertical' && !state.isCollapsed,
    canUpdateOpenKeys: true,
    selectedKeys: state.selectedKeys, // 直接引用reactive state
    selectedKeysIsControlled: props.selectedKeys !== undefined,
    isCollapsed: state.isCollapsed,
    mode: props.mode,
    prefixCls: props.prefixCls,
    toggleIconPosition: props.toggleIconPosition,
    limitIndent: props.limitIndent,
    locale: {
        collapseText: '收起侧边栏',
        expandText: '展开侧边栏',
    }, // 默认 locale，后续可以通过 LocaleConsumer 获取
    getPopupContainer: props.getPopupContainer,
    onCollapseChange,
    onSelect: (data: OnSelectedData) => emit('select', data),
    onOpenChange: (data: { itemKey?: ItemKey; openKeys?: ItemKey[]; domEvent?: MouseEvent; isOpen?: boolean }) =>
        emit('openChange', data),
    onClick: (data: { itemKey?: ItemKey; domEvent?: MouseEvent; isOpen?: boolean }) => emit('click', data),
    updateOpenKeys: adapter.updateOpenKeys,
    addOpenKeys: adapter.addOpenKeys,
    removeOpenKeys: adapter.removeOpenKeys,
    updateSelectedKeys: adapter.updateSelectedKeys,
    addSelectedKeys: adapter.addSelectedKeys,
    removeSelectedKeys: adapter.removeSelectedKeys,
    renderWrapper: props.renderWrapper,
}));

provide(NavContextKey, navContextValue as any);
</script>
