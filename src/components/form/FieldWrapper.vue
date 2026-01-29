<template>
    <div
        v-if="!pure"
        :class="fieldCls"
        :style="fieldStyle"
        :data-field="field"
        :x-field-id="field"
        :x-label-pos="mergeLabelPos"
    >
        <template v-if="mergeLabelCol && mergeWrapperCol">
            <div v-if="mergeLabelPos === 'top'" style="overflow: hidden">
                <Col v-bind="mergeLabelCol" :class="labelColCls">
                    <Label v-if="!noLabel" v-bind="labelProps" />
                </Col>
            </div>
            <Col v-else v-bind="mergeLabelCol" :class="labelColCls">
                <Label v-if="!noLabel" v-bind="labelProps" />
            </Col>
            <Col v-bind="mergeWrapperCol">
                <div :class="`${prefix}-field-main`">
                    <div v-if="extraText && mergeExtraPos === 'middle'" :class="extraCls" x-semi-prop="extraText">
                        <component :is="extraText" v-if="isVNode(extraText)" />
                        <template v-else>{{ extraText }}</template>
                    </div>
                    <slot v-bind="fieldBindings"></slot>
                    <ErrorMessage v-if="!noErrorMessage" v-bind="errorMessageProps" />
                    <div v-if="extraText && mergeExtraPos === 'bottom'" :class="extraCls" x-semi-prop="extraText">
                        <component :is="extraText" v-if="isVNode(extraText)" />
                        <template v-else>{{ extraText }}</template>
                    </div>
                </div>
            </Col>
        </template>

        <template v-else>
            <Label v-if="!noLabel" v-bind="labelProps" />
            <div :class="`${prefix}-field-main`">
                <div v-if="extraText && mergeExtraPos === 'middle'" :class="extraCls" x-semi-prop="extraText">
                    <component :is="extraText" v-if="isVNode(extraText)" />
                    <template v-else>{{ extraText }}</template>
                </div>
                <slot v-bind="fieldBindings"></slot>
                <ErrorMessage v-if="!noErrorMessage" v-bind="errorMessageProps" />
                <div v-if="extraText && mergeExtraPos === 'bottom'" :class="extraCls" x-semi-prop="extraText">
                    <component :is="extraText" v-if="isVNode(extraText)" />
                    <template v-else>{{ extraText }}</template>
                </div>
            </div>
        </template>
    </div>

    <slot v-else v-bind="fieldBindings"></slot>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch, isVNode } from 'vue';
import classNames from 'classnames';
import { isEqual } from 'lodash-es';
import { cssClasses } from '@douyinfe/semi-foundation/form/constants';
import {
    isValid,
    generateValidatesFromRules,
    mergeProps,
    transformTrigger,
} from '@douyinfe/semi-foundation/form/utils';
import isPromise from '@douyinfe/semi-foundation/utils/isPromise';
import warning from '@douyinfe/semi-foundation/utils/warning';
import { useStateWithGetter, useFormUpdater, useArrayFieldState, useFormState } from './hooks';
import { useFormId } from './context';
import ErrorMessage from './ErrorMessage.vue';
import Label from './Label.vue';
import { Col } from '../grid';
import type { CallOpts } from '@douyinfe/semi-foundation/form/interface';
import type { CommonFieldProps } from './interface';

defineOptions({ name: 'SemiFormFieldWrapper', inheritAttrs: false });

const props = defineProps<CommonFieldProps>();

const prefix = cssClasses.PREFIX;

const currentFormId = useFormId();

const merged = mergeProps(props);
const {
    field,
    label,
    labelPosition,
    labelWidth,
    labelAlign,
    labelCol,
    wrapperCol,
    noLabel,
    noErrorMessage,
    isInInputGroup,
    initValue,
    validate,
    validateStatus,
    trigger,
    allowEmptyString,
    allowEmpty,
    rules,
    required,
    keepState,
    transform,
    name,
    fieldClassName,
    fieldStyle,
    convert,
    helpText,
    extraText,
    extraTextPosition,
    pure,
    id,
} = merged;

warning(typeof field === 'undefined', "[Semi Form]: 'field' is required, please check your props of Field Component");

const updater = useFormUpdater();

