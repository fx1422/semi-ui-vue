import { computed, isRef, type ComputedRef } from 'vue';
import { get } from 'lodash-es';
import { useLocaleContext } from '../locale/context';
import { useConfigContext } from '../configProvider/context';
import DefaultLocale from '../locale/source/zh_CN';
import type { Locale } from '../locale/interface';

export interface UseLocaleOptions<T extends keyof Locale = keyof Locale> {
    componentName: T;
    locale?: Locale[T];
    localeCode?: string;
    dateFnsLocale?: Locale['dateFnsLocale'];
}

export interface UseLocaleReturn<T extends keyof Locale = keyof Locale> {
    locale: Locale[T];
    localeCode: string;
    dateFnsLocale?: Locale['dateFnsLocale'];
}

/**
 * 获取组件国际化配置
 * 优先级：自定义配置 > ConfigProvider > LocaleProvider > 默认值
 */
export function useLocale<T extends keyof Locale = keyof Locale>(
    options: UseLocaleOptions<T>
): ComputedRef<UseLocaleReturn<T>> {
    const {
        componentName,
        locale: customLocale,
        localeCode: customLocaleCode,
        dateFnsLocale: customDateFnsLocale,
    } = options;

    const configContext = useConfigContext();
    const localeContext = useLocaleContext();

    return computed(() => {
        const configLocale = configContext.locale;
        const configLocaleValue = configLocale ? (isRef(configLocale) ? configLocale.value : configLocale) : undefined;

        const contextLocaleValue = localeContext ? (isRef(localeContext) ? localeContext.value : localeContext) : null;

        // 优先级：config > context > default
        let baseLocale: Locale | null = configLocaleValue || contextLocaleValue;

        if (!baseLocale?.code) {
            baseLocale = DefaultLocale;
        }

        // 组件级 locale 优先级：custom > context > default
        const componentLocale = customLocale || get(baseLocale, componentName, {});
        const finalComponentLocale =
            Object.keys(componentLocale).length === 0 && componentName
                ? get(DefaultLocale, componentName, {})
                : componentLocale;

        const finalLocaleCode = customLocaleCode || baseLocale?.code || 'zh-CN';

        const finalDateFnsLocale =
            customDateFnsLocale || get(baseLocale, 'dateFnsLocale', get(DefaultLocale, 'dateFnsLocale'));

        return {
            locale: finalComponentLocale as Locale[T],
            localeCode: finalLocaleCode,
            dateFnsLocale: finalDateFnsLocale,
        };
    });
}
