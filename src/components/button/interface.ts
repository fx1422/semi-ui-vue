import type { CSSProperties, Component, VNode } from 'vue';

export type HtmlType = 'button' | 'reset' | 'submit';
export type Size = 'default' | 'small' | 'large';
export type Theme = 'solid' | 'borderless' | 'light' | 'outline';
export type Type = 'primary' | 'secondary' | 'tertiary' | 'warning' | 'danger';
export type IconSize = 'extra-small' | 'small' | 'default' | 'large' | 'extra-large';
export type HorizontalPaddingType = 'left' | 'right';

// ButtonGroup
export type GroupTheme = 'solid' | 'borderless' | 'light' | 'outline';

export interface ButtonGroupProps {
    disabled?: boolean;
    type?: Type;
    size?: Size;
    theme?: GroupTheme;
    className?: string;
    style?: CSSProperties;
    'aria-label'?: string;
}

export interface ButtonProps {
    id?: string;
    block?: boolean;
    circle?: boolean;
    disabled?: boolean;
    className?: string;
    icon?: Component | VNode | string;
    iconPosition?: 'left' | 'right';
    iconSize?: IconSize;
    iconStyle?: CSSProperties;
    loading?: boolean;
    htmlType?: HtmlType;
    size?: Size;
    style?: CSSProperties;
    theme?: Theme;
    type?: Type;
    prefixCls?: string;
    contentClassName?: string;
    noHorizontalPadding?: boolean | HorizontalPaddingType | HorizontalPaddingType[];
}
