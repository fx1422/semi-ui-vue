import { InjectionKey } from 'vue';
import type { ItemKey, Mode, NavItemProps, SubNavProps, OnSelectedData } from './interface';

export interface NavContextValue {
    subNavCloseDelay?: number;
    subNavOpenDelay?: number;
    subNavMotion?: boolean;
    tooltipShowDelay?: number;
    tooltipHideDelay?: number;
    openKeys?: ItemKey[];
    openKeysIsControlled?: boolean;
    canUpdateOpenKeys?: boolean;
    selectedKeys?: ItemKey[];
    selectedKeysIsControlled?: boolean;
    isCollapsed?: boolean;
    mode?: Mode;
    prefixCls?: string;
    toggleIconPosition?: string;
    limitIndent?: boolean;
    isInSubNav?: boolean;
    locale?: any;
    getPopupContainer?: () => HTMLElement;

    // Functions
    onCollapseChange?: (isCollapsed?: boolean) => void;
    onSelect?: (data: OnSelectedData) => void;
    onOpenChange?: (data: { itemKey?: ItemKey; openKeys?: ItemKey[]; domEvent?: MouseEvent; isOpen?: boolean }) => void;
    onClick?: (data: { itemKey?: ItemKey; domEvent?: MouseEvent; isOpen?: boolean }) => void;
    updateOpenKeys?: (openKeys: ItemKey[]) => void;
    addOpenKeys?: (...keys: ItemKey[]) => void;
    removeOpenKeys?: (...keys: ItemKey[]) => void;
    updateSelectedKeys?: (selectedKeys: ItemKey[], includeParentKeys?: boolean) => void;
    addSelectedKeys?: (...keys: ItemKey[]) => void;
    removeSelectedKeys?: (...keys: ItemKey[]) => void;
    renderWrapper?: (args: {
        itemElement: any;
        isSubNav: boolean;
        isInSubNav: boolean;
        props: NavItemProps | SubNavProps;
    }) => any;
}

export const NavContextKey: InjectionKey<NavContextValue> = Symbol('NavContext');
