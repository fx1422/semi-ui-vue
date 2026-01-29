<template>
    <div v-if="props.stack" :class="`${prefixCls}-zero-height-wrapper`" :style="wrapperStyle">
        <div
            ref="toastEle"
            role="alert"
            :aria-label="`${props.type || 'default'} type`"
            :class="toastCls"
            :style="toastStyle"
            @mouseenter="clearCloseTimer"
            @mouseleave="startCloseTimer"
            @animationstart="handleAnimationStart"
            @animationend="handleAnimationEnd"
        >
            <div :class="`${prefixCls}-content`">
                <component :is="renderIcon" v-if="renderIcon" />
                <span :class="`${prefixCls}-content-text`" :style="textStyle" x-semi-prop="content">
                    <!-- Priority: slot content > props.content (VNode) > props.content (string) -->
                    <slot>
                        <template v-if="isVNode(props.content)">
                            <RenderContent :content="props.content" />
                        </template>
                        <template v-else>
                            {{ props.content }}
                        </template>
                    </slot>
                </span>
                <div v-if="props.showClose" :class="`${prefixCls}-close-button`">
                    <IconButton
                        type="tertiary"
                        :icon="h(IconClose)"
                        theme="borderless"
                        size="small"
                        @click="handleClose"
                    />
                </div>
            </div>
        </div>
    </div>
    <div
        v-else
        ref="toastEle"
        role="alert"
        :aria-label="`${props.type || 'default'} type`"
        :class="toastCls"
        :style="toastStyle"
        @mouseenter="clearCloseTimer"
        @mouseleave="startCloseTimer"
        @animationstart="handleAnimationStart"
        @animationend="handleAnimationEnd"
    >
        <div :class="`${prefixCls}-content`">
            <component :is="renderIcon" v-if="renderIcon" />
            <span :class="`${prefixCls}-content-text`" :style="textStyle" x-semi-prop="content">
                <!-- Priority: slot content > props.content (VNode) > props.content (string) -->
                <slot>
                    <template v-if="isVNode(props.content)">
                        <RenderContent :content="props.content" />
                    </template>
                    <template v-else>
                        {{ props.content }}
                    </template>
                </slot>
            </span>
            <div v-if="props.showClose" :class="`${prefixCls}-close-button`">
                <IconButton type="tertiary" :icon="h(IconClose)" theme="borderless" size="small" @click="handleClose" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, h, isVNode, defineComponent, watch, useSlots } from 'vue';
import classNames from 'classnames';
import { cssClasses, strings, numbers } from '@douyinfe/semi-foundation/toast/constants';
import type { ToastProps } from './interface';
import { useFoundation } from '../_utils';
import ToastFoundation, { ToastAdapter } from '@douyinfe/semi-foundation/toast/toastFoundation';
import IconButton from '../iconButton/IconButton.vue';
import { IconClose, IconAlertTriangle, IconInfoCircle, IconTickCircle, IconAlertCircle } from '../icons';

defineOptions({
    name: 'Toast',
    inheritAttrs: false,
});

interface ToastPropsWithOnClose extends Omit<ToastProps, 'onClose'> {
    onClose?: (() => void) | undefined;
}

const props = withDefaults(defineProps<ToastPropsWithOnClose>(), {
    content: '',
    duration: numbers.duration,
    textMaxWidth: 450,
    showClose: true,
    stack: false,
    stackExpanded: false,
    theme: 'normal',
    motion: true,
    onClose: undefined,
});

const RenderContent = defineComponent({
    props: {
        content: {
            type: Object,
            required: true,
        },
    },
    setup(props) {
        return () => props.content;
    },
});

const emit = defineEmits<{
    close: [id: string];
}>();

const slots = useSlots();
const prefixCls = cssClasses.PREFIX;
const toastEle = ref<HTMLDivElement | null>(null);
const isAnimatingHide = ref(false);

watch(
    () => props.className,
    (newClassName) => {
        const classNameStr = typeof newClassName === 'string' ? newClassName : '';
        if (classNameStr.includes(`${prefixCls}-animation-hide`)) {
            isAnimatingHide.value = true;
        } else {
            isAnimatingHide.value = false;
        }
    },
    { immediate: true }
);

const iconMap = {
    warning: IconAlertTriangle,
    success: IconTickCircle,
    info: IconInfoCircle,
    error: IconAlertCircle,
};

const renderIcon = computed(() => {
    const { type, icon } = props;
    const iconSize = 'large';
    const iconCls = classNames(`${prefixCls}-icon`, `${prefixCls}-icon-${type}`);

    if (icon) {
        if (isVNode(icon)) {
            return h(icon, { size: iconSize, class: `${prefixCls}-icon` });
        }
        return icon;
    }

    if (type && iconMap[type]) {
        return h(iconMap[type], { size: iconSize, class: iconCls });
    }

    return null;
});

const toastCls = computed(() => {
    return classNames(prefixCls, props.className, {
        [`${prefixCls}-${props.type}`]: props.type,
        [`${prefixCls}-${props.theme}`]: props.theme === 'light',
        [`${prefixCls}-rtl`]: props.direction === 'rtl',
    });
});

const toastStyle = computed(() => {
    const reservedIndex = props.positionInList ? props.positionInList.length - props.positionInList.index - 1 : 0;

    const classNameStr = typeof props.className === 'string' ? props.className : '';
    const isHiding = classNameStr.includes(`${prefixCls}-animation-hide`) || isAnimatingHide.value;

    const baseStyle: Record<string, any> = {
        ...props.style,
    };

    if (!isHiding) {
        baseStyle.transform = `translate3d(0,0,${reservedIndex * -10}px)`;
    }

    return baseStyle;
});

const textStyle = computed(() => {
    return {
        maxWidth: props.textMaxWidth,
    };
});

const wrapperStyle = computed(() => {
    if (props.stack && props.stackExpanded && toastEle.value) {
        const height = getComputedStyle(toastEle.value).height;
        return { height };
    }
    return {};
});

const adapter: ToastAdapter = {
    getProps: () => props,
    getProp: (key: keyof ToastProps) => props[key],
    getState: () => ({}),
    getStates: () => ({}),
    setState: () => {},
    getContext: () => undefined,
    getContexts: () => ({}),
    getCache: () => undefined,
    getCaches: () => ({}),
    setCache: () => {},
    stopPropagation: (e?: Event) => e?.stopPropagation(),
    persistEvent: () => {},
    notifyWrapperToRemove: (id: string) => {
        emit('close', id);
    },
    notifyClose: () => {
        if (typeof props.onClose === 'function') {
            props.onClose();
        }
    },
};

const { foundation } = useFoundation(ToastFoundation, adapter);

const clearCloseTimer = () => {
    foundation.clearCloseTimer_();
};

const startCloseTimer = () => {
    foundation.startCloseTimer_();
};

const handleClose = (e: MouseEvent) => {
    foundation.close(e);
};

const handleAnimationStart = (e: AnimationEvent) => {
    const target = e.target as HTMLElement;
    if (target?.classList.contains(`${prefixCls}-animation-hide`)) {
        isAnimatingHide.value = true;
    }
    props.onAnimationStart?.(e);
};

const handleAnimationEnd = (e: AnimationEvent) => {
    isAnimatingHide.value = false;
    props.onAnimationEnd?.(e);
};

defineExpose({
    clearCloseTimer,
    startCloseTimer,
    restartCloseTimer: () => foundation.restartCloseTimer(),
    foundation,
});
</script>
