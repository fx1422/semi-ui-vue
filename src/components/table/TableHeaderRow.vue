<template>
    <component :is="HeaderRow" :ref="setHeaderRowRef" :class="rowCls" :style="rowStyle" v-bind="headerRowProps">
        <template v-for="(cell, cellIndex) in props.row" :key="cellIndex">
            <ResizableHeaderCell
                v-if="cell && cell.column && cell.column.resizable === true && typeof cell.column.width === 'number'"
                :key="`resizable-${cellIndex}`"
                :class="getCellClass(cell, cellIndex)"
                :style="getCellStyle(cell, cellIndex)"
                :width="cell.column.width"
                :resize="true"
                :prefix-cls="prefixCls"
                :colspan="cell.colSpan"
                :rowspan="cell.rowSpan"
                v-bind="getCellProps(cell, cellIndex)"
                @resize="(e) => handleResize(cell.column, e)"
            >
                <TableSelectionCell
                    v-if="cell && cell.column && isSelectionColumn(cell.column) && selectionCellProps"
                    v-bind="selectionCellProps"
                />
                <template v-else>
                    <ColumnSorter
                        v-if="cell && cell.column && cell.column.sorter"
                        :prefix-cls="prefixCls"
                        :sort-order="getSortOrder(cell.column)"
                        :sort-icon="cell.column.sortIcon"
                        :show-tooltip="cell.column.showSortTip"
                        :title="cell.children"
                        @click="handleSorterClick(cell.column, $event)"
                    />
                    <template v-else>
                        <Tooltip v-if="cell.title && cell.title !== cell.children" :content="cell.title">
                            <span v-if="isVNode(cell.children)">
                                <component :is="cell.children" />
                            </span>
                            <span v-else>{{ cell.children }}</span>
                        </Tooltip>
                        <span v-if="isVNode(cell.children)">
                            <component :is="cell.children" />
                        </span>
                        <span v-else>{{ cell.children }}</span>
                    </template>
                </template>
            </ResizableHeaderCell>
            <component
                :is="HeaderCell"
                v-else
                :key="`header-${cellIndex}`"
                :class="getCellClass(cell, cellIndex)"
                :style="getCellStyle(cell, cellIndex)"
                :colspan="cell.colSpan"
                :rowspan="cell.rowSpan"
                v-bind="getCellProps(cell, cellIndex)"
                @click="handleCellClick(cell, cellIndex, $event)"
                @mousedown="handleCellMouseDown(cell, cellIndex, $event)"
            >
                <TableSelectionCell
                    v-if="cell && cell.column && isSelectionColumn(cell.column) && selectionCellProps"
                    v-bind="selectionCellProps"
                />
                <template
                    v-else-if="
                        cell && cell.column && (cell.column.sorter || cell.column.onFilter || cell.column.filters)
                    "
                >
                    <div :class="`${prefixCls}-operate-wrapper`">
                        <ColumnSorter
                            v-if="cell && cell.column && cell.column.sorter"
                            :prefix-cls="prefixCls"
                            :sort-order="getSortOrder(cell.column)"
                            :sort-icon="cell.column.sortIcon"
                            :show-tooltip="cell.column.showSortTip"
                            @click="handleSorterClick(cell.column, $event)"
                        >
                            <template #title>
                                <span
                                    :class="`${prefixCls}-row-head-title`"
                                    :title="cell.title && cell.title !== cell.children ? cell.title : undefined"
                                >
                                    <component :is="cell.children" v-if="isVNode(cell.children)" />
                                    <template v-else>{{ cell.children }}</template>
                                </span>
                            </template>
                        </ColumnSorter>
                        <template v-else>
                            <span
                                :class="`${prefixCls}-row-head-title`"
                                :title="cell.title && cell.title !== cell.children ? cell.title : undefined"
                            >
                                <component :is="cell.children" v-if="isVNode(cell.children)" />
                                <template v-else>{{ cell.children }}</template>
                            </span>
                        </template>
                        <ColumnFilter
                            v-if="shouldShowColumnFilter(cell)"
                            :prefix-cls="prefixCls"
                            :filtered-value="getFilteredValue(cell.column)"
                            :filter-icon="cell.column.filterIcon"
                            :filter-dropdown-props="cell.column.filterDropdownProps"
                            :filters="cell.column.filters"
                            :filter-multiple="cell.column.filterMultiple"
                            :filter-dropdown-visible="cell.column.filterDropdownVisible"
                            :render-filter-dropdown="cell.column.renderFilterDropdown"
                            :on-filter-dropdown-visible-change="
                                (visible) => handleFilterDropdownVisibleChange(cell.column, visible)
                            "
                            @select="(data) => handleFilterSelect(cell.column, data)"
                        />
                    </div>
                </template>
                <template v-else>
                    <Tooltip v-if="cell.title && cell.title !== cell.children" :content="cell.title">
                        <span v-if="isVNode(cell.children)">
                            <component :is="cell.children" />
                        </span>
                        <span v-else>{{ cell.children }}</span>
                    </Tooltip>
                    <span v-if="isVNode(cell.children)">
                        <component :is="cell.children" />
                    </span>
                    <span v-else>{{ cell.children }}</span>
                </template>
            </component>
        </template>
    </component>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, isVNode } from 'vue';
