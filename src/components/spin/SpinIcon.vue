<template>
    <svg
        :class="className"
        width="48"
        height="48"
        viewBox="0 0 36 36"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
        data-icon="spin"
    >
        <defs>
            <linearGradient :id="id" x1="0%" y1="100%" x2="100%" y2="100%">
                <stop stop-color="currentColor" stop-opacity="0" offset="0%" />
                <stop stop-color="currentColor" stop-opacity="0.50" offset="39.9430698%" />
                <stop stop-color="currentColor" offset="100%" />
            </linearGradient>
        </defs>
        <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
            <rect fill-opacity="0.01" fill="none" x="0" y="0" width="36" height="36" />
            <path
                d="M34,18 C34,9.163444 26.836556,2 18,2 C11.6597233,2 6.18078805,5.68784135 3.59122325,11.0354951"
                :stroke="`url(#${id})`"
                stroke-width="4"
                stroke-linecap="round"
            />
        </g>
    </svg>
</template>

<script setup lang="ts">
import { computed, type VNode } from 'vue';

interface Props {
    id?: number;
    component?: VNode | string;
    size?: number;
    className?: string;
    type?: string;
    customIconCls?: string;
}

const props = withDefaults(defineProps<Props>(), {
    id: undefined,
    size: undefined,
    className: '',
    type: '',
    customIconCls: '',
});

// 生成唯一的 ID
let _id = -1;
const id = computed(() => {
    if (props.id !== undefined) {
        return `linearGradient-${props.id}`;
    }
    _id++;
    return `linearGradient-${_id}`;
});
</script>

<style lang="scss">
// 确保 SpinIcon SVG 正确对齐
.semi-button-content-loading-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;

    svg {
        display: block;
    }
}
</style>
