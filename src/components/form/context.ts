import { inject, type InjectionKey, type ComputedRef, type Ref, unref } from 'vue';
import type { FormState, BaseFormApi, FormUpdaterContextType } from '@douyinfe/semi-foundation/form/interface';
import warning from '@douyinfe/semi-foundation/utils/warning';

export interface ArrayFieldContextValue {
    shouldUseInitValue: boolean;
}

export const FormStateContextKey: InjectionKey<Ref<FormState | null>> = Symbol('FormState');
export const FormApiContextKey: InjectionKey<Ref<BaseFormApi | null>> = Symbol('FormApi');
export const FormUpdaterContextKey: InjectionKey<ComputedRef<FormUpdaterContextType>> = Symbol('FormUpdater');
export const ArrayFieldContextKey: InjectionKey<ComputedRef<ArrayFieldContextValue>> = Symbol('ArrayField');
export const FormIdContextKey: InjectionKey<Ref<string>> = Symbol('FormId');

export function useFormState(): FormState {
    const state = inject(FormStateContextKey);
    if (!state) {
        warning(true, '[Semi Form]: useFormState must be used within Form component');
        return {} as FormState;
    }
    const stateValue = unref(state);
    return stateValue || ({} as FormState);
}

export function useFormApi<T extends Record<string, any> = any>(): BaseFormApi<T> {
    const apiRef = inject(FormApiContextKey);
    if (!apiRef || !apiRef.value) {
        warning(true, '[Semi Form]: useFormApi must be used within Form component');
        return {} as BaseFormApi<T>;
    }
    return apiRef.value as BaseFormApi<T>;
}

export function useFormUpdater(): FormUpdaterContextType {
    const updater = inject(FormUpdaterContextKey);
    if (!updater) {
        warning(true, '[Semi Form]: useFormUpdater must be used within Form component');
        return {} as FormUpdaterContextType;
    }
    return unref(updater);
}

export function useArrayFieldState(): ArrayFieldContextValue {
    const state = inject(ArrayFieldContextKey);
    if (!state) {
        return { shouldUseInitValue: true };
    }
    return unref(state);
}

export function useFormId(): string {
    const formIdRef = inject(FormIdContextKey);
    if (!formIdRef || !formIdRef.value) {
        return '';
    }
    return formIdRef.value;
}
