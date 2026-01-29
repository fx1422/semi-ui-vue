<template>
    <LocaleConsumer v-if="empty" component-name="Select">
        <template #default="{ locale }: { locale: any }">
            <div v-if="emptyContent !== null" :class="optionClassName" x-semi-prop="emptyContent">
                {{ emptyContent || locale?.emptyText }}
            </div>
        </template>
    </LocaleConsumer>

    <component :is="customRenderResult" v-else-if="typeof renderOptionItem === 'function'" />

    <div
        v-else
        :id="semiOptionId"
        :class="optionClassName"
        :style="style"
        role="option"
        :aria-selected="selected ? 'true' : 'false'"
        :aria-disabled="disabled ? 'true' : 'false'"
        @mousedown="handleMouseDown"
        @click="handleClick"
        @mouseenter="handleMouseEnter"
    >
        <div
            v-if="showTick"
            :class="selectedIconClassName"
            :style="selected ? { color: 'var(--semi-color-primary)' } : {}"
        >
            <IconTick />
        </div>
        <div v-if="isStringContent" :class="`${prefixCls}-text`">
            <Highlight
                v-if="inputValue"
                :search-words="[inputValue]"
                :source-string="displayContent as string"
                :highlight-class-name="`${prefixCls}-keyword`"
            />
            <template v-else>{{ displayContent }}</template>
        </div>
        <component :is="displayContent" v-else />
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import classNames from 'classnames';
import { IconTick } from '../icons';
import { cssClasses } from '@douyinfe/semi-foundation/select/constants';
import LocaleConsumer from '../locale/LocaleConsumer.vue';
import Highlight from '../highlight/Highlight.vue';
import type { OptionProps } from './interface';

const prefixCls = cssClasses.PREFIX_OPTION;

const props = withDefaults(
    defineProps<{
        value?: string | number;
        label?: string | number | any;
        children?: any;
        disabled?: boolean;
        selected?: boolean;
        focused?: boolean;
        empty?: boolean;
        emptyContent?: any;
        showTick?: boolean;
        className?: string;
        style?: any;
        inputValue?: string;
        semiOptionId?: string;
        renderOptionItem?: (props: any) => any;
    }>(),
    {}
);

const emit = defineEmits<{
    (e: 'select', option: OptionProps, event: MouseEvent): void;
    (e: 'mouseenter', event: MouseEvent): void;
}>();

const optionClassName = computed(() => {
    return classNames(
        prefixCls,
        {
            [`${prefixCls}-disabled`]: props.disabled,
            [`${prefixCls}-selected`]: props.selected,
            [`${prefixCls}-focused`]: props.focused,
            [`${prefixCls}-empty`]: props.empty,
        },
        props.className
    );
});

const selectedIconClassName = computed(() => {
    return classNames([`${prefixCls}-icon`]);
});

// Display content priority: label > children > value
const displayContent = computed(() => {
    return props.label || props.children || props.value;
});

const isStringContent = computed(() => {
    const content = displayContent.value;
    return typeof content === 'string' || typeof content === 'number';
});

const customRenderResult = computed(() => {
    if (typeof props.renderOptionItem === 'function') {
        const customRenderClassName = classNames(props.className, {
            [`${prefixCls}-custom`]: true,
            [`${prefixCls}-custom-selected`]: props.selected,
        });

        return props.renderOptionItem({
            disabled: props.disabled,
            focused: props.focused,
            selected: props.selected,
            style: props.style,
            label: props.label,
            value: props.value,
            inputValue: props.inputValue,
            onMouseEnter: handleMouseEnter,
            onClick: handleClick,
            className: customRenderClassName,
        });
    }
    return null;
});

function handleMouseDown(event: MouseEvent) {
    event.preventDefault();
}

function handleClick(event: MouseEvent) {
    if (!props.disabled) {
        const { value, label, children, ...rest } = props;
        const displayLabel = label || children || value;
        emit('select', { value, label: displayLabel, ...rest }, event);
    }
}

function handleMouseEnter(event: MouseEvent) {
    emit('mouseenter', event);
}

defineOptions({
    name: 'SelectOption',
    isSelectOption: true,
});
</script>
