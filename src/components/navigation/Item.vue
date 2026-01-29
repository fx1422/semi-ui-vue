<script setup lang="ts">
import { computed, inject, ref, onMounted, onBeforeUnmount, isVNode, h, useSlots, nextTick } from 'vue';
import classNames from 'classnames';
import { cssClasses, strings } from '@douyinfe/semi-foundation/navigation/constants';
import ItemFoundation, { ItemAdapter } from '@douyinfe/semi-foundation/navigation/itemFoundation';
import isNullOrUndefined from '@douyinfe/semi-foundation/utils/isNullOrUndefined';
import { useFoundation } from '../_utils';
import type { NavItemProps, SelectedData } from './interface';
import { NavContextKey } from './context';
import Tooltip from '../tooltip';
import DropdownItem from '../dropdown/DropdownItem.vue';
import { cloneDeep, times } from 'lodash-es';
import { isSemiIcon } from '../_utils';

defineOptions({
    name: 'NavItem',
});

const props = withDefaults(
    defineProps<
        NavItemProps & {
            isSubNav?: boolean;
            indent?: boolean | number;
            isCollapsed?: boolean;
            isInSubNav?: boolean;
            toggleIcon?: any;
            style?: any;
            class?: any;
            forwardRef?: (ele: HTMLLIElement) => void;
        }
    >(),
    {
        isSubNav: false,
        indent: false,
        isCollapsed: false,
        disabled: false,
        tabIndex: 0,
        forwardRef: () => {},
    }
);

const emit = defineEmits<{
    click: [data: SelectedData];
    mouseenter: [e: MouseEvent];
    mouseleave: [e: MouseEvent];
}>();

const slots = useSlots();
const navContextRaw = inject(NavContextKey, null);
// 如果是computed，需要解包
const navContext = computed(() => {
    if (navContextRaw && typeof navContextRaw === 'object' && 'value' in navContextRaw) {
        return (navContextRaw as any).value;
    }
    return navContextRaw;
});
const itemRef = ref<any>(null);
const clsPrefix = `${cssClasses.PREFIX}-item`;

const _invokeContextFunc = (funcName: string, ...args: any[]) => {
    const ctx = navContext.value;
    if (funcName && ctx && typeof ctx[funcName] === 'function') {
        return ctx[funcName](...args);
    }
    return null;
};

const adapter: ItemAdapter<any, any> = {
    // Base adapter methods
    getContext: () => ({}),
    getContexts: () => ({}),
    getProp: (key: string) => (props as any)[key],
    getProps: () => props,
    getState: (key: string) => undefined,
    getStates: () => ({}),
    setState: () => {},

    getCache: (key: string) => undefined,
    getCaches: () => ({}),
    setCache: (key: string, value: any) => {},
    stopPropagation: (e: any) => {
        e.stopPropagation();
    },
    persistEvent: (e: any) => {},
    // Item specific methods
    cloneDeep,
    updateTooltipShow: (tooltipShow: boolean) => {
        // Not implemented in Vue version yet
    },
    updateSelected: (_selected: boolean) => _invokeContextFunc('updateSelectedKeys', [props.itemKey]),
    updateGlobalSelectedKeys: (keys: any[]) => _invokeContextFunc('updateSelectedKeys', [...keys]),
    getSelectedKeys: () => navContext.value?.selectedKeys || [],
    getSelectedKeysIsControlled: () => Boolean(navContext.value?.selectedKeysIsControlled),
    notifyGlobalOnSelect: (...args) => _invokeContextFunc('onSelect', ...args),
    notifyGlobalOnClick: (...args) => _invokeContextFunc('onClick', ...args),
    notifyClick: (...args) => emit('click', ...args),
    notifyMouseEnter: (...args) => emit('mouseenter', ...args),
    notifyMouseLeave: (...args) => emit('mouseleave', ...args),
    getIsCollapsed: () => props.isCollapsed || Boolean(navContext.value?.isCollapsed) || false,
    getSelected: () =>
        Boolean(navContext.value?.selectedKeys && navContext.value.selectedKeys.includes(props.itemKey as any)),
    getIsOpen: () => Boolean(navContext.value?.openKeys && navContext.value.openKeys.includes(props.itemKey as any)),
};

const { foundation } = useFoundation(ItemFoundation, adapter, {});

