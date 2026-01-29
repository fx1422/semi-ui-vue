<template>
    <CSSAnimation
        v-if="shouldRender"
        :motion="motion"
        :animationState="visible ? 'enter' : 'leave'"
        :startClassName="visible ? `${prefixCls}-content-animate-show` : `${prefixCls}-content-animate-hide`"
        @animation-end="handleContentAnimationEnd"
    >
        <template #default="{ animationClassName, animationEventsNeedBind }">
            <CSSAnimation
                :motion="motion"
                :animationState="visible ? 'enter' : 'leave'"
                :startClassName="visible ? `${prefixCls}-mask-animate-show` : `${prefixCls}-mask-animate-hide`"
                @animation-end="handleMaskAnimationEnd"
            >
                <template
                    #default="{
                        animationClassName: maskAnimationClassName,
                        animationEventsNeedBind: maskAnimationEventsNeedBind,
                    }"
                >
                    <Portal :style="wrapperStyle" :getPopupContainer="getPopupContainer">
                        <ModalContent
                            v-bind="contentProps"
                            :contentClassName="`${animationClassName} ${modalContentClass || ''}`"
                            :maskClassName="maskAnimationClassName"
                            :contentExtraProps="animationEventsNeedBind"
                            :maskExtraProps="maskAnimationEventsNeedBind"
                            :isFullScreen="isFullScreen"
                            :footer="renderFooter"
                            :modalRender="props.modalRender"
                            @close="handleCancel"
                        >
                            <slot></slot>
                        </ModalContent>
                    </Portal>
                </template>
            </CSSAnimation>
        </template>
    </CSSAnimation>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, h, inject } from 'vue';
import classNames from 'classnames';
import { omit } from 'lodash-es';
import { cssClasses } from '@douyinfe/semi-foundation/modal/constants';
import type { ModalProps, ModalState } from './interface';
import { useFoundation } from '../_utils';
import ModalFoundation, { ModalAdapter } from '@douyinfe/semi-foundation/modal/modalFoundation';
import ModalContent from './ModalContent.vue';
import Portal from '../_portal/Portal.vue';
import CSSAnimation from '../_cssAnimation/index.vue';
import Button from '../button/Button.vue';

const prefixCls = cssClasses.DIALOG;

// 使用 Vue 3 的 defineModel 简化 v-model 实现
const modelValue = defineModel<boolean>();

// 检查是否为命令式调用（通过 ConfirmModal）
const isImperative = inject<boolean>('semi-modal-imperative', false);

const props = withDefaults(defineProps<ModalProps>(), {
    zIndex: 1000,
    motion: true,
    mask: true,
    centered: false,
    closable: true,
    visible: false, // 向后兼容
    okType: 'primary',
    maskClosable: true,
    hasCancel: true,
    maskFixed: false,
    closeOnEsc: true,
    size: 'small',
    keepDOM: false,
    lazyRender: true,
    fullScreen: false,
});

const emit = defineEmits<{
    cancel: [e: MouseEvent];
    ok: [e: MouseEvent];
    'update:visible': [visible: boolean]; // 向后兼容
}>();

const state = ref<ModalState>({
    displayNone: !props.visible,
    isFullScreen: props.fullScreen,
    onOKReturnPromiseStatus: undefined,
    onCancelReturnPromiseStatus: undefined,
});

const bodyOverflow = ref<string | null>(null);
const scrollBarWidth = ref(0);
const originBodyWidth = ref('100%');
const haveRendered = ref(false);

const getScrollbarWidth = () => {
    const scrollDiv = document.createElement('div');
    scrollDiv.style.cssText = 'width: 99px; height: 99px; overflow: scroll; position: absolute; top: -9999px;';
    document.body.appendChild(scrollDiv);
    const scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
    document.body.removeChild(scrollDiv);
    return scrollbarWidth;
};

const adapter: ModalAdapter = {
    disabledBodyScroll: () => {
        const { getPopupContainer } = props;
        bodyOverflow.value = document.body.style.overflow || '';
        if ((!getPopupContainer || getPopupContainer() === document.body) && bodyOverflow.value !== 'hidden') {
            document.body.style.overflow = 'hidden';
            document.body.style.width = `calc(${originBodyWidth.value || '100%'} - ${scrollBarWidth.value}px)`;
        }
    },
    enabledBodyScroll: () => {
        const { getPopupContainer } = props;
        if (
            (!getPopupContainer || getPopupContainer() === document.body) &&
            bodyOverflow.value !== null &&
            bodyOverflow.value !== 'hidden'
        ) {
            document.body.style.overflow = bodyOverflow.value;
            document.body.style.width = originBodyWidth.value;
        }
    },
    notifyCancel: (e: MouseEvent) => {
        emit('cancel', e);
    },
    notifyOk: (e: MouseEvent) => {
        emit('ok', e);
    },
    notifyClose: () => {
        props.afterClose?.();
    },
    toggleDisplayNone: (displayNone: boolean, callback?: (displayNone: boolean) => void) => {
        if (displayNone !== state.value.displayNone) {
            state.value.displayNone = displayNone;
            callback?.(displayNone);
        }
    },
    notifyFullScreen: (isFullScreen: boolean) => {
        if (isFullScreen !== state.value.isFullScreen) {
            state.value.isFullScreen = isFullScreen;
        }
    },
    getProps: () => props,
    getProp: (key: string) => (props as any)[key],
    getState: (key: string) => (state.value as any)[key],
    getStates: () => state.value,
    setState: (newState: Partial<ModalState>) => {
        Object.assign(state.value, newState);
    },
    getContext: () => undefined,
    getContexts: () => ({}),
    getCache: () => undefined,
    getCaches: () => ({}),
    setCache: () => {},
    stopPropagation: (e: any) => e?.stopPropagation?.(),
    persistEvent: () => {},
};

