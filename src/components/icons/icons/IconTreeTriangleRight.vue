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
    name: 'IconTreeTriangleRight',
});

const type = 'tree-triangle-right';
const viewBox = '0 0 24 24';
const svgContent =
    '<path d="M9.65618 3.44015L18.6322 11.2454C19.0906 11.644 19.0906 12.356 18.6322 12.7546L9.65618 20.5598C9.00895 21.1226 8 20.6629 8 19.8052V4.19475C8 3.33705 9.00895 2.87734 9.65618 3.44015Z" fill="currentColor"/>';
</script>
