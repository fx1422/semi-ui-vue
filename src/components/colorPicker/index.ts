import ColorPicker from './ColorPicker.vue';
import { colorStringToValue } from './utils';

// 导入样式（自动引入）
import './colorPicker.scss';

export * from './interface';
export { colorStringToValue };
export type { ColorValue } from './interface';
export default ColorPicker;
