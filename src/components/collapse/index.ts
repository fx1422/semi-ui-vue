import Collapse from './Collapse.vue';
import CollapsePanel from './CollapsePanel.vue';

// 导入样式（自动引入）
import './collapse.scss';

export type { CollapseProps, CollapsePanelProps, CollapseActiveKey } from './interface';

// 定义类型
type CollapseType = typeof Collapse & {
    Panel: typeof CollapsePanel;
};

// 使用 Object.assign 确保属性可枚举，支持解构语法
const CollapseWithPanel = Object.assign(Collapse, {
    Panel: CollapsePanel,
}) as CollapseType;

export { CollapsePanel };
export default CollapseWithPanel;
