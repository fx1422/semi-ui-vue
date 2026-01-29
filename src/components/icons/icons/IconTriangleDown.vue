<template>
    <Icon :type="type" v-bind="$attrs">
        <svg
            :viewBox="viewBox"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            width="1em"
            height="1em"
            focusable="false"
            aria-hidden="true"
            v-html="svgContent"
        />
    </Icon>
</template>

<script setup lang="ts">
import Icon from '../Icon.vue';

defineOptions({
    name: 'IconTriangleDown',
});

const type = 'triangle-down';
const viewBox = '0 0 24 24';
const svgContent =
    '<path d="M21.8329 6.59139L12.8063 18.9004C12.4068 19.4452 11.5931 19.4452 11.1935 18.9004L2.16693 6.59139C1.68255 5.93086 2.15424 5.00003 2.97334 5.00003L21.0265 5.00003C21.8456 5.00003 22.3173 5.93087 21.8329 6.59139Z" fill="currentColor"/>';
</script>
