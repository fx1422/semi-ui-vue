import { CSSProperties, VNode } from 'vue';

export type Breakpoint = 'xxl' | 'xl' | 'lg' | 'md' | 'sm' | 'xs';
export type Gutter = number | Partial<Record<Breakpoint, number>>;

export interface RowProps {
    type?: 'flex';
    align?: 'top' | 'middle' | 'bottom';
    justify?: 'start' | 'end' | 'center' | 'space-around' | 'space-between';
    className?: string;
    style?: CSSProperties;
    gutter?: Gutter | [Gutter, Gutter];
    prefixCls?: string;
}

export interface ColSize {
    span?: number;
    order?: number;
    offset?: number;
    push?: number;
    pull?: number;
}

export interface ColProps {
    span?: number;
    order?: number;
    offset?: number;
    push?: number;
    pull?: number;
    className?: string;
    prefixCls?: string;
    style?: CSSProperties;
    xs?: number | ColSize;
    sm?: number | ColSize;
    md?: number | ColSize;
    lg?: number | ColSize;
    xl?: number | ColSize;
    xxl?: number | ColSize;
}
