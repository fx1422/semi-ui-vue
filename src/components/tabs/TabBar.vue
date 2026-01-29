<template>
    <div
        role="tablist"
        :aria-orientation="tabPosition === 'left' ? 'vertical' : 'horizontal'"
        :class="classNames"
        :style="style"
        :data-uuid="uuid"
    >
        <OverflowList
            v-if="collapsible"
            :items="collapsedTabItems"
            :overflowRenderDirection="arrowPosition"
            :wrapperStyle="visibleTabsStyle"
            :overflowRenderer="renderOverflow"
            renderMode="scroll"
            :className="`${cssClasses.TABS_BAR}-overflow-list`"
            :style="{ minWidth: 0, maxWidth: '100%' }"
            :visibleItemRenderer="renderTabItem as any"
            @visible-state-change="handleVisibleStateChange"
        />
        <template v-else-if="more">
            <component :is="renderWithMoreTrigger()" />
        </template>
        <template v-else>
            <TabItem
                v-for="panel in list"
                :key="getBarItemKeyByItemKey(panel.itemKey)"
                :data-scrollkey="getBarItemKeyByItemKey(panel.itemKey)"
                :disabled="panel.disabled"
                :icon="panel.icon"
                :itemKey="panel.itemKey"
                :tab="panel.tab"
                :closable="panel.closable"
                :selected="isActive(panel.itemKey)"
                :size="size"
                :type="type"
                :tabPosition="tabPosition"
                :handleKeyDown="handleKeyDown"
                :deleteTabItem="deleteTabItem"
                :onClick="handleItemClick"
            />
        </template>
        <component :is="renderExtra()" v-if="renderExtra()" />
    </div>
</template>

<script lang="ts" setup>
import { computed, h, nextTick, onMounted, onBeforeUnmount, ref, watch, VNode, useSlots } from 'vue';
import classnames from 'classnames';
import { cssClasses } from '@douyinfe/semi-foundation/tabs/constants';
import { getUuidv4 } from '@douyinfe/semi-foundation/utils/uuid';
import { IconChevronRight, IconChevronLeft, IconChevronDown } from '../icons';
import { isEmpty } from 'lodash-es';
import TabItem from './TabItem.vue';
import Dropdown from '../dropdown';
import Button from '../button';
import OverflowList from '../overflowList';
import type { TabBarProps, PlainTab, OverflowItem } from './interface';

defineOptions({
    name: 'TabBar',
});

const props = withDefaults(defineProps<TabBarProps>(), {
    showRestInDropdown: true,
});

const slots = useSlots();

const uuid = ref('');
const isFirstShowInViewport = ref(true);
const rePosKey = ref(0);

onMounted(() => {
    uuid.value = getUuidv4();
});

onBeforeUnmount(() => {
    // Clean up all ResizeObservers
    resizeObservers.value.forEach((observer) => {
        observer.disconnect();
    });
    resizeObservers.value.clear();
});

watch(
    () => props.activeKey,
    (newKey, oldKey) => {
        if (newKey !== oldKey && props.collapsible) {
            scrollActiveTabItemIntoView();
        }
    }
);

const classNames = computed(() => {
    const { type, className, tabPosition, collapsible } = props;
    return [
        className,
        {
            [cssClasses.TABS_BAR]: true,
            [cssClasses.TABS_BAR_LINE]: type === 'line',
            [cssClasses.TABS_BAR_CARD]: type === 'card',
            [cssClasses.TABS_BAR_BUTTON]: type === 'button',
            [cssClasses.TABS_BAR_SLASH]: type === 'slash',
            [`${cssClasses.TABS_BAR}-${tabPosition}`]: tabPosition,
            [`${cssClasses.TABS_BAR}-collapse`]: collapsible,
        },
    ];
});

const isActive = (key: string): boolean => key === props.activeKey;

const getBarItemKeyByItemKey = (key: string): string => `${key}-bar`;

const getItemKeyByBarItemKey = (key: string): string => key.replace(/-bar$/, '');

const handleItemClick = (itemKey: string, event: MouseEvent) => {
    props.onTabClick?.(itemKey, event);
};

