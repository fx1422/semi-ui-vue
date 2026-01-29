import { CSSProperties, VNode, Component } from 'vue';

export type TagColor =
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
    | 'yellow'
    | 'white';

export type TagType = 'ghost' | 'solid' | 'light';
export type TagSize = 'default' | 'small' | 'large';
export type AvatarShape = 'circle' | 'square';
export type TagShape = 'circle' | 'square';

export interface TagProps {
    tagKey?: string | number;
    size?: TagSize;
    color?: TagColor;
    type?: TagType;
    closable?: boolean;
    visible?: boolean;
    prefixIcon?: VNode | Component;
    suffixIcon?: VNode | Component;
    style?: CSSProperties;
    className?: string;
    avatarSrc?: string;
    avatarShape?: AvatarShape;
    shape?: TagShape;
    'aria-label'?: string;
    tabIndex?: number;
}
