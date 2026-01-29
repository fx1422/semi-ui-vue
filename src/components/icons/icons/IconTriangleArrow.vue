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
    name: 'IconTriangleArrow',
});

const type = 'triangle-arrow';
const viewBox = '0 0 24 24';
const svgContent =
    '<g clip-path="url(#clip_triangle_arrow)"><path d="M24 9L24 10C20 10 18.5 11 16.5 13C14.5 15 14 16 12 16C10 16 9.5 15 7.5 13C5.5 11 4 10 -4.37115e-08 10L0 9L24 9Z" fill="currentColor"/></g><defs><clipPath id="clip_triangle_arrow"><rect width="24" height="24" fill="white" transform="translate(24) rotate(90)"/></clipPath></defs>';
</script>