const { foundation } = useFoundation(ModalFoundation as any, adapter as any);
const modalFoundation = foundation as ModalFoundation;

const handleCancel = (e: MouseEvent) => {
    modalFoundation.handleCancel(e);
    // 只有当不是命令式调用时才自动更新 v-model
    if (!isImperative) {
        modelValue.value = false;
        // 向后兼容：同时触发 visible 的更新事件
        emit('update:visible', false);
    }
};

const handleOk = (e: MouseEvent) => {
    modalFoundation.handleOk(e);
};

const handleContentAnimationEnd = () => {
    updateState();
};

const handleMaskAnimationEnd = () => {
    updateState();
};

const updateState = () => {
    const currentVisible = visible.value;
    modalFoundation.toggleDisplayNone(!currentVisible);
};

const renderFooter = computed(() => {
    if (props.footer !== undefined && props.footer !== null) {
        return props.footer;
    }
    const cancelButton = props.hasCancel
        ? h(
              Button,
              {
                  'aria-label': 'cancel',
                  onClick: handleCancel,
                  loading:
                      props.cancelLoading === undefined
                          ? state.value.onCancelReturnPromiseStatus === 'pending'
                          : props.cancelLoading,
                  type: 'tertiary',
                  block: props.footerFill,
                  autoFocus: true,
                  ...props.cancelButtonProps,
                  style: {
                      ...(props.footerFill ? { marginLeft: 'unset' } : {}),
                      ...props.cancelButtonProps?.style,
                  },
              },
              { default: () => props.cancelText || '取消' }
          )
        : null;

    const okButton = h(
        Button,
        {
            'aria-label': 'confirm',
            type: props.okType,
            theme: 'solid',
            block: props.footerFill,
            loading:
                props.confirmLoading === undefined
                    ? state.value.onOKReturnPromiseStatus === 'pending'
                    : props.confirmLoading,
            onClick: handleOk,
            ...props.okButtonProps,
        },
        { default: () => props.okText || '确定' }
    );

    return h(
        'div',
        {
            class: classNames({
                [`${prefixCls}-footerfill`]: props.footerFill,
            }),
        },
        [cancelButton, okButton].filter(Boolean)
    );
});

const isFullScreen = computed(() => state.value.isFullScreen);
const visible = computed(() => {
    // 如果 props.visible 是 true（用户显式传递或命令式调用），优先使用
    if (props.visible === true) {
        return true;
    }

    // 如果 modelValue 是 true（v-model 控制），使用它
    if (modelValue.value === true) {
        return true;
    }

    // 其他情况都返回 false
    return false;
});

const shouldRender = computed(() => {
    const result =
        visible.value ||
        (props.keepDOM && (!props.lazyRender || haveRendered.value)) ||
        (props.motion && !state.value.displayNone);
    return result;
});

const wrapperStyle = computed(() => {
    const style: any = { zIndex: props.zIndex };
    if (props.getPopupContainer && props.getPopupContainer() !== document.body) {
        style.position = 'static';
    }
    return style;
});

const classList = computed(() => {
    return classNames(props.className, {
        [`${prefixCls}-displayNone`]: props.keepDOM && state.value.displayNone,
    });
});

const contentProps = computed(() => {
    const excludedProps = [
        'footer',
        'motion',
        'keepDOM',
        'zIndex',
        'getPopupContainer',
        'visible',
        'modalContentClass',
        'modalRender',
        'afterClose',
        'cancelButtonProps',
        'cancelText',
        'confirmLoading',
        'cancelLoading',
        'hasCancel',
        'okButtonProps',
        'okText',
        'okType',
        'onCancel',
        'onOk',
        'fullScreen',
        'preventScroll',
        'footerFill',
        'lazyRender',
    ];
    return {
        ...omit(props, excludedProps),
        className: classList.value,
    };
});

watch(
    () => props.fullScreen,
    (newVal) => {
        if (newVal !== state.value.isFullScreen) {
            state.value.isFullScreen = newVal;
        }
    }
);

watch(
    () => visible.value,
    (newVal, oldVal) => {
        // 更新displayNone状态
        if (newVal && state.value.displayNone) {
            state.value.displayNone = false;
        } else if (!newVal && !state.value.displayNone) {
            // 当visible变为false时，如果没有动画，立即设置displayNone为true
            // 如果有动画，则等待动画结束后设置
            if (!props.motion) {
                state.value.displayNone = true;
            }
        }

        if (!oldVal && newVal) {
            modalFoundation.beforeShow();
        } else if (oldVal && !newVal) {
            // visible 从 true 变为 false，需要调用 afterHide
            modalFoundation.afterHide();
        }
    },
    { immediate: true }
);

watch(
    () => state.value.displayNone,
    (newVal, oldVal) => {
        if (!oldVal && newVal) {
            modalFoundation.afterHide();
        }
    }
);

onMounted(() => {
    scrollBarWidth.value = getScrollbarWidth();
    originBodyWidth.value = document.body.style.width;

    if (visible.value) {
        modalFoundation.beforeShow();
    }
});

onBeforeUnmount(() => {
    if (visible.value) {
        modalFoundation.destroy();
    } else {
        modalFoundation.enabledBodyScroll();
    }
});

watch(shouldRender, (newVal) => {
    if (newVal) {
        haveRendered.value = true;
    }
});
</script>
