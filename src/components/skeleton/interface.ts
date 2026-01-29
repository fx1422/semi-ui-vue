import { CSSProperties, VNode } from 'vue';

export interface SkeletonProps {
    active?: boolean;
    className?: string;
    loading?: boolean;
    placeholder?: VNode;
    style?: CSSProperties;
}

export interface BasicProps {
    prefixCls?: string;
    className?: string;
    style?: CSSProperties;
    type?: string;
}

export interface ParagraphProps extends BasicProps {
    rows?: number;
}

export interface AvatarProps extends BasicProps {
    size?: 'extra-extra-small' | 'extra-small' | 'small' | 'default' | 'medium' | 'large' | 'extra-large';
    shape?: 'circle' | 'square';
}

export type GenericProps = BasicProps & AvatarProps;
