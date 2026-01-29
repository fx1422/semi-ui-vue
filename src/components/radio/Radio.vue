<template>
    <label
        :class="wrapperClasses"
        :style="style"
        v-bind="getDataAttrs()"
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave"
    >
        <RadioInner
            v-bind="innerProps"
            ref="radioEntityRef"
            :mode="realMode"
            :name="realName"
            :is-button-radio="isButtonRadio"
            :is-pure-card-radio-group="isPureCardRadioGroup"
            :addon-id="children && state.addonId"
            :extra-id="extra && state.extraId"
            :focus-inner="state.focusVisible && !focusOuter"
            @change="onChange"
            @input-focus="handleFocusVisible"
            @input-blur="handleBlur"
        />
        <div v-if="children || extra" :class="contentClasses">
            <span v-if="children" :id="state.addonId" :class="addonClasses" :style="addonStyle" x-semi-prop="children">
                <slot></slot>
            </span>
            <div v-if="extra && !isButtonRadio" :id="state.extraId" :class="`${prefix}-extra`" x-semi-prop="extra">
                <slot name="extra">
                    {{ extra }}
                </slot>
            </div>
        </div>
    </label>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, useSlots } from 'vue';
import classNames from 'classnames';
import { radioClasses as css, strings } from '@douyinfe/semi-foundation/radio/constants';
import RadioFoundation, { type RadioAdapter } from '@douyinfe/semi-foundation/radio/radioFoundation';
import { getUuidShort } from '@douyinfe/semi-foundation/utils/uuid';
import getDataAttr from '@douyinfe/semi-foundation/utils/getDataAttr';
import RadioInner from './RadioInner.vue';
import { useRadioGroup } from './context';
import type { RadioProps, RadioChangeEvent } from './interface';

const modelValue = defineModel<boolean>();

const props = withDefaults(
    defineProps<{
        autoFocus?: boolean;
        checked?: boolean;
        defaultChecked?: boolean;
        value?: any;
        disabled?: boolean;
        prefixCls?: string;
        displayMode?: 'vertical' | '';
        mode?: string;
        extra?: any;
        style?: any;
        className?: string;
        addonStyle?: any;
        addonClassName?: string;
        type?: string;
        'aria-label'?: string;
        addonId?: string;
        extraId?: string;
        name?: string;
        preventScroll?: boolean;
    }>(),
    {
        autoFocus: false,
        defaultChecked: false,
        mode: '',
        type: 'default',
    }
) as RadioProps;

const emit = defineEmits<{
    change: [e: RadioChangeEvent];
    'update:modelValue': [checked: boolean];
    'update:checked': [checked: boolean];
    mouseenter: [e: MouseEvent];
    mouseleave: [e: MouseEvent];
}>();

const slots = useSlots();
const radioGroupContextRef = useRadioGroup();
const radioEntityRef = ref();

const effectiveChecked = computed(() => {
    // 优先使用 v-model（如果使用了），然后是 checked prop（受控模式），最后是 defaultChecked
    // 注意：modelValue.value 可能是 false，所以需要检查是否真的使用了 v-model
    // 如果 modelValue.value 是 undefined，说明没有使用 v-model
    if (modelValue.value !== undefined) {
        return modelValue.value;
    }
    // 如果使用了 checked prop（受控模式）
    if (props.checked !== undefined) {
        return props.checked;
    }
    return props.defaultChecked ?? false;
});

const state = ref({
    hover: false,
    addonId: props.addonId,
    extraId: props.extraId,
    checked: effectiveChecked.value,
    focusVisible: false,
});

const adapter: RadioAdapter = {
    setHover: (hover: boolean) => {
        state.value.hover = hover;
    },
    setAddonId: () => {
        state.value.addonId = getUuidShort({ prefix: 'addon' });
    },
    setChecked: (checked: boolean) => {
        state.value.checked = checked;
    },
    setExtraId: () => {
        state.value.extraId = getUuidShort({ prefix: 'extra' });
    },
    setFocusVisible: (focusVisible: boolean) => {
        state.value.focusVisible = focusVisible;
    },
    setState: () => {},
    getState: (key?: string) => {
        if (key) {
            return state.value[key as keyof typeof state.value];
        }
        return state.value;
    },
    getStates: () => state.value,
    getProps: () => props,
    getProp: (key: string) => props[key as keyof typeof props],
    getContext: () => undefined,
    getContexts: () => ({}),
    getCache: () => undefined,
    getCaches: () => ({}),
    setCache: () => {},
    stopPropagation: () => {},
    persistEvent: () => {},
};

