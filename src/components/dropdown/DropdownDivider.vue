<template>
    <div :class="dividerCls" :style="props.style"></div>
</template>

<script setup lang="ts" name="DropdownDivider">
import { computed } from 'vue';
import classnames from 'classnames';
import { cssClasses } from '@douyinfe/semi-foundation/dropdown/constants';
import type { DropdownDividerProps } from './interface';

const props = defineProps<DropdownDividerProps>();

const prefixCls = cssClasses.PREFIX;

const dividerCls = computed(() => classnames(`${prefixCls}-divider`, props.className));
</script>
