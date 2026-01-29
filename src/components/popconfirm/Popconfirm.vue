<template>
    <Popover
        v-if="!disabled"
        ref="popoverRef"
        v-bind="popoverProps"
        :position="finalPosition"
        :content="() => renderConfirmPopCard()"
        :class="cssClasses.POPOVER"
        @visible-change="handleVisibleChange"
        @click-out-side="handleClickOutSide"
    >
        <slot></slot>
    </Popover>
    <template v-else>
        <slot></slot>
    </template>
</template>

<script setup lang="ts" name="Popconfirm">
import { ref, reactive, computed, watch, nextTick, h, getCurrentInstance, useSlots, VNode } from 'vue';
import { isFunction, omit } from 'lodash-es';
import { cssClasses, numbers } from '@douyinfe/semi-foundation/popconfirm/constants';
import PopconfirmFoundation, { PopconfirmAdapter } from '@douyinfe/semi-foundation/popconfirm/popconfirmFoundation';
import { IconClose, IconAlertTriangle } from '../icons';
import Popover from '../popover/Popover.vue';
import Button from '../button/Button.vue';
import type { PopconfirmProps, PopconfirmState, RenderContentProps } from './interface';

const props = withDefaults(defineProps<PopconfirmProps>(), {
    stopPropagation: true,
    trigger: 'click',
    disabled: false,
    icon: () => h(IconAlertTriangle, { size: 'extra-large' }),
    okType: 'primary',
    cancelType: 'tertiary',
    prefixCls: cssClasses.PREFIX,
    zIndex: numbers.DEFAULT_Z_INDEX,
    showCloseIcon: true,
    position: 'bottomLeft',
    motion: true,
    autoAdjustOverflow: true,
});

const emit = defineEmits<{
    confirm: [e: MouseEvent];
    cancel: [e: MouseEvent];
    visibleChange: [visible: boolean];
    clickOutSide: [e: MouseEvent];
}>();

// 获取插槽
const slots = useSlots();

// 组件引用
const popoverRef = ref<InstanceType<typeof Popover> | null>(null);
const footerRef = ref<HTMLDivElement | null>(null);

// 组件状态
const state = reactive<PopconfirmState>({
    visible: props.defaultVisible || false,
    cancelLoading: false,
    confirmLoading: false,
});

// 计算最终位置（支持 RTL）
const finalPosition = computed(() => {
    if (props.position) {
        return props.position;
    }
    // TODO: 支持 RTL，从 ConfigContext 获取 direction，根据 direction 返回 'bottomRight' 或 'bottomLeft'
    return 'bottomLeft';
});

// 判断组件是否受控（通过检测父组件是否传递了 visible prop）
const instance = getCurrentInstance();
const isControlled = computed(() => {
    // 检查 vnode.props 中是否有 visible 或 v-model:visible
    const vnodeProps = instance?.vnode.props;
    return vnodeProps && ('visible' in vnodeProps || 'v-model:visible' in vnodeProps);
});

