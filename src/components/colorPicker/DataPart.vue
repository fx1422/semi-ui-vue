<template>
    <div
        :class="`${cssClasses.PREFIX}-dataPart`"
        :style="{ width: typeof props.width === 'number' ? `${props.width}px` : props.width }"
    >
        <div
            :class="`${cssClasses.PREFIX}-colorDemoBlock`"
            :style="{
                minWidth: '20px',
                minHeight: '20px',
                backgroundColor: `rgba(${rgba.r},${rgba.g},${rgba.b},${rgba.a})`,
            }"
        />
        <InputGroup size="small" :class="`${cssClasses.PREFIX}-inputGroup`">
            <Input
                :class="`${cssClasses.PREFIX}-colorPickerInput`"
                :value="state.inputValue"
                placeholder=""
                @change="handleInputChange"
            />
            <InputNumber
                v-if="props.alpha"
                :min="0"
                :max="100"
                size="small"
                :class="`${cssClasses.PREFIX}-colorPickerInputNumber`"
                :value="Number(Math.round(props.currentColor.rgba.a * 100))"
                :hide-buttons="true"
                :suffix="h('span', { class: `${cssClasses.PREFIX}-inputNumberSuffix` }, '%')"
                @number-change="handleAlphaChange"
            />
            <Select
                :class="`${cssClasses.PREFIX}-formatSelect`"
                size="small"
                :value="state.format"
                :option-list="formatOptions"
                @select="handleFormatChange"
            />
        </InputGroup>
        <Button
            v-if="props.eyeDropper"
            type="tertiary"
            theme="light"
            size="small"
            :icon="IconEyedropper"
            @click="handlePickValueWithStraw"
        />
    </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed, h } from 'vue';
import type { ColorValue } from '@douyinfe/semi-foundation/colorPicker/foundation';
import type ColorPickerFoundation from '@douyinfe/semi-foundation/colorPicker/foundation';
import DataPartFoundation from '@douyinfe/semi-foundation/colorPicker/DataPartFoundation';
import { cssClasses } from '@douyinfe/semi-foundation/colorPicker/constants';
import { useFoundation, useBaseComponent } from '../_utils';
import Input from '../input';
import InputGroup from '../input/InputGroup.vue';
import InputNumber from '../inputNumber';
import Select from '../select';
import Button from '../button';
import { IconEyedropper } from '../icons';
import ColorPickerFoundationClass from '@douyinfe/semi-foundation/colorPicker/foundation';
import { isEqual } from 'lodash-es';

interface Props {
    currentColor: ColorValue;
    defaultFormat: 'hex' | 'rgba' | 'hsva';
    width: number;
    alpha?: boolean;
    foundation: ColorPickerFoundation;
    eyeDropper: boolean;
}

const props = defineProps<Props>();

const state = ref({
    format: props.defaultFormat,
    inputValue: '',
});

const { adapter: baseAdapter } = useBaseComponent(props, state);

const adapter = {
    ...baseAdapter,
    getColorPickerFoundation: () => props.foundation,
};

const { foundation: dataPartFoundation } = useFoundation(DataPartFoundation, adapter);

const rgba = computed(() => props.currentColor.rgba);

const formatOptions = [
    { label: 'hex', value: 'hex' },
    { label: 'rgba', value: 'rgba' },
    { label: 'hsva', value: 'hsva' },
];

onMounted(() => {
    dataPartFoundation.handleInputValueChange(dataPartFoundation.getInputValue());
});

watch(
    [() => props.currentColor, () => state.value.format],
    ([newColor, newFormat], [oldColor, oldFormat]) => {
        if (!isEqual(oldColor, newColor) || oldFormat !== newFormat) {
            dataPartFoundation.handleInputValueChange(dataPartFoundation.getInputValue());
        }
    },
    { deep: true }
);

const handleInputChange = (value: string) => {
    const colorValue = dataPartFoundation.getValueByInputValue(value);
    if (colorValue) {
        props.foundation.handleChange(colorValue, state.value.format);
    }
    dataPartFoundation.handleInputValueChange(value);
};

const handleAlphaChange = (v: number) => {
    const alpha = Number((v / 100).toFixed(2));
    if (state.value.format === 'rgba') {
        props.foundation.handleChange({ ...props.currentColor.rgba, a: alpha }, 'rgba');
    } else if (state.value.format === 'hex') {
        const rgba = { ...props.currentColor.rgba, a: alpha };
        const hex = ColorPickerFoundationClass.rgbaToHex(rgba);
        props.foundation.handleChange(hex, 'hex');
    } else if (state.value.format === 'hsva') {
        const hsva = { ...props.currentColor.hsva, a: alpha };
        props.foundation.handleChange(hsva, 'hsva');
    }
};

const handleFormatChange = (value: 'hex' | 'rgba' | 'hsva') => {
    dataPartFoundation.handleFormatChange(value);
};

const handlePickValueWithStraw = () => {
    dataPartFoundation.handlePickValueWithStraw();
};
</script>