import { get, isFunction } from 'lodash-es';
import classnames from 'classnames';
import { cssClasses } from '@douyinfe/semi-foundation/table/constants';
import {
    isFirstFixedRight,
    isLastLeftFixed,
    isFixedLeft,
    isFixedRight,
    sliceColumnsByLevel,
    isSelectionColumn,
    arrayAdd,
} from '@douyinfe/semi-foundation/table/utils';
import Tooltip from '../tooltip';
import TableSelectionCell from './TableSelectionCell.vue';
import ColumnSorter from './ColumnSorter.vue';
import ColumnFilter from './ColumnFilter.vue';
import ResizableHeaderCell from './ResizableHeaderCell.vue';
import { useTableContext } from './table-context';
import type { ColumnProps, TableComponents, OnHeaderRow, Fixed, Direction } from './interface';
import type { CSSProperties } from 'vue';

defineOptions({
    name: 'SemiTableHeaderRow',
});

interface TableHeaderCell {
    key: string | number;
    className: string;
    children: any;
    column: ColumnProps;
    colStart: number;
    level: number;
    parents: TableHeaderCell[];
    colSpan?: number;
    rowSpan?: number;
    colEnd?: number;
    hasSubColumns?: boolean;
    title?: string;
    'x-type'?: string;
}

interface Props {
    components?: TableComponents;
    row?: TableHeaderCell[];
    prefixCls?: string;
    onHeaderRow?: OnHeaderRow<any>;
    index?: number;
    style?: CSSProperties;
    columns?: ColumnProps[];
    fixed?: Fixed;
    selectedRowKeysSet: Set<any>;
    selectionCellProps?: any;
    onSorterClick?: (column: ColumnProps, e: MouseEvent) => void;
    onFilterSelect?: (column: ColumnProps, data: any) => void;
    onFilterDropdownVisibleChange?: (column: ColumnProps, visible: boolean) => void;
    onResize?: (column: ColumnProps, e: { width: number }) => void;
}

const props = withDefaults(defineProps<Props>(), {
    row: () => [],
    prefixCls: cssClasses.PREFIX,
    columns: () => [],
    components: () => ({
        header: {
            wrapper: 'thead',
            row: 'tr',
            cell: 'th',
        },
    }),
});

const emit = defineEmits<{
    (e: 'update-widths', widths: Array<{ width: number; key: any }>, index: number): void;
}>();

const headerRowRef = ref<HTMLElement>();
const tableContext = useTableContext();

const HeaderRow = computed(() => get(props.components, 'header.row', 'tr'));
const HeaderCell = computed(() => get(props.components, 'header.cell', 'th'));

const headerRowCustomProps = computed(() => {
    if (isFunction(props.onHeaderRow)) {
        return props.onHeaderRow(props.columns || [], props.index || 0) || {};
    }
    return {};
});

const headerRowProps = computed(() => {
    const { className: _className, style: _style, ...rest } = (headerRowCustomProps.value || {}) as any;
    // 这些变量仅用于从对象中排除，不需要使用
    void _className;
    void _style;
    return rest;
});

const rowCls = computed(() => classnames(`${props.prefixCls}-row`, (headerRowCustomProps.value as any)?.className));

const rowStyle = computed(() => {
    const base = props.style || {};
    const extra = ((headerRowCustomProps.value as any)?.style || {}) as any;
    return { ...base, ...extra };
});

