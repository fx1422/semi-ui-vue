<template>
    <div v-if="label && label.text" :class="groupWrapperCls">
        <span
            :id="labelId"
            role="group"
            :aria-disabled="disabled"
            :class="groupCls"
            :style="style"
            @focus="handleFocus"
            @blur="handleBlur"
        >
            <slot></slot>
        </span>
    </div>
    <span
        v-else
        role="group"
        aria-label="Input group"
        :aria-disabled="disabled"
        :class="groupCls"
        :style="style"
        @focus="handleFocus"
        @blur="handleBlur"
    >
        <slot></slot>
    </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import cls from 'classnames';
import { cssClasses } from '@douyinfe/semi-foundation/input/constants';
import { InputGroupProps } from './interface';
import { provideInputGroup } from './context';

defineOptions({
    name: 'InputGroup',
});

const prefixCls = cssClasses.PREFIX;

const props = withDefaults(defineProps<InputGroupProps>(), {
    size: 'default',
});

const emit = defineEmits<{
    blur: [e: FocusEvent];
    focus: [e: FocusEvent];
}>();

const labelId = computed(() => {
    return (props.label && props.label.name) || 'input-group';
});

const groupWrapperCls = computed(() => {
    return cls({
        [`${prefixCls}-group-wrapper`]: true,
        [`${prefixCls}-group-wrapper-with-top-label`]: props.labelPosition === 'top',
        [`${prefixCls}-group-wrapper-with-left-label`]: props.labelPosition === 'left',
    });
});

const groupCls = computed(() => {
    return cls(
        `${prefixCls}-group`,
        {
            [`${prefixCls}-${props.size}`]: props.size !== 'default',
        },
        props.className
    );
});

const handleFocus = (e: FocusEvent) => {
    emit('focus', e);
};

const handleBlur = (e: FocusEvent) => {
    emit('blur', e);
};

const inputGroupContext = computed(() => ({
    inputGroup: {
        size: props.size,
        disabled: props.disabled,
        onBlur: handleBlur,
        onFocus: handleFocus,
    },
}));

provideInputGroup(inputGroupContext);
</script>
