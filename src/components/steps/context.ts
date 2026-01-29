import { inject, provide, InjectionKey } from 'vue';
import type { StepsContextValue } from './interface';

export const StepsContextKey: InjectionKey<StepsContextValue> = Symbol('StepsContext');

export function provideStepsContext(value: StepsContextValue) {
    provide(StepsContextKey, value);
}

export function useStepsContext(): StepsContextValue {
    return inject(StepsContextKey, {});
}
