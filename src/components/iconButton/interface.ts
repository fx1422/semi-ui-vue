import type { CSSProperties, Component, VNode } from 'vue';
import type { ButtonProps } from '../button/interface';
import type { IconSize } from '../icons';

export type HorizontalPaddingType = 'left' | 'right';

export interface IconButtonProps extends Omit<ButtonProps, 'icon' | 'iconPosition' | 'iconSize'> {
    icon?: Component | VNode | string;
    iconPosition?: 'left' | 'right';
    iconSize?: IconSize;
    iconStyle?: CSSProperties;
    loading?: boolean;
    theme?: ButtonProps['theme']; // 使用 ButtonProps 的 theme 类型（包含 'outline'）
    style?: CSSProperties;
    className?: string;
    disabled?: boolean;
    noHorizontalPadding?: boolean | HorizontalPaddingType | HorizontalPaddingType[];
    prefixCls?: string;
    contentClassName?: string;
}
