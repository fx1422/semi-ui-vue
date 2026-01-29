import { inject, provide, type InjectionKey, type ComputedRef } from 'vue';
import type { CheckboxEvent } from './interface';

export interface CheckboxGroupContext {
    onChange: (evt: CheckboxEvent) => void;
    value: any[];
    disabled: boolean;
    name: string;
    isCardType: boolean;
    isPureCardType: boolean;
}

export interface CheckboxContextValue {
    checkboxGroup?: CheckboxGroupContext;
}

const CHECKBOX_GROUP_KEY: InjectionKey<ComputedRef<CheckboxContextValue>> = Symbol('semi-checkbox-group');

export function provideCheckboxGroup(context: ComputedRef<CheckboxContextValue>) {
    provide(CHECKBOX_GROUP_KEY, context);
}

export function useCheckboxGroup(): CheckboxContextValue {
    const context = inject(CHECKBOX_GROUP_KEY, null);

    if (!context) {
        return { checkboxGroup: undefined };
    }

    return {
        get checkboxGroup() {
            return context.value.checkboxGroup;
        },
    };
}
