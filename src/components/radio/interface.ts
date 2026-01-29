import type { CSSProperties } from 'vue';
import type { RadioChangeEvent } from '@douyinfe/semi-foundation/radio/radioInnerFoundation';
import type { strings } from '@douyinfe/semi-foundation/radio/constants';

export type RadioDisplayMode = 'vertical' | '';
export type RadioMode = (typeof strings.MODE)[number];
export type RadioGroupButtonSize = (typeof strings.BUTTON_SIZE)[number];
export type RadioDirection = (typeof strings.DIRECTION_SET)[number];

export type RadioType =
    | typeof strings.TYPE_DEFAULT
    | typeof strings.TYPE_BUTTON
    | typeof strings.TYPE_CARD
    | typeof strings.TYPE_PURECARD;

export interface RadioProps {
    autoFocus?: boolean;
    checked?: boolean;
    defaultChecked?: boolean;
    value?: string | number | boolean | any; // 使用 any 来避免 Vue 运行时类型检查警告，同时保持类型定义
    disabled?: boolean;
    prefixCls?: string;
    displayMode?: RadioDisplayMode;
    mode?: RadioMode;
    extra?: any;
    style?: CSSProperties;
    className?: string;
    addonStyle?: CSSProperties;
    addonClassName?: string;
    type?: RadioType;
    'aria-label'?: string;
    addonId?: string;
    extraId?: string;
    name?: string;
    preventScroll?: boolean;
}

export interface RadioInnerProps {
    checked?: boolean;
    disabled?: boolean;
    isButtonRadio?: boolean;
    mode?: RadioMode;
    autoFocus?: boolean;
    name?: string;
    prefixCls?: string;
    isPureCardRadioGroup?: boolean;
    addonId?: string;
    extraId?: string;
    'aria-label'?: string;
    focusInner?: boolean;
    preventScroll?: boolean;
}

export interface OptionItem {
    label?: any;
    value?: string | number;
    disabled?: boolean;
    extra?: any;
    style?: CSSProperties;
    className?: string;
    addonId?: string;
    addonStyle?: CSSProperties;
    addonClassName?: string;
    extraId?: string;
}

export type RadioGroupOptions = string[] | Array<OptionItem>;

export interface RadioGroupProps {
    /**
     * 默认值（非受控模式）
     * 使用 v-model 进行双向绑定（受控模式）
     */
    defaultValue?: string | number | boolean;
    disabled?: boolean;
    name?: string;
    options?: RadioGroupOptions;
    className?: string;
    style?: CSSProperties;
    direction?: RadioDirection;
    mode?: RadioMode;
    type?: RadioType;
    buttonSize?: RadioGroupButtonSize;
    prefixCls?: string;
    'aria-label'?: string;
    'aria-describedby'?: string;
    'aria-errormessage'?: string;
    'aria-invalid'?: boolean;
    'aria-labelledby'?: string;
    'aria-required'?: boolean;
    id?: string;
}

export type { RadioChangeEvent };
