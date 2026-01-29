import type { CSSProperties, VNode } from 'vue';

export type CheckboxDirection = 'horizontal' | 'vertical';
export type CheckboxType = 'default' | 'card' | 'pureCard';

export interface CheckboxProps {
    'aria-describedby'?: string;
    'aria-errormessage'?: string;
    'aria-invalid'?: boolean;
    'aria-labelledby'?: string;
    'aria-required'?: boolean;
    'aria-label'?: string;
    autoFocus?: boolean;
    checked?: boolean;
    defaultChecked?: boolean;
    disabled?: boolean;
    indeterminate?: boolean;
    value?: any;
    style?: CSSProperties;
    className?: string;
    prefixCls?: string;
    extra?: string | VNode;
    id?: string;
    role?: string;
    tabIndex?: number;
    addonId?: string;
    extraId?: string;
    type?: CheckboxType;
    preventScroll?: boolean;
}

export interface CheckboxGroupProps {
    'aria-describedby'?: string;
    'aria-errormessage'?: string;
    'aria-invalid'?: boolean;
    'aria-labelledby'?: string;
    'aria-required'?: boolean;
    'aria-label'?: string;
    defaultValue?: any[];
    disabled?: boolean;
    name?: string;
    options?: Array<string | CheckboxOptionType>;
    value?: any[];
    prefixCls?: string;
    direction?: CheckboxDirection;
    style?: CSSProperties;
    className?: string;
    type?: CheckboxType;
    id?: string;
}

export interface CheckboxOptionType {
    label: string | VNode;
    value: any;
    disabled?: boolean;
    extra?: string | VNode;
    className?: string;
    style?: CSSProperties;
    onChange?: (e: CheckboxEvent) => void;
}

export interface CheckboxEvent {
    target: {
        checked: boolean;
        value?: any;
        [key: string]: any;
    };
    stopPropagation: () => void;
    preventDefault: () => void;
    nativeEvent?: {
        stopImmediatePropagation?: () => void;
    };
}
