import Layout from './Layout.vue';
import Header from './Header.vue';
import Footer from './Footer.vue';
import Content from './Content.vue';
import Sider from './Sider.vue';

// 导入样式（自动引入）
import './layout.scss';

export type { LayoutProps, BasicProps, SiderProps, ResponsiveMap } from './interface';

// 为 Layout 组件添加子组件属性（与 React 版本保持一致）
// 使用 Object.assign 确保属性可枚举，支持解构语法
const LayoutWithSubComponents = Object.assign(Layout, {
    Header,
    Footer,
    Content,
    Sider,
});

export { Layout, Header, Footer, Content, Sider };

export default LayoutWithSubComponents;