const renderIcon = (icon: any): VNode => {
    return h('span', null, icon);
};

const renderExtra = (): VNode | null => {
    const { tabBarExtraContent, type, size } = props;
    if (!tabBarExtraContent) {
        return null;
    }

    const content = typeof tabBarExtraContent === 'function' ? tabBarExtraContent() : tabBarExtraContent;

    const tabBarExtraContentDefaultStyle = { float: 'right' };
    const tabBarExtraContentStyle = content?.props?.style || {};
    const extraCls = [
        cssClasses.TABS_BAR_EXTRA,
        {
            [`${cssClasses.TABS_BAR}-${type}-extra`]: type,
            [`${cssClasses.TABS_BAR}-${type}-extra-${size}`]: size,
        },
    ];

    const tabBarStyle = { ...tabBarExtraContentDefaultStyle, ...tabBarExtraContentStyle };

    return h(
        'div',
        {
            class: extraCls,
            style: tabBarStyle,
            'x-semi-prop': 'tabBarExtraContent',
        },
        content
    );
};

const scrollTabItemIntoViewByKey = (
    key: string,
    logicalPosition: ScrollLogicalPosition = 'nearest',
    behavior?: ScrollBehavior
) => {
    const tabItem = document.querySelector(
        `[data-uuid="${uuid.value}"] .${cssClasses.TABS_TAB}[data-scrollkey="${key}"]`
    ) as HTMLElement;
    if (tabItem) {
        tabItem.scrollIntoView({
            behavior: behavior || 'smooth',
            block: 'nearest',
            inline: logicalPosition,
        });
    }
};

const scrollActiveTabItemIntoView = (logicalPosition?: ScrollLogicalPosition, behavior?: ScrollBehavior) => {
    const key = getBarItemKeyByItemKey(props.activeKey);
    scrollTabItemIntoViewByKey(key, logicalPosition, behavior);
};

const handleArrowClick = (items: Array<OverflowItem>, pos: 'start' | 'end', _e?: MouseEvent): void => {
    if (!items.length) {
        return;
    }

    let targetItem: OverflowItem | undefined;

    if (pos === 'start') {
        targetItem = items[items.length - 1];
    } else {
        const scrollWrapper = document.querySelector(
            `[data-uuid="${uuid.value}"] .${cssClasses.TABS_BAR}-overflow-list .semi-overflow-list-scroll-wrapper`
        ) as HTMLElement;
        if (scrollWrapper) {
            const scrollLeft = scrollWrapper.scrollLeft;
            const containerWidth = scrollWrapper.clientWidth;
            const viewportRight = scrollLeft + containerWidth;

            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                const itemKey = getBarItemKeyByItemKey(item.itemKey);
                const tabItem = document.querySelector(
                    `[data-uuid="${uuid.value}"] .${cssClasses.TABS_TAB}[data-scrollkey="${itemKey}"]`
                ) as HTMLElement;

                if (tabItem) {
                    const containerRect = scrollWrapper.getBoundingClientRect();
                    const itemRect = tabItem.getBoundingClientRect();
                    const itemLeft = itemRect.left - containerRect.left + scrollLeft;
                    const itemRight = itemLeft + itemRect.width;

                    const threshold = 2;
                    const isFullyVisible = itemLeft >= scrollLeft && itemRight <= viewportRight + threshold;

                    if (!isFullyVisible && itemLeft >= scrollLeft && itemRight > viewportRight) {
                        targetItem = item;
                        break;
                    }
                }
            }

            if (!targetItem) {
                targetItem = items[0];
            }
        } else {
            targetItem = items[0];
        }
    }

    if (!targetItem) {
        return;
    }
    const key = getBarItemKeyByItemKey(targetItem.itemKey);
    const logicalPosition: ScrollLogicalPosition = pos === 'start' ? 'start' : 'end';
    scrollTabItemIntoViewByKey(key, logicalPosition);
};

const previousItems = ref<Map<string, Array<OverflowItem>>>(new Map());
const dropdownVisible = ref<Map<string, boolean>>(new Map());
const resizeObservers = ref<Map<string, ResizeObserver>>(new Map());

