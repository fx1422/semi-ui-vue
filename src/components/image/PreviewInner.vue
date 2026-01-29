<template>
    <Portal v-if="props.visible" :getPopupContainer="getPopupContainer" :style="wrapperStyle">
        <div
            ref="imageWrapRef"
            :class="previewWrapperCls"
            :style="style"
            @mousedown="handleMouseDown"
            @mouseup="handleMouseUp"
            @mousemove="handleMouseMove"
        >
            <PreviewHeader
                ref="headerRef"
                :class="hideViewerCls"
                :closable="closable"
                :renderHeader="renderHeader"
                :renderCloseIcon="renderCloseIcon"
                @close="handlePreviewClose"
            >
                <template #header="scope">
                    <slot name="header" :title="currentTitle" v-bind="scope" />
                </template>
            </PreviewHeader>
            <PreviewImage
                ref="imageRef"
                :src="currentSrc"
                :zoom="state.zoom"
                :ratio="state.ratio"
                :rotation="state.rotation"
                :crossOrigin="crossOrigin"
                :disableDownload="disableDownload"
                :onZoom="handleZoomImage"
                @load="onImageLoad"
                @error="onImageError"
            />
            <div
                v-if="showPrev"
                ref="leftIconRef"
                :class="[`${previewPrefixCls}-icon`, `${previewPrefixCls}-prev`, hideViewerCls]"
                @click="handleSwitchImage('prev')"
            >
                <component :is="leftIconNode" />
            </div>
            <div
                v-if="showNext"
                ref="rightIconRef"
                :class="[`${previewPrefixCls}-icon`, `${previewPrefixCls}-next`, hideViewerCls]"
                @click="handleSwitchImage('next')"
            >
                <component :is="rightIconNode" />
            </div>
            <PreviewFooter
                ref="footerRef"
                :class="hideViewerCls"
                :totalNum="total"
                :curPage="state.currentIndex + 1"
                :disabledPrev="!showPrev"
                :disabledNext="!showNext"
                :zoom="state.zoom * 100"
                :step="zoomStep * 100"
                :showTooltip="showTooltip"
                :ratio="state.ratio"
                :prevTip="prevTip"
                :nextTip="nextTip"
                :zIndex="zIndex"
                :zoomInTip="zoomInTip"
                :zoomOutTip="zoomOutTip"
                :rotateTip="rotateTip"
                :downloadTip="downloadTip"
                :disableDownload="disableDownload"
                :adaptiveTip="adaptiveTip"
                :originTip="originTip"
                :renderPreviewMenu="renderPreviewMenu"
                @prev="() => handleSwitchImage('prev')"
                @next="() => handleSwitchImage('next')"
                @zoom-in="handleZoomImage"
                @zoom-out="handleZoomImage"
                @download="handleDownload"
                @rotate="handleRotateImage"
                @adjust-ratio="handleAdjustRatio"
            >
                <template #footer="{ menuProps }">
                    <slot name="footer" :menuProps="menuProps" />
                </template>
            </PreviewFooter>
        </div>
    </Portal>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick, h, CSSProperties, useSlots } from 'vue';
import cls from 'classnames';
import { cssClasses, numbers } from '@douyinfe/semi-foundation/image/constants';
import VuePreviewInnerFoundation from './previewInnerFoundation';
import type { PreviewInnerAdapter, RatioType } from './previewInnerFoundation';
import { PreviewInnerProps, PreviewInnerStates } from './interface';
import { useFoundation } from '../_utils';
import { usePreviewContext } from './context';
import Portal from '../_portal/Portal.vue';
import PreviewHeader from './PreviewHeader.vue';
import PreviewFooter from './PreviewFooter.vue';
import PreviewImage from './PreviewImage.vue';
import { IconArrowLeft, IconArrowRight } from '../icons';
import { isEqual, throttle, isFunction } from 'lodash-es';
import { getScrollbarWidth } from '../_utils';

defineOptions({
    name: 'PreviewInner',
});

const slots = useSlots();

console.log('PreviewInner 初始化，slots:', {
    header: !!slots.header,
    footer: !!slots.footer,
    availableSlots: Object.keys(slots),
});

