import BaseTreeSelect from './TreeSelect.vue';
import { createFieldEnhancer } from '../form/createFieldEnhancer';
import type { TreeSelectProps, TreeSelectEmits } from './interface';

// 导入样式（自动引入）
import './treeSelect.scss';

const TreeSelect = createFieldEnhancer(BaseTreeSelect, 'SemiTreeSelect');

export type { TreeSelectProps, TreeSelectEmits, TriggerRenderProps, RenderSelectedItem } from './interface';

export default TreeSelect;
