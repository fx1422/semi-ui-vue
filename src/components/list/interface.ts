import type { CSSProperties, VNode } from 'vue';

export type ListLayout = 'vertical' | 'horizontal';
export type ListSize = 'small' | 'large' | 'default';
export type ItemAlign = 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch';

export interface Grid {
    gutter?: number;
    column?: number;
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    xxl?: number;
    align?: string;
    justify?: string;
    type?: string;
}

export interface ListProps<T = any> {
    style?: CSSProperties;
    className?: string;
    bordered?: boolean;
    footer?: any; // VNode or string
    header?: any; // VNode or string
    layout?: ListLayout;
    size?: ListSize;
    split?: boolean;
    emptyContent?: any; // VNode or string
    dataSource?: T[];
    renderItem?: (item: T, ind: number) => VNode;
    grid?: Grid;
    loading?: boolean;
    loadMore?: any; // VNode or string
}

export interface ListItemProps {
    extra?: any; // VNode or string
    header?: any; // VNode or string
    main?: any; // VNode or string
    align?: ItemAlign;
    className?: string;
    style?: CSSProperties;
    onClick?: (e: MouseEvent) => void;
    onRightClick?: (e: MouseEvent) => void;
    onMouseEnter?: (e: MouseEvent) => void;
    onMouseLeave?: (e: MouseEvent) => void;
}
