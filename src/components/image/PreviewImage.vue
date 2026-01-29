<template>
    <div ref="containerRef" :class="preViewImgPrefixCls">
        <img
            ref="imageRef"
            :key="src"
            :src="src"
            alt="previewImage"
            :class="`${preViewImgPrefixCls}-img`"
            :style="imgStyle"
            :crossOrigin="crossOrigin"
            @mousemove="handleImageMove"
            @mousedown="handleMouseDown"
            @contextmenu="handleRightClickImage"
            @dragstart.prevent
            @load="handleLoad"
            @error="handleError"
        />
        <Spin v-if="state.loading" size="large" :wrapperClassName="`${preViewImgPrefixCls}-spin`" />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick, CSSProperties } from 'vue';
import { cssClasses } from '@douyinfe/semi-foundation/image/constants';
import PreviewImageFoundation, { PreviewImageAdapter } from '@douyinfe/semi-foundation/image/previewImageFoundation';
import { PreviewImageProps, PreviewImageStates } from './interface';
import { useFoundation } from '../_utils';
import Spin from '../spin/Spin.vue';

defineOptions({
    name: 'PreviewImage',
});

const prefixCls = cssClasses.PREFIX;
const preViewImgPrefixCls = `${prefixCls}-preview-image`;

const props = withDefaults(defineProps<PreviewImageProps>(), {
    zoom: undefined,
    rotation: 0,
    ratio: 'adaptation',
});

const emit = defineEmits<{
    zoom: [zoom: number];
    load: [src: string];
    error: [src: string];
}>();

const containerRef = ref<HTMLDivElement | null>(null);
const imageRef = ref<HTMLImageElement | null>(null);

const state = ref<PreviewImageStates>({
    width: 0,
    height: 0,
    loading: true,
    translate: {
        x: 0,
        y: 0,
    },
    currZoom: props.zoom,
});

const imgStyle = computed<CSSProperties>(() => {
    const { width, height, loading, translate } = state.value;
    return {
        position: 'absolute',
        visibility: loading ? 'hidden' : 'visible',
        transform: `translate(${translate.x}px, ${translate.y}px) rotate(${props.rotation}deg)`,
        width: width ? `${width}px` : '0px',
        height: height ? `${height}px` : '0px',
    };
});
const adapter: PreviewImageAdapter<PreviewImageProps, PreviewImageStates> = {
    getProps: () => ({ ...props }),
    getProp: (key: string) => (props as any)[key],
    getState: (key: string) => (state.value as any)[key],
    getStates: () => state.value,
    setState: (states: Partial<PreviewImageStates>, cb?: () => void) => {
        Object.assign(state.value, states);
        cb?.();
    },
    getContext: () => null,
    getContexts: () => ({}),
    getCache: () => null,
    getCaches: () => ({}),
    setCache: () => {},
    stopPropagation: (e: Event) => e?.stopPropagation(),
    persistEvent: () => {},
    getContainer: () => containerRef.value,
    getImage: () => imageRef.value,
    setLoading: (loading: boolean) => {
        state.value.loading = loading;
    },
    setImageCursor: (canDrag: boolean) => {
        if (imageRef.value) {
            imageRef.value.style.cursor = canDrag ? 'grab' : 'default';
        }
    },
};

const { foundation } = useFoundation(PreviewImageFoundation, adapter);

const originalGetProps = adapter.getProps;
adapter.getProps = () => {
    const propsFromAdapter = originalGetProps();
    const onZoomFromProps = props.onZoom;

    return {
        ...propsFromAdapter,
        onZoom: (zoom: number, notify: boolean = true) => {
            if (notify && onZoomFromProps) {
                onZoomFromProps(zoom);
            } else if (notify) {
                emit('zoom', zoom);
            } else {
                foundation.changeZoom(zoom);
            }
        },
    };
};

const handleLoad = (e: Event) => {
    const img = e.target as HTMLImageElement;
    if (img && img.naturalWidth > 0 && img.naturalHeight > 0) {
        foundation.handleLoad(e);
        emit('load', props.src || '');
    }
};

const handleError = (e: Event) => {
    foundation.handleError(e);
    emit('error', props.src || '');
};

const handleImageMove = (e: MouseEvent) => {
    foundation.handleImageMove(e);
};

const handleMouseDown = (e: MouseEvent) => {
    foundation.handleImageMouseDown(e);
};

const handleRightClickImage = (e: MouseEvent) => {
    foundation.handleRightClickImage(e);
};

const onWindowResize = () => {
    foundation.handleWindowResize();
};
watch(
    () => props.src,
    (newSrc, oldSrc) => {
        if (newSrc && newSrc !== oldSrc) {
            foundation.setLoading(true);
        }
    }
);

watch(
    () => props.zoom,
    (newZoom) => {
        if (newZoom !== undefined && newZoom !== state.value.currZoom) {
            state.value.currZoom = newZoom;
        }
    }
);

watch(
    () => props.ratio,
    () => {
        foundation.handleRatioChange();
    }
);

watch(
    () => props.rotation,
    () => {
        onWindowResize();
    }
);

const checkImageLoaded = () => {
    if (imageRef.value?.complete && imageRef.value.naturalWidth > 0) {
        const loadEvent = new Event('load');
        Object.defineProperty(loadEvent, 'target', {
            value: imageRef.value,
            enumerable: true,
        });
        handleLoad(loadEvent as any);
    }
};

onMounted(() => {
    foundation.init();
    window.addEventListener('resize', onWindowResize);
    nextTick(checkImageLoaded);
});

watch(
    () => props.src,
    () => {
        nextTick(checkImageLoaded);
    }
);

onBeforeUnmount(() => {
    window.removeEventListener('resize', onWindowResize);
});

defineExpose({
    foundation,
    containerRef,
    imageRef,
});
</script>
