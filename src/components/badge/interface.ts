import { CSSProperties, VNode } from 'vue';

export type BadgeType = 'primary' | 'secondary' | 'tertiary' | 'danger' | 'warning' | 'success';
export type BadgeTheme = 'solid' | 'light' | 'inverted';
export type BadgePosition = 'leftTop' | 'leftBottom' | 'rightTop' | 'rightBottom';

export interface BadgeProps {
    /** Badge content, can be a number or custom content */
    count?: number | string | VNode;
    /** Whether to display as a dot */
    dot?: boolean;
    /** Badge type */
    type?: BadgeType;
    /** Badge theme */
    theme?: BadgeTheme;
    /** Badge position */
    position?: BadgePosition;
    /** Max count to display, will show ${overflowCount}+ when exceeded */
    overflowCount?: number;
    /** Badge style */
    style?: CSSProperties;
    /** Class name */
    className?: string;
    /** Class name for count element */
    countClassName?: string;
    /** Style for count element */
    countStyle?: CSSProperties;
}
