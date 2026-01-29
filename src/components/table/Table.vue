<template>
    <div :class="wrapperCls" :style="wrapperStyle" :data-column-fixed="anyColumnFixed" v-bind="getDataAttr()">
        <Spin :spinning="props.loading" size="large">
            <div ref="wrapRef" :class="wrapCls">
                <template v-if="showPagination && (paginationPosition === 'top' || paginationPosition === 'both')">
                    <component :is="renderPagination" v-if="renderPagination" />
                    <LocaleConsumer v-else-if="paginationProps" component-name="Table">
                        <template #default="{ locale }">
                            <div :class="`${prefixCls}-pagination-outer`">
                                <span v-if="getPaginationInfo(locale)" :class="`${prefixCls}-pagination-info`">
                                    {{ getPaginationInfo(locale) }}
                                </span>
                                <span :class="`${prefixCls}-pagination-wrapper`">
                                    <Pagination
                                        v-if="paginationProps && paginationProps.total > 0"
                                        v-bind="paginationProps"
                                    />
                                </span>
                            </div>
                        </template>
                    </LocaleConsumer>
                </template>
                <div v-if="props.title" :class="`${prefixCls}-title`">
                    <component :is="renderTitle" />
                </div>
                <div :class="tableWrapperCls" :style="tableWrapperStyle">
                    <div
                        v-if="useFixedHeader && showHeader"
                        ref="headerWrapRef"
                        :class="headerCls"
                        :style="getHeaderStyle()"
                        @scroll="handleHeaderScroll"
                    >
                        <table :class="tableCls" :style="headerTableStyle" role="grid">
                            <colgroup :class="`${prefixCls}-colgroup`">
                                <col
                                    v-for="(column, index) in flattenColumns"
                                    :key="index"
                                    :class="`${prefixCls}-col`"
                                    :style="getColumnStyle(column)"
                                />
                            </colgroup>
                            <TableHeader
                                :columns="flattenColumns"
                                :components="props.components"
                                :prefix-cls="prefixCls"
                                :on-header-row="props.onHeaderRow"
                                :selected-row-keys-set="selectedRowKeysSet"
                                :title-selection-props="titleSelectionProps"
                                :on-sorter-click="handleSorterClick"
                                :on-filter-select="handleFilterSelect"
                                :on-filter-dropdown-visible-change="handleFilterDropdownVisibleChange"
                                :on-resize="handleColumnResize"
                            />
                        </table>
                    </div>
                    <VirtualizedBody
                        v-if="props.virtualized"
                        ref="virtualizedBodyRef"
                        :data-source="sortedData"
                        :columns="flattenColumns"
                        :virtualized="props.virtualized"
                        :scroll="props.scroll"
                        :prefix-cls="prefixCls"
                        :size="props.size"
                        :on-scroll="virtualizedOnScroll"
                        :handle-body-scroll="handleBodyScroll"
                        :row-key="props.rowKey"
                        :components="props.components"
                        :expanded-row-keys="state.expandedRowKeys"
                        :expanded-row-render="props.expandedRowRender"
                        :on-row="props.onRow"
                        :row-expandable="isRowExpandable"
                        :selected-row-keys-set="selectedRowKeysSet"
                        :disabled-row-keys-set="state.disabledRowKeysSet"
                        :render-expand-icon="renderExpandIcon"
                        :hide-expanded-column="props.hideExpandedColumn"
                        :expand-row-by-click="props.expandRowByClick"
                        :slots="slots"
                        :children-record-name="props.childrenRecordName"
                        :groups="state.groups"
                        :render-group-section="renderGroupSection"
                        :on-grouped-row="props.onGroupedRow"
                        :click-grouped-row-to-expand="props.clickGroupedRowToExpand"
                        :on-group-expand="handleGroupRowExpanded"
                        :indent-size="props.indentSize"
                        :expand-icon="props.expandIcon"
                        @items-rendered="handleItemsRendered"
                    >
                        <template #empty>
                            <slot v-if="slots.empty" name="empty" />
                            <component :is="props.empty" v-else-if="props.empty" />
                            <LocaleConsumer v-else component-name="Table">
                                <template #default="{ locale }">
                                    <Empty :description="(locale as any)?.emptyText || '暂无数据'" />
                                </template>
                            </LocaleConsumer>
                        </template>
                    </VirtualizedBody>
                    <div
                        v-else
                        ref="bodyWrapRef"
                        :class="`${prefixCls}-body`"
                        :style="getBodyStyle()"
                        @scroll="handleBodyScroll"
                    >
                        <table :class="tableCls" :style="bodyTableStyle" role="grid">
                            <colgroup :class="`${prefixCls}-colgroup`">
                                <col
                                    v-for="(column, index) in flattenColumns"
                                    :key="index"
                                    :class="`${prefixCls}-col`"
                                    :style="getColumnStyle(column)"
                                />
                            </colgroup>
                            <TableHeader
                                v-if="!useFixedHeader && showHeader"
                                :columns="flattenColumns"
                                :components="props.components"
                                :prefix-cls="prefixCls"
                                :on-header-row="props.onHeaderRow"
                                :selected-row-keys-set="selectedRowKeysSet"
                                :title-selection-props="titleSelectionProps"
                                :on-sorter-click="handleSorterClick"
                                :on-filter-select="handleFilterSelect"
                                :on-filter-dropdown-visible-change="handleFilterDropdownVisibleChange"
                                :on-resize="handleColumnResize"
                            />
                            <tbody ref="bodyRef" :class="`${prefixCls}-tbody`">
                                <template
                                    v-for="(record, rowIndex) in displayData"
                                    :key="
                                        record.__semiTableGroupSection
                                            ? `group-${record.groupKey}`
                                            : getRecordKey(record, rowIndex)
                                    "
                                >
                                    <!-- 分组行 -->
                                    <tr
                                        v-if="record.__semiTableGroupSection"
                                        :class="
                                            classnames(`${prefixCls}-row-section`, `${prefixCls}-row`, {
                                                [`${prefixCls}-row-section-on`]: isGroupExpanded(record.groupKey),
                                            })
                                        "
                                        :data-row-key="record.groupKey"
                                        :aria-rowindex="rowIndex + 1"
                                        :aria-level="1"
                                        v-bind="getGroupedRowProps(record.groupKey, rowIndex)"
                                        @click="handleGroupedRowClick(record.groupKey, rowIndex, $event)"
                                    >
                                        <td :colspan="flattenColumns.length" :class="`${prefixCls}-row-cell`">
                                            <div :class="`${prefixCls}-section-inner`">
                                                <component
                                                    :is="() => renderGroupExpandIcon(record.groupKey)"
                                                    v-if="props.expandIcon !== false"
                                                />
                                                <component :is="() => renderGroupSection(record.groupKey)" />
                                            </div>
                                        </td>
                                    </tr>
                                    <!-- 普通数据行 -->
                                    <tr
                                        v-else
                                        :class="getRowClass(record, rowIndex)"
                                        :style="getRowStyle(record, rowIndex)"
                                        v-bind="getRowProps(record, rowIndex)"
                                        @click="handleRowClick(record, rowIndex, $event)"
                                        @dblclick="handleRowDoubleClick(record, $event)"
                                        @mouseenter="handleRowMouseEnter(record, $event)"
                                        @mouseleave="handleRowMouseLeave(record, $event)"
                                    >
                                        <TableCell
                                            v-for="(column, colIndex) in flattenColumns"
                                            :key="colIndex"
                                            :record="record"
                                            :column="column"
                                            :index="rowIndex"
                                            :col-index="colIndex"
                                            :prefix-cls="prefixCls"
                                            :selected="isRowSelected(record)"
                                            :expanded="isRowExpanded(record)"
                                            :disabled="isRowDisabled(record)"
                                            :indent="getRowIndent(record, colIndex)"
                                            :selection-cell-props="
                                                isSelectionColumn(column) ? getRowSelectionProps(record) : undefined
                                            "
                                            :expand-icon="getExpandIcon(record)"
                                            :render-expand-icon="shouldProvideExpandIcon ? renderExpandIcon : undefined"
                                            :expandable="isRowExpandable(record)"
                                            :hide-expanded-column="props.hideExpandedColumn"
                                            :first-data-column-index="firstDataColumnIndex"
                                            :column-slot-name="getColumnSlotName(column)"
                                            :has-slot="getColumnSlotName(column) && !!slots[getColumnSlotName(column)]"
                                            :fixed-left="getFixedLeftOffset(column, colIndex)"
                                            :last-fixed-left="isLastLeftFixed(flattenColumns, column)"
                                            :fixed-right="getFixedRightOffset(column, colIndex)"
                                            :first-fixed-right="isFirstFixedRight(flattenColumns, column)"
                                        >
                                            <template
                                                v-if="getColumnSlotName(column) && slots[getColumnSlotName(column)]"
                                                #[getColumnSlotName(column)]="slotProps"
                                            >
                                                <slot
                                                    :name="getColumnSlotName(column)"
                                                    v-bind="slotProps || {}"
                                                    :text="getColumnValue(record, column)"
                                                    :record="record"
                                                    :index="rowIndex"
                                                />
                                            </template>
                                        </TableCell>
                                    </tr>
                                    <tr
                                        v-if="
                                            isRowExpanded(record) && props.expandedRowRender && isRowExpandable(record)
                                        "
                                        :class="classnames(`${prefixCls}-row-expand`, `${prefixCls}-row`)"
                                    >
                                        <td :colspan="flattenColumns.length" :class="`${prefixCls}-row-cell`">
                                            <div :class="`${prefixCls}-expand-inner`">
                                                <component
                                                    :is="() => props.expandedRowRender(record, rowIndex, true)"
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                </template>
                                <tr v-if="!pageData || pageData.length === 0">
                                    <td :colspan="flattenColumns.length" :class="`${prefixCls}-empty`">
                                        <slot v-if="slots.empty" name="empty" />
                                        <component :is="props.empty" v-else-if="props.empty" />
                                        <LocaleConsumer v-else component-name="Table">
                                            <template #default="{ locale }">
                                                <Empty :description="(locale as any)?.emptyText || '暂无数据'" />
                                            </template>
                                        </LocaleConsumer>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <component :is="renderFooter" v-if="renderFooter" />
                <template v-if="showPagination && (paginationPosition === 'bottom' || paginationPosition === 'both')">
                    <component :is="renderPagination" v-if="renderPagination" />
                    <LocaleConsumer v-else-if="paginationProps" component-name="Table">
                        <template #default="{ locale }">
                            <div :class="`${prefixCls}-pagination-outer`">
                                <span v-if="getPaginationInfo(locale)" :class="`${prefixCls}-pagination-info`">
                                    {{ getPaginationInfo(locale) }}
                                </span>
                                <span :class="`${prefixCls}-pagination-wrapper`">
                                    <Pagination
                                        v-if="paginationProps && paginationProps.total > 0"
                                        v-bind="paginationProps"
                                    />
                                </span>
                            </div>
                        </template>
                    </LocaleConsumer>
                </template>
            </div>
        </Spin>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, useSlots, onMounted, onUnmounted, nextTick, h, isVNode } from 'vue';
import classnames from 'classnames';
import { get, isEqual, flattenDeep, find, cloneDeep, noop } from 'lodash-es';
import TableFoundation, { TableAdapter } from '@douyinfe/semi-foundation/table/foundation';
import { cssClasses, strings, numbers } from '@douyinfe/semi-foundation/table/constants';
import {
    isSelectionColumn,
    isFixedLeft,
    isFixedRight,
    isLastLeftFixed,
    isFirstFixedRight,
    arrayAdd,
    assignColumnKeys,
    isInnerColumnKey,
    flattenColumns as flattenColumnsUtil,
} from '@douyinfe/semi-foundation/table/utils';
import { provideTableContext } from './table-context';
import { useBaseComponent } from '../_utils';
import { useFoundation } from '../../_utils/useFoundation';
import Spin from '../spin';
import Empty from '../empty';
import Pagination from '../pagination';
import LocaleConsumer from '../locale/LocaleConsumer.vue';
import TableHeader from './TableHeader.vue';
import TableCell from './TableCell.vue';
import CustomExpandIcon from './CustomExpandIcon.vue';
import VirtualizedBody from './VirtualizedBody.vue';
import { useTableSelection } from './useTableSelection';
import type { TableProps, ColumnProps, Data, TablePaginationProps } from './interface';
import type { CSSProperties } from 'vue';

