import type { VNode, CSSProperties } from 'vue';

export interface SwitchProps {
    'aria-label'?: string;
    'aria-describedby'?: string;
    'aria-errormessage'?: string;
    'aria-invalid'?: boolean;
    'aria-labelledby'?: string;
    defaultChecked?: boolean;
    checked?: boolean;
    disabled?: boolean;
    loading?: boolean;
    className?: string;
    style?: CSSProperties;
    size?: 'large' | 'default' | 'small';
    checkedText?: string | VNode;
    uncheckedText?: string | VNode;
    id?: string;
}

export interface SwitchState {
    nativeControlChecked: boolean;
    nativeControlDisabled: boolean;
    focusVisible: boolean;
}
