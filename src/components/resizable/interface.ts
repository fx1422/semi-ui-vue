import type { VNode, CSSProperties } from 'vue';
import type {
    Direction,
    Size,
    Enable,
    ResizeStartCallback,
    ResizeCallback,
    HandleClassName,
} from '@douyinfe/semi-foundation/resizable/types';

export interface HandleComponent {
    top?: VNode | string;
    right?: VNode | string;
    bottom?: VNode | string;
    left?: VNode | string;
    topRight?: VNode | string;
    bottomRight?: VNode | string;
    bottomLeft?: VNode | string;
    topLeft?: VNode | string;
}

export interface HandleStyle {
    top?: CSSProperties;
    right?: CSSProperties;
    bottom?: CSSProperties;
    left?: CSSProperties;
    topRight?: CSSProperties;
    bottomRight?: CSSProperties;
    bottomLeft?: CSSProperties;
    topLeft?: CSSProperties;
}

export interface ResizableProps {
    style?: CSSProperties;
    className?: string;
    grid?: [number, number] | number;
    snap?: {
        x?: number[];
        y?: number[];
    };
    snapGap?: number;
    boundElement?: 'parent' | 'window' | HTMLElement;
    boundsByDirection?: boolean;
    size?: Size;
    minWidth?: string | number;
    minHeight?: string | number;
    maxWidth?: string | number;
    maxHeight?: string | number;
    lockAspectRatio?: boolean | number;
    lockAspectRatioExtraWidth?: number;
    lockAspectRatioExtraHeight?: number;
    enable?: Enable | false;
    handleStyle?: HandleStyle;
    handleClass?: HandleClassName;
    handleWrapperStyle?: CSSProperties;
    handleWrapperClass?: string;
    handleNode?: HandleComponent;
    defaultSize?: Size;
    scale?: number;
    ratio?: number | [number, number];
    onResizeStart?: ResizeStartCallback;
    onChange?: ResizeCallback;
    onResizeEnd?: ResizeCallback;
}

export interface ResizableState {
    isResizing: boolean;
    direction: Direction;
    original: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    width: number | string;
    height: number | string;
    backgroundStyle: CSSProperties;
    flexBasis?: string | number;
}

export interface ResizableHandlerProps {
    direction?: Direction;
    onResizeStart?: (e: MouseEvent | Touch, dir: Direction, type?: 'mouse' | 'touch') => void;
    className?: string;
    disabled?: boolean;
    style?: CSSProperties;
}

export type { HandleClassName } from '@douyinfe/semi-foundation/resizable/types';
