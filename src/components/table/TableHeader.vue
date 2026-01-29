<template>
    <component :is="HeaderWrapper" :class="headerCls">
        <TableHeaderRow
            v-for="(row, index) in headerRows"
            :key="index"
            :row="row"
            :index="index"
            :columns="columns"
            :components="components"
            :prefix-cls="prefixCls"
            :on-header-row="onHeaderRow"
            :selected-row-keys-set="selectedRowKeysSet"
            :selection-cell-props="props.titleSelectionProps"
            :on-sorter-click="props.onSorterClick"
            :on-filter-select="props.onFilterSelect"
            :on-filter-dropdown-visible-change="props.onFilterDropdownVisibleChange"
            :on-resize="props.onResize"
        />
    </component>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { get, isFunction } from 'lodash-es';
import { strings, cssClasses } from '@douyinfe/semi-foundation/table/constants';
import { shouldShowEllipsisTitle } from '@douyinfe/semi-foundation/table/utils';
import TableHeaderRow from './TableHeaderRow.vue';
import type { ColumnProps, TableComponents, OnHeaderRow, Fixed } from './interface';

defineOptions({
    name: 'SemiTableHeader',
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
    columns?: ColumnProps[];
    components?: TableComponents;
    fixed?: Fixed;
    onHeaderRow?: OnHeaderRow<any>;
    prefixCls?: string;
    selectedRowKeysSet: Set<any>;
    titleSelectionProps?: any;
    onSorterClick?: (column: ColumnProps, e: MouseEvent) => void;
    onFilterSelect?: (column: ColumnProps, data: any) => void;
    onFilterDropdownVisibleChange?: (column: ColumnProps, visible: boolean) => void;
    onResize?: (column: ColumnProps, e: { width: number }) => void;
}

const props = withDefaults(defineProps<Props>(), {
    columns: () => [],
    prefixCls: cssClasses.PREFIX,
    components: () => ({
        header: {
            wrapper: 'thead',
            row: 'tr',
            cell: 'th',
        },
    }),
});

function parseHeaderRows(columns: ColumnProps[]): TableHeaderCell[][] {
    const rows: TableHeaderCell[][] = [];

    function fillRowCells(
        columns: ColumnProps[],
        colIndex: number,
        parents: TableHeaderCell[] = [],
        rowIndex = 0,
        level = 0
    ): number[] {
        // Init rows
        rows[rowIndex] = rows[rowIndex] || [];

        let currentColIndex = colIndex;
        const colSpans = columns.map((column) => {
            // 处理 title：如果是函数，调用它（在 useFullRender 模式下，title 函数会接收 titleMap 参数）
            // 注意：在 useFullRender 模式下，title 已经被包装成一个函数，会在每次调用时创建最新的 titleMap
            let children: any;
            if (isFunction(column.title)) {
                // 调用 title 函数，如果它期望接收参数（useFullRender 模式），会返回一个函数
                // 否则直接返回结果
                const titleResult = column.title();
                children = titleResult;
            } else {
                children = column.title;
            }

            const cell: TableHeaderCell = {
                key: column.key || column.dataIndex || colIndex,
                className: column.className || '',
                children,
                column,
                colStart: currentColIndex,
                level,
                parents,
            };

            let colSpan = 1;

            /**
             * Calculate header column merge colSpan
             *  - If the current cell has children, colSpan = the sum of children rowSpan
             *  - If the current cell has no children, colSpan = 1
             */
            const subColumns = column.children;
            if (subColumns && subColumns.length > 0) {
                colSpan = fillRowCells(subColumns, currentColIndex, [...parents, cell], rowIndex + 1, level + 1).reduce(
                    (total, count) => total + count,
                    0
                );
                cell.hasSubColumns = true;
            }

            if ('colSpan' in column) {
                colSpan = column.colSpan || 1;
            }

            if ('rowSpan' in column) {
                cell.rowSpan = column.rowSpan;
            }

            if (column.key === strings.DEFAULT_KEY_COLUMN_SCROLLBAR) {
                cell['x-type'] = strings.DEFAULT_KEY_COLUMN_SCROLLBAR;
            }

            cell.colSpan = colSpan;
            cell.colEnd = cell.colStart + colSpan - 1;
            rows[rowIndex].push(cell);

            currentColIndex += colSpan;

            const ellipsis = column?.ellipsis;
            const shouldShowTitle = shouldShowEllipsisTitle(ellipsis);
            if (shouldShowTitle && typeof cell.children === 'string') {
                cell.title = cell.children;
            }

            return colSpan;
        });

        return colSpans;
    }

    // Generate `rows` cell data
    fillRowCells(columns, 0);

    /**
     * Calculate header row merge rowSpan
     *  - If the current cell has no children, you need to calculate rowSpan, rowSpan = the total number of rows in the header-which row currently belongs to
     *  - If the current cell has children, there is no need to calculate rowSpan
     */
    const rowCount = rows.length;
    for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
        rows[rowIndex].forEach((cell: TableHeaderCell) => {
            if (!('rowSpan' in cell) && !cell.hasSubColumns) {
                cell.rowSpan = rowCount - rowIndex;
            }
        });
    }

    return rows;
}

const headerRows = computed(() => {
    // 访问 titleSelectionProps 以确保依赖追踪
    if (props.titleSelectionProps) {
        // 触发依赖追踪，但不使用值
        void props.titleSelectionProps;
    }
    return parseHeaderRows(props.columns || []);
});

const HeaderWrapper = computed(() => get(props.components, 'header.wrapper', 'thead'));

const headerCls = computed(() => `${props.prefixCls}-thead`);
</script>