defineOptions({
    name: 'SemiTable',
});

const props = withDefaults(defineProps<TableProps<Data>>(), {
    bordered: false,
    showHeader: true,
    hideExpandedColumn: true,
    size: 'default',
    tableLayout: '',
    prefixCls: cssClasses.PREFIX,
    pagination: true,
    childrenRecordName: 'children',
    dataSource: () => [],
    rowSelection: null,
    className: '',
    loading: false,
    expandCellFixed: false,
    indentSize: numbers.DEFAULT_INDENT_WIDTH,
    rowKey: 'key',
    defaultExpandedRowKeys: () => [],
    defaultExpandAllRows: false,
    defaultExpandAllGroupRows: false,
    expandAllRows: false,
    expandAllGroupRows: false,
    expandRowByClick: false,
    onChange: noop,
    onFilterDropdownVisibleChange: noop,
    onExpand: noop,
    onExpandedRowsChange: noop,
});

const firstDataColumnIndex = computed(() => {
    let idx = 0;
    const cols = flattenColumns.value || [];
    while (idx < cols.length) {
        const key = (cols[idx] as any)?.key;
        if (key != null && isInnerColumnKey(key)) {
            idx += 1;
            continue;
        }
        break;
    }
    return idx;
});

const childrenRecordName = computed(() => props.childrenRecordName || 'children');

const isTreeTable = computed(() => {
    const ds = props.dataSource || [];
    if (!Array.isArray(ds) || ds.length === 0) {
        return false;
    }
    const key = childrenRecordName.value;
    return ds.some((record: any) => Array.isArray(record?.[key]) && record[key].length > 0);
});

const hasTreeChildren = (record: any) => {
    const key = childrenRecordName.value;
    return Array.isArray(record?.[key]) && record[key].length > 0;
};

const getTreeLevel = (record: any): number => {
    return (record as any)?.__semiTableTreeLevel ?? 0;
};

const getRowIndent = (record: any, colIndex: number): number => {
    if (!isTreeTable.value) {
        return 0;
    }
    if (colIndex !== firstDataColumnIndex.value) {
        return 0;
    }
    return getTreeLevel(record);
};

const shouldProvideExpandIcon = computed(() => {
    return Boolean(props.expandedRowRender) || isTreeTable.value;
});

const emit = defineEmits<{
    (e: 'change', changeInfo: any): void;
    (e: 'expand', expanded: boolean, record: Data, mouseEvent?: MouseEvent): void;
    (e: 'expandedRowsChange', expandedRows: Data[]): void;
}>();

const prefixCls = computed(() => props.prefixCls || cssClasses.PREFIX);

// 获取插槽
const slots = useSlots();

// Refs
const bodyRef = ref<HTMLTableSectionElement | null>(null);
const bodyWrapRef = ref<HTMLDivElement | null>(null);
const headerWrapRef = ref<HTMLDivElement | null>(null);
const virtualizedBodyRef = ref<InstanceType<typeof VirtualizedBody> | null>(null);
const wrapRef = ref<HTMLDivElement | null>(null);

type BodyScrollPosition = 'both' | 'middle' | 'left' | 'right';

// State
const state = ref({
    cachedColumns: [] as ColumnProps[],
    cachedChildren: null,
    flattenColumns: [] as ColumnProps[],
    queries: [] as ColumnProps[],
    dataSource: [] as Data[],
    flattenData: [] as Data[],
    expandedRowKeys: [] as (string | number)[],
    rowSelection: null as any,
    pagination: null as any,
    groups: null as any,
    groupKeys: [] as (string | number)[],
    allRowKeys: [] as (string | number)[],
    allDisabledRowKeys: [] as (string | number)[],
    disabledRowKeys: [] as (string | number)[],
    disabledRowKeysSet: new Set<string | number>(),
    selectedRowKeys: [] as (string | number)[],
    selectedRowKeysSet: new Set<string | number>(),
    hoveredRowKey: null as string | number | null,
    cachedFilteredSortedDataSource: [] as Data[],
    cachedFilteredSortedRowKeys: [] as (string | number)[],
    cachedFilteredSortedRowKeysSet: new Set<string | number>(),
    headWidths: [] as any[],
    bodyHasScrollBar: false,
    tableWidth: 0,
});

// 同一轮渲染/事件周期内的“写入锁”，用于打断 Vue 的递归更新（排序/筛选会导致 DOM 重排，click 可能被重复触发）
let applyingQueriesInTick = false;
let sortingInTick = false;
const releaseGuards = () => {
    applyingQueriesInTick = false;
    sortingInTick = false;
};

const { adapter: baseAdapter, getDataAttr } = useBaseComponent(props, state);

function getExpandedRowsByKeys(expandedRowKeys: (string | number)[]) {
    const keySet = new Set(expandedRowKeys);
    const dataSource = props.dataSource || [];
    return dataSource.filter((record, index) => keySet.has(getRecordKey(record, index)));
}

type TableAdapterExt<RecordType> = TableAdapter<RecordType> & {
    notifyRowDoubleClick?: (record: RecordType, e: MouseEvent) => void;
    notifyRowMouseEnter?: (record: RecordType, e: MouseEvent) => void;
    notifyRowMouseLeave?: (record: RecordType, e: MouseEvent) => void;
    notifySelectInvert?: (selectedRows: RecordType[]) => void;
    setAllDisabledRowKeys?: (allDisabledRowKeys: (string | number)[]) => void;
    getAllDisabledRowKeys?: () => (string | number)[];
    getAllDisabledRowKeysSet?: () => Set<string | number>;
};

// 构建 adapter
const adapter = {
    ...baseAdapter,
    resetScrollY: () => {
        if (bodyRef.value) {
            bodyRef.value.scrollTop = 0;
        }
    },
    setSelectedRowKeys: (selectedRowKeys) => {
        state.value.rowSelection = {
            ...state.value.rowSelection,
            selectedRowKeys: [...selectedRowKeys],
            selectedRowKeysSet: new Set(selectedRowKeys),
        };
    },
    setDisabledRowKeys: (disabledRowKeys) => {
        state.value.disabledRowKeys = disabledRowKeys;
        state.value.disabledRowKeysSet = new Set(disabledRowKeys);
    },
    setCurrentPage: (currentPage) => {
        const { pagination } = state.value;
        if (typeof pagination === 'object') {
            state.value.pagination = { ...pagination, currentPage };
        } else {
            state.value.pagination = { currentPage };
        }
    },
    setPagination: (pagination) => {
        state.value.pagination = pagination;
    },
    setGroups: (groups) => {
        // Foundation 层可能会传入 Set 类型，我们需要转换为 Data[] 类型
        if (groups && groups instanceof Map) {
            const convertedGroups = new Map<string | number, Data[]>();
            const dataSource = props.dataSource || [];

            groups.forEach((value, key) => {
                if (value instanceof Set) {
                    // 如果是 Set，需要检查 Set 中存储的是 key 还是 record 对象
                    const setArray = Array.from(value);

                    // 检查 Set 中的第一项是 key 还是 record 对象
                    if (setArray.length > 0) {
                        const firstItem = setArray[0];
                        // 如果是字符串或数字（可能是 key），需要从 dataSource 中查找对应的 record
                        if (typeof firstItem === 'string' || typeof firstItem === 'number') {
                            const records: Data[] = [];
                            setArray.forEach((itemKey) => {
                                const record = dataSource.find((r) => {
                                    const rKey = props.rowKey
                                        ? typeof props.rowKey === 'function'
                                            ? props.rowKey(r)
                                            : get(r, props.rowKey, '')
                                        : get(r, 'key', '');
                                    return rKey === itemKey;
                                });
                                if (record) {
                                    records.push(record);
                                }
                            });
                            convertedGroups.set(key, records);
                        } else {
                            // 如果已经是对象，直接使用
                            convertedGroups.set(key, setArray as Data[]);
                        }
                    } else {
                        convertedGroups.set(key, []);
                    }
                } else if (Array.isArray(value)) {
                    // 如果已经是数组，检查数组中是否是对象
                    const validRecords = value.filter(
                        (item) => item && typeof item === 'object' && !Array.isArray(item)
                    );
                    convertedGroups.set(key, validRecords);
                }
            });
            state.value.groups = convertedGroups;
        } else {
            state.value.groups = groups;
        }
    },
    setDataSource: (dataSource) => {
        state.value.dataSource = dataSource;
    },
    setExpandedRowKeys: (expandedRowKeys) => {
        state.value.expandedRowKeys = [...expandedRowKeys];
    },
    setQuery: (query = {}) => {
        // 合并查询
        const queries = [...state.value.queries];
        const existingIndex = queries.findIndex((q) => q.key === query.key || q.dataIndex === query.dataIndex);
        if (existingIndex > -1) {
            queries[existingIndex] = { ...queries[existingIndex], ...query };
        } else {
            queries.push(query);
        }
        state.value.queries = queries;
    },
    setQueries: (queries) => {
        // 避免递归更新：某些场景下 foundation 会多次触发 setQueries，
        // 如果值没有变化则不写入响应式状态，防止触发自身依赖的 effect。
        if (queries === state.value.queries || isEqual(queries, state.value.queries)) {
            return;
        }
        // 同一 tick 内只允许写一次 queries，防止重复触发导致递归更新
        if (applyingQueriesInTick) {
            return;
        }
        applyingQueriesInTick = true;
        queueMicrotask(releaseGuards);
        state.value.queries = queries;
    },
    setFlattenData: (flattenData) => {
        state.value.flattenData = flattenData;
    },
    setAllRowKeys: (allRowKeys) => {
        state.value.allRowKeys = allRowKeys;
    },
    setHoveredRowKey: (hoveredRowKey) => {
        // 排序触发的重排过程中会产生大量 hover 事件，容易放大递归更新问题；这里在排序写入周期内跳过 hover
        if (sortingInTick) {
            return;
        }
        state.value.hoveredRowKey = hoveredRowKey;
    },
    setCachedFilteredSortedDataSource: (filteredSortedDataSource) => {
        state.value.cachedFilteredSortedDataSource = filteredSortedDataSource;
    },
    setCachedFilteredSortedRowKeys: (filteredSortedRowKeys) => {
        state.value.cachedFilteredSortedRowKeys = filteredSortedRowKeys;
        state.value.cachedFilteredSortedRowKeysSet = new Set(filteredSortedRowKeys);
    },
    setAllDisabledRowKeys: (allDisabledRowKeys) => {
        state.value.allDisabledRowKeys = allDisabledRowKeys;
    },
    getCurrentPage: () => get(state.value, 'pagination.currentPage', 1),
    getCurrentPageSize: () => get(state.value, 'pagination.pageSize', 10),
    getCachedFilteredSortedDataSource: () => state.value.cachedFilteredSortedDataSource,
    getCachedFilteredSortedRowKeys: () => state.value.cachedFilteredSortedRowKeys,
    getCachedFilteredSortedRowKeysSet: () => state.value.cachedFilteredSortedRowKeysSet,
    getAllDisabledRowKeys: () => state.value.allDisabledRowKeys,
    getAllDisabledRowKeysSet: () => new Set(state.value.allDisabledRowKeys),
    notifyFilterDropdownVisibleChange: (_visible, _dataIndex) => {
        // 筛选下拉框可见性变化通知
        // 注意：主要的逻辑已在 handleFilterDropdownVisibleChange 中处理（包括调用 column.onFilterDropdownVisibleChange）
        // 这里保持为空，避免重复调用。Foundation 层调用此方法是为了通知，但实际处理已在 Vue 层完成
    },
    notifyChange: (changeInfo) => {
        emit('change', changeInfo);
    },
    notifyExpand: (expanded, record, mouseEvent) => {
        emit('expand', expanded, record, mouseEvent);
    },
    notifyExpandedRowsChange: (expandedRows) => {
        emit('expandedRowsChange', expandedRows);
    },
    notifyRowDoubleClick: (_record: Data, _e: MouseEvent) => {
        // 双击事件已通过 handleRowDoubleClick 处理
    },
    notifyRowMouseEnter: (_record: Data, _e: MouseEvent) => {
        // 鼠标进入事件已通过 handleRowMouseEnter 处理
    },
    notifyRowMouseLeave: (_record: Data, _e: MouseEvent) => {
        // 鼠标离开事件已通过 handleRowMouseLeave 处理
    },
    notifySelect: (record: Data, selected: boolean, selectedRows: Data[], e: MouseEvent) => {
        const rowSelection = typeof props.rowSelection === 'object' ? props.rowSelection : {};
        if (rowSelection.onSelect) {
            rowSelection.onSelect(record, selected, selectedRows, e);
        }
    },
    notifySelectAll: (selected: boolean, selectedRows: Data[], changeRows: Data[]) => {
        const rowSelection = typeof props.rowSelection === 'object' ? props.rowSelection : {};
        if (rowSelection.onSelectAll) {
            rowSelection.onSelectAll(selected, selectedRows, changeRows);
        }
    },
    notifySelectInvert: (selectedRows: Data[]) => {
        const rowSelection = typeof props.rowSelection === 'object' ? props.rowSelection : {};
        const onSelectInvert = (rowSelection as any)?.onSelectInvert as undefined | ((rows: Data[]) => void);
        if (typeof onSelectInvert === 'function') {
            onSelectInvert(selectedRows);
        }
    },
    notifySelectionChange: (selectedRowKeys: (string | number)[], selectedRows: Data[]) => {
        const rowSelection = typeof props.rowSelection === 'object' ? props.rowSelection : {};
        if (rowSelection.onChange) {
            rowSelection.onChange(selectedRowKeys, selectedRows);
        }
    },
    isAnyColumnFixed: () => {
        const columns = flattenColumns.value;
        return columns.some((col) => col.fixed === true || col.fixed === 'left' || col.fixed === 'right');
    },
    useFixedHeader: () => {
        const { scroll, sticky } = props;
        return Boolean(get(scroll, 'y') || sticky);
    },
    setHeadWidths: (widths: Array<{ width: number; key: any }>, index?: number) => {
        if (typeof index === 'number') {
            // 确保 headWidths 是数组
            if (!Array.isArray(state.value.headWidths)) {
                state.value.headWidths = [];
            }
            state.value.headWidths[index] = widths;
        } else {
            state.value.headWidths = widths;
        }
    },
    getHeadWidths: (index?: number) => {
        if (typeof index === 'number') {
            return state.value.headWidths[index] || [];
        }
        return state.value.headWidths;
    },
    getCellWidths: (columns?: ColumnProps[]) => {
        const cols = columns || flattenColumns.value;
        if (!Array.isArray(cols) || !cols.length) {
            return [];
        }

        const hw = state.value.headWidths as any;
        const flattenedWidths: Array<{ width: number; key: any }> = (() => {
            if (Array.isArray(hw) && hw.length) {
                if (Array.isArray(hw[0])) {
                    return flattenDeep(hw) as Array<{ width: number; key: any }>;
                }
                return hw as Array<{ width: number; key: any }>;
            }
            return [];
        })();

        const result = cols.map((col) => {
            if (typeof col.width === 'number') {
                return col.width;
            }

            if (col.key != null && Array.isArray(flattenedWidths) && flattenedWidths.length) {
                const match = find(flattenedWidths, (item) => item && item.key != null && item.key === col.key);
                if (match) {
                    return match.width;
                }
            }

            if (col.dataIndex != null && Array.isArray(flattenedWidths) && flattenedWidths.length) {
                const match = find(flattenedWidths, (item) => item && item.key != null && item.key === col.dataIndex);
                if (match) {
                    return match.width;
                }
            }

            return 0;
        });

        return result;
    },
    mergedRowExpandable: () => false,
    isAnyColumnUseFullRender: () => false,
    getNormalizeColumns: () => () => [],
    getHandleColumns: () => () => [],
    getMergePagination: () => (pagination: any) => {
        // 合并分页配置，添加 onChange 回调
        return { onChange: foundation.setPage, ...pagination };
    },
    setBodyHasScrollbar: (bodyHasScrollBar) => {
        state.value.bodyHasScrollBar = bodyHasScrollBar;
    },
    getTableLayout: () => {
        // 如果明确指定了 tableLayout，使用指定的值
        if (props.tableLayout) {
            return props.tableLayout;
        }
        // 否则根据列的状态自动决定，与 React 版本保持一致
        let isFixed = false;
        const flattenedCols = flattenColumns.value;
        if (Array.isArray(flattenedCols)) {
            isFixed = flattenedCols.some((column) => Boolean(column.ellipsis) || Boolean(column.fixed));
        }
        if (useFixedHeader.value) {
            isFixed = true;
        }
        return isFixed ? 'fixed' : 'auto';
    },
} as TableAdapterExt<Data>;

