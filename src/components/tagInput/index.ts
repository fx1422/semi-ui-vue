import BaseTagInput from './TagInput.vue';
import { createFieldEnhancer } from '../form/createFieldEnhancer';

// 导入样式（自动引入）
import './tagInput.scss';

const TagInput = createFieldEnhancer(BaseTagInput, 'SemiTagInput');

export type { TagInputProps, TagInputState, Size, ValidateStatus, RestTagsPopoverProps } from './interface';

export default TagInput;
