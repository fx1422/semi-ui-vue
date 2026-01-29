<template>
    <CSSAnimation
        :motion="motionEnabled"
        :animationState="visible ? 'enter' : 'leave'"
        :startClassName="visible ? `${prefixCls}-animation-mask_show` : `${prefixCls}-animation-mask_hide`"
        :onAnimationStart="handleAnimationStart"
        :onAnimationEnd="updateState"
    >
        <template
            #default="{
                animationClassName: maskAnimationClassName,
                animationEventsNeedBind: maskAnimationEventsNeedBind,
            }"
        >
            <CSSAnimation
                :motion="motionEnabled"
                :animationState="visible ? 'enter' : 'leave'"
                :startClassName="
                    visible
                        ? `${prefixCls}-animation-content_show_${placement}`
                        : `${prefixCls}-animation-content_hide_${placement}`
                "
                :onAnimationStart="handleAnimationStart"
                :onAnimationEnd="updateState"
            >
                <template #default="{ animationClassName, animationStyle, animationEventsNeedBind }">
                    <Portal v-if="shouldRender" :style="wrapperStyle" :getPopupContainer="getPopupContainer">
                        <SideSheetContent
                            v-bind="contentProps"
                            :maskExtraProps="maskAnimationEventsNeedBind"
                            :wrapperExtraProps="animationEventsNeedBind"
                            :dialogClassName="animationClassName"
                            :maskClassName="maskAnimationClassName"
                            :maskStyle="{ ...maskStyle }"
                            :style="{ ...animationStyle, ...style }"
                        >
                            <slot></slot>
                        </SideSheetContent>
                    </Portal>
                </template>
            </CSSAnimation>
        </template>
    </CSSAnimation>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import classNames from 'classnames';
import { cssClasses, strings } from '@douyinfe/semi-foundation/sideSheet/constants';
import SideSheetFoundation, { SideSheetAdapter } from '@douyinfe/semi-foundation/sideSheet/sideSheetFoundation';
import SideSheetContent from './SideSheetContent.vue';
import Portal from '../_portal/Portal.vue';
import CSSAnimation from '../_cssAnimation/index.vue';
import { useFoundation } from '../_utils';
import { normalizeMotion } from '../_utils/motion';
import type { SideSheetProps, SideSheetState } from './interface';

defineOptions({
    name: 'SideSheet',
});

const props = withDefaults(defineProps<SideSheetProps>(), {
    visible: false,
    motion: true,
    mask: true,
    placement: 'right',
    closable: true,
    footer: null,
    zIndex: 1000,
    maskClosable: true,
    size: 'small',
    disableScroll: true,
    closeOnEsc: false,
    afterVisibleChange: () => {},
    keepDOM: false,
});

const emit = defineEmits<{
    cancel: [e: MouseEvent | KeyboardEvent];
    'update:visible': [visible: boolean];
}>();

const prefixCls = cssClasses.PREFIX;
const defaultHeight = strings.HEIGHT;

// Normalize motion
const normalizedMotion = computed(() => normalizeMotion(props.motion, props));
const motionEnabled = computed(() => normalizedMotion.value.enabled);
const motionObject = computed(() => normalizedMotion.value.motionObject);

// State
const state = ref<SideSheetState>({
    displayNone: !props.visible,
});

const bodyOverflow = ref<string>('');
const scrollBarWidth = ref(0);
const originBodyWidth = ref('100%');

// Get scrollbar width
const getScrollbarWidth = () => {
    const scrollDiv = document.createElement('div');
    scrollDiv.style.cssText = 'width: 99px; height: 99px; overflow: scroll; position: absolute; top: -9999px;';
    document.body.appendChild(scrollDiv);
    const scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
    document.body.removeChild(scrollDiv);
    return scrollbarWidth;
};

// Adapter
const adapter: SideSheetAdapter = {
    getProps: () =>
        ({
            ...props,
            motion: motionEnabled.value,
        }) as any,
    getProp: (key: string) => (props as any)[key],
    getState: (key: string) => {
        const stateMap: Record<string, any> = {
            displayNone: state.value.displayNone,
        };
        return stateMap[key];
    },
    getStates: () => ({
        displayNone: state.value.displayNone,
    }),
    setState: (states: Partial<SideSheetState>, callback?: () => void) => {
        Object.assign(state.value, states);
        callback?.();
    },
    getContext: () => undefined,
    getContexts: () => ({}),
    getCache: () => undefined,
    getCaches: () => ({}),
    setCache: () => {},
    stopPropagation: (e: any) => e?.stopPropagation?.(),
    persistEvent: () => {},
    disabledBodyScroll: () => {
        const { getPopupContainer } = props;
        bodyOverflow.value = document.body.style.overflow || '';
        if (!getPopupContainer && bodyOverflow.value !== 'hidden') {
            document.body.style.overflow = 'hidden';
            document.body.style.width = `calc(${originBodyWidth.value || '100%'} - ${scrollBarWidth.value}px)`;
        }
    },
    enabledBodyScroll: () => {
        const { getPopupContainer } = props;
        if (!getPopupContainer) {
            document.body.style.overflow = bodyOverflow.value;
            document.body.style.width = originBodyWidth.value;
        }
    },
    notifyCancel: (e: MouseEvent | KeyboardEvent) => {
        // 在 Vue 3 中，@cancel 事件监听器会被转换为 onCancel prop
        // emit('cancel', e) 会自动调用 props.onCancel（如果存在），避免重复调用
        emit('cancel', e);
    },
    notifyVisibleChange: (visible: boolean) => {
        props.afterVisibleChange?.(visible);
    },
    setOnKeyDownListener: () => {
        if (typeof window !== 'undefined') {
            window.addEventListener('keydown', handleKeyDown);
        }
    },
    removeKeyDownListener: () => {
        if (typeof window !== 'undefined') {
            window.removeEventListener('keydown', handleKeyDown);
        }
    },
    toggleDisplayNone: (displayNone: boolean) => {
        if (displayNone !== state.value.displayNone) {
            state.value.displayNone = displayNone;
        }
    },
};

