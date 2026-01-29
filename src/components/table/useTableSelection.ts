import { computed, h } from 'vue';
import { get } from 'lodash-es';
import type { Data, RowSelection } from './interface';
import TableSelectionCell from './TableSelectionCell.vue';

export interface UseTableSelectionOptions {
    rowSelection: RowSelection<Data> | undefined;
    pageData: { value: Data[] };
    dataSource: { value: Data[] };
    state: {
        value: {
            rowSelection?: {
                selectedRowKeys?: (string | number)[];
            };
        };
    };
    adapter: {
        getCachedFilteredSortedRowKeys: () => (string | number)[];
        getCachedFilteredSortedRowKeysSet: () => Set<string | number>;
        getCachedFilteredSortedDataSource: () => Data[];
        getAllDisabledRowKeysSet: () => Set<string | number>;
        setSelectedRowKeys: (keys: (string | number)[]) => void;
    };
    getRecordKey: (record: Data, index: number) => string | number;
    isRowDisabled: (record: Data) => boolean;
    childrenRecordName?: string;
}

/**
 * 组合式函数：封装表格行选择逻辑
 *
 * 支持功能：
 * - 单行选择/取消选择
 * - 全选/取消全选
 * - 受控/非受控模式
 * - 禁用行的处理
 * - 树形数据的选择（递归查找子节点）
 */