defineSlots<{
    header: { title: string };
    footer: { menuProps: any };
}>();

const prefixCls = cssClasses.PREFIX;
const previewPrefixCls = `${prefixCls}-preview`;

const props = withDefaults(defineProps<PreviewInnerProps>(), {
    showTooltip: false,
    zoomStep: 0.1,
    infinite: false,
    closable: true,
    closeOnEsc: true,
    lazyLoad: false,
    preLoad: true,
    preLoadGap: 2,
    zIndex: numbers.DEFAULT_Z_INDEX,
    maskClosable: true,
    viewerVisibleDelay: 10000,
    maxZoom: 5,
    minZoom: 0.1,
    visible: false,
});

const emit = defineEmits<{
    visibleChange: [visible: boolean];
}>();

const previewContext = usePreviewContext();
const headerRef = ref<HTMLElement | null>(null);
const footerRef = ref<HTMLElement | null>(null);
const leftIconRef = ref<HTMLDivElement | null>(null);
const rightIconRef = ref<HTMLDivElement | null>(null);
const imageRef = ref<any>(null);
const imageWrapRef = ref<HTMLDivElement | null>(null);
const state = ref<PreviewInnerStates>({
    imgSrc: [],
    imgLoadStatus: new Map(),
    zoom: 0.1,
    currentIndex: 0,
    ratio: 'adaptation',
    rotation: 0,
    viewerVisible: true,
    visible: props.visible,
    preloadAfterVisibleChange: true,
    direction: '',
});

const bodyOverflow = ref<string>('');
const originBodyWidth = ref('100%');
const scrollBarWidth = ref(0);

const isInGroup = computed(() => {
    return Boolean(previewContext && previewContext.isGroup);
});

const currentSrc = computed(() => {
    return state.value.imgSrc[state.value.currentIndex] || '';
});

const total = computed(() => state.value.imgSrc.length);

const currentTitle = computed(() => {
    if (previewContext && previewContext.titles && typeof state.value.currentIndex === 'number') {
        return previewContext.titles[state.value.currentIndex];
    }
    return '';
});

const showPrev = computed(() => {
    return total.value !== 1 && (props.infinite || state.value.currentIndex !== 0);
});

const showNext = computed(() => {
    return total.value !== 1 && (props.infinite || state.value.currentIndex !== total.value - 1);
});

const previewWrapperCls = computed(() => {
    return cls(
        previewPrefixCls,
        {
            [`${prefixCls}-hide`]: !props.visible,
            [`${previewPrefixCls}-popup`]: props.getPopupContainer,
        },
        props.className
    );
});

const hideViewerCls = computed(() => {
    return !state.value.viewerVisible ? `${previewPrefixCls}-hide` : '';
});

const wrapperStyle = computed<CSSProperties>(() => {
    const style: CSSProperties = {
        zIndex: props.zIndex,
    };
    if (props.getPopupContainer) {
        style.position = 'static';
    }
    return style;
});

const leftIconNode = computed(() => {
    if (props.renderLeftIcon) {
        return typeof props.renderLeftIcon === 'function'
            ? (props.renderLeftIcon as (index: number) => any)(state.value.currentIndex)
            : props.renderLeftIcon;
    }
    return h(IconArrowLeft, { size: 'large' });
});

const rightIconNode = computed(() => {
    if (props.renderRightIcon) {
        return typeof props.renderRightIcon === 'function'
            ? (props.renderRightIcon as (index: number) => any)(state.value.currentIndex)
            : props.renderRightIcon;
    }
    return h(IconArrowRight, { size: 'large' });
});

