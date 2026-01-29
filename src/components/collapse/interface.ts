import type { CSSProperties, VNode } from 'vue';
import type { Motion } from '@douyinfe/semi-foundation/utils/type';

export type CollapseActiveKey = string | string[];

export interface CollapseProps {
    activeKey?: CollapseActiveKey;
    defaultActiveKey?: CollapseActiveKey;
    accordion?: boolean;
    clickHeaderToExpand?: boolean;
    expandIcon?: VNode | string;
    collapseIcon?: VNode | string;
    style?: CSSProperties;
    className?: string;
    keepDOM?: boolean;
    motion?: Motion;
    expandIconPosition?: 'left' | 'right';
    lazyRender?: boolean;
    children?: any;
}

export interface CollapsePanelProps {
    itemKey: string;
    header?: VNode | string;
    className?: string;
    children?: any;
    reCalcKey?: number | string;
    style?: CSSProperties;
    showArrow?: boolean;
    disabled?: boolean;
    onMotionEnd?: () => void;
}

export interface CollapseState {
    activeSet: Set<string>;
}

export type CollapseIconPosition = 'left' | 'right';
