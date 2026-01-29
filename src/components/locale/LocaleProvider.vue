<template>
    <slot />
</template>

<script setup lang="ts">
import { toRef } from 'vue';
import DefaultLocale from './source/zh_CN';
import { provideLocaleContext } from './context';
import type { Locale } from './interface';

const props = withDefaults(
    defineProps<{
        locale?: Locale;
    }>(),
    {
        locale: () => DefaultLocale,
    }
);

provideLocaleContext(toRef(props, 'locale'));

defineOptions({
    name: 'LocaleProvider',
});
</script>