const { foundation } = useFoundation(SideSheetFoundation, adapter);

// Handlers
const handleCancel = (e: MouseEvent) => {
    foundation.handleCancel(e);
    // 发出 update:visible 事件以支持 v-model:visible
    emit('update:visible', false);
};

const handleKeyDown = (e: KeyboardEvent) => {
    foundation.handleKeyDown(e);
};

const updateState = () => {
    const state = visible.value ? 'enter' : 'leave';
    if (motionObject.value) {
        if (state === 'enter') {
            motionObject.value.didEnter?.();
        } else if (state === 'leave') {
            motionObject.value.didLeave?.();
        }
        motionObject.value.onRest?.();
    }
    foundation.toggleDisplayNone(!props.visible);
};

const handleAnimationStart = () => {
    const state = visible.value ? 'enter' : 'leave';
    if (motionObject.value) {
        if (state === 'enter') {
            motionObject.value.willEnter?.();
            motionObject.value.onStart?.();
        } else if (state === 'leave') {
            motionObject.value.willLeave?.();
        }
    }
};

// Computed
const visible = computed(() => props.visible);

const shouldRender = computed(() => {
    return props.visible || props.keepDOM || (motionEnabled.value && !state.value.displayNone);
});

const wrapperStyle = computed(() => {
    const style: Record<string, any> = {
        zIndex: props.zIndex,
    };
    if (props.getPopupContainer) {
        style.position = 'static';
    }
    return style;
});

const isVertical = computed(() => {
    return props.placement === 'left' || props.placement === 'right';
});

const isHorizontal = computed(() => {
    return props.placement === 'top' || props.placement === 'bottom';
});

const sheetHeight = computed(() => {
    return isHorizontal.value ? (props.height ? props.height : defaultHeight) : '100%';
});

const classList = computed(() => {
    return classNames(prefixCls, props.className, {
        [`${prefixCls}-${props.placement}`]: props.placement,
        [`${prefixCls}-popup`]: props.getPopupContainer,
        [`${prefixCls}-horizontal`]: isHorizontal.value,
        [`${prefixCls}-rtl`]: props.direction === 'rtl',
        [`${prefixCls}-hidden`]: props.keepDOM && state.value.displayNone,
    });
});

const contentProps = computed(() => {
    return {
        ...(isVertical.value ? (props.width ? { width: props.width } : {}) : { width: '100%' }),
        title: props.title,
        footer: props.footer,
        closable: props.closable,
        closeIcon: props.closeIcon,
        mask: props.mask,
        maskClosable: props.maskClosable,
        maskStyle: props.maskStyle,
        headerStyle: props.headerStyle,
        bodyStyle: props.bodyStyle,
        size: props.size,
        className: classList.value,
        height: sheetHeight.value,
        style: props.style,
        'aria-label': props['aria-label'],
        visible: props.visible,
        motion: false, // Content doesn't handle motion, parent handles it
        onClose: handleCancel,
    };
});

// Watchers
watch(
    () => props.visible,
    (newVal, oldVal) => {
        if (newVal && state.value.displayNone) {
            state.value.displayNone = false;
        }

        // 当 visible 变为 false 时，如果没有动画，立即设置 displayNone
        // 如果有动画，displayNone 会在动画结束后通过 updateState 更新
        if (!newVal && !motionEnabled.value && !state.value.displayNone) {
            if (motionObject.value) {
                motionObject.value.willLeave?.();
            }
            state.value.displayNone = true;
            if (motionObject.value) {
                motionObject.value.didLeave?.();
                motionObject.value.onRest?.();
            }
        }

        // hide => show
        if (!oldVal && newVal) {
            if (motionObject.value) {
                motionObject.value.willEnter?.();
                motionObject.value.onStart?.();
            }
            foundation.beforeShow();
        }
        // show => hide
        if (oldVal && !newVal) {
            if (motionObject.value) {
                motionObject.value.willLeave?.();
            }
            foundation.afterHide();
        }
    },
    { immediate: true }
);

watch(
    () => state.value.displayNone,
    (newVal) => {
        foundation.onVisibleChange(!newVal);
    }
);

// Lifecycle
onMounted(() => {
    scrollBarWidth.value = getScrollbarWidth();
    originBodyWidth.value = document.body.style.width;
    if (props.visible) {
        foundation.beforeShow();
    }
});

onBeforeUnmount(() => {
    if (props.visible) {
        foundation.destroy();
    }
});
</script>
