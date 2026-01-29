<template>
    <div v-if="state.visible" ref="bannerEle" role="alert" :class="bannerCls" :style="props.style" v-bind="dataAttrs">
        <div :class="`${prefixCls}-content-wrapper`">
            <div :class="`${prefixCls}-content`">
                <div v-if="renderIcon" :class="`${prefixCls}-icon`" x-semi-prop="icon">
                    <component :is="renderIcon" />
                </div>
                <div :class="`${prefixCls}-content-body`">
                    <TypographyTitle
                        v-if="props.title"
                        :heading="5"
                        :class="`${prefixCls}-title`"
                        component="div"
                        x-semi-prop="title"
                    >
                        <RenderContent :content="props.title" />
                    </TypographyTitle>
                    <TypographyParagraph
                        v-if="props.description"
                        :class="`${prefixCls}-description`"
                        component="div"
                        x-semi-prop="description"
                    >
                        <RenderContent :content="props.description" />
                    </TypographyParagraph>
                </div>
            </div>
            <IconButton
                v-if="renderCloser"
                :class="`${prefixCls}-close`"
                type="tertiary"
                theme="borderless"
                size="small"
                :icon="renderCloser"
                aria-label="Close"
                @click="handleRemove"
            />
        </div>
        <div v-if="props.children" :class="`${prefixCls}-extra`" x-semi-prop="children">
            <slot></slot>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, h, isVNode, defineComponent, onMounted, onUnmounted } from 'vue';
import classNames from 'classnames';
import { cssClasses, strings } from '@douyinfe/semi-foundation/banner/constants';
import type { BannerProps, BannerState } from './interface';
import { useFoundation } from '../_utils';
import BannerFoundation, { BannerAdapter } from '@douyinfe/semi-foundation/banner/foundation';
import IconButton from '../iconButton/IconButton.vue';
import TypographyTitle from '../typography/Title.vue';
import TypographyParagraph from '../typography/Paragraph.vue';
import { IconClose, IconAlertTriangle, IconInfoCircle, IconTickCircle, IconAlertCircle } from '../icons';
import warning from '@douyinfe/semi-foundation/utils/warning';

defineOptions({
    name: 'Banner',
    inheritAttrs: false,
});

const props = withDefaults(defineProps<BannerProps>(), {
    type: 'info',
    fullMode: true,
    onClose: () => {},
});

const emit = defineEmits<{
    close: [e: MouseEvent];
}>();

const prefixCls = cssClasses.PREFIX;
const bannerEle = ref<HTMLDivElement | null>(null);

// Component to render VNode content
const RenderContent = defineComponent({
    props: {
        content: {
            type: [Object, String],
            required: true,
        },
    },
    setup(props) {
        return () => (isVNode(props.content) ? props.content : String(props.content));
    },
});

// Icon mapping
const iconMap = {
    warning: IconAlertTriangle,
    success: IconTickCircle,
    info: IconInfoCircle,
    danger: IconAlertCircle,
};

// Render icon
const renderIcon = computed(() => {
    const { type, icon } = props;

    if (typeof icon !== 'undefined') {
        if (isVNode(icon)) {
            return h(icon, { size: 'large' });
        }
        return icon;
    }

    if (type && iconMap[type]) {
        return h(iconMap[type], { size: 'large', 'aria-label': type });
    }

    return null;
});

// Render closer
const renderCloser = computed(() => {
    const { closeIcon } = props;
    if (closeIcon === null) {
        return null;
    }
    if (closeIcon) {
        if (isVNode(closeIcon)) {
            return h(closeIcon, { 'aria-hidden': true });
        }
        return closeIcon;
    }
    return h(IconClose, { 'aria-hidden': true, 'x-semi-prop': 'closeIcon' });
});

// State
const state = ref<BannerState>({
    visible: true,
});

// Banner classes
const bannerCls = computed(() => {
    return classNames(prefixCls, props.className, {
        [`${prefixCls}-${props.type}`]: props.type,
        [`${prefixCls}-full`]: props.fullMode,
        [`${prefixCls}-in-container`]: !props.fullMode,
        [`${prefixCls}-bordered`]: !props.fullMode && props.bordered,
    });
});

// Data attributes
const dataAttrs = computed(() => {
    // Extract data-* attributes from props if needed
    // For now, return empty object
    return {};
});

// Adapter
const adapter: BannerAdapter<BannerProps, BannerState> = {
    getProps: () => props,
    getProp: (key: keyof BannerProps) => props[key],
    getState: () => state.value,
    getStates: () => state.value,
    setState: (newState: Partial<BannerState>, callback?: () => void) => {
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
    setVisible: () => {
        state.value.visible = false;
    },
    notifyClose: (e: MouseEvent) => {
        props.onClose?.(e);
        emit('close', e);
    },
};

const { foundation } = useFoundation(BannerFoundation, adapter);

// Lifecycle hooks
onMounted(() => {
    foundation.init();

    // Warning for deprecated 'target' prop (if exists in props)
    warning('target' in props, "[Semi Banner] 'target' has been deprecated, please write JSX directly instead.");
});

onUnmounted(() => {
    foundation.destroy();
});

// Remove handler
const handleRemove = (e: MouseEvent) => {
    e?.stopPropagation();
    foundation.removeBanner(e);
};
</script>
