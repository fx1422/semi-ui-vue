<template>
    <div
        :id="id"
        :class="wrapperClasses"
        :style="style"
        :aria-label="props['aria-label']"
        :aria-invalid="props['aria-invalid']"
        :aria-errormessage="props['aria-errormessage']"
        :aria-labelledby="props['aria-labelledby']"
        :aria-describedby="props['aria-describedby']"
        :aria-required="props['aria-required']"
        v-bind="getDataAttrs()"
    >
        <template v-if="options">
            <Radio
                v-for="(option, index) in options"
                :key="index"
                :disabled="getOptionDisabled(option)"
                :value="getOptionValue(option)"
                :extra="getOptionExtra(option)"
                :class-name="getOptionClassName(option)"
                :style="getOptionStyle(option)"
                :addon-id="getOptionAddonId(option)"
                :addon-style="getOptionAddonStyle(option)"
                :addon-class-name="getOptionAddonClassName(option)"
                :extra-id="getOptionExtraId(option)"
            >
                {{ getOptionLabel(option) }}
            </Radio>
        </template>
        <slot v-else></slot>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import classNames from 'classnames';
import { isEqual } from 'lodash-es';
import { radioGroupClasses as css, strings } from '@douyinfe/semi-foundation/radio/constants';
import RadioGroupFoundation, { type RadioGroupAdapter } from '@douyinfe/semi-foundation/radio/radioGroupFoundation';
import getDataAttr from '@douyinfe/semi-foundation/utils/getDataAttr';
import { provideRadioGroup, type RadioContextValue } from './context';
import Radio from './Radio.vue';
import type { RadioGroupProps, OptionItem, RadioChangeEvent } from './interface';

const modelValue = defineModel<string | number | boolean>();

const props = withDefaults(
    defineProps<{
        defaultValue?: any;
        disabled?: boolean;
        name?: string;
        options?: any;
        className?: string;
        style?: any;
        direction?: string;
        mode?: string;
        type?: string;
        buttonSize?: string;
        prefixCls?: string;
        'aria-label'?: string;
        'aria-describedby'?: string;
        'aria-errormessage'?: string;
        'aria-invalid'?: boolean;
        'aria-labelledby'?: string;
        'aria-required'?: boolean;
        id?: string;
    }>(),
    {
        disabled: false,
        direction: 'horizontal',
        mode: '',
        type: 'default',
        buttonSize: 'middle',
    }
) as RadioGroupProps;

const emit = defineEmits<{
    change: [e: RadioChangeEvent];
}>();

const state = ref({
    value: modelValue.value ?? props.defaultValue,
});

watch(
    () => modelValue.value,
    (newValue) => {
        if (newValue !== undefined && !isEqual(newValue, state.value.value)) {
            state.value.value = newValue;
        }
    },
    { immediate: true }
);

const adapter = {
    setValue: (value: any) => {
        state.value.value = value;
    },
    getProps: () => props,
    isInProps: (name: string) => {
        if (name === 'value') {
            return modelValue.value !== undefined;
        }
        return props[name as keyof typeof props] !== undefined;
    },
    notifyChange: (evt: RadioChangeEvent) => {
        emit('change', evt);
        modelValue.value = evt.target.value;
    },
    setState: () => {},
    getState: (key?: string) => {
        if (key) {
            return state.value[key as keyof typeof state.value];
        }
        return state.value;
    },
    getStates: () => state.value,
    getProp: (key: string) => props[key as keyof typeof props],
    getContext: () => undefined,
    getContexts: () => ({}),
    getCache: () => undefined,
    getCaches: () => ({}),
    setCache: () => {},
    stopPropagation: () => {},
    persistEvent: () => {},
} as RadioGroupAdapter;

const foundation = new RadioGroupFoundation(adapter);

onMounted(() => {
    foundation.init();
    if (modelValue.value !== undefined && state.value.value !== modelValue.value) {
        state.value.value = modelValue.value;
    }
});

onUnmounted(() => {
    foundation.destroy();
});

watch(
    () => modelValue.value,
    (newVal, oldVal) => {
        if (typeof oldVal === 'number' && isNaN(oldVal) && typeof newVal === 'number' && isNaN(newVal)) {
            return;
        }
        if (newVal !== oldVal) {
            foundation.handlePropValueChange(newVal);
        }
    }
);

