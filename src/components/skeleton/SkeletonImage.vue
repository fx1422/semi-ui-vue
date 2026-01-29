<template>
    <div :class="imageClasses" :style="style"></div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import classNames from 'classnames';
import { cssClasses } from '@douyinfe/semi-foundation/skeleton/constants';
import type { BasicProps } from './interface';

const props = withDefaults(defineProps<BasicProps>(), {
    prefixCls: cssClasses.PREFIX,
});

const imageClasses = computed(() => {
    return classNames(props.className, `${props.prefixCls}-image`);
});
</script>
