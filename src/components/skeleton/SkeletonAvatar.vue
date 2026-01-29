<template>
    <div :class="avatarClasses" :style="style"></div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import classNames from 'classnames';
import { cssClasses } from '@douyinfe/semi-foundation/skeleton/constants';
import type { AvatarProps } from './interface';

const props = withDefaults(defineProps<AvatarProps>(), {
    prefixCls: cssClasses.PREFIX,
    size: 'medium',
    shape: 'circle',
});

const avatarClasses = computed(() => {
    return classNames(
        props.className,
        `${props.prefixCls}-avatar`,
        `${props.prefixCls}-avatar-${props.size}`,
        `${props.prefixCls}-avatar-${props.shape}`
    );
});
</script>
