<template>
    <span :class="wrapperClasses">
        <input
            ref="inputRef"
            :type="inputType"
            :checked="checked"
            :disabled="disabled"
            :name="name"
            :aria-label="props['aria-label']"
            :aria-labelledby="addonId"
            :aria-describedby="extraId"
            :autofocus="autoFocus"
            @change="onChange"
            @focus="onInputFocus"
            @blur="onInputBlur"
        />
        <span :class="innerClasses">
            <IconRadio v-if="checked" />
        </span>
    </span>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import classNames from 'classnames';
import { radioClasses as css } from '@douyinfe/semi-foundation/radio/constants';
import RadioInnerFoundation, {
    type RadioInnerAdapter,
    type RadioChangeEvent,
} from '@douyinfe/semi-foundation/radio/radioInnerFoundation';
import { IconRadio } from '../icons';
import type { RadioInnerProps } from './interface';

const props = withDefaults(defineProps<RadioInnerProps>(), {
    isButtonRadio: false,
});

const emit = defineEmits<{
    change: [e: RadioChangeEvent];
    inputFocus: [e: FocusEvent];
    inputBlur: [e: FocusEvent];
}>();

const inputRef = ref<HTMLInputElement>();

const state = ref({
    checked: props.checked ?? false,
});

const adapter: RadioInnerAdapter = {
    setNativeControlChecked: (checked: boolean) => {
        state.value.checked = checked;
    },
    notifyChange: (e: RadioChangeEvent) => {
        emit('change', e);
    },
    getState: (key?: string) => {
        if (key) {
            return state.value[key as keyof typeof state.value];
        }
        return state.value;
    },
    getStates: () => state.value,
    setState: (newState: any) => {
        Object.assign(state.value, newState);
    },
    getProps: () => props,
    getProp: (key: string) => (props as any)[key],
    getContext: () => undefined,
    getContexts: () => ({}),
    getCache: () => undefined,
    getCaches: () => ({}),
    setCache: () => {},
    stopPropagation: () => {},
    persistEvent: () => {},
};

const foundation = new RadioInnerFoundation(adapter);

onMounted(() => {
    foundation.init();
});

onUnmounted(() => {
    foundation.destroy();
});

watch(
    () => props.checked,
    (newVal) => {
        foundation.setChecked(newVal ?? false);
    },
    { immediate: true }
);

const onChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const event = {
        target: {
            checked: target.checked,
            value: target.value,
        },
        stopPropagation: () => e.stopPropagation(),
        preventDefault: () => e.preventDefault(),
    };
    foundation.handleChange(event as any);
};

const onInputFocus = (e: FocusEvent) => {
    emit('inputFocus', e);
};

const onInputBlur = (e: FocusEvent) => {
    emit('inputBlur', e);
};

const focus = () => {
    inputRef.value?.focus({ preventScroll: props.preventScroll });
};

const blur = () => {
    inputRef.value?.blur();
};

defineExpose({
    focus,
    blur,
});

const prefix = computed(() => props.prefixCls || css.PREFIX);

const inputType = computed(() => (props.mode === 'advanced' ? 'checkbox' : 'radio'));

const checked = computed(() => props.checked ?? false);

const wrapperClasses = computed(() =>
    classNames({
        [`${prefix.value}-inner`]: true,
        [`${prefix.value}-inner-checked`]: Boolean(checked.value),
        [`${prefix.value}-inner-buttonRadio`]: props.isButtonRadio,
        [`${prefix.value}-inner-pureCardRadio`]: props.isPureCardRadioGroup,
    })
);

const innerClasses = computed(() =>
    classNames({
        [`${prefix.value}-focus`]: props.focusInner,
        [`${prefix.value}-focus-border`]: props.focusInner && !checked.value,
        [`${prefix.value}-inner-display`]: !props.isButtonRadio,
    })
);
</script>

<style lang="scss">
.semi-radio-inner-display {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;

    .semi-icon {
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        line-height: 1 !important;

        svg {
            display: block !important;
        }
    }
}
</style>
