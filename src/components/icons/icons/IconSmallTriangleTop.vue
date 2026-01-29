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
    name: 'IconSmallTriangleTop',
});

const type = 'small-triangle-top';
const viewBox = '0 0 24 24';
const svgContent =
    '<path d="M17.0839 16.3212H6.9524C6.55305 16.3212 6.31486 15.8761 6.53638 15.5438L11.6021 7.94521C11.8 7.64834 12.2363 7.64834 12.4342 7.94521L17.4999 15.5438C17.7214 15.8761 17.4832 16.3212 17.0839 16.3212Z" fill="currentColor"/>';
</script>
