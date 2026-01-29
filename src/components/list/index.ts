import List from './List.vue';
import ListItem from './ListItem.vue';

// 导入样式（自动引入）
import './list.scss';

export type { ListProps, ListItemProps, Grid } from './interface';

// 定义类型
type ListType = typeof List & {
    Item: typeof ListItem;
};

// 使用 Object.assign 确保属性可枚举，支持解构语法
const ListWithItem = Object.assign(List, {
    Item: ListItem,
}) as ListType;

export { ListItem };
export default ListWithItem;
