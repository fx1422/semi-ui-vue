import type { CSSProperties } from 'vue';
export type Motion = boolean | (() => void) | Record<string, any>;

export interface Item {
    [x: string]: any;
    transform?: (value: any, text: string) => string;
    value: any;
    text?: string;
    disabled?: boolean;
}

export interface ScrollItemProps<T extends Item = Item> {
    mode?: string;
    cycled?: boolean;
    list?: T[];
    selectedIndex?: number;
    onSelect?: (data: T) => void;
    transform?: (value: any, text: string) => string;
    className?: string;
    motion?: Motion;
    style?: CSSProperties;
    type?: string | number;
    'aria-label'?: string;
}

export interface ScrollListProps {
    header?: any;
    footer?: any;
    bodyHeight?: number | string;
    prefixCls?: string;
    className?: string;
    style?: CSSProperties;
    'x-semi-header-alias'?: string;
    'x-semi-footer-alias'?: string;
}
