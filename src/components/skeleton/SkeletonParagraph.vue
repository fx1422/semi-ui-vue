<template>
    <ul :class="paragraphClasses" :style="style">
        <li v-for="i in rows" :key="i"></li>
    </ul>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import classNames from 'classnames';
import { cssClasses } from '@douyinfe/semi-foundation/skeleton/constants';
import type { ParagraphProps } from './interface';

const props = withDefaults(defineProps<ParagraphProps>(), {
    prefixCls: cssClasses.PREFIX,
    rows: 4,
});

const paragraphClasses = computed(() => {
    return classNames(props.className, `${props.prefixCls}-paragraph`);
});
</script>
