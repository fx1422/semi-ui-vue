import { inject, provide, type InjectionKey, type ComputedRef, unref, reactive } from 'vue';
import type { InputSize } from './interface';

export interface InputGroupContext {
    size?: InputSize;
    disabled?: boolean;
    onBlur?: (e: FocusEvent) => void;
    onFocus?: (e: FocusEvent) => void;
}

export interface InputGroupContextValue {
    inputGroup?: InputGroupContext;
}

const INPUT_GROUP_KEY: InjectionKey<ComputedRef<InputGroupContextValue>> = Symbol('semi-input-group');

export function provideInputGroup(context: ComputedRef<InputGroupContextValue>) {
    provide(INPUT_GROUP_KEY, context);
}

export function useInputGroup(): InputGroupContextValue {
    const context = inject(INPUT_GROUP_KEY, null);

    if (!context) {
        return { inputGroup: undefined };
    }

    return reactive({
        get inputGroup() {
            return unref(context).inputGroup;
        },
    });
}