if (!updater.getFormProps) {
    warning(true, '[Semi Form]: Field Component must be used inside the Form, please check your dom declaration');
}

const formProps = updater.getFormProps([
    'labelPosition',
    'labelWidth',
    'labelAlign',
    'labelCol',
    'wrapperCol',
    'disabled',
    'showValidateIcon',
    'extraTextPosition',
    'stopValidateWithError',
    'trigger',
]);

const mergeLabelPos = labelPosition || formProps.labelPosition;
const mergeLabelWidth = labelWidth || formProps.labelWidth;
const mergeLabelAlign = labelAlign || formProps.labelAlign;
const mergeLabelCol = labelCol || formProps.labelCol;
const mergeWrapperCol = wrapperCol || formProps.wrapperCol;
const mergeExtraPos = extraTextPosition || formProps.extraTextPosition || 'bottom';
const mergeTrigger = transformTrigger(trigger, formProps.trigger);

const initValueInFormOpts = typeof field !== 'undefined' ? updater.getValue(field) : undefined;
let initVal = typeof initValue !== 'undefined' ? initValue : initValueInFormOpts;

try {
    const arrayFieldState = useArrayFieldState();
    if (arrayFieldState?.shouldUseInitValue && typeof initValue !== 'undefined') {
        initVal = initValue;
    }
} catch {}

const [value, setValue, getVal] = useStateWithGetter(typeof initVal !== 'undefined' ? initVal : null);
const [error, setError] = useStateWithGetter<any>(undefined);
const [touched, setTouched] = useStateWithGetter(false);
const [status, setStatus] = useStateWithGetter<string | undefined>(validateStatus);

const isUnmounted = ref(false);
const validateOnMount = computed(() => mergeTrigger.includes('mount'));

const allowEmptyValue = allowEmpty || allowEmptyString;

const formState = useFormState();
const isFieldMounted = ref(false);
const isUpdatingFromForm = ref(false);
const lastSyncedFormValue = ref<any>(undefined);

watch(
    () => formState?.values?.[field!],
    (newFormValue) => {
        if (field && isFieldMounted.value && !isUpdatingFromForm.value && newFormValue !== undefined) {
            const currentValue = value.value;
            const lastSynced = lastSyncedFormValue.value;
            if (isEqual(newFormValue, currentValue) || isEqual(newFormValue, lastSynced)) {
                return;
            }
            isUpdatingFromForm.value = true;
            lastSyncedFormValue.value = newFormValue;
            setValue(newFormValue);
            Promise.resolve().then(() => {
                isUpdatingFromForm.value = false;
            });
        }
    },
    { deep: true }
);

const updateValue = (newValue: any, opts?: CallOpts) => {
    const transformedValue = transform ? transform(newValue) : newValue;
    const convertedValue = convert ? convert(transformedValue) : transformedValue;
    setValue(convertedValue);
    if (typeof field !== 'undefined' && !isUpdatingFromForm.value) {
        updater.updateStateValue(field, convertedValue, opts);
    }
};

const updateError = (newError: any, opts?: CallOpts) => {
    setError(newError);
    if (typeof field !== 'undefined') {
        updater.updateStateError(field, newError, opts);
    }
};

const updateTouched = (isTouched: boolean, opts?: CallOpts) => {
    setTouched(isTouched);
    if (typeof field !== 'undefined') {
        updater.updateStateTouched(field, isTouched, opts);
    }
};

const fieldValidate = async (val: any = value.value) => {
    if (isUnmounted.value) {
        return;
    }

    let errorMsg: any = undefined;

    if (rules && rules.length) {
        const validator = generateValidatesFromRules(field || '', rules);
        try {
            await validator.validate({ [field || '']: val });
        } catch (err: any) {
            errorMsg = err.errors?.[0]?.message || err.message;
        }
    }

    if (validate && !errorMsg) {
        const validateResult = validate(val);
        if (isPromise(validateResult)) {
            try {
                await validateResult;
            } catch (err: any) {
                errorMsg = err;
            }
        } else if (validateResult !== true) {
            errorMsg = validateResult;
        }
    }

    updateError(errorMsg);
    updateTouched(true);

    if (errorMsg) {
        setStatus('error');
    } else {
        setStatus(validateStatus || 'success');
    }

    return errorMsg;
};

