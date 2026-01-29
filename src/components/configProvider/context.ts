import { inject, provide, type InjectionKey, type Ref } from 'vue';
import type { Locale } from '../locale/interface';

export interface ContextValue {
    direction?: Ref<'ltr' | 'rtl'> | 'ltr' | 'rtl';
    timeZone?: Ref<string | number> | string | number;
    locale?: Ref<Locale | undefined> | Locale;
    getPopupContainer?: Ref<(() => HTMLElement) | undefined> | (() => HTMLElement);
}

export const ConfigContextKey: InjectionKey<ContextValue> = Symbol('ConfigContext');

export function provideConfigContext(value: ContextValue) {
    provide(ConfigContextKey, value);
}

export function useConfigContext(): ContextValue {
    return inject(ConfigContextKey, {});
}
