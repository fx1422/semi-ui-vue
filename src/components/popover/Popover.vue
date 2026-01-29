<template>
    <Tooltip
        ref="tooltipRef"
        :trigger="props.trigger"
        :position="props.position"
        :style="props.style"
        :content="renderPopCard"
        :prefix-cls="prefixCls"
        :spacing="computedSpacing"
        :show-arrow="arrowElement"
        :arrow-bounding="props.arrowBounding"
        :role="computedRole"
        :mouse-enter-delay="props.mouseEnterDelay"
        :mouse-leave-delay="props.mouseLeaveDelay"
        :auto-adjust-overflow="props.autoAdjustOverflow"
        :get-popup-container="props.getPopupContainer"
        :visible="props.visible"
        :motion="props.motion"
        :margin="props.margin"
        :z-index="props.zIndex"
        :click-to-hide="props.clickToHide"
        :click-trigger-to-hide="props.clickTriggerToHide"
        :close-on-esc="props.closeOnEsc"
        :guard-focus="props.guardFocus"
        :return-focus-on-close="props.returnFocusOnClose"
        :transform-from-center="props.transformFromCenter"
        :arrow-point-at-center="props.arrowPointAtCenter"
        :stop-propagation="props.stopPropagation === true"
        :re-pos-key="props.rePosKey"
        :wrap-when-special="props.wrapWhenSpecial"
        :wrapper-class-name="props.wrapperClassName"
        :disable-arrow-key-down="props.disableArrowKeyDown"
        :wrapper-id="props.wrapperId"
        :prevent-scroll="props.preventScroll"
        :disable-focus-listener="props.disableFocusListener"
        :after-close="props.afterClose"
        :keep-d-o-m="props.keepDOM"
        @visible-change="handleVisibleChange"
        @click-outside="handleClickOutSide"
        @esc-key-down="handleEscKeyDown"
    >
        <slot></slot>
    </Tooltip>
</template>

<script setup lang="ts" name="Popover">
import { computed, h, ref, useSlots } from 'vue';
import classNames from 'classnames';
import { cssClasses, numbers } from '@douyinfe/semi-foundation/popover/constants';
import Tooltip from '../tooltip/Tooltip.vue';
import Arrow from './Arrow.vue';
import type { PopoverProps } from './interface';

// ====== Slots 定义 ======
const slots = useSlots();

// ====== Props 定义 ======
// 严格对照 React 版本的 defaultProps
const props = withDefaults(defineProps<PopoverProps>(), {
    arrowBounding: () => numbers.ARROW_BOUNDING,
    showArrow: false,
    autoAdjustOverflow: true,
    zIndex: numbers.DEFAULT_Z_INDEX,
    motion: true,
    trigger: 'hover',
    position: 'bottom', // ✅ React 默认为 'bottom'
    prefixCls: cssClasses.PREFIX,
    closeOnEsc: true,
    returnFocusOnClose: true,
    guardFocus: true,
    disableFocusListener: true,
    // 注意：mouseEnterDelay 和 mouseLeaveDelay 不设置默认值，
    // 让 Tooltip 使用自己的默认值（50ms）
});

// ====== Emits 定义 ======
const emit = defineEmits<{
    'update:visible': [visible: boolean]; // v-model:visible 支持
    visibleChange: [visible: boolean];
    clickOutSide: [e: MouseEvent];
    escKeyDown: [e: KeyboardEvent];
}>();

// ====== Refs ======
const tooltipRef = ref();

// ====== Computed Properties ======

const prefixCls = computed(() => props.prefixCls);

// 计算 role 属性 - 严格对照 React 版本
// React: const role = trigger === 'click' || trigger === 'custom' ? 'dialog' : 'tooltip';
const computedRole = computed(() => {
    return props.trigger === 'click' || props.trigger === 'custom' ? 'dialog' : 'tooltip';
});

// 计算 spacing - 严格对照 React 版本
// React: if (isNullOrUndefined(spacing)) {
//     spacing = showArrow ? numbers.SPACING_WITH_ARROW : numbers.SPACING;
// }
const computedSpacing = computed(() => {
    if (props.spacing !== undefined) {
        return props.spacing;
    }
    return props.showArrow ? numbers.SPACING_WITH_ARROW : numbers.SPACING;
});

// 渲染箭头组件 - 严格对照 React 版本
// React: const arrow = showArrow ? <Arrow {...arrowProps} /> : false;
const arrowElement = computed(() => {
    if (!props.showArrow) {
        return false;
    }

    const arrowProps = {
        position: props.position,
        className: '',
        popStyle: props.style,
        arrowStyle: props.arrowStyle,
    };

    return h(Arrow, arrowProps);
});

// ====== Methods ======

/**
 * 渲染 Popover 卡片内容
 * 严格对照 React 的 renderPopCard 方法，同时支持 Vue slots
 */
const renderPopCard = (renderProps: { initialFocusRef?: unknown }) => {
    const { initialFocusRef } = renderProps;

    // React: const popCardCls = classNames(prefixCls, contentClassName, { [`${prefixCls}-rtl`]: direction === 'rtl' });
    // 注意：classNames 返回字符串，需要确保在 h 函数中正确使用
    const popCardCls = classNames(
        prefixCls.value,
        props.contentClassName
        // RTL 支持可以后续添加
    );

    // 渲染 content 节点 - 优先使用 slot，其次使用 prop
    // 支持作用域插槽，传递 initialFocusRef 给插槽
    const contentNode = slots.content
        ? slots.content({ initialFocusRef })
        : renderContentNode({ initialFocusRef, content: props.content });

    // 处理 title - 优先使用 slot，其次使用 prop
    const titleContent = slots.title ? slots.title() : props.title;

    // React 版本的 DOM 结构：
    // <div className={popCardCls}>
    //     <div className={`${prefixCls}-content`}>{contentNode}</div>
    // </div>
    // 如果有 title，需要添加 title div（样式文件中有对应的样式定义）
    const children = [];

    if (titleContent) {
        children.push(h('div', { class: `${prefixCls.value}-title` }, titleContent));
    }

    children.push(h('div', { class: `${prefixCls.value}-content` }, contentNode));

    return h('div', { class: popCardCls }, children);
};

/**
 * 渲染内容节点
 * 严格对照 React 的 renderContentNode 方法
 */
const renderContentNode = (renderProps: { content: unknown; initialFocusRef?: unknown }) => {
    const { initialFocusRef, content } = renderProps;
    const contentProps = { initialFocusRef };

    // React: return !isFunction(content) ? content : content(contentProps);
    if (typeof content === 'function') {
        return content(contentProps);
    }
    return content;
};

/**
 * Focus on tooltip trigger
 * 对照 React 的公共方法
 */
const focusTrigger = () => {
    tooltipRef.value?.focusTrigger();
};

// ====== Event Handlers ======

const handleVisibleChange = (visible: boolean) => {
    emit('update:visible', visible); // v-model:visible 支持
    emit('visibleChange', visible);
};

const handleClickOutSide = (e: MouseEvent) => {
    emit('clickOutSide', e);
};

const handleEscKeyDown = (e: KeyboardEvent) => {
    emit('escKeyDown', e);
};

// ====== Expose Public Methods ======
defineExpose({
    focusTrigger,
});
</script>