const getCellClass = (cell: TableHeaderCell, cellIndex: number) => {
    const { column } = cell;
    const customProps = isFunction(column.onHeaderCell) ? column.onHeaderCell(column, cellIndex, props.index) : {};

    const slicedColumns = sliceColumnsByLevel(props.columns || [], props.index);
    const direction = tableContext.direction;
    let directionValue: string | null = null;
    if (direction != null && direction !== undefined) {
        const dir = direction as Direction | { value: string };
        if (typeof dir === 'object' && dir !== null && 'value' in dir) {
            directionValue = (dir as { value: string }).value;
        } else if (typeof dir === 'string') {
            directionValue = dir;
        }
    }
    const isRTL = directionValue === 'rtl';

    let fixedLeft, fixedRight, fixedLeftLast, fixedRightFirst;
    if (isRTL) {
        fixedLeft = isFixedRight(column);
        fixedRight = isFixedLeft(column);
        fixedLeftLast = isFirstFixedRight(slicedColumns, column);
        fixedRightFirst = isLastLeftFixed(slicedColumns, column);
    } else {
        fixedLeft = isFixedLeft(column);
        fixedRight = isFixedRight(column);
        fixedLeftLast = isLastLeftFixed(slicedColumns, column);
        fixedRightFirst = isFirstFixedRight(slicedColumns, column);
    }

    return classnames(`${props.prefixCls}-row-head`, column.className, customProps.className, {
        [`${props.prefixCls}-align-${column.align}`]: column.align,
        [`${props.prefixCls}-cell-fixed-left`]: fixedLeft,
        [`${props.prefixCls}-cell-fixed-right`]: fixedRight,
        [`${props.prefixCls}-cell-fixed-left-last`]: fixedLeftLast,
        [`${props.prefixCls}-cell-fixed-right-first`]: fixedRightFirst,
        [`${props.prefixCls}-row-head-clickSort`]: column.clickToSort,
        [`${props.prefixCls}-row-head-ellipsis`]: column.ellipsis,
    });
};

const getCellStyle = (cell: TableHeaderCell, cellIndex: number): CSSProperties => {
    const { column } = cell;
    const customProps = isFunction(column.onHeaderCell) ? column.onHeaderCell(column, cellIndex, props.index) : {};
    const style: CSSProperties = { ...customProps.style };

    if (column.align) {
        style.textAlign = column.align;
    }

    if (column.width) {
        style.width = typeof column.width === 'number' ? `${column.width}px` : column.width;
    }

    /**
     * 固定列样式（根因修复）：
     * 之前出现“首帧抖动”的一个核心原因，是表头 fixed 偏移在滚动开始时可能发生一次跳变（例如未命中索引/二次覆盖）。
     *
     * 这里改成更确定的算法：直接使用 TableHeaderCell 的 colStart/colEnd（全局列索引），
     * 基于 flattenedColumns 的宽度数组计算 left/right 偏移。
     * - 不依赖 key 查找
     * - 不依赖分层 sliceColumnsByLevel
     * - 对单层/多层表头都稳定
     */
    const slicedColumns = sliceColumnsByLevel(props.columns || [], props.index);
    const direction = tableContext.direction;
    let directionValue: string | null = null;
    if (direction != null && direction !== undefined) {
        const dir = direction as Direction | { value: string };
        if (typeof dir === 'object' && dir !== null && 'value' in dir) {
            directionValue = (dir as { value: string }).value;
        } else if (typeof dir === 'string') {
            directionValue = dir;
        }
    }
    const isRTL = directionValue === 'rtl';

    /**
     * 与 React 版本一致：
     * - RTL 下“左右交换”只用于 class（视觉左右）
     * - sticky 偏移计算始终基于 column.fixed 的逻辑左右（isFixedLeft/isFixedRight）
     * - 最终通过 direction 决定写入 left/right
     */
    const fixedLeftLogical = isFixedLeft(column);
    const fixedRightLogical = isFixedRight(column);

    const getCellWidths = tableContext.getCellWidths;

    if (fixedLeftLogical || fixedRightLogical) {
        style.position = 'sticky';

        const flattenedColumns = (tableContext.flattenedColumns as any)?.value || props.columns || [];
        const flattenedWidths = getCellWidths?.(flattenedColumns) || [];
        if (flattenedWidths.length) {
            const colStart = cell.colStart ?? cellIndex;
            const colEnd = cell.colEnd ?? colStart;
            if (fixedLeftLogical) {
                const xPositionKey = isRTL ? 'right' : 'left';
                style[xPositionKey] = `${Math.round(arrayAdd(flattenedWidths, 0, colStart))}px`;
            }
            if (fixedRightLogical) {
                const xPositionKey = isRTL ? 'left' : 'right';
                style[xPositionKey] = `${Math.round(arrayAdd(flattenedWidths, colEnd + 1))}px`;
            }
        } else {
            // 兜底方案：使用 calculateFixedLeftOffset/calculateFixedRightOffset
            if (fixedLeftLogical) {
                const xPositionKey = isRTL ? 'right' : 'left';
                style[xPositionKey] = `${Math.round(calculateFixedLeftOffset(column, slicedColumns, cellIndex))}px`;
            }
            if (fixedRightLogical) {
                const xPositionKey = isRTL ? 'left' : 'right';
                style[xPositionKey] = `${Math.round(calculateFixedRightOffset(column, slicedColumns, cellIndex))}px`;
            }
        }

        // z-index 交由 table.scss 的 .semi-table-cell-fixed-* 控制，避免内联样式覆盖 token
    }

    return style;
};

