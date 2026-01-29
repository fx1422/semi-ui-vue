import Table from './Table.vue';
import Column from './Column.vue';
import TableHeader from './TableHeader.vue';
import TableHeaderRow from './TableHeaderRow.vue';
import TableCell from './TableCell.vue';
import TableSelectionCell from './TableSelectionCell.vue';
import ColumnSorter from './ColumnSorter.vue';
import ColumnFilter from './ColumnFilter.vue';
import CustomExpandIcon from './CustomExpandIcon.vue';
import ResizableHeaderCell from './ResizableHeaderCell.vue';
import VirtualizedBody from './VirtualizedBody.vue';
import { strings } from '@douyinfe/semi-foundation/table/constants';

// 导入样式（自动引入）
import './table.scss';

export * from './interface';
export {
    Column,
    TableHeader,
    TableHeaderRow,
    TableCell,
    TableSelectionCell,
    ColumnSorter,
    ColumnFilter,
    CustomExpandIcon,
    ResizableHeaderCell,
    VirtualizedBody,
};

// 定义类型
type TableType = typeof Table & {
    Column: typeof Column;
    DEFAULT_KEY_COLUMN_SELECTION: string;
    DEFAULT_KEY_COLUMN_EXPAND: string;
};

// 使用 Object.assign 确保属性可枚举，支持解构语法
const TableWithColumn = Object.assign(Table, {
    Column,
    DEFAULT_KEY_COLUMN_SELECTION: strings.DEFAULT_KEY_COLUMN_SELECTION,
    DEFAULT_KEY_COLUMN_EXPAND: strings.DEFAULT_KEY_COLUMN_EXPAND,
}) as TableType;

export default TableWithColumn;
