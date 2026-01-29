import { h, createApp, nextTick, type Component } from 'vue';
import NotificationList from './NotificationList.vue';
import type { NoticeProps, ConfigProps, NotificationListProps, NotificationListState } from './interface';
import { cssClasses } from '@douyinfe/semi-foundation/notification/constants';
import getUuid from '@douyinfe/semi-foundation/utils/uuid';
import type { NoticePosition } from '@douyinfe/semi-foundation/notification/notificationFoundation';

// 导入样式（自动引入）
import './notification.scss';

// Default options
const defaultConfig: NoticeProps & { motion: boolean } = {
    duration: 3,
    position: 'topRight',
    motion: true,
    content: '',
    title: '',
    zIndex: 1010,
};

// Static reference to NotificationList instance
// 使用 Map 来管理不同 container 的 wrapper 和 notificationListRef
const wrapperMap = new Map<string | null, { notificationListRef: any; wrapperId: string; app: any }>();

// Get container key for Map
function getContainerKey(opts: NoticeProps): string | null {
    const getContainer = opts.getPopupContainer || defaultConfig.getPopupContainer;
    if (getContainer) {
        const funcStr = getContainer.toString();
        const key = funcStr.length > 100 ? funcStr.slice(0, 100) : funcStr;
        return `container-${key}`;
    }
    return null; // null 表示使用 document.body
}

// Create wrapper div
function createWrapper(opts: NoticeProps, wrapperId: string) {
    const div = document.createElement('div');
    div.className = cssClasses.WRAPPER;
    div.id = wrapperId;
    div.style.zIndex = String(typeof opts.zIndex === 'number' ? opts.zIndex : defaultConfig.zIndex);

    // Set position styles based on position prop
    const position = opts.position || defaultConfig.position || 'topRight';
    const positionMap: Record<NoticePosition, { top?: string; bottom?: string; left?: string; right?: string }> = {
        top: { top: '0px' },
        topLeft: { top: '0px', left: '0px' },
        topRight: { top: '0px', right: '0px' },
        bottom: { bottom: '0px' },
        bottomLeft: { bottom: '0px', left: '0px' },
        bottomRight: { bottom: '0px', right: '0px' },
    };

    const positionStyle = positionMap[position] || positionMap.topRight;
    Object.keys(positionStyle).forEach((pos) => {
        const val = positionStyle[pos as keyof typeof positionStyle];
        if (val) {
            div.style.setProperty(pos, val, 'important');
        }
    });

    // Handle custom top/left/bottom/right from opts
    ['top', 'left', 'bottom', 'right'].forEach((pos) => {
        const val = opts[pos as keyof NoticeProps] as any;
        if (val !== undefined && val !== null) {
            const styleValue = typeof val === 'number' ? `${val}px` : val;
            div.style.setProperty(pos, styleValue, 'important');
        }
    });

    // Append to container
    const getContainer = opts.getPopupContainer || defaultConfig.getPopupContainer;
    if (getContainer) {
        const container = getContainer();
        if (container && container !== document.body) {
            const containerStyle = window.getComputedStyle(container);
            if (containerStyle.position === 'static') {
                container.style.position = 'relative';
            }
            div.style.setProperty('position', 'absolute', 'important');
            container.appendChild(div);
        } else {
            document.body.appendChild(div);
        }
    } else {
        document.body.appendChild(div);
    }

    return div;
}

// Create NotificationList instance
function createNotificationList(div: HTMLElement, containerKey: string | null) {
    let notificationListInstance: any = null;
    const app = createApp({
        render() {
            return h(NotificationList as Component, {
                ref: (instance: any) => {
                    if (instance) {
                        notificationListInstance = instance;
                        const wrapperInfo = wrapperMap.get(containerKey);
                        if (wrapperInfo) {
                            wrapperInfo.notificationListRef = instance;
                        }
                    }
                },
            });
        },
    });

    app.mount(div);

    nextTick(() => {
        const wrapperInfo = wrapperMap.get(containerKey);
        if (wrapperInfo && !wrapperInfo.notificationListRef && notificationListInstance) {
            wrapperInfo.notificationListRef = notificationListInstance;
        } else if (wrapperInfo && !wrapperInfo.notificationListRef) {
            setTimeout(() => {
                const wrapperInfo2 = wrapperMap.get(containerKey);
                if (wrapperInfo2 && !wrapperInfo2.notificationListRef && notificationListInstance) {
                    wrapperInfo2.notificationListRef = notificationListInstance;
                }
            }, 10);
        }
    });

    return app;
}

