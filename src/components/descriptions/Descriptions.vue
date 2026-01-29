<template>
    <div :class="wrapperClass" :style="style as any" v-bind="dataAttrs">
        <table>
            <tbody>
                <slot></slot>
            </tbody>
        </table>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import classNames from 'classnames';
import { cssClasses } from '@douyinfe/semi-foundation/descriptions/constants';
import getDataAttr from '@douyinfe/semi-foundation/utils/getDataAttr';
import type { DescriptionsProps } from './interface';
import { provideDescriptionsContext } from './context';

const prefixCls = cssClasses.PREFIX;

const props = withDefaults(defineProps<DescriptionsProps>(), {
    align: 'center',
    row: false,
    size: 'medium',
    layout: 'vertical',
    column: 3,
});

provideDescriptionsContext({
    align: props.align,
    layout: props.layout,
});

const wrapperClass = computed(() => {
    return classNames(prefixCls, props.className, {
        [`${prefixCls}-${props.align}`]: !props.row,
        [`${prefixCls}-double`]: props.row,
        [`${prefixCls}-double-${props.size}`]: props.row,
        [`${prefixCls}-horizontal`]: props.layout === 'horizontal',
        [`${prefixCls}-vertical`]: props.layout === 'vertical',
    });
});

const dataAttrs = computed(() => {
    return getDataAttr(props as any);
});
</script>
