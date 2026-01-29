<template>
    <!-- 完全按照React版本的结构：NavItem包裹，内部有titleDiv和subUl -->
    <Item
        :style="style"
        :is-sub-nav="true"
        :item-key="itemKey"
        :forward-ref="setItemRef"
        :is-collapsed="navContext.value?.isCollapsed"
        :className="`${navContext.value?.prefixCls || cssClasses.PREFIX}-sub-wrap`"
        :disabled="disabled"
        :text="text"
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave"
    >
        <!-- 使用 component :is 渲染 VNode -->
        <component :is="finalTitleDiv" />
        <!-- SubNav内部需要提供isInSubNav: true的context，与React版本保持一致 -->
        <!-- 使用 Collapsible 组件包裹，实现展开/收起动画 -->
        <Collapsible
            v-if="shouldShowSubUl || navContext.value?.subNavMotion"
            :motion="navContext.value?.subNavMotion"
            :isOpen="shouldShowSubUl"
            :keepDOM="false"
            :fade="true"
        >
            <ul v-if="shouldShowSubUl" :class="subNavUlClass">
                <slot></slot>
            </ul>
        </Collapsible>
    </Item>
</template>

<script setup lang="ts">
import { computed, inject, ref, onMounted, onBeforeUnmount, h, provide, nextTick, useSlots } from 'vue';
import classNames from 'classnames';
import { cssClasses, strings } from '@douyinfe/semi-foundation/navigation/constants';
import SubNavFoundation, { SubNavAdapter } from '@douyinfe/semi-foundation/navigation/subNavFoundation';
import isNullOrUndefined from '@douyinfe/semi-foundation/utils/isNullOrUndefined';
import { useFoundation, isSemiIcon } from '../_utils';
import type { SubNavProps } from './interface';
import { NavContextKey, type NavContextValue } from './context';
import Item from './Item.vue';
import Dropdown from '../dropdown';
import DropdownMenu from '../dropdown/DropdownMenu.vue';
import Collapsible from '../collapsible';
import CSSAnimation from '../_cssAnimation';
import { IconChevronDown, IconChevronRight } from '../icons';
import { times } from 'lodash-es';

defineOptions({
    name: 'SubNav',
});

const props = withDefaults(defineProps<SubNavProps & { style?: any }>(), {
    level: 0,
    indent: false,
    isCollapsed: false,
    isOpen: false,
    maxHeight: 999,
    disabled: false,
});

