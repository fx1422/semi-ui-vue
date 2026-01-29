<template>
    <main :class="classString" :style="style">
        <slot></slot>
    </main>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import cls from 'classnames';
import { cssClasses } from '@douyinfe/semi-foundation/layout/constants';
import { BasicProps } from './interface';

const props = withDefaults(defineProps<BasicProps>(), {
    prefixCls: cssClasses.PREFIX,
});

const classString = computed(() => cls(props.className, `${props.prefixCls}-content`));
</script>
