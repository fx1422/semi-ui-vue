import type { CSSProperties } from 'vue';

export type DescriptionsAlign = 'center' | 'justify' | 'left' | 'plain';
export type DescriptionsLayout = 'horizontal' | 'vertical';
export type DescriptionsSize = 'small' | 'medium' | 'large';

export interface DescriptionsData {
    key?: any;
    value?: any;
    hidden?: boolean;
    span?: number;
    className?: string;
    style?: CSSProperties;
}

export interface DescriptionsProps {
    align?: DescriptionsAlign;
    row?: boolean;
    size?: DescriptionsSize;
    style?: CSSProperties;
    className?: string;
    children?: any;
    layout?: DescriptionsLayout;
    column?: number;
}

export interface DescriptionsItemProps {
    hidden?: boolean;
    className?: string;
    children?: any;
    style?: CSSProperties;
    itemKey?: any;
    span?: number;
}

export interface DescriptionsContextValue {
    align?: DescriptionsAlign;
    layout?: DescriptionsLayout;
}
