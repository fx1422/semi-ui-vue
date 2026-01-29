<template>
    <div
        :id="id"
        role="list"
        :class="wrapperClass"
        :style="style"
        :aria-label="props['aria-label']"
        :aria-labelledby="props['aria-labelledby']"
        :aria-describedby="props['aria-describedby']"
        v-bind="dataAttrs"
    >
        <slot v-if="!options"></slot>
        <Checkbox
            v-for="(option, index) in options"
            v-else
            :key="index"
            role="listitem"
            :disabled="getOptionDisabled(option)"
            :value="getOptionValue(option)"
            :prefix-cls="prefixCls"
            :extra="getOptionExtra(option)"
            :class-name="getOptionClassName(option)"
            :style="getOptionStyle(option)"
            @change="handleOptionChange($event, option)"
        >
            {{ getOptionLabel(option) }}
        </Checkbox>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, type VNode } from 'vue';
import classNames from 'classnames';
import { isEqual } from 'lodash-es';
import { checkboxGroupClasses as css, strings } from '@douyinfe/semi-foundation/checkbox/constants';
import CheckboxGroupFoundation, {
    CheckboxGroupAdapter,
} from '@douyinfe/semi-foundation/checkbox/checkboxGroupFoundation';
import getDataAttr from '@douyinfe/semi-foundation/utils/getDataAttr';
import { provideCheckboxGroup } from './context';
import Checkbox from './Checkbox.vue';
import type { CheckboxGroupProps, CheckboxOptionType, CheckboxEvent } from './interface';

// 使用 defineModel 支持 v-model（默认绑定到 value）
// 当没有使用 v-model 时，modelValue.value 为 undefined
const modelValue = defineModel<any[]>();

const props = withDefaults(defineProps<CheckboxGroupProps>(), {
    disabled: false,
    type: 'default',
    defaultValue: () => [],
    direction: 'vertical',
});

const emit = defineEmits<{
    change: [value: any[]];
    'update:modelValue': [value: any[]];
    'update:value': [value: any[]];
}>();

// 计算实际的 value：优先使用 value prop，然后是 v-model，最后是 defaultValue
// 注意：如果同时使用 value prop 和 v-model，value prop 优先级更高（受控模式）
const effectiveValue = computed(() => {
    // 如果使用了 value prop（受控模式），优先使用它
    if (props.value !== undefined) {
        return Array.isArray(props.value) ? props.value : [];
    }
    // 如果使用了 v-model（modelValue 被显式设置），使用它
    if (modelValue.value !== undefined) {
        return Array.isArray(modelValue.value) ? modelValue.value : [];
    }
    // 否则使用 defaultValue
    return Array.isArray(props.defaultValue) ? props.defaultValue : [];
});

// Component state
const state = ref<{ value: any[] }>({
    value: effectiveValue.value,
});

// Watch effectiveValue 变化，确保 state.value 能正确响应
watch(
    effectiveValue,
    (newValue) => {
        if (!isEqual(newValue, state.value.value)) {
            state.value.value = newValue;
        }
    },
    { immediate: true, deep: true }
);

// Watch modelValue 变化，确保 effectiveValue 能正确响应
watch(
    () => modelValue.value,
    () => {
        // effectiveValue 会自动响应，这里只是确保响应式更新
    }
);

