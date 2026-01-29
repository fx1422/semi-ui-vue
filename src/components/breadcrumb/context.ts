import { inject, provide, InjectionKey } from 'vue';
import type { ShowTooltipProps, BreadcrumbItemInfo } from './interface';

export interface BreadcrumbContext {
    onClick?: (info: BreadcrumbItemInfo, event: MouseEvent) => void;
    showTooltip?: boolean | ShowTooltipProps;
    compact?: boolean;
    separator?: any;
}

const BreadcrumbContextKey: InjectionKey<BreadcrumbContext> = Symbol('BreadcrumbContext');

export function provideBreadcrumbContext(context: BreadcrumbContext) {
    provide(BreadcrumbContextKey, context);
}

export function useBreadcrumbContext() {
    return inject(BreadcrumbContextKey, {
        onClick: undefined,
        showTooltip: undefined,
        compact: true,
        separator: '/',
    });
}