const calculateFixedLeftOffset = (column: ColumnProps, columns: ColumnProps[], cellIndex: number): number => {
    let offset = 0;
    for (let i = 0; i < cellIndex; i++) {
        const col = columns[i];
        if (col && (col.fixed === true || col.fixed === 'left')) {
            const width = typeof col.width === 'number' ? col.width : 0;
            offset += width;
        }
    }
    return offset;
};

const calculateFixedRightOffset = (column: ColumnProps, columns: ColumnProps[], cellIndex: number): number => {
    let offset = 0;
    for (let i = cellIndex + 1; i < columns.length; i++) {
        const col = columns[i];
        if (col && col.fixed === 'right') {
            const width = typeof col.width === 'number' ? col.width : 0;
            offset += width;
        }
    }
    return offset;
};

const getCellProps = (cell: TableHeaderCell, cellIndex: number) => {
    const { column } = cell;
    const customProps = isFunction(column.onHeaderCell) ? column.onHeaderCell(column, cellIndex, props.index) : {};
    const cellProps: Record<string, any> = {
        ...customProps,
        'x-type': cell['x-type'],
    };

    // 处理 clickToSort
    if (typeof column.clickToSort === 'function') {
        const existingOnClick = cellProps.onClick;
        cellProps.onClick = (e: MouseEvent) => {
            if (existingOnClick) {
                existingOnClick(e);
            }
            column.clickToSort(e);
        };
    }

    // 处理 mouseDown
    if (typeof column.mouseDown === 'function') {
        const existingOnMouseDown = cellProps.onMouseDown;
        cellProps.onMouseDown = (e: MouseEvent) => {
            if (existingOnMouseDown) {
                existingOnMouseDown(e);
            }
            column.mouseDown(e);
        };
    }

    return cellProps;
};

const cacheRef = () => {
    if (hasMeasuredWidths.value) {
        return;
    }

    hasMeasuredWidths.value = true;

    if (!headerRowRef.value || !props.row || !props.row.length) {
        hasMeasuredWidths.value = false;
        return;
    }

    let domElement: HTMLElement | null = null;
    if (headerRowRef.value instanceof HTMLElement) {
        domElement = headerRowRef.value;
    } else if ((headerRowRef.value as any)?.$el) {
        domElement = (headerRowRef.value as any).$el;
    } else if ((headerRowRef.value as any)?.el) {
        domElement = (headerRowRef.value as any).el;
    }

    if (!domElement) {
        hasMeasuredWidths.value = false;
        return;
    }

    const cellSelector = `.${props.prefixCls}-row-head`;
    const heads = domElement.querySelectorAll?.(cellSelector);

    if (!heads || heads.length === 0) {
        hasMeasuredWidths.value = false;
        return;
    }

    const widths = Array.from(heads).map((head, headIndex) => {
        let configWidth = get(props.row, [headIndex, 'column', 'width']);
        let key = get(props.row, [headIndex, 'column', 'key']);
        if (key == null) {
            key = get(props.row, [headIndex, 'column', 'dataIndex']);
        }
        if (typeof configWidth !== 'number') {
            configWidth = (head as HTMLElement)?.getBoundingClientRect().width || 0;
        }
        return { width: configWidth, key };
    });

    emit('update-widths', widths, props.index || 0);

    if (tableContext.setHeadWidths) {
        tableContext.setHeadWidths(widths, props.index);
    }
};

