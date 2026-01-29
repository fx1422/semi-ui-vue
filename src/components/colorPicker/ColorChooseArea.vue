<template>
    <div
        ref="areaRef"
        :class="[`${cssClasses.PREFIX}-colorChooseArea`, props.className]"
        :style="areaStyle"
        aria-label="Color"
        :aria-valuetext="`Saturation ${round(props.hsva.s)}%, Brightness ${round(props.hsva.v)}%`"
        @mousedown="handleClick"
    >
        <div :class="`${cssClasses.PREFIX}-handle`" :style="handleStyle" @mousedown.stop="handleHandleMouseDown" />
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted, nextTick } from 'vue';
import type { HsvaColor } from '@douyinfe/semi-foundation/colorPicker/interface';
import ColorChooseAreaFoundation from '@douyinfe/semi-foundation/colorPicker/ColorChooseAreaFoundation';
import type ColorPickerFoundation from '@douyinfe/semi-foundation/colorPicker/foundation';
import { hsvaToHslString, hsvaToRgba } from '@douyinfe/semi-foundation/colorPicker/utils/convert';
import { round } from '@douyinfe/semi-foundation/colorPicker/utils/round';
import { cssClasses } from '@douyinfe/semi-foundation/colorPicker/constants';
import { useFoundation, useBaseComponent } from '../_utils';

interface Props {
    hsva: HsvaColor;
    onChange: (newColor: { s: number; v: number }) => void;
    handleSize: number;
    width: number;
    height: number;
    foundation: ColorPickerFoundation;
    className?: string;
    style?: Record<string, any>;
}

const props = defineProps<Props>();

const areaRef = ref<HTMLDivElement | null>(null);

const state = ref({
    handlePosition: { x: 0, y: 0 },
    isHandleGrabbing: false,
});

const { adapter: baseAdapter } = useBaseComponent(props, state);

const adapter = {
    ...baseAdapter,
    getColorPickerFoundation: () => props.foundation,
    handleMouseDown: (_e: MouseEvent) => {
        state.value.isHandleGrabbing = true;
        if (areaRef.value) {
            areaRef.value.addEventListener(
                'mousemove',
                (colorChooseAreaFoundation as any).setHandlePositionByMousePosition
            );
        }
        window.addEventListener('mouseup', (colorChooseAreaFoundation as any).handleMouseUp);
    },
    handleMouseUp: () => {
        if (areaRef.value) {
            areaRef.value.removeEventListener(
                'mousemove',
                (colorChooseAreaFoundation as any).setHandlePositionByMousePosition
            );
        }
        window.removeEventListener('mouseup', (colorChooseAreaFoundation as any).handleMouseUp);
        state.value.isHandleGrabbing = false;
    },
    getDOM: () => areaRef.value,
    notifyChange: (newColor: { s: number; v: number }) => props.onChange(newColor),
};

const { foundation: colorChooseAreaFoundation } = useFoundation(ColorChooseAreaFoundation as any, adapter as any);
const colorChooseAreaFoundationTyped = colorChooseAreaFoundation as InstanceType<typeof ColorChooseAreaFoundation>;

nextTick(() => {
    try {
        if (colorChooseAreaFoundationTyped) {
            state.value.handlePosition = colorChooseAreaFoundationTyped.getHandlePositionByHSVA();
        }
    } catch (e) {
        console.warn('ColorChooseArea: Failed to initialize handle position', e);
    }
});

onMounted(() => {
    if (areaRef.value && colorChooseAreaFoundationTyped) {
        try {
            state.value.handlePosition = colorChooseAreaFoundationTyped.getHandlePositionByHSVA();
        } catch (e) {
            console.warn('ColorChooseArea: Failed to update handle position in onMounted', e);
        }
    }
});

watch(
    () => props.hsva,
    (newHsva, oldHsva) => {
        if (JSON.stringify(oldHsva) !== JSON.stringify(newHsva)) {
            state.value.handlePosition = colorChooseAreaFoundationTyped.getHandlePositionByHSVA();
        }
    },
    { deep: true }
);

const areaBgStyle = computed(() => hsvaToHslString({ h: props.hsva.h, s: 100, v: 100, a: 1 }));
const currentColor = computed(() => hsvaToRgba(props.hsva));

const areaStyle = computed(() => ({
    backgroundColor: areaBgStyle.value,
    width: typeof props.width === 'number' ? `${props.width}px` : props.width,
    height: typeof props.height === 'number' ? `${props.height}px` : props.height,
    cursor: state.value.isHandleGrabbing ? 'grabbing' : 'pointer',
    ...props.style,
}));

const handleStyle = computed(() => ({
    width: typeof props.handleSize === 'number' ? `${props.handleSize}px` : props.handleSize,
    height: typeof props.handleSize === 'number' ? `${props.handleSize}px` : props.handleSize,
    left:
        typeof state.value.handlePosition.x === 'number'
            ? `${state.value.handlePosition.x}px`
            : state.value.handlePosition.x,
    top:
        typeof state.value.handlePosition.y === 'number'
            ? `${state.value.handlePosition.y}px`
            : state.value.handlePosition.y,
    backgroundColor: `rgba(${currentColor.value.r},${currentColor.value.g},${currentColor.value.b},${currentColor.value.a})`,
}));

const handleClick = (e: MouseEvent) => {
    colorChooseAreaFoundationTyped.setHandlePositionByMousePosition(e);
    colorChooseAreaFoundationTyped.handleMouseDown(e);
};

const handleHandleMouseDown = (e: MouseEvent) => {
    colorChooseAreaFoundationTyped.handleMouseDown(e);
};

onUnmounted(() => {
    if (areaRef.value) {
        areaRef.value.removeEventListener('mousemove', colorChooseAreaFoundationTyped.setHandlePositionByMousePosition);
    }
    window.removeEventListener('mouseup', colorChooseAreaFoundationTyped.handleMouseUp);
});
</script>
