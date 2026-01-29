<template>
    <div
        ref="sliderRef"
        :class="[`${cssClasses.PREFIX}-colorSlider`, props.className]"
        :style="sliderStyle"
        @mousedown="handleClick"
    >
        <div :class="`${cssClasses.PREFIX}-handle`" :style="handleStyle" @mousedown.stop="handleHandleMouseDown" />
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onUnmounted } from 'vue';
import ColorPickerFoundation from '@douyinfe/semi-foundation/colorPicker/foundation';
import ColorSliderFoundation from '@douyinfe/semi-foundation/colorPicker/ColorSliderFoundation';
import { cssClasses } from '@douyinfe/semi-foundation/colorPicker/constants';
import { useFoundation, useBaseComponent } from '../_utils';

interface Props {
    width: number;
    height: number;
    hue: number;
    handleSize: number;
    foundation: ColorPickerFoundation;
    className?: string;
    style?: Record<string, any>;
}

const props = defineProps<Props>();

const sliderRef = ref<HTMLDivElement | null>(null);

const state = ref({
    handlePosition: (props.hue / 360) * props.width - props.handleSize / 2,
    isHandleGrabbing: false,
});

const { adapter: baseAdapter } = useBaseComponent(props, state);

const adapter = {
    ...baseAdapter,
    handleMouseDown: (_e: MouseEvent) => {
        state.value.isHandleGrabbing = true;
        window.addEventListener('mousemove', (colorSliderFoundation as any).setHandlePositionByMousePosition);
        window.addEventListener('mouseup', (colorSliderFoundation as any).handleMouseUp);
    },
    handleMouseUp: () => {
        state.value.isHandleGrabbing = false;
        window.removeEventListener('mousemove', (colorSliderFoundation as any).setHandlePositionByMousePosition);
        window.removeEventListener('mouseup', (colorSliderFoundation as any).handleMouseUp);
    },
    getColorPickerFoundation: () => props.foundation,
    getDOM: () => sliderRef.value!,
};

const { foundation: colorSliderFoundation } = useFoundation(ColorSliderFoundation as any, adapter as any);
const colorSliderFoundationTyped = colorSliderFoundation as InstanceType<typeof ColorSliderFoundation>;

watch(
    () => props.hue,
    (newHue) => {
        state.value.handlePosition = (newHue / 360) * props.width - props.handleSize / 2;
    }
);

const sliderStyle = computed(() => ({
    width: typeof props.width === 'number' ? `${props.width}px` : props.width,
    height: typeof props.height === 'number' ? `${props.height}px` : props.height,
    ...props.style,
}));

const handleStyle = computed(() => ({
    width: typeof props.handleSize === 'number' ? `${props.handleSize}px` : props.handleSize,
    height: typeof props.handleSize === 'number' ? `${props.handleSize}px` : props.handleSize,
    left:
        typeof state.value.handlePosition === 'number' ? `${state.value.handlePosition}px` : state.value.handlePosition,
    top: '50%',
    transform: 'translateY(-50%)',
    backgroundColor: ColorPickerFoundation.hsvaToHslString({ h: props.hue, s: 100, v: 100, a: 1 }),
}));

const handleClick = (e: MouseEvent) => {
    colorSliderFoundationTyped.setHandlePositionByMousePosition(e);
    colorSliderFoundationTyped.handleMouseDown(e);
};

const handleHandleMouseDown = (e: MouseEvent) => {
    colorSliderFoundationTyped.handleMouseDown(e);
};

onUnmounted(() => {
    window.removeEventListener('mousemove', colorSliderFoundationTyped.setHandlePositionByMousePosition);
    window.removeEventListener('mouseup', colorSliderFoundationTyped.handleMouseUp);
});
</script>
