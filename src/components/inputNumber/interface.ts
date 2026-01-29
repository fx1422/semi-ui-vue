import { VNode, CSSProperties } from 'vue';
import { InputProps } from '../input/interface';

export type InputNumberSize = 'small' | 'default' | 'large';

export interface InputNumberProps extends Omit<
    InputProps,
    'onChange' | 'onFocus' | 'onBlur' | 'value' | 'defaultValue'
> {
    autofocus?: boolean;
    className?: string;
    clearIcon?: VNode;
    currency?: string | boolean;
    currencyDisplay?: 'code' | 'symbol' | 'name';
    defaultCurrency?: string;
    disabled?: boolean;
    formatter?: (value: number | string) => string;
    hideButtons?: boolean;
    innerButtons?: boolean;
    insetLabel?: VNode | string;
    insetLabelId?: string;
    keepFocus?: boolean;
    localeCode?: string;
    max?: number;
    min?: number;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    parser?: (value: string) => string;
    precision?: number;
    prefixCls?: string;
    pressInterval?: number;
    pressTimeout?: number;
    shiftStep?: number;
    showClear?: boolean;
    showCurrencySymbol?: boolean;
    size?: InputNumberSize;
    step?: number;
    style?: CSSProperties;
    suffix?: VNode | string;
    value?: number | string;
    prefix?: VNode | string;
    preventScroll?: boolean;
    'aria-label'?: string;
    'aria-labelledby'?: string;
    'aria-invalid'?: boolean;
    'aria-errormessage'?: string;
    'aria-describedby'?: string;
    'aria-required'?: boolean;
}
