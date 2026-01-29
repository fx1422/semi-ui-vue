<template>
    <nav :aria-label="props['aria-label']" :class="wrapperCls" :style="props.style">
        <component :is="item" v-for="(item, index) in breadcrumbsList" :key="`breadcrumb-${index}`" />
    </nav>
</template>

<script setup lang="ts" name="Breadcrumb">
/**
 * Breadcrumb Component
 *
 * A breadcrumb navigation component that displays the current page's location within a navigational hierarchy.
 * Supports route configuration, custom rendering, auto-collapse, and accessibility features.
 *
 * @example
 * ```vue
 * <Breadcrumb>
 *   <BreadcrumbItem>Home</BreadcrumbItem>
 *   <BreadcrumbItem>List</BreadcrumbItem>
 *   <BreadcrumbItem>Detail</BreadcrumbItem>
 * </Breadcrumb>
 * ```
 *
 * @example with routes
 * ```vue
 * <Breadcrumb :routes="[{ name: 'Home', path: '/' }, { name: 'List' }]" />
 * ```
 */
import { ref, computed, h, VNode, useSlots, Fragment, Comment, isVNode } from 'vue';
import classnames from 'classnames';
import { cssClasses } from '@douyinfe/semi-foundation/breadcrumb/constants';
import BreadcrumbFoundation, { BreadcrumbAdapter } from '@douyinfe/semi-foundation/breadcrumb/foundation';
import { useFoundation } from '../_utils';
import { provideBreadcrumbContext } from './context';
import BreadcrumbItem from './BreadcrumbItem.vue';
import Popover from '../popover/Popover.vue';
import { IconMore } from '../icons';
import type { BreadcrumbProps, BreadcrumbItemInfo, Route } from './interface';

const clsPrefix = cssClasses.PREFIX;

const props = withDefaults(defineProps<BreadcrumbProps>(), {
    routes: () => [],
    onClick: undefined,
    renderItem: undefined,
    separator: '/',
    compact: true,
    showTooltip: () => ({
        width: 150,
        ellipsisPos: 'end',
    }),
    autoCollapse: true,
    moreType: 'default',
    maxItemCount: 4,
    'aria-label': 'Breadcrumb',
});

const emit = defineEmits<{
    click: [route: Route, event: MouseEvent];
}>();

const slots = useSlots();

const isCollapsed = ref(true);

const wrapperCls = computed(() =>
    classnames(props.className, {
        [`${clsPrefix}-wrapper`]: true,
        [`${clsPrefix}-wrapper-compact`]: props.compact,
        [`${clsPrefix}-wrapper-loose`]: !props.compact,
    })
);

/**
 * Foundation adapter for Breadcrumb component
 * Implements the BreadcrumbAdapter interface required by BreadcrumbFoundation
 */
const adapter: BreadcrumbAdapter = {
    // Base adapter methods (required by DefaultAdapter interface)
    // These methods are no-ops in Vue version as we use Composition API's reactivity system

    /** Not used in Vue - context is managed by provide/inject */
    getContext: (_key: string) => null,
    getContexts: () => ({}),

    /** Get prop value by key */
    getProp: (key: string) => (props as any)[key],
    getProps: () => props,

    /** Not used in Vue - state is managed by ref/reactive */
    getState: (_key: string) => null,
    getStates: () => ({}),
    setState: (_s: any, _callback?: any) => {},

    /** Not used in Vue - cache is managed by computed/ref */
    getCache: (_key: string) => null,
    getCaches: () => ({}),
    setCache: (_key: string, _value: unknown) => {},

    /** Stop event propagation */
    stopPropagation: (e: any) => e?.stopPropagation?.(),

    /** Persist event (for React synthetic events, no-op in Vue) */
    persistEvent: (event: any) => {
        if (typeof event?.persist === 'function') {
            event.persist();
        }
    },

    /** Notify parent component of click event */
    notifyClick: (info, event) => {
        emit('click', info, event);
        props.onClick?.(info, event);
    },

    /** Expand collapsed breadcrumb items */
    expandCollapsed: () => {
        isCollapsed.value = false;
    },
};

const { foundation } = useFoundation(BreadcrumbFoundation, adapter);

// Provide context to children
provideBreadcrumbContext({
    onClick: (info: BreadcrumbItemInfo, event: MouseEvent) => {
        foundation.handleClick(info, event);
    },
    showTooltip: props.showTooltip,
    compact: props.compact,
    separator: props.separator,
});

/**
 * Render collapsed items in a popover
 * @param restItem - Array of hidden breadcrumb items
 * @returns VNode of Popover component with collapsed items
 */
const renderPopoverMore = (restItem: Array<VNode>) => {
    const content = h(
        Fragment,
        {},
        restItem.map((item, idx) =>
            h(
                Fragment,
                { key: `restItem-${idx}` },
                [
                    item,
                    idx !== restItem.length - 1 && h('span', { class: `${clsPrefix}-restItem` }, props.separator),
                ].filter(Boolean)
            )
        )
    );

    return h(
        Popover,
        {
            content,
            style: { padding: '12px' },
            showArrow: true,
        },
        () => h(IconMore)
    );
};