const handleClick = (e: MouseEvent) => {
    foundation.handleClick(e);
};

const handleKeyPress = (e: KeyboardEvent) => {
    foundation.handleKeyPress(e);
};

const handleMouseEnter = (e: MouseEvent) => {
    emit('mouseenter', e);
};

const handleMouseLeave = (e: MouseEvent) => {
    emit('mouseleave', e);
};

const setItemRef = (ref: HTMLLIElement | null) => {
    if (ref) {
        const actualRef = (ref as any)?.$el || ref;
        itemRef.value = actualRef;
        if (props.forwardRef) {
            props.forwardRef(actualRef);
        }
    }
};

const isCollapsed = computed(() => adapter.getIsCollapsed());
const selected = computed(() => adapter.getSelected());
const isInSubNav = computed(() => Boolean(navContext.value && (navContext.value as any).isInSubNav));

const renderIcon = (icon: any, pos: string, isToggleIcon = false, key: number | string = 0) => {
    if (props.isSubNav) {
        return null;
    }

    const ctx = navContext.value;
    if (!icon && ctx?.mode === strings.MODE_HORIZONTAL) {
        return null;
    }

    let iconSize = 'large';
    if (pos === strings.ICON_POS_RIGHT) {
        iconSize = 'default';
    }

    const className = classNames(`${clsPrefix}-icon`, {
        [`${clsPrefix}-icon-toggle-${ctx?.toggleIconPosition}`]: isToggleIcon,
        [`${clsPrefix}-icon-info`]: !isToggleIcon,
    });

    // 如果icon是组件，需要处理size属性 - 完全按照React版本的isSemiIcon判断
    let iconElem = null;
    if (icon) {
        if (isSemiIcon(icon)) {
            // 为Semi Icon添加size属性，类似React.cloneElement
            const iconProps = (icon as any).props || {};
            iconElem = h(icon, { size: iconProps.size || iconSize });
        } else {
            iconElem = icon;
        }
    }
    // 即使 icon 为 null，也要返回 <i> 元素作为占位符（用于缩进对齐）
    return h('i', { class: className, key }, iconElem);
};

const wrapTooltip = (node: any) => {
    const ctx = navContext.value;
    const hideDelay = props.tooltipHideDelay ?? ctx?.tooltipHideDelay ?? 100;
    const showDelay = props.tooltipShowDelay ?? ctx?.tooltipShowDelay ?? 0;

    return h(
        Tooltip,
        {
            content: props.text,
            wrapWhenSpecial: false,
            position: 'right',
            trigger: 'hover',
            mouseEnterDelay: showDelay,
            mouseLeaveDelay: hideDelay,
        },
        {
            default: () => node,
        }
    );
};

// 渲染itemChildren - 完全按照React版本
const renderItemChildren = computed(() => {
    // 检查是否有children插槽
    const hasChildren = Boolean(slots.default);

    if (hasChildren) {
        return slots.default?.();
    }

    // 没有children时，按照React版本的逻辑渲染
    const { text, icon, toggleIcon, indent, level = 0 } = props;
    const ctx = navContext.value;
    const { mode, limitIndent } = ctx || {};

    let placeholderIcons: any[] = [];
    if (mode === strings.MODE_VERTICAL && !limitIndent && !isCollapsed.value) {
        const iconAmount = icon && !indent ? level : level - 1;
        placeholderIcons = times(iconAmount, (index) => renderIcon(null, strings.ICON_POS_RIGHT, false, index));
    }

    const children: any[] = [
        ...placeholderIcons,
        // toggleIcon 只在 SubNav 中存在，普通 Item 不应该渲染
        toggleIcon &&
            ctx?.toggleIconPosition === strings.TOGGLE_ICON_LEFT &&
            renderIcon(toggleIcon, strings.ICON_POS_RIGHT, true, 'key-toggle-pos-right'),
        icon || indent || isInSubNav.value ? renderIcon(icon, strings.ICON_POS_LEFT, false, 'key-position-left') : null,
        !isNullOrUndefined(text) ? h('span', { class: `${cssClasses.PREFIX}-item-text` }, text) : '',
        toggleIcon &&
            ctx?.toggleIconPosition === strings.TOGGLE_ICON_RIGHT &&
            renderIcon(toggleIcon, strings.ICON_POS_RIGHT, true, 'key-toggle-pos-right'),
    ].filter(Boolean);

    // 如果有link，用<a>包裹
    if (typeof props.link === 'string') {
        return h(
            'a',
            {
                class: `${ctx?.prefixCls}-item-link`,
                href: props.link,
                tabIndex: -1,
                ...props.linkOptions,
            },
            children
        );
    }

    return children;
});