const handleDropdownVisibleChange = (pos: 'start' | 'end', visible: boolean) => {
    dropdownVisible.value.set(pos, visible);

    if (visible) {
        nextTick(() => {
            const findTooltipPortal = (): HTMLElement | null => {
                const tabBar = document.querySelector(`[data-uuid="${uuid.value}"]`) as HTMLElement;
                if (!tabBar) return null;

                const tabBarRect = tabBar.getBoundingClientRect();
                const allPortals = document.querySelectorAll('.semi-portal-inner');

                for (const portal of Array.from(allPortals)) {
                    const portalElement = portal as HTMLElement;
                    const portalRect = portalElement.getBoundingClientRect();

                    const hasDropdownMenu = portalElement.querySelector('.semi-dropdown-menu') !== null;
                    if (!hasDropdownMenu) continue;

                    const isNearTabBar =
                        Math.abs(portalRect.top - tabBarRect.bottom) < 50 ||
                        Math.abs(portalRect.bottom - tabBarRect.top) < 50;

                    if (isNearTabBar) {
                        return portalElement;
                    }
                }

                return null;
            };

            const tooltipPortal = findTooltipPortal();

            if (tooltipPortal) {
                const existingObserver = resizeObservers.value.get(pos);
                if (existingObserver) {
                    existingObserver.disconnect();
                }

                const observer = new ResizeObserver((_entries) => {
                    requestAnimationFrame(() => {
                        nextTick(() => {
                            rePosKey.value++;
                        });
                    });
                });

                observer.observe(tooltipPortal);
                resizeObservers.value.set(pos, observer);

                const triggerReposition = () => {
                    nextTick(() => {
                        rePosKey.value++;
                    });
                };

                setTimeout(triggerReposition, 50);
                setTimeout(triggerReposition, 150);
                setTimeout(triggerReposition, 300);
            } else {
                const triggerReposition = () => {
                    nextTick(() => {
                        rePosKey.value++;
                    });
                };

                setTimeout(triggerReposition, 100);
                setTimeout(triggerReposition, 200);
                setTimeout(triggerReposition, 350);
            }
        });
    } else {
        const observer = resizeObservers.value.get(pos);
        if (observer) {
            observer.disconnect();
            resizeObservers.value.delete(pos);
        }
    }
};

const renderCollapse = (items: Array<OverflowItem>, icon: VNode, pos: 'start' | 'end'): VNode => {
    const itemsKey = items.map((item) => item.itemKey).join(',');
    const prevItemsKey =
        previousItems.value
            .get(pos)
            ?.map((item) => item.itemKey)
            .join(',') || '';

    if (itemsKey !== prevItemsKey) {
        previousItems.value.set(pos, items);
        if (dropdownVisible.value.get(pos)) {
            nextTick(() => {
                setTimeout(() => {
                    nextTick(() => {
                        rePosKey.value++;
                    });
                }, 50);
            });
        } else {
            nextTick(() => {
                rePosKey.value++;
            });
        }
    }
    const arrowCls = [
        {
            [`${cssClasses.TABS_BAR}-arrow-${pos}`]: pos,
            [`${cssClasses.TABS_BAR}-arrow`]: true,
        },
    ];

    const arrowStyle = {
        flexShrink: 0,
        flexGrow: 0,
    };

    if (isEmpty(items)) {
        return h(
            'div',
            {
                role: 'presentation',
                class: arrowCls,
                style: arrowStyle,
            },
            [
                h(Button, {
                    disabled: true,
                    icon,
                    theme: 'borderless',
                }),
            ]
        );
    }

    const { dropdownClassName, dropdownStyle, showRestInDropdown, dropdownProps } = props;
    const disabled = !items.length;

    const menu = h(Dropdown.Menu, null, () =>
        items.map((panel) => {
            const panelIcon = panel.icon ? renderIcon(panel.icon) : null;
            return h(
                Dropdown.Item,
                {
                    key: panel.itemKey,
                    onClick: (e: MouseEvent) => handleItemClick(panel.itemKey, e),
                    active: isActive(panel.itemKey),
                },
                () => [panelIcon, panel.tab]
            );
        })
    );

    const button = h(
        'div',
        {
            role: 'presentation',
            class: arrowCls,
            style: {
                ...arrowStyle,
                display: 'inline-block',
            },
            onClick: (e: MouseEvent) => {
                handleArrowClick(items, pos, e);
            },
        },
        [
            h(Button, {
                disabled,
                icon,
                theme: 'borderless',
            }),
        ]
    );

    const dropdownCls = [
        dropdownClassName,
        {
            [`${cssClasses.TABS_BAR}-dropdown`]: true,
        },
    ];

    const customDropdownProps = dropdownProps?.[pos] ?? {};
    const customOnVisibleChange = customDropdownProps.onVisibleChange;

    if (showRestInDropdown) {
        return h(
            Dropdown,
            {
                ...customDropdownProps,
                key: `${rePosKey.value}-${pos}`,
                rePosKey: `${rePosKey.value}-${pos}`,
                className: classnames(dropdownCls),
                clickToHide: true,
                clickTriggerToHide: true,
                position: pos === 'start' ? 'bottomLeft' : 'bottomRight',
                render: disabled ? null : menu,
                showTick: true,
                style: dropdownStyle,
                trigger: 'hover',
                disableFocusListener: true,
                onVisibleChange: (visible: boolean) => {
                    handleDropdownVisibleChange(pos, visible);
                    if (customOnVisibleChange) {
                        customOnVisibleChange(visible);
                    }
                },
            },
            () => button
        );
    }
    return button;
};

