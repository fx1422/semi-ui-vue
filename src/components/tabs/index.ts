import Tabs from './Tabs.vue';
import TabPane from './TabPane.vue';
import TabItem from './TabItem.vue';

// 导入样式（自动引入）
import './tabs.scss';

export type { TabsProps, TabPaneProps, TabBarProps, TabItemProps, PlainTab } from './interface';

export type TabsType = typeof Tabs & {
    TabPane: typeof TabPane;
    TabItem: typeof TabItem;
};

// 使用 Object.assign 确保属性可枚举，支持解构语法
const TabsWithSubComponents = Object.assign(Tabs, {
    TabPane,
    TabItem,
}) as TabsType;

export { TabPane, TabItem };
export default TabsWithSubComponents;
