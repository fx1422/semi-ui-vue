<template>
    <label :id="props.id" :class="labelCls" :for="props.name" :style="labelStyle">
        <div :class="`${prefixCls}-field-label-text`" x-semi-prop="label">
            <template v-if="typeof text !== 'undefined'">{{ text }}</template>
            <slot v-else></slot>
            <span v-if="optional" :class="`${prefixCls}-field-label-optional-text`">{{ optionalText }}</span>
        </div>
        <div v-if="extra || (slots && slots.extra)" :class="`${prefixCls}-field-label-extra`">
            <slot name="extra">
                <component :is="extra" v-if="isVNode(extra) || (typeof extra === 'object' && extra !== null)" />
                <template v-else-if="extra">{{ extra }}</template>
            </slot>
        </div>
    </label>
</template>

<script setup lang="ts">
import { computed, unref, isVNode, useSlots } from 'vue';
import classNames from 'classnames';
import { cssClasses } from '@douyinfe/semi-foundation/form/constants';
import { useLocale } from '../_utils/useLocale';

defineOptions({ name: 'SemiFormLabel', inheritAttrs: false });

export interface LabelProps {
    align?: string;
    className?: string;
    disabled?: boolean;
    id?: string;
    required?: boolean;
    text?: string;
    name?: string;
    width?: number | string;
    style?: Record<string, any>;
    extra?: string | any; // Support VNode or component
    optional?: boolean;
}

const props = withDefaults(defineProps<LabelProps>(), {
    required: false,
    name: '',
    align: 'left',
    className: '',
    optional: false,
});

const slots = useSlots();
const prefixCls = cssClasses.PREFIX;
const localeConfig = useLocale({ componentName: 'Form' });

const optionalText = computed(() => {
    const localeValue = unref(localeConfig);
    return (localeValue?.locale as any)?.optional || '（可选）';
});

const labelCls = computed(() =>
    classNames(props.className, {
        [`${prefixCls}-field-label`]: true,
        [`${prefixCls}-field-label-left`]: props.align === 'left',
        [`${prefixCls}-field-label-right`]: props.align === 'right',
        [`${prefixCls}-field-label-required`]: props.required,
        [`${prefixCls}-field-label-disabled`]: props.disabled,
        [`${prefixCls}-field-label-with-extra`]: props.extra || (slots && slots.extra),
    })
);

const labelStyle = computed(() => {
    const style = props.style ? { ...props.style } : {};
    if (props.width) {
        style.width = props.width;
    }
    return style;
});
</script>
