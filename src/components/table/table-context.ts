import { inject, provide, type InjectionKey, type Ref } from 'vue';
import type { Direction } from './interface';

export interface TableContextProps {
    direction?: Direction;
    headWidths?: Ref<any[]>;
    tableWidth?: Ref<number>;
    anyColumnFixed?: Ref<boolean>;
    flattenedColumns?: Ref<any[]>;
    setHeadWidths?: (widths: Array<{ width: number; key: any }>, index?: number) => void;
    getHeadWidths?: (index?: number) => any[];
    getCellWidths?: (columns?: any[]) => number[];
    getQuery?: (dataIndex: string | number) => any;
    isSortOrderValid?: (sortOrder: any) => boolean;
    renderSelection?: (record?: any, isHeader?: boolean) => any;
}

export const TableContextKey: InjectionKey<TableContextProps> = Symbol('TableContext');

export function useTableContext(): TableContextProps {
    const context = inject(TableContextKey);
    if (!context) {
        return {};
    }
    return context;
}

export function provideTableContext(context: TableContextProps) {
    provide(TableContextKey, context);
}