// Foundation 适配器
const adapter: PopconfirmAdapter<PopconfirmProps, PopconfirmState> = {
    getProps: () => props,
    getProp: (key: string) => (props as Record<string, unknown>)[key],
    getState: (key: string) => (state as Record<string, unknown>)[key],
    getStates: () => state,
    setState: (partialState: Partial<PopconfirmState>) => {
        Object.assign(state, partialState);
    },
    getContext: () => null,
    getContexts: () => ({}),
    getCache: () => null,
    setCache: () => {},
    getCaches: () => ({}),
    stopPropagation: (e: Event | MouseEvent | KeyboardEvent) => {
        if ('stopPropagation' in e && typeof e.stopPropagation === 'function') {
            e.stopPropagation();
        }
    },
    persistEvent: () => {},

    // Popconfirm 特定方法
    setVisible: (visible: boolean) => {
        state.visible = visible;
    },
    updateConfirmLoading: (loading: boolean) => {
        state.confirmLoading = loading;
    },
    updateCancelLoading: (loading: boolean) => {
        state.cancelLoading = loading;
    },
    notifyConfirm: (e: MouseEvent) => {
        const result = props.onConfirm?.(e);
        emit('confirm', e);
        return result;
    },
    notifyCancel: (e: MouseEvent) => {
        const result = props.onCancel?.(e);
        emit('cancel', e);
        return result;
    },
    notifyVisibleChange: (visible: boolean) => {
        props.onVisibleChange?.(visible);
        emit('visibleChange', visible);
    },
    notifyClickOutSide: (e: MouseEvent) => {
        props.onClickOutSide?.(e);
        emit('clickOutSide', e);
    },
    focusCancelButton: () => {
        nextTick(() => {
            const buttonNode = footerRef.value?.querySelector('[data-type=cancel]') as HTMLElement;
            buttonNode?.focus({ preventScroll: true });
        });
    },
    focusOkButton: () => {
        nextTick(() => {
            const buttonNode = footerRef.value?.querySelector('[data-type=ok]') as HTMLElement;
            buttonNode?.focus({ preventScroll: true });
        });
    },
    focusPrevFocusElement: () => {
        // TODO: Popover 组件暂未暴露 focusTrigger 方法，待 Popover 完善后实现
    },
};

// 初始化 Foundation
const foundation = new PopconfirmFoundation(adapter);

// 事件处理函数
const handleCancel = (e: MouseEvent) => {
    foundation.handleCancel(e);
};

const handleConfirm = (e: MouseEvent) => {
    foundation.handleConfirm(e);
};

const handleVisibleChange = (visible: boolean) => {
    foundation.handleVisibleChange(visible);
};

const handleClickOutSide = (e: MouseEvent) => {
    foundation.handleClickOutSide(e);
};

const stopImmediatePropagation = (e: Event) => {
    e?.stopImmediatePropagation?.();
};

// 渲染操作按钮
const renderControls = () => {
    // TODO: 从 LocaleConsumer 获取国际化文本
    const okText = props.okText || '确定';
    const cancelText = props.cancelText || '取消';

    return [
        h(
            Button,
            {
                'data-type': 'cancel',
                type: props.cancelType,
                onClick: handleCancel,
                loading: state.cancelLoading,
                ...omit(props.cancelButtonProps, 'autoFocus'),
            },
            { default: () => cancelText }
        ),
        h(
            Button,
            {
                'data-type': 'ok',
                type: props.okType,
                theme: 'solid',
                onClick: handleConfirm,
                loading: state.confirmLoading,
                ...omit(props.okButtonProps, 'autoFocus'),
            },
            { default: () => okText }
        ),
    ];
};

