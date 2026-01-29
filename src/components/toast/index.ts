import { h, createApp, nextTick, type Component } from 'vue';
import ToastList from './ToastList.vue';
import type { ToastProps, ConfigProps, ToastListProps, ToastListState } from './interface';
import { cssClasses } from '@douyinfe/semi-foundation/toast/constants';
import getUuid from '@douyinfe/semi-foundation/utils/uuid';
import useToast from './useToast';

// 导入样式（自动引入）
import './toast.scss';

// Default options
export const defaultOpts: ToastProps & { motion: boolean } = {
    motion: true,
    zIndex: 1010,
    content: '',
    top: undefined,
    left: undefined,
    bottom: undefined,
    right: undefined,
};

// Static reference to ToastList instance
// 使用 Map 来管理不同 container 的 wrapper 和 toastListRef
const wrapperMap = new Map<string | null, { toastListRef: any; wrapperId: string; app: any }>();

// Get container key for Map
// 使用 getPopupContainer 函数本身作为 key，因为同一个函数应该返回同一个容器
function getContainerKey(opts: ToastProps): string | null {
    const getContainer = opts.getPopupContainer || defaultOpts.getPopupContainer;
    if (getContainer) {
        // 使用函数本身作为 key（转换为字符串）
        // 这样同一个 getPopupContainer 函数会使用同一个 wrapper
        const funcStr = getContainer.toString();
        // 使用更短的 key，避免过长
        const key = funcStr.length > 100 ? funcStr.slice(0, 100) : funcStr;
        return `container-${key}`;
    }
    return null; // null 表示使用 document.body
}

// Create wrapper div
function createWrapper(opts: ToastProps, wrapperId: string) {
    const div = document.createElement('div');
    div.className = cssClasses.WRAPPER;
    div.id = wrapperId;
    div.style.zIndex = String(typeof opts.zIndex === 'number' ? opts.zIndex : defaultOpts.zIndex);

    // Determine which positions will be set
    // Priority: opts > defaultOpts
    const positionsToSet: { [key: string]: string | number } = {};
    ['top', 'left', 'bottom', 'right'].forEach((pos) => {
        const optsVal = opts[pos as keyof ToastProps] as any;
        const defaultVal = defaultOpts[pos as keyof typeof defaultOpts] as any;
        const val =
            optsVal !== undefined && optsVal !== null
                ? optsVal
                : defaultVal !== undefined && defaultVal !== null
                  ? defaultVal
                  : undefined;
        if (val !== undefined && val !== null) {
            positionsToSet[pos] = val;
        }
    });

    // Remove conflicting positions from positionsToSet
    if ('bottom' in positionsToSet && 'top' in positionsToSet) {
        if (opts.bottom !== undefined && opts.bottom !== null) {
            delete positionsToSet.top;
        } else if (opts.top !== undefined && opts.top !== null) {
            delete positionsToSet.bottom;
        } else {
            delete positionsToSet.top;
        }
    }
    if ('right' in positionsToSet && 'left' in positionsToSet) {
        if (opts.right !== undefined && opts.right !== null) {
            delete positionsToSet.left;
        } else if (opts.left !== undefined && opts.left !== null) {
            delete positionsToSet.right;
        } else {
            delete positionsToSet.left;
        }
    }

    // Clear conflicting position properties first to remove SCSS defaults
    if ('bottom' in positionsToSet) {
        div.style.setProperty('top', 'unset', 'important');
    }
    if ('top' in positionsToSet) {
        div.style.setProperty('bottom', 'unset', 'important');
    }
    if ('right' in positionsToSet) {
        div.style.setProperty('left', 'unset', 'important');
    }
    if ('left' in positionsToSet) {
        div.style.setProperty('right', 'unset', 'important');
    }

    // Set the positions with !important to override SCSS
    Object.keys(positionsToSet).forEach((pos) => {
        const val = positionsToSet[pos];
        const styleValue = typeof val === 'number' ? `${val}px` : val;
        div.style.setProperty(pos, styleValue, 'important');
    });

    // Handle justify-content - override SCSS default
    if ('right' in positionsToSet) {
        div.style.setProperty('justify-content', 'flex-end', 'important');
    } else if ('left' in positionsToSet) {
        div.style.setProperty('justify-content', 'flex-start', 'important');
    } else {
        div.style.setProperty('justify-content', 'center', 'important');
    }

    // Add data attribute and class for bottom position to adjust animation direction
    if ('bottom' in positionsToSet) {
        div.setAttribute('data-toast-position', 'bottom');
        div.classList.add('semi-toast-wrapper-bottom');
    } else if ('top' in positionsToSet) {
        div.setAttribute('data-toast-position', 'top');
        div.classList.remove('semi-toast-wrapper-bottom');
    } else {
        div.setAttribute('data-toast-position', 'top');
        div.classList.remove('semi-toast-wrapper-bottom');
    }

    // Append to container
    // 优先使用 opts.getPopupContainer，然后是 defaultOpts.getPopupContainer
    const getContainer = opts.getPopupContainer || defaultOpts.getPopupContainer;
    if (getContainer) {
        const container = getContainer();
        if (container && container !== document.body) {
            // 如果容器不是 document.body，使用 absolute 定位相对于容器
            // 确保容器有相对定位，以便 Toast 正确定位
            const containerStyle = window.getComputedStyle(container);
            if (containerStyle.position === 'static') {
                container.style.position = 'relative';
            }
            // 对于自定义容器，使用 absolute 而不是 fixed
            div.style.setProperty('position', 'absolute', 'important');
            container.appendChild(div);
        } else {
            // 使用 document.body 时，保持 fixed 定位
            document.body.appendChild(div);
        }
    } else {
        // 使用 document.body 时，保持 fixed 定位
        document.body.appendChild(div);
    }

    return div;
}

