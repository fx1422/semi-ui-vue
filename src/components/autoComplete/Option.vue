<template>
    <LocaleConsumer v-if="empty" componentName="Select">
        <template #default="{ locale }">
            <div :class="optionClassName" x-semi-prop="emptyContent">
                {{ emptyContent || (locale as { emptyText: string }).emptyText }}
            </div>
        </template>
    </LocaleConsumer>

    <component
        :is="
            renderOptionItem({
                disabled,
                focused,
                selected,
                style,
                label,
                value,
                inputValue,
                onMouseEnter: (e: MouseEvent) => handleMouseEnter(e),
                onClick: (e: MouseEvent) => handleClick(e),
                ...restProps,
            })
        "
        v-else-if="renderOptionItem"
    />

    <div
        v-else
        :class="optionClassName"
        :style="style"
        role="option"
        :aria-selected="selected ? 'true' : 'false'"
        :aria-disabled="disabled ? 'true' : 'false'"
        @mousedown.stop.prevent="handleClick"
        @click.stop.prevent="handleClick"
        @mouseenter="handleMouseEnter"
    >
        <div v-if="showTick" :class="selectedIconClassName">
            <IconTick />
        </div>
        <!-- 如果有 slot，优先使用 slot（可能是字符串或 VNode）-->
        <template v-if="hasDefaultSlot">
            <div v-if="isString(slotContent) && slotContent" :class="`${prefixCls}-text`">
                <Highlight
                    v-if="inputValue"
                    :searchWords="[inputValue]"
                    :sourceString="slotContent"
                    :highlightClassName="`${prefixCls}-keyword`"
                />
                <template v-else>{{ slotContent }}</template>
            </div>
            <slot v-else-if="isVNodeSlot || !slotContent"></slot>
        </template>
        <!-- 如果没有 slot，检查 label 是否是 VNode（使用 renderItem 时） -->
        <template v-else-if="isVNodeLabel">
            <component :is="label" />
        </template>
        <!-- 如果 label 是字符串 -->
        <template v-else-if="label && typeof label === 'string'">
            <div :class="`${prefixCls}-text`">{{ label }}</div>
        </template>
    </div>
</template>

<script setup lang="ts">
import { computed, useAttrs, useSlots, isVNode } from 'vue';
import classNames from 'classnames';
import { isString } from 'lodash-es';
import { cssClasses } from '@douyinfe/semi-foundation/autoComplete/constants';
import { IconTick } from '../icons';
import Highlight from '../highlight';
import LocaleConsumer from '../locale/LocaleConsumer.vue';
import type { OptionProps } from './interface';

defineOptions({
    name: 'AutoCompleteOption',
});

const props = withDefaults(defineProps<OptionProps>(), {
    prefixCls: cssClasses.PREFIX_OPTION,
    disabled: false,
    selected: false,
    focused: false,
    empty: false,
    showTick: false,
});

const attrs = useAttrs();
const slots = useSlots();

const restProps = computed(() => {
    const { value, label, children, ...rest } = attrs;
    return rest;
});

// 获取原始的 label（在 renderItem 覆盖之前）
// Foundation 层通过 ...item 保留了所有原始数据，label 只是被覆盖
// 如果 renderOption 中传递了 originalLabel，优先使用它
const originalLabel = computed(() => {
    // 如果 renderOption 传递了 originalLabel prop，优先使用它
    const attrsData = attrs as any;
    if (attrsData.originalLabel !== undefined) {
        return attrsData.originalLabel;
    }
    // 如果 label 是 VNode，说明使用了 renderItem，需要从 attrs 中获取原始数据
    if (isVNodeLabel.value) {
        // 检查是否有原始的 label 字段（在 renderItem 覆盖之前）
        // 或者从其他属性中获取（如 email，这是 demo 中设置的原始 label）
        return attrsData.label || attrsData.email || attrsData.value || props.value;
    }
    return props.label || slotContent.value;
});

const hasDefaultSlot = computed(() => {
    return !!slots.default;
});

const slotContent = computed(() => {
    if (!slots.default) return '';
    const vnodes = slots.default();
    if (vnodes && vnodes.length > 0) {
        const vnode = vnodes[0];
        // 如果是文本节点
        if (typeof vnode === 'string') {
            return vnode;
        }
        if (typeof vnode.children === 'string') {
            return vnode.children;
        }
    }
    return '';
});

// 检查 slot 内容是否是 VNode（不是字符串）
const isVNodeSlot = computed(() => {
    if (!slots.default) return false;
    const vnodes = slots.default();
    if (vnodes && vnodes.length > 0) {
        const vnode = vnodes[0];
        // 如果是 VNode，不是字符串
        return !isString(vnode) && (isVNode(vnode) || (typeof vnode === 'object' && vnode !== null));
    }
    return false;
});

// 检查 label 是否是 VNode（当使用 renderItem 时）
const isVNodeLabel = computed(() => {
    const label = props.label;
    if (!label) {
        return false;
    }
    if (isVNode(label)) {
        return true;
    }
    if (typeof label === 'object' && label !== null) {
        return 'type' in (label as Record<string, any>);
    }
    return false;
});

const optionClassName = computed(() => {
    return classNames(props.prefixCls, {
        [`${props.prefixCls}-disabled`]: props.disabled,
        [`${props.prefixCls}-selected`]: props.selected,
        [`${props.prefixCls}-focused`]: props.focused,
        [`${props.prefixCls}-empty`]: props.empty,
        [props.className]: props.className,
    });
});

const selectedIconClassName = computed(() => {
    return classNames([`${props.prefixCls}-icon`]);
});

const handleClick = (event: MouseEvent) => {
    // 事件已经在模板中通过 .stop.prevent 处理了
    const { value, onSelect } = props;
    const isDisabled = props.disabled;

    if (!isDisabled && onSelect) {
        // 使用 originalLabel 获取正确的 label（处理 renderItem 的情况）
        const labelValue = originalLabel.value;
        // 传递完整的 option 对象，包括所有原始数据
        onSelect({ ...restProps.value, value, label: labelValue }, event);
    }
};

const handleMouseEnter = (event: MouseEvent) => {
    if (props.onMouseEnter) {
        props.onMouseEnter(event);
    }
};
</script>