const renderOverflow = (items: any[]): Array<VNode> => {
    return items.map((item, index) => {
        const pos = index === 0 ? 'start' : 'end';
        const icon = h(index === 0 ? IconChevronLeft : IconChevronRight);
        const overflowNode = renderCollapse(item, icon, pos);

        if (slots.arrow) {
            const arrowSlotContent = slots.arrow({
                items: item,
                pos,
                handleArrowClick: () => handleArrowClick(item, pos),
                defaultNode: overflowNode,
            });
            if (arrowSlotContent && Array.isArray(arrowSlotContent) && arrowSlotContent.length > 0) {
                const arrowVNode = arrowSlotContent[0];
                if (arrowVNode && typeof arrowVNode === 'object' && arrowVNode.props) {
                    const existingStyle = arrowVNode.props.style || {};
                    arrowVNode.props.style = {
                        ...existingStyle,
                        flexShrink: 0,
                        flexGrow: 0,
                    };
                }
                return arrowVNode as any;
            }
            return overflowNode as any;
        }

        if (props.renderArrow) {
            const customArrow = props.renderArrow(item, pos, () => handleArrowClick(item, pos), overflowNode);
            if (customArrow && typeof customArrow === 'object' && customArrow.props) {
                const existingStyle = customArrow.props.style || {};
                customArrow.props.style = {
                    ...existingStyle,
                    flexShrink: 0,
                    flexGrow: 0,
                };
            }
            return customArrow as any;
        }
        return overflowNode as any;
    }) as any;
};

const renderTabItem = (panel: OverflowItem, _index?: number): VNode => {
    return h(TabItem, {
        key: getBarItemKeyByItemKey(panel.itemKey),
        'data-scrollkey': getBarItemKeyByItemKey(panel.itemKey),
        disabled: panel.disabled,
        icon: panel.icon,
        itemKey: panel.itemKey,
        tab: panel.tab,
        closable: panel.closable,
        selected: isActive(panel.itemKey),
        size: props.size,
        type: props.type,
        tabPosition: props.tabPosition,
        handleKeyDown: props.handleKeyDown,
        deleteTabItem: props.deleteTabItem,
        onClick: handleItemClick,
    }) as any;
};

const collapsedTabItems = computed(() => {
    return props.list.map((item) => {
        const { itemKey } = item;
        return {
            key: getBarItemKeyByItemKey(itemKey),
            active: isActive(itemKey),
            ...item,
        };
    });
});

