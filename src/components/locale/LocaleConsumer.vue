<template>
    <slot :locale="componentLocale" :locale-code="localeCode" :date-fns-locale="dateFnsLocale" :currency="currency" />
</template>

<script setup lang="ts">
import { computed, unref } from 'vue';
import { get } from 'lodash-es';
import { useLocaleContext } from './context';
import { useConfigContext } from '../configProvider/context';
import DefaultLocale from './source/zh_CN';
import type { Locale } from './interface';

const props = withDefaults(
    defineProps<{
        componentName: string;
    }>(),
    {
        componentName: '',
    }
);

const configContext = useConfigContext();
const localeContext = useLocaleContext();
const localeData = computed<Locale>(() => {
    const configLocale = configContext.locale;
    const configLocaleValue = configLocale ? unref(configLocale) : undefined;
    const contextLocaleValue = localeContext ? unref(localeContext) : null;
    let locale = configLocaleValue || contextLocaleValue;

    if (!locale?.code) {
        locale = DefaultLocale;
    }

    return locale;
});

const componentLocale = computed(() => {
    const locale = get(localeData.value, props.componentName, {});
    // 如果获取到的是空对象，尝试使用默认 locale
    if (Object.keys(locale).length === 0 && props.componentName) {
        return get(DefaultLocale, props.componentName, {});
    }
    return locale;
});

const localeCode = computed(() => {
    return localeData.value.code;
});

const dateFnsLocale = computed(() => {
    const defaultFnsLocale = get(DefaultLocale, 'dateFnsLocale');
    return get(localeData.value, 'dateFnsLocale', defaultFnsLocale);
});

const currency = computed(() => {
    return get(localeData.value, 'currency');
});

defineOptions({
    name: 'LocaleConsumer',
    inheritAttrs: false,
});
</script>