// 构建最终的item DOM - 使用 computed 确保正确的响应式更新
const ItemRenderer = computed(() => {
    const { className, style, disabled, link, linkOptions, level = 0, tabIndex } = props;
    const ctx = navContext.value;
    const { mode, prefixCls, limitIndent } = ctx || {};

    const itemChildren = renderItemChildren.value;

    let itemDom: any = null;

    // 如果isInSubNav且(collapsed或horizontal)，使用Dropdown.Item
    if (isInSubNav.value && (isCollapsed.value || mode === strings.MODE_HORIZONTAL)) {
        const popoverItemCls = classNames(
            {
                [clsPrefix]: true,
                [`${clsPrefix}-sub`]: props.isSubNav,
                [`${clsPrefix}-selected`]: selected.value,
                [`${clsPrefix}-collapsed`]: isCollapsed.value,
                [`${clsPrefix}-disabled`]: disabled,
            },
            props.class || props.className
        );

        itemDom = h(
            DropdownItem,
            {
                selected: selected.value,
                active: selected.value,
                class: popoverItemCls,
                onClick: handleClick,
                onMouseenter: handleMouseEnter,
                onMouseleave: handleMouseLeave,
                disabled: disabled,
                onKeydown: handleKeyPress,
            },
            {
                default: () => itemChildren,
            }
        );
    } else {
        // 否则使用<li>
        const popoverItemCls = classNames(
            className,
            {
                [`${clsPrefix}-normal`]: !props.isSubNav, // 只有非 SubNav 才添加 normal
                [clsPrefix]: true,
                [`${clsPrefix}-sub`]: props.isSubNav,
                [`${clsPrefix}-selected`]: selected.value && !props.isSubNav,
                [`${clsPrefix}-collapsed`]: isCollapsed.value,
                [`${clsPrefix}-disabled`]: disabled,
                [`${clsPrefix}-has-link`]: typeof link === 'string',
            },
            props.class
        );

        const ariaProps: any = {
            'aria-disabled': disabled,
        };
        if (props.isSubNav) {
            const isOpen = adapter.getIsOpen();
            ariaProps['aria-expanded'] = isOpen;
        }

        itemDom = h(
            'li',
            {
                role: props.isSubNav ? null : 'menuitem',
                tabIndex: props.isSubNav ? -1 : tabIndex,
                ...ariaProps,
                style: style || {},
                class: popoverItemCls,
                onClick: handleClick,
                onMouseenter: handleMouseEnter,
                onMouseleave: handleMouseLeave,
                onKeypress: handleKeyPress,
                // 使用data属性来标识元素，稍后通过DOM查询获取ref
                'data-nav-item-key': props.itemKey,
            },
            itemChildren
        );
    }

    // 根据条件wrapTooltip
    const shouldWrap =
        (isCollapsed.value && !isInSubNav.value && !props.isSubNav) ||
        (isCollapsed.value && props.isSubNav && disabled);
    if (shouldWrap) {
        itemDom = wrapTooltip(itemDom);
    }

    // 如果有renderWrapper，使用它
    if (ctx?.renderWrapper && typeof ctx.renderWrapper === 'function') {
        return ctx.renderWrapper({
            itemElement: itemDom,
            isSubNav: Boolean(props.isSubNav),
            isInSubNav: isInSubNav.value,
            props: props,
        });
    }

    return itemDom;
});

onMounted(() => {
    foundation.init();
    // 在mounted后通过DOM查询获取ref（用于forwardRef）
    nextTick(() => {
        if (props.forwardRef && props.itemKey) {
            const element = document.querySelector(`[data-nav-item-key="${props.itemKey}"]`) as HTMLLIElement;
            if (element) {
                itemRef.value = element;
                props.forwardRef(element);
            }
        }
    });
});

onBeforeUnmount(() => {
    foundation.destroy();
});

defineExpose({
    itemRef,
    ItemRenderer,
});
</script>

<template>
    <!-- 使用 computed VNode 渲染 -->
    <component :is="ItemRenderer" />
</template>
