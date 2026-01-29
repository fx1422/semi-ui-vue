import { CSSProperties, VNode } from 'vue';

export interface PortalProps {
    children?: VNode | VNode[];
    style?: CSSProperties;
    prefixCls?: string;
    className?: string;
    getPopupContainer?: () => HTMLElement;
}