const foundation = new RadioFoundation(adapter);

onMounted(() => {
    foundation.init();
});

onUnmounted(() => {
    foundation.destroy();
});

watch(
    effectiveChecked,
    (newVal) => {
        if (typeof newVal === 'boolean') {
            foundation.setChecked(newVal);
        }
    },
    { immediate: true }
);

const isInGroup = computed(() => {
    return Boolean(radioGroupContextRef.value.radioGroup);
});

const getDataAttrs = () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { className, style, prefixCls, displayMode, mode, type, value, name, ...rest } = props;
    return getDataAttr(rest);
};

const onChange = (e: RadioChangeEvent) => {
    const eventWithValue = {
        ...e,
        target: {
            ...e.target,
            value: props.value,
        },
    };

    if (isInGroup.value) {
        const { radioGroup } = radioGroupContextRef.value;
        radioGroup?.onChange && radioGroup.onChange(eventWithValue);
    }

    const newChecked = e.target.checked;

    emit('update:modelValue', newChecked);

    if (props.checked === undefined) {
        foundation.setChecked(newChecked);
    }

    emit('update:checked', newChecked);
    emit('change', eventWithValue);
};

const handleMouseEnter = (e: MouseEvent) => {
    emit('mouseenter', e);
    foundation.setHover(true);
};

const handleMouseLeave = (e: MouseEvent) => {
    emit('mouseleave', e);
    foundation.setHover(false);
};

const handleFocusVisible = (event: FocusEvent) => {
    foundation.handleFocusVisible(event);
};

const handleBlur = () => {
    foundation.handleBlur();
};

const focus = () => {
    radioEntityRef.value?.focus();
};

const blur = () => {
    radioEntityRef.value?.blur();
};

defineExpose({
    focus,
    blur,
});

// Computed values
const children = computed(() => slots.default);
const extra = computed(() => props.extra || slots.extra);

const realChecked = computed(() => {
    if (isInGroup.value) {
        const groupValue = radioGroupContextRef.value.radioGroup?.value;
        const propValue = props.value;
        // 处理 boolean 值的比较：RadioGroup 会将 boolean 转换为 1/0，所以这里也需要转换
        const normalizedGroupValue = typeof groupValue === 'boolean' ? (groupValue ? 1 : 0) : groupValue;
        const normalizedPropValue = typeof propValue === 'boolean' ? (propValue ? 1 : 0) : propValue;
        return normalizedGroupValue === normalizedPropValue;
    }
    // 优先使用 v-model（如果使用了），然后是 checked prop（受控模式），最后是内部状态
    // 注意：modelValue.value 可能是 false，所以需要检查是否真的使用了 v-model
    // 如果 modelValue.value 是 undefined，说明没有使用 v-model
    if (modelValue.value !== undefined) {
        return modelValue.value;
    }
    // 如果使用了 checked prop（受控模式）
    if (props.checked !== undefined) {
        return props.checked;
    }
    return state.value.checked;
});

const isDisabled = computed(() => {
    if (isInGroup.value) {
        return props.disabled || radioGroupContextRef.value.radioGroup?.disabled;
    }
    return props.disabled;
});

const realMode = computed(() => {
    if (isInGroup.value) {
        return radioGroupContextRef.value.mode;
    }
    return props.mode;
});

const isButtonRadioGroup = computed(() => {
    if (isInGroup.value) {
        return radioGroupContextRef.value.radioGroup?.isButtonRadio;
    }
    return props.type === strings.TYPE_BUTTON;
});

const isCardRadioGroup = computed(() => {
    if (isInGroup.value) {
        return radioGroupContextRef.value.radioGroup?.isCardRadio;
    }
    return props.type === strings.TYPE_CARD || isPureCardRadioGroup.value;
});

