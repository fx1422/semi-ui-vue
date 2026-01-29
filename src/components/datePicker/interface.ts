import type { CSSProperties, VNode } from 'vue';
import type { ScrollItemProps } from '../scrollList/interface';
import type { Locale } from '../locale/interface';
import type { Position } from '../tooltip';
import type { InputSize } from '../input';
import type { TimePickerProps } from '../timePicker/interface';
import type {
    BaseValueType,
    DayStatusType,
    DisabledDateOptions,
    DisabledDateType,
    DisabledTimeType,
    PresetType,
    PresetsType,
    TriggerRenderProps,
    ValidateStatus,
    ValueType,
    RangeType,
} from '@douyinfe/semi-foundation/datePicker/foundation';
import type {
    DateInputFoundationProps,
    InsetInputValue,
    InsetInputChangeProps,
} from '@douyinfe/semi-foundation/datePicker/inputFoundation';

export interface BaseProps {
    style?: CSSProperties;
    className?: string;
    [key: string]: any;
}

export type Type = 'date' | 'dateTime' | 'dateRange' | 'dateTimeRange' | 'month' | 'monthRange' | 'year';

export interface DatePickerProps extends BaseProps {
    'aria-describedby'?: string;
    'aria-errormessage'?: string;
    'aria-invalid'?: boolean;
    'aria-labelledby'?: string;
    'aria-required'?: boolean;
    autoAdjustOverflow?: boolean;
    autoFocus?: boolean;
    autoSwitchDate?: boolean;
    borderless?: boolean;
    bottomSlot?: VNode;
    clearIcon?: VNode;
    className?: string;
    dateFnsLocale?: Locale['dateFnsLocale'];
    defaultOpen?: boolean;
    defaultPickerValue?: ValueType;
    defaultValue?: ValueType;
    density?: 'default' | 'compact';
    disabled?: boolean;
    disabledDate?: DisabledDateType;
    disabledTime?: DisabledTimeType;
    disabledTimePicker?: boolean;
    dropdownClassName?: string;
    dropdownMargin?: number | { top?: number; right?: number; bottom?: number; left?: number };
    dropdownStyle?: CSSProperties;
    endDateOffset?: (selectedDate?: Date) => Date;
    format?: string;
    getPopupContainer?: () => HTMLElement;
    hideDisabledOptions?: boolean;
    inputReadOnly?: boolean;
    inputStyle?: CSSProperties;
    insetInput?: DateInputFoundationProps['insetInput'];
    insetLabel?: VNode;
    insetLabelId?: string;
    leftSlot?: VNode;
    locale?: Locale['DatePicker'];
    localeCode?: string;
    max?: number;
    motion?: boolean | (() => void) | Record<string, any>;
    multiple?: boolean;
    needConfirm?: boolean;
    onChangeWithDateFirst?: boolean;
    onPanelChange?: (date: Date | Date[], dateStr: string | string[]) => void;
    open?: boolean;
    placeholder?: string | string[];
    position?: Position;
    prefix?: VNode;
    prefixCls?: string;
    presetPosition?: 'left' | 'right' | 'top' | 'bottom';
    presets?: PresetsType;
    preventScroll?: boolean;
    rangeSeparator?: string;
    renderDate?: (dayNumber?: number, fullDate?: string) => VNode;
    renderFullDate?: (dayNumber?: number, fullDate?: string, dayStatus?: DayStatusType) => VNode;
    rightSlot?: VNode;
    showClear?: boolean;
    size?: InputSize;
    spacing?: number | { top?: number; right?: number; bottom?: number; left?: number };
    startDateOffset?: (selectedDate?: Date) => Date;
    startYear?: number;
    endYear?: number;
    stopPropagation?: boolean | string;
    style?: CSSProperties;
    syncSwitchMonth?: boolean;
    timePickerOpts?: TimePickerProps;
    timeZone?: string | number;
    topSlot?: VNode;
    triggerRender?: (props: TriggerRenderProps) => VNode;
    type?: Type;
    validateStatus?: ValidateStatus;
    value?: ValueType;
    weekStartsOn?: number;
    yearAndMonthOpts?: ScrollItemProps<any>;
    zIndex?: number | string;
    onBlur?: (e: MouseEvent) => void;
    onCancel?: (date: Date | Date[], dateStr: string | string[]) => void;
    onChange?: (date?: Date | Date[] | string | string[], dateStr?: string | string[] | Date | Date[]) => void;
    onClear?: (e: MouseEvent) => void;
    onClickOutSide?: (e: MouseEvent) => void;
    onConfirm?: (date: Date | Date[], dateStr: string | string[]) => void;
    onFocus?: (e: MouseEvent, rangeType: RangeType) => void;
    onOpenChange?: (open: boolean) => void;
    onPresetClick?: (item: PresetType, e: MouseEvent) => void;
}

