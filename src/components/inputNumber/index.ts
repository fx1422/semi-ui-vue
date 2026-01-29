import BaseInputNumber from './InputNumber.vue';
import { createFieldEnhancer } from '../form/createFieldEnhancer';

// 导入样式（自动引入）
import './inputNumber.scss';

const InputNumber = createFieldEnhancer(BaseInputNumber, 'SemiInputNumber');

export type { InputNumberProps } from './interface';

export default InputNumber;
export { InputNumber };