const isPureCardRadioGroup = computed(() => {
    if (isInGroup.value) {
        return radioGroupContextRef.value.radioGroup?.isPureCardRadio;
    }
    return props.type === strings.TYPE_PURECARD;
});

const buttonSize = computed(() => {
    if (isInGroup.value) {
        return radioGroupContextRef.value.radioGroup?.buttonSize;
    }
    return undefined;
});

const prefix = computed(() => {
    if (isInGroup.value) {
        return props.prefixCls || radioGroupContextRef.value.radioGroup?.prefixCls || css.PREFIX;
    }
    return props.prefixCls || css.PREFIX;
});

const isButtonRadioComponent = computed(() => props.type === 'button');
const isButtonRadio = computed(() =>
    typeof isButtonRadioGroup.value === 'undefined' ? isButtonRadioComponent.value : isButtonRadioGroup.value
);

const focusOuter = computed(() => isCardRadioGroup.value || isPureCardRadioGroup.value || isButtonRadio.value);

const realName = computed(() => {
    if (isInGroup.value && radioGroupContextRef.value.radioGroup) {
        return props.name ?? radioGroupContextRef.value.radioGroup.name;
    }
    return props.name;
});

const wrapperClasses = computed(() =>
    classNames(prefix.value, {
        [`${prefix.value}-disabled`]: isDisabled.value,
        [`${prefix.value}-checked`]: realChecked.value,
        [`${prefix.value}-${props.displayMode}`]: Boolean(props.displayMode),
        [`${prefix.value}-buttonRadioComponent`]: isButtonRadioComponent.value,
        [`${prefix.value}-buttonRadioGroup`]: isButtonRadioGroup.value,
        [`${prefix.value}-buttonRadioGroup-${buttonSize.value}`]: isButtonRadioGroup.value && buttonSize.value,
        [`${prefix.value}-cardRadioGroup`]: isCardRadioGroup.value,
        [`${prefix.value}-cardRadioGroup_disabled`]: isDisabled.value && isCardRadioGroup.value,
        [`${prefix.value}-cardRadioGroup_checked`]: isCardRadioGroup.value && realChecked.value && !isDisabled.value,
        [`${prefix.value}-cardRadioGroup_checked_disabled`]:
            isCardRadioGroup.value && realChecked.value && isDisabled.value,
        [`${prefix.value}-cardRadioGroup_hover`]:
            isCardRadioGroup.value && !realChecked.value && state.value.hover && !isDisabled.value,
        [props.className]: Boolean(props.className),
        [`${prefix.value}-focus`]: state.value.focusVisible && (isCardRadioGroup.value || isPureCardRadioGroup.value),
    })
);

const addonClasses = computed(() =>
    classNames(
        {
            [`${prefix.value}-addon`]: !isButtonRadio.value,
            [`${prefix.value}-addon-buttonRadio`]: isButtonRadio.value,
            [`${prefix.value}-addon-buttonRadio-checked`]: isButtonRadio.value && realChecked.value,
            [`${prefix.value}-addon-buttonRadio-disabled`]: isButtonRadio.value && isDisabled.value,
            [`${prefix.value}-addon-buttonRadio-hover`]:
                isButtonRadio.value && !realChecked.value && !isDisabled.value && state.value.hover,
            [`${prefix.value}-addon-buttonRadio-${buttonSize.value}`]: isButtonRadio.value && buttonSize.value,
            [`${prefix.value}-focus`]: state.value.focusVisible && isButtonRadio.value,
        },
        props.addonClassName
    )
);

const contentClasses = computed(() =>
    classNames([
        `${prefix.value}-content`,
        {
            [`${prefix.value}-isCardRadioGroup_content`]: isCardRadioGroup.value,
        },
    ])
);

const innerProps = computed(() => {
    return {
        checked: realChecked.value,
        disabled: isDisabled.value,
        autoFocus: props.autoFocus,
        'aria-label': props['aria-label'],
        prefixCls: prefix.value,
        preventScroll: props.preventScroll,
    };
});
</script>
