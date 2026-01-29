import type { CSSProperties, VNode } from 'vue';
import type {
    NoticePosition,
    NoticeType,
    NoticeTheme,
} from '@douyinfe/semi-foundation/notification/notificationFoundation';

export type { NoticePosition, NoticeType, NoticeTheme };

export type Directions = 'ltr' | 'rtl';

export interface ConfigProps {
    top?: number | string;
    bottom?: number | string;
    left?: number | string;
    right?: number | string;
    duration?: number;
    position?: NoticePosition;
    zIndex?: number;
    getPopupContainer?: () => HTMLElement | null;
}

export interface NoticeProps extends ConfigProps {
    id?: string;
    title?: VNode | string;
    content?: VNode | string;
    type?: NoticeType;
    theme?: NoticeTheme;
    icon?: VNode | string;
    onClick?: (e: MouseEvent) => void;
    onClose?: () => void;
    onCloseClick?: (id: string) => void;
    onHookClose?: () => void;
    showClose?: boolean;
    close?: (id: string) => void;
    style?: CSSProperties;
    className?: string;
    direction?: Directions;
    motion?: boolean;
    onAnimationEnd?: (e: AnimationEvent) => void;
    onAnimationStart?: (e: AnimationEvent) => void;
}

export interface NoticeInstance extends NoticeProps {
    motion?: boolean;
}

export interface NotificationListProps {
    className?: string;
    style?: CSSProperties;
    direction?: Directions;
}

export interface NotificationListState {
    notices: NoticeInstance[];
    removedItems: NoticeInstance[];
    updatedItems: NoticeInstance[];
}

export interface NoticesInPosition {
    top: NoticeInstance[];
    topLeft: NoticeInstance[];
    topRight: NoticeInstance[];
    bottom: NoticeInstance[];
    bottomLeft: NoticeInstance[];
    bottomRight: NoticeInstance[];
}
