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
    name: 'IconBackward',
});

const type = 'backward';
const viewBox = '0 0 24 24';
const svgContent =
    '<path d="M12 18.0362C12 18.8535 11.0728 19.3257 10.4118 18.845L2.11202 12.8087C1.56292 12.4094 1.56292 11.5906 2.11202 11.1913L10.4118 5.15502C11.0728 4.67432 12 5.14647 12 5.96376V18.0362Z" fill="currentColor"/><path d="M23 18.0362C23 18.8535 22.0728 19.3257 21.4118 18.845L13.112 12.8087C12.5629 12.4094 12.5629 11.5906 13.112 11.1913L21.4118 5.15502C22.0728 4.67432 23 5.14647 23 5.96376V18.0362Z" fill="currentColor"/>';
</script>
