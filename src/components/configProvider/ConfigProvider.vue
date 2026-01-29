<template>
    <div v-if="direction === 'rtl'" :class="rtlClass">
        <slot />
    </div>
    <slot v-else />
</template>

<script setup lang="ts">
import { computed, toRef } from 'vue';
import { BASE_CLASS_PREFIX } from '@douyinfe/semi-foundation/base/constants';
import DefaultLocale from '../locale/source/zh_CN';
import { provideConfigContext, type ContextValue } from './context';
import type { Locale } from '../locale/interface';

const props = withDefaults(
    defineProps<{
        locale?: Locale;
        timeZone?: string | number;
        direction?: 'ltr' | 'rtl';
        getPopupContainer?: () => HTMLElement;
    }>(),
    {
        locale: () => DefaultLocale,
        direction: 'ltr',
    }
);

const rtlClass = computed(() => `${BASE_CLASS_PREFIX}-rtl`);

const configValue: ContextValue = {
    direction: toRef(props, 'direction'),
    timeZone: toRef(props, 'timeZone'),
    locale: toRef(props, 'locale'),
    getPopupContainer: toRef(props, 'getPopupContainer'),
};

provideConfigContext(configValue);

defineOptions({
    name: 'ConfigProvider',
});
</script>
