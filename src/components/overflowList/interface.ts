import type { VNode, CSSProperties } from 'vue';

export type OverflowItem = Record<string, any>;

type Key = string | number;

export interface OverflowListProps {
    className?: string;
    collapseFrom?: 'start' | 'end';
    items?: Array<OverflowItem>;
    minVisibleItems?: number;
    onIntersect?: (res: { [key: string]: IntersectionObserverEntry }) => void;
    onOverflow?: (overflowItems: Array<OverflowItem>) => void;
    overflowRenderer?: (overflowItems: Array<OverflowItem>) => VNode | VNode[];
    renderMode?: 'collapse' | 'scroll';
    style?: CSSProperties;
    threshold?: number;
    visibleItemRenderer?: (item: OverflowItem, index: number) => VNode;
    wrapperClassName?: string;
    wrapperStyle?: CSSProperties;
    itemKey?: Key | ((item: OverflowItem) => Key);
    onVisibleStateChange?: (visibleState: Map<string, boolean>) => void;
    overflowRenderDirection?: 'both' | 'start' | 'end'; // used in tabs, not exposed to user
}

export interface OverflowListState {
    direction?: 'grow' | 'shrink';
    lastOverflowCount?: number;
    overflow?: Array<OverflowItem>;
    visible?: Array<OverflowItem>;
    visibleState?: Map<string, boolean>;
    prevProps?: OverflowListProps;
    itemSizeMap?: Map<Key, number>;
    containerWidth?: number;
    maxCount?: number;
    overflowStatus?: 'calculating' | 'overflowed' | 'normal';
    pivot?: number;
    overflowWidth?: number;
}