const emit = defineEmits<{
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
const titleRef = ref<HTMLDivElement | null>(null);
const itemRef = ref<HTMLLIElement | null>(null);

const _invokeContextFunc = (funcName: string, ...args: any[]) => {
    const ctx = navContext.value;
    if (funcName && ctx && typeof ctx[funcName] === 'function') {
        return ctx[funcName](...args);
    }
    return null;
};

const adapter: SubNavAdapter<any, any> = {
    updateIsHovered: (isHovered: boolean) => {
        // State management if needed
    },
    getOpenKeys: () => navContext.value?.openKeys || [],
    getOpenKeysIsControlled: () => Boolean(navContext.value?.openKeysIsControlled),
    getCanUpdateOpenKeys: () => Boolean(navContext.value?.canUpdateOpenKeys),
    updateOpen: (isOpen: boolean) => {
        if (props.itemKey !== undefined && props.itemKey !== null) {
            _invokeContextFunc(isOpen ? 'addOpenKeys' : 'removeOpenKeys', props.itemKey);
        }
    },
    notifyGlobalOpenChange: (...args) => _invokeContextFunc('onOpenChange', ...args),
    notifyGlobalOnSelect: (...args) => _invokeContextFunc('onSelect', ...args),
    notifyGlobalOnClick: (...args) => _invokeContextFunc('onClick', ...args),
    getIsSelected: (itemKey: any) => {
        const key = itemKey !== undefined ? itemKey : props.itemKey;
        return Boolean(!isNullOrUndefined(key) && navContext.value?.selectedKeys?.includes(String(key)));
    },
    getIsOpen: () => {
        if (!navContext.value?.openKeys || !props.itemKey) {
            return false;
        }
        // 确保类型一致：将 itemKey 转为字符串再比较
        const itemKeyStr = String(props.itemKey);
        return navContext.value.openKeys.some((key) => String(key) === itemKeyStr);
    },
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
};

const { foundation } = useFoundation(SubNavFoundation, adapter, {});

const handleClick = (e: MouseEvent) => {
    // 如果titleRef还没有设置，尝试获取
    if (!titleRef.value && props.itemKey) {
        const element = document.querySelector(`[data-nav-sub-title-key="${props.itemKey}"]`) as HTMLDivElement;
        if (element) {
            titleRef.value = element;
        }
    }
    foundation.handleClick(e, titleRef.value);
};

const handleKeyPress = (e: KeyboardEvent) => {
    foundation.handleKeyPress(e, titleRef.value);
};

const handleDropdownVisible = (visible: boolean) => {
    foundation.handleDropdownVisibleChange(visible);
};

const handleMouseEnter = (e: MouseEvent) => {
    emit('mouseenter', e);
};

const handleMouseLeave = (e: MouseEvent) => {
    emit('mouseleave', e);
};

const setItemRef = (ref: HTMLLIElement) => {
    if (ref) {
        itemRef.value = ref;
    }
};

const setTitleRef = (ref: HTMLDivElement) => {
    if (ref) {
        titleRef.value = ref;
    }
};

const isOpen = computed(() => adapter.getIsOpen());
const isInSubNav = computed(() => Boolean(navContext.value && (navContext.value as any).isInSubNav));

// renderIcon - 完全按照React版本（支持CSSAnimation）
const renderIcon = (icon: any, pos: string, withTransition = false, isToggleIcon = false, key: string | number = 0) => {
    const iconSize = pos === strings.ICON_POS_RIGHT ? 'default' : 'large';

    const ctx = navContext.value;
    const prefixCls = ctx?.prefixCls;
    const className = classNames(`${prefixCls}-item-icon`, {
        [`${prefixCls}-item-icon-toggle-${ctx?.toggleIconPosition}`]: isToggleIcon,
        [`${prefixCls}-item-icon-info`]: !isToggleIcon,
    });

    let iconElem = null;
    if (icon) {
        // 使用统一的 isSemiIcon 函数判断（支持 markRaw 包装的组件）
        const isIconComponent = isSemiIcon(icon);

        if (isIconComponent) {
            // 如果需要动画
            if (withTransition) {
                const animationState = isOpen.value ? 'enter' : 'leave';
                const startClassName = `${cssClasses.PREFIX}-icon-rotate-${isOpen.value ? '180' : '0'}`;

                // 使用 CSSAnimation 包裹
                iconElem = h(
                    CSSAnimation,
                    {
                        animationState,
                        startClassName,
                    },
                    {
                        default: ({ animationClassName }: any) => {
                            // 确保类名不会重复：如果 animationClassName 是字符串，直接使用；如果是数组，使用 classNames 合并
                            const finalClass =
                                typeof animationClassName === 'string'
                                    ? animationClassName
                                    : classNames(animationClassName);
                            return h(icon, {
                                size: iconSize,
                                class: finalClass || '',
                            });
                        },
                    }
                );
            } else {
                // 不需要动画
                iconElem = h(icon, { size: iconSize });
            }
        } else {
            iconElem = icon;
        }
    }

    return h('i', { key, class: className }, iconElem);
};

// renderTitleDiv - 完全按照React版本
const renderTitleDiv = computed(() => {
    const { text, icon, itemKey, indent, disabled, level = 0, expandIcon } = props;
    const ctx = navContext.value;
    const { mode, isCollapsed, prefixCls, subNavMotion, limitIndent, selectedKeys } = ctx || {};

    // 确保响应式追踪 selectedKeys
    const isSelected = Boolean(!isNullOrUndefined(itemKey) && selectedKeys?.includes(String(itemKey)));

    const titleCls = classNames(`${prefixCls}-sub-title`, {
        [`${prefixCls}-sub-title-selected`]: isSelected,
        [`${prefixCls}-sub-title-disabled`]: disabled,
    });

    let withTransition = false;
    let toggleIconType: any = null;

    if (isCollapsed) {
        if (isInSubNav.value) {
            toggleIconType = IconChevronRight;
        } else {
            toggleIconType = null;
        }
    } else if (mode === strings.MODE_HORIZONTAL) {
        if (isInSubNav.value) {
            toggleIconType = IconChevronRight;
        } else {
            toggleIconType = expandIcon || IconChevronDown;
        }
    } else {
        if (subNavMotion) {
            withTransition = true;
        }
        toggleIconType = expandIcon || IconChevronDown;
    }

    let placeholderIcons: any[] = [];
    if (mode === strings.MODE_VERTICAL && !limitIndent && !isCollapsed) {
        const iconAmount = icon && !indent ? level : level - 1;
        placeholderIcons = times(iconAmount, (index) => renderIcon(null, strings.ICON_POS_RIGHT, false, false, index));
    }

    const isIconChevronRightShow =
        (!isCollapsed && isInSubNav.value && mode === strings.MODE_HORIZONTAL) || (isCollapsed && isInSubNav.value);

    const children = [
        ...placeholderIcons,
        ctx?.toggleIconPosition === strings.TOGGLE_ICON_LEFT &&
            renderIcon(toggleIconType, strings.ICON_POS_RIGHT, withTransition, true, 'key-toggle-position-left'),
        icon || indent || (isInSubNav.value && mode !== strings.MODE_HORIZONTAL)
            ? renderIcon(icon, strings.ICON_POS_LEFT, false, false, 'key-inSubNav-position-left')
            : null,
        h('span', { class: `${prefixCls}-item-text` }, text),
        ctx?.toggleIconPosition === strings.TOGGLE_ICON_RIGHT &&
            renderIcon(toggleIconType, strings.ICON_POS_RIGHT, withTransition, true, 'key-toggle-position-right'),
    ].filter(Boolean); // 过滤掉 false 和 null

    return h(
        'div',
        {
            role: 'menuitem',
            tabIndex: isIconChevronRightShow ? -1 : 0,
            class: titleCls,
            onClick: handleClick,
            onKeypress: handleKeyPress,
            'aria-expanded': isOpen.value ? 'true' : 'false',
            // 使用data属性来标识元素，稍后通过DOM查询获取ref
            'data-nav-sub-title-key': itemKey,
        },
        [h('div', { class: `${prefixCls}-item-inner` }, children)]
    );
});

// wrapDropdown - 完全按照React版本
const wrapDropdown = (elem: any) => {
    const { dropdownStyle, disabled, subDropdownProps, dropdownProps: userDropdownProps } = props;
    const ctx = navContext.value;
    const { mode, isCollapsed, subNavCloseDelay, subNavOpenDelay, prefixCls, getPopupContainer } = ctx || {};

    const openKeysIsControlled = adapter.getOpenKeysIsControlled();

    const subNavCls = classNames({
        [`${prefixCls}-popover`]: isCollapsed,
    });

    const dropdownProps: any = {
        trigger: 'hover',
        style: dropdownStyle,
    };

    if (openKeysIsControlled) {
        dropdownProps.trigger = 'custom';
        dropdownProps.visible = isOpen.value;
    }

    if (getPopupContainer) {
        dropdownProps.getPopupContainer = getPopupContainer;
    }

    if (isCollapsed || mode === strings.MODE_HORIZONTAL) {
        if (!disabled) {
            // 完全按照React版本：Dropdown包裹，使用render slot渲染DropdownMenu
            const menuSlot = slots.default ? () => h(DropdownMenu, {}, () => slots.default?.() || []) : undefined;
            return h(
                Dropdown,
                {
                    class: subNavCls,
                    position: mode === strings.MODE_HORIZONTAL && !isInSubNav.value ? 'bottomLeft' : 'rightTop',
                    mouseEnterDelay: subNavOpenDelay,
                    mouseLeaveDelay: subNavCloseDelay,
                    onVisibleChange: handleDropdownVisible,
                    ...(userDropdownProps || subDropdownProps),
                    ...dropdownProps,
                },
                {
                    default: () => elem,
                    ...(menuSlot ? { render: menuSlot } : {}),
                }
            );
        }
    }

    return elem;
};

// finalTitleDiv - 根据条件wrapDropdown
const finalTitleDiv = computed(() => {
    const titleDiv = renderTitleDiv.value;
    const ctx = navContext.value;
    const { mode, isCollapsed } = ctx || {};

    if (isCollapsed || mode === strings.MODE_HORIZONTAL) {
        return wrapDropdown(titleDiv);
    }

    return titleDiv;
});

// RenderTitle 已移除，直接使用 finalTitleDiv computed

// shouldShowSubUl - 判断是否显示子导航ul
const shouldShowSubUl = computed(() => {
    const ctx = navContext.value;
    const { isCollapsed, mode } = ctx || {};
    const isHorizontal = mode === strings.MODE_HORIZONTAL;
    return isOpen.value && !isCollapsed && !isHorizontal;
});

// subNavUlClass - 子导航ul的class
const subNavUlClass = computed(() => {
    const ctx = navContext.value;
    const { isCollapsed, mode, prefixCls } = ctx || {};
    const isHorizontal = mode === strings.MODE_HORIZONTAL;

    return classNames(`${prefixCls}-sub`, {
        [`${prefixCls}-sub-open`]: isOpen.value,
        [`${prefixCls}-sub-popover`]: isCollapsed || isHorizontal,
    });
});

// Provide updated context for child items - 完全按照React版本的NavContext.Provider
provide(
    NavContextKey,
    computed(() => ({
        ...navContext.value,
        isInSubNav: true,
    })) as any
);

onMounted(() => {
    foundation.init();
    // 在mounted后通过DOM查询获取ref
    nextTick(() => {
        if (props.itemKey) {
            const titleElement = document.querySelector(
                `[data-nav-sub-title-key="${props.itemKey}"]`
            ) as HTMLDivElement;
            if (titleElement) {
                titleRef.value = titleElement;
            }
        }
    });
});

onBeforeUnmount(() => {
    foundation.destroy();
});

defineExpose({
    titleRef,
    itemRef,
});
</script>
