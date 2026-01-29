<template>
    <component :is="component" :class="typographyClasses" :style="style">
        <slot></slot>
    </component>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import classNames from 'classnames';
import { cssClasses } from '@douyinfe/semi-foundation/typography/constants';

const prefixCls = cssClasses.PREFIX;

interface TypographyProps {
    component?: string;
    className?: string;
    style?: any;
}

const props = withDefaults(defineProps<TypographyProps>(), {
    component: 'article',
    className: '',
});

const typographyClasses = computed(() => {
    return classNames(prefixCls, props.className);
});
</script>
