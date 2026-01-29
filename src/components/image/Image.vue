<template>
    <div :class="outerCls" :style="outerStyle" @click="handleClick">
        <img
            ref="imgRef"
            v-bind="restAttrs"
            :src="src && (isInGroup && isLazyLoad ? undefined : src)"
            :data-src="src"
            :alt="alt"
            :style="imgStyle"
            :class="imgCls"
            :width="width"
            :height="height"
            :crossOrigin="crossOrigin"
            @error="handleError"
            @load="handleLoaded"
        />
        <div v-if="state.loadStatus !== 'success'" :class="`${prefixCls}-overlay`">
            <div v-if="state.loadStatus === 'error'" :class="`${prefixCls}-status`">
                <component :is="renderError()" />
            </div>
            <div v-if="state.loadStatus === 'loading'" :class="`${prefixCls}-status`">
                <component :is="renderLoad()" />
            </div>
        </div>
        <component :is="renderMask()" v-if="canPreview" />
        <PreviewInner
            v-if="canPreview"
            v-bind="previewProps"
            :src="previewSrc"
            :visible="state.previewVisible"
            :crossOrigin="previewCrossOrigin"
            :setDownloadName="setDownloadName"
            @visible-change="handlePreviewVisibleChange"
        >
            <template #header="{ title }">
                <slot name="header" :title="title" />
            </template>
            <template #footer="{ menuProps }">
                <slot name="footer" :menuProps="menuProps" />
            </template>
        </PreviewInner>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, h, VNode, CSSProperties, useAttrs, useSlots } from 'vue';
import cls from 'classnames';
import { cssClasses } from '@douyinfe/semi-foundation/image/constants';
import ImageFoundation, { ImageAdapter } from '@douyinfe/semi-foundation/image/imageFoundation';
import { ImageProps, ImageStates } from './interface';
import { useFoundation } from '../_utils';
import { usePreviewContext } from './context';
import { IconUploadError, IconEyeOpened } from '../icons';
import SkeletonImage from '../skeleton/SkeletonImage.vue';
import PreviewInner from './PreviewInner.vue';
import { isBoolean, isObject, isUndefined, omit } from 'lodash-es';

defineOptions({
    name: 'Image',
    isSemiImage: true,
});

const slots = useSlots();

console.log('Image 组件初始化，slots:', {
    header: !!slots.header,
    footer: !!slots.footer,
    availableSlots: Object.keys(slots),
});

defineSlots<{
    header: { title: string };
    footer: { menuProps: any };
}>();

const prefixCls = cssClasses.PREFIX;

const props = withDefaults(defineProps<ImageProps>(), {
    preview: true,
});

const emit = defineEmits<{
    load: [event: Event];
    error: [event: Event];
    click: [event: any];
}>();

const attrs = useAttrs();

const previewContext = usePreviewContext();
const imgRef = ref<HTMLImageElement | null>(null);
const state = ref<ImageStates>({
    src: props.src || '',
    loadStatus: 'loading',
    previewVisible: false,
});

watch(
    () => props.src,
    (newSrc) => {
        if (newSrc !== state.value.src) {
            state.value.src = newSrc || '';
            state.value.loadStatus = 'loading';
        }
    },
    { immediate: true }
);

watch(
    () => (isObject(props.preview) ? (props.preview as any).visible : undefined),
    (visible) => {
        if (isBoolean(visible)) {
            state.value.previewVisible = visible;
        }
    },
    { immediate: true }
);
const isInGroup = computed(() => {
    return Boolean(previewContext && previewContext.isGroup);
});

const isLazyLoad = computed(() => {
    if (previewContext) {
        return previewContext.lazyLoad;
    }
    return false;
});

const outerStyle = computed<CSSProperties>(() => {
    const baseStyle: CSSProperties = {};

    if (props.width !== undefined) {
        baseStyle.width = typeof props.width === 'number' ? `${props.width}px` : props.width;
    }
    if (props.height !== undefined) {
        baseStyle.height = typeof props.height === 'number' ? `${props.height}px` : props.height;
    }

    const style = props.style || {};
    const processedStyle: CSSProperties = {};
    const pxProperties = [
        'marginTop',
        'marginRight',
        'marginBottom',
        'marginLeft',
        'paddingTop',
        'paddingRight',
        'paddingBottom',
        'paddingLeft',
        'top',
        'right',
        'bottom',
        'left',
        'width',
        'height',
        'maxWidth',
        'maxHeight',
        'minWidth',
        'minHeight',
    ];

    Object.keys(style).forEach((key) => {
        const value = (style as any)[key];
        if (typeof value === 'number' && pxProperties.includes(key)) {
            (processedStyle as any)[key] = `${value}px`;
        } else {
            (processedStyle as any)[key] = value;
        }
    });

    return Object.assign({}, baseStyle, processedStyle);
});

