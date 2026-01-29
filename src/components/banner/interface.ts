import type { VNode } from 'vue';

export type BannerType = 'info' | 'danger' | 'warning' | 'success';

export interface BannerProps {
    type?: BannerType;
    className?: string;
    children?: VNode | string;
    fullMode?: boolean;
    title?: VNode | string;
    description?: VNode | string;
    icon?: VNode;
    closeIcon?: VNode | null;
    style?: Record<string, string | number>;
    bordered?: boolean;
    onClose?: (e: MouseEvent) => void;
}

export interface BannerState {
    visible: boolean;
}
