<template>
    <span :class="wrapperCls" v-bind="pageLabel">
        <component :is="tag" :class="itemCls" :href="href" @click="handleClick">
            <template v-if="slots.icon">
                <span :class="`${clsPrefix}-item-icon`">
                    <slot name="icon"></slot>
                </span>
            </template>
            <template v-if="hasTextContent">
                <span :class="`${clsPrefix}-item-title`">
                    <TypographyText
                        :ellipsis="{
                            showTooltip: 'opts' in tooltipOpt && tooltipOpt.opts ? { opts: tooltipOpt.opts } : false,
                            pos: tooltipOpt.ellipsisPos,
                        }"
                        :style="{ maxWidth: `${tooltipOpt.width}px` }"
                        :size="context.compact ? 'small' : 'normal'"
                    >
                        {{ children }}
                    </TypographyText>
                </span>
            </template>
            <template v-else>
                <span v-if="slots.default" :class="`${clsPrefix}-item-title ${clsPrefix}-item-title-inline`">
                    <slot></slot>
                </span>
            </template>
        </component>
        <template v-if="shouldRenderSeparator">
            <slot name="separator">
                <span :class="`${clsPrefix}-separator`">
                    <component :is="finalSeparator" v-if="isVNode(finalSeparator)" />
                    <template v-else>{{ finalSeparator }}</template>
                </span>
            </slot>
        </template>
    </span>
</template>

<script setup lang="ts" name="BreadcrumbItem">
/**
 * BreadcrumbItem Component
 *
 * A single item in the breadcrumb navigation, typically representing a page or section.
 * Supports icons via slots, custom separators, links, and text ellipsis with tooltips.
 *
 * @example
 * ```vue
 * <BreadcrumbItem href="/home">Home</BreadcrumbItem>
 * <BreadcrumbItem>
 *   <template #icon>
 *     <IconFolder />
 *   </template>
 *   Documents
 * </BreadcrumbItem>
 * ```
 */
import { computed, useSlots, isVNode } from 'vue';
import classnames from 'classnames';
import { cssClasses } from '@douyinfe/semi-foundation/breadcrumb/constants';
import BreadcrumbItemFoundation, { BreadcrumbItemAdapter } from '@douyinfe/semi-foundation/breadcrumb/itemFoundation';
import { useFoundation } from '../_utils';
import { useBreadcrumbContext } from './context';
import TypographyText from '../typography/Text.vue';
import type { BreadcrumbItemProps, BreadcrumbItemInfo } from './interface';

const clsPrefix = cssClasses.PREFIX;

const props = withDefaults(defineProps<BreadcrumbItemProps>(), {
    onClick: undefined,
    shouldRenderSeparator: true,
});

const emit = defineEmits<{
    click: [item: BreadcrumbItemProps, e: MouseEvent];
}>();

const slots = useSlots();
const context = useBreadcrumbContext();

/**
 * Extract text content from default slot
 * Used for text ellipsis with tooltip feature
 * @returns String content or null
 */
const children = computed(() => {
    if (slots.default) {
        const vnodes = slots.default();
        if (vnodes && vnodes.length === 1 && typeof vnodes[0].children === 'string') {
            return vnodes[0].children;
        }
    }
    return null;
});

const hasTextContent = computed(() => {
    return Boolean(children.value) && typeof children.value === 'string';
});

/**
 * Get tooltip configuration for text ellipsis
 * Merges context showTooltip settings with default options
 * @returns Tooltip configuration object
 */
const tooltipOpt = computed(() => {
    if (!context.showTooltip) {
        return {
            width: 150,
            ellipsisPos: 'end' as const,
        };
    }
    const defaultOpts = {
        width: 150,
        ellipsisPos: 'end' as const,
        opts: {
            autoAdjustOverflow: true,
            position: 'top' as const,
        },
    };
    if (typeof context.showTooltip === 'object') {
        return { ...defaultOpts, ...context.showTooltip };
    }
    return defaultOpts;
});

const itemCls = computed(() =>
    classnames({
        [`${clsPrefix}-item`]: true,
        [`${clsPrefix}-item-active`]: props.active,
        [`${clsPrefix}-item-link`]: !props.noLink,
    })
);

const wrapperCls = computed(() =>
    classnames({
        [`${clsPrefix}-item-wrap`]: true,
    })
);

const pageLabel = computed(() => (props.active ? { 'aria-current': 'page' as const } : {}));

const tag = computed(() => {
    const hasHref = props.href !== null && typeof props.href !== 'undefined';
    return props.active || !hasHref ? 'span' : 'a';
});

const finalSeparator = computed(() => {
    return props.separator || context.separator;
});

/**
 * Get item information for click event
 * Collects route, name, and href information
 * @returns BreadcrumbItemInfo object for event handlers
 */
const getItemInfo = (): BreadcrumbItemInfo => {
    let itemInfo: BreadcrumbItemInfo = {};
    const { route, href } = props;
    const hasHref = href !== undefined && href !== null;

    if (route) {
        itemInfo = route;
    } else {
        itemInfo.name = children.value || slots.default?.();
        if (hasHref) {
            itemInfo.href = href;
        }
    }
    return itemInfo;
};

/** Foundation adapter - implements BreadcrumbItemAdapter interface */
const adapter: BreadcrumbItemAdapter = {
    // Base adapter methods (required by DefaultAdapter interface)
    getContext: (_key: string) => null,
    getContexts: () => ({}),
    getProp: (key: string) => (props as any)[key],
    getProps: () => props,
    getState: (_key: string) => null,
    getStates: () => ({}),
    setState: (_s: any, _callback?: any) => {},
    getCache: (_key: string) => null,
    getCaches: () => ({}),
    setCache: (_key: string, _value: unknown) => {},
    stopPropagation: (e: any) => e?.stopPropagation?.(),
    persistEvent: (event: any) => {
        if (typeof event?.persist === 'function') {
            event.persist();
        }
    },

    notifyClick: (item, e) => {
        emit('click', item, e);
    },
    notifyParent: (item, e) => {
        context.onClick?.(item, e);
    },
};

const { foundation } = useFoundation(BreadcrumbItemFoundation, adapter);

/**
 * Handle click event on breadcrumb item
 * Delegates to foundation for business logic
 * @param e - Mouse event
 */
const handleClick = (e: MouseEvent) => {
    const itemInfo = getItemInfo();
    foundation.handleClick(itemInfo, e);
};

// Expose item type for parent component check
defineOptions({
    name: 'BreadcrumbItem',
    isBreadcrumbItem: true,
});
</script>

<style scoped>
.semi-breadcrumb-item-icon {
    margin-right: 4px;
}
</style>