const handleVisibleStateChange = (visibleMap: Map<string, boolean>) => {
    const visibleMapWithItemKey: Map<string, boolean> = new Map();
    visibleMap.forEach((v, k) => {
        visibleMapWithItemKey.set(getItemKeyByBarItemKey(k), v);
    });
    // only when the tabs component appears in the viewport for the first time triggered scrollActiveTabItemIntoView
    // refer to issue 2917 https://github.com/DouyinFE/semi-design/issues/2917
    if (isFirstShowInViewport.value) {
        const isShowInViewport = Array.from(visibleMapWithItemKey.values()).some((item) => item);
        if (isShowInViewport) {
            scrollActiveTabItemIntoView('nearest', 'auto');
            isFirstShowInViewport.value = false;
        }
    }
    nextTick(() => {
        rePosKey.value++;
    });
    props.onVisibleTabsChange?.(visibleMapWithItemKey);
};

const renderWithMoreTrigger = (): VNode => {
    const { list, more, type } = props;
    let tabElements: VNode[] = [];
    let moreTrigger: VNode = h(
        'div',
        {
            class: [
                {
                    [`${cssClasses.TABS_BAR}-more-trigger`]: true,
                    [`${cssClasses.TABS_BAR}-more-trigger-${type}`]: true,
                },
            ],
            style: {
                marginLeft: type === 'line' ? '24px' : type === 'card' || type === 'button' ? '8px' : '0',
                fontSize: '14px',
            },
        },
        [
            h(
                'div',
                {
                    class: `${cssClasses.TABS_BAR}-more-trigger-content`,
                    style: {
                        alignItems: 'center',
                    },
                },
                [
                    h('div', null, '更多'), // TODO: Add locale support
                    h(IconChevronDown, {
                        class: `${cssClasses.TABS_BAR}-more-trigger-content-icon`,
                    }),
                ]
            ),
        ]
    );

    let keepCount: number;
    if (typeof more === 'number') {
        keepCount = list.length - Math.min(more, list.length);
        tabElements = list.slice(0, keepCount).map((panel) =>
            h(TabItem, {
                key: getBarItemKeyByItemKey(panel.itemKey),
                'data-scrollkey': getBarItemKeyByItemKey(panel.itemKey),
                disabled: panel.disabled,
                icon: panel.icon,
                itemKey: panel.itemKey,
                tab: panel.tab,
                closable: panel.closable,
                selected: isActive(panel.itemKey),
                size: props.size,
                type: props.type,
                tabPosition: props.tabPosition,
                handleKeyDown: props.handleKeyDown,
                deleteTabItem: props.deleteTabItem,
                onClick: handleItemClick,
            })
        );
    } else if (typeof more === 'object') {
        keepCount = list.length - Math.min(more.count, list.length);
        tabElements = list.slice(0, keepCount).map((panel) =>
            h(TabItem, {
                key: getBarItemKeyByItemKey(panel.itemKey),
                'data-scrollkey': getBarItemKeyByItemKey(panel.itemKey),
                disabled: panel.disabled,
                icon: panel.icon,
                itemKey: panel.itemKey,
                tab: panel.tab,
                closable: panel.closable,
                selected: isActive(panel.itemKey),
                size: props.size,
                type: props.type,
                tabPosition: props.tabPosition,
                handleKeyDown: props.handleKeyDown,
                deleteTabItem: props.deleteTabItem,
                onClick: handleItemClick,
            })
        );
        if (more.render) {
            moreTrigger = more.render() as any;
        }
    } else if (more !== undefined) {
        throw new Error('[Semi Tabs]: invalid tab props format: more');
    }

    return h('div', null, [
        ...tabElements,
        renderMoreDropdown(list.slice(keepCount), (more as any)?.dropdownProps, moreTrigger),
    ]);
};

const renderMoreDropdown = (panels: PlainTab[], dropDownProps: any, trigger: VNode): VNode => {
    return h(
        Dropdown,
        {
            trigger: 'hover',
            showTick: true,
            position: 'bottomLeft',
            class: `${cssClasses.TABS_BAR}-more-dropdown-${props.type}`,
            clickToHide: true,
            menu: panels.map((panel) => ({
                node: 'item',
                name: panel.tab,
                icon: panel.icon,
                onClick: (e: MouseEvent) => props.onTabClick(panel.itemKey, e),
                active: props.activeKey === panel.itemKey,
            })),
            ...dropDownProps,
        },
        () => trigger
    );
};
</script>