const { foundation } = useFoundation(TableFoundation, adapter);

// Computed
const wrapperCls = computed(() =>
    classnames(
        props.className,
        `${prefixCls.value}-wrapper`,
        `${prefixCls.value}-wrapper-${props.direction || 'undefined'}`
    )
);

const wrapperStyle = computed<CSSProperties>(() => {
    const style: CSSProperties = {};
    // 当有 scroll.x 时，确保 wrapper 不会超出父容器
    // 注意：不要设置 overflowX: hidden，这会阻止横向滚动条显示
    // 只需要限制宽度即可，滚动条应该在 table-container 内的 body 中
    if (props.scroll?.x) {
        // 确保 wrapper 宽度不超过 100%，防止表格超出容器
        style.maxWidth = '100%';
        style.width = '100%';
    }
    return { ...props.style, ...style };
});

const useFixedHeader = computed(() => {
    return Boolean(props.scroll?.y || props.sticky);
});

const wrapCls = computed(() => {
    const y = props.scroll?.y;
    return classnames({
        [`${prefixCls.value}-${props.size}`]: props.size,
        [`${prefixCls.value}-virtualized`]: Boolean(props.virtualized),
        [`${prefixCls.value}-bordered`]: props.bordered,
        [`${prefixCls.value}-fixed-header`]: Boolean(y),
    });
});

const tableWrapperCls = computed(() => {
    return `${prefixCls.value}-container`;
});

const tableWrapperStyle = computed<CSSProperties>(() => {
    const style: CSSProperties = {};
    // 当有 scroll.x 时，确保表格容器不会超出父容器
    // 注意：不要设置 overflowX: hidden，这会阻止横向滚动条显示
    // 只需要限制宽度即可
    if (props.scroll?.x) {
        style.maxWidth = '100%';
        style.width = '100%';
    }
    // 关键：当有 scroll.y 时，container 需要成为滚动上下文
    // 但实际滚动发生在 body 内，所以这里不设置 overflow
    // 表头的 sticky 定位需要相对于 container，但由于滚动在 body 内，我们需要特殊处理
    return style;
});

const computedTableLayout = computed(() => {
    if (props.tableLayout) {
        return props.tableLayout;
    }
    return anyColumnFixed.value ? 'fixed' : 'auto';
});

const tableCls = computed(() => {
    return classnames(prefixCls.value, {
        [`${prefixCls.value}-fixed`]: computedTableLayout.value === 'fixed',
    });
});

const headerCls = computed(() => {
    const hasSticky = Boolean(props.sticky);
    return classnames(`${prefixCls.value}-header`, {
        [`${prefixCls.value}-header-sticky`]: hasSticky,
        [`${prefixCls.value}-header-hidden`]: !showHeader.value,
    });
});

const headerTableStyle = computed<CSSProperties>(() => {
    const style: CSSProperties = {};
    const x = props.scroll?.x;
    if (x) {
        style.width = typeof x === 'number' ? `${x}px` : x;
    }
    return style;
});

const bodyTableStyle = computed<CSSProperties>(() => {
    const style: CSSProperties = {};
    const x = props.scroll?.x;
    if (x) {
        style.width = typeof x === 'number' ? `${x}px` : x;
    }
    return style;
});

const getHeaderStyle = (): CSSProperties => {
    const style: CSSProperties = {};
    (style as any).scrollbarGutter = 'stable';
    if (props.scroll?.y) {
        style.overflowY = 'scroll';
    }

    // 关键：当有固定列时，表头容器不能设置 overflow: hidden（CSS 默认值）
    // 因为这会阻止表头内固定列的 position: sticky 正常工作
    // 但是，CSS 中已经设置了 overflow: hidden，所以我们需要覆盖它
    // 当有固定列时，表头容器应该允许 overflow，以便固定列能正常工作
    if (anyColumnFixed.value && props.scroll?.y) {
        // 当有固定列和 scroll.y 时，表头容器需要允许 overflow
        // 但为了隐藏滚动条，我们只设置 overflowX: hidden（如果有横向滚动，由 bodyHasScrollBar 处理）
        // 注意：不能设置 overflow: hidden，这会阻止固定列的 sticky 定位
        if (!state.value.bodyHasScrollBar) {
            // 当没有滚动条时，允许 overflow（但不能是 hidden，因为会阻止 sticky）
            style.overflow = 'visible';
        }
        // 当有滚动条时，overflowY 已经设置为 'scroll'，不需要额外设置
    }

    // 当有 sticky 时，设置 top 值
    // 根据 React 版本的 HeadTable.tsx:99-102
    if (props.sticky) {
        const stickyTop = typeof props.sticky === 'object' ? props.sticky.top : 0;
        if (typeof stickyTop === 'number') {
            style.top = stickyTop;
        }
    }

    return style;
};

const getBodyStyle = (): CSSProperties => {
    const style: CSSProperties = {};
    const x = props.scroll?.x;
    const y = props.scroll?.y;

    // 固定滚动条占位，避免首次滚动时布局“挤一下”导致 fixed 抖动
    (style as any).scrollbarGutter = 'stable';

    if (y) {
        style.maxHeight = typeof y === 'number' ? `${y}px` : y;
    }

    // 当有固定列且有数据时，使用 auto 而不是单独的 overflowX/overflowY（与 React 版本一致）
    // 注意：React 版本使用 size(dataSource)，这里使用 props.dataSource 而不是 sortedData
    const dataSource = props.dataSource || [];
    const hasData = dataSource.length > 0;
    if (anyColumnFixed.value && hasData) {
        if (!props.virtualized) {
            style.overflow = 'auto';
            style.WebkitTransform = 'translate3d (0, 0, 0)';
            if (y) {
                style.overflowY = 'scroll';
            }
        }
    } else {
        if (!props.virtualized) {
            if (y) {
                style.overflowY = 'auto';
            }
            if (x) {
                style.overflowX = 'auto';
                style.width = '100%';
            }
        }
    }

    if (x && !anyColumnFixed.value) {
        style.width = '100%';
    }

    return style;
};

const showHeader = computed(() => props.showHeader !== false);

const normalizeSelectionColumn = (): ColumnProps | null => {
    const { rowSelection } = props;
    if (!rowSelection || (typeof rowSelection === 'object' && rowSelection.hidden)) {
        return null;
    }

    const rowSelectionObj = typeof rowSelection === 'object' ? rowSelection : {};
    const column: ColumnProps = {
        key: strings.DEFAULT_KEY_COLUMN_SELECTION,
        width: numbers.DEFAULT_WIDTH_COLUMN_SELECTION,
        fixed: rowSelectionObj.fixed,
        className: classnames(`${prefixCls.value}-column-selection`, rowSelectionObj.className),
        title: 'selection',
        render: () => 'selection',
    };

    return column;
};

