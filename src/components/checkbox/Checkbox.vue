<template>
    <span
        :id="id"
        :role="role"
        :tabindex="tabIndex"
        :style="props.style"
        :class="wrapperClass"
        :aria-labelledby="props['aria-labelledby']"
        v-bind="dataAttrs"
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave"
        @click="handleChange"
        @keypress="handleEnterPress"
    >
        <CheckboxInner
            ref="checkboxEntityRef"
            v-bind="checkboxInnerProps"
            @input-focus="handleFocusVisible"
            @input-blur="handleBlurEvent"
        />
        <div v-if="hasContent" :class="`${prefix}-content`">
            <span v-if="$slots.default" :id="state.addonId" :class="`${prefix}-addon`" x-semi-prop="children">
                <slot></slot>
            </span>
            <div v-if="$slots.extra || extra" :id="state.extraId" :class="extraCls" x-semi-prop="extra">
                <slot name="extra">
                    <component :is="extra" v-if="isVNode(extra)" />
                    <template v-else>{{ extra }}</template>
                </slot>
            </div>
        </div>
    </span>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, isVNode, useSlots, useAttrs } from 'vue';
import classNames from 'classnames';
import { checkboxClasses as css, strings } from '@douyinfe/semi-foundation/checkbox/constants';
import CheckboxFoundation, { CheckboxAdapter } from '@douyinfe/semi-foundation/checkbox/checkboxFoundation';
import { getUuidShort } from '@douyinfe/semi-foundation/utils/uuid';
import getDataAttr from '@douyinfe/semi-foundation/utils/getDataAttr';
import CheckboxInner from './CheckboxInner.vue';
import { useCheckboxGroup } from './context';
import type { CheckboxProps, CheckboxEvent } from './interface';

const modelValue = defineModel<boolean>({ default: undefined });

const props = withDefaults(defineProps<CheckboxProps>(), {
    defaultChecked: false,
    indeterminate: false,
    type: 'default',
});

const emit = defineEmits<{
    change: [e: CheckboxEvent];
    'update:modelValue': [checked: boolean];
    'update:checked': [checked: boolean];
    mouseenter: [e: MouseEvent];
    mouseleave: [e: MouseEvent];
}>();

const slots = useSlots();
const checkboxGroupContext = useCheckboxGroup();
const checkboxEntityRef = ref();

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
    checked: effectiveChecked.value,
    addonId: props.addonId,
    extraId: props.extraId,
    focusVisible: false,
});

let clickState = false;

const adapter: CheckboxAdapter = {
    setNativeControlChecked: (checked: boolean) => {
        state.value.checked = checked;
    },
    notifyChange: (cbContent: CheckboxEvent) => {
        emit('change', cbContent);
        const newChecked = cbContent.target.checked;
        emit('update:modelValue', newChecked);
        emit('update:checked', newChecked);
    },
    generateEvent: (checked: boolean, e: any) => {
        const cbValue: CheckboxEvent = {
            target: {
                ...props,
                checked,
            },
            stopPropagation: () => {
                e?.stopPropagation();
            },
            preventDefault: () => {
                e?.preventDefault();
            },
            nativeEvent: {
                stopImmediatePropagation: () => {
                    if (e?.nativeEvent && typeof e.nativeEvent.stopImmediatePropagation === 'function') {
                        e.nativeEvent.stopImmediatePropagation();
                    }
                },
            },
        };
        return cbValue;
    },
    getIsInGroup: () => isInGroup(),
    getGroupValue: () => checkboxGroupContext.checkboxGroup?.value || [],
    notifyGroupChange: (cbContent: CheckboxEvent) => {
        checkboxGroupContext.checkboxGroup?.onChange(cbContent);
    },
    getGroupDisabled: () => checkboxGroupContext.checkboxGroup?.disabled ?? false,
    setAddonId: () => {
        state.value.addonId = getUuidShort({ prefix: 'addon' });
    },
    setExtraId: () => {
        state.value.extraId = getUuidShort({ prefix: 'extra' });
    },
    setFocusVisible: (focusVisible: boolean) => {
        state.value.focusVisible = focusVisible;
    },
    focusCheckboxEntity: () => {
        focus();
    },
    getContext: () => ({}),
    getContexts: () => ({}),
    getProps: () => props as any,
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
    getProp: (key: string) => props[key],
};

const foundation = new CheckboxFoundation(adapter);

let isInitialized = false;
watch(effectiveChecked, (newChecked) => {
    if (isInitialized && typeof newChecked === 'boolean') {
        foundation.setChecked(newChecked);
    }
});

const attrs = useAttrs();

onMounted(() => {
    foundation.init();
    isInitialized = true;
    if (typeof effectiveChecked.value === 'boolean') {
        foundation.setChecked(effectiveChecked.value);
    }
});