export interface DateInputProps extends BaseProps {
    borderless?: boolean;
    disabled?: boolean;
    format?: string;
    inputReadOnly?: boolean;
    inputStyle?: CSSProperties;
    insetInput?: DateInputFoundationProps['insetInput'];
    insetInputValue?: InsetInputValue;
    insetLabel?: VNode;
    prefix?: VNode;
    prefixCls?: string;
    placeholder?: string | string[];
    rangeInputFocus?: RangeType;
    rangeSeparator?: string;
    showClear?: boolean;
    showClearIgnoreDisabled?: boolean;
    type?: Type;
    validateStatus?: ValidateStatus;
    value?: Date[];
    inputValue?: string | null;
    dateFnsLocale?: Locale['dateFnsLocale'];
    defaultPickerValue?: ValueType;
    onClick?: (e: MouseEvent) => void;
    onChange?: (value: string, e: Event) => void;
    onEnterPress?: (e: KeyboardEvent) => void;
    onBlur?: (e: MouseEvent) => void;
    onFocus?: (e: MouseEvent, rangeType?: RangeType) => void;
    onClear?: (e: MouseEvent) => void;
    onInsetInputChange?: (options: InsetInputChangeProps) => void;
    // Refs from parent component (wrapped to prevent Vue auto-unwrapping)
    rangeInputStartRef?: { ref: { value: any } } | null;
    rangeInputEndRef?: { ref: { value: any } } | null;
    inputRef?: { ref: { value: any } } | null;
}

export interface MonthsGridProps extends BaseProps {
    type?: Type;
    multiple?: boolean;
    max?: number;
    weekStartsOn?: number;
    disabledDate?: DisabledDateType;
    disabledTime?: DisabledTimeType;
    disabledTimePicker?: boolean;
    hideDisabledOptions?: boolean;
    timePickerOpts?: TimePickerProps;
    defaultValue?: ValueType;
    selectedValue?: ValueType;
    initialValue?: ValueType;
    defaultPickerValue?: ValueType;
    format?: string;
    locale?: Locale['DatePicker'];
    localeCode?: string;
    dateFnsLocale?: Locale['dateFnsLocale'];
    timeZone?: string | number;
    renderDate?: (dayNumber?: number, fullDate?: string) => VNode;
    renderFullDate?: (dayNumber?: number, fullDate?: string, dayStatus?: DayStatusType) => VNode;
    startDateOffset?: (selectedDate?: Date) => Date;
    endDateOffset?: (selectedDate?: Date) => Date;
    autoSwitchDate?: boolean;
    density?: 'default' | 'compact';
    syncSwitchMonth?: boolean;
    onPanelChange?: (date: Date | Date[], dateStr: string | string[]) => void;
    onChange?: (value: Date[], options?: any) => void;
    onMaxSelect?: (v?: any) => void;
    rangeStart?: string;
    rangeInputFocus?: RangeType;
    focusRecordsRef?: { value: { rangeStart: boolean; rangeEnd: boolean } };
    isControlledComponent?: boolean;
    yearAndMonthOpts?: ScrollItemProps<any>;
    insetInput?: boolean;
    setRangeInputFocus?: (rangeInputFocus: RangeType) => void;
    isAnotherPanelHasOpened?: (currentRangeInput: string) => boolean;
}