const normalizeExpandColumn = (): ColumnProps | null => {
    if (!props.expandedRowRender || props.hideExpandedColumn !== false) {
        return null;
    }
    const column: ColumnProps = {
        key: strings.DEFAULT_KEY_COLUMN_EXPAND,
        width: numbers.DEFAULT_WIDTH_COLUMN_EXPAND,
        fixed: props.expandCellFixed,
        className: classnames(`${prefixCls.value}-column-expand`),
        title: '',
        // TableCell 会通过 isExpandedColumn(column) + renderExpandIcon 负责渲染展开按钮
        // 这里保持为空，避免误渲染
        render: () => null,
    };
    return column;
};

// 注意：Semi 的 assignColumnKeys 会对列对象做原地写入（补全 key）。
// 在 Vue 中如果直接使用 props.columns 的引用，会触发 deep watch 以及潜在的递归更新。
// 因此这里先递归 clone 一份 columns，再进行后续处理，避免修改 props。
const cloneColumns = (cols: ColumnProps[] = []): ColumnProps[] => {
    if (!Array.isArray(cols)) {
        return [];
    }
    return cols.map((col) => {
        if (!col || typeof col !== 'object') {
            return col;
        }
        const { children, ...rest } = col as any;
        const next: any = { ...rest };
        if (Array.isArray(children)) {
            next.children = cloneColumns(children);
        }
        return next as ColumnProps;
    });
};

// 第一步：展平和克隆列
const rawFlattenColumns = computed(() => {
    if (props.columns && props.columns.length > 0) {
        // 先展平嵌套的列（处理 children），然后克隆
        const flattened = flattenColumnsUtil(props.columns);
        return cloneColumns(flattened);
    }
    return [];
});

// 第二步：添加选择和展开列
const columnsWithSelectionAndExpand = computed(() => {
    const columns: ColumnProps[] = [...rawFlattenColumns.value];

    // 添加选择列
    const selectionColumn = normalizeSelectionColumn();
    if (selectionColumn) {
        const destIndex = columns.findIndex((item) => item.key === strings.DEFAULT_KEY_COLUMN_SELECTION);
        if (destIndex > -1) {
            columns[destIndex] = { ...selectionColumn, ...columns[destIndex] };
        } else if (selectionColumn.fixed === 'right') {
            columns.push(selectionColumn);
        } else {
            columns.unshift(selectionColumn);
        }
    }

    const expandColumn = normalizeExpandColumn();
    if (expandColumn) {
        const destIndex = columns.findIndex((item) => item.key === strings.DEFAULT_KEY_COLUMN_EXPAND);
        if (destIndex > -1) {
            columns[destIndex] = { ...expandColumn, ...columns[destIndex] };
        } else if (expandColumn.fixed === 'right') {
            columns.push(expandColumn);
        } else {
            // 默认插入到最前（若有 selection 列则放在 selection 后）
            const selectionIndex = columns.findIndex((item) => item.key === strings.DEFAULT_KEY_COLUMN_SELECTION);
            const insertIndex = selectionIndex > -1 ? selectionIndex + 1 : 0;
            columns.splice(insertIndex, 0, expandColumn);
        }
    }

    assignColumnKeys(columns as any[]);
    return columns;
});

// 第三步：合并 queries 中的列信息（包括宽度），用于支持列宽调整
const mergedColumnsWithQueries = computed(() => {
    const queries = state.value.queries;
    return columnsWithSelectionAndExpand.value.map((column) => {
        const queryColumn = queries.find(
            (q) => (q.key && q.key === column.key) || (q.dataIndex && q.dataIndex === column.dataIndex)
        );
        if (queryColumn) {
            // 合并 queries 中的属性（包括 width、sortOrder 等）
            // 但是 filteredValue 优先使用 column 中的值（如果 column 中有定义），以支持自定义表头筛选
            const { filteredValue: queryFilteredValue, ...restQueryColumn } = queryColumn;
            const merged = { ...column, ...restQueryColumn };
            // 如果 column 中明确指定了 filteredValue，优先使用 column 中的值
            if (column.filteredValue !== undefined) {
                merged.filteredValue = column.filteredValue;
            } else if (queryFilteredValue !== undefined) {
                merged.filteredValue = queryFilteredValue;
            }
            return merged;
        }
        return column;
    });
});

// 第四步：处理排序、筛选、resizable 等逻辑
const flattenColumns = computed(() => {
    return mergedColumnsWithQueries.value.map((column) => {
        const hasSorter = Boolean(column.sorter);
        const hasFilter = Boolean(column.onFilter || column.filters);
        const useFullRender = column.useFullRender === true;
        const clickColumnToSorter = hasSorter && !hasFilter && !useFullRender;

        // 处理 resizable：当 Table 的 resizable prop 为 true 时，应用到所有有 width 的列
        let processedColumn = { ...column };

        // 如果 useFullRender 为 true，处理 title 函数，传递 selection、sorter、filter
        // 注意：需要返回一个函数，在每次渲染时调用，以便 selection 等能够响应状态变化
        if (useFullRender && typeof column.title === 'function') {
            const rawTitle = column.title;
            // 返回一个函数，在每次渲染时调用 rawTitle 并传递最新的 titleMap
            processedColumn = {
                ...processedColumn,
                title: () => {
                    const titleMap: any = {};
                    if (props.rowSelection) {
                        // 每次渲染时重新创建 selection，确保响应状态变化
                        titleMap.selection = renderSelection(undefined, true);
                    }
                    // sorter 和 filter 会在 TableHeaderRow 中处理
                    return rawTitle(titleMap);
                },
            };
        }
        const tableResizable =
            props.resizable === true || (typeof props.resizable === 'object' && props.resizable !== null);

        // 将列的 resize 属性映射到 resizable（为了兼容性）
        if ('resize' in column) {
            processedColumn.resizable = column.resize;
        }

        // 如果 Table 的 resizable 为 true，且列有 width，则默认启用可伸缩（除非列明确设置了 resize: false）
        if (tableResizable && typeof column.width === 'number') {
            // 如果列没有明确设置 resize/resizable 属性，则启用可伸缩
            if (!('resize' in column) && !('resizable' in column)) {
                processedColumn.resizable = true;
            }
            // 如果列明确设置了 resize: false 或 resizable: false，则不启用（已经在上面处理了）
        }

        if (clickColumnToSorter) {
            return {
                ...processedColumn,
                clickToSort: (e: MouseEvent) => {
                    e.stopPropagation();
                    if (sortingInTick) {
                        return;
                    }
                    sortingInTick = true;
                    queueMicrotask(releaseGuards);
                    foundation.handleSort(column, e, true);
                },
                mouseDown: (e: MouseEvent) => {
                    foundation.handleMouseDown(e);
                },
            };
        }

        return processedColumn;
    });
});

const anyColumnFixed = computed(() => {
    const result = flattenColumns.value.some(
        (col) => col.fixed === true || col.fixed === 'left' || col.fixed === 'right'
    );
    return result;
});

const virtualizedOnScroll = computed(() => {
    return typeof props.virtualized === 'object' ? props.virtualized.onScroll : undefined;
});

// 提供 TableContext
// 注意：renderSelection 会在后面定义，所以使用 getter 来延迟访问
const tableContext = {
    direction: (props.direction || 'ltr') as any,
    headWidths: computed(() => state.value.headWidths),
    tableWidth: computed(() => state.value.tableWidth),
    anyColumnFixed,
    flattenedColumns: computed(() => flattenColumns.value),
    setHeadWidths: adapter.setHeadWidths,
    getHeadWidths: adapter.getHeadWidths,
    getCellWidths: adapter.getCellWidths,
    getQuery: (dataIndex: string | number) => foundation.getQuery(dataIndex as string),
    isSortOrderValid: (sortOrder: any) => foundation.isSortOrderValid(sortOrder),
    get renderSelection() {
        // 延迟访问 renderSelection，在它定义后返回
        return renderSelection;
    },
};

provideTableContext(tableContext);

const selectedRowKeysSet = computed<Set<string | number>>(() => {
    if (props.rowSelection) {
        const rowSelection = typeof props.rowSelection === 'object' ? props.rowSelection : {};
        const selectedRowKeys = (rowSelection.selectedRowKeys || []) as (string | number)[];
        return new Set(selectedRowKeys);
    }
    return new Set<string | number>();
});

const mergedPagination = computed(() => {
    const pagination = props.pagination;
    // 如果 pagination 是 undefined，默认使用 true（显示分页）
    if (pagination === undefined || pagination === true) {
        return {
            currentPage: 1,
            pageSize: 10,
            ...(state.value.pagination || {}),
        };
    }
    if (pagination === false) {
        return false;
    }
    if (typeof pagination === 'object') {
        // 优先使用用户传入的值，然后合并 state 中的值（但不覆盖用户的值）
        return {
            currentPage: 1,
            pageSize: 10,
            ...(state.value.pagination || {}),
            ...pagination, // 用户传入的值优先级最高
        };
    }
    return state.value.pagination || { currentPage: 1, pageSize: 10 };
});

// 获取记录的 key（需要在 watch 之前定义）
const getRecordKey = (record: Data, index: number): string | number => {
    if (props.rowKey) {
        if (typeof props.rowKey === 'function') {
            return props.rowKey(record);
        }
        return get(record, props.rowKey, index);
    }
    return get(record, 'key', index);
};

// 分组数据处理（使用 watch 而不是 computed，因为需要副作用）
watch(
    () => [props.dataSource, props.groupBy],
    () => {
        const dataSource = props.dataSource || [];

        // 如果设置了 groupBy，进行分组
        const groupBy = props.groupBy;
        if (groupBy) {
            // 支持字符串、数字或函数类型
            let groupByFn: (record: Data) => string | number;
            if (typeof groupBy === 'function') {
                groupByFn = groupBy;
            } else if (typeof groupBy === 'string' || typeof groupBy === 'number') {
                // 字符串或数字类型：作为 dataIndex 使用
                groupByFn = (record: Data) => get(record, groupBy as string, '');
            } else {
                state.value.groups = null;
                state.value.groupKeys = [];
                return;
            }

            // 统一数据结构：使用 Map<string | number, Data[]> 与 React 版本保持一致
            const groups = new Map<string | number, Data[]>();
            const groupKeys: (string | number)[] = [];

            dataSource.forEach((record, _index) => {
                const groupKey = groupByFn(record);

                if (!groups.has(groupKey)) {
                    groups.set(groupKey, []);
                    groupKeys.push(groupKey);
                }

                groups.get(groupKey)!.push(record);
            });

            state.value.groups = groups;
            state.value.groupKeys = groupKeys;

            // 处理 defaultExpandAllGroupRows 和 expandAllGroupRows
            if (props.defaultExpandAllGroupRows || props.expandAllGroupRows) {
                const newExpandedRowKeys = [...state.value.expandedRowKeys];
                groupKeys.forEach((groupKey) => {
                    if (!newExpandedRowKeys.includes(groupKey)) {
                        newExpandedRowKeys.push(groupKey);
                    }
                });
                state.value.expandedRowKeys = newExpandedRowKeys;
            }
        } else {
            state.value.groups = null;
            state.value.groupKeys = [];
        }

        // 处理树形数据的 defaultExpandAllRows 和 expandAllRows
        // 使用 foundation 的 initExpandedRowKeys 方法，与 React 版本保持一致
        // 需要在 nextTick 中调用，确保 foundation 已经初始化
        if (
            props.defaultExpandAllRows ||
            props.expandAllRows ||
            props.defaultExpandAllGroupRows ||
            props.expandAllGroupRows
        ) {
            nextTick(() => {
                foundation.initExpandedRowKeys({ groups: state.value.groups });
            });
        }
    },
    { immediate: true }
);

