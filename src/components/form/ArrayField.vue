<template>
    <slot :array-fields="arrayFields" :add="add" :add-with-init-value="addWithInitValue" />
</template>

<script setup lang="ts">
import { ref, computed, watch, provide, onMounted, onUnmounted } from 'vue';
import { getUuidv4 } from '@douyinfe/semi-foundation/utils/uuid';
import copy from 'fast-copy';
import { useFormUpdater } from './hooks';
import { ArrayFieldContextKey } from './context';
import warning from '@douyinfe/semi-foundation/utils/warning';
import type { ArrayFieldProps, ArrayFieldChildrenProps } from './interface';

defineOptions({ name: 'SemiFormArrayField', inheritAttrs: false });

const props = defineProps<ArrayFieldProps>();

const updater = useFormUpdater();

const getUuidByArray = (array: any[]) => array.map(() => getUuidv4());

const getUpdateKey = (arrayField: any): string | undefined => {
    if (!arrayField) {
        return undefined;
    }
    if (arrayField && arrayField.updateKey) {
        return arrayField.updateKey;
    }
    return undefined;
};

const initValueAdapter = (initValue: any) => {
    const iv: any[] = [];
    if (Array.isArray(initValue)) {
        return initValue;
    } else {
        warning(
            initValue !== undefined,
            '[Semi Form ArrayField] initValue of ArrayField must be an array. Please check the type of your props'
        );
        return iv;
    }
};

const generateKeys = (value: any[], oldKeys?: string[]) => {
    const val = initValueAdapter(value);
    const newKeys = getUuidByArray(val);
    const keys = newKeys.map((key, i) => (oldKeys && oldKeys[i] ? oldKeys[i] : key));
    return keys;
};

const keys = ref<string[]>([]);
const cacheUpdateKey = ref<string | number | null>(null);
const shouldUseInitValueRef = ref(true);

const initValueInProps = props.initValue;
const initValueInForm = computed(() => updater.getValue(props.field));
const initValue = computed(() => initValueInProps || initValueInForm.value);

const shouldUseInitValue = computed(() => {
    const arrayField = updater.getArrayField(props.field || '');
    return !arrayField || shouldUseInitValueRef.value;
});

const arrayFieldContext = computed(() => ({
    shouldUseInitValue: shouldUseInitValue.value,
}));

provide(ArrayFieldContextKey, arrayFieldContext);

onMounted(() => {
    if (!props.field) return;

    const currentValue = updater.getValue(props.field) || initValue.value;
    keys.value = generateKeys(currentValue);

    const initValueCopyForFormState = copy(initValue.value);
    const initValueCopyForReset = copy(initValue.value);
    updater.registerArrayField(props.field, initValueCopyForReset);
    updater.updateStateValue(props.field, initValueCopyForFormState, { notNotify: true, notUpdate: true });
});

onUnmounted(() => {
    if (props.field) {
        updater.unRegisterArrayField(props.field);
    }
});

watch(
    () => {
        if (!props.field) return null;
        const fieldValue = updater.getValue(props.field);
        const arrayField = updater.getArrayField(props.field);
        const updateKey = getUpdateKey(arrayField);
        return { fieldValue, updateKey };
    },
    (result) => {
        if (!props.field || !result) return;
        const { fieldValue, updateKey } = result;

        if (updateKey !== cacheUpdateKey.value) {
            if (Array.isArray(fieldValue)) {
                keys.value = generateKeys(fieldValue, keys.value);
            }
            cacheUpdateKey.value = updateKey;
            if (cacheUpdateKey.value !== null && cacheUpdateKey.value !== undefined) {
                shouldUseInitValueRef.value = false;
            }
        }
    },
    { immediate: true }
);

const add = () => {
    if (!props.field) return;
    keys.value.push(getUuidv4());
    shouldUseInitValueRef.value = true;
    const updateKey = new Date().valueOf();
    updater.updateArrayField(props.field, { updateKey });
    cacheUpdateKey.value = updateKey;
};

const remove = (index: number) => {
    if (!props.field) return;

    // 更新错误状态
    let newArrayFieldError = updater.getError(props.field);
    const opts = { notNotify: true, notUpdate: true };
    if (Array.isArray(newArrayFieldError)) {
        newArrayFieldError = [...newArrayFieldError];
        newArrayFieldError.splice(index, 1);
        updater.updateStateError(props.field, newArrayFieldError, opts);
    }

    // 更新值
    let newArrayFieldValue = updater.getValue(props.field);
    if (Array.isArray(newArrayFieldValue)) {
        newArrayFieldValue = [...newArrayFieldValue];
        newArrayFieldValue.splice(index, 1);
        updater.updateStateValue(props.field, newArrayFieldValue);

        // 重新生成所有keys,确保key与新数组一一对应
        // 这样可以避免Vue的diff算法错误复用组件实例
        keys.value = generateKeys(newArrayFieldValue);
    } else {
        keys.value = [];
    }
};

const addWithInitValue = (lineObject: Record<string, any>) => {
    if (!props.field) return;
    const currentValue = updater.getValue(props.field) || [];
    const cloneRowVal = copy(lineObject);
    const newValue = [...currentValue, cloneRowVal];
    // 立即更新 keys，确保新行能立即显示
    keys.value.push(getUuidv4());
    shouldUseInitValueRef.value = true;
    const updateKey = new Date().valueOf();
    updater.updateStateValue(props.field, newValue, {});
    updater.updateArrayField(props.field, { updateKey });
    cacheUpdateKey.value = updateKey;
};

const arrayFields = computed<ArrayFieldChildrenProps['arrayFields']>(() => {
    return keys.value.map((key, index) => ({
        key,
        field: `${props.field}[${index}]`,
        remove: () => remove(index),
    }));
});
</script>
