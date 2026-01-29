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
                        {{ extraText }}
                    </div>
                    <component :is="component" v-bind="componentProps" />
                    <ErrorMessage v-if="!noErrorMessage" v-bind="errorMessageProps" />
                    <div v-if="extraText && mergeExtraPos === 'bottom'" :class="extraCls" x-semi-prop="extraText">
                        {{ extraText }}
                    </div>
                </div>
            </Col>
        </template>

        <template v-else>
            <Label v-if="!noLabel" v-bind="labelProps" />
            <div :class="`${prefix}-field-main`">
                <div v-if="extraText && mergeExtraPos === 'middle'" :class="extraCls" x-semi-prop="extraText">
                    {{ extraText }}
                </div>
                <component :is="component" v-bind="componentProps" />
                <ErrorMessage v-if="!noErrorMessage" v-bind="errorMessageProps" />
                <div v-if="extraText && mergeExtraPos === 'bottom'" :class="extraCls" x-semi-prop="extraText">
                    {{ extraText }}
                </div>
            </div>
        </template>
    </div>

    <component :is="component" v-else v-bind="componentProps" />
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import classNames from 'classnames';
import { cssClasses } from '@douyinfe/semi-foundation/form/constants';
import {
    isValid,
    generateValidatesFromRules,
    mergeOptions,
    mergeProps,
    transformTrigger,
} from '@douyinfe/semi-foundation/form/utils';
import isPromise from '@douyinfe/semi-foundation/utils/isPromise';
import warning from '@douyinfe/semi-foundation/utils/warning';
import { useStateWithGetter, useFormUpdater, useArrayFieldState } from './hooks';
import { useFormId } from './context';
import ErrorMessage from './ErrorMessage.vue';
import Label from './Label.vue';
import { Col } from '../grid';
import type { CallOpts, WithFieldOption } from '@douyinfe/semi-foundation/form/interface';
import type { CommonFieldProps } from './interface';

defineOptions({ name: 'SemiFormField', inheritAttrs: false });

const props = defineProps<CommonFieldProps & { component: any; options?: WithFieldOption }>();

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

const { options, shouldInject } = mergeOptions(props.options || {}, props);

warning(
    typeof field === 'undefined' && shouldInject,
    "[Semi Form]: 'field' is required, please check your props of Field Component"
);

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

let arrayFieldState;
try {
    arrayFieldState = useArrayFieldState();
    if (arrayFieldState) {
        initVal =
            arrayFieldState.shouldUseInitValue && typeof initValue !== 'undefined' ? initValue : initValueInFormOpts;
    }
} catch (err) {
    // Not in ArrayField context
}

const [value, setValue, getVal] = useStateWithGetter(typeof initVal !== 'undefined' ? initVal : null);
const [error, setError] = useStateWithGetter<any>(undefined);
const [touched, setTouched] = useStateWithGetter(false);
const [status, setStatus] = useStateWithGetter<string | undefined>(validateStatus);

const isUnmounted = ref(false);
const validateOnMount = computed(() => mergeTrigger.includes('mount'));

const allowEmptyValue = allowEmpty || allowEmptyString;

const updateValue = (newValue: any, opts?: CallOpts) => {
    const transformedValue = transform ? transform(newValue) : newValue;
    const convertedValue = convert ? convert(transformedValue) : transformedValue;
    setValue(convertedValue);
    if (typeof field !== 'undefined') {
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

const handleChange = (e: any) => {
    const valuePath = options.valuePath || '';
    let newValue = valuePath ? (e?.target?.[valuePath] ?? e?.[valuePath] ?? e) : e;

    if (options.valueKey === 'checked') {
        newValue = e?.target?.checked ?? e;
    }

    updateValue(newValue);
    if (mergeTrigger.includes('change')) {
        fieldValidate(newValue);
    }
};

const handleBlur = () => {
    updateTouched(true);
    if (mergeTrigger.includes('blur')) {
        fieldValidate(value.value);
    }
};

const reset = () => {
    const resetValue = typeof initValue !== 'undefined' ? initValue : initValueInFormOpts;
    updateValue(resetValue, { notNotify: true });
    updateError(undefined, { notNotify: true });
    updateTouched(false, { notNotify: true });
    setStatus(validateStatus);
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
    reset,
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
});

onUnmounted(() => {
    isUnmounted.value = true;
    if (typeof field !== 'undefined') {
        updater.unRegister(field);
    }
});

const valueKey = options.valueKey || 'value';
const componentProps = computed(() => {
    const propsToPass: any = {
        [valueKey]: value.value,
        [options.onKeyChangeFnName || 'onChange']: handleChange,
        onBlur: handleBlur,
        validateStatus: status.value || validateStatus,
        disabled: formProps.disabled,
        'aria-required': required,
        'aria-labelledby': `${field}-label`,
    };

    if (name) {
        propsToPass.name = name;
    }

    if (id) {
        propsToPass.id = id;
    } else if (field) {
        propsToPass.id = currentFormId ? `${currentFormId}-${field}` : field;
    }

    return propsToPass;
});

const fieldCls = computed(() =>
    classNames(`${prefix}-field`, fieldClassName, {
        [`${prefix}-field-error`]: !isValid(error.value),
    })
);

const labelColCls = computed(() => classNames(mergeLabelCol ? `${prefix}-col-${mergeLabelAlign}` : ''));

const labelProps = computed(() => ({
    text: label || field,
    align: mergeLabelAlign,
    width: mergeLabelWidth,
    required,
    name: name || field,
    id: `${field}-label`,
}));

const errorMessageProps = computed(() => ({
    error: error.value,
    showValidateIcon: formProps.showValidateIcon,
    validateStatus: status.value,
    helpText,
    isInInputGroup,
    errorMessageId: `${field}-error-message`,
    helpTextId: `${field}-help-text`,
}));

const extraCls = computed(() =>
    classNames(`${prefix}-field-extra`, {
        [`${prefix}-field-extra-string`]: typeof extraText === 'string',
        [`${prefix}-field-extra-middle`]: mergeExtraPos === 'middle',
        [`${prefix}-field-extra-bottom`]: mergeExtraPos === 'bottom',
    })
);
</script>
