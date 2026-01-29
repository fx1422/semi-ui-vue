<template>
    <Row v-if="shouldAppendRow">
        <form
            :id="formId"
            ref="formRef"
            :class="formCls"
            :style="props.style"
            :x-form-id="formId"
            v-bind="formAttrs"
            @submit.prevent="handleSubmit"
            @reset="handleReset"
        >
            <slot v-if="!render && !component" v-bind="componentProps" />
            <component :is="component" v-else-if="component" v-bind="componentProps" />
            <RenderVNode v-else-if="render" :render-fn="render" />
        </form>
    </Row>
    <form
        v-else
        :id="formId"
        ref="formRef"
        :class="formCls"
        :style="props.style"
        :x-form-id="formId"
        v-bind="formAttrs"
        @submit.prevent="handleSubmit"
        @reset="handleReset"
    >
        <slot v-if="!render && !component" v-bind="componentProps" />
        <component :is="component" v-else-if="component" v-bind="componentProps" />
        <RenderVNode v-else-if="render" :render-fn="render" />
    </form>
</template>

<script setup lang="ts">
import { ref, computed, provide, onMounted, onUnmounted, watch, nextTick, shallowRef, defineComponent } from 'vue';
import classNames from 'classnames';
import { cssClasses } from '@douyinfe/semi-foundation/form/constants';
import { getUuidv4 } from '@douyinfe/semi-foundation/utils/uuid';
import { cloneDeep, isEqual } from 'lodash-es';
import FormFoundation from '@douyinfe/semi-foundation/form/foundation';
import type { BaseFormAdapter, FormState, FormUpdaterContextType } from '@douyinfe/semi-foundation/form/interface';
import { useFoundation } from '../../_utils/useFoundation';
import { useBaseComponent } from '../_utils/useBaseComponent';
import {
    FormStateContextKey,
    FormApiContextKey,
    FormUpdaterContextKey,
    ArrayFieldContextKey,
    FormIdContextKey,
} from './context';
import { Row } from '../grid';
import type { BaseFormProps } from './interface';

defineOptions({ name: 'SemiForm', inheritAttrs: false });

const modelValue = defineModel<Record<string, any>>();

interface FormProps extends BaseFormProps {}

const props = withDefaults(defineProps<FormProps>(), {
    onChange: () => {},
    onSubmitFail: () => {},
    onSubmit: () => {},
    onReset: () => {},
    onValueChange: () => {},
    onErrorChange: () => {},
    layout: 'vertical',
    labelPosition: 'top',
    allowEmpty: false,
    autoScrollToError: false,
    showValidateIcon: true,
});

const emit = defineEmits<{
    submit: [values: any, e?: Event];
    reset: [];
    'value-change': [values: any, changedValue: any];
    'error-change': [errors: any, changedError?: any];
    change: [formState: FormState];
}>();

const prefix = cssClasses.PREFIX;
const formRef = ref<HTMLFormElement | null>(null);
const formId = ref<string>(props.id || getUuidv4());

const state = ref({
    formId: '',
});

const { adapter: baseAdapter } = useBaseComponent(props, state);

const adapter: BaseFormAdapter = {
    ...baseAdapter,
    cloneDeep,
    notifySubmit: (vals: any, e?: Event) => {
        props.onSubmit(vals, e);
        emit('submit', vals, e);
    },
    notifySubmitFail: (errs: any, vals: any, e?: Event) => {
        props.onSubmitFail(errs, vals, e);
    },
    forceUpdate: (callback?: () => void) => {
        if (callback) {
            pendingForceUpdateCallbacks.push(callback);
        }
        if (forceUpdateTimer) {
            clearTimeout(forceUpdateTimer);
        }
        forceUpdateTimer = setTimeout(() => {
            const newFormState = foundation.getFormState(false);
            forceUpdateTrigger.value++;
            if (formStateRef.value) {
                formStateRef.value = newFormState;
            }
            const callbacks = [...pendingForceUpdateCallbacks];
            pendingForceUpdateCallbacks.length = 0;
            nextTick(() => {
                callbacks.forEach((cb) => cb());
            });
            forceUpdateTimer = null;
        }, 0);
    },
    notifyChange: (formState: FormState) => {
        props.onChange(formState);
        emit('change', formState);
    },
    notifyValueChange: (vals: any, changedValues: any) => {
        props.onValueChange(vals, changedValues);
        emit('value-change', vals, changedValues);
        if (!isUpdatingFromModelValue.value) {
            nextTick(() => {
                if (!isUpdatingFromModelValue.value && !isEqual(vals, modelValue.value)) {
                    modelValue.value = cloneDeep(vals);
                }
            });
        }
    },
    notifyErrorChange: (errs: any, changedError?: any) => {
        props.onErrorChange(errs, changedError);
        emit('error-change', errs, changedError);
    },
    notifyReset: () => {
        props.onReset();
        emit('reset');
    },
    initFormId: () => {
        if (!formId.value) {
            formId.value = props.id || getUuidv4();
        }
        state.value.formId = formId.value;
    },
    getInitValues: () => {
        if (modelValue.value !== undefined) {
            return modelValue.value;
        }
        return props.initValues || {};
    },
    getFormProps: (keys?: string | string[]) => {
        if (typeof keys === 'undefined') {
            return props;
        } else if (typeof keys === 'string') {
            return (props as any)[keys];
        } else {
            const result: Record<string, any> = {};
            keys.forEach((key) => {
                result[key] = (props as any)[key];
            });
            return result;
        }
    },
    getAllErrorDOM: () => {
        const formEl = formRef.value;
        if (!formEl) return [] as unknown as NodeList;
        return formEl.querySelectorAll(`.${prefix}-field-error-message`) as NodeList;
    },
    getFieldDOM: (field: string) => {
        const formEl = formRef.value;
        if (!formEl) return null;
        return formEl.querySelector(`[data-field="${field}"]`) as Node;
    },
    getFieldErrorDOM: (field: string) => {
        const formEl = formRef.value;
        if (!formEl) return null;
        const selector = `.${prefix}-field[x-field-id="${field}"] .${prefix}-field-error-message`;
        return formEl.querySelector(selector) as Node;
    },
};

