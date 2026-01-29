import BaseCheckbox from './Checkbox.vue';
import BaseCheckboxGroup from './CheckboxGroup.vue';
import { createFieldEnhancer } from '../form/createFieldEnhancer';

// 导入样式（自动引入）
import './checkbox.scss';

export type {
    CheckboxProps,
    CheckboxGroupProps,
    CheckboxEvent,
    CheckboxDirection,
    CheckboxType,
    CheckboxOptionType,
} from './interface';

const Checkbox = createFieldEnhancer(BaseCheckbox, 'SemiCheckbox');
const CheckboxGroup = createFieldEnhancer(BaseCheckboxGroup, 'SemiCheckboxGroup');

// Create a composite component
const CheckboxWithGroup = Object.assign(Checkbox, {
    Group: CheckboxGroup,
});

export { Checkbox, CheckboxGroup };
export default CheckboxWithGroup;
