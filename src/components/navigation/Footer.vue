<template>
    <div :class="wrapCls" :style="style">
        <slot>
            <CollapseButton
                v-if="!hasChildren && collapseButton && navContext.value?.mode !== strings.MODE_HORIZONTAL"
                :prefix-cls="navContext.value?.prefixCls"
                :is-collapsed="isCollapsed"
                :locale="navContext.value?.locale || { collapseText: '收起侧边栏', expandText: '展开侧边栏' }"
                :collapse-text="collapseText"
                @click="handleCollapseButtonClick"
            />
        </slot>
    </div>
</template>

<script setup lang="ts">
import { computed, inject, useSlots } from 'vue';
import classNames from 'classnames';
import { cssClasses, strings } from '@douyinfe/semi-foundation/navigation/constants';
import type { NavFooterProps } from './interface';
import { NavContextKey } from './context';
import CollapseButton from './CollapseButton.vue';
import type { CSSProperties } from 'vue';

defineOptions({
    name: 'NavFooter',
});

const props = withDefaults(defineProps<NavFooterProps & { style?: CSSProperties }>(), {
    collapseButton: false,
});

const emit = defineEmits<{
    click: [e: MouseEvent];
}>();

const slots = useSlots();
const navContextRaw = inject(NavContextKey, null);
// 如果是 computed，需要解包
const navContext = computed(() => {
    if (navContextRaw && typeof navContextRaw === 'object' && 'value' in navContextRaw) {
        return (navContextRaw as any).value;
    }
    return navContextRaw;
});

const hasChildren = computed(() => Boolean(slots.default));

// 确保 isCollapsed 的响应式
const isCollapsed = computed(() => Boolean(navContext.value?.isCollapsed));

const wrapCls = computed(() =>
    classNames(props.className, `${cssClasses.PREFIX}-footer`, {
        [`${cssClasses.PREFIX}-footer-collapsed`]: isCollapsed.value,
    })
);

const handleClick = (e: MouseEvent) => {
    emit('click', e);
};

const handleCollapseButtonClick = (newIsCollapsed: boolean) => {
    // CollapseButton 传递的是新的 isCollapsed 值
    const ctx = navContext.value;
    if (ctx && typeof ctx.onCollapseChange === 'function') {
        ctx.onCollapseChange(newIsCollapsed);
    }
};
</script>
