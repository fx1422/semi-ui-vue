import { CSSProperties, VNode, Component } from 'vue';

export interface RatingProps {
    'aria-describedby'?: string;
    'aria-errormessage'?: string;
    'aria-invalid'?: boolean;
    'aria-label'?: string;
    'aria-labelledby'?: string;
    'aria-required'?: boolean;
    disabled?: boolean;
    value?: number;
    defaultValue?: number;
    count?: number;
    allowHalf?: boolean;
    allowClear?: boolean;
    style?: CSSProperties;
    prefixCls?: string;
    className?: string;
    character?: Component | VNode | string;
    tabIndex?: number;
    autoFocus?: boolean;
    size?: 'small' | 'default' | number;
    tooltips?: string[];
    id?: string;
    preventScroll?: boolean;
}

export interface RatingItemProps {
    value: number;
    index: number;
    prefixCls: string;
    allowHalf: boolean;
    character?: Component | VNode | string;
    focused: boolean;
    disabled: boolean;
    count: number;
    ariaLabelPrefix: string;
    size: number | 'default' | 'small';
    'aria-describedby'?: string;
    preventScroll?: boolean;
}
