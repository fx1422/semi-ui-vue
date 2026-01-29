import { inject, provide, InjectionKey, ComputedRef } from 'vue';
import type { AnchorContextType } from './interface';

export const AnchorContextKey: InjectionKey<ComputedRef<AnchorContextType>> = Symbol('AnchorContext');

export function useAnchorContext() {
    return inject(AnchorContextKey);
}

export function provideAnchorContext(context: ComputedRef<AnchorContextType>) {
    provide(AnchorContextKey, context);
}
