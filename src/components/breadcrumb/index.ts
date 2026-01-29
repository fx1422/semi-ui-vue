import Breadcrumb from './Breadcrumb.vue';
import BreadcrumbItem from './BreadcrumbItem.vue';
import type { BreadcrumbProps, BreadcrumbItemProps, Route, ShowTooltipProps } from './interface';

// 导入样式（自动引入）
import './breadcrumb.scss';

export type { BreadcrumbProps, BreadcrumbItemProps, Route, ShowTooltipProps };

// 使用 Object.assign 确保属性可枚举，支持解构语法
const BreadcrumbWithItem = Object.assign(Breadcrumb, {
    Item: BreadcrumbItem,
    install: (app: any) => {
        app.component('Breadcrumb', Breadcrumb);
        app.component('BreadcrumbItem', BreadcrumbItem);
    },
}) as typeof Breadcrumb & {
    Item: typeof BreadcrumbItem;
    install: (app: any) => void;
};

export { BreadcrumbItem };
export default BreadcrumbWithItem;