// Create ToastList instance
function createToastList(div: HTMLElement, containerKey: string | null) {
    let toastListInstance: any = null;
    const app = createApp({
        render() {
            return h(ToastList as Component, {
                ref: (instance: any) => {
                    if (instance) {
                        toastListInstance = instance;
                        const wrapperInfo = wrapperMap.get(containerKey);
                        if (wrapperInfo) {
                            wrapperInfo.toastListRef = instance;
                        }
                    }
                },
            });
        },
    });

    app.mount(div);

    // Vue 3 的 ref 回调通常在 mount 后同步执行
    // 但为了确保，我们也在下一个 tick 检查一次
    // 使用 nextTick 确保在 Vue 的更新周期之后执行
    nextTick(() => {
        const wrapperInfo = wrapperMap.get(containerKey);
        if (wrapperInfo && !wrapperInfo.toastListRef && toastListInstance) {
            wrapperInfo.toastListRef = toastListInstance;
        } else if (wrapperInfo && !wrapperInfo.toastListRef) {
            // 如果 toastListInstance 还是 null，再等一个 tick
            setTimeout(() => {
                const wrapperInfo2 = wrapperMap.get(containerKey);
                if (wrapperInfo2 && !wrapperInfo2.toastListRef && toastListInstance) {
                    wrapperInfo2.toastListRef = toastListInstance;
                }
            }, 10);
        }
    });

    return app;
}

