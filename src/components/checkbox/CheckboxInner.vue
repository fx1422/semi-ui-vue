<template>
    <span :class="wrapperClass">
        <input
            ref="inputRef"
            type="checkbox"
            :class="inputClass"
            :checked="checked"
            :disabled="disabled"
            :name="name"
            :aria-label="props['aria-label']"
            :aria-disabled="disabled"
            :aria-checked="checked"
            :aria-labelledby="addonId"
            :aria-describedby="extraId || props['aria-describedby']"
            :aria-invalid="props['aria-invalid']"
            :aria-errormessage="props['aria-errormessage']"
            :aria-required="props['aria-required']"
            @change="() => {}"
            @focus="handleFocus"
            @blur="handleBlur"
        />
        <span :class="innerClass">
            <IconCheckboxTick v-if="checked" />
            <IconCheckboxIndeterminate v-else-if="indeterminate" />
        </span>
    </span>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import classNames from 'classnames';
import { checkboxClasses as css } from '@douyinfe/semi-foundation/checkbox/constants';
import { IconCheckboxTick, IconCheckboxIndeterminate } from '../icons';

export interface CheckboxInnerProps {
    'aria-describedby'?: string;
    'aria-errormessage'?: string;
    'aria-invalid'?: boolean;
    'aria-labelledby'?: string;
    'aria-required'?: boolean;
    'aria-label'?: string;
    indeterminate?: boolean;
    checked?: boolean;
    disabled?: boolean;
    prefixCls?: string;
    name?: string;
    isPureCardType?: boolean;
    addonId?: string;
    extraId?: string;
    focusInner?: boolean;
    preventScroll?: boolean;
}

const props = withDefaults(defineProps<CheckboxInnerProps>(), {});

const emit = defineEmits<{
    inputFocus: [e: FocusEvent];
    inputBlur: [e: FocusEvent];
}>();

const inputRef = ref<HTMLInputElement>();

const prefix = computed(() => props.prefixCls || css.PREFIX);

const wrapperClass = computed(() =>
    classNames(
        {
            [`${prefix.value}-inner`]: true,
            [`${prefix.value}-inner-checked`]: Boolean(props.checked),
            [`${prefix.value}-inner-pureCardType`]: props.isPureCardType,
        },
        css.WRAPPER
    )
);

const inputClass = computed(() => css.INPUT);

const innerClass = computed(() =>
    classNames({
        [`${prefix.value}-inner-display`]: true,
        [`${prefix.value}-focus`]: props.focusInner,
        [`${prefix.value}-focus-border`]: props.focusInner && !props.checked,
    })
);

const handleFocus = (e: FocusEvent) => {
    emit('inputFocus', e);
};

const handleBlur = (e: FocusEvent) => {
    emit('inputBlur', e);
};

const focus = () => {
    if (inputRef.value) {
        inputRef.value.focus({ preventScroll: props.preventScroll });
    }
};

const blur = () => {
    if (inputRef.value) {
        inputRef.value.blur();
    }
};

defineExpose({
    focus,
    blur,
});
</script>

<style lang="scss" scoped>
.semi-checkbox-inner-display {
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>
