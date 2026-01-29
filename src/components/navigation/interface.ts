import type { CSSProperties, Component, VNode } from 'vue';
import type { DropdownProps } from '../dropdown/interface';

export type Mode = 'vertical' | 'horizontal';

export type ItemKey = string | number;

export interface OnSelectedData {
    itemKey: ItemKey;
    selectedKeys: ItemKey[];
    selectedItems: (NavItemProps | SubNavProps)[];
    domEvent: MouseEvent;
    isOpen: boolean;
}

export interface SubNavPropsWithItems extends SubNavProps {
    items?: (SubNavPropsWithItems | string)[];
}

export interface NavItemPropsWithItems extends NavItemProps {
    items?: (NavItemPropsWithItems | string)[];
}

export type NavItems = (string | SubNavPropsWithItems | NavItemPropsWithItems)[];

export interface NavProps {
    bodyStyle?: CSSProperties;
    className?: string;
    style?: CSSProperties;
    defaultIsCollapsed?: boolean;
    defaultOpenKeys?: ItemKey[];
    defaultSelectedKeys?: ItemKey[];
    subDropdownProps?: DropdownProps;
    expandIcon?: any; // VNode or Component
    collapseIcon?: any; // VNode or Component (预留，当前未使用)
    footer?: any; // VNode or NavFooterProps
    header?: any; // VNode or NavHeaderProps
    isCollapsed?: boolean;
    items?: NavItems;
    limitIndent?: boolean;
    mode?: Mode;
    multiple?: boolean;
    openKeys?: ItemKey[];
    prefixCls?: string;
    selectedKeys?: ItemKey[];
    subNavCloseDelay?: number;
    subNavMotion?: boolean | object | ((isOpen: boolean) => boolean | object);
    subNavOpenDelay?: number;
    toggleIconPosition?: string;
    tooltipHideDelay?: number;
    tooltipShowDelay?: number;
    getPopupContainer?: () => HTMLElement;
    renderWrapper?: (args: {
        itemElement: VNode;
        isSubNav: boolean;
        isInSubNav: boolean;
        props: NavItemProps | SubNavProps;
    }) => VNode | Component;
}

export interface NavState {
    isCollapsed: boolean;
    openKeys: ItemKey[];
    items: any[];
    itemKeysMap: { [itemKey: string]: ItemKey[] };
    selectedKeys: ItemKey[];
}

export interface NavItemProps {
    className?: string;
    disabled?: boolean;
    icon?: any; // VNode or Component
    itemKey?: ItemKey;
    level?: number;
    link?: string;
    linkOptions?: any;
    style?: CSSProperties;
    tabIndex?: number;
    text?: any; // string or VNode
    tooltipHideDelay?: number;
    tooltipShowDelay?: number;
    // Events (Vue 使用 @click, @mouseenter, @mouseleave 绑定)
    // onClick?: (data: SelectedData) => void;
    // onMouseEnter?: (e: MouseEvent) => void;
    // onMouseLeave?: (e: MouseEvent) => void;
}

export interface SelectedData {
    itemKey?: ItemKey;
    domEvent?: MouseEvent;
    isOpen?: boolean;
    text?: any; // string or VNode
}

export interface SubNavProps {
    className?: string;
    disabled?: boolean;
    dropdownStyle?: CSSProperties;
    icon?: any; // VNode or Component
    indent?: boolean | number;
    isCollapsed?: boolean;
    isOpen?: boolean;
    itemKey?: string | number;
    level?: number;
    maxHeight?: number;
    style?: CSSProperties;
    text?: any; // string or VNode
    expandIcon?: any; // VNode or Component
    dropdownProps?: DropdownProps;
    subDropdownProps?: DropdownProps;
    // Events (Vue 使用 @mouseenter, @mouseleave 绑定)
    // onMouseEnter?: (e: MouseEvent) => void;
    // onMouseLeave?: (e: MouseEvent) => void;
}

export interface NavHeaderProps {
    className?: string;
    logo?: any; // VNode or Component
    prefixCls?: string;
    style?: CSSProperties;
    text?: any; // string or VNode
    link?: string;
    linkOptions?: any;
}

export interface NavFooterProps {
    className?: string;
    collapseButton?: boolean | ((collapsed: boolean) => any);
    collapseText?: (collapsed: boolean) => any;
    style?: CSSProperties;
}
