<template>
    <li :class="itemCls" :style="style" @click="handleClick">
        <div :class="`${prefixCls}-tail`" aria-hidden></div>
        <div :class="dotCls" aria-hidden v-bind="dotStyleAttr">
            <template v-if="dot">
                <component :is="dot" v-if="typeof dot !== 'string'" />
                <template v-else>{{ dot }}</template>
            </template>
        </div>
        <div :class="`${prefixCls}-content`">
            <slot></slot>
            <div v-if="extra" :class="`${prefixCls}-content-extra`">
                <component :is="extra" v-if="typeof extra !== 'string'" />
                <template v-else>{{ extra }}</template>
            </div>
            <div v-if="time" :class="`${prefixCls}-content-time`">
                <component :is="time" v-if="typeof time !== 'string'" />
                <template v-else>{{ time }}</template>
            </div>
        </div>
    </li>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import classNames from 'classnames';
import { cssClasses } from '@douyinfe/semi-foundation/timeline/constants';
import type { TimelineItemProps } from './interface';

const prefixCls = cssClasses.ITEM;

const props = withDefaults(defineProps<TimelineItemProps>(), {
    type: 'default',
    time: '',
});

const emit = defineEmits<{
    click: [e: MouseEvent];
}>();

const itemCls = computed(() => {
    return classNames(prefixCls, props.className);
});

const dotCls = computed(() => {
    return classNames({
        [`${prefixCls}-head`]: true,
        [`${prefixCls}-head-custom`]: props.dot,
        [`${prefixCls}-head-${props.type}`]: props.type,
    });
});

const dotStyleAttr = computed(() => {
    if (props.color) {
        return { style: { backgroundColor: props.color } };
    }
    return null;
});

const handleClick = (e: MouseEvent) => {
    emit('click', e);
    if (props.onClick) {
        props.onClick(e);
    }
};
</script>
