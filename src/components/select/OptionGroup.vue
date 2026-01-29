<template>
    <div v-if="label || typeof label === 'number'" :class="groupCls" :style="style">
        <component :is="label" v-if="isVNode(label)" />
        <template v-else>{{ label }}</template>
    </div>
</template>

<script setup lang="ts">
import { computed, isVNode, type CSSProperties } from 'vue';
import classNames from 'classnames';
import { cssClasses } from '@douyinfe/semi-foundation/select/constants';

const prefixCls = cssClasses.PREFIX_GROUP;

const props = defineProps<{
    label?: any | string | number;
    className?: string;
    style?: CSSProperties;
}>();

const groupCls = computed(() => {
    return classNames(props.className, {
        [prefixCls]: true,
    });
});

defineOptions({
    name: 'SelectOptionGroup',
    isSelectOptionGroup: true,
});
</script>
