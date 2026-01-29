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
    name: 'IconFastForward',
});

const type = 'fast-forward';
const viewBox = '0 0 24 24';
const svgContent =
    '<path d="M1 5.96376C1 5.14647 1.9272 4.67432 2.58817 5.15502L10.888 11.1913C11.4371 11.5906 11.4371 12.4094 10.888 12.8087L2.58817 18.845C1.9272 19.3257 1 18.8535 1 18.0362V5.96376Z" fill="currentColor"/><path d="M12 5.96376C12 5.14647 12.9272 4.67432 13.5882 5.15502L21.888 11.1913C22.4371 11.5906 22.4371 12.4094 21.888 12.8087L13.5882 18.845C12.9272 19.3257 12 18.8535 12 18.0362V5.96376Z" fill="currentColor"/>';
</script>
