<template>
    <div v-if="error || helpText" :class="cls" :style="props.style">
        <component :is="iconComponent" v-if="showIcon && text" :class="iconCls" />
        <span v-if="error" :id="errorMessageId">{{ errorText }}</span>
        <span v-else-if="helpText" :id="helpTextId">{{ helpText }}</span>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import classNames from 'classnames';
import { cssClasses } from '@douyinfe/semi-foundation/form/constants';
import { IconAlertTriangle, IconAlertCircle } from '../icons';

defineOptions({ name: 'SemiFormErrorMessage', inheritAttrs: false });

export type FieldError = boolean | string | Array<any> | undefined | unknown;

export interface ErrorMessageProps {
    error?: FieldError;
    className?: string;
    style?: Record<string, any>;
    showValidateIcon?: boolean;
    validateStatus?: string;
    helpText?: string;
    isInInputGroup?: boolean;
    errorMessageId?: string;
    helpTextId?: string;
}

const props = withDefaults(defineProps<ErrorMessageProps>(), {
    showValidateIcon: true,
    validateStatus: 'default',
});

const prefix = cssClasses.PREFIX;

const errorText = computed(() => {
    if (typeof props.error === 'string') {
        return props.error;
    } else if (Array.isArray(props.error)) {
        const err = props.error.filter((e) => e);
        return err.length ? err.join(', ') : '';
    }
    return '';
});

const text = computed(() => props.error || props.helpText);

const showIcon = computed(() => {
    if (props.isInInputGroup) {
        return Boolean(props.error);
    }
    return props.showValidateIcon && Boolean(text.value);
});

const iconComponent = computed(() => {
    if (props.isInInputGroup) {
        return IconAlertCircle;
    }
    if (props.validateStatus === 'warning') {
        return IconAlertTriangle;
    }
    if (props.validateStatus === 'error') {
        return IconAlertCircle;
    }
    return null;
});

const cls = computed(() =>
    classNames(
        {
            [`${prefix}-field-error-message`]: Boolean(props.error),
            [`${prefix}-field-help-text`]: Boolean(props.helpText),
        },
        props.className
    )
);

const iconCls = computed(() => `${prefix}-field-validate-status-icon`);

const errorMessageId = computed(() => props.errorMessageId);
const helpTextId = computed(() => props.helpTextId);
</script>
