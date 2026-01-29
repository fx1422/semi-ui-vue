import { CSSProperties, VNode } from 'vue';

export type Trigger = 'hover' | 'focus' | 'click' | 'custom' | 'contextMenu';
export type Position =
    | 'top'
    | 'topLeft'
    | 'topRight'
    | 'left'
    | 'leftTop'
    | 'leftBottom'
    | 'right'
    | 'rightTop'
    | 'rightBottom'
    | 'bottom'
    | 'bottomLeft'
    | 'bottomRight';

export interface ArrowBounding {
    offsetX?: number;
    offsetY?: number;
    width?: number;
    height?: number;
}

export interface RenderContentProps<T = HTMLElement> {
    // Vue 中可传 function ref 或实例本身
    initialFocusRef?: T | ((node: T | null) => void);
}

export type RenderContent<T = HTMLElement> = (props: RenderContentProps<T>) => VNode | string;

export interface TooltipProps {
    children?: VNode | string;
    motion?: boolean;
    autoAdjustOverflow?: boolean;
    position?: Position;
    getPopupContainer?: () => HTMLElement;
    mouseEnterDelay?: number;
    mouseLeaveDelay?: number;
    trigger?: Trigger;
    className?: string;
    clickToHide?: boolean;
    visible?: boolean;
    style?: CSSProperties;
    content?: VNode | string | RenderContent;
    prefixCls?: string;
    onVisibleChange?: (visible: boolean) => void;
    onClickOutSide?: (e: MouseEvent) => void;
    spacing?: number | { x: number; y: number };
    margin?: number | { marginLeft: number; marginTop: number; marginRight: number; marginBottom: number };
    showArrow?: boolean | VNode;
    zIndex?: number;
    rePosKey?: string | number;
    role?: string;
    arrowBounding?: ArrowBounding;
    transformFromCenter?: boolean;
    arrowPointAtCenter?: boolean;
    wrapWhenSpecial?: boolean;
    stopPropagation?: boolean;
    clickTriggerToHide?: boolean;
    wrapperClassName?: string;
    closeOnEsc?: boolean;
    guardFocus?: boolean;
    returnFocusOnClose?: boolean;
    onEscKeyDown?: (e: KeyboardEvent) => void;
    disableArrowKeyDown?: boolean;
    wrapperId?: string;
    preventScroll?: boolean;
    disableFocusListener?: boolean;
    afterClose?: () => void;
    keepDOM?: boolean;
}