// 监听 expandAllGroupRows 和 expandAllRows 的变化（defaultExpandAllGroupRows 和 defaultExpandAllRows 只在初始化时生效）
watch([() => props.expandAllGroupRows, () => props.expandAllRows], () => {
    if (props.expandAllGroupRows || props.expandAllRows) {
        nextTick(() => {
            foundation.initExpandedRowKeys({ groups: state.value.groups });
        });
    }
});

const groupedData = computed(() => {
    const dataSource = props.dataSource || [];

    // 如果设置了 groupBy，使用已计算的分组
    if (props.groupBy && state.value.groups) {
        // 返回分组后的数据
        const grouped: Array<{ type: 'section' | 'data'; groupKey?: string | number; data?: Data[] }> = [];

        state.value.groupKeys.forEach((groupKey) => {
            const groupData = (state.value.groups as Map<string | number, Data[]>).get(groupKey) || [];

            grouped.push({ type: 'section', groupKey });
            grouped.push({ type: 'data', data: groupData });
        });

        return grouped;
    }

    return dataSource;
});

const rawDataForFilterSort = computed(() => {
    return Array.isArray(groupedData.value) &&
        groupedData.value.length > 0 &&
        typeof groupedData.value[0] === 'object' &&
        'type' in groupedData.value[0]
        ? groupedData.value.filter((item: any) => item.type === 'data').flatMap((item: any) => item.data || [])
        : (groupedData.value as Data[]);
});

// 监听 columnsWithSelectionAndExpand 中 filteredValue 的变化，同步到 queries
// 这样当用户在自定义表头筛选器中直接修改 filteredValue 时，能够触发筛选
// 注意：这里监听 columnsWithSelectionAndExpand 而不是 mergedColumnsWithQueries，
// 因为 mergedColumnsWithQueries 依赖于 queries，可能导致循环依赖
// 性能优化：只提取有 filteredValue 和 onFilter 的列，避免不必要的遍历和深度比较
watch(
    () => {
        const columns = columnsWithSelectionAndExpand.value;
        if (!columns || columns.length === 0) {
            return null;
        }
        // 只提取有 onFilter 的列，减少不必要的处理
        const filterColumns = columns
            .filter((col) => {
                const dataIndex = col.dataIndex || col.key;
                return dataIndex && col.onFilter;
            })
            .map((col) => {
                const dataIndex = col.dataIndex || col.key;
                const filteredValue = col.filteredValue;
                // 只提取必要信息，避免创建大对象
                return {
                    dataIndex: dataIndex as string,
                    // 对于数组，使用 JSON.stringify 进行浅比较（比 isEqual 快）
                    // 对于非数组，直接使用值
                    filteredValueKey: Array.isArray(filteredValue)
                        ? `${dataIndex}:${filteredValue.length}:${filteredValue.join(',')}`
                        : filteredValue,
                    filteredValue,
                    onFilter: col.onFilter,
                };
            });
        return filterColumns.length > 0 ? filterColumns : null;
    },
    (columnFilters, oldColumnFilters) => {
        if (!columnFilters || columnFilters.length === 0) {
            return;
        }
        // 如果旧值存在且长度相同，可以快速比较
        if (oldColumnFilters && oldColumnFilters.length === columnFilters.length) {
            let hasChange = false;
            for (let i = 0; i < columnFilters.length; i++) {
                if (columnFilters[i].filteredValueKey !== oldColumnFilters[i]?.filteredValueKey) {
                    hasChange = true;
                    break;
                }
            }
            if (!hasChange) {
                return; // 没有变化，直接返回
            }
        }
        // 有变化时才进行详细比较和更新
        columnFilters.forEach((columnFilter) => {
            const { dataIndex, filteredValue: columnFilteredValue, onFilter } = columnFilter;
            if (!dataIndex || !onFilter || columnFilteredValue === undefined) {
                return;
            }
            const curQuery = foundation.getQuery(dataIndex);
            const queryFilteredValue = get(curQuery, 'filteredValue');
            // 快速比较：先比较引用，再比较值
            if (columnFilteredValue !== queryFilteredValue && !isEqual(columnFilteredValue, queryFilteredValue)) {
                adapter.setQuery({
                    dataIndex,
                    key: undefined, // 使用 dataIndex 作为 key
                    filteredValue: Array.isArray(columnFilteredValue) ? columnFilteredValue : [],
                    onFilter: onFilter,
                });
            }
        });
    },
    { flush: 'post' }
);

// 注意：排序/筛选属于"带副作用的计算"（foundation 内部可能会写缓存/状态）。
// 不能放在 computed 里，否则会造成"render -> computed -> 写响应式 -> render..."的递归更新。
watch(
    [() => state.value.queries, () => rawDataForFilterSort.value],
    ([queries, dataSource]) => {
        // 无查询 / 无 foundation：直接回退到原始数据
        if (!foundation || !queries || queries.length === 0) {
            if (state.value.cachedFilteredSortedDataSource !== dataSource) {
                adapter.setCachedFilteredSortedDataSource(dataSource);
            }
            return;
        }

        try {
            const nextDataSource = foundation.getFilteredSortedDataSource(dataSource, queries);
            // 避免无意义写入触发更新
            if (!isEqual(nextDataSource, state.value.cachedFilteredSortedDataSource)) {
                adapter.setCachedFilteredSortedDataSource(nextDataSource);
            }
        } catch (e) {
            console.warn('Table sorting error:', e);
            // 出错时也回退到原始数据
            if (state.value.cachedFilteredSortedDataSource !== dataSource) {
                adapter.setCachedFilteredSortedDataSource(dataSource);
            }
        }
    },
    { immediate: true }
);

const sortedData = computed(() => {
    return state.value.cachedFilteredSortedDataSource || rawDataForFilterSort.value;
});

const pageData = computed(() => {
    const dataSource = sortedData.value;
    const pagination = mergedPagination.value;

    const propPagination = props.pagination;
    const isControlled = propPagination && typeof propPagination === 'object' && propPagination.currentPage != null;

    if (pagination && typeof pagination === 'object' && pagination !== false && !isControlled) {
        const currentPage = pagination.currentPage || 1;
        const pageSize = pagination.pageSize || 10;
        const start = (currentPage - 1) * pageSize;
        const end = start + pageSize;
        return dataSource.slice(start, end);
    }

    return dataSource;
});

const displayData = computed(() => {
    // 如果有分组，需要将分组行和数据行合并
    if (props.groupBy && state.value.groups) {
        // 获取排序和筛选后的数据，如果为空或未初始化则使用原始数据源
        const sortedFilteredData =
            state.value.cachedFilteredSortedDataSource && state.value.cachedFilteredSortedDataSource.length > 0
                ? state.value.cachedFilteredSortedDataSource
                : props.dataSource || [];

        // 重新组织分组数据（基于排序和筛选后的数据）
        const result: any[] = [];
        const groupKeys = state.value.groupKeys || [];

        // 创建一个 Map 来快速查找 record 对应的 key
        const recordKeyMap = new Map<Data, string | number>();
        const allKeys = new Set<string | number>();
        sortedFilteredData.forEach((record) => {
            // 使用 record 本身来获取 key，不依赖索引
            const key = props.rowKey
                ? typeof props.rowKey === 'function'
                    ? props.rowKey(record)
                    : get(record, props.rowKey, '')
                : get(record, 'key', '');
            if (key != null && key !== '') {
                recordKeyMap.set(record, key);
                allKeys.add(key);
            }
        });

        groupKeys.forEach((groupKey) => {
            const groupRecords = (state.value.groups as Map<string | number, Data[]>).get(groupKey);
            if (!Array.isArray(groupRecords) || groupRecords.length === 0) {
                return;
            }

            // 创建 groupRecords 的 key Set 用于快速查找
            const groupKeySet = new Set<string | number>();
            if (Array.isArray(groupRecords)) {
                groupRecords.forEach((record) => {
                    const key = props.rowKey
                        ? typeof props.rowKey === 'function'
                            ? props.rowKey(record)
                            : get(record, props.rowKey, '')
                        : get(record, 'key', '');
                    if (key != null && key !== '') {
                        groupKeySet.add(key);
                    }
                });
            }

            // 获取该分组中在排序和筛选后数据中的记录
            // 如果 sortedFilteredData 为空，直接使用 groupRecords
            let groupData: Data[] = [];

            // 如果 groupKeySet 为空（说明无法从 groupRecords 中提取 key），直接使用 groupRecords
            if (groupKeySet.size === 0) {
                // 确保 groupRecords 中的所有项都是对象
                groupData = groupRecords.filter((item) => item && typeof item === 'object' && !Array.isArray(item));
            } else if (sortedFilteredData.length > 0) {
                // 从 sortedFilteredData 中筛选出属于该分组的记录
                groupData = sortedFilteredData.filter((record) => {
                    // 先尝试从 recordKeyMap 获取 key
                    let key = recordKeyMap.get(record);
                    if (key == null || key === '') {
                        // 如果 recordKeyMap 中没有，直接计算 key
                        key = props.rowKey
                            ? typeof props.rowKey === 'function'
                                ? props.rowKey(record)
                                : get(record, props.rowKey, '')
                            : get(record, 'key', '');
                    }
                    return key != null && key !== '' && groupKeySet.has(key);
                });

                // 如果通过 key 匹配失败，直接使用 groupRecords
                if (groupData.length === 0 && groupRecords.length > 0) {
                    // 确保 groupRecords 中的所有项都是对象
                    groupData = groupRecords.filter((item) => item && typeof item === 'object' && !Array.isArray(item));
                }
            } else {
                // 如果 sortedFilteredData 为空，直接使用 groupRecords
                // 确保 groupRecords 中的所有项都是对象
                groupData = groupRecords.filter((item) => item && typeof item === 'object' && !Array.isArray(item));
            }

            // 只要分组在原始数据中存在，就添加分组行（即使排序筛选后没有数据）
            // 分组行应该总是显示，数据行根据展开状态和是否有匹配数据来决定
            result.push({ __semiTableGroupSection: true, groupKey });
            // 只有当分组展开且有匹配的数据时才添加数据行
            if (isGroupExpanded(groupKey) && groupData.length > 0) {
                result.push(...groupData);
            }
        });

        // 应用分页（如果有）
        const pagination = mergedPagination.value;
        const propPagination = props.pagination;
        const isControlled = propPagination && typeof propPagination === 'object' && propPagination.currentPage != null;

        if (pagination && typeof pagination === 'object' && pagination !== false && !isControlled) {
            // 分页时需要保持分组行的位置（简化处理：暂时不分页）
            return result;
        }

        return result;
    }

    if (!isTreeTable.value) {
        return pageData.value;
    }

    const ds = props.dataSource || [];
    const flat: any[] = [];
    const walk = (list: any[], level: number) => {
        list.forEach((item, idx) => {
            if (!item) {
                return;
            }
            // 为树形行注入 level（不改动原对象引用，避免影响用户数据）
            const row = { ...(item as any), __semiTableTreeLevel: level };
            flat.push(row);

            const key = getRecordKey(item, idx);
            const expanded = state.value.expandedRowKeys.includes(key);
            if (expanded && hasTreeChildren(item)) {
                walk((item as any)[childrenRecordName.value], level + 1);
            }
        });
    };
    walk(ds as any[], 0);
    return flat;
});

const showPagination = computed(() => {
    return props.pagination !== false && mergedPagination.value !== false;
});

const memoizedPagination = computed(() => {
    if (!mergedPagination.value || typeof mergedPagination.value !== 'object') {
        return null;
    }
    const result = foundation.memoizedPagination(mergedPagination.value);
    return result;
});

