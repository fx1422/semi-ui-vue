import type { CSSProperties, VNode } from 'vue';
import type { SideSheetProps as FoundationSideSheetProps } from '@douyinfe/semi-foundation/sideSheet/sideSheetFoundation';
import type { Motion } from '../_utils/motion';

export interface SideSheetContentProps {
    onClose?: (e: MouseEvent) => void;
    closeIcon?: VNode | string;
    mask?: boolean;
    maskStyle?: CSSProperties;
    maskClosable?: boolean;
    maskClassName?: string;
    title?: VNode | string;
    closable?: boolean;
    headerStyle?: CSSProperties;
    width?: CSSProperties['width'];
    height: CSSProperties['height'];
    style: CSSProperties;
    size?: FoundationSideSheetProps['size'];
    bodyStyle?: CSSProperties;
    className: string;
    dialogClassName?: string;
    children?: VNode | string;
    footer?: VNode | string;
    'aria-label'?: string;
    maskExtraProps?: Record<string, any>;
    wrapperExtraProps?: Record<string, any>;
}

export interface SideSheetProps extends Omit<FoundationSideSheetProps, 'motion'> {
    bodyStyle?: CSSProperties;
    headerStyle?: CSSProperties;
    maskStyle?: CSSProperties;
    style?: CSSProperties;
    title?: VNode | string;
    footer?: VNode | string;
    children?: VNode | string;
    onCancel?: (e: MouseEvent | KeyboardEvent) => void;
    direction?: 'ltr' | 'rtl';
    motion?: Motion<SideSheetProps>;
}

export interface SideSheetState {
    displayNone: boolean;
}
