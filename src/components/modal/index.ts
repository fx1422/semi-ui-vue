import ModalComponent from './Modal.vue';
import confirm, {
    withInfo,
    withSuccess,
    withError,
    withWarning,
    withConfirm,
    destroyFns,
    type ConfirmProps,
} from './confirm';
import useModal from './useModal';
import type { ModalProps, ModalState, ModalContentProps } from './interface';

// 导入样式（自动引入）
import './modal.scss';

// 直接添加静态方法到 ModalComponent 对象
(ModalComponent as any).info = (props: ModalProps) => confirm(withInfo(props));
(ModalComponent as any).success = (props: ModalProps) => confirm(withSuccess(props));
(ModalComponent as any).error = (props: ModalProps) => confirm(withError(props));
(ModalComponent as any).warning = (props: ModalProps) => confirm(withWarning(props));
(ModalComponent as any).confirm = (props: ModalProps) => confirm(withConfirm(props));
(ModalComponent as any).destroyAll = () => {
    while (destroyFns.length) {
        const close = destroyFns.pop();
        if (close) {
            close();
        }
    }
};
(ModalComponent as any).useModal = useModal;

export type { ModalProps, ModalState, ModalContentProps, ConfirmProps };
export { ModalComponent as Modal };
export default ModalComponent;