const paginationProps = computed(() => {
    const pagination = memoizedPagination.value;
    if (!pagination) {
        return null;
    }
    // 从 mergedPagination 中获取原始 total，确保用户传入的 total 不会被覆盖
    const originalPagination = mergedPagination.value;
    let total: number;
    if (originalPagination && typeof originalPagination === 'object' && originalPagination.total !== undefined) {
        total = originalPagination.total;
    } else if (pagination.total !== undefined) {
        total = pagination.total;
    } else {
        total = (props.dataSource || []).length;
    }

    // 从原始 props.pagination 中获取回调函数
    const originalPaginationObj = props.pagination && typeof props.pagination === 'object' ? props.pagination : null;

    return {
        currentPage: pagination.currentPage || 1,
        pageSize: pagination.pageSize || 10,
        total,
        onPageChange: (page: number) => {
            adapter.setCurrentPage(page);
            if (originalPaginationObj && typeof originalPaginationObj.onPageChange === 'function') {
                originalPaginationObj.onPageChange(page, pagination.pageSize || 10);
            }
        },
        onPageSizeChange: (pageSize: number) => {
            adapter.setPagination({ ...pagination, pageSize, currentPage: 1 });
            if (originalPaginationObj && typeof originalPaginationObj.onPageSizeChange === 'function') {
                originalPaginationObj.onPageSizeChange(pageSize, 1);
            }
        },
    };
});

const renderPagination = computed(() => {
    if (props.renderPagination) {
        return () => props.renderPagination(memoizedPagination.value as TablePaginationProps);
    }
    return null;
});

const getPaginationInfo = (locale?: any) => {
    if (!memoizedPagination.value) {
        return '';
    }
    return foundation.formatPaginationInfo(memoizedPagination.value, locale?.pageText || '');
};

const paginationPosition = computed(() => {
    const pagination = mergedPagination.value;
    if (pagination && typeof pagination === 'object') {
        return pagination.position || 'bottom';
    }
    return 'bottom';
});

// Methods
const getColumnStyle = (column: ColumnProps) => {
    const style: { width?: string; minWidth?: string } = {};
    if (column.width) {
        const width = typeof column.width === 'number' ? `${column.width}px` : column.width;
        style.width = width;
        style.minWidth = width;
    }
    return style;
};

// 获取列的插槽名称（用于作用域插槽）
const getColumnSlotName = (column: ColumnProps): string | null => {
    // 优先使用 key，其次使用 dataIndex
    if (column.key) {
        return String(column.key);
    }
    if (column.dataIndex) {
        return String(column.dataIndex);
    }
    return null;
};

// 获取列的值
const getColumnValue = (record: Data, column: ColumnProps): any => {
    if (column.dataIndex) {
        return get(record, column.dataIndex, '');
    }
    return record;
};

const getRowClass = (record: Data, index: number) => {
    const customRowProps = props.onRow ? props.onRow(record, index) : {};
    const key = getRecordKey(record, index);
    // 确保返回一个字符串，避免初始化时 className 不生效
    const baseClass = classnames(
        `${prefixCls.value}-row`,
        {
            [`${prefixCls.value}-row-selected`]: isRowSelected(record),
            [`${prefixCls.value}-row-expanded`]: isRowExpanded(record),
            [`${prefixCls.value}-row-disabled`]: isRowDisabled(record),
            [`${prefixCls.value}-row-hover`]: state.value.hoveredRowKey === key,
        },
        customRowProps.className
    );
    return baseClass || '';
};

const getRowStyle = (record: Data, index: number): CSSProperties => {
    const customRowProps = props.onRow ? props.onRow(record, index) : {};
    // 确保返回一个响应式对象，避免初始化时样式不生效
    if (customRowProps && customRowProps.style) {
        return { ...customRowProps.style };
    }
    return {};
};

const getRowProps = (record: Data, index: number) => {
    const customRowProps = props.onRow ? props.onRow(record, index) : {};
    if (!customRowProps || typeof customRowProps !== 'object') {
        return {};
    }
    // class/style 已由 getRowClass/getRowStyle 处理；事件由各 handler 兜底触发，其他原生属性透传到 tr
    const {
        className: _className,
        style: _style,
        onClick: _onClick,
        onDoubleClick: _onDoubleClick,
        onMouseEnter: _onMouseEnter,
        onMouseLeave: _onMouseLeave,
        ...rest
    } = customRowProps as any;
    // 这些变量仅用于从对象中排除，不需要使用
    void _className;
    void _style;
    void _onClick;
    void _onDoubleClick;
    void _onMouseEnter;
    void _onMouseLeave;
    return rest;
};

// 获取分组行的属性
const getGroupedRowProps = (groupKey: string | number | undefined, index: number) => {
    if (!props.onGroupedRow) {
        return {};
    }
    // 构造分组 record 对象（与 React 版本一致）
    const groupRecordsFromMap = state.value.groups
        ? (state.value.groups as Map<string | number, Data[]>).get(groupKey!)
        : null;
    // 直接使用 groupRecordsFromMap，因为数据结构已经统一为 Map<string | number, Data[]>
    const groupRecord = { groupKey, records: groupRecordsFromMap || [] } as any;
    const customProps = props.onGroupedRow(groupRecord, index);
    if (!customProps || typeof customProps !== 'object') {
        return {};
    }
    const { ...rest } = customProps as any;
    return rest;
};

const handleGroupRowExpanded = (expanded: boolean, groupKey: string | number, e: MouseEvent) => {
    if (!props.clickGroupedRowToExpand) {
        return;
    }

    const groupRecordsFromMap = state.value.groups
        ? (state.value.groups as Map<string | number, Data[]>).get(groupKey)
        : null;

    if (!groupRecordsFromMap || groupRecordsFromMap.length === 0) {
        return;
    }

    const newExpanded = expanded;

    if (newExpanded) {
        // 展开：添加 groupKey 到 expandedRowKeys（分组行的展开状态）
        if (!state.value.expandedRowKeys.includes(groupKey)) {
            state.value.expandedRowKeys = [...state.value.expandedRowKeys, groupKey];
        }
    } else {
        // 收起：移除 groupKey
        state.value.expandedRowKeys = state.value.expandedRowKeys.filter((k) => k !== groupKey);
    }

    // 触发 onExpand 和 onExpandedRowsChange 事件（如果需要）
    if (props.onExpand) {
        // 直接使用 groups Map 中的 records，因为数据结构已经统一为 Map<string | number, Data[]>
        const groupRecordsFromMap = state.value.groups
            ? (state.value.groups as Map<string | number, Data[]>).get(groupKey)
            : null;
        const groupRecord = { groupKey, records: groupRecordsFromMap || [] } as any;
        props.onExpand(newExpanded, groupRecord, e);
    }

    if (props.onExpandedRowsChange) {
        const expandedRows = getExpandedRowsByKeys(state.value.expandedRowKeys);
        props.onExpandedRowsChange(expandedRows as any);
    }
};

const handleGroupedRowClick = (groupKey: string | number | undefined, index: number, e: MouseEvent) => {
    if (props.clickGroupedRowToExpand) {
        // 如果启用了点击分组行展开，则切换该分组的展开状态
        const groupRecordsForExpand = state.value.groups
            ? (state.value.groups as Map<string | number, Data[]>).get(groupKey!)
            : null;
        if (Array.isArray(groupRecordsForExpand) && groupRecordsForExpand.length > 0) {
            const groupKeys = groupRecordsForExpand.map((record) => getRecordKey(record, 0));
            const allExpanded = groupKeys.every((key) => state.value.expandedRowKeys.includes(key));
            if (allExpanded) {
                // 全部展开则全部收起
                state.value.expandedRowKeys = state.value.expandedRowKeys.filter((k) => !groupKeys.includes(k));
            } else {
                // 否则全部展开
                const newExpandedKeys = [...state.value.expandedRowKeys];
                groupKeys.forEach((key) => {
                    if (!newExpandedKeys.includes(key)) {
                        newExpandedKeys.push(key);
                    }
                });
                state.value.expandedRowKeys = newExpandedKeys;
            }
        }
    }

    if (props.onGroupedRow) {
        // 直接使用 groups Map 中的 records，因为数据结构已经统一为 Map<string | number, Data[]>
        const groupRecordsFromMap = state.value.groups
            ? (state.value.groups as Map<string | number, Data[]>).get(groupKey!)
            : null;
        const groupRecord = { groupKey, records: groupRecordsFromMap || [] } as any;
        const customProps = props.onGroupedRow(groupRecord, index);
        if (customProps && typeof customProps === 'object' && customProps.onClick) {
            customProps.onClick(e);
        }
    }
};

// 渲染分组行内容
const renderGroupSection = (groupKey: string | number | undefined) => {
    if (!props.renderGroupSection) {
        return h('span', {}, String(groupKey || ''));
    }
    // 获取该分组的所有 row keys
    const groupRecords = state.value.groups
        ? (state.value.groups as Map<string | number, Data[]>).get(groupKey!)
        : null;
    // 从 groupRecords 中提取 rowKeys，确保 groupRecords 是数组
    const groupRowKeys =
        Array.isArray(groupRecords) && groupRecords.length > 0
            ? groupRecords.map((record) => getRecordKey(record, 0))
            : [];

    const result = props.renderGroupSection(groupKey, groupRowKeys);
    // 如果返回的是对象（包含 children），则返回 children，否则直接返回
    if (result && typeof result === 'object' && 'children' in result) {
        return result.children;
    }
    return result;
};

// 定义 isRowDisabled 函数（需要在 useTableSelection 之前定义）
const isRowDisabled = (record: Data): boolean => {
    const key = getRecordKey(record, 0);
    return state.value.disabledRowKeysSet.has(key);
};

// 使用 composable 处理选择逻辑
const { isRowSelected, getRowSelectionProps, titleSelectionProps, renderSelection } = useTableSelection({
    rowSelection: props.rowSelection,
    pageData,
    dataSource: computed(() => props.dataSource || []),
    state,
    adapter,
    getRecordKey,
    isRowDisabled,
    childrenRecordName: props.childrenRecordName,
});

const isRowExpanded = (record: Data): boolean => {
    const key = getRecordKey(record, 0);
    return state.value.expandedRowKeys.includes(key);
};

const isGroupExpanded = (groupKey: string | number | undefined): boolean => {
    if (groupKey == null) {
        return false;
    }
    // React 版本使用 isExpanded(expandedRowKeys, groupKey)，直接检查 groupKey 是否在 expandedRowKeys 中
    return state.value.expandedRowKeys.includes(groupKey);
};

// 渲染分组行的展开图标
const renderGroupExpandIcon = (groupKey: string | number | undefined) => {
    if (props.expandIcon === false) {
        return null;
    }
    const expanded = isGroupExpanded(groupKey);
    // 如果有自定义的 renderExpandIcon，使用它（传递 groupKey 作为第三个参数）
    if (typeof props.renderExpandIcon === 'function') {
        const result = props.renderExpandIcon({ groupKey } as any, false, groupKey);
        if (result) {
            return result;
        }
    }
    return h(CustomExpandIcon, {
        expanded,
        componentType: 'expand',
        expandIcon: props.expandIcon,
        prefixCls: prefixCls.value,
        onClick: (nextExpand: boolean, e: MouseEvent) => handleGroupExpandClick(groupKey, e),
    });
};

