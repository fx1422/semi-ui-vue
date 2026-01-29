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
    name: 'IconTriangleUp',
});

const type = 'triangle-up';
const viewBox = '0 0 24 24';
const svgContent =
    '<path d="M2.16707 17.4086L11.1937 5.09962C11.5932 4.55477 12.4069 4.55477 12.8065 5.09962L21.8331 17.4086C22.3175 18.0691 21.8458 19 21.0267 19H2.97347C2.15437 19 1.68268 18.0691 2.16707 17.4086Z" fill="currentColor"/>';
</script>
