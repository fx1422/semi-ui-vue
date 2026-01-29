import { h, createApp, type Component } from 'vue';
import { omit } from 'lodash-es';
import ConfirmModal from './ConfirmModal.vue';
import type { ModalProps } from './interface';
import { IconAlertCircle, IconAlertTriangle, IconHelpCircle, IconInfoCircle, IconTickCircle } from '../icons';

export interface ConfirmProps extends ModalProps {
    type: 'success' | 'info' | 'warning' | 'error' | 'confirm';
}

export const destroyFns: Array<() => void> = [];

export default function confirm<T = any>(props: ConfirmProps) {
    const div = document.createElement('div');
    document.body.appendChild(div);

    let currentConfig = { ...props, visible: true };
    let appInstance: any = null;
    let isDestroyed = false;

    const destroy = () => {
        if (isDestroyed) {
            return;
        }
        isDestroyed = true;

        if (appInstance) {
            appInstance.unmount();
            appInstance = null;
        }

        if (div.parentNode) {
            div.parentNode.removeChild(div);
        }

        const index = destroyFns.indexOf(close);
        if (index !== -1) {
            destroyFns.splice(index, 1);
        }
    };

    function renderModal(renderProps: ConfirmProps) {
        const { afterClose } = renderProps;

        if (isDestroyed) {
            return;
        }

        if (appInstance) {
            appInstance.unmount();
            appInstance = null;
        }

        const componentProps = {
            ...renderProps,
            afterClose: () => {
                if (!isDestroyed) {
                    afterClose?.();
                    // 使用 setTimeout 延迟销毁，避免在 afterClose 回调中立即销毁导致栈溢出
                    setTimeout(() => destroy(), 0);
                }
            },
        };

        try {
            appInstance = createApp({
                render() {
                    return h(ConfirmModal as Component, componentProps);
                },
            });

            appInstance.mount(div);
        } catch (mountError) {
            console.error('[Modal] Error mounting app:', mountError);
            throw mountError;
        }
    }

    function close() {
        currentConfig = {
            ...currentConfig,
            visible: false,
        };
        renderModal(currentConfig);
    }

    function update(
        newConfig: T extends { type: Exclude<ConfirmProps['type'], 'confirm'> } ? ModalProps : ConfirmProps
    ) {
        currentConfig = {
            ...currentConfig,
            ...newConfig,
        };
        renderModal(currentConfig);
    }

    renderModal(currentConfig);
    destroyFns.push(close);

    return {
        destroy: close,
        update,
    };
}

export function withInfo(props: ModalProps) {
    return {
        ...props,
        type: 'info' as const,
        icon: props.icon || h(IconInfoCircle),
        hasCancel: false,
    };
}

export function withSuccess(props: ModalProps) {
    return {
        ...props,
        type: 'success' as const,
        icon: props.icon || h(IconTickCircle),
        hasCancel: false,
    };
}

export function withWarning(props: ModalProps) {
    return {
        ...props,
        type: 'warning' as const,
        icon: props.icon || h(IconAlertTriangle),
        hasCancel: false,
    };
}

export function withError(props: ModalProps) {
    return {
        ...omit(props, ['okButtonProps']),
        type: 'error' as const,
        icon: props.icon || h(IconAlertCircle),
        hasCancel: false,
        okButtonProps: { type: 'danger' as const, ...props.okButtonProps },
    };
}

export function withConfirm(props: ModalProps) {
    return {
        ...props,
        type: 'confirm' as const,
        icon: props.icon || h(IconHelpCircle),
    };
}
