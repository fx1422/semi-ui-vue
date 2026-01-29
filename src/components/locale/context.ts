import { inject, provide, type InjectionKey, type Ref } from 'vue';
import { Locale } from './interface';

export const LocaleContextKey: InjectionKey<Ref<Locale | null> | Locale | null> = Symbol('LocaleContext');

export function provideLocaleContext(locale: Ref<Locale | null> | Locale | null) {
    provide(LocaleContextKey, locale);
}

export function useLocaleContext(): Ref<Locale | null> | Locale | null {
    return inject(LocaleContextKey, null);
}
