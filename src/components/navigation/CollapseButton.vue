<template>
    <div :class="`${prefixCls || 'semi'}-collapse-btn`">
        <Tooltip v-if="isCollapsed" :content="finalCollapseText" position="right">
            <Button :icon="IconSidebar" type="tertiary" theme="borderless" @click="handleClick" />
        </Tooltip>
        <Button v-else :icon="IconSidebar" type="tertiary" theme="borderless" @click="handleClick">
            <!-- 展开时，显示文字 -->
            {{ finalCollapseText }}
        </Button>
    </div>
</template>

<script setup lang="ts">
import { computed, watchEffect } from 'vue';
import Button from '../button';
import Tooltip from '../tooltip';
import { IconSidebar } from '../icons';

export interface CollapseButtonProps {
    prefixCls?: string;
    locale?: any;
    collapseText?: (isCollapsed: boolean) => any;
    isCollapsed?: boolean;
}

const props = withDefaults(defineProps<CollapseButtonProps>(), {
    isCollapsed: false,
    prefixCls: '',
});

const emit = defineEmits<{
    click: [isCollapsed: boolean];
}>();

// 使用 computed 确保响应式
const isCollapsed = computed(() => Boolean(props.isCollapsed));

const handleClick = (e: MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡到 Footer
    emit('click', !isCollapsed.value);
};

// 移除调试日志，已修复问题

const finalCollapseText = computed(() => {
    const collapsed = isCollapsed.value;
    if (typeof props.collapseText === 'function') {
        return props.collapseText(collapsed);
    }
    // 确保返回字符串，即使 locale 为空
    const text = collapsed ? props.locale?.expandText : props.locale?.collapseText;
    return text || (collapsed ? '展开侧边栏' : '收起侧边栏');
});
</script>
