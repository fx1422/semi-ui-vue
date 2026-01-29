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
    name: 'IconCornerRadiusStroked',
});

const type = 'corner-radius-stroked';
const viewBox = '0 0 24 24';
const svgContent =
    '<path fill-rule="evenodd" clip-rule="evenodd" d="M12 4H16H19H21C21.5523 4 22 3.55228 22 3C22 2.44772 21.5523 2 21 2H12C6.47715 2 2 6.47715 2 12V21C2 21.5523 2.44772 22 3 22C3.55228 22 4 21.5523 4 21V19V18V12C4 7.58172 7.58172 4 12 4Z" fill="currentColor"/>';
</script>