const isInGroup = () => {
    return Boolean(checkboxGroupContext.checkboxGroup && 'value' in props);
};

const prefix = computed(() => props.prefixCls || css.PREFIX);

const checkboxInnerProps = computed(() => {
    const inGroup = isInGroup();
    const baseChecked = inGroup ? state.value.checked : effectiveChecked.value;
    const innerProps: any = {
        checked: baseChecked,
        disabled: props.disabled,
        indeterminate: props.indeterminate,
        prefixCls: props.prefixCls,
        isPureCardType: props.type === strings.TYPE_PURECARD,
        addonId: slots.default && state.value.addonId,
        extraId: (slots.extra || props.extra) && state.value.extraId,
        focusInner: state.value.focusVisible && !focusOuter.value,
        preventScroll: props.preventScroll,
        'aria-describedby': props['aria-describedby'],
        'aria-errormessage': props['aria-errormessage'],
        'aria-invalid': props['aria-invalid'],
        'aria-labelledby': props['aria-labelledby'],
        'aria-required': props['aria-required'],
        'aria-label': props['aria-label'],
    };

    if (inGroup) {
        if (checkboxGroupContext.checkboxGroup?.value) {
            const realChecked = (checkboxGroupContext.checkboxGroup.value || []).includes(props.value);
            innerProps.checked = realChecked;
        }
        if (checkboxGroupContext.checkboxGroup?.disabled) {
            innerProps.disabled = checkboxGroupContext.checkboxGroup.disabled || props.disabled;
        }
        const { isCardType, isPureCardType } = checkboxGroupContext.checkboxGroup;
        innerProps.isCardType = isCardType;
        innerProps.isPureCardType = isPureCardType;
        innerProps.name = checkboxGroupContext.checkboxGroup.name;
    } else {
        innerProps.isPureCardType = props.type === strings.TYPE_PURECARD;
        innerProps.isCardType = props.type === strings.TYPE_CARD || innerProps.isPureCardType;
    }

    return innerProps;
});

const focusOuter = computed(() => {
    const innerProps = checkboxInnerProps.value;
    return innerProps.isCardType || innerProps.isPureCardType;
});

const wrapperClass = computed(() => {
    const innerProps = checkboxInnerProps.value;
    return classNames(prefix.value, {
        [`${prefix.value}-disabled`]: innerProps.disabled,
        [`${prefix.value}-indeterminate`]: props.indeterminate,
        [`${prefix.value}-checked`]: innerProps.checked,
        [`${prefix.value}-unChecked`]: !innerProps.checked,
        [`${prefix.value}-cardType`]: innerProps.isCardType,
        [`${prefix.value}-cardType_disabled`]: innerProps.disabled && innerProps.isCardType,
        [`${prefix.value}-cardType_enable`]: !(innerProps.disabled && innerProps.isCardType),
        [`${prefix.value}-cardType_checked`]: innerProps.isCardType && innerProps.checked && !innerProps.disabled,
        [`${prefix.value}-cardType_checked_disabled`]:
            innerProps.isCardType && innerProps.checked && innerProps.disabled,
        [props.className]: Boolean(props.className),
        [`${prefix.value}-focus`]: state.value.focusVisible && focusOuter.value,
    });
});

const extraCls = computed(() =>
    classNames(`${prefix.value}-extra`, {
        [`${prefix.value}-cardType_extra_noChildren`]: checkboxInnerProps.value.isCardType && !slots.default,
    })
);

const hasContent = computed(() => {
    return slots.default || slots.extra || props.extra;
});

const dataAttrs = computed(() => getDataAttr(props));

const handleChange = (e: MouseEvent) => {
    foundation.handleChange(e);
};

const handleEnterPress = (e: KeyboardEvent) => {
    foundation.handleEnterPress(e);
};

const handleFocusVisible = (event: FocusEvent) => {
    const { target } = event;
    try {
        if (clickState) {
            clickState = false;
            return;
        }
        if ((target as HTMLElement).matches && (target as HTMLElement).matches(':focus-visible')) {
            foundation.handleFocusVisible(event);
        }
    } catch (error) {
        console.warn('Warning: [Semi Checkbox] The current browser does not support the focus-visible');
    }
};

const handleBlurEvent = () => {
    clickState = false;
    foundation.handleBlur();
};

const handleMouseEnter = (e: MouseEvent) => {
    emit('mouseenter', e);
};

const handleMouseLeave = (e: MouseEvent) => {
    emit('mouseleave', e);
};

const focus = () => {
    if (checkboxEntityRef.value) {
        checkboxEntityRef.value.focus();
    }
};

const blur = () => {
    if (checkboxEntityRef.value) {
        checkboxEntityRef.value.blur();
    }
};

defineExpose({
    focus,
    blur,
});
</script>
