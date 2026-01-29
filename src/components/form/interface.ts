import type { ComponentPublicInstance } from 'vue';
type RuleItem = any;
import type { Options as ScrollIntoViewOptions } from 'scroll-into-view-if-needed';
import type {
    BaseFormApi as FormApi,
    FormState,
    WithFieldOption,
    AllErrors,
    FieldValidateTriggerType,
} from '@douyinfe/semi-foundation/form/interface';
import type { LabelProps } from './Label.vue';
import type { FieldError } from './ErrorMessage.vue';

export type { FormState, FormApi, WithFieldOption, RuleItem };

export type CommonFieldProps = {
    field: string;
    label?: LabelProps | string;
    labelPosition?: 'top' | 'left' | 'inset';
    labelAlign?: 'left' | 'right';
    labelWidth?: number | string;
    noLabel?: boolean;
    noErrorMessage?: boolean;
    name?: string;
    fieldClassName?: string;
    fieldStyle?: Record<string, any>;
    initValue?: any;
    validate?: (fieldValue: any, values: Record<string, any>) => string | Promise<string>;
    rules?: Array<RuleItem>;
    trigger?: 'blur' | 'change' | 'custom' | 'mount' | Array<string>;
    transform?: (fieldValue: any) => any;
    convert?: (fieldValue: any) => any;
    allowEmptyString?: boolean;
    stopValidateWithError?: boolean;
    helpText?: string;
    extraText?: string | any; // 支持 VNode
    extraTextPosition?: 'middle' | 'bottom';
    defaultValue?: any;
    pure?: boolean;
    labelCol?: Record<string, any>;
    wrapperCol?: Record<string, any>;
    isInInputGroup?: boolean;
    validateStatus?: 'error' | 'success' | 'default';
    keepState?: boolean;
    emptyValue?: any;
    allowEmpty?: boolean;
    required?: boolean;
    id?: string;
};

export type CommonexcludeType = {
    defaultValue?: any;
    value?: any;
    checked?: boolean;
    defaultChecked?: boolean;
};

export type RadioCheckboxExcludeProps = {
    defaultValue?: any;
    checked?: boolean;
    defaultChecked?: boolean;
    field: string;
};

export type RCIncludeType = {
    field?: string;
};

export interface ErrorMsg {
    [optionalKey: string]: FieldError;
}

export interface FormFCChild<K extends Record<string, any> = any> {
    formState: FormState<K>;
    values: K;
    formApi: FormApi<K>;
}

export interface BaseFormProps<Values extends Record<string, any> = any> extends /* @vue-ignore */ Omit<
    Record<string, any>,
    'children' | 'onChange' | 'onSubmit' | 'onReset'
> {
    'aria-label'?: string;
    onSubmit?: (values: Values, e?: Event) => void;
    onSubmitFail?: (errors: Record<keyof Values, FieldError>, values: Partial<Values>, e?: Event) => void;
    onReset?: () => void;
    onValueChange?: (values: Values, changedValue: Partial<Values>) => void;
    onErrorChange?: (
        errors: Record<keyof Values, FieldError>,
        changedError?: Partial<Record<keyof Values, FieldError>>
    ) => void;
    onChange?: (formState: FormState<Values>) => void;
    allowEmpty?: boolean;
    validateFields?: (
        values: Values
    ) => string | Partial<AllErrors<Values>> | Promise<string | Partial<AllErrors<Values>>>;
    id?: string;
    getFormApi?: (formApi: FormApi<Values>) => void;
    style?: Record<string, any>;
    className?: string;
    extraTextPosition?: 'middle' | 'bottom';
    layout?: 'horizontal' | 'vertical';
    labelPosition?: 'top' | 'left' | 'inset';
    labelWidth?: number | string;
    labelAlign?: 'left' | 'right';
    labelCol?: Record<string, any>;
    wrapperCol?: Record<string, any>;
    render?: (internalProps: FormFCChild<Values>) => any;
    component?: ComponentPublicInstance | any;
    children?: any | ((internalProps: FormFCChild<Values>) => any);
    autoScrollToError?: boolean | ScrollIntoViewOptions;
    disabled?: boolean;
    showValidateIcon?: boolean;
    stopValidateWithError?: boolean;
    stopPropagation?: {
        submit?: boolean;
        reset?: boolean;
    };
    trigger?: FieldValidateTriggerType;
}

export interface ArrayFieldProps {
    initValue?: any[];
    field?: string;
    children?: (props: ArrayFieldChildrenProps) => any;
}

export interface ArrayFieldChildrenProps {
    arrayFields: {
        key: string;
        field: string;
        remove: () => void;
    }[];
    add: () => void;
    addWithInitValue: (lineObject: Record<string, any>) => void;
}