// Create toast
function create(opts: ToastProps): string {
    const id = opts.id ?? getUuid('toast');
    const containerKey = getContainerKey(opts);
    let wrapperInfo = wrapperMap.get(containerKey);

    if (!wrapperInfo) {
        // 创建新的 wrapper
        const wrapperId = getUuid('toast-wrapper').slice(0, 26);
        const div = createWrapper(opts, wrapperId);
        const app = createToastList(div, containerKey);

        wrapperInfo = {
            toastListRef: null, // 会在 createToastList 的回调中设置
            wrapperId,
            app,
        };
        wrapperMap.set(containerKey, wrapperInfo);

        // 等待 toastListRef 被设置后再添加 toast
        // 使用轮询方式检查 toastListRef 是否已设置，最多等待 1 秒
        let retryCount = 0;
        const maxRetries = 100; // 最多重试 100 次，每次 10ms，总共 1 秒
        const checkAndAdd = () => {
            const currentWrapperInfo = wrapperMap.get(containerKey);
            if (currentWrapperInfo && currentWrapperInfo.toastListRef) {
                currentWrapperInfo.toastListRef.add({ ...opts, id });
                currentWrapperInfo.toastListRef.stack = Boolean(opts.stack);
            } else if (retryCount < maxRetries) {
                // 如果还没设置，继续等待
                retryCount++;
                setTimeout(checkAndAdd, 10);
            } else {
                console.error('[Toast] Failed to initialize toastListRef after 1 second, containerKey:', containerKey);
            }
        };
        setTimeout(checkAndAdd, 0);
    } else {
        const node = document.querySelector(`#${wrapperInfo.wrapperId}`) as HTMLElement;
        if (node) {
            const positionsToSet: { [key: string]: string | number } = {};
            ['top', 'left', 'bottom', 'right'].forEach((pos) => {
                if (
                    pos in opts &&
                    opts[pos as keyof ToastProps] !== undefined &&
                    opts[pos as keyof ToastProps] !== null
                ) {
                    positionsToSet[pos] = opts[pos as keyof ToastProps] as any;
                }
            });

            if ('bottom' in positionsToSet && 'top' in positionsToSet) {
                delete positionsToSet.top;
            }
            if ('right' in positionsToSet && 'left' in positionsToSet) {
                delete positionsToSet.left;
            }

            if (Object.keys(positionsToSet).length > 0) {
                if ('bottom' in positionsToSet) {
                    node.style.setProperty('top', 'unset', 'important');
                } else if ('top' in positionsToSet) {
                    node.style.setProperty('bottom', 'unset', 'important');
                } else {
                    node.style.setProperty('top', 'unset', 'important');
                    node.style.setProperty('bottom', 'unset', 'important');
                }
                if ('right' in positionsToSet) {
                    node.style.setProperty('left', 'unset', 'important');
                } else if ('left' in positionsToSet) {
                    node.style.setProperty('right', 'unset', 'important');
                } else {
                    node.style.setProperty('left', 'unset', 'important');
                    node.style.setProperty('right', 'unset', 'important');
                }

                Object.keys(positionsToSet).forEach((pos) => {
                    const val = positionsToSet[pos];
                    const styleValue = typeof val === 'number' ? `${val}px` : val;
                    node.style.setProperty(pos, styleValue, 'important');
                });

                if ('right' in positionsToSet) {
                    node.style.setProperty('justify-content', 'flex-end', 'important');
                } else if ('left' in positionsToSet) {
                    node.style.setProperty('justify-content', 'flex-start', 'important');
                } else {
                    node.style.setProperty('justify-content', 'center', 'important');
                }

                if ('bottom' in positionsToSet) {
                    node.setAttribute('data-toast-position', 'bottom');
                    node.classList.add('semi-toast-wrapper-bottom');
                } else if ('top' in positionsToSet) {
                    node.setAttribute('data-toast-position', 'top');
                    node.classList.remove('semi-toast-wrapper-bottom');
                }
            }

            // Update stack mode
            if (wrapperInfo.toastListRef && Boolean(opts.stack) !== wrapperInfo.toastListRef.stack) {
                wrapperInfo.toastListRef.stack = Boolean(opts.stack);
            }

            // Update or add toast
            if (wrapperInfo.toastListRef) {
                if (wrapperInfo.toastListRef.has(id)) {
                    wrapperInfo.toastListRef.update(id, { ...opts, id });
                } else {
                    wrapperInfo.toastListRef.add({ ...opts, id });
                }
            }
        }
    }

    return id;
}

// Close toast
function close(id: string) {
    // 遍历所有 wrapper 查找并关闭对应的 toast
    for (const wrapperInfo of wrapperMap.values()) {
        if (wrapperInfo.toastListRef && wrapperInfo.toastListRef.has(id)) {
            wrapperInfo.toastListRef.remove(id);
            break;
        }
    }
}

