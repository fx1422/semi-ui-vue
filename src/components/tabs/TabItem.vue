<template>
    <div
        :id="`semiTab${itemKey}`"
        ref="tabItemRef"
        :class="className"
        role="tab"
        :data-tabkey="`semiTab${itemKey}`"
        :data-scrollkey="`${itemKey}-bar`"
        :aria-controls="`semiTabPanel${itemKey}`"
        :aria-disabled="disabled ? 'true' : 'false'"
        :aria-selected="selected ? 'true' : 'false'"
        :tabindex="selected ? 0 : -1"
        @keydown="handleKeyDownInItem"
        @click="handleItemClick"
    >
        <span v-if="icon" :class="`${prefixCls}-icon`">
            <component :is="icon" v-if="isIconComponent" />
            <template v-else>{{ icon }}</template>
        </span>
        <component :is="tab" v-if="isVNode(tab)" />
        <template v-else>{{ tab }}</template>
        <IconClose
            v-if="closable"
            aria-label="Close"
            role="button"
            :class="`${prefixCls}-icon-close`"
            @click="handleCloseClick"
        />
    </div>
</template>

<script lang="ts" setup>
import { computed, ref, isVNode } from 'vue';
import { cssClasses } from '@douyinfe/semi-foundation/tabs/constants';
import { IconClose } from '../icons';
import type { TabItemProps } from './interface';

const props = withDefaults(defineProps<TabItemProps>(), {
    selected: false,
    closable: false,
    disabled: false,
});

const tabItemRef = ref<HTMLDivElement>();

const prefixCls = cssClasses.TABS_TAB;

const isIconComponent = computed(() => {
    const { icon } = props;
    return (
        isVNode(icon) ||
        typeof icon === 'function' ||
        (typeof icon === 'object' &&
            icon !== null &&
            ('__name' in icon || 'setup' in icon || 'render' in icon || 'name' in icon || 'props' in icon))
    );
});

const className = computed(() => {
    const { type, tabPosition, selected, disabled, size } = props;
    return [
        prefixCls,
        `${prefixCls}-${type}`,
        `${prefixCls}-${tabPosition}`,
        `${prefixCls}-single`,
        {
            [cssClasses.TABS_TAB_ACTIVE]: selected,
            [cssClasses.TABS_TAB_DISABLED]: disabled,
            [`${prefixCls}-small`]: size === 'small',
            [`${prefixCls}-medium`]: size === 'medium',
        },
    ];
});

const handleKeyDownInItem = (event: KeyboardEvent) => {
    props.handleKeyDown?.(event, props.itemKey, props.closable);
};

const handleItemClick = (e: MouseEvent) => {
    if (!props.disabled) {
        props.onClick?.(props.itemKey, e);
    }
};

const handleCloseClick = (e: MouseEvent) => {
    props.deleteTabItem?.(props.itemKey, e);
};

defineExpose({
    tabItemRef,
    $el: tabItemRef,
});
</script>