// Foundation adapter
const adapter: CheckboxGroupAdapter = {
    updateGroupValue: (value: any[]) => {
        state.value.value = value;
    },
    notifyChange: (value: any[]) => {
        emit('change', value);
        // 更新 v-model：只使用 emit，defineModel 会自动更新 modelValue.value
        emit('update:modelValue', value);
        // 触发 update:value 事件（兼容 v-model:value）
        emit('update:value', value);
    },
    getContext: () => ({}),
    getContexts: () => ({}),
    getProps: () => {
        // 规范化 value 和 defaultValue，确保它们始终是数组
        const normalizedProps = { ...props };
        if (normalizedProps.value !== undefined && !Array.isArray(normalizedProps.value)) {
            normalizedProps.value = [];
        }
        if (normalizedProps.defaultValue !== undefined && !Array.isArray(normalizedProps.defaultValue)) {
            normalizedProps.defaultValue = [];
        }
        return normalizedProps as any;
    },
    getState: (key?: string) => {
        if (key) {
            return state.value[key];
        }
        return state.value;
    },
    getStates: () => state.value,
    setState: (s: any, callback?: any) => {
        Object.assign(state.value, s);
        callback?.();
    },
    getCache: () => ({}),
    getCaches: () => ({}),
    setCache: () => {},
    stopPropagation: (e: any) => e?.stopPropagation(),
    persistEvent: (e: any) => e?.persist?.(),
    getProp: (key: string) => {
        // 如果获取的是 value，优先返回 effectiveValue
        if (key === 'value') {
            return effectiveValue.value;
        }
        const value = props[key as keyof typeof props];
        // 如果获取的是 defaultValue，确保返回数组
        if (key === 'defaultValue' && value !== undefined && !Array.isArray(value)) {
            return [];
        }
        return value;
    },
};

const foundation = new CheckboxGroupFoundation(adapter);

// Lifecycle
onMounted(() => {
    foundation.init();
});

onUnmounted(() => {
    foundation.destroy();
});

// Watch effectiveValue 变化，同步到 foundation
watch(
    effectiveValue,
    (newValue, oldValue) => {
        if (!isEqual(newValue, oldValue)) {
            foundation.handlePropValueChange(newValue);
        }
    },
    { deep: true }
);

// Computed values
const prefix = computed(() => props.prefixCls || css.PREFIX);

const isPureCardType = computed(() => props.type === strings.TYPE_PURECARD);
const isCardType = computed(() => props.type === strings.TYPE_CARD || isPureCardType.value);

const wrapperClass = computed(() =>
    classNames(
        {
            [prefix.value as string]: true,
            [`${prefix.value}-wrapper`]: true,
            [`${prefix.value}-${props.direction}`]: props.direction,
            [`${prefix.value}-${props.direction}-cardType`]: props.direction && isCardType.value,
            [`${prefix.value}-${props.direction}-pureCardType`]: props.direction && isPureCardType.value,
        },
        props.className
    )
);

const dataAttrs = computed(() => getDataAttr(props));

// Group context
const onChange = (evt: CheckboxEvent) => {
    foundation.handleChange(evt);
};

const checkboxGroupContext = computed(() => ({
    checkboxGroup: {
        onChange,
        value: state.value.value,
        disabled: props.disabled,
        name: foundation.getFormatName(),
        isCardType: isCardType.value,
        isPureCardType: isPureCardType.value,
    },
}));

// Provide context to child checkboxes
provideCheckboxGroup(checkboxGroupContext);

// Option helpers
const getOptionDisabled = (option: string | CheckboxOptionType): boolean => {
    if (typeof option === 'string') {
        return props.disabled;
    }
    return option.disabled || props.disabled;
};

const getOptionValue = (option: string | CheckboxOptionType): any => {
    if (typeof option === 'string') {
        return option;
    }
    return option.value;
};

const getOptionLabel = (option: string | CheckboxOptionType): string | VNode => {
    if (typeof option === 'string') {
        return option;
    }
    return option.label;
};

const getOptionExtra = (option: string | CheckboxOptionType): string | VNode | undefined => {
    if (typeof option === 'string') {
        return undefined;
    }
    return option.extra;
};

const getOptionClassName = (option: string | CheckboxOptionType): string | undefined => {
    if (typeof option === 'string') {
        return undefined;
    }
    return option.className;
};

const getOptionStyle = (option: string | CheckboxOptionType): any => {
    if (typeof option === 'string') {
        return undefined;
    }
    return option.style;
};

const handleOptionChange = (e: CheckboxEvent, option: string | CheckboxOptionType) => {
    if (typeof option !== 'string' && option.onChange) {
        option.onChange(e);
    }
};
</script>
