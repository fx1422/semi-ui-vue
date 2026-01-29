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
    name: 'IconFilledArrowUp',
});

const type = 'filled-arrow-up';
const viewBox = '0 0 24 24';
const svgContent =
    '<path d="M1.8535 11.1464L11.6464 1.35354C11.8417 1.15828 12.1582 1.15828 12.3535 1.35354L22.1464 11.1464C22.4614 11.4614 22.2383 12 21.7928 12H15.9999V21C15.9999 21.5523 15.5522 22 14.9999 22H8.99995C8.44767 22 7.99995 21.5523 7.99995 21V12H2.20706C1.7616 12 1.53852 11.4614 1.8535 11.1464Z" fill="currentColor"/>';
</script>
