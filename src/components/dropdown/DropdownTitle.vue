<template>
    <div :class="titleCls" :style="props.style">
        <slot></slot>
    </div>
</template>

<script setup lang="ts" name="DropdownTitle">
import { computed } from 'vue';
import classnames from 'classnames';
import { cssClasses } from '@douyinfe/semi-foundation/dropdown/constants';
import { useDropdownContext } from './context';
import type { DropdownTitleProps } from './interface';

const props = defineProps<DropdownTitleProps>();

const prefixCls = cssClasses.PREFIX;
const context = useDropdownContext();

const titleCls = computed(() =>
    classnames(
        {
            [`${prefixCls}-title`]: true,
            [`${prefixCls}-title-withTick`]: context.showTick,
        },
        props.className
    )
);
</script>
