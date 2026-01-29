<template>
    <div v-if="isVisible" v-bind="wrapProps" :aria-label="computedAriaLabel">
        <div v-if="prefixIcon || slots.prefixIcon" :class="`${prefixCls}-prefix-icon`">
            <component :is="prefixIcon" v-if="prefixIcon" />
            <slot v-else name="prefixIcon"></slot>
        </div>
        <Avatar v-if="avatarSrc" :src="avatarSrc" :shape="avatarShape" />
        <div v-if="slots.default || (!prefixIcon && !slots.prefixIcon && !avatarSrc)" :class="contentCls">
            <slot></slot>
        </div>
        <div v-else :class="contentCls">
            <slot></slot>
        </div>
        <div v-if="suffixIcon || slots.suffixIcon" :class="`${prefixCls}-suffix-icon`">
            <component :is="suffixIcon" v-if="suffixIcon" />
            <slot v-else name="suffixIcon"></slot>
        </div>
        <div v-if="closable" :class="`${prefixCls}-close`" @click="handleCloseClick">
            <IconClose size="small" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, useSlots } from 'vue';
import cls from 'classnames';
import { cssClasses } from '@douyinfe/semi-foundation/tag/constants';
import { IconClose } from '../icons';
import Avatar from '../avatar/Avatar.vue';
import { TagProps } from './interface';

defineOptions({
    name: 'Tag',
});

const prefixCls = cssClasses.PREFIX;

const props = withDefaults(defineProps<TagProps>(), {
    size: 'default',
    color: 'grey',
    closable: false,
    visible: true,
    type: 'light',
    shape: 'square',
    avatarShape: 'square',
    tabIndex: 0,
});

const emit = defineEmits<{
    close: [tagChildren: any, event: MouseEvent, tagKey: string | number];
    click: [event: MouseEvent];
    mouseenter: [event: MouseEvent];
    keydown: [event: KeyboardEvent];
}>();

const slots = useSlots();

const isVisible = ref(props.visible ?? true);

watch(
    () => props.visible,
    (newValue) => {
        isVisible.value = newValue;
    }
);

// 移除 computed 中对插槽的调用，改为在模板中处理
// 使用一个简单的默认值，避免在 computed 中调用插槽
const contentCls = computed(() => cls(`${prefixCls}-content`, `${prefixCls}-content-center`));

const clickable = computed(() => {
    return props.closable;
});

const handlePrevent = (e: KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
};

const handleCloseClick = (e: MouseEvent) => {
    e.stopPropagation();
    // 移除对插槽的调用，避免在事件处理函数中调用插槽
    // 如果需要传递插槽内容，可以通过其他方式获取
    const tagKey = props.tagKey !== undefined ? props.tagKey : '';

    emit('close', null, e, tagKey);

    if (e.defaultPrevented) {
        return;
    }

    if (props.visible === undefined) {
        isVisible.value = false;
    }
};

const handleClick = (e: MouseEvent) => {
    emit('click', e);
};

const handleMouseEnter = (e: MouseEvent) => {
    emit('mouseenter', e);
};

const handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
        case 'Backspace':
        case 'Delete':
            if (props.closable) {
                handleCloseClick(event as any);
            }
            handlePrevent(event);
            break;
        case 'Enter':
            handleClick(event as any);
            handlePrevent(event);
            break;
        case 'Escape':
            (event.target as HTMLElement).blur();
            break;
        default:
            break;
    }
    emit('keydown', event);
};

const computedAriaLabel = computed(() => {
    if (props['aria-label']) {
        return props['aria-label'];
    }
    // 移除对插槽的调用，避免在 computed 中调用插槽
    // 如果需要 aria-label，应该通过 props 传入
    return '';
});

const baseProps = computed(() => {
    return {
        class: cls(
            prefixCls,
            {
                [`${prefixCls}-default`]: props.size === 'default',
                [`${prefixCls}-small`]: props.size === 'small',
                [`${prefixCls}-large`]: props.size === 'large',
                [`${prefixCls}-square`]: props.shape === 'square',
                [`${prefixCls}-circle`]: props.shape === 'circle',
                [`${prefixCls}-${props.type}`]: props.type,
                [`${prefixCls}-${props.color}-${props.type}`]: props.color && props.type,
                [`${prefixCls}-closable`]: props.closable,
                [`${prefixCls}-invisible`]: !isVisible.value,
                [`${prefixCls}-avatar-${props.avatarShape}`]: props.avatarSrc,
            },
            props.className
        ),
        style: props.style,
        onClick: handleClick,
        onMouseenter: handleMouseEnter,
        tabIndex: props.tabIndex,
    };
});

const a11yProps = computed(() => {
    return {
        role: 'button',
        tabIndex: props.tabIndex || 0,
        onKeydown: handleKeyDown,
    };
});

const wrapProps = computed(() => {
    if (clickable.value) {
        return {
            ...baseProps.value,
            ...a11yProps.value,
        };
    }
    return baseProps.value;
});
</script>
