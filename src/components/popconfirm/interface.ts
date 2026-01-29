import { CSSProperties, VNode } from 'vue';
import { PopoverProps } from '../popover/interface';
import { ButtonProps } from '../button/interface';
import { Position, Trigger } from '../tooltip/interface';

export type ButtonType = 'primary' | 'secondary' | 'tertiary' | 'warning' | 'danger';

export interface RenderContentProps<T = HTMLElement> {
    initialFocusRef?: T;
}

export type RenderContent<T = HTMLElement> = (props: RenderContentProps<T>) => VNode | string;

export interface PopconfirmProps extends Omit<PopoverProps, 'content' | 'onConfirm' | 'onCancel'> {
    cancelText?: string;
    cancelButtonProps?: ButtonProps;
    cancelType?: ButtonType;
    defaultVisible?: boolean;
    disabled?: boolean;
    icon?: VNode | string | (() => VNode);
    okText?: string;
    okType?: ButtonType;
    okButtonProps?: ButtonProps;
    motion?: boolean;
    title?: VNode | string;
    visible?: boolean;
    prefixCls?: string;
    zIndex?: number;
    trigger?: Trigger;
    showCloseIcon?: boolean;
    position?: Position;
    content?: VNode | string | RenderContent;
    onCancel?: (e: MouseEvent) => Promise<any> | void;
    onConfirm?: (e: MouseEvent) => Promise<any> | void;
    onVisibleChange?: (visible: boolean) => void;
    onClickOutSide?: (e: MouseEvent) => void;
}

export interface PopconfirmState {
    visible: boolean;
    cancelLoading: boolean;
    confirmLoading: boolean;
}