/**
 * Handle collapsed breadcrumb items when item count exceeds maxItemCount
 * @param template - Array of breadcrumb item VNodes
 * @param itemsLen - Total number of items
 * @returns Modified template array with collapsed items replaced by "..." button
 */
const handleCollapse = (template: Array<VNode>, itemsLen: number): Array<VNode> => {
    const { maxItemCount, renderMore, moreType } = props;
    const hasRenderMore = typeof renderMore === 'function';
    const restItem = template.slice(1, itemsLen - maxItemCount + 1);

    const spread = h(
        'span',
        { class: `${clsPrefix}-collapse`, key: `more-${itemsLen}` },
        h('span', { class: `${clsPrefix}-item-wrap` }, [
            h(
                'span',
                {
                    role: 'button',
                    tabindex: 0,
                    'aria-label': 'Expand breadcrumb items',
                    class: `${clsPrefix}-item ${clsPrefix}-item-more`,
                    onClick: (e: MouseEvent) => foundation.handleExpand(e),
                    onKeypress: (e: KeyboardEvent) => foundation.handleExpandEnterPress(e),
                },
                [
                    hasRenderMore && renderMore(restItem),
                    !hasRenderMore && moreType === 'default' && h(IconMore),
                    !hasRenderMore && moreType === 'popover' && renderPopoverMore(restItem),
                ]
            ),
            h('span', { class: `${clsPrefix}-separator`, 'x-semi-prop': 'separator' }, props.separator),
        ])
    );

    template.splice(1, itemsLen - maxItemCount, spread);
    return template;
};

/**
 * Render breadcrumb items from routes configuration
 * @param items - Array of route objects
 * @param shouldCollapse - Whether items should be collapsed
 * @param moreTypeIsPopover - Whether collapsed items should show in popover
 * @returns Array of BreadcrumbItem VNodes
 */
const renderRouteItems = (items: Array<Route>, shouldCollapse: boolean, moreTypeIsPopover: boolean): Array<VNode> => {
    const { renderItem, renderMore, maxItemCount } = props;
    const restItemLength = items.length - maxItemCount;
    const hasRenderMore = typeof renderMore === 'function';

    return items.map((route, idx) => {
        const key = route._origin?.key || `item-${route.name || route.path}-${idx}`;
        const inCollapseArea = idx > 0 && idx <= restItemLength;
        const active = props.activeIndex !== undefined ? props.activeIndex === idx : idx === items.length - 1;
        const shouldRenderSeparator =
            idx !== items.length - 1 && !(shouldCollapse && (hasRenderMore || moreTypeIsPopover) && inCollapseArea);

        const { icon, ...routeProps } = route;
        const slots: Record<string, () => any> = {
            default: () => (renderItem ? renderItem(route._origin) : route.name),
        };

        if (icon) {
            slots.icon = () => (isVNode(icon) ? icon : h(icon));
        }

        return h(
            BreadcrumbItem,
            {
                ...routeProps,
                key,
                active,
                route: route._origin,
                shouldRenderSeparator,
            },
            slots
        );
    });
};

/**
 * Render the complete list of breadcrumb items
 * Handles both routes configuration and slot children
 * Applies auto-collapse logic when item count exceeds maxItemCount
 * @returns Array of breadcrumb item VNodes
 */
const renderList = (): Array<VNode> => {
    const { routes, autoCollapse, maxItemCount, renderMore, moreType } = props;
    const hasRoutes = routes && routes.length > 0;

    // Get items from routes or slot children
    const items = hasRoutes
        ? foundation.genRoutes(routes as Route[])
        : slots.default
          ? slots.default().filter((vnode) => vnode.type !== Comment)
          : [];

    const itemLength = items.length;
    const restItemLength = itemLength - maxItemCount;
    const shouldCollapse = items && autoCollapse && itemLength > maxItemCount && isCollapsed.value;
    const hasRenderMore = typeof renderMore === 'function';
    const moreTypeIsPopover = moreType === 'popover';

    let template: Array<VNode>;

    if (hasRoutes) {
        // Render from routes configuration
        template = renderRouteItems(items as Route[], shouldCollapse, moreTypeIsPopover);
    } else {
        // Render from slot children
        template = (items as VNode[]).map((item, idx) => {
            const inCollapseArea = idx > 0 && idx <= restItemLength;
            if (!item) {
                return item;
            }

            // Clone VNode with additional props
            const active = props.activeIndex !== undefined ? props.activeIndex === idx : idx === items.length - 1;
            const shouldRenderSeparator =
                idx !== items.length - 1 && !(shouldCollapse && (hasRenderMore || moreTypeIsPopover) && inCollapseArea);

            // Create new VNode with merged props
            return h(
                item.type as any,
                {
                    ...item.props,
                    key: `${idx}-item`,
                    active,
                    shouldRenderSeparator,
                },
                item.children
            );
        });
    }

    if (shouldCollapse) {
        return handleCollapse(template, items.length);
    }

    return template;
};

const breadcrumbsList = computed(() => renderList());
</script>

<style scoped>
/* Component specific styles if needed */
</style>
