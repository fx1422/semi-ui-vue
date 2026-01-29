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
    name: 'IconShieldStroked',
});

const type = 'shield-stroked';
const viewBox = '0 0 24 24';
const svgContent =
    '<path d="M3 4.12781L12.0013 2.5L21 4.12781V9.51683C21 15.1811 17.3751 20.2095 12.0013 22C6.62604 20.2095 3 15.18 3 9.51434V4.12781Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M11.9749 7.47485V15.4749" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M7.97485 11.4749H15.9749" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
</script>
