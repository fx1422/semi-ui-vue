import type { CSSProperties, VNode } from 'vue';
import type { TooltipProps } from '../tooltip/interface';

export interface Route {
    [x: string]: any;
    path?: string;
    href?: string;
    name?: string;
    icon?: any;
}

export interface BreadcrumbItemInfo {
    name?: any; // maybe VNode, string, number
    href?: string;
    icon?: any;
    path?: string;
}

export interface ShowTooltipProps {
    width?: string | number;
    ellipsisPos?: 'end' | 'middle';
    opts?: TooltipProps;
}

export type MoreType = 'default' | 'popover';

export interface BreadcrumbProps {
    routes?: Array<Route | string>;
    onClick?: (route: Route, event: MouseEvent) => void;
    separator?: any; // VNode | string
    compact?: boolean;
    style?: CSSProperties;
    renderItem?: (route: Route) => any;
    className?: string;
    showTooltip?: boolean | ShowTooltipProps;
    maxItemCount?: number;
    autoCollapse?: boolean;
    /* Customize the contents of the ellipsis area */
    renderMore?: (restItem: Array<VNode>) => any;
    /* Style type for ellipsis area */
    moreType?: MoreType;
    'aria-label'?: string;
    activeIndex?: number;
}

export interface BreadcrumbItemProps {
    onClick?: (item: Route, e: MouseEvent) => void;
    href?: string;
    separator?: any;
    noLink?: boolean;
    active?: boolean;
    shouldRenderSeparator?: boolean;
    route?: Route;
}
