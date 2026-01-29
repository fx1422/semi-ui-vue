import { inject, provide, InjectionKey, type ComputedRef, type Ref } from 'vue';
import type { CollapseIconPosition } from './interface';

export interface CollapseContextValue {
    activeSet: Set<string>;
    expandIcon?: any;
    collapseIcon?: any;
    clickHeaderToExpand: boolean;
    keepDOM: boolean;
    expandIconPosition: CollapseIconPosition;
    onClick: (itemKey: string, e: MouseEvent) => void;
    motion: boolean | object | ((active: boolean) => object);
    lazyRender: boolean;
}

export const CollapseContextKey: InjectionKey<
    ComputedRef<CollapseContextValue> | Ref<CollapseContextValue> | CollapseContextValue
> = Symbol('CollapseContext');

export function provideCollapseContext(
    context: ComputedRef<CollapseContextValue> | Ref<CollapseContextValue> | CollapseContextValue
) {
    provide(CollapseContextKey, context);
}

export function useCollapseContext(): CollapseContextValue {
    const context = inject(CollapseContextKey);
    if (!context) {
        console.warn('CollapsePanel must be used within Collapse component');
        return {
            activeSet: new Set(),
            clickHeaderToExpand: true,
            keepDOM: false,
            expandIconPosition: 'left',
            onClick: () => {},
            motion: false,
            lazyRender: false,
        } as CollapseContextValue;
    }
    // If context is a ref or computed, return its value
    return 'value' in context ? context.value : context;
}
