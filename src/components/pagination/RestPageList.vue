<template>
    <div :class="`${prefixCls}-rest-list`" :style="containerStyle" @scroll="handleScroll">
        <template v-if="!isVirtualized">
            <div
                v-for="(page, index) in restList"
                :key="`${page}${index}`"
                role="listitem"
                :class="itemClassName"
                :aria-label="String(page)"
                @click="handlePageClick(page)"
            >
                {{ page }}
            </div>
        </template>
        <template v-else>
            <div :style="placeholderStyle">
                <div :style="offsetStyle">
                    <div
                        v-for="index in visibleIndices"
                        :key="`${restList[index]}${index}`"
                        role="listitem"
                        :class="itemClassName"
                        :aria-label="String(restList[index])"
                        :style="itemStyle"
                        @click="handlePageClick(restList[index])"
                    >
                        {{ restList[index] }}
                    </div>
                </div>
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import classNames from 'classnames';
import type PaginationFoundation from '@douyinfe/semi-foundation/pagination/foundation';

const VIRTUAL_ITEM_SIZE = 32;
const VIRTUAL_BUFFER_SIZE = 1;

interface Props {
    restList: number[];
    prefixCls: string;
    listKey: string;
    foundation: PaginationFoundation;
    direction: 'ltr' | 'rtl';
    scrollTopMap: Map<string, number>;
}

const props = defineProps<Props>();

const emit = defineEmits<{
    scroll: [event: Event, listKey: string];
}>();

const count = computed(() => props.restList.length);
const itemHeight = VIRTUAL_ITEM_SIZE;
const listHeight = computed(() => (count.value >= 5 ? itemHeight * 5 : itemHeight * count.value));
const isVirtualized = computed(() => count.value >= 5);

const itemClassName = computed(() => classNames(`${props.prefixCls}-rest-item`));

const containerStyle = computed((): Record<string, string> => {
    if (!isVirtualized.value) {
        const contentHeight = count.value * itemHeight + 8;
        const needsScrollbar = contentHeight > listHeight.value;
        return {
            height: `${listHeight.value}px`,
            width: '78px',
            overflowY: needsScrollbar ? 'auto' : 'hidden',
        };
    }
    return {
        height: `${listHeight.value}px`,
        width: '78px',
        overflowY: 'auto',
        position: 'relative',
        direction: props.direction,
    };
});

const totalHeight = computed(() => count.value * itemHeight);
const visibleCount = computed(() => Math.ceil(listHeight.value / itemHeight) + VIRTUAL_BUFFER_SIZE);

const scrollTop = computed(() => props.scrollTopMap.get(props.listKey) || 0);

const startIndex = computed(() => {
    return Math.max(0, Math.floor(scrollTop.value / itemHeight) - VIRTUAL_BUFFER_SIZE);
});

const endIndex = computed(() => {
    return Math.min(count.value, startIndex.value + visibleCount.value);
});

const visibleIndices = computed(() => {
    const indices: number[] = [];
    for (let i = startIndex.value; i < endIndex.value; i++) {
        indices.push(i);
    }
    return indices;
});

const offsetY = computed(() => startIndex.value * itemHeight);

const placeholderStyle = computed(
    (): Record<string, string> => ({
        height: `${totalHeight.value}px`,
        position: 'relative',
    })
);

const offsetStyle = computed(() => ({
    transform: `translateY(${offsetY.value}px)`,
}));

const itemStyle = computed(() => ({
    height: `${itemHeight}px`,
}));

function handlePageClick(page: number) {
    props.foundation.goPage(page);
}

function handleScroll(event: Event) {
    emit('scroll', event, props.listKey);
}
</script>
