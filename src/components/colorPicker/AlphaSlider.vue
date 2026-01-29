<template>
    <div
        ref="sliderRef"
        :class="`${cssClasses.PREFIX}-alphaSlider`"
        :style="sliderStyle"
        aria-label="Alpha"
        :aria-valuetext="`${round(props.hsva.a * 100)}%`"
        @mousedown="handleClick"
    >
        <div :class="`${cssClasses.PREFIX}-alphaSliderInner`" :style="{ background: alphaSliderBackground }">
            <div
                :class="`${cssClasses.PREFIX}-alphaHandle`"
                :style="handleStyle"
                @mousedown.stop="handleHandleMouseDown"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onUnmounted } from 'vue';
import type { HsvaColor } from '@douyinfe/semi-foundation/colorPicker/interface';
import type ColorPickerFoundation from '@douyinfe/semi-foundation/colorPicker/foundation';
import AlphaSliderFoundation from '@douyinfe/semi-foundation/colorPicker/AlphaSliderFoundation';
import { hsvaToHslaString, hsvaToRgbaString } from '@douyinfe/semi-foundation/colorPicker/utils/convert';
import { round } from '@douyinfe/semi-foundation/colorPicker/utils/round';
import { cssClasses } from '@douyinfe/semi-foundation/colorPicker/constants';
import { useFoundation, useBaseComponent } from '../_utils';

interface Props {
    width: number;
    height: number;
    hsva: HsvaColor;
    handleSize: number;
    foundation: ColorPickerFoundation;
    className?: string;
    style?: Record<string, any>;
}

const props = defineProps<Props>();

const sliderRef = ref<HTMLDivElement | null>(null);

const state = ref({
    handlePosition: props.hsva.a * props.width - props.handleSize / 2,
    isHandleGrabbing: false,
});

const { adapter: baseAdapter } = useBaseComponent(props, state);

const adapter = {
    ...baseAdapter,
    handleMouseDown: (_e: MouseEvent) => {
        state.value.isHandleGrabbing = true;
        window.addEventListener('mousemove', (alphaSliderFoundation as any).setHandlePositionByMousePosition);
        window.addEventListener('mouseup', (alphaSliderFoundation as any).handleMouseUp);
    },
    handleMouseUp: () => {
        state.value.isHandleGrabbing = false;
        window.removeEventListener('mousemove', (alphaSliderFoundation as any).setHandlePositionByMousePosition);
        window.removeEventListener('mouseup', (alphaSliderFoundation as any).handleMouseUp);
    },
    getColorPickerFoundation: () => props.foundation,
    getDOM: () => sliderRef.value!,
};

const { foundation: alphaSliderFoundation } = useFoundation(AlphaSliderFoundation as any, adapter as any);
const alphaSliderFoundationTyped = alphaSliderFoundation as InstanceType<typeof AlphaSliderFoundation>;

watch(
    () => props.hsva.a,
    (newAlpha) => {
        state.value.handlePosition = newAlpha * props.width - props.handleSize / 2;
    }
);

const colorFrom = computed(() => hsvaToHslaString({ ...props.hsva, a: 0 }));
const colorTo = computed(() => hsvaToHslaString({ ...props.hsva, a: 1 }));
const alphaSliderBackground = computed(() => `linear-gradient(90deg, ${colorFrom.value}, ${colorTo.value})`);

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
    backgroundColor: hsvaToRgbaString(props.hsva),
}));

const handleClick = (e: MouseEvent) => {
    alphaSliderFoundationTyped.setHandlePositionByMousePosition(e);
    alphaSliderFoundationTyped.handleMouseDown(e);
};

const handleHandleMouseDown = (e: MouseEvent) => {
    alphaSliderFoundationTyped.handleMouseDown(e);
};

onUnmounted(() => {
    window.removeEventListener('mousemove', alphaSliderFoundationTyped.setHandlePositionByMousePosition);
    window.removeEventListener('mouseup', alphaSliderFoundationTyped.handleMouseUp);
});
</script>