export interface MonthProps extends BaseProps {
    month?: Date;
    selected?: Set<string>;
    rangeStart?: string;
    rangeEnd?: string;
    hoverDay?: string;
    disabledDate?: DisabledDateType;
    weekStartsOn?: number;
    locale?: Locale['DatePicker'];
    localeCode?: string;
    dateFnsLocale?: Locale['dateFnsLocale'];
    renderDate?: (dayNumber?: number, fullDate?: string) => VNode;
    renderFullDate?: (dayNumber?: number, fullDate?: string, dayStatus?: DayStatusType) => VNode;
    density?: 'default' | 'compact';
    onDayClick?: (day: string, e: MouseEvent) => void;
    onDayHover?: (day: string) => void;
    onDayMouseLeave?: () => void;
    rangeInputFocus?: RangeType;
    startDateOffset?: (selectedDate?: Date) => Date;
    endDateOffset?: (selectedDate?: Date) => Date;
    focusRecordsRef?:
        | { value: { rangeStart: boolean; rangeEnd: boolean } }
        | { rangeStart: boolean; rangeEnd: boolean };
}

export interface QuickControlProps extends BaseProps {
    prefixCls?: string;
    locale?: Locale['DatePicker'];
    presets?: PresetsType;
    presetPosition?: 'left' | 'right' | 'top' | 'bottom';
    onPresetClick?: (item: PresetType, e: MouseEvent) => void;
    type?: Type;
    insetInput?: DateInputFoundationProps['insetInput'];
    onSelect?: (type: string) => void;
}

export interface FooterProps extends BaseProps {
    prefixCls?: string;
    needConfirm?: boolean;
    locale?: Locale['DatePicker'];
    onCancel?: (e: MouseEvent) => void;
    onConfirm?: (e: MouseEvent) => void;
}

export interface YearAndMonthProps extends BaseProps {
    prefixCls?: string;
    month?: Date;
    locale?: Locale['DatePicker'];
    localeCode?: string;
    dateFnsLocale?: Locale['dateFnsLocale'];
    startYear?: number;
    endYear?: number;
    yearAndMonthOpts?: ScrollItemProps<any>;
    onSelect?: (obj: {
        currentMonth: { left: number; right: number };
        currentYear: { left: number; right: number };
    }) => void;
    onBackToMain?: () => void;
    noBackBtn?: boolean;
    monthCycled?: boolean;
    yearCycled?: boolean;
    type?: string;
    density?: string;
    presetPosition?: string;
    renderQuickControls?: any;
    renderDateInput?: any;
    currentYear?: { left: number; right: number };
    currentMonth?: { left: number; right: number };
    disabledDate?: (date: Date) => boolean;
}

export interface NavigationProps extends BaseProps {
    prefixCls?: string;
    month?: Date;
    locale?: Locale['DatePicker'];
    localeCode?: string;
    dateFnsLocale?: Locale['dateFnsLocale'];
    navPrev?: VNode;
    navNext?: VNode;
    monthText?: string;
    density?: string;
    panelType?: string;
    shouldBimonthSwitch?: boolean;
    onPrev?: () => void;
    onNext?: () => void;
    onMonthClick?: (e?: MouseEvent) => void;
    onYearClick?: () => void;
    onPrevMonth?: () => void;
    onNextMonth?: () => void;
    onPrevYear?: () => void;
    onNextYear?: () => void;
    forwardRef?: (el: any) => void;
}

export interface InsetInputProps extends BaseProps {
    prefixCls?: string;
    type?: Type;
    insetInputValue?: InsetInputValue;
    format?: string;
    locale?: Locale['DatePicker'];
    localeCode?: string;
    dateFnsLocale?: Locale['dateFnsLocale'];
    rangeSeparator?: string;
    placeholder?: {
        dateStart?: string;
        dateEnd?: string;
        timeStart?: string;
        timeEnd?: string;
    };
    onInsetInputChange?: (options: InsetInputChangeProps) => void;
    onDateFocus?: (panelType: string) => void;
    onTimeFocus?: (panelType: string) => void;
}

export type {
    BaseValueType,
    DayStatusType,
    DisabledDateOptions,
    DisabledDateType,
    DisabledTimeType,
    PresetType,
    PresetsType,
    TriggerRenderProps,
    ValidateStatus,
    ValueType,
    RangeType,
    InsetInputValue,
    InsetInputChangeProps,
};
