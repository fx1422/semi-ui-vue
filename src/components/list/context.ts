import type { InjectionKey, Ref } from 'vue';
import type { Grid } from './interface';

export interface ListContextValue {
    grid?: Grid;
    onClick?: (e: MouseEvent) => void;
    onRightClick?: (e: MouseEvent) => void;
}

export const ListContextKey: InjectionKey<Ref<ListContextValue>> = Symbol('ListContext');
