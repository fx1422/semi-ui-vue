<template>
    <div :class="tabWrapperCls" :style="style">
        <component :is="tabBar" />
        <div ref="contentRef" :class="tabContentCls" :style="contentStyle">
            <slot v-if="keepDOM"></slot>
            <template v-else>
                <component :is="child" v-for="child in activeChildren" :key="child.key" />
            </template>
        </div>
    </div>
</template>

<script lang="ts" setup>
import {
    computed,
    h,
    onMounted,
    onBeforeUnmount,
    provide,
    reactive,
    ref,
    watch,
    useSlots,
    nextTick,
    markRaw,
    Fragment,
} from 'vue';
import { cssClasses } from '@douyinfe/semi-foundation/tabs/constants';
import { isEqual, pick } from 'lodash-es';
import TabsFoundation, { TabsAdapter } from '@douyinfe/semi-foundation/tabs/foundation';
import TabBar from './TabBar.vue';
import { TabsContextKey } from './context';
import type { TabsProps, PlainTab, TabBarProps } from './interface';

defineOptions({
    name: 'Tabs',
});

const props = withDefaults(defineProps<TabsProps>(), {
    collapsible: false,
    keepDOM: true,
    lazyRender: false,
    size: 'large',
    tabPaneMotion: true,
    tabPosition: 'top',
    type: 'line',
    showRestInDropdown: true,
    arrowPosition: 'both',
});

const emit = defineEmits<{
    (e: 'change', activeKey: string): void;
    (e: 'update:activeKey', activeKey: string): void;
    (e: 'tabClick', activeKey: string, event: MouseEvent): void;
    (e: 'tabClose', tabKey: string): void;
}>();

const slots = useSlots();

const hasExtraSlot = computed(() => Boolean(slots.extra));

const hasArrowSlot = computed(() => Boolean(slots.arrow));

const flattenChildren = (children: any[]): any[] => {
    const result: any[] = [];
    (children || []).forEach((child: any) => {
        if (!child) return;
        if (child.type?.toString() === 'Symbol(Comment)') return;
        if (typeof child.children === 'string' && !child.type) return;

        if (child.type === Fragment) {
            const fragmentChildren = Array.isArray(child.children) ? child.children : [];
            result.push(...flattenChildren(fragmentChildren));
        } else if (Array.isArray(child)) {
            result.push(...flattenChildren(child));
        } else if (child && child.type) {
            result.push(child);
        }
    });
    return result;
};

const getPanes = (): PlainTab[] => {
    const { tabList } = props;
    const children = slots.default?.() || [];

    if (Array.isArray(tabList) && tabList.length) {
        return tabList;
    }

    const flatChildren = flattenChildren(Array.isArray(children) ? children : [children]);

    return flatChildren
        .filter((child) => {
            if (!child || !child.type) return false;
            const type = child.type as any;
            return type.__name === 'TabPane' || type.name === 'TabPane';
        })
        .map((child: any) => {
            if (child) {
                const { tab, icon, disabled, itemKey, closable } = child.props || {};
                return {
                    tab: typeof tab === 'object' && tab !== null ? markRaw(tab) : tab,
                    icon: icon && typeof icon === 'object' && icon !== null ? markRaw(icon) : icon,
                    disabled,
                    itemKey,
                    closable,
                };
            }
            return undefined;
        })
        .filter(Boolean);
};

const state = reactive({
    activeKey: '',
    panes: [] as PlainTab[],
    prevActiveKey: null as string | null,
    forceDisableMotion: false,
});

const contentRef = ref<HTMLDivElement>();

function adapter(): TabsAdapter<TabsProps, typeof state> {
    return {
        getProps: () => {
            const filteredProps: any = {};
            Object.keys(props).forEach((key) => {
                if ((props as any)[key] !== undefined) {
                    filteredProps[key] = (props as any)[key];
                }
            });
            return filteredProps;
        },
        getState: (key) => state[key],
        getStates: () => state,
        setState: (newState: Partial<typeof state>) => {
            Object.assign(state, newState);
        },
        getProp: (key) => props[key],
        getContext: () => ({}),
        getContexts: () => ({}),
        getCache: () => ({}),
        getCaches: () => ({}),
        setCache: () => {},
        collectPane: () => {
            if (state.panes.length === 0) {
                return;
            }
        },
        collectActiveKey: () => {
            const { activeKey: propsActiveKey } = props;
            if (typeof propsActiveKey !== 'undefined') {
                return;
            }
            const { activeKey } = state;
            const panes = state.panes;
            if (panes.findIndex((p) => p.itemKey === activeKey) === -1) {
                if (panes.length > 0) {
                    state.activeKey = panes[0].itemKey;
                } else {
                    state.activeKey = '';
                }
            }
        },
        notifyTabClick: (activeKey: string, event: MouseEvent) => {
            emit('tabClick', activeKey, event);
        },
        notifyChange: (activeKey: string) => {
            emit('change', activeKey);
            emit('update:activeKey', activeKey);
        },
        setNewActiveKey: (activeKey: string) => {
            state.activeKey = activeKey;
        },
        getDefaultActiveKeyFromChildren: (): string => {
            const { tabList } = props;
            let activeKey = '';
            const list = tabList || state.panes;
            list.forEach((item: any) => {
                if (item && !activeKey && !item.disabled) {
                    activeKey = item.itemKey;
                }
            });
            return activeKey;
        },
        notifyTabDelete: (tabKey: string) => {
            emit('tabClose', tabKey);
        },
        stopPropagation: (e: any) => {
            e?.stopPropagation();
        },
        persistEvent: (event: any) => {
            return event;
        },
    };
}

