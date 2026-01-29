import { ref, h, defineComponent } from 'vue';
import getUuid from '@douyinfe/semi-foundation/utils/uuid';
import HookToast from './HookToast.vue';
import type { ToastProps } from './interface';
import { noop } from 'lodash-es';
import { defaultOpts as globalDefaultOpts } from './index';

// 使用全局的 defaultOpts，确保位置配置一致
const getDefaultOpts = () => {
    return {
        motion: true,
        zIndex: globalDefaultOpts.zIndex ?? 1010,
        duration: globalDefaultOpts.duration ?? 3,
        showClose: true, // 默认显示关闭按钮
        top: globalDefaultOpts.top,
        bottom: globalDefaultOpts.bottom,
        left: globalDefaultOpts.left,
        right: globalDefaultOpts.right,
    };
};

interface ToastConfig extends ToastProps {
    id: string;
}

interface UseToastReturn {
    success: (config: ToastProps | string) => string;
    info: (config: ToastProps | string) => string;
    error: (config: ToastProps | string) => string;
    warning: (config: ToastProps | string) => string;
    open: (config: ToastProps | string) => string;
    close: (id: string) => void;
}

export default function useToast(): [UseToastReturn, ReturnType<typeof defineComponent>] {
    const configs = ref<ToastConfig[]>([]);
    const toastRef = ref(new Map<string, { close: () => void }>());

    const removeConfig = (id: string) => {
        configs.value = configs.value.filter((config) => config.id !== id);
    };

    const addToast = (config: ToastProps | string): string => {
        const toastConfig: ToastProps = typeof config === 'string' ? { content: config } : config;
        const id = getUuid('semi_toast_');
        const defaultOpts = getDefaultOpts();
        const mergeConfig: ToastConfig = {
            ...defaultOpts,
            ...toastConfig,
            id,
        };

        configs.value = [mergeConfig, ...configs.value];
        return id;
    };

    const removeElement = (id: string) => {
        const { close } = toastRef.value.get(id) ?? {};
        close?.();
    };

    const toast = {
        success: (config: ToastProps | string) => {
            const defaultOpts = getDefaultOpts();
            return addToast({
                ...defaultOpts,
                ...(typeof config === 'string' ? { content: config } : config),
                type: 'success',
            });
        },
        info: (config: ToastProps | string) => {
            const defaultOpts = getDefaultOpts();
            return addToast({
                ...defaultOpts,
                ...(typeof config === 'string' ? { content: config } : config),
                type: 'info',
            });
        },
        error: (config: ToastProps | string) => {
            const defaultOpts = getDefaultOpts();
            return addToast({
                ...defaultOpts,
                ...(typeof config === 'string' ? { content: config } : config),
                type: 'error',
            });
        },
        warning: (config: ToastProps | string) => {
            const defaultOpts = getDefaultOpts();
            return addToast({
                ...defaultOpts,
                ...(typeof config === 'string' ? { content: config } : config),
                type: 'warning',
            });
        },
        open: (config: ToastProps | string) => {
            const defaultOpts = getDefaultOpts();
            return addToast({
                ...defaultOpts,
                ...(typeof config === 'string' ? { content: config } : config),
                type: 'default',
            });
        },
        close: removeElement,
    };

    // 创建响应式的 ContextHolder 组件
    // 与 React 版本保持一致，直接渲染 HookToast 元素，不创建 fixed 定位的 wrapper
    // Toast 会渲染在 contextHolder 所在的节点处，可以访问 Context
    const ContextHolder = defineComponent({
        setup() {
            return () => {
                // 访问 configs 建立响应式依赖
                if (configs.value.length === 0) {
                    return null;
                }

                // 直接渲染 HookToast 元素数组，与 React 版本保持一致
                // HookToast 会渲染 Toast 组件，Toast 组件会自然地显示在 contextHolder 所在的位置
                const toastNodes = configs.value.map((config) => {
                    return h(HookToast, {
                        ...config,
                        key: config.id,
                        afterClose: (instanceId: string) => {
                            removeConfig(instanceId);
                        },
                        ref: (ref: any) => {
                            if (ref && typeof ref === 'object' && 'close' in ref) {
                                toastRef.value.set(config.id, { close: (ref as any).close ?? noop });
                            }
                        },
                    });
                });

                // 直接返回 HookToast 元素数组，不创建 wrapper
                // 这样 Toast 会渲染在 contextHolder 所在的位置
                return toastNodes;
            };
        },
    });

    return [toast, ContextHolder];
}
