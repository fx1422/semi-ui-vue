<template>
    <div
        ref="noticeEle"
        role="alert"
        :aria-labelledby="titleId"
        :class="noticeCls"
        :style="props.style"
        v-bind="animationEvents"
        @mouseenter="clearCloseTimer"
        @mouseleave="startCloseTimer"
        @click="handleClick"
    >
        <div v-if="renderIcon" :class="`${prefixCls}-icon`">
            <component :is="renderIcon" />
        </div>
        <div :class="`${prefixCls}-inner`">
            <div :class="`${prefixCls}-content-wrapper`">
                <div v-if="props.title" :id="titleId" :class="`${prefixCls}-title`" x-semi-prop="title">
                    <RenderContent :content="props.title" />
                </div>
                <div v-if="props.content" :class="`${prefixCls}-content`" x-semi-prop="content">
                    <RenderContent :content="props.content" />
                </div>
            </div>
            <IconButton
                v-if="props.showClose"
                :class="`${prefixCls}-icon-close`"
                type="tertiary"
                :icon="h(IconClose)"
                theme="borderless"
                size="small"
                @click="handleClose"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, h, isVNode, defineComponent } from 'vue';
import classNames from 'classnames';
import { cssClasses, strings, numbers } from '@douyinfe/semi-foundation/notification/constants';
import type { NoticeProps } from './interface';
import { useFoundation } from '../_utils';
import NotificationFoundation, { NoticeAdapter } from '@douyinfe/semi-foundation/notification/notificationFoundation';
import IconButton from '../iconButton/IconButton.vue';
import { IconClose, IconAlertTriangle, IconInfoCircle, IconTickCircle, IconAlertCircle } from '../icons';
import { getUuidShort } from '@douyinfe/semi-foundation/utils/uuid';

defineOptions({
    name: 'Notice',
    inheritAttrs: false,
});

const props = withDefaults(defineProps<NoticeProps>(), {
    title: '',
    content: '',
    duration: numbers.duration,
    showClose: true,
    theme: 'normal',
    motion: true,
});

// Component to render VNode content
const RenderContent = defineComponent({
    props: {
        content: {
            type: [Object, String],
            required: true,
        },
    },
    setup(props) {
        return () => {
            if (isVNode(props.content)) {
                return props.content;
            }
            return props.content;
        };
    },
});

const emit = defineEmits<{
    close: [id: string];
    animationEnd: [e: AnimationEvent];
    animationStart: [e: AnimationEvent];
}>();

const prefixCls = cssClasses.NOTICE;
const noticeEle = ref<HTMLDivElement | null>(null);
const titleId = getUuidShort({});

// Icon mapping
const iconMap = {
    warning: IconAlertTriangle,
    success: IconTickCircle,
    info: IconInfoCircle,
    error: IconAlertCircle,
};

// Render icon
const renderIcon = computed(() => {
    const { type, icon } = props;
    const iconSize = 'large';
    const iconCls = classNames(`${prefixCls}-icon`, `${prefixCls}-${type}`);

    if (icon) {
        // If icon is a VNode, clone it with size and className
        if (isVNode(icon)) {
            return h(icon, { size: iconSize, class: iconCls });
        }
        return icon;
    }

    if (type && iconMap[type]) {
        return h(iconMap[type], { size: iconSize, class: iconCls });
    }

    return null;
});

// Notice classes
const noticeCls = computed(() => {
    const direction = props.direction || 'ltr';
    const defaultPosition = direction === 'rtl' ? 'topLeft' : 'topRight';
    const position = props.position || defaultPosition;

    return classNames(prefixCls, props.className, {
        [`${prefixCls}-close`]: !state.value.visible,
        [`${prefixCls}-icon-show`]: props.type && strings.types.includes(props.type),
        [`${prefixCls}-${props.type}`]: props.type,
        [`${prefixCls}-${props.theme}`]: props.theme === 'light',
        [`${prefixCls}-rtl`]: direction === 'rtl',
    });
});

// State
const state = ref({
    visible: true,
});

// Animation handlers
const handleAnimationStart = (e: AnimationEvent) => {
    props.onAnimationStart?.(e);
    emit('animationStart', e);
};

const handleAnimationEnd = (e: AnimationEvent) => {
    props.onAnimationEnd?.(e);
    emit('animationEnd', e);
};

// Animation events
const animationEvents = computed(() => {
    if (!props.motion) {
        return {};
    }
    return {
        onAnimationstart: handleAnimationStart,
        onAnimationend: handleAnimationEnd,
    };
});

// Adapter
const adapter: NoticeAdapter = {
    getProps: () => props,
    getProp: (key: keyof NoticeProps) => props[key],
    getState: () => state.value,
    getStates: () => state.value,
    setState: (newState: any, callback?: () => void) => {
        Object.assign(state.value, newState);
        callback?.();
    },
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
        props.onClose?.();
        props.onHookClose?.();
    },
};

const { foundation } = useFoundation(NotificationFoundation, adapter);

// Timer methods
const clearCloseTimer = () => {
    foundation._clearCloseTimer();
};

const startCloseTimer = () => {
    foundation._startCloseTimer();
};

const handleClose = (e: MouseEvent) => {
    props.onCloseClick?.(props.id || '');
    foundation.close(e);
};

const handleClick = (e: MouseEvent) => {
    props.onClick?.(e);
};

// Expose methods for NotificationList
defineExpose({
    clearCloseTimer,
    startCloseTimer,
    restartCloseTimer: () => foundation.restartCloseTimer(),
    foundation,
});
</script>