const handleGroupExpandClick = (groupKey: string | number | undefined, e: MouseEvent) => {
    if (groupKey == null) {
        return;
    }
    const expanded = isGroupExpanded(groupKey);
    const newExpanded = !expanded;

    // 更新 expandedRowKeys：直接使用 groupKey
    if (newExpanded) {
        // 展开：添加 groupKey
        if (!state.value.expandedRowKeys.includes(groupKey)) {
            state.value.expandedRowKeys = [...state.value.expandedRowKeys, groupKey];
        }
    } else {
        // 收起：移除 groupKey
        state.value.expandedRowKeys = state.value.expandedRowKeys.filter((k) => k !== groupKey);
    }

    // 触发 onExpand 和 onExpandedRowsChange 事件
    if (props.onExpand) {
        // 直接使用 groups Map 中的 records，因为数据结构已经统一为 Map<string | number, Data[]>
        const groupRecordsFromMap = state.value.groups
            ? (state.value.groups as Map<string | number, Data[]>).get(groupKey)
            : null;
        const groupRecord = { groupKey, records: groupRecordsFromMap || [] } as any;
        props.onExpand(newExpanded, groupRecord, e);
    }

    if (props.onExpandedRowsChange) {
        const expandedRows = getExpandedRowsByKeys(state.value.expandedRowKeys);
        props.onExpandedRowsChange(expandedRows as any);
    }

    adapter.notifyExpand(newExpanded, { groupKey } as any, e);
    adapter.notifyExpandedRowsChange(getExpandedRowsByKeys(state.value.expandedRowKeys) as any);
};

const handleRowClick = (record: Data, index: number, e: MouseEvent) => {
    const customRowProps = props.onRow ? props.onRow(record, index) : {};
    if (customRowProps.onClick) {
        customRowProps.onClick(e);
    }

    // 如果启用了 expandRowByClick，点击行时切换展开状态
    if (props.expandRowByClick && props.expandedRowRender) {
        const key = getRecordKey(record, index);
        toggleExpandRow(key, record, e);
    }
};

const handleRowDoubleClick = (record: Data, e: MouseEvent) => {
    const customRowProps = props.onRow ? props.onRow(record, 0) : {};
    if (customRowProps.onDoubleClick) {
        customRowProps.onDoubleClick(e);
    }
    adapter.notifyRowDoubleClick?.(record, e);
};

const handleRowMouseEnter = (record: Data, e: MouseEvent) => {
    const key = getRecordKey(record, 0);
    adapter.setHoveredRowKey(key);

    const customRowProps = props.onRow ? props.onRow(record, 0) : {};
    if (customRowProps.onMouseEnter) {
        customRowProps.onMouseEnter(e);
    }
    adapter.notifyRowMouseEnter?.(record, e);
};

const handleRowMouseLeave = (record: Data, e: MouseEvent) => {
    adapter.setHoveredRowKey(null);

    const customRowProps = props.onRow ? props.onRow(record, 0) : {};
    if (customRowProps.onMouseLeave) {
        customRowProps.onMouseLeave(e);
    }
    adapter.notifyRowMouseLeave?.(record, e);
};

const handleSorterClick = (column: ColumnProps, e: MouseEvent) => {
    if (!column.sorter) {
        return;
    }
    e.stopPropagation();
    if (sortingInTick) {
        return;
    }
    sortingInTick = true;
    queueMicrotask(releaseGuards);
    foundation.handleSort(column, e);
};

const handleFilterSelect = (column: ColumnProps, data: any) => {
    const dataIndex = column.dataIndex || column.key;
    if (dataIndex) {
        foundation.handleFilterSelect(dataIndex as string, data);
    }
};

const handleFilterDropdownVisibleChange = (column: ColumnProps, visible: boolean) => {
    if (column.onFilterDropdownVisibleChange) {
        column.onFilterDropdownVisibleChange(visible);
    }
    adapter.notifyFilterDropdownVisibleChange(visible, column.dataIndex || '');
};

const getFixedLeftOffset = (column: ColumnProps, colIndex: number) => {
    if (!isFixedLeft(column)) {
        return false;
    }
    const widths = adapter.getCellWidths(flattenColumns.value) || [];
    return Math.round(arrayAdd(widths, 0, colIndex));
};

const getFixedRightOffset = (column: ColumnProps, colIndex: number) => {
    if (!isFixedRight(column)) {
        return false;
    }
    const widths = adapter.getCellWidths(flattenColumns.value) || [];
    return Math.round(arrayAdd(widths, colIndex + 1));
};

// 滚动事件处理：同步表头和表体的横向滚动
// 横向滚动同步不依赖 lastScrollLeft，避免首帧不同步
let scrollPositionRafId: number | null = null;
let scrollPositionTimeoutId: number | null = null;

const applyScrollPositionClassName = (position: BodyScrollPosition) => {
    const el = wrapRef.value;
    if (!el) {
        return;
    }
    const { value: p } = prefixCls;
    const positionAll = [
        `${p}-scroll-position-both`,
        `${p}-scroll-position-middle`,
        `${p}-scroll-position-left`,
        `${p}-scroll-position-right`,
    ];
    if (position === 'both') {
        const accept = [`${p}-scroll-position-left`, `${p}-scroll-position-right`];
        el.classList.remove(...positionAll.filter((c) => !accept.includes(c)));
        el.classList.add(...accept);
        return;
    }
    const accept = [`${p}-scroll-position-${position}`];
    el.classList.remove(...positionAll.filter((c) => !accept.includes(c)));
    el.classList.add(...accept);
};

const setScrollPositionClassName = () => {
    // 虚拟滚动时使用 virtualizedBodyRef.containerRef，非虚拟滚动时使用 bodyWrapRef
    const node =
        props.virtualized && virtualizedBodyRef.value?.containerRef
            ? virtualizedBodyRef.value.containerRef
            : bodyWrapRef.value;
    if (node && node.children && node.children.length) {
        const scrollToLeft = node.scrollLeft === 0;
        // why use Math.abs? @see https://bugzilla.mozilla.org/show_bug.cgi?id=1447743
        const tableEl = node.children[0] as HTMLElement;
        const scrollToRight =
            Math.abs(node.scrollLeft) + 1 >= tableEl.getBoundingClientRect().width - node.getBoundingClientRect().width;
        if (scrollToLeft && scrollToRight) {
            applyScrollPositionClassName('both');
        } else if (scrollToLeft) {
            applyScrollPositionClassName('left');
        } else if (scrollToRight) {
            applyScrollPositionClassName('right');
        } else {
            applyScrollPositionClassName('middle');
        }
    }
};

const scheduleSetScrollPositionClassName = () => {
    if (scrollPositionRafId != null) {
        return;
    }
    scrollPositionRafId = window.requestAnimationFrame(() => {
        scrollPositionRafId = null;
        setScrollPositionClassName();
    });
};

// 在横向滚动过程中频繁读写布局容易导致 fixed sticky 首帧抖动
// 这里改成滚动停止后再更新阴影边界 class（体验上阴影会延迟几十毫秒出现，但能换来稳定的 fixed）
const scheduleSetScrollPositionClassNameAfterScrollEnd = () => {
    if (scrollPositionTimeoutId != null) {
        window.clearTimeout(scrollPositionTimeoutId);
    }
    scrollPositionTimeoutId = window.setTimeout(() => {
        scrollPositionTimeoutId = null;
        scheduleSetScrollPositionClassName();
    }, 80);
};

const handleHeaderScroll = (e: Event) => {
    const target = e.target as HTMLElement;
    if (target !== e.currentTarget) {
        return;
    }
    const nextLeft = target.scrollLeft;
    // 虚拟滚动时使用 virtualizedBodyRef.containerRef，非虚拟滚动时使用 bodyWrapRef
    const body =
        props.virtualized && virtualizedBodyRef.value?.containerRef
            ? virtualizedBodyRef.value.containerRef
            : bodyWrapRef.value;
    if (body && body.scrollLeft !== nextLeft) {
        body.scrollLeft = nextLeft;
    }
    scheduleSetScrollPositionClassNameAfterScrollEnd();
};

const handleBodyScroll = (e: Event) => {
    const target = e.target as HTMLElement;
    // 当使用虚拟滚动时，滚动事件来自 VirtualizedBody 的 containerRef
    // 此时不检查 target !== e.currentTarget
    if (!props.virtualized && target !== e.currentTarget) {
        return;
    }
    const nextLeft = target.scrollLeft;
    if (headerWrapRef.value && headerWrapRef.value.scrollLeft !== nextLeft) {
        headerWrapRef.value.scrollLeft = nextLeft;
    }
    // 不在滚动时触发布局测量，阴影边界交由 scroll-end 更新
    scheduleSetScrollPositionClassNameAfterScrollEnd();
};

let lastScrollTop = 0;
const isIE11 = () => window.navigator.userAgent.match(/Trident\/7\./);

// 获取表体滚动容器（虚拟滚动时使用 virtualizedBodyRef.containerRef，非虚拟滚动时使用 bodyWrapRef）
const getBodyScrollContainer = (): HTMLElement | null => {
    if (props.virtualized && virtualizedBodyRef.value?.containerRef) {
        return virtualizedBodyRef.value.containerRef;
    }
    return bodyWrapRef.value;
};

// 仅用于 IE11/需要 preventDefault 的场景（非 passive 监听）
const handleWheelNonPassive = (e: WheelEvent) => {
    const { scroll = {} } = props;
    const body = getBodyScrollContainer();
    // 关键：在 fixed header 模式下，优先接管横向滚动，确保 header/body 同步（避免首帧不同步造成"抖动错觉"）
    // 说明：trackpad/鼠标滚轮的横向滚动会先触发 wheel，再触发 scroll；在这里同步能避免第一帧 header 还没跟上。
    if (useFixedHeader.value && (e.deltaX !== 0 || e.shiftKey) && body) {
        // shift+wheel 通常表示横向滚动，deltaY 作为横向增量
        const dx = e.deltaX !== 0 ? e.deltaX : e.deltaY;
        const maxLeft = Math.max(0, body.scrollWidth - body.clientWidth);
        const nextLeft = Math.min(maxLeft, Math.max(0, body.scrollLeft + dx));
        // 阻止浏览器先滚 body 再异步同步 header 产生的首帧错位
        e.preventDefault();
        body.scrollLeft = nextLeft;
        scheduleSetScrollPositionClassNameAfterScrollEnd();
        return;
    }
    // 针对 IE11 的特殊处理
    if (isIE11() && scroll.y) {
        e.preventDefault();
        const wd = e.deltaY;
        const { target } = e;
        const bodyTable = body;

        let scrollTop = 0;

        if (lastScrollTop) {
            scrollTop = lastScrollTop + wd;
        } else {
            scrollTop = wd;
        }

        if (bodyTable && target !== bodyTable) {
            bodyTable.scrollTop = scrollTop;
        }
        lastScrollTop = scrollTop;
    }
};

// 默认 wheel 处理：用 passive 监听，避免 Chrome 的 non-passive 警告
// 不在这里调用 preventDefault（否则会触发 “Unable to preventDefault inside passive event listener”）
const handleWheelPassive = (_e: WheelEvent) => {
    if (!useFixedHeader.value) {
        return;
    }
    // 仅用于快速同步阴影边界 className（无需阻塞滚动）
    scheduleSetScrollPositionClassNameAfterScrollEnd();
};

let unregisterWheelListener: null | (() => void) = null;

const registerWheelListener = () => {
    // 虚拟滚动时使用 virtualizedBodyRef.containerRef，非虚拟滚动时使用 bodyWrapRef
    const body =
        props.virtualized && virtualizedBodyRef.value?.containerRef
            ? virtualizedBodyRef.value.containerRef
            : bodyWrapRef.value;
    if (!body) {
        return;
    }
    const { scroll = {} } = props;
    // IE11 需要 preventDefault 的分支，保留非 passive
    const shouldNonPassive = Boolean(isIE11() && scroll.y);
    const handler = shouldNonPassive ? handleWheelNonPassive : handleWheelPassive;
    body.addEventListener('wheel', handler, { passive: !shouldNonPassive });
    unregisterWheelListener = () => {
        body.removeEventListener('wheel', handler as any);
        unregisterWheelListener = null;
    };
};

