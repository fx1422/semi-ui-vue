import type { CSSProperties, VNode } from 'vue';
import type { ButtonProps } from '../button/interface';

export type OKType = 'primary' | 'secondary' | 'tertiary' | 'warning' | 'danger';
export type Size = 'small' | 'medium' | 'large' | 'full-width';

export interface ModalProps {
    afterClose?: () => void;
    bodyStyle?: CSSProperties;
    cancelButtonProps?: ButtonProps;
    cancelText?: string;
    centered?: boolean;
    className?: string;
    modalContentClass?: string;
    closable?: boolean;
    confirmLoading?: boolean;
    cancelLoading?: boolean;
    content?: VNode | string;
    footer?: VNode | string | null;
    hasCancel?: boolean;
    header?: VNode | string;
    height?: string | number;
    mask?: boolean;
    maskClosable?: boolean;
    maskStyle?: CSSProperties;
    maskFixed?: boolean;
    motion?: boolean;
    okButtonProps?: ButtonProps;
    okText?: string;
    okType?: OKType;
    style?: CSSProperties;
    title?: VNode | string;
    visible?: boolean; // 向后兼容，推荐使用 v-model
    width?: string | number;
    zIndex?: number;
    icon?: VNode | string;
    getPopupContainer?: () => HTMLElement;
    closeIcon?: VNode | string;
    closeOnEsc?: boolean;
    size?: Size;
    lazyRender?: boolean;
    keepDOM?: boolean;
    direction?: 'ltr' | 'rtl';
    fullScreen?: boolean;
    preventScroll?: boolean;
    footerFill?: boolean;
    modalRender?: (node: VNode) => VNode; // 自定义渲染对话框
    onCancel?: (e: MouseEvent) => void | Promise<any>; // 取消回调
    onOk?: (e: MouseEvent) => void | Promise<any>; // 确定回调
}

export interface ModalState {
    displayNone: boolean;
    isFullScreen: boolean;
    onOKReturnPromiseStatus?: 'pending' | 'fulfilled' | 'rejected';
    onCancelReturnPromiseStatus?: 'pending' | 'fulfilled' | 'rejected';
}

export interface ModalContentProps {
    title?: VNode | string;
    content?: VNode | string;
    icon?: VNode | string;
    header?: VNode | string;
    footer?: VNode | string | null;
    closable?: boolean;
    closeIcon?: VNode | string;
    closeOnEsc?: boolean;
    bodyStyle?: CSSProperties;
    className?: string;
    contentClassName?: string;
    maskClassName?: string;
    style?: CSSProperties;
    maskStyle?: CSSProperties;
    width?: string | number;
    height?: string | number;
    centered?: boolean;
    mask?: boolean;
    maskClosable?: boolean;
    maskFixed?: boolean;
    size?: Size;
    isFullScreen?: boolean;
    direction?: 'ltr' | 'rtl';
    getPopupContainer?: () => HTMLElement;
    contentExtraProps?: Record<string, any>;
    maskExtraProps?: Record<string, any>;
    modalRender?: (node: VNode) => VNode; // 自定义渲染对话框
    onAnimationEnd?: (e: AnimationEvent) => void; // 动画结束回调
}
