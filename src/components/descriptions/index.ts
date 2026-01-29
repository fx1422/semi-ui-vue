import Descriptions from './Descriptions.vue';
import DescriptionsItem from './DescriptionsItem.vue';

// 导入样式（自动引入）
import './descriptions.scss';

export type { DescriptionsProps, DescriptionsItemProps, DescriptionsData } from './interface';

// 定义类型
type DescriptionsType = typeof Descriptions & {
    Item: typeof DescriptionsItem;
};

// 使用 Object.assign 确保属性可枚举，支持解构语法
const DescriptionsWithItem = Object.assign(Descriptions, {
    Item: DescriptionsItem,
}) as DescriptionsType;

export { DescriptionsItem };
export default DescriptionsWithItem;
