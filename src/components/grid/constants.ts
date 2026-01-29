import { InjectionKey, ComputedRef } from 'vue';

export const responsiveArray = ['xxl', 'xl', 'lg', 'md', 'sm', 'xs'];

export const responsiveMap = {
    xs: '(max-width: 575px)',
    sm: '(min-width: 576px)',
    md: '(min-width: 768px)',
    lg: '(min-width: 992px)',
    xl: '(min-width: 1200px)',
    xxl: '(min-width: 1600px)',
};

export interface RowContextType {
    gutters: ComputedRef<[number, number]>;
}

export const RowContextKey: InjectionKey<RowContextType> = Symbol('RowContext');
