import type { CSSProperties } from 'vue';
import { TooltipProps, Position, Trigger, ArrowBounding } from '../tooltip/interface';

export type { Position, Trigger, ArrowBounding };

export interface ArrowStyle {
    borderColor?: string;
    backgroundColor?: string;
    borderOpacity?: string | number;
}

export interface PopoverProps {
    // 继承自 Tooltip 的基础属性
    autoAdjustOverflow?: boolean;
    children?: any;
    content?: any | ((props: { initialFocusRef?: any }) => any);
    visible?: boolean;
    position?: Position;
    motion?: boolean;
    margin?: number | { marginLeft: number; marginTop: number; marginRight: number; marginBottom: number };
    mouseEnterDelay?: number;
    mouseLeaveDelay?: number;
    trigger?: Trigger;
    className?: string;
    contentClassName?: string | string[];
    onVisibleChange?: (visible: boolean) => void;
    onClickOutSide?: (e: MouseEvent) => void;
    showArrow?: boolean;
    spacing?: number | { x: number; y: number };
    stopPropagation?: boolean | string;
    prefixCls?: string;
    rePosKey?: string | number;
    getPopupContainer?: () => HTMLElement;
    zIndex?: number;
    style?: CSSProperties;

    // Popover 特有属性
    arrowStyle?: ArrowStyle;
    arrowBounding?: ArrowBounding;
    arrowPointAtCenter?: boolean;

    // 可访问性相关
    closeOnEsc?: boolean;
    guardFocus?: boolean;
    returnFocusOnClose?: boolean;
    onEscKeyDown?: (e: KeyboardEvent) => void;
    clickToHide?: boolean;
    clickTriggerToHide?: boolean;
    disableFocusListener?: boolean;

    // 其他
    transformFromCenter?: boolean;
    wrapWhenSpecial?: boolean;
    wrapperClassName?: string;
    disableArrowKeyDown?: boolean;
    wrapperId?: string;
    preventScroll?: boolean;
    afterClose?: () => void;
    keepDOM?: boolean;

    // Vue 扩展（保留向后兼容）
    title?: any;
}
