<template>
    <div :class="wrapperCls">
        <ul :class="`${prefixCls}-items`">
            <li v-for="(item, index) in timeItems" :key="`time-${index}`" :class="`${prefixCls}-item`">
                <span>
                    <template v-if="item === ('' as any)"></template>
                    <template v-else>
                        <slot name="timeDisplay" :time="item">
                            <component :is="() => props.renderTimeDisplay(item)" v-if="props.renderTimeDisplay" />
                            <LocaleConsumer v-else :key="`locale-${item}`" component-name="Calendar">
                                <template #default="{ locale }">
                                    {{ formatTimeDefault(item, locale) }}
                                </template>
                            </LocaleConsumer>
                        </slot>
                    </template>
                </span>
            </li>
        </ul>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import classnames from 'classnames';
import { cssClasses } from '@douyinfe/semi-foundation/calendar/constants';
import LocaleConsumer from '../locale/LocaleConsumer.vue';
import type { TimeColProps } from './interface';

defineOptions({
    name: 'SemiTimeCol',
});

const props = withDefaults(defineProps<TimeColProps>(), {
    className: '',
});

const prefixCls = `${cssClasses.PREFIX}-time`;

const wrapperCls = computed(() => {
    return classnames(props.className, prefixCls);
});

const formatTimeDefault = (item: number, locale: any): string => {
    const replaceTime = (template: string, time: number) => template.replace('${time}', String(time));
    if (item < 12) {
        return replaceTime(locale.AM, item);
    } else if (item === 12) {
        return replaceTime(locale.PM, item);
    } else {
        return replaceTime(locale.PM, item - 12);
    }
};

const timeItems = computed(() => {
    // React 版本的逻辑：
    // 1. [...Array(24).keys()] 生成 [0, 1, 2, ..., 23]
    // 2. .map(item => this.formatTime(item)) 格式化为 ['上午0时', '上午1时', ..., '下午11时']
    // 3. list.splice(0, 1, '') 将第一个（'上午0时'）替换为空字符串
    // 4. 结果是 ['', '上午1时', '上午2时', ..., '下午11时']
    //
    // Vue 版本需要模拟这个逻辑：
    // 生成 [0, 1, 2, ..., 23]，然后将第一个（0时）替换为空字符串
    // 这样 index === 0 时显示空，index === 1 时显示 1 时（item === 1）
    const list = [...Array(24).keys()]; // [0, 1, 2, ..., 23]
    // 将第一个（0时）替换为空字符串，用于空显示
    list.splice(0, 1, '' as any);
    return list; // ['', 1, 2, ..., 23]
});
</script>
