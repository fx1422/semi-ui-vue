import type { CSSProperties, Component, VNode } from 'vue';
import type { TooltipProps, Position, Trigger } from '../tooltip/interface';

export type { Position, Trigger };

export type Type = 'primary' | 'secondary' | 'tertiary' | 'warning' | 'danger';

export interface DropdownItemProps {
    disabled?: boolean;
    selected?: boolean;
    className?: string;
    style?: CSSProperties;
    type?: Type;
    active?: boolean;
    icon?: VNode | Component | string;
    showTick?: boolean;
    hover?: boolean;
    onClick?: (e: MouseEvent) => void;
    onMouseEnter?: (e: MouseEvent) => void;
    onMouseLeave?: (e: MouseEvent) => void;
    onContextMenu?: (e: MouseEvent) => void;
    onKeyDown?: (e: KeyboardEvent) => void;
    forwardRef?: (ele: HTMLLIElement) => void;
}

export interface DropdownDividerProps {
    className?: string;
    style?: CSSProperties;
}

export interface DropdownTitleProps {
    className?: string;
    style?: CSSProperties;
}

export interface DropdownMenuProps {
    className?: string;
    style?: CSSProperties;
}

export interface DropDownMenuItemItem extends DropdownItemProps {
    node: 'item';
    name?: string;
}

export interface DropDownMenuItemDivider extends DropdownDividerProps {
    node: 'divider';
}

export interface DropDownMenuItemTitle extends DropdownTitleProps {
    node: 'title';
    name?: string;
}

export type DropDownMenuItem = DropDownMenuItemItem | DropDownMenuItemDivider | DropDownMenuItemTitle;

export interface DropdownProps extends Omit<TooltipProps, 'content'> {
    render?: VNode | Component;
    visible?: boolean;
    position?: Position;
    getPopupContainer?: () => HTMLElement;
    mouseEnterDelay?: number;
    mouseLeaveDelay?: number;
    menu?: DropDownMenuItem[];
    trigger?: Trigger;
    zIndex?: number;
    motion?: boolean;
    className?: string;
    contentClassName?: string | string[];
    style?: CSSProperties;
    rePosKey?: string | number;
    showTick?: boolean;
    closeOnEsc?: boolean;
}

export interface DropdownContextType {
    level?: number;
    showTick?: boolean;
    trigger?: Trigger;
}
