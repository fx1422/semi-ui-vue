import type { CSSProperties, VNode } from 'vue';

export type ToastType = 'success' | 'warning' | 'error' | 'info' | 'default';
export type ToastTheme = 'light' | 'normal';
export type Directions = 'ltr' | 'rtl';

export interface ConfigProps {
    top?: number | string;
    bottom?: number | string;
    left?: number | string;
    right?: number | string;
    duration?: number;
    zIndex?: number;
    theme?: ToastTheme;
    getPopupContainer?: () => HTMLElement | null;
}

export interface ToastProps extends ConfigProps {
    id?: string;
    onClose?: () => void;
    content: VNode | string;
    type?: ToastType;
    textMaxWidth?: string | number;
    style?: CSSProperties;
    className?: string;
    showClose?: boolean;
    icon?: VNode | string;
    direction?: Directions;
    close?: (id: string) => void;
    stack?: boolean;
    stackExpanded?: boolean;
    motion?: boolean;
    positionInList?: {
        index: number;
        length: number;
    };
    onAnimationEnd?: (e: AnimationEvent) => void;
    onAnimationStart?: (e: AnimationEvent) => void;
}

export interface ToastListProps {}

export interface ToastListState {
    list: ToastProps[];
    removedItems: ToastProps[];
    updatedItems: ToastProps[];
    mouseInSide: boolean;
}