watch(
    [() => props.visible, () => props.src, () => props.currentIndex],
    ([newVisible, newSrc, newIndex], [oldVisible, oldSrc, oldIndex]) => {
        if (newVisible !== oldVisible) {
            state.value.visible = newVisible;
            if (newVisible) {
                const src = Array.isArray(props.src) ? props.src : props.src ? [props.src] : [];
                if (!isEqual(src, state.value.imgSrc)) {
                    state.value.imgSrc = src;
                }
                state.value.preloadAfterVisibleChange = true;
                state.value.viewerVisible = true;
                state.value.rotation = 0;
                state.value.ratio = 'adaptation';
            }
        }
        if (newVisible && newSrc !== oldSrc) {
            const src = Array.isArray(newSrc) ? newSrc : newSrc ? [newSrc] : [];
            if (!isEqual(src, state.value.imgSrc)) {
                state.value.imgSrc = src;
            }
        }
        if (newIndex !== oldIndex && newIndex !== undefined && newIndex !== state.value.currentIndex) {
            state.value.currentIndex = newIndex;
            state.value.ratio = 'adaptation';
        }
    },
    { immediate: true }
);

const adapter: PreviewInnerAdapter<PreviewInnerProps, PreviewInnerStates> = {
    getProps: () => props,
    getProp: (key: string) => (props as any)[key],
    getState: (key: string) => (state.value as any)[key],
    getStates: () => state.value,
    setState: (states: Partial<PreviewInnerStates>, cb?: () => void) => {
        Object.assign(state.value, states);
        cb?.();
    },
    getContext: (key?: string) => {
        if (key) {
            return previewContext?.[key as keyof typeof previewContext];
        }
        return previewContext;
    },
    getContexts: () => ({
        setCurrentIndex: previewContext?.setCurrentIndex,
        handleVisibleChange: previewContext?.handleVisibleChange,
    }),
    getCache: () => null,
    getCaches: () => ({}),
    setCache: () => {},
    stopPropagation: (e: Event) => e?.stopPropagation(),
    persistEvent: () => {},
    getIsInGroup: () => isInGroup.value,
    notifyChange: (index: number, direction: string) => {
        if (isFunction(props.onChange)) props.onChange(index);
        if (direction === 'prev' && isFunction(props.onPrev)) {
            props.onPrev(index);
        } else if (direction === 'next' && isFunction(props.onNext)) {
            props.onNext(index);
        }
    },
    notifyZoom: (zoom: number, increase: boolean) => {
        if (increase && isFunction(props.onZoomIn)) {
            props.onZoomIn(zoom);
        } else if (!increase && isFunction(props.onZoomOut)) {
            props.onZoomOut(zoom);
        }
    },
    notifyClose: () => {
        if (isFunction(props.onClose)) props.onClose();
    },
    notifyVisibleChange: (visible: boolean) => {
        emit('visibleChange', visible);
        if (isFunction(props.onVisibleChange)) props.onVisibleChange(visible);
    },
    notifyRatioChange: (type: RatioType) => {
        if (isFunction(props.onRatioChange)) props.onRatioChange(type);
    },
    notifyRotateChange: (angle: number) => {
        if (isFunction(props.onRotateLeft)) props.onRotateLeft(angle);
    },
    notifyDownload: (src: string, index: number) => {
        if (isFunction(props.onDownload)) props.onDownload(src, index);
    },
    notifyDownloadError: (src: string) => {
        if (isFunction(props.onDownloadError)) props.onDownloadError(src);
    },
    registerKeyDownListener: () => {
        window.addEventListener('keydown', handleKeyDown);
    },
    unregisterKeyDownListener: () => {
        window.removeEventListener('keydown', handleKeyDown);
    },
    disabledBodyScroll: () => {
        if (!props.getPopupContainer) {
            bodyOverflow.value = document.body.style.overflow || '';
            if (bodyOverflow.value !== 'hidden') {
                document.body.style.overflow = 'hidden';
                document.body.style.width = `calc(${originBodyWidth.value || '100%'} - ${scrollBarWidth.value}px)`;
            }
        }
    },
    enabledBodyScroll: () => {
        if (!props.getPopupContainer && bodyOverflow.value !== 'hidden') {
            document.body.style.overflow = bodyOverflow.value;
            document.body.style.width = originBodyWidth.value;
        }
    },
    getSetDownloadFunc: () => {
        return previewContext?.setDownloadName ?? props.setDownloadName;
    },
    isValidTarget: (e: any) => {
        const target = e.target as HTMLElement;
        if (!target) return true;

        const headerComponent = headerRef.value as any;
        const footerComponent = footerRef.value as any;
        const headerDom = headerComponent?.headerRef || headerComponent?.$el;
        const footerDom = footerComponent?.footerRef || footerComponent?.$el;

        if (
            (headerDom && headerDom.contains(target)) ||
            (footerDom && footerDom.contains(target)) ||
            (leftIconRef.value && leftIconRef.value.contains(target)) ||
            (rightIconRef.value && rightIconRef.value.contains(target))
        ) {
            return false;
        }

        return true;
    },
    changeImageZoom: (zoom: number) => {
        if (imageRef.value && imageRef.value.foundation) {
            imageRef.value.foundation.changeZoom(zoom);
        }
    },
};