const { foundation } = useFoundation(FormFoundation, adapter);

const formApiRef = ref<any>(null);
const formStateRef = shallowRef<FormState | null>(null);
const forceUpdateTrigger = ref(0);

let forceUpdateTimer: ReturnType<typeof setTimeout> | null = null;
const pendingForceUpdateCallbacks: Array<() => void> = [];

const formState = formStateRef;
const updaterApi = computed<FormUpdaterContextType>(() => foundation.getModifyFormStateApi());

const isUpdatingFromModelValue = ref(false);

provide(FormStateContextKey, formState);
provide(FormApiContextKey, formApiRef);
provide(FormUpdaterContextKey, updaterApi);
provide(FormIdContextKey, formId);

const arrayFieldContext = computed(() => ({
    shouldUseInitValue: true,
}));
provide(ArrayFieldContextKey, arrayFieldContext);

let isMounted = false;

watch(
    () => modelValue.value,
    (newModelValue) => {
        if (isUpdatingFromModelValue.value) {
            return;
        }
        if (isMounted && newModelValue !== undefined) {
            const currentValues = foundation.getFormState(false).values;
            if (!isEqual(currentValues, newModelValue)) {
                isUpdatingFromModelValue.value = true;
                foundation.setValues(newModelValue, { isOverride: true });
                nextTick(() => {
                    isUpdatingFromModelValue.value = false;
                });
            }
        }
    },
    { deep: true }
);

onMounted(() => {
    isMounted = true;
    foundation.init();
    formApiRef.value = foundation.getFormApi() as any;
    formStateRef.value = foundation.getFormState(false);

    if (props.getFormApi) {
        props.getFormApi(formApiRef.value);
    }

    nextTick(() => {
        const currentValues = foundation.getFormState(false).values;
        if (Object.keys(currentValues).length > 0) {
            if (
                modelValue.value === undefined ||
                (typeof modelValue.value === 'object' &&
                    modelValue.value !== null &&
                    Object.keys(modelValue.value).length === 0)
            ) {
                isUpdatingFromModelValue.value = true;
                modelValue.value = cloneDeep(currentValues);
                nextTick(() => {
                    isUpdatingFromModelValue.value = false;
                });
            }
        }
    });
});

onUnmounted(() => {
    if (forceUpdateTimer) {
        clearTimeout(forceUpdateTimer);
        forceUpdateTimer = null;
    }
    pendingForceUpdateCallbacks.length = 0;
});

defineExpose({
    get formApi() {
        return formApiRef.value;
    },
    get formState() {
        return formStateRef.value;
    },
});

const formCls = computed(() =>
    classNames(prefix, props.className, {
        [`${prefix}-vertical`]: props.layout === 'vertical',
        [`${prefix}-horizontal`]: props.layout === 'horizontal',
    })
);

const shouldAppendRow = computed(() => props.wrapperCol && props.labelCol);

const formAttrs = computed(() => {
    const excludedKeys = [
        'children',
        'getFormApi',
        'onChange',
        'onSubmit',
        'onSubmitFail',
        'onErrorChange',
        'onValueChange',
        'component',
        'render',
        'validateFields',
        'layout',
        'style',
        'className',
        'labelPosition',
        'labelWidth',
        'labelAlign',
        'labelCol',
        'wrapperCol',
        'allowEmpty',
        'autoScrollToError',
        'showValidateIcon',
        'stopValidateWithError',
        'extraTextPosition',
        'id',
        'trigger',
        'disabled',
        'modelValue',
        'initValues',
    ] as const;
    const rest: Record<string, any> = {};
    for (const key in props) {
        if (!excludedKeys.includes(key as any)) {
            rest[key] = (props as any)[key];
        }
    }
    return rest;
});

const componentProps = computed(() => {
    const state = formState.value;
    if (!state) {
        return {
            formState: { values: {}, errors: {} } as FormState,
            formApi: formApiRef.value,
            values: {},
        };
    }
    return {
        formState: {
            ...state,
            values: state.values || {},
            errors: state.errors || {},
        } as FormState,
        formApi: formApiRef.value,
        values: state.values || {},
    };
});

const handleSubmit = (e: Event) => {
    if (props.stopPropagation?.submit) {
        e.stopPropagation();
    }
    foundation.submit(e);
};

const handleReset = (e: Event) => {
    e.preventDefault();
    if (props.stopPropagation?.reset) {
        e.stopPropagation();
    }
    foundation.reset();
};

const RenderVNode = defineComponent({
    name: 'RenderVNode',
    props: {
        renderFn: {
            type: Function,
            required: true,
        },
    },
    setup(props) {
        return () => {
            const result = props.renderFn(componentProps.value);
            if (result === null || result === undefined) {
                return null;
            }
            if (typeof result === 'string' || typeof result === 'number') {
                return String(result);
            }
            return result;
        };
    },
});
</script>