const fieldApi = {
    getValue: getVal,
    setValue: updateValue,
    getError: () => error.value,
    setError: updateError,
    getTouched: () => touched.value,
    setTouched: updateTouched,
    getStatus: () => status.value,
    setStatus,
    reset: () => {
        const resetValue = typeof initValue !== 'undefined' ? initValue : initValueInFormOpts;
        updateValue(resetValue, { notNotify: true });
        updateError(undefined, { notNotify: true });
        updateTouched(false, { notNotify: true });
        setStatus(validateStatus);
    },
    validate: fieldValidate,
};

onMounted(() => {
    isUnmounted.value = false;
    if (validateOnMount.value) {
        fieldValidate(value.value);
    }

    if (typeof field === 'undefined') {
        return;
    }

    const refValue = getVal();
    updater.register(
        field,
        {
            value: refValue,
            error: error.value,
            touched: touched.value,
            status: status.value as 'error' | 'success' | undefined,
        },
        {
            field,
            fieldApi,
            keepState: keepState || false,
            allowEmpty: allowEmptyValue,
        }
    );

    isFieldMounted.value = true;
});

onUnmounted(() => {
    isUnmounted.value = true;
    if (typeof field !== 'undefined') {
        updater.unRegister(field);
    }
});

const fieldBindings = computed(() => ({
    modelValue: value.value,
    'onUpdate:modelValue': (val: any) => {
        updateValue(val);
        if (mergeTrigger.includes('change')) {
            fieldValidate(val);
        }
    },
    value: value.value,
    'onUpdate:value': (val: any) => {
        updateValue(val);
        if (mergeTrigger.includes('change')) {
            fieldValidate(val);
        }
    },
    checked: value.value,
    'onUpdate:checked': (val: any) => {
        updateValue(val);
        if (mergeTrigger.includes('change')) {
            fieldValidate(val);
        }
    },
    onChange: (val: any) => {
        updateValue(val);
        if (mergeTrigger.includes('change')) {
            fieldValidate(val);
        }
    },
    onBlur: () => {
        updateTouched(true);
        if (mergeTrigger.includes('blur')) {
            fieldValidate(value.value);
        }
    },
    validateStatus: status.value || validateStatus,
    disabled: formProps.disabled,
    'aria-required': required,
    'aria-labelledby': field ? `${field}-label` : undefined,
    name: name || field,
    id: id || (field && currentFormId ? `${currentFormId}-${field}` : field),
}));

const fieldCls = computed(() =>
    classNames(`${prefix}-field`, fieldClassName, {
        [`${prefix}-field-error`]: !isValid(error.value),
    })
);

const labelColCls = computed(() => classNames(mergeLabelCol ? `${prefix}-col-${mergeLabelAlign}` : ''));

const labelProps = computed(() => {
    const labelText = typeof label === 'object' && label !== null ? label.text : label;
    const labelExtra = typeof label === 'object' && label !== null ? label.extra : undefined;
    const labelOptional = typeof label === 'object' && label !== null ? label.optional : undefined;
    const labelRequired = typeof label === 'object' && label !== null ? label.required : undefined;

    return {
        text: labelText || field,
        align: mergeLabelAlign,
        width: mergeLabelWidth,
        required: labelRequired !== undefined ? labelRequired : required,
        optional: labelOptional,
        extra: labelExtra,
        name: name || field,
        id: field ? `${field}-label` : undefined,
    };
});

const errorMessageProps = computed(() => ({
    error: error.value,
    showValidateIcon: formProps.showValidateIcon,
    validateStatus: status.value,
    helpText,
    isInInputGroup,
    errorMessageId: field ? `${field}-error-message` : undefined,
    helpTextId: field ? `${field}-help-text` : undefined,
}));

const extraCls = computed(() =>
    classNames(`${prefix}-field-extra`, {
        [`${prefix}-field-extra-string`]: typeof extraText === 'string',
        [`${prefix}-field-extra-middle`]: mergeExtraPos === 'middle',
        [`${prefix}-field-extra-bottom`]: mergeExtraPos === 'bottom',
    })
);
</script>
