<template>
    <div :class="rootCls" v-bind="dataAttrs">
        <div v-if="mask" :class="maskCls" :style="maskStyle" v-bind="maskExtraProps"></div>

        <div
            role="none"
            :class="wrapperCls"
            v-bind="contentExtraProps"
            @click="handleMaskClick"
            @mouseup="handleMaskMouseUp"
        >
            <div :class="dialogCls" :style="dialogStyle" @mousedown="handleDialogMouseDown">
                <component :is="modalContentElement" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick, h, useSlots, type VNode } from 'vue';
import classNames from 'classnames';
import { get } from 'lodash-es';
import { cssClasses } from '@douyinfe/semi-foundation/modal/constants';
import { IconClose } from '../icons';
import Button from '../button/Button.vue';
import Typography from '../typography';
import type { ModalContentProps } from './interface';
import { useFoundation } from '../_utils';
import ModalContentFoundation, { ModalContentAdapter } from '@douyinfe/semi-foundation/modal/modalContentFoundation';

defineOptions({ inheritAttrs: false });

const prefixCls = cssClasses.DIALOG;

const props = withDefaults(defineProps<ModalContentProps>(), {
    closable: true,
    mask: true,
    maskClosable: true,
    centered: false,
    maskFixed: false,
    closeOnEsc: true,
});

const emit = defineEmits<{
    close: [e: MouseEvent];
}>();

const slots = useSlots();

const modalDialogRef = ref<HTMLDivElement>();

const state = ref<{ dialogMouseDown: boolean; prevFocusElement: HTMLElement | null }>({
    dialogMouseDown: false,
    prevFocusElement: null,
});

onMounted(() => {
    state.value.prevFocusElement = document.activeElement as HTMLElement;
});

const adapter: ModalContentAdapter = {
    notifyClose: (e: MouseEvent) => {
        emit('close', e);
    },
    notifyDialogMouseDown: () => {
        state.value.dialogMouseDown = true;
    },
    notifyDialogMouseUp: () => {
        if (state.value.dialogMouseDown) {
            setTimeout(() => {
                state.value.dialogMouseDown = false;
            }, 0);
        }
    },
    addKeyDownEventListener: () => {
        if (props.closeOnEsc) {
            document.addEventListener('keydown', handleKeyDown);
        }
    },
    removeKeyDownEventListener: () => {
        if (props.closeOnEsc) {
            document.removeEventListener('keydown', handleKeyDown);
        }
    },
    getMouseState: () => state.value.dialogMouseDown,
    modalDialogFocus: () => {
        nextTick(() => {
            modalDialogRef.value?.focus({ preventScroll: true });
        });
    },
    modalDialogBlur: () => {
        modalDialogRef.value?.blur();
    },
    prevFocusElementReFocus: () => {
        if (state.value.prevFocusElement && typeof state.value.prevFocusElement.focus === 'function') {
            state.value.prevFocusElement.focus({ preventScroll: true });
        }
    },
    getState: (key: string) => (state.value as any)[key],
    getStates: () => state.value,
    setState: (newState: Partial<typeof state.value>) => {
        Object.assign(state.value, newState);
    },
    getContext: () => undefined,
    getContexts: () => ({}),
    getProp: (key: string) => (props as any)[key],
    getProps: () => props as any,
    getCache: () => undefined,
    getCaches: () => ({}),
    setCache: () => {},
    stopPropagation: (e: any) => e?.stopPropagation?.(),
    persistEvent: () => {},
};

const { foundation } = useFoundation(ModalContentFoundation as any, adapter as any);
const modalContentFoundation = foundation as ModalContentFoundation;

const handleKeyDown = (e: KeyboardEvent) => {
    modalContentFoundation.handleKeyDown(e);
};

const handleMaskMouseUp = () => {
    if (props.maskClosable) {
        modalContentFoundation.handleMaskMouseUp();
    }
};

const handleMaskClick = (e: MouseEvent) => {
    if (props.maskClosable) {
        modalContentFoundation.handleMaskClick(e);
    }
};

const handleDialogMouseDown = () => {
    modalContentFoundation.handleDialogMouseDown();
};

const handleClose = (e: MouseEvent) => {
    modalContentFoundation.close(e);
};

const renderCloseBtn = (): VNode | null => {
    const { closable, closeIcon } = props;
    if (!closable) {
        return null;
    }
    const iconType = closeIcon || h(IconClose);
    return h(Button, {
        key: 'close-btn',
        onClick: handleClose,
        type: 'tertiary',
        icon: iconType,
        theme: 'borderless',
        size: 'small',
        className: `${prefixCls}-close`,
        'aria-label': 'Close',
    });
};

