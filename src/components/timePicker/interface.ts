import type { CSSProperties, VNode } from 'vue';
import type { ScrollItemProps } from '../scrollList/interface';
import type { Locale } from '../locale/interface';
import type { Position } from '../tooltip';
import type { InputSize } from '../input';

export interface BaseProps {
    style?: CSSProperties;
    className?: string;
    [key: string]: any;
}

export type ValidateStatus = 'default' | 'error' | 'warning' | 'success';

export type BaseValueType = string | number | Date | undefined;
export type Type = 'time' | 'timeRange';

export interface Panel {
    panelHeader?: VNode | VNode[] | string;
    panelFooter?: VNode | VNode[] | string;
}

export interface TimePickerProps extends BaseProps {
    'aria-describedby'?: string;
    'aria-errormessage'?: string;
    'aria-invalid'?: boolean;
    'aria-labelledby'?: string;
    'aria-required'?: boolean;
    autoAdjustOverflow?: boolean;
    autoFocus?: boolean;
    borderless?: boolean;
    clearText?: string;
    clearIcon?: VNode;
    dateFnsLocale?: Locale['dateFnsLocale'];
    defaultOpen?: boolean;
    defaultValue?: BaseValueType | BaseValueType[];
    disabled?: boolean;
    disabledHours?: () => number[];
    disabledMinutes?: (selectedHour: number) => number[];
    disabledSeconds?: (selectedHour: number, selectedMinute: number) => number[];
    dropdownMargin?: number | { top?: number; right?: number; bottom?: number; left?: number };
    focusOnOpen?: boolean;
    format?: string;
    getPopupContainer?: () => HTMLElement;
    hideDisabledOptions?: boolean;
    hourStep?: number;
    id?: string;
    inputReadOnly?: boolean;
    inputStyle?: CSSProperties;
    insetLabel?: VNode;
    insetLabelId?: string;
    locale?: Locale['TimePicker'];
    localeCode?: string;
    minuteStep?: number;
    motion?: boolean | (() => void) | Record<string, any>;
    open?: boolean;
    panelFooter?: any;
    panelHeader?: any;
    panels?: Panel[];
    placeholder?: string;
    popupClassName?: string;
    popupStyle?: CSSProperties;
    position?: Position;
    prefixCls?: string;
    preventScroll?: boolean;
    rangeSeparator?: string;
    scrollItemProps?: ScrollItemProps;
    secondStep?: number;
    showClear?: boolean;
    size?: InputSize;
    stopPropagation?: boolean;
    timeZone?: string | number;
    triggerRender?: (props?: any) => VNode;
    type?: Type;
    use12Hours?: boolean;
    validateStatus?: ValidateStatus;
    value?: BaseValueType | BaseValueType[];
    zIndex?: number | string;
    onChange?: (date: Date | Date[], dateString: string | string[]) => void;
    onChangeWithDateFirst?: boolean;
    onOpenChange?: (open: boolean) => void;
    onFocus?: (e: FocusEvent) => void;
    onBlur?: (e: FocusEvent) => void;
}

// ComboboxProps picks specific props from TimePickerProps and adds its own
export interface ComboboxProps extends Omit<TimePickerProps, 'onChange'> {
    defaultOpenValue?: TimePickerProps['value'];
    showHour?: boolean;
    showMinute?: boolean;
    showSecond?: boolean;
    onChange?: (value: { isAM: boolean; value: string; timeStampValue: number }) => void;
    onCurrentSelectPanelChange?: (range: string) => void;
    isAM?: boolean;
    timeStampValue?: any;
}

export interface TimeInputProps extends Omit<TimePickerProps, 'onChange' | 'onFocus' | 'onBlur'> {
    onChange?: (value: string) => void;
    onEsc?: () => void;
    onClick?: (e: MouseEvent) => void;
    onFocus?: (e: FocusEvent) => void;
    onBlur?: (e: FocusEvent) => void;
    defaultOpenValue?: boolean;
    currentSelectPanel?: string;
    timeStampValue?: any;
    invalid?: boolean;
}
