<template>
    <template v-if="false"></template>
</template>

<script setup lang="ts">
/**
 * Column 组件是一个标记组件，用于在 JSX/TSX 中声明式定义表格列。
 *
 * 该组件不渲染任何内容，仅用于收集列配置信息。
 * 在 Vue 中，Table 组件主要通过 `columns` prop（数组）来定义列，
 * 但 Column 组件提供了与 React 版本一致的 API 兼容性。
 *
 */
import type { ColumnProps } from './interface';

defineOptions({
    name: 'SemiTableColumn',
});

defineProps<ColumnProps>();
</script>
