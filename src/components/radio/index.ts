import BaseRadio from './Radio.vue';
import BaseRadioGroup from './RadioGroup.vue';
import { createFieldEnhancer } from '../form/createFieldEnhancer';
import type { RadioProps, RadioGroupProps, RadioChangeEvent, OptionItem, RadioGroupOptions } from './interface';

// 导入样式（自动引入）
import './radio.scss';

const Radio = BaseRadio;
const RadioGroup = createFieldEnhancer(BaseRadioGroup, 'SemiRadioGroup');

// 使用 Object.assign 确保属性可枚举，支持解构语法
const RadioWithGroup = Object.assign(Radio, {
    Group: RadioGroup,
}) as typeof Radio & {
    Group: typeof RadioGroup;
};

export default RadioWithGroup;
export { Radio, RadioGroup };
export type { RadioProps, RadioGroupProps, RadioChangeEvent, OptionItem, RadioGroupOptions };
