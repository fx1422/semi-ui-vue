import { inject, provide, type InjectionKey, type ComputedRef, computed } from 'vue';
import type { RadioChangeEvent } from './interface';
import type { RadioMode, RadioGroupButtonSize } from './interface';

export interface RadioGroupContext {
    onChange: (evt: RadioChangeEvent) => void;
    value?: string | number;
    isButtonRadio?: boolean;
    disabled?: boolean;
    prefixCls?: string;
    name?: string;
    buttonSize?: RadioGroupButtonSize;
    isCardRadio?: boolean;
    isPureCardRadio?: boolean;
}

export interface RadioContextValue {
    mode?: RadioMode;
    radioGroup?: RadioGroupContext;
}

const RADIO_GROUP_KEY: InjectionKey<ComputedRef<RadioContextValue>> = Symbol('semi-radio-group');

export function provideRadioGroup(context: ComputedRef<RadioContextValue>) {
    provide(RADIO_GROUP_KEY, context);
}

export function useRadioGroup(): ComputedRef<RadioContextValue> {
    const context = inject(
        RADIO_GROUP_KEY,
        computed(() => ({ radioGroup: undefined }))
    );
    // 直接返回 computed ref，确保响应式追踪
    return context;
}
