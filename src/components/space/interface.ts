import type { CSSProperties } from 'vue';

export type Align = 'start' | 'center' | 'end' | 'baseline';
export type Spacing = 'loose' | 'medium' | 'tight' | number;

export interface SpaceProps {
    wrap?: boolean;
    align?: Align;
    vertical?: boolean;
    spacing?: Spacing | Spacing[];
    style?: CSSProperties;
    className?: string;
}