const outerCls = computed(() => {
    return cls(prefixCls, props.className);
});

const imgCls = computed(() => {
    const showPreviewCursor = props.preview && state.value.loadStatus === 'success';
    return cls(`${prefixCls}-img`, {
        [`${prefixCls}-img-preview`]: showPreviewCursor,
        [`${prefixCls}-img-error`]: state.value.loadStatus === 'error',
        [props.imgCls || '']: Boolean(props.imgCls),
    });
});

const canPreview = computed(() => {
    return state.value.loadStatus === 'success' && props.preview && !isInGroup.value;
});

const previewSrc = computed(() => {
    return isObject(props.preview) ? ((props.preview as any).src ?? props.src) : props.src;
});

const previewProps = computed(() => {
    if (isObject(props.preview) && canPreview.value) {
        return {
            ...omit(props.preview, ['className', 'style', 'previewCls', 'previewStyle']),
            className: (props.preview as any).previewCls,
            style: (props.preview as any).previewStyle,
        };
    }
    return {};
});

const previewCrossOrigin = computed(() => {
    return !isUndefined(props.crossOrigin) ? props.crossOrigin : (previewProps.value as any)?.crossOrigin;
});

const restAttrs = computed(() => {
    const {
        src,
        width,
        height,
        alt,
        style,
        className,
        crossOrigin,
        preview,
        fallback,
        placeholder,
        imageID,
        setDownloadName,
        imgCls,
        imgStyle,
        onClick,
        onError,
        onLoad,
        children,
        ...rest
    } = props;
    const { children: _, style: __, ...restAttrs } = attrs;
    return { ...restAttrs, ...rest };
});
const adapter: ImageAdapter<ImageProps, ImageStates> = {
    getProps: () => props,
    getProp: (key: string) => (props as any)[key],
    getState: (key: string) => (state.value as any)[key],
    getStates: () => state.value,
    setState: (states: Partial<ImageStates>, cb?: () => void) => {
        Object.assign(state.value, states);
        cb?.();
    },
    getContext: () => previewContext,
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
};

const { foundation } = useFoundation(ImageFoundation, adapter);
const handleClick = (e: MouseEvent) => {
    foundation.handleClick(e);
    emit('click', e);
};

const handleLoaded = (e: Event) => {
    foundation.handleLoaded(e);
    emit('load', e);
};

const handleError = (e: Event) => {
    foundation.handleError(e);
    emit('error', e);
};

const handlePreviewVisibleChange = (visible: boolean) => {
    foundation.handlePreviewVisibleChange(visible);
};

const renderDefaultLoading = (): VNode => {
    const loadingStyle: CSSProperties = {
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
    };
    return h(SkeletonImage, {
        style: loadingStyle,
    });
};

const renderDefaultError = (): VNode => {
    return h(IconUploadError, {
        size: 'extra-large',
    });
};

const renderLoad = (): VNode => {
    if (props.placeholder) {
        const placeholderStyle: CSSProperties = {
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        };
        return h('div', { style: placeholderStyle }, { default: () => props.placeholder });
    }
    return renderDefaultLoading();
};

const renderError = (): VNode => {
    if (props.fallback) {
        const fallbackNode =
            typeof props.fallback === 'string'
                ? h('img', {
                      style: { width: '100%', height: '100%' },
                      src: props.fallback,
                      alt: 'fallback',
                  })
                : props.fallback;
        return h('div', {}, { default: () => fallbackNode });
    }
    return renderDefaultError();
};

const getLocalTextByKey = (key: string): string => {
    const localeMap: Record<string, string> = {
        preview: '预览',
    };
    return localeMap[key] || key;
};

const renderMask = (): VNode => {
    return h(
        'div',
        { class: `${prefixCls}-mask` },
        {
            default: () =>
                h(
                    'div',
                    { class: `${prefixCls}-mask-info` },
                    {
                        default: () => [
                            h(IconEyeOpened, { size: 'extra-large' }),
                            h('span', { class: `${prefixCls}-mask-info-text` }, getLocalTextByKey('preview')),
                        ],
                    }
                ),
        }
    );
};

defineExpose({
    imgRef,
});
</script>
