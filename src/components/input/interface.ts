import { CSSProperties, VNode } from 'vue';

export type InputSize = 'small' | 'large' | 'default';
export type InputMode = 'password';
export type ValidateStatus = 'default' | 'error' | 'warning' | 'success';

export interface InputProps {
    'aria-label'?: string;
    'aria-describedby'?: string;
    'aria-errormessage'?: string;
    'aria-invalid'?: boolean;
    'aria-labelledby'?: string;
    'aria-required'?: boolean;
    addonBefore?: VNode | string;
    addonAfter?: VNode | string;
    borderless?: boolean;
    prefix?: VNode | string;
    suffix?: VNode | string;
    mode?: InputMode;
    modelValue?: string | number;
    value?: string | number;
    disabled?: boolean;
    readonly?: boolean;
    type?: string;
    showClear?: boolean;
    hideSuffix?: boolean;
    placeholder?: string | number;
    insetLabel?: VNode | string;
    insetLabelId?: string;
    size?: InputSize;
    className?: string;
    clearIcon?: VNode;
    style?: CSSProperties;
    validateStatus?: ValidateStatus;
    inputStyle?: CSSProperties;
    getValueLength?: (value: string) => number;
    preventScroll?: boolean;
    showClearIgnoreDisabled?: boolean;
    onlyBorder?: number;
    maxLength?: number;
    minLength?: number;
    autoFocus?: boolean;
    id?: string; // 用于表单字段的唯一标识
    name?: string; // 用于表单提交的字段名
}

export interface AutosizeRow {
    minRows?: number;
    maxRows?: number;
}

export interface TextAreaProps {
    autosize?: boolean | AutosizeRow;
    borderless?: boolean;
    placeholder?: string;
    modelValue?: string;
    value?: string;
    rows?: number;
    cols?: number;
    maxCount?: number;
    validateStatus?: ValidateStatus;
    disabled?: boolean;
    readonly?: boolean;
    autoFocus?: boolean;
    showCounter?: boolean;
    showClear?: boolean;
    getValueLength?: (value: string) => number;
    disabledEnterStartNewLine?: boolean;
    className?: string;
    style?: CSSProperties;
    maxLength?: number;
    minLength?: number;
}

export interface InputGroupProps {
    className?: string;
    size?: InputSize;
    style?: CSSProperties;
    label?: any; // LabelProps
    labelPosition?: string;
    disabled?: boolean;
}
