import BaseDatePicker from './DatePicker.vue';
import { createFieldEnhancer } from '../form/createFieldEnhancer';

// 导入样式（自动引入）
import './datePicker.scss';

const DatePicker = createFieldEnhancer(BaseDatePicker, 'SemiDatePicker');

export default DatePicker;
export type {
    DatePickerProps,
    DateInputProps,
    MonthsGridProps,
    MonthProps,
    QuickControlProps,
    FooterProps,
    YearAndMonthProps,
    NavigationProps,
    InsetInputProps,
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
} from './interface';
