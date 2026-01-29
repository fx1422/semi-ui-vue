import { ref, h, createApp, type VNode, type Component } from 'vue';
import { withInfo, withSuccess, withError, withWarning, withConfirm, type ConfirmProps } from './confirm';
import type { ModalProps } from './interface';
import ConfirmModal from './ConfirmModal.vue';

let uuid = 0;

interface UseModalReturn {
    info: (config: ModalProps) => { destroy: () => void; update: (newConfig: ModalProps) => void };
    success: (config: ModalProps) => { destroy: () => void; update: (newConfig: ModalProps) => void };
    error: (config: ModalProps) => { destroy: () => void; update: (newConfig: ModalProps) => void };
    warning: (config: ModalProps) => { destroy: () => void; update: (newConfig: ModalProps) => void };
    confirm: (config: ModalProps) => { destroy: () => void; update: (newConfig: ModalProps) => void };
}

export default function useModal(): [UseModalReturn, VNode] {
    const elements = ref<VNode[]>([]);

    function patchElement(element: VNode): () => void {
        elements.value = [...elements.value, element];

        return () => {
            elements.value = elements.value.filter((ele) => ele !== element);
        };
    }

    function getConfirmFunc(
        withFunc: typeof withInfo | typeof withSuccess | typeof withError | typeof withWarning | typeof withConfirm
    ) {
        return function hookConfirm(config: ModalProps) {
            uuid += 1;

            const div = document.createElement('div');
            document.body.appendChild(div);

            let currentConfig: ConfirmProps = { ...withFunc(config), visible: true } as ConfirmProps;
            let appInstance: any = null;
            let isDestroyed = false;
            const closeFunc = patchElement(h('div', { key: `semi-modal-${uuid}` }));

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
                            setTimeout(() => {
                                destroy();
                                closeFunc();
                            }, 0);
                        }
                    },
                };

                appInstance = createApp({
                    render() {
                        return h(ConfirmModal as Component, componentProps);
                    },
                });

                appInstance.mount(div);
            }

            function destroy() {
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
            }

            function update(newConfig: ModalProps) {
                currentConfig = {
                    ...currentConfig,
                    ...newConfig,
                } as ConfirmProps;
                renderModal(currentConfig);
            }

            renderModal(currentConfig);

            return {
                destroy,
                update,
            };
        };
    }

    const modal = {
        info: getConfirmFunc(withInfo),
        success: getConfirmFunc(withSuccess),
        error: getConfirmFunc(withError),
        warning: getConfirmFunc(withWarning),
        confirm: getConfirmFunc(withConfirm),
    };

    const contextHolder = h('div', { style: { display: 'none' } }, elements.value);

    return [modal, contextHolder];
}
