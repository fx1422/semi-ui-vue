import type { CSSProperties, VNode } from 'vue';

export type TimelineMode = 'left' | 'right' | 'center' | 'alternate';
export type TimelineItemType = 'default' | 'ongoing' | 'success' | 'warning' | 'error';
export type TimelineItemPosition = 'left' | 'right';

export interface TimelineItemProps {
    color?: string;
    children?: any;
    time?: string | VNode;
    type?: TimelineItemType;
    dot?: VNode | string;
    extra?: VNode | string;
    position?: TimelineItemPosition;
    className?: string;
    style?: CSSProperties;
    onClick?: (e: MouseEvent) => void;
}

export interface TimelineData extends TimelineItemProps {
    content: any;
}

export interface TimelineProps {
    mode?: TimelineMode;
    className?: string;
    style?: CSSProperties;
    dataSource?: TimelineData[];
    children?: any;
    ariaLabel?: string;
}
