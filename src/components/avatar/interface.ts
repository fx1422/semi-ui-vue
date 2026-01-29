import { VNode, CSSProperties } from 'vue';

export type AvatarShape = 'circle' | 'square';
export type AvatarSize = 'extra-extra-small' | 'extra-small' | 'small' | 'default' | 'medium' | 'large' | 'extra-large';
export type AvatarColor =
    | 'amber'
    | 'blue'
    | 'cyan'
    | 'green'
    | 'grey'
    | 'indigo'
    | 'light-blue'
    | 'light-green'
    | 'lime'
    | 'orange'
    | 'pink'
    | 'purple'
    | 'red'
    | 'teal'
    | 'violet'
    | 'yellow';

export interface AvatarProps {
    color?: AvatarColor;
    shape?: AvatarShape;
    size?: AvatarSize | number;
    hoverMask?: string | VNode;
    src?: string;
    srcSet?: string;
    alt?: string;
    gap?: number;
    imgAttr?: Record<string, any>;
    bottomSlot?: {
        render?: () => VNode;
        shape?: 'circle' | 'square';
        text: VNode;
        bgColor: string;
        textColor: string;
        className: string;
        style?: CSSProperties;
    };
    topSlot?: {
        render?: () => VNode;
        gradientStart?: string;
        gradientEnd?: string;
        text: VNode;
        textColor: string;
        className: string;
        style?: CSSProperties;
    };
    border?:
        | {
              color?: string;
              motion?: boolean;
          }
        | boolean;
    contentMotion?: boolean;
    className?: string;
    style?: CSSProperties;
}

export type AvatarGroupShape = 'circle' | 'square';
export type AvatarGroupSize =
    | 'extra-extra-small'
    | 'extra-small'
    | 'small'
    | 'default'
    | 'medium'
    | 'large'
    | 'extra-large';
export type AvatarGroupOverlapFrom = 'start' | 'end';

export interface AvatarGroupProps {
    shape?: AvatarGroupShape;
    size?: AvatarGroupSize | number;
    overlapFrom?: AvatarGroupOverlapFrom;
    maxCount?: number;
    renderMore?: (restNumber?: number, restAvatars?: VNode[]) => VNode;
}
