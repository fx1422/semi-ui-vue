import { inject, provide, InjectionKey } from 'vue';
import type { DescriptionsContextValue } from './interface';

export const DescriptionsContextKey: InjectionKey<DescriptionsContextValue> = Symbol('DescriptionsContext');

export function provideDescriptionsContext(context: DescriptionsContextValue) {
    provide(DescriptionsContextKey, context);
}

export function useDescriptionsContext() {
    return inject(DescriptionsContextKey, {} as DescriptionsContextValue);
}
