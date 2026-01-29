import { InjectionKey, provide, inject } from 'vue';
import type { DropdownContextType } from './interface';

export const DropdownContextKey: InjectionKey<DropdownContextType> = Symbol('DropdownContext');

export function useDropdownContext() {
    return inject(DropdownContextKey, { level: 0 });
}

export function provideDropdownContext(context: DropdownContextType) {
    provide(DropdownContextKey, context);
}
