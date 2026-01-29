import BaseCascader from './Cascader.vue';
import { createFieldEnhancer } from '../form/createFieldEnhancer';

// 导入样式（自动引入）
import './cascader.scss';

const Cascader = createFieldEnhancer(BaseCascader, 'SemiCascader');

export { Cascader };
export type {
    CascaderProps,
    CascaderData,
    Entity,
    Entities,
    Data,
    FilterRenderProps,
    ScrollPanelProps,
    TriggerRenderProps,
    Value,
    SimpleValueType,
    CascaderType,
    ShowNextType,
} from './interface';

export default Cascader;
