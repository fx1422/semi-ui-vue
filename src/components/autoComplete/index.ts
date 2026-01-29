import AutoComplete from './AutoComplete.vue';
import Option from './Option.vue';

// 导入样式（自动引入）
import './autoComplete.scss';

export type { AutoCompleteProps, OptionProps, AutoCompleteItems, DataItem, StateOptionItem } from './interface';

// Attach Option as a static property
(AutoComplete as any).Option = Option;

export { Option };
export default AutoComplete;