// 渲染确认弹出卡片
const renderConfirmPopCard = () => {
    const showTitle = props.title !== null && typeof props.title !== 'undefined';
    const showContent = !(props.content === null || typeof props.content === 'undefined');
    // 检查 icon 是否为有效的 VNode（类似 React.isValidElement）
    const hasIcon = props.icon !== null && props.icon !== undefined && typeof props.icon === 'object';

    const bodyCls = {
        [`${props.prefixCls}-body`]: true,
        [`${props.prefixCls}-body-withIcon`]: hasIcon,
    };

    const popCardCls = {
        [props.prefixCls]: true,
        // TODO: 支持 RTL，从 ConfigContext 获取 direction 后启用
        // [`${props.prefixCls}-rtl`]: direction === 'rtl',
        ...(props.className ? { [props.className]: true } : {}),
    };

    const headerContent = [];

    // 渲染图标
    // 优先使用 icon 插槽，如果没有插槽内容则使用 props.icon
    const iconSlot = slots.icon?.();
    if (iconSlot && iconSlot.length > 0) {
        headerContent.push(
            h(
                'i',
                {
                    class: `${props.prefixCls}-header-icon`,
                    'x-semi-prop': 'icon',
                },
                iconSlot
            )
        );
    } else if (hasIcon) {
        // 如果 icon 是函数（默认值），调用它获取 VNode
        const iconContent = typeof props.icon === 'function' ? (props.icon as () => VNode)() : props.icon;
        headerContent.push(
            h(
                'i',
                {
                    class: `${props.prefixCls}-header-icon`,
                    'x-semi-prop': 'icon',
                },
                [iconContent]
            )
        );
    }

    // 渲染标题区域
    const headerBodyChildren = [];
    if (showTitle) {
        headerBodyChildren.push(
            h(
                'div',
                {
                    class: `${props.prefixCls}-header-title`,
                    'x-semi-prop': 'title',
                },
                [props.title]
            )
        );
    }

    headerContent.push(
        h(
            'div',
            {
                class: `${props.prefixCls}-header-body`,
            },
            headerBodyChildren
        )
    );

    // 渲染关闭按钮
    if (props.showCloseIcon) {
        headerContent.push(
            h(Button, {
                class: `${props.prefixCls}-btn-close`,
                icon: h(IconClose),
                size: 'small',
                theme: 'borderless',
                type: props.cancelType,
                onClick: handleCancel,
            })
        );
    }

    const children = [
        // 头部
        h(
            'div',
            {
                class: `${props.prefixCls}-header`,
            },
            headerContent
        ),
    ];

    // 内容区域
    if (showContent) {
        const contentValue = isFunction(props.content)
            ? (props.content as (props: RenderContentProps) => VNode | string)({})
            : props.content;
        children.push(
            h(
                'div',
                {
                    class: bodyCls,
                    'x-semi-prop': 'content',
                },
                contentValue as any
            )
        );
    }

    // 底部操作按钮区域
    children.push(
        h(
            'div',
            {
                class: `${props.prefixCls}-footer`,
                ref: footerRef,
            },
            renderControls()
        )
    );

    return h(
        'div',
        {
            class: popCardCls,
            style: props.style,
            onClick: stopImmediatePropagation,
        },
        [
            h(
                'div',
                {
                    class: `${props.prefixCls}-inner`,
                },
                children
            ),
        ]
    );
};

// 传递给 Popover 的 props
const popoverProps = computed(() => {
    const result: Record<string, unknown> = {
        ...omit(props, [
            'cancelText',
            'cancelButtonProps',
            'cancelType',
            'defaultVisible',
            'disabled',
            'icon',
            'okText',
            'okType',
            'okButtonProps',
            'title',
            'content',
            'onCancel',
            'onConfirm',
            'onVisibleChange',
            'onClickOutSide',
            'showCloseIcon',
            'prefixCls', // 不传递 prefixCls，避免覆盖 Popover 的默认 prefixCls
        ]),
        contentClassName: cssClasses.POPOVER, // 使用 contentClassName 而不是传递 prefixCls
    };

    // 如果有异步操作正在进行且使用 hover trigger，设置很大的 mouseLeaveDelay 防止自动关闭
    const hasAsyncOperation = state.confirmLoading || state.cancelLoading;
    const userTrigger = props.trigger || 'click'; // 我们的默认是 click
    if (hasAsyncOperation && userTrigger === 'hover') {
        result.mouseLeaveDelay = 999999; // 防止自动关闭
    }

    // 受控模式下传递 visible 和使用 custom trigger
    if (isControlled.value) {
        result.visible = state.visible;
        result.trigger = 'custom';
    } else {
        // 非受控模式下使用 click trigger
        result.trigger = 'click';
    }

    return result;
});

// 监听 visible prop 的变化（受控模式）
watch(
    () => props.visible,
    (newVal) => {
        if (newVal !== undefined) {
            state.visible = newVal;
        }
    }
);

// 暴露公共方法
defineExpose({
    focusCancelButton: () => adapter.focusCancelButton(),
    focusOkButton: () => adapter.focusOkButton(),
});
</script>