const setHeaderRowRef = (el: any) => {
    if (el) {
        // 如果 ref 已经设置且是同一个元素，且已经测量过，直接返回
        if (headerRowRef.value === el && hasMeasuredWidths.value) {
            return;
        }

        // 更新 ref（如果不同）
        if (headerRowRef.value !== el) {
            headerRowRef.value = el;
        }

        // 当 ref 设置后，立即尝试测量列宽（只测量一次，避免循环）
        if (props.row && props.row.length && !hasMeasuredWidths.value) {
            // 清除之前的定时器，避免多个 setTimeout 同时执行
            if (measureTimeoutId) {
                clearTimeout(measureTimeoutId);
            }
            // 使用 setTimeout 延迟，确保 DOM 完全渲染
            measureTimeoutId = setTimeout(() => {
                measureTimeoutId = null;
                // 再次检查，确保在延迟期间没有被其他调用测量
                if (headerRowRef.value && !hasMeasuredWidths.value && props.row && props.row.length) {
                    cacheRef();
                }
            }, 10); // 增加延迟时间，确保 DOM 完全渲染
        }
    } else if (!el) {
        // el 为 null 时，清空 ref（组件卸载时）
        headerRowRef.value = null;
        // 重置测量标记，允许重新测量
        hasMeasuredWidths.value = false;
    }
};

const hasMeasuredWidths = ref(false);
let measureTimeoutId: ReturnType<typeof setTimeout> | null = null;

onMounted(() => {
    if (headerRowRef.value && props.row && props.row.length && !hasMeasuredWidths.value) {
        if (measureTimeoutId) {
            clearTimeout(measureTimeoutId);
        }
        measureTimeoutId = setTimeout(() => {
            measureTimeoutId = null;
            if (headerRowRef.value && !hasMeasuredWidths.value && props.row && props.row.length) {
                cacheRef();
            }
        }, 0);
    }
});

const handleSorterClick = (column: ColumnProps, e: MouseEvent) => {
    if (props.onSorterClick) {
        props.onSorterClick(column, e);
    }
};

const handleFilterSelect = (column: ColumnProps, data: any) => {
    if (props.onFilterSelect) {
        props.onFilterSelect(column, data);
    }
};

const handleFilterDropdownVisibleChange = (column: ColumnProps, visible: boolean) => {
    if (props.onFilterDropdownVisibleChange) {
        props.onFilterDropdownVisibleChange(column, visible);
    }
};

const handleResize = (column: ColumnProps, e: { width: number }) => {
    if (props.onResize) {
        props.onResize(column, e);
    }
};

const shouldShowColumnFilter = (cell: TableHeaderCell): boolean => {
    if (!cell || !cell.column) {
        return false;
    }
    const { column } = cell;
    const hasFilters = column.filters && column.filters.length > 0;
    const hasRenderFilterDropdown = typeof column.renderFilterDropdown === 'function';
    return hasFilters || hasRenderFilterDropdown;
};

const getFilteredValue = (column: ColumnProps) => {
    const dataIndex = column.dataIndex || column.key;
    if (!dataIndex || !tableContext.getQuery) {
        return column.filteredValue || column.defaultFilteredValue || [];
    }
    const curQuery = tableContext.getQuery(dataIndex);
    const stateFilteredValue = get(curQuery, 'filteredValue');
    const defaultFilteredValue = get(curQuery, 'defaultFilteredValue', column.defaultFilteredValue || []);
    return Array.isArray(stateFilteredValue) ? stateFilteredValue : defaultFilteredValue || [];
};

const getSortOrder = (column: ColumnProps) => {
    const dataIndex = column.dataIndex || column.key;
    if (!dataIndex || !tableContext.getQuery || !tableContext.isSortOrderValid) {
        return column.sortOrder || false;
    }
    const curQuery = tableContext.getQuery(dataIndex);
    const stateSortOrder = get(curQuery, 'sortOrder');
    const defaultSortOrder = get(curQuery, 'defaultSortOrder', false);
    const sortOrder = tableContext.isSortOrderValid(stateSortOrder) ? stateSortOrder : defaultSortOrder;
    return sortOrder;
};

const handleCellClick = (cell: TableHeaderCell, cellIndex: number, e: MouseEvent) => {
    const { column } = cell;
    const cellProps = getCellProps(cell, cellIndex);
    if (cellProps.onClick) {
        cellProps.onClick(e);
    }
    if (typeof column.clickToSort === 'function') {
        column.clickToSort(e);
    }
};

const handleCellMouseDown = (cell: TableHeaderCell, cellIndex: number, e: MouseEvent) => {
    const { column } = cell;
    const cellProps = getCellProps(cell, cellIndex);
    if (cellProps.onMouseDown) {
        cellProps.onMouseDown(e);
    }
    if (typeof column.mouseDown === 'function') {
        column.mouseDown(e);
    }
};
</script>
