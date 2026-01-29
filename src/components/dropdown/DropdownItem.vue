<template>
    <li
        :ref="setRef"
        role="menuitem"
        tabindex="-1"
        :aria-disabled="props.disabled"
        :class="itemClass"
        :style="props.style"
        v-bind="$attrs"
        @click="handleClick"
        @mousedown="handleMouseDown"
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave"
        @contextmenu="handleContextMenu"
        @keydown="handleKeyDown"
    >
        <component :is="IconTick" v-if="realShowTick && isActive" :class="`${prefixCls}-item-tick`" />
        <component
            :is="IconTick"
            v-else-if="realShowTick && !isActive"
            :class="`${prefixCls}-item-tick`"
            :style="{ color: 'transparent' }"
        />
        <div v-if="props.icon" :class="`${prefixCls}-item-icon`">
            <component :is="props.icon" v-if="isVNode(props.icon) || typeof props.icon !== 'string'" />
            <template v-else>{{ props.icon }}</template>
        </div>
        <slot></slot>
    </li>
</template>

<script setup lang="ts" name="DropdownItem">
import { computed, isVNode } from 'vue';
import classnames from 'classnames';
import { cssClasses } from '@douyinfe/semi-foundation/dropdown/constants';
import { IconTick } from '../icons';
import { useDropdownContext } from './context';
import type { DropdownItemProps } from './interface';

const props = withDefaults(defineProps<DropdownItemProps>(), {
    disabled: false,
    selected: false,
});

const emit = defineEmits<{
    click: [e: MouseEvent];
    mouseenter: [e: MouseEvent];
    mouseleave: [e: MouseEvent];
    contextmenu: [e: MouseEvent];
}>();

const prefixCls = cssClasses.PREFIX;
const context = useDropdownContext();

const realShowTick = computed(() => context.showTick ?? props.showTick);

// 如果提供了 selected，也将其视为 active（为了兼容性）
const isActive = computed(() => props.active || props.selected);

const itemClass = computed(() =>
    classnames(props.className, {
        [`${prefixCls}-item`]: true,
        [`${prefixCls}-item-disabled`]: props.disabled,
        [`${prefixCls}-item-hover`]: props.hover,
        [`${prefixCls}-item-withTick`]: realShowTick.value,
        [`${prefixCls}-item-${props.type}`]: props.type,
        [`${prefixCls}-item-active`]: isActive.value,
    })
);

// 判断是否在嵌套的 Dropdown 中（level > 1 表示在子 Dropdown 中）
const isInAnotherDropdown = computed(() => (context.level || 0) > 1);

// 处理点击事件 - 根据 React 版本的逻辑
// 如果在嵌套 Dropdown 中，应该使用 onMouseDown 而不是 onClick
// 但 Vue 中我们需要在模板中同时处理 click 和 mousedown
const handleClick = (e: MouseEvent) => {
    if (props.disabled) {
        return;
    }
    // 只在非嵌套场景下处理 click
    if (!isInAnotherDropdown.value) {
        emit('click', e);
        // 注意：props.onClick 会通过 Vue 的事件系统自动调用（当使用 h() 传递 onClick prop 时）
        // 所以这里不需要手动调用 props.onClick，避免重复触发
    }
};

// 处理鼠标按下事件 - 用于嵌套 Dropdown 场景
const handleMouseDown = (e: MouseEvent) => {
    if (props.disabled) {
        return;
    }
    // 在嵌套场景下，使用 mousedown 并只处理左键点击
    if (isInAnotherDropdown.value && e.button === 0) {
        e.preventDefault(); // 防止触发 click 事件
        emit('click', e);
        // 注意：在嵌套场景下，我们需要手动调用 onClick，因为 preventDefault 阻止了 click 事件
        // 但 Vue 的自动事件绑定可能不会触发，所以这里需要手动调用
        if (props.onClick) {
            props.onClick(e);
        }
    }
};

const handleMouseEnter = (e: MouseEvent) => {
    if (!props.disabled) {
        emit('mouseenter', e);
        if (props.onMouseEnter) {
            props.onMouseEnter(e);
        }
    }
};

const handleMouseLeave = (e: MouseEvent) => {
    if (!props.disabled) {
        emit('mouseleave', e);
        if (props.onMouseLeave) {
            props.onMouseLeave(e);
        }
    }
};

const handleContextMenu = (e: MouseEvent) => {
    if (!props.disabled) {
        emit('contextmenu', e);
        if (props.onContextMenu) {
            props.onContextMenu(e);
        }
    }
};

const handleKeyDown = (e: KeyboardEvent) => {
    // Allow custom key down handler from parent
    if (props.onKeyDown) {
        props.onKeyDown(e);
    }
};

const setRef = (el: any) => {
    // Expose ref for parent components
    if (props.forwardRef) {
        props.forwardRef(el);
    }
};
</script>
