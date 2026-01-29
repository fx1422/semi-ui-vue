<template>
    <div :class="className" :style="props.style">
        <slot name="top" />
        <ColorChooseArea
            :hsva="currentColor.hsva"
            :foundation="foundation"
            :on-change="handleColorChange"
            :handle-size="20"
            :width="pickerProps.width ?? 280"
            :height="pickerProps.height ?? 280"
        />
        <ColorSlider
            :width="pickerProps.width ?? 280"
            :height="10"
            :handle-size="18"
            :hue="currentColor.hsva.h"
            :foundation="foundation"
            :className="'colorSliderWrapper'"
        />
        <AlphaSlider
            v-if="pickerProps.alpha"
            :width="pickerProps.width ?? 280"
            :height="10"
            :handle-size="18"
            :hsva="currentColor.hsva"
            :foundation="foundation"
            :className="'alphaSliderWrapper'"
        />
        <DataPart
            :current-color="currentColor"
            :eye-dropper="pickerProps.eyeDropper ?? true"
            :alpha="pickerProps.alpha"
            :width="pickerProps.width ?? 280"
            :foundation="foundation"
            :default-format="pickerProps.defaultFormat ?? 'hex'"
        />
        <slot name="bottom" />
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ColorValue } from '@douyinfe/semi-foundation/colorPicker/foundation';
import type ColorPickerFoundation from '@douyinfe/semi-foundation/colorPicker/foundation';
import { cssClasses } from '@douyinfe/semi-foundation/colorPicker/constants';
import ColorChooseArea from './ColorChooseArea.vue';
import ColorSlider from './ColorSlider.vue';
import AlphaSlider from './AlphaSlider.vue';
import DataPart from './DataPart.vue';
import type { ColorPickerProps } from './interface';
import classNames from 'classnames';

interface Props {
    currentColor: ColorValue;
    foundation: ColorPickerFoundation;
    props: ColorPickerProps;
    className?: string;
    style?: Record<string, any>;
}

const props = defineProps<Props>();

const emit = defineEmits<{
    colorChange: [{ s: number; v: number }];
}>();

const handleColorChange = ({ s, v }: { s: number; v: number }) => {
    emit('colorChange', { s, v });
};

const pickerProps = props.props;

const className = computed(() => {
    return classNames(cssClasses.PREFIX, props.className);
});
</script>
