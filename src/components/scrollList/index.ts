import ScrollList from './ScrollList.vue';
import ScrollItem from './ScrollItem.vue';

// 导入样式（自动引入）
import './scrollList.scss';

export type { ScrollItemProps } from './interface';
export { ScrollList, ScrollItem };
export * from './interface';

// 定义类型
type ScrollListType = typeof ScrollList & {
    Item: typeof ScrollItem;
};

// 使用 Object.assign 确保属性可枚举，支持解构语法
const ScrollListWithItem = Object.assign(ScrollList, {
    Item: ScrollItem,
}) as ScrollListType;

export default ScrollListWithItem;
