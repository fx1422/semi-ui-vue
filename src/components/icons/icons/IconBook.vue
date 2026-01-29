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
    name: 'IconBook',
});

const type = 'book';
const viewBox = '0 0 24 24';
const svgContent =
    '<path d="M19 1C20.1046 1 21 1.89543 21 3V22C21 22.5523 20.5523 23 20 23H6C4.34315 23 3 21.6569 3 20V5C3 2.79086 4.79086 1 7 1H19ZM6 19C5.44772 19 5 19.4477 5 20C5 20.5523 5.44772 21 6 21H19V19H6Z" fill="currentColor"/>';
</script>