const { foundation } = useFoundation(VuePreviewInnerFoundation, adapter);
const handleKeyDown = (e: KeyboardEvent) => {
    foundation.handleKeyDown(e);
};

const handleMouseDown = (e: MouseEvent) => {
    foundation.handleMouseDown(e);
};

const handleMouseUp = (e: MouseEvent) => {
    foundation.handleMouseUp(e);
};

const handleMouseMove = throttle((e: MouseEvent) => {
    foundation.handleMouseMove(e);
}, 50);

/**
 * 处理 wheel 事件
 * 注意：此函数通过 addEventListener 注册，而不是使用 @wheel 指令
 * 原因：需要设置 { passive: false } 以允许 preventDefault()
 * 参考 React 版本的注释说明
 */
const handleWheel = (e: WheelEvent) => {
    foundation.handleWheel(e);
};

const handleSwitchImage = (direction: string) => {
    foundation.handleSwitchImage(direction);
};

const handleDownload = () => {
    foundation.handleDownload();
};

const handlePreviewClose = (e: MouseEvent) => {
    foundation.handlePreviewClose(e);
};

const handleAdjustRatio = (type: RatioType) => {
    foundation.handleAdjustRatio(type);
};

const handleRotateImage = (direction: string) => {
    foundation.handleRotateImage(direction);
};

const handleZoomImage = (newZoom: number, notify: boolean = true) => {
    foundation.handleZoomImage(newZoom, notify);
};

const onImageError = () => {
    foundation.preloadSingleImage();
};

const onImageLoad = (src: string) => {
    foundation.onImageLoad(src);
};

/**
 * 注册 wheel 事件监听器
 * 使用 addEventListener 并设置 { passive: false } 以允许 preventDefault()
 * 参考 React 版本的 registryImageWrapRef 实现
 */
const registerWheelListener = () => {
    if (imageWrapRef.value) {
        imageWrapRef.value.addEventListener('wheel', handleWheel, { passive: false });
    }
};

/**
 * 移除 wheel 事件监听器
 */
const unregisterWheelListener = () => {
    if (imageWrapRef.value) {
        imageWrapRef.value.removeEventListener('wheel', handleWheel);
    }
};

onMounted(() => {
    scrollBarWidth.value = getScrollbarWidth();
    originBodyWidth.value = document.body.style.width;
    // 注册 wheel 事件监听器
    registerWheelListener();
    if (props.visible) {
        foundation.beforeShow();
    }
});

onBeforeUnmount(() => {
    // 移除 wheel 事件监听器
    unregisterWheelListener();
    foundation.clearTimer();
    foundation.afterHide();
});

watch(
    () => props.visible,
    (newVisible, oldVisible) => {
        if (!oldVisible && newVisible) {
            // 当预览显示时，确保 wheel 事件监听器已注册
            // 由于使用了 v-if，Portal 会重新渲染，需要等待 DOM 更新
            nextTick(() => {
                registerWheelListener();
            });
            foundation.beforeShow();
        } else if (oldVisible && !newVisible) {
            // 当预览隐藏时，移除 wheel 事件监听器
            unregisterWheelListener();
            foundation.afterHide();
        }
    }
);

watch(
    () => props.src,
    () => {
        if (props.visible) {
            foundation.updateTimer();
        }
    }
);

defineExpose({
    foundation,
    imageRef,
    headerRef,
    footerRef,
});
</script>