const onChange = (evt: RadioChangeEvent) => {
    foundation.handleChange(evt);
};

const getFormatName = () => props.name || 'default';

const getDataAttrs = () => {
    const excludedKeys = [
        'defaultValue',
        'disabled',
        'name',
        'options',
        'value',
        'className',
        'style',
        'direction',
        'mode',
        'type',
        'buttonSize',
        'prefixCls',
        'id',
        'aria-label',
        'aria-describedby',
        'aria-errormessage',
        'aria-invalid',
        'aria-labelledby',
        'aria-required',
    ] as const;
    const rest: Record<string, any> = {};
    for (const key in props) {
        if (!excludedKeys.includes(key as any)) {
            rest[key] = (props as any)[key];
        }
    }
    return getDataAttr(rest);
};

const getOptionDisabled = (option: string | OptionItem): boolean => {
    if (typeof option === 'string') {
        return props.disabled;
    }
    return option.disabled || props.disabled;
};

const getOptionValue = (option: string | OptionItem): any => {
    if (typeof option === 'string') {
        return option;
    }
    return option.value;
};

const getOptionLabel = (option: string | OptionItem): any => {
    if (typeof option === 'string') {
        return option;
    }
    return option.label;
};

const getOptionExtra = (option: string | OptionItem): any => {
    if (typeof option === 'string') {
        return undefined;
    }
    return option.extra;
};

const getOptionClassName = (option: string | OptionItem): string | undefined => {
    if (typeof option === 'string') {
        return undefined;
    }
    return option.className;
};

const getOptionStyle = (option: string | OptionItem): any => {
    if (typeof option === 'string') {
        return undefined;
    }
    return option.style;
};

const getOptionAddonId = (option: string | OptionItem): string | undefined => {
    if (typeof option === 'string') {
        return undefined;
    }
    return option.addonId;
};

const getOptionAddonStyle = (option: string | OptionItem): any => {
    if (typeof option === 'string') {
        return undefined;
    }
    return option.addonStyle;
};

const getOptionAddonClassName = (option: string | OptionItem): string | undefined => {
    if (typeof option === 'string') {
        return undefined;
    }
    return option.addonClassName;
};

const getOptionExtraId = (option: string | OptionItem): string | undefined => {
    if (typeof option === 'string') {
        return undefined;
    }
    return option.extraId;
};

const prefix = computed(() => props.prefixCls || css.PREFIX);

const isButtonRadio = computed(() => props.type === strings.TYPE_BUTTON);
const isPureCardRadio = computed(() => props.type === strings.TYPE_PURECARD);
const isCardRadio = computed(() => props.type === strings.TYPE_CARD || isPureCardRadio.value);
const isDefaultRadio = computed(() => props.type === strings.TYPE_DEFAULT);

const wrapperClasses = computed(() =>
    classNames(props.className, {
        [prefix.value]: true,
        [`${prefix.value}-wrapper`]: true,
        [`${prefix.value}-${props.direction}`]: props.direction && !isButtonRadio.value,
        [`${prefix.value}-${props.direction}-default`]: props.direction && isDefaultRadio.value,
        [`${prefix.value}-${props.direction}-card`]: props.direction && isCardRadio.value,
        [`${prefix.value}-buttonRadio`]: isButtonRadio.value,
    })
);

const radioGroupContext = computed((): RadioContextValue => {
    const modelVal = modelValue.value;
    const stateValue = state.value.value;
    const contextValue = modelVal !== undefined ? modelVal : stateValue;
    const normalizedValue: string | number | undefined =
        typeof contextValue === 'boolean' ? (contextValue ? 1 : 0) : (contextValue as string | number | undefined);

    return {
        radioGroup: {
            onChange,
            value: normalizedValue,
            disabled: props.disabled,
            name: getFormatName(),
            isButtonRadio: isButtonRadio.value,
            isCardRadio: isCardRadio.value,
            isPureCardRadio: isPureCardRadio.value,
            buttonSize: props.buttonSize,
            prefixCls: props.prefixCls,
        },
        mode: props.mode,
    };
});

provideRadioGroup(radioGroupContext);
</script>
