import Navigation from './Navigation.vue';
import Item from './Item.vue';
import SubNav from './SubNav.vue';
import Header from './Header.vue';
import Footer from './Footer.vue';

// 导入样式（自动引入）
import './navigation.scss';

export type { NavProps, NavItemProps, SubNavProps, NavHeaderProps, NavFooterProps } from './interface';
export type { ItemKey, OnSelectedData } from './interface';

export type NavigationType = typeof Navigation & {
    Item: typeof Item;
    Sub: typeof SubNav;
    Header: typeof Header;
    Footer: typeof Footer;
};

// 使用 Object.assign 确保属性可枚举，支持解构语法
const NavigationWithComponents = Object.assign(Navigation, {
    Item,
    Sub: SubNav,
    Header,
    Footer,
}) as NavigationType;

export { Item as NavItem, SubNav as NavSub, Header as NavHeader, Footer as NavFooter };
export default NavigationWithComponents;
