import BaseSwitch from './Switch.vue';
import { createFieldEnhancer } from '../form/createFieldEnhancer';

// 导入样式（自动引入）
import './switch.scss';

const Switch = createFieldEnhancer(BaseSwitch, 'SemiSwitch');

export type { SwitchProps } from './interface';
export default Switch;
export { Switch };