// Add notice
function addNotice(notice: NoticeProps): string {
    const mergedNotice = { ...defaultConfig, ...notice };
    const id = mergedNotice.id ?? getUuid('notification');
    const containerKey = getContainerKey(mergedNotice);
    let wrapperInfo = wrapperMap.get(containerKey);

    if (!wrapperInfo) {
        // 创建新的 wrapper
        const wrapperId = getUuid('notification-wrapper').slice(0, 32);
        const div = createWrapper(mergedNotice, wrapperId);
        const app = createNotificationList(div, containerKey);

        wrapperInfo = {
            notificationListRef: null,
            wrapperId,
            app,
        };
        wrapperMap.set(containerKey, wrapperInfo);

        // 等待 notificationListRef 被设置后再添加 notice
        let retryCount = 0;
        const maxRetries = 100;
        const checkAndAdd = () => {
            const currentWrapperInfo = wrapperMap.get(containerKey);
            if (currentWrapperInfo && currentWrapperInfo.notificationListRef) {
                if (currentWrapperInfo.notificationListRef.has(id)) {
                    currentWrapperInfo.notificationListRef.update(id, { ...mergedNotice, id });
                } else {
                    currentWrapperInfo.notificationListRef.add({ ...mergedNotice, id });
                }
            } else if (retryCount < maxRetries) {
                retryCount++;
                setTimeout(checkAndAdd, 10);
            } else {
                console.error(
                    '[Notification] Failed to initialize notificationListRef after 1 second, containerKey:',
                    containerKey
                );
            }
        };
        setTimeout(checkAndAdd, 0);
    } else {
        // 更新或添加 notice
        if (wrapperInfo.notificationListRef) {
            if (wrapperInfo.notificationListRef.has(id)) {
                wrapperInfo.notificationListRef.update(id, { ...mergedNotice, id });
            } else {
                wrapperInfo.notificationListRef.add({ ...mergedNotice, id });
            }
        }
    }

    return id;
}

// Remove notice
function removeNotice(id: string) {
    for (const wrapperInfo of wrapperMap.values()) {
        if (wrapperInfo.notificationListRef && wrapperInfo.notificationListRef.has(id)) {
            wrapperInfo.notificationListRef.remove(id);
            break;
        }
    }
    return id;
}

// Destroy all notices
function destroyAll() {
    for (const [, wrapperInfo] of wrapperMap.entries()) {
        if (wrapperInfo.notificationListRef) {
            wrapperInfo.notificationListRef.destroyAll();
        }
        const wrapper = document.querySelector(`#${wrapperInfo.wrapperId}`);
        if (wrapper && wrapper.parentNode) {
            wrapper.parentNode.removeChild(wrapper);
        }
        if (wrapperInfo.app) {
            wrapperInfo.app.unmount();
        }
    }
    wrapperMap.clear();
}

// Static methods
function info(opts: Omit<NoticeProps, 'type'> | string): string {
    if (typeof opts === 'string') {
        opts = { content: opts };
    }
    return addNotice({ ...defaultConfig, ...opts, type: 'info' });
}

function success(opts: Omit<NoticeProps, 'type'> | string): string {
    if (typeof opts === 'string') {
        opts = { content: opts };
    }
    return addNotice({ ...defaultConfig, ...opts, type: 'success' });
}

function error(opts: Omit<NoticeProps, 'type'> | string): string {
    if (typeof opts === 'string') {
        opts = { content: opts };
    }
    return addNotice({ ...defaultConfig, ...opts, type: 'error' });
}

function warning(opts: Omit<NoticeProps, 'type'> | string): string {
    if (typeof opts === 'string') {
        opts = { content: opts };
    }
    return addNotice({ ...defaultConfig, ...opts, type: 'warning' });
}

function open(opts: Omit<NoticeProps, 'type'> | string): string {
    if (typeof opts === 'string') {
        opts = { content: opts };
    }
    return addNotice({ ...defaultConfig, ...opts, type: 'default' });
}

function close(id: string) {
    return removeNotice(id);
}

// Config
function config(opts: ConfigProps) {
    ['top', 'left', 'bottom', 'right'].forEach((pos) => {
        if (pos in opts) {
            (defaultConfig as any)[pos] = opts[pos as keyof ConfigProps];
        }
    });

    if (typeof opts.zIndex === 'number') {
        defaultConfig.zIndex = opts.zIndex;
        // 更新所有 wrapper 的 zIndex
        for (const wrapperInfo of wrapperMap.values()) {
            const node = document.querySelector(`#${wrapperInfo.wrapperId}`) as HTMLElement;
            if (node) {
                node.style.zIndex = String(opts.zIndex);
            }
        }
    }

    if (typeof opts.duration === 'number') {
        defaultConfig.duration = opts.duration;
    }

    if (typeof opts.position === 'string') {
        defaultConfig.position = opts.position;
    }

    if (typeof opts.getPopupContainer === 'function') {
        defaultConfig.getPopupContainer = opts.getPopupContainer;
    }
}

// Export Notification component with static methods
const Notification = {
    addNotice,
    removeNotice,
    destroyAll,
    info,
    success,
    error,
    warning,
    open,
    close,
    config,
};

export type { NoticeProps, ConfigProps, NotificationListProps, NotificationListState };
export default Notification;
export { Notification };