const handleColumnResize = (column: ColumnProps, _e: { width: number }) => {
    // 更新 queries 中对应列的宽度
    const updatedQueries = state.value.queries.map((q) => {
        if ((q.key && q.key === column.key) || (q.dataIndex && q.dataIndex === column.dataIndex)) {
            return { ...q, width: _e.width };
        }
        return q;
    });

    // 如果 queries 中没有对应的列，添加一个
    const existingQuery = updatedQueries.find(
        (q) => (q.key && q.key === column.key) || (q.dataIndex && q.dataIndex === column.dataIndex)
    );
    if (!existingQuery) {
        const newQuery = {
            ...column,
            width: _e.width,
        };
        updatedQueries.push(newQuery);
    }

    // 更新查询状态
    adapter.setQueries(updatedQueries);

    // 触发 onChange 事件
    if (props.onChange) {
        const changeInfo = {
            filters: [],
            sorter: undefined,
            pagination: mergedPagination.value,
            extra: { changeType: 'resize' as const },
        };
        props.onChange(changeInfo as any);
    }
};

const toggleExpandRow = (key: string | number, record: Data, e: MouseEvent) => {
    const expandedRowKeys = [...state.value.expandedRowKeys];
    const index = expandedRowKeys.indexOf(key);

    if (index > -1) {
        expandedRowKeys.splice(index, 1);
    } else {
        expandedRowKeys.push(key);
    }

    state.value.expandedRowKeys = expandedRowKeys;

    if (props.onExpand) {
        props.onExpand(!(index > -1), record, e);
    }

    if (props.onExpandedRowsChange) {
        props.onExpandedRowsChange(getExpandedRowsByKeys(expandedRowKeys) as any);
    }

    adapter.notifyExpand(!(index > -1), record, e);
    adapter.notifyExpandedRowsChange(getExpandedRowsByKeys(expandedRowKeys) as any);
};

const getExpandIcon = (_record: Data) => {
    if (props.expandIcon) {
        return props.expandIcon;
    }
    return undefined;
};

const isRowExpandable = (record: Data) => {
    const hasExpandedRowRender = typeof props.expandedRowRender === 'function';
    const hasRowExpandable = typeof props.rowExpandable === 'function';
    const hasChildren = hasTreeChildren(record as any);
    const strictExpandableResult = hasRowExpandable && props.rowExpandable!(record);
    const looseExpandableResult = !hasRowExpandable || strictExpandableResult;

    return (
        ((hasExpandedRowRender || hasChildren) && looseExpandableResult) ||
        (!(hasExpandedRowRender || hasChildren) && strictExpandableResult)
    );
};

const renderExpandIcon = (record: Data, isNested = false) => {
    if (props.renderExpandIcon) {
        return props.renderExpandIcon(record, isNested);
    }

    if (!isRowExpandable(record)) {
        return () => null;
    }

    const key = getRecordKey(record, 0);
    const expanded = isRowExpanded(record);

    return () => {
        return h(CustomExpandIcon, {
            expanded,
            componentType: props.hideExpandedColumn || isNested ? 'tree' : 'expand',
            expandIcon: getExpandIcon(record),
            prefixCls: prefixCls.value,
            onClick: (nextExpand: boolean, e: MouseEvent) => toggleExpandRow(key, record, e),
        });
    };
};

const handleItemsRendered = (_props: {
    overscanStartIndex: number;
    overscanStopIndex: number;
    visibleStartIndex: number;
    visibleStopIndex: number;
}) => {
    // 虚拟滚动可见项变化时的处理
    // 可以用于优化渲染性能
};

// 选择相关逻辑已从 useTableSelection composable 中获取

const renderTitle = computed(() => {
    if (typeof props.title === 'function') {
        return () => props.title(pageData.value);
    }
    return () => props.title;
});

const renderFooter = computed(() => {
    if (!props.footer) {
        return null;
    }
    let footer = props.footer;
    if (typeof footer === 'function') {
        footer = footer(pageData.value);
    }
    // 检查是否是有效的 VNode 或字符串
    if (typeof footer === 'string' || isVNode(footer)) {
        return () => h('div', { class: `${prefixCls.value}-footer`, 'x-semi-prop': 'footer' }, footer);
    }
    return null;
});

// Watch
// 使用浅层监听 dataSource，只在数组引用变化时触发，减少不必要的重新计算
watch(
    () => props.dataSource,
    () => {
        if (foundation) {
            foundation.init();
        }
    },
    { immediate: false }
);

watch(
    () => props.columns,
    () => {
        // 初始化 queries 从 columns
        const queries = TableFoundation.initColumnsFilteredValueAndSorterOrder([...flattenColumns.value]);
        adapter.setQueries(queries);
        if (foundation) {
            foundation.init();
        }
    },
    { immediate: true }
    // 注意：移除 deep: true，因为 columns 数组引用变化时已经足够触发更新
    // 如果用户需要修改单个 column 对象，应该替换整个 columns 数组
);

// ResizeObserver 用于检测滚动条
let resizeObserver: ResizeObserver | null = null;

const observeBodyResize = () => {
    // 虚拟滚动时使用 virtualizedBodyRef.containerRef，非虚拟滚动时使用 bodyWrapRef
    const bodyWrapDOM =
        props.virtualized && virtualizedBodyRef.value?.containerRef
            ? virtualizedBodyRef.value.containerRef
            : bodyWrapRef.value;

    if (!bodyWrapDOM) {
        return;
    }

    const syncScrollbarState = () => {
        if (!bodyWrapDOM) {
            return;
        }
        const { offsetWidth, clientWidth } = bodyWrapDOM;
        const bodyHasScrollBar = clientWidth < offsetWidth;
        adapter.setBodyHasScrollbar(bodyHasScrollBar);
        setScrollPositionClassName();
    };

    // 检测滚动条的回调
    const resizeCallback = () => {
        const update = () => syncScrollbarState();
        const requestAnimationFrame = window.requestAnimationFrame || window.setTimeout;
        requestAnimationFrame(update);
    };

    // 使用 ResizeObserver 监听 body 容器大小变化
    if (window.ResizeObserver) {
        if (resizeObserver) {
            resizeObserver.unobserve(bodyWrapDOM);
            resizeObserver = null;
        }
        resizeObserver = new ResizeObserver(resizeCallback);
        resizeObserver.observe(bodyWrapDOM);
    }

    // 关键：立刻同步一次，避免首次横向滚动时才触发布局更新导致 fixed 抖动
    syncScrollbarState();
};

// 当 virtualizedBodyRef 挂载后，调用 getVirtualizedListRef
watch(
    () => virtualizedBodyRef.value,
    (newVal) => {
        if (newVal && props.getVirtualizedListRef && props.virtualized) {
            // 传递一个类似 react-window List 的对象，包含 scrollToItem 等方法
            props.getVirtualizedListRef(newVal);
        }
    },
    { immediate: true }
);

// 初始化 queries
onMounted(() => {
    const queries = TableFoundation.initColumnsFilteredValueAndSorterOrder([...flattenColumns.value]);
    adapter.setQueries(queries);
    if (foundation) {
        foundation.init();
        // 如果设置了 defaultExpandAllRows，需要在 init 之后再次调用 initExpandedRowKeys
        // 因为 init 时可能使用的是旧的 dataSource，需要确保使用最新的 dataSource
        if (
            props.defaultExpandAllRows ||
            props.expandAllRows ||
            props.defaultExpandAllGroupRows ||
            props.expandAllGroupRows
        ) {
            nextTick(() => {
                foundation.initExpandedRowKeys({ groups: state.value.groups });
            });
        }
    }

    nextTick(() => {
        setScrollPositionClassName();
        // 使用 passive wheel 监听，避免浏览器 non-passive 警告
        registerWheelListener();
        // 当有 scroll.y 时，监听 body 容器大小变化以检测滚动条
        if (props.scroll?.y) {
            observeBodyResize();
        }
        // 确保 virtualizedBodyRef 已挂载后调用 getVirtualizedListRef
        if (virtualizedBodyRef.value && props.getVirtualizedListRef && props.virtualized) {
            props.getVirtualizedListRef(virtualizedBodyRef.value);
        }
    });
});

watch(
    () => props.scroll?.y,
    (y, prevY) => {
        if (y && y !== prevY) {
            nextTick(() => {
                observeBodyResize();
            });
        }
    }
);

const handleWindowResize = () => {
    setScrollPositionClassName();
};

onMounted(() => {
    window.addEventListener('resize', handleWindowResize);
});

onUnmounted(() => {
    window.removeEventListener('resize', handleWindowResize);
    // 虚拟滚动时使用 virtualizedBodyRef.containerRef，非虚拟滚动时使用 bodyWrapRef
    const bodyWrapDOM =
        props.virtualized && virtualizedBodyRef.value?.containerRef
            ? virtualizedBodyRef.value.containerRef
            : bodyWrapRef.value;
    if (resizeObserver && bodyWrapDOM) {
        resizeObserver.unobserve(bodyWrapDOM);
        resizeObserver = null;
    }
    unregisterWheelListener?.();
});

// 暴露方法供外部调用
const getCurrentPageData = () => {
    const retObj: { dataSource?: Data[]; groups?: Map<string | number, Data[]> | null } = {};
    if (pageData.value) {
        retObj.dataSource = pageData.value;
    }
    if (state.value.groups) {
        retObj.groups = state.value.groups;
    }
    return cloneDeep(retObj);
};

/**
 * 重置表格垂直滚动位置到顶部
 */
const resetScrollY = () => {
    adapter.resetScrollY();
};

/**
 * 根据 rowKeys 获取对应的 record 对象数组
 * 支持树形数据：如果当前层级找不到所有记录，递归查找子节点
 * @param rowKeys - 行的 key 数组，如果不传则使用当前选中的 rowKeys
 * @returns 对应的 record 对象数组
 */
const getSelectedRows = (rowKeys?: (string | number)[]): Data[] => {
    const keysToFind = rowKeys || state.value.rowSelection?.selectedRowKeys || [];
    if (!keysToFind || keysToFind.length === 0) {
        return [];
    }
    const keySet = new Set(keysToFind);
    let dataSourceForRows: Data[];
    // 优先使用已排序筛选的数据源
    dataSourceForRows = adapter.getCachedFilteredSortedDataSource() || [];
    if (!dataSourceForRows || dataSourceForRows.length === 0) {
        dataSourceForRows = pageData.value || [];
    }
    if (!dataSourceForRows || dataSourceForRows.length === 0) {
        dataSourceForRows = props.dataSource || [];
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
            const key = getRecordKey(record, 0);
            if (keySet.has(key)) {
                selectedRows.push(record);
            }
        }

        // 如果还有未找到的记录，递归查找子节点
        if (selectedRows.length < keysToFind.length) {
            const childrenRecordName = props.childrenRecordName || 'children';
            for (const record of data) {
                const children = get(record, childrenRecordName);
                if (Array.isArray(children) && children.length > 0) {
                    findRows(children);
                }
            }
        }
    };

    findRows(dataSourceForRows);
    return cloneDeep(selectedRows);
};

/**
 * 获取所有行的 keys
 * @returns 所有行的 key 数组
 */
const getAllRowKeys = (): (string | number)[] => {
    // 优先使用缓存的已排序筛选的 rowKeys
    const cachedRowKeys = adapter.getCachedFilteredSortedRowKeys();
    if (cachedRowKeys && cachedRowKeys.length > 0) {
        return [...cachedRowKeys];
    }
    // 否则使用 state 中的 allRowKeys
    if (state.value.allRowKeys && state.value.allRowKeys.length > 0) {
        return [...state.value.allRowKeys];
    }
    // 如果都没有，则从当前数据源计算
    const dataSource = props.dataSource || [];
    const keys: (string | number)[] = [];
    const collectKeys = (data: Data[]) => {
        for (const record of data) {
            const key = getRecordKey(record, 0);
            keys.push(key);
            const childrenRecordName = props.childrenRecordName || 'children';
            const children = get(record, childrenRecordName);
            if (Array.isArray(children) && children.length > 0) {
                collectKeys(children);
            }
        }
    };
    collectKeys(dataSource);
    return keys;
};

defineExpose({
    getCurrentPageData,
    resetScrollY,
    getSelectedRows,
    getAllRowKeys,
});
</script>
