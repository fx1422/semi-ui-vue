<template>
    <Popover
        v-if="props.usePopover"
        :content-class-name="classNames(`${cssClasses.PREFIX}-popover`, props.popoverProps?.className)"
        v-bind="{ ...props.popoverProps, trigger: props.popoverProps?.trigger ?? 'click' }"
    >
        <template #content>
            <ColorPickerInner
                :class="[`${cssClasses.PREFIX}`, props.className]"
                :style="props.style"
                :current-color="currentColor"
                :foundation="colorPickerFoundation"
                :props="props"
                @color-change="handleColorChange"
            >
                <template #top>
                    <slot name="top" />
                </template>
                <template #bottom>
                    <slot name="bottom" />
                </template>
            </ColorPickerInner>
        </template>
        <template v-if="slots.default">
            <slot />
        </template>
        <div
            v-else
            :class="`${cssClasses.PREFIX}-popover-defaultChildren`"
            :style="{ backgroundColor: currentColor.hex }"
        />
    </Popover>
    <ColorPickerInner
        v-else
        :class="[`${cssClasses.PREFIX}`, props.className]"
        :style="props.style"
        :current-color="currentColor"
        :foundation="colorPickerFoundation"
        :props="props"
        @color-change="handleColorChange"
    >
        <template #top>
            <slot name="top" />
        </template>
        <template #bottom>
            <slot name="bottom" />
        </template>
    </ColorPickerInner>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { ColorValue } from '@douyinfe/semi-foundation/colorPicker/foundation';
import ColorPickerFoundation from '@douyinfe/semi-foundation/colorPicker/foundation';
import { cssClasses } from '@douyinfe/semi-foundation/colorPicker/constants';
import { useFoundation, useBaseComponent } from '../_utils';
import ColorPickerInner from './ColorPickerInner.vue';
import Popover from '../popover';
import type { ColorPickerProps } from './interface';
import classNames from 'classnames';

const modelValue = defineModel<ColorValue | undefined>({
    default: undefined,
});

// 其他 props
const props = withDefaults(defineProps<ColorPickerProps>(), {
    eyeDropper: true,
    defaultFormat: 'hex',
    defaultValue: () => ({
        hsva: { h: 176, s: 71, v: 77, a: 1 },
        rgba: { r: 57, g: 197, b: 187, a: 1 },
        hex: '#39c5bb',
    }),
});

const emit = defineEmits<{
    change: [value: ColorValue];
}>();

const slots = defineSlots<{
    default?: () => any;
    top?: () => any;
    bottom?: () => any;
}>();

// 判断是否为受控组件
// 优先级：v-model > value prop > defaultValue
const isControlled = computed(() => {
    return modelValue.value !== undefined || props.value !== undefined;
});

// 获取初始颜色值
const getInitialColor = (): ColorValue => {
    if (modelValue.value !== undefined) {
        return modelValue.value;
    }
    if (props.value !== undefined) {
        return props.value;
    }
    return props.defaultValue!;
};

const state = ref({
    currentColor: getInitialColor(),
});

const { adapter: baseAdapter } = useBaseComponent(props, state);

const adapter = {
    ...baseAdapter,
    getProp: (key: string) => {
        // 特殊处理 value prop，优先返回 modelValue（v-model）
        if (key === 'value') {
            return modelValue.value ?? props.value;
        }
        return baseAdapter.getProp(key);
    },
    getProps: () => {
        const baseProps = baseAdapter.getProps();
        return {
            ...baseProps,
            // 确保 value 使用最新的 modelValue（v-model）
            value: modelValue.value ?? props.value,
        };
    },
    notifyChange: (value: ColorValue) => {
        // 如果使用 v-model，更新 modelValue
        if (modelValue.value !== undefined) {
            modelValue.value = value;
        }
        // 如果使用 value prop，触发 change 事件
        if (props.value !== undefined) {
            emit('change', value);
        }
        // 如果使用 defaultValue（非受控），更新内部状态
        if (!isControlled.value) {
            state.value.currentColor = value;
        }
    },
};

const { foundation } = useFoundation(ColorPickerFoundation as any, adapter as any);
const colorPickerFoundation = foundation as ColorPickerFoundation;

const currentColor = computed(() => {
    if (!colorPickerFoundation) {
        return getInitialColor();
    }
    return colorPickerFoundation.getCurrentColor();
});

watch(
    () => [modelValue.value, props.value],
    ([newModelValue, newValue]) => {
        if (!colorPickerFoundation) return;

        const externalValue = newModelValue ?? newValue;
        if (externalValue && isControlled.value) {
            state.value.currentColor = externalValue;
        }
    },
    { deep: true, immediate: true }
);

const handleColorChange = ({ s, v }: { s: number; v: number }) => {
    if (!colorPickerFoundation) return;
    colorPickerFoundation.handleChange(
        {
            s,
            v,
            a: currentColor.value.hsva.a,
            h: currentColor.value.hsva.h,
        },
        'hsva'
    );
};
</script>

<script lang="ts">
import { colorStringToValue } from './utils';

export default {
    name: 'ColorPicker',
    colorStringToValue,
};
</script>
