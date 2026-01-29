<template>
    <div :class="classes" :style="style">
        <slot></slot>
    </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';
import classnames from 'classnames';
import { cssClasses } from '@douyinfe/semi-foundation/grid/constants';
import { ColProps, ColSize } from './interface';
import { RowContextKey } from './constants';

const props = withDefaults(defineProps<ColProps>(), {
    prefixCls: cssClasses.PREFIX,
});

const rowContext = inject(RowContextKey, null);

const style = computed(() => {
    const gutters = rowContext?.gutters.value;
    const colStyle = { ...props.style };
    if (gutters) {
        if (gutters[0] > 0) {
            colStyle.paddingLeft = `${gutters[0] / 2}px`;
            colStyle.paddingRight = `${gutters[0] / 2}px`;
        }
        if (gutters[1] > 0) {
            colStyle.paddingTop = `${gutters[1] / 2}px`;
            colStyle.paddingBottom = `${gutters[1] / 2}px`;
        }
    }
    return colStyle;
});

const classes = computed(() => {
    const { span, order, offset, push, pull, className } = props;
    const prefix = `${props.prefixCls}-col`;
    let sizeClassObj = {};

    ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'].forEach((size) => {
        let sizeProps: ColSize = {};
        const propValue = props[size as keyof ColProps];
        if (typeof propValue === 'number') {
            sizeProps.span = propValue;
        } else if (typeof propValue === 'object') {
            sizeProps = (propValue as ColSize) || {};
        }

        sizeClassObj = {
            ...sizeClassObj,
            [`${prefix}-${size}-${sizeProps.span}`]: sizeProps.span !== undefined,
            [`${prefix}-${size}-order-${sizeProps.order}`]: sizeProps.order || sizeProps.order === 0,
            [`${prefix}-${size}-offset-${sizeProps.offset}`]: sizeProps.offset || sizeProps.offset === 0,
            [`${prefix}-${size}-push-${sizeProps.push}`]: sizeProps.push || sizeProps.push === 0,
            [`${prefix}-${size}-pull-${sizeProps.pull}`]: sizeProps.pull || sizeProps.pull === 0,
        };
    });

    return classnames(
        prefix,
        {
            [`${prefix}-${span}`]: span !== undefined,
            [`${prefix}-order-${order}`]: order,
            [`${prefix}-offset-${offset}`]: offset,
            [`${prefix}-push-${push}`]: push,
            [`${prefix}-pull-${pull}`]: pull,
        },
        className,
        sizeClassObj
    );
});
</script>

<style scoped></style>