// Destroy all toasts
function destroyAll() {
    // 销毁所有 wrapper
    for (const [, wrapperInfo] of wrapperMap.entries()) {
        if (wrapperInfo.toastListRef) {
            wrapperInfo.toastListRef.destroyAll();
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

// Get wrapper ID
function getWrapperId() {
    // 返回默认 wrapper 的 ID（使用 document.body 的）
    const defaultWrapperInfo = wrapperMap.get(null);
    return defaultWrapperInfo ? defaultWrapperInfo.wrapperId : null;
}

// Static methods
function info(opts: Omit<ToastProps, 'type'> | string): string {
    if (typeof opts === 'string') {
        opts = { content: opts };
    }
    return create({ ...defaultOpts, ...opts, type: 'info' });
}

function warning(opts: Omit<ToastProps, 'type'> | string): string {
    if (typeof opts === 'string') {
        opts = { content: opts };
    }
    return create({ ...defaultOpts, ...opts, type: 'warning' });
}

function error(opts: Omit<ToastProps, 'type'> | string): string {
    if (typeof opts === 'string') {
        opts = { content: opts };
    }
    return create({ ...defaultOpts, ...opts, type: 'error' });
}

function success(opts: Omit<ToastProps, 'type'> | string): string {
    if (typeof opts === 'string') {
        opts = { content: opts };
    }
    return create({ ...defaultOpts, ...opts, type: 'success' });
}

function open(opts: Omit<ToastProps, 'type'> | string): string {
    if (typeof opts === 'string') {
        opts = { content: opts };
    }
    return create({ ...defaultOpts, ...opts, type: 'default' });
}

// Config
function config(opts: ConfigProps) {
    // Clear conflicting positions first
    if ('top' in opts) {
        (defaultOpts as any).bottom = undefined;
    }
    if ('bottom' in opts) {
        (defaultOpts as any).top = undefined;
    }
    if ('left' in opts) {
        (defaultOpts as any).right = undefined;
    }
    if ('right' in opts) {
        (defaultOpts as any).left = undefined;
    }

    // Then set the new positions
    ['top', 'left', 'bottom', 'right'].forEach((pos) => {
        if (pos in opts) {
            (defaultOpts as any)[pos] = opts[pos as keyof ConfigProps];
        }
    });

    if (typeof opts.theme === 'string' && ['normal', 'light'].includes(opts.theme)) {
        defaultOpts.theme = opts.theme;
    }
    if (typeof opts.zIndex === 'number') {
        defaultOpts.zIndex = opts.zIndex;
        // 更新所有 wrapper 的 zIndex
        for (const wrapperInfo of wrapperMap.values()) {
            const node = document.querySelector(`#${wrapperInfo.wrapperId}`) as HTMLElement;
            if (node) {
                node.style.zIndex = String(opts.zIndex);
            }
        }
    }

    // 更新所有 wrapper 的位置
    if (opts.top !== undefined || opts.bottom !== undefined || opts.left !== undefined || opts.right !== undefined) {
        for (const wrapperInfo of wrapperMap.values()) {
            const node = document.querySelector(`#${wrapperInfo.wrapperId}`) as HTMLElement;
            if (node) {
                if (opts.bottom === undefined && opts.top === undefined) {
                    node.style.setProperty('top', 'unset', 'important');
                    node.style.setProperty('bottom', 'unset', 'important');
                }
                if (opts.right === undefined && opts.left === undefined) {
                    node.style.setProperty('left', 'unset', 'important');
                    node.style.setProperty('right', 'unset', 'important');
                    node.style.setProperty('justify-content', 'center', 'important');
                }
            }
        }
    }
    if (typeof opts.duration === 'number') {
        defaultOpts.duration = opts.duration;
    }
    if (typeof opts.getPopupContainer === 'function') {
        defaultOpts.getPopupContainer = opts.getPopupContainer;
    }
}

// Create a new Toast instance with custom config
function createToastInstance(customConfig?: ConfigProps) {
    // Create a new defaultOpts for this instance
    const instanceDefaultOpts: ToastProps & { motion: boolean } = {
        ...defaultOpts,
    };

    // Apply custom config if provided
    if (customConfig) {
        if (typeof customConfig.theme === 'string' && ['normal', 'light'].includes(customConfig.theme)) {
            instanceDefaultOpts.theme = customConfig.theme;
        }
        if (typeof customConfig.zIndex === 'number') {
            instanceDefaultOpts.zIndex = customConfig.zIndex;
        }
        if (typeof customConfig.duration === 'number') {
            instanceDefaultOpts.duration = customConfig.duration;
        }
        if (typeof customConfig.getPopupContainer === 'function') {
            instanceDefaultOpts.getPopupContainer = customConfig.getPopupContainer;
        }
        ['top', 'left', 'bottom', 'right'].forEach((pos) => {
            if (pos in customConfig) {
                (instanceDefaultOpts as any)[pos] = (customConfig as any)[pos];
            }
        });
    }

    // Create instance-specific methods
    const instanceInfo = (opts: Omit<ToastProps, 'type'> | string): string => {
        if (typeof opts === 'string') {
            opts = { content: opts };
        }
        return create({ ...instanceDefaultOpts, ...opts, type: 'info' });
    };

    const instanceWarning = (opts: Omit<ToastProps, 'type'> | string): string => {
        if (typeof opts === 'string') {
            opts = { content: opts };
        }
        return create({ ...instanceDefaultOpts, ...opts, type: 'warning' });
    };

    const instanceError = (opts: Omit<ToastProps, 'type'> | string): string => {
        if (typeof opts === 'string') {
            opts = { content: opts };
        }
        return create({ ...instanceDefaultOpts, ...opts, type: 'error' });
    };

    const instanceSuccess = (opts: Omit<ToastProps, 'type'> | string): string => {
        if (typeof opts === 'string') {
            opts = { content: opts };
        }
        return create({ ...instanceDefaultOpts, ...opts, type: 'success' });
    };

    const instanceOpen = (opts: Omit<ToastProps, 'type'> | string): string => {
        if (typeof opts === 'string') {
            opts = { content: opts };
        }
        return create({ ...instanceDefaultOpts, ...opts, type: 'default' });
    };

    const instanceConfig = (opts: ConfigProps) => {
        // Update instance defaultOpts
        if (typeof opts.theme === 'string' && ['normal', 'light'].includes(opts.theme)) {
            instanceDefaultOpts.theme = opts.theme;
        }
        if (typeof opts.zIndex === 'number') {
            instanceDefaultOpts.zIndex = opts.zIndex;
        }
        if (typeof opts.duration === 'number') {
            instanceDefaultOpts.duration = opts.duration;
        }
        if (typeof opts.getPopupContainer === 'function') {
            instanceDefaultOpts.getPopupContainer = opts.getPopupContainer;
        }
        ['top', 'left', 'bottom', 'right'].forEach((pos) => {
            if (pos in opts) {
                (instanceDefaultOpts as any)[pos] = (opts as any)[pos];
            }
        });
    };

    return {
        create,
        close,
        destroyAll,
        getWrapperId,
        info: instanceInfo,
        warning: instanceWarning,
        error: instanceError,
        success: instanceSuccess,
        open: instanceOpen,
        config: instanceConfig,
        useToast,
    };
}

// ToastFactory class
export class ToastFactory {
    static create(config?: ConfigProps) {
        return createToastInstance(config);
    }
}

// Export Toast component with static methods
const Toast = {
    create,
    close,
    destroyAll,
    getWrapperId,
    info,
    warning,
    error,
    success,
    open,
    config,
    useToast,
};

export type { ToastProps, ConfigProps, ToastListProps, ToastListState };
export { default as useToast } from './useToast';
export default Toast;
export { Toast };
