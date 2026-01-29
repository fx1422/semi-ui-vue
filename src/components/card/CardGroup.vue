<template>
    <div :class="groupCls" :style="bodyStyle">
        <slot></slot>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import cls from 'classnames';
import { cssClasses } from '@douyinfe/semi-foundation/card/constants';
import { CardGroupProps } from './interface';

const prefixcls = cssClasses.PREFIX;

const props = withDefaults(defineProps<CardGroupProps>(), {
    type: 'grid',
    spacing: 24,
});

const groupCls = computed(() =>
    cls(`${prefixcls}-group`, props.className, {
        [`${prefixcls}-group-grid`]: props.type === 'grid',
    })
);

const bodyStyle = computed(() => {
    const { style, spacing } = props;
    const realSpacing = Array.isArray(spacing) ? spacing : [spacing, spacing];
    return {
        ...style,
        rowGap: `${realSpacing[0]}px`,
        columnGap: `${realSpacing[1]}px`,
    };
});
</script>