export function useTableSelection(options: UseTableSelectionOptions) {
    const {
        rowSelection: rowSelectionProp,
        pageData,
        dataSource,
        state,
        adapter,
        getRecordKey: getRecordKeyFn,
        isRowDisabled,
        childrenRecordName = 'children',
    } = options;

    /**
     * 判断指定行是否被选中
     * 支持受控和非受控两种模式
     */
    const isRowSelected = (record: Data): boolean => {
        if (!rowSelectionProp) {
            return false;
        }
        const rowSelection = typeof rowSelectionProp === 'object' ? rowSelectionProp : {};
        const isControlled = rowSelection.selectedRowKeys !== undefined;
        const selectedRowKeys = isControlled
            ? rowSelection.selectedRowKeys || []
            : state.value.rowSelection?.selectedRowKeys || [];
        const key = getRecordKeyFn(record, 0);
        return selectedRowKeys.includes(key);
    };

    /**
     * 获取单行的选择相关属性
     * 包括选中状态、禁用状态、选择处理函数等
     */
    const getRowSelectionProps = (record: Data) => {
        if (!rowSelectionProp) {
            return null;
        }

        const rowSelection = typeof rowSelectionProp === 'object' ? rowSelectionProp : {};
        const isControlled = rowSelection.selectedRowKeys !== undefined;
        const selectedRowKeys = isControlled
            ? rowSelection.selectedRowKeys || []
            : state.value.rowSelection?.selectedRowKeys || [];
        const key = getRecordKeyFn(record, 0);
        const selected = selectedRowKeys.includes(key);
        const checkboxProps = rowSelection.getCheckboxProps ? rowSelection.getCheckboxProps(record) : {};
        const disabled = isRowDisabled(record) || checkboxProps.disabled;

        /**
         * 处理单行选择/取消选择
         * 触发 onSelect 和 onChange 回调，并更新选中状态
         */
        const handleSelect = (checked: boolean, e: Event) => {
            if (rowSelection.onSelect) {
                const selectedRows = dataSource.value.filter((r) => {
                    const k = getRecordKeyFn(r, 0);
                    return k === key ? checked : selectedRowKeys.includes(k);
                });
                rowSelection.onSelect(record, checked, selectedRows, e as MouseEvent);
            }

            const newSelectedRowKeys = checked ? [...selectedRowKeys, key] : selectedRowKeys.filter((k) => k !== key);

            if (!isControlled) {
                adapter.setSelectedRowKeys(newSelectedRowKeys);
            }

            if (rowSelection.onChange) {
                const selectedRows = dataSource.value.filter((r) => {
                    const k = getRecordKeyFn(r, 0);
                    return newSelectedRowKeys.includes(k);
                });
                rowSelection.onChange(newSelectedRowKeys, selectedRows);
            }
        };

        return {
            selected,
            disabled,
            onChange: handleSelect,
            ...checkboxProps,
            'aria-label': `Select row ${key}`,
        };
    };

    /**
     * 表头全选 checkbox 的属性
     * 计算全选状态、半选状态（indeterminate）等
     */
    const titleSelectionProps = computed(() => {
        if (!rowSelectionProp) {
            return null;
        }

        const rowSelection = typeof rowSelectionProp === 'object' ? rowSelectionProp : {};
        const isControlled = rowSelection.selectedRowKeys !== undefined;
        const selectedRowKeys = isControlled
            ? rowSelection.selectedRowKeys || []
            : state.value.rowSelection?.selectedRowKeys || [];

        // 优先使用缓存的行 keys（已排序和筛选），如果为空则使用当前页数据
        let allRowKeys = adapter.getCachedFilteredSortedRowKeys() || [];
        let allRowKeysSet = adapter.getCachedFilteredSortedRowKeysSet() || new Set();

        allRowKeys = allRowKeys.filter((key) => key !== undefined && key !== null);
        allRowKeysSet = new Set(allRowKeys);

        // 兜底：如果缓存为空，使用当前页数据
        if (allRowKeys.length === 0 && pageData.value && pageData.value.length > 0) {
            allRowKeys = pageData.value
                .map((record) => getRecordKeyFn(record, 0))
                .filter((key) => key !== undefined && key !== null);
            allRowKeysSet = new Set(allRowKeys);
        }
        const disabledRowKeysSet = adapter.getAllDisabledRowKeysSet() || new Set();

        // 计算全选状态：所有可用的行都被选中
        const enabledRowKeys = allRowKeys.filter((key) => !disabledRowKeysSet.has(key));
        const selectedEnabledKeys = selectedRowKeys.filter(
            (key) => !disabledRowKeysSet.has(key) && allRowKeysSet.has(key)
        );
        const allSelected = enabledRowKeys.length > 0 && selectedEnabledKeys.length === enabledRowKeys.length;
        const hasRowSelected = selectedRowKeys.some((key) => allRowKeysSet.has(key));
        // 半选状态：部分选中但不是全部选中
        const indeterminate = hasRowSelected && !allSelected;

        /**
         * 处理全选/取消全选
         * 需要考虑禁用行、已排序筛选的数据、树形数据等复杂场景
         */
        const handleSelectAll = (checked: boolean, _e: Event) => {
            let currentAllRowKeys = adapter.getCachedFilteredSortedRowKeys() || [];
            let currentAllRowKeysSet = adapter.getCachedFilteredSortedRowKeysSet() || new Set();

            currentAllRowKeys = currentAllRowKeys.filter((key) => key !== undefined && key !== null);
            currentAllRowKeysSet = new Set(currentAllRowKeys);

            const usePageData = currentAllRowKeys.length === 0 && pageData.value && pageData.value.length > 0;
            if (usePageData) {
                currentAllRowKeys = pageData.value
                    .map((record) => getRecordKeyFn(record, 0))
                    .filter((key) => key !== undefined && key !== null);
                currentAllRowKeysSet = new Set(currentAllRowKeys);
            }

            if (currentAllRowKeys.length === 0) {
                return;
            }

            const currentRowSelection = typeof rowSelectionProp === 'object' ? rowSelectionProp : {};
            const currentIsControlled = currentRowSelection.selectedRowKeys !== undefined;
            const currentSelectedRowKeys = currentIsControlled
                ? currentRowSelection.selectedRowKeys || []
                : state.value.rowSelection?.selectedRowKeys || [];

            let newSelectedRowKeys = [...currentSelectedRowKeys];
            let changedRowKeys: (string | number)[] = [];
            const currentDisabledRowKeysSet = adapter.getAllDisabledRowKeysSet() || new Set();
            const currentSelectedRowKeysSet = new Set(currentSelectedRowKeys);

            if (checked) {
                for (const key of currentAllRowKeys) {
                    if (!currentDisabledRowKeysSet.has(key) && !currentSelectedRowKeysSet.has(key)) {
                        newSelectedRowKeys.push(key);
                        changedRowKeys.push(key);
                    }
                }
            } else {
                newSelectedRowKeys = newSelectedRowKeys.filter((key) => !currentAllRowKeysSet.has(key));
                changedRowKeys = currentSelectedRowKeys.filter((key) => currentAllRowKeysSet.has(key));
            }

            /**
             * 根据 rowKeys 查找对应的 record 对象
             * 支持树形数据：如果当前层级找不到所有记录，递归查找子节点
             */
            const getSelectedRows = (rowKeys: (string | number)[]): Data[] => {
                if (!rowKeys || rowKeys.length === 0) {
                    return [];
                }
                const keySet = new Set(rowKeys);
                let dataSourceForRows: Data[];
                if (usePageData) {
                    dataSourceForRows = pageData.value || [];
                } else {
                    // 优先使用已排序筛选的数据源
                    dataSourceForRows = adapter.getCachedFilteredSortedDataSource() || [];
                    if (!dataSourceForRows || dataSourceForRows.length === 0) {
                        dataSourceForRows = pageData.value || [];
                    }
                }

                const selectedRows: Data[] = [];

                /**
                 * 递归查找匹配的 record
                 * 如果当前层级未找到所有记录，继续在子节点中查找（支持树形数据）
                 */
                const findRows = (data: Data[]): void => {
                    if (!Array.isArray(data) || data.length === 0) {
                        return;
                    }
                    for (const record of data) {
                        const key = getRecordKeyFn(record, 0);
                        if (keySet.has(key)) {
                            selectedRows.push(record);
                        }
                    }

                    // 如果还有未找到的记录，递归查找子节点
                    if (selectedRows.length < rowKeys.length) {
                        for (const record of data) {
                            const children = get(record, childrenRecordName);
                            if (Array.isArray(children) && children.length > 0) {
                                findRows(children);
                            }
                        }
                    }
                };

                findRows(dataSourceForRows);
                return selectedRows;
            };
            const changedRows = getSelectedRows(changedRowKeys);
            const selectedRows = getSelectedRows(newSelectedRowKeys);

            if (!currentIsControlled) {
                adapter.setSelectedRowKeys(newSelectedRowKeys);
            }

            if (currentRowSelection.onSelectAll) {
                currentRowSelection.onSelectAll(checked, selectedRows, changedRows);
            }

            if (currentRowSelection.onChange) {
                currentRowSelection.onChange(newSelectedRowKeys, selectedRows);
            }
        };

        return {
            selected: allSelected,
            indeterminate,
            disabled: rowSelection.disabled,
            onChange: handleSelectAll,
            'aria-label': 'Select all rows',
        };
    });

    /**
     * 渲染选择 checkbox 组件
     * @param record - 数据行（表头时可不传）
     * @param isHeader - 是否为表头
     */
    const renderSelection = (record?: Data, isHeader = false) => {
        if (!rowSelectionProp) {
            return null;
        }

        if (isHeader) {
            const headerProps = titleSelectionProps.value;
            if (!headerProps) {
                return null;
            }
            return h(TableSelectionCell, headerProps);
        }

        if (!record) {
            return null;
        }

        const selectionProps = getRowSelectionProps(record);
        if (!selectionProps) {
            return null;
        }
        return h(TableSelectionCell, selectionProps);
    };

    return {
        isRowSelected,
        getRowSelectionProps,
        titleSelectionProps,
        renderSelection,
    };
}
