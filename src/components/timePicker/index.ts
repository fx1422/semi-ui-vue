import BaseTimePicker from './TimePicker.vue';
import { createFieldEnhancer } from '../form/createFieldEnhancer';
import type { TimePickerProps } from './interface';

// 导入样式（自动引入）
import './timePicker.scss';

const TimePicker = createFieldEnhancer(BaseTimePicker, 'SemiTimePicker');

export { TimePicker };
export type { TimePickerProps };
export default TimePicker;
