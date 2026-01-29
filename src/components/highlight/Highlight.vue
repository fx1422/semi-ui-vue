<template>
    <component
        :is="chunk.highlight ? component : 'span'"
        v-for="(chunk, index) in chunks"
        :key="chunk.text + index"
        :class="chunk.highlight ? tagCls + ' ' + (chunk.className || '') : undefined"
        :style="chunk.highlight ? { ...highlightStyle, ...chunk.style } : undefined"
    >
        {{ chunk.text }}
    </component>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import classNames from 'classnames';
import { cssClasses } from '@douyinfe/semi-foundation/highlight/constants';
import HighlightFoundation from '@douyinfe/semi-foundation/highlight/foundation';
import type { HighlightProps, Chunk } from './interface';

const props = withDefaults(defineProps<HighlightProps>(), {
    component: 'mark',
    autoEscape: true,
    caseSensitive: false,
    sourceString: '',
    searchWords: () => [],
});

const prefixCls = cssClasses.PREFIX;

// 计算高亮标签类名
const tagCls = computed(() =>
    classNames(
        {
            [`${prefixCls}-tag`]: true,
        },
        props.highlightClassName
    )
);

// 计算文本块
const chunks = computed(() => {
    const foundation = new HighlightFoundation();
    const rawChunks: Chunk[] = foundation.findAll({
        sourceString: props.sourceString || '',
        searchWords: props.searchWords || [],
        caseSensitive: props.caseSensitive,
        autoEscape: props.autoEscape,
    });

    // 为每个块添加文本内容
    return rawChunks.map((chunk) => {
        const { start, end } = chunk;
        const text = (props.sourceString || '').substring(start, end);
        return {
            ...chunk,
            text,
        };
    });
});
</script>