const renderIcon = (): VNode | null => {
    const { icon } = props;
    return icon ? h('span', { class: `${prefixCls}-icon-wrapper`, 'x-semi-prop': 'icon' }, [icon]) : null;
};

const renderHeader = (): VNode | null => {
    if (props.header !== undefined && props.header !== null) {
        return props.header as any;
    }
    const { title } = props;

    if (title === null || title === undefined) {
        return null;
    }

    const closer = renderCloseBtn();
    const icon = renderIcon();

    const headerChildren = [
        icon,
        h(
            Typography.Title,
            {
                heading: 5,
                className: `${prefixCls}-title`,
                id: `${prefixCls}-title`,
                'x-semi-prop': 'title',
            },
            { default: () => title }
        ),
        closer,
    ].filter((child) => child !== null);

    return h('div', { class: `${prefixCls}-header` }, headerChildren);
};

const renderBody = (): VNode => {
    const { bodyStyle, title } = props;
    const bodyCls = classNames(`${prefixCls}-body`, {
        [`${prefixCls}-withIcon`]: props.icon,
    });
    const closer = renderCloseBtn();
    const icon = renderIcon();
    const hasHeader = (title !== null && title !== undefined) || (props.header !== undefined && props.header !== null);
    const children = slots.default?.();

    if (hasHeader) {
        return h(
            'div',
            {
                class: bodyCls,
                id: `${prefixCls}-body`,
                style: bodyStyle,
                'x-semi-prop': 'children',
            },
            children
        );
    } else {
        return h('div', { class: `${prefixCls}-body-wrapper` }, [
            icon,
            h(
                'div',
                {
                    class: bodyCls,
                    style: bodyStyle,
                    'x-semi-prop': 'children',
                },
                children
            ),
            closer,
        ]);
    }
};

const renderFooter = (): VNode | null => {
    const { footer } = props;
    return footer ? h('div', { class: `${prefixCls}-footer`, 'x-semi-prop': 'footer' }, [footer]) : null;
};

const modalContentElement = computed((): VNode => {
    const contentCls = classNames(`${prefixCls}-content`, props.contentClassName, {
        [`${prefixCls}-content-fullScreen`]: props.isFullScreen,
        [`${prefixCls}-content-height-set`]: props.height || get(props.style, 'height'),
    });

    const header = renderHeader();
    const body = renderBody();
    const footer = renderFooter();

    const contentElement = h(
        'div',
        {
            role: 'dialog',
            ref: modalDialogRef,
            'aria-modal': 'true',
            'aria-labelledby': `${prefixCls}-title`,
            'aria-describedby': `${prefixCls}-body`,
            class: contentCls,
            onAnimationEnd: props.onAnimationEnd,
        },
        [header, body, footer]
    );

    if (props.modalRender) {
        return props.modalRender(contentElement) as VNode;
    }

    return contentElement;
});

const rootCls = computed(() => {
    const { direction } = props;
    return classNames(props.className, {
        [`${prefixCls}-popup`]:
            props.getPopupContainer && props.getPopupContainer() !== globalThis?.document?.body && !props.maskFixed,
        [`${prefixCls}-fixed`]: props.maskFixed,
        [`${prefixCls}-rtl`]: direction === 'rtl',
    });
});

const wrapperCls = computed(() => {
    return classNames({
        [`${prefixCls}-wrap`]: true,
        [`${prefixCls}-wrap-center`]: props.centered,
    });
});

const maskCls = computed(() => {
    return classNames(`${prefixCls}-mask`, props.maskClassName, {
        [`${prefixCls}-mask-fixed`]: props.maskFixed,
    });
});

const dialogCls = computed(() => {
    return classNames(prefixCls, {
        [`${prefixCls}-centered`]: props.centered,
        [`${prefixCls}-${props.size}`]: props.size,
    });
});

const dialogStyle = computed(() => {
    const style: any = { ...props.style };
    if (props.width) {
        style.width = typeof props.width === 'number' ? `${props.width}px` : props.width;
    }
    if (props.height) {
        style.height = typeof props.height === 'number' ? `${props.height}px` : props.height;
    }
    if (props.isFullScreen) {
        style.width = '100%';
        style.height = '100%';
        style.margin = 'unset';
    }
    return style;
});

const maskStyle = computed(() => props.maskStyle || {});

const dataAttrs = computed(() => {
    const attrs: Record<string, any> = {};
    Object.keys(props).forEach((key) => {
        if (key.startsWith('data-') || key.startsWith('aria-')) {
            attrs[key] = (props as any)[key];
        }
    });
    return attrs;
});

onMounted(() => {
    modalContentFoundation.modalDialogFocus();
});

onBeforeUnmount(() => {
    modalContentFoundation.destroy();
});
</script>