const foundation = new TabsFoundation(adapter());

onMounted(() => {
    foundation.init();
    nextTick(() => {
        if (!props.activeKey) {
            state.activeKey = foundation.getDefaultActiveKey();
        }
        foundation.handleTabPanesChange();
    });
});

onBeforeUnmount(() => {
    foundation.destroy();
});

if (props.activeKey) {
    state.activeKey = props.activeKey;
}

watch(
    () => props.activeKey,
    (newKey) => {
        if (newKey !== undefined && newKey !== state.activeKey) {
            state.prevActiveKey = state.activeKey;
            state.activeKey = newKey;
        }
    }
);

const panePickKeys = ['className', 'style', 'disabled', 'itemKey', 'tab', 'icon'];
let prevChildrenProps: any[] = [];

watch(
    () => {
        return state.panes.map((pane) => pick(pane, panePickKeys));
    },
    (nowChildrenProps) => {
        const isTabListType = props.tabList;

        if (!isEqual(prevChildrenProps, nowChildrenProps) && !isTabListType) {
            foundation.handleTabPanesChange();
        }

        prevChildrenProps = nowChildrenProps;
    },
    { deep: true }
);

watch(
    () => props.tabList,
    (newTabList, oldTabList) => {
        if (!isEqual(newTabList, oldTabList)) {
            foundation.handleTabListChange();
        }
    },
    { deep: true }
);

watch(
    () => state.activeKey,
    (newKey, oldKey) => {
        if (oldKey !== state.prevActiveKey) {
            state.prevActiveKey = oldKey;
        }
    }
);

watch(
    () => props.activeKey,
    (newKey) => {
        const children = slots.default?.() || [];
        const nowChildrenProps = children
            .filter(
                (child) =>
                    child.type && ((child.type as any).__name === 'TabPane' || (child.type as any).name === 'TabPane')
            )
            .map((child: any) => pick(child.props, panePickKeys));

        const prevItemKeys = new Set(prevChildrenProps.map((p) => p.itemKey));
        const newAddedPanelItemKey = nowChildrenProps
            .map((p) => p.itemKey)
            .filter((itemKey) => !prevItemKeys.has(itemKey));

        state.forceDisableMotion = newAddedPanelItemKey.includes(newKey);
    }
);

const tabWrapperCls = computed(() => {
    const { className, tabPosition } = props;
    return [
        className,
        {
            [cssClasses.TABS]: true,
            [`${cssClasses.TABS}-${tabPosition}`]: tabPosition,
        },
    ];
});

const tabContentCls = computed(() => {
    const { tabPosition } = props;
    return [
        {
            [cssClasses.TABS_CONTENT]: true,
            [`${cssClasses.TABS_CONTENT}-${tabPosition}`]: tabPosition,
        },
    ];
});

const onTabClick = (activeKey: string, event: MouseEvent) => {
    foundation.handleTabClick(activeKey, event);
};

const deleteTabItem = (tabKey: string, event: MouseEvent) => {
    event.stopPropagation();
    foundation.handleTabDelete(tabKey);
};

const tabBarProps = computed((): TabBarProps => {
    const {
        tabBarClassName,
        collapsible,
        showRestInDropdown,
        size,
        tabBarStyle,
        tabBarExtraContent,
        tabPosition,
        type,
        more,
        onVisibleTabsChange,
        visibleTabsStyle,
        arrowPosition,
        renderArrow,
        dropdownProps,
    } = props;

    const panes = getPanes();

    return {
        activeKey: state.activeKey,
        className: tabBarClassName,
        collapsible,
        list: panes,
        onTabClick,
        showRestInDropdown,
        size,
        style: tabBarStyle,
        tabBarExtraContent: hasExtraSlot.value ? () => slots.extra?.() : tabBarExtraContent,
        tabPosition,
        type,
        deleteTabItem,
        handleKeyDown: foundation.handleKeyDown,
        more,
        onVisibleTabsChange,
        visibleTabsStyle,
        arrowPosition,
        renderArrow,
        dropdownProps,
    };
});

watch(
    () => tabBarProps.value.list,
    (newPanes) => {
        if (newPanes.length > 0 && (state.panes.length !== newPanes.length || !isEqual(state.panes, newPanes))) {
            state.panes = newPanes;
        }
    },
    { immediate: true, deep: true }
);

const tabBar = computed(() => {
    if (props.renderTabBar) {
        return props.renderTabBar(tabBarProps.value, TabBar);
    }
    return h(
        TabBar,
        tabBarProps.value,
        hasArrowSlot.value
            ? {
                  arrow: slots.arrow,
              }
            : {}
    );
});

const activeChildren = computed(() => {
    const children = slots.default?.() || [];
    const flatChildren = flattenChildren(Array.isArray(children) ? children : [children]);
    return flatChildren.filter((pane: any) => {
        if (pane.type && ((pane.type as any).__name === 'TabPane' || (pane.type as any).name === 'TabPane')) {
            return pane.props?.itemKey === state.activeKey;
        }
        return true;
    });
});

provide(
    TabsContextKey,
    reactive({
        get activeKey() {
            return state.activeKey;
        },
        get lazyRender() {
            return props.lazyRender;
        },
        get panes() {
            return state.panes;
        },
        get tabPaneMotion() {
            return props.tabPaneMotion;
        },
        get tabPosition() {
            return props.tabPosition;
        },
        get prevActiveKey() {
            return state.prevActiveKey;
        },
        get forceDisableMotion() {
            return state.forceDisableMotion;
        },
    })
);
</script>
