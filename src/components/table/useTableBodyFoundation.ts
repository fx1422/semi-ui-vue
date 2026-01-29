import { computed, ref, watch, type Ref, type ComputedRef } from 'vue';
import TableBodyFoundation, {
    type BodyAdapter,
    type FlattenData,
    type GroupFlattenData,
} from '@douyinfe/semi-foundation/table/bodyFoundation';
import type { ColumnProps } from './interface';

export interface UseTableBodyFoundationProps {
    dataSource?: any[] | ComputedRef<any[]>;
    rowKey?:
        | string
        | number
        | ((record: any) => string | number)
        | ComputedRef<string | number | ((record: any) => string | number)>;
    childrenRecordName?: string | ComputedRef<string>;
    expandedRowRender?:
        | ((record: any, index: number, expanded: boolean) => any)
        | ComputedRef<(record: any, index: number, expanded: boolean) => any>;
    expandedRowKeys?: (string | number)[] | ComputedRef<(string | number)[]>;
    groups?:
        | Map<string | number, Set<string | number>>
        | null
        | ComputedRef<Map<string | number, Set<string | number>> | null>;
    columns?: ColumnProps[] | ComputedRef<ColumnProps[]>;
}

export interface UseTableBodyFoundationReturn {
    virtualizedData: Ref<Array<FlattenData | GroupFlattenData>>;
    cachedExpandBtnShouldInRow: Ref<boolean | null>;
    initVirtualizedData: () => void;
    foundation: TableBodyFoundation;
}

/**
 * 组合式函数：封装 TableBodyFoundation 的逻辑
 *
 * 用于虚拟滚动场景下的数据扁平化处理，包括：
 * - 树形数据的展开/收起
 * - 分组数据的扁平化
 * - 虚拟滚动所需的数据结构转换
 */
export function useTableBodyFoundation(props: UseTableBodyFoundationProps): UseTableBodyFoundationReturn {
    const virtualizedData = ref<Array<FlattenData | GroupFlattenData>>([]);
    const cachedExpandBtnShouldInRow = ref<boolean | null>(null);
    const cachedExpandRelatedProps = ref<any[]>([]);

    /**
     * 统一处理普通值和 ComputedRef，确保 Foundation 层能正确获取响应式值
     * 支持 props 传入普通值或 computed 值，提高使用灵活性
     */
    const getReactiveValue = <T>(value: T | ComputedRef<T>): T => {
        return value && typeof value === 'object' && 'value' in value ? (value as ComputedRef<T>).value : (value as T);
    };

    /**
     * 将 props 转换为响应式对象，供 Foundation 层使用
     * 使用 computed 确保当 props 中的 ComputedRef 变化时，reactiveProps 也会更新
     */
    const reactiveProps = computed(() => ({
        dataSource: getReactiveValue(props.dataSource),
        rowKey: getReactiveValue(props.rowKey),
        childrenRecordName: getReactiveValue(props.childrenRecordName),
        expandedRowRender: getReactiveValue(props.expandedRowRender),
        expandedRowKeys: getReactiveValue(props.expandedRowKeys),
        groups: getReactiveValue(props.groups),
        columns: getReactiveValue(props.columns),
    }));

    const adapter: BodyAdapter<any, any> = {
        getProp: (key: string) => (reactiveProps.value as any)[key],
        getProps: () => reactiveProps.value,
        // 以下方法在 TableBodyFoundation 中定义但不需要实际实现
        getState: () => null,
        getStates: () => ({}),
        setState: () => {},
        getContext: () => null,
        getContexts: () => ({}),
        getCache: () => null,
        getCaches: () => ({}),
        setCache: () => {},
        stopPropagation: (e?: Event) => e?.stopPropagation?.(),
        persistEvent: () => {},
        setVirtualizedData: (data: Array<FlattenData | GroupFlattenData>, cb?: () => void) => {
            virtualizedData.value = data;
            cb?.();
        },
        setCachedExpandBtnShouldInRow: (value: boolean) => {
            cachedExpandBtnShouldInRow.value = value;
        },
        setCachedExpandRelatedProps: (value: any[]) => {
            cachedExpandRelatedProps.value = value;
        },
        // ResizeObserver 逻辑在 VirtualizedBody 组件中处理，这里保持空实现以符合接口要求
        observeBodyResize: () => {},
        unobserveBodyResize: () => {},
    };

    const foundation = new TableBodyFoundation(adapter);

    const initVirtualizedData = () => {
        foundation.initVirtualizedData();
    };

    /**
     * 监听 reactiveProps 变化，自动重新扁平化数据
     * 使用 deep: true 确保能监听到 computed 内部值的变化
     */
    watch(
        reactiveProps,
        () => {
            initVirtualizedData();
        },
        { deep: true }
    );

    // 立即初始化，确保首次渲染时有数据
    initVirtualizedData();

    return {
        virtualizedData,
        cachedExpandBtnShouldInRow,
        initVirtualizedData,
        foundation,
    };
}
