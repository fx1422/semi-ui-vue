import type { CSSProperties, VNode } from 'vue';

export type StrokeSet = { percent: number; color: string };
export type StrokeArr = Array<StrokeSet>;

export interface ProgressProps {
    'aria-label'?: string;
    'aria-labelledby'?: string;
    'aria-valuetext'?: string;
    className?: string;
    direction?: 'horizontal' | 'vertical';
    format?: (percent: number) => string | VNode;
    id?: string;
    motion?: boolean;
    orbitStroke?: string;
    percent?: number;
    showInfo?: boolean;
    size?: 'default' | 'small' | 'large';
    stroke?: string | StrokeArr;
    strokeGradient?: boolean;
    strokeLinecap?: 'round' | 'square';
    strokeWidth?: number;
    style?: CSSProperties;
    type?: 'line' | 'circle';
    width?: number;
}
