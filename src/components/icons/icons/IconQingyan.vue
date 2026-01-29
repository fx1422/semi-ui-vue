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
    name: 'IconQingyan',
});

const type = 'qingyan';
const viewBox = '0 0 24 24';
const svgContent =
    '<path fill-rule="evenodd" clip-rule="evenodd" d="M21.4288 4.14284C22.2967 4.14284 23.0003 3.43929 23.0003 2.57142C23.0003 1.70355 22.2967 1 21.4288 1C20.561 1 19.8574 1.70355 19.8574 2.57142C19.8574 3.43929 20.561 4.14284 21.4288 4.14284ZM11.2142 22.9997C16.8554 22.9997 21.4284 18.4267 21.4284 12.7855C21.4284 7.14435 16.8554 2.57129 11.2142 2.57129C5.57306 2.57129 1 7.14435 1 12.7855C1 18.4267 5.57306 22.9997 11.2142 22.9997Z" fill="currentColor"/>';
</script>
