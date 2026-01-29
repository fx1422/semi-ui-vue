<template>
    <div
        ref="containerRef"
        :class="bodyCls"
        :style="containerStyle"
        @scroll="handleScroll"
        @wheel.passive="handleWheel"
    >
        <div
            :style="{
                width: typeof tableWidth === 'number' ? `${tableWidth}px` : tableWidth,
                overflow: 'visible',
            }"
            :class="tableCls"
        >
            <div :class="`${prefixCls}-tbody`" :style="innerStyle">
                <component
                    :is="renderRowWithStyle(item, item.__originalIndex ?? relativeIndex)"
                    v-for="(item, relativeIndex) in virtualizedData"
                    :key="getItemKey(item, item.__originalIndex ?? relativeIndex)"
                />
            </div>
        </div>
        <div v-if="!allData || allData.length === 0" :class="`${prefixCls}-empty`">
            <slot name="empty">
                <Empty v-if="!props.emptySlot" />
                <component :is="props.emptySlot" v-else />
            </slot>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick, h } from 'vue';
import { get } from 'lodash-es';
import classnames from 'classnames';
import { cssClasses } from '@douyinfe/semi-foundation/table/constants';
import {
    getDefaultVirtualizedRowConfig,
    arrayAdd,
    isInnerColumnKey,
    isExpandedColumn,
    isScrollbarColumn,
    isFixedLeft,
    isFixedRight,
    isLastLeftFixed,
    isFirstFixedRight,
} from '@douyinfe/semi-foundation/table/utils';
import { strings } from '@douyinfe/semi-foundation/table/constants';
import Empty from '../empty';
import { useTableBodyFoundation } from './useTableBodyFoundation';
import { useTableContext } from './table-context';
import TableCell from './TableCell.vue';
import type { Virtualized, VirtualizedItemSize, VirtualizedOnScroll, ColumnProps, Size } from './interface';
import type { CSSProperties } from 'vue';

defineOptions({
    name: 'SemiVirtualizedBody',
});

interface Props {
    dataSource?: any[];
    columns?: ColumnProps[];
    virtualized?: Virtualized;
    scroll?: { y?: number | string; x?: number | string };
    prefixCls?: string;
    size?: Size;
    onScroll?: VirtualizedOnScroll;
    handleBodyScroll?: (e: any) => void;
    handleWheel?: (e: WheelEvent) => void;
    emptySlot?: any;
    rowKey?: string | number | ((record: any) => string | number);
    components?: any;
    expandedRowKeys?: (string | number)[];
    expandedRowRender?: (record: any, index: number, expanded: boolean) => any;
    onRow?: (record: any, index: number) => any;
    rowExpandable?: (record: any) => boolean;
    selectedRowKeysSet?: Set<string | number> | Set<unknown>;
    disabledRowKeysSet?: Set<string | number> | Set<unknown>;
    renderExpandIcon?: (record: any, isNested: boolean, groupKey?: string | number) => any;
    hideExpandedColumn?: boolean;
    expandRowByClick?: boolean;
    slots?: any;
    childrenRecordName?: string;
    groups?: Map<string | number, Set<string | number>> | null;
    renderGroupSection?: (groupKey?: string | number, group?: (string | number)[]) => any;
    onGroupedRow?: (record?: any, index?: number) => any;
    clickGroupedRowToExpand?: boolean;
    onGroupExpand?: (expanded: boolean, groupKey: string | number, e: MouseEvent) => void;
    indentSize?: number;
    expandIcon?: any;
}

const props = withDefaults(defineProps<Props>(), {
    prefixCls: cssClasses.PREFIX,
    dataSource: () => [],
    columns: () => [],
});

const emit = defineEmits<{
    (
        e: 'items-rendered',
        props: {
            overscanStartIndex: number;
            overscanStopIndex: number;
            visibleStartIndex: number;
            visibleStopIndex: number;
        }
    ): void;
}>();

const containerRef = ref<HTMLElement>();
const scrollTop = ref(0);
const scrollLeft = ref(0);

const { virtualizedData: foundationVirtualizedData } = useTableBodyFoundation({
    dataSource: computed(() => props.dataSource),
    rowKey: computed(() => props.rowKey),
    childrenRecordName: computed(() => props.childrenRecordName),
    expandedRowRender: computed(() => props.expandedRowRender),
    expandedRowKeys: computed(() => props.expandedRowKeys),
    groups: computed(() => props.groups),
    columns: computed(() => props.columns),
});

const allData = computed(() => {
    return foundationVirtualizedData.value || [];
});

// 可见项范围
// 初始值设置为 -1，表示还未计算，避免初始时只显示第一项
// 但在数据准备好后会立即计算，确保正确显示
const visibleRange = ref({
    startIndex: -1,
    endIndex: -1,
    overscanStartIndex: -1,
    overscanStopIndex: -1,
});

const virtualizedData = computed(() => {
    const { overscanStartIndex, overscanStopIndex } = visibleRange.value;

    // 如果还未计算可见范围（初始值为 -1），但有数据，返回前几项作为初始显示
    if (overscanStartIndex < 0 || overscanStopIndex < 0) {
        // 如果有数据但还未初始化，返回前 10 项作为初始显示
        if (allData.value.length > 0) {
            const initialCount = Math.min(10, allData.value.length);
            return allData.value.slice(0, initialCount).map((item, relativeIndex) => ({
                ...item,
                __originalIndex: relativeIndex,
            }));
        }
        return [];
    }

    const start = Math.max(0, overscanStartIndex);
    const end = Math.min(allData.value.length - 1, overscanStopIndex);

    // 返回可见范围内的数据，但保留原始索引信息
    return allData.value.slice(start, end + 1).map((item, relativeIndex) => ({
        ...item,
        __originalIndex: start + relativeIndex, // 保存原始索引
    }));
});

const bodyCls = computed(() => classnames(`${props.prefixCls}-body`));

const tableContext = useTableContext();

const tableWidth = computed(() => {
    const scrollX = props.scroll?.x;
    if (scrollX) {
        return typeof scrollX === 'number' ? scrollX : scrollX;
    }

    // 如果没有 scroll.x，使用 tableContext 的 tableWidth（如果可用）
    if (tableContext?.tableWidth !== undefined && tableContext.tableWidth !== null) {
        const ctxWidth = tableContext.tableWidth;
        if (typeof ctxWidth === 'number' && ctxWidth > 0) {
            return ctxWidth;
        }
    }

    // 降级方案：使用 getCellWidths 计算
    if (tableContext?.getCellWidths) {
        const cellWidths = tableContext.getCellWidths(props.columns);
        if (cellWidths && cellWidths.length > 0) {
            const totalWidth = arrayAdd(cellWidths, 0, (props.columns || []).length);
            if (totalWidth > 0) {
                return totalWidth;
            }
        }
    }

    // 最后的降级方案：直接计算列宽
    const manualWidth = (props.columns || []).reduce((sum: number, col: ColumnProps) => {
        return sum + (typeof col.width === 'number' ? col.width : 0);
    }, 0);

    // 如果手动计算有宽度，返回该宽度，否则返回 100%
    return manualWidth > 0 ? manualWidth : '100%';
});

const tableCls = computed(() => classnames(`${props.prefixCls}`, `${props.prefixCls}-fixed`));

const containerStyle = computed<CSSProperties>(() => {
    const rawY = get(props.scroll, 'y');
    const yIsNumber = typeof rawY === 'number';
    const y = yIsNumber ? rawY : 600;

    return {
        width: '100%',
        height: yIsNumber ? `${y}px` : '600px',
        overflowX: 'auto',
        overflowY: 'scroll',
        position: 'relative',
        scrollbarGutter: 'stable',
    } as CSSProperties;
});

const innerStyle = computed<CSSProperties>(() => {
    // 计算所有扁平化数据的总高度（不是只计算可见项的高度）
    // 使用缓存的高度计算，避免重复遍历
    let totalHeight = 0;
    const dataLength = allData.value.length;

    // 如果数据量很大，可以考虑优化计算
    if (dataLength > 0) {
        // 预分配数组，提高性能
        const heights = new Array(dataLength);
        for (let i = 0; i < dataLength; i++) {
            const size = getItemSize(i);
            heights[i] = size;
            totalHeight += size;
        }
    }

    return {
        width: '100%',
        height: `${totalHeight}px`,
        position: 'relative',
    };
});

const itemSizeCache = new Map<number, number>();

const getItemSize = (index: number): number => {
    if (itemSizeCache.has(index)) {
        return itemSizeCache.get(index)!;
    }

    // 边界检查
    if (index < 0 || index >= allData.value.length) {
        return 0;
    }

    // 使用原始数据源获取 item
    const item = allData.value[index];
    if (!item) {
        return 0;
    }

    const defaultConfig = getDefaultVirtualizedRowConfig(props.size, item?.sectionRow);
    const itemSize = get(props.virtualized, 'itemSize', defaultConfig.height) as VirtualizedItemSize;

    let realSize = itemSize as number;

    if (typeof itemSize === 'function') {
        try {
            realSize = itemSize(index, {
                expandedRow: get(item, 'expandedRow', false),
                sectionRow: get(item, 'sectionRow', false),
            });
        } catch (error) {
            console.warn(`Error in itemSize function at index ${index}:`, error);
            realSize = defaultConfig.height;
        }
    }

    // 确保返回有效值
    if (typeof realSize !== 'number' || isNaN(realSize)) {
        realSize = defaultConfig.height;
    }

    if (realSize < defaultConfig.minHeight) {
        if (process.env.NODE_ENV === 'development') {
            console.warn(
                `The computed real \`itemSize\` at index ${index} cannot be less than ${defaultConfig.minHeight}, got ${realSize}`
            );
        }
        realSize = defaultConfig.minHeight;
    }
    itemSizeCache.set(index, realSize);
    return realSize;
};

// 当数据变化时，清空缓存
watch(
    () => allData.value,
    () => {
        itemSizeCache.clear();
    },
    { deep: true }
);

const getItemKey = (item: any, index: number): string | number => {
    return get(item, 'key', index);
};

const getItemStyle = (item: any, relativeIndex: number): CSSProperties => {
    // 使用原始索引计算位置（__originalIndex 是在 virtualizedData computed 中设置的）
    const originalIndex = item?.__originalIndex ?? relativeIndex;

    // 确保索引在有效范围内
    if (originalIndex < 0 || originalIndex >= allData.value.length) {
        return {
            position: 'absolute',
            top: '0px',
            left: 0,
            right: 0,
            height: '0px',
            display: 'none', // 隐藏无效项
        };
    }

    // 计算该索引之前所有项的总高度
    let top = 0;
    for (let i = 0; i < originalIndex; i++) {
        top += getItemSize(i);
    }

    return {
        position: 'absolute',
        top: `${top}px`,
        left: 0,
        height: `${getItemSize(originalIndex)}px`,
        display: 'flex',
        // 确保单元格不会被压缩
        flexShrink: 0,
    };
};

// 获取 cellWidths，用于虚拟滚动行的宽度计算
const getCellWidths = computed(() => {
    let cellWidths: number[] = [];
    if (tableContext?.getCellWidths) {
        cellWidths = tableContext.getCellWidths(props.columns) || [];
    }

    // 如果 tableContext 没有返回有效数据，或者列数不匹配，使用降级方案
    if (!cellWidths.length || cellWidths.length !== props.columns?.length) {
        cellWidths = (props.columns || []).map((col: ColumnProps) => {
            // 优先使用列配置的 width
            if (typeof col.width === 'number' && col.width > 0) {
                return col.width;
            }
            // 如果是固定列，尝试从 context 获取
            if (col.fixed && tableContext?.getCellWidths) {
                const contextWidths = tableContext.getCellWidths(props.columns) || [];
                if (contextWidths.length > 0) {
                    return contextWidths[0] || 0; // 降级方案
                }
            }
            return 0; // 让浏览器自动计算
        });
    }

    const hasZeroWidth = cellWidths.some((w) => w === 0);
    if (hasZeroWidth) {
        cellWidths = cellWidths.map((width, index) => {
            if (width > 0) {
                return width;
            }
            const column = props.columns?.[index];
            if (column && typeof column.width === 'number' && column.width > 0) {
                return column.width;
            }
            return 80;
        });
    }

    return cellWidths;
});

const getBodyCellComponent = computed(() => {
    return get(props.components, 'body.cell', strings.DEFAULT_COMPONENTS.body.cell);
});

// 计算第一个数据列的索引（排除 inner columns）
const getFirstDataColumnIndex = computed(() => {
    let idx = 0;
    const cols = props.columns || [];
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

/**
 * 渲染带有绝对定位样式的行
 * 关键：虚拟滚动中，react-window 的样式（position: absolute, top, height）
 * 需要直接应用到 <tr> 元素上，而不是外层 wrapper
 * 这样才能确保 table 布局正确工作
 */
const renderRowWithStyle = (item: any, index: number) => {
    const rowVNode = renderRow(item, index);
    if (!rowVNode) {
        return null;
    }

    // 获取绝对定位样式
    const itemStyle = getItemStyle(item, index);

    // 获取行宽度
    const rowWidth = typeof tableWidth.value === 'number' ? `${tableWidth.value}px` : tableWidth.value;

    const existingStyle = rowVNode.props?.style || {};
    const mergedStyle: CSSProperties = {
        // 先应用用户自定义样式
        ...(typeof existingStyle === 'object' ? existingStyle : {}),
        // 再应用虚拟滚动必需的定位样式（不能被覆盖）
        ...itemStyle,
        width: rowWidth,
    };

    // 使用 h() 创建新的 VNode 并合并样式
    return h(
        rowVNode.type as any,
        {
            ...rowVNode.props,
            style: mergedStyle,
        },
        rowVNode.children as any
    );
};

const renderRow = (item: any, index: number) => {
    // 如果是分组行（sectionRow）
    if (item?.sectionRow) {
        const groupKey = item.groupKey;
        const group = item.group;
        const expanded = item.expanded ?? false;

        // 获取分组的所有 row keys
        const groupRowKeys = group ? Array.from(group as Set<string | number>) : [];

        // 渲染分组标题内容
        let groupSectionContent: any = null;
        if (props.renderGroupSection) {
            const result = props.renderGroupSection(groupKey, groupRowKeys);
            // 如果返回的是对象（包含 children），则提取 children
            if (result && typeof result === 'object' && 'children' in result) {
                groupSectionContent = result.children;
            } else {
                groupSectionContent = result;
            }
        } else {
            groupSectionContent = String(groupKey || '');
        }

        // 计算 colSpan（排除 scrollbar 列）
        const filteredColumns = (props.columns || []).filter((col: ColumnProps) => !isScrollbarColumn(col));
        const colSpan = filteredColumns.length;

        // 分组行的 onRow 处理
        const groupRecord = { groupKey, records: groupRowKeys } as any;
        const groupedRowProps = props.onGroupedRow ? props.onGroupedRow(groupRecord, index) : {};
        const {
            className: groupClassName,
            style: groupStyle,
            onClick: groupOnClick,
            ...restGroupRowProps
        } = groupedRowProps as any;

        // 处理分组行的点击事件（用于展开/收起）
        const handleGroupRowClick = (e: MouseEvent) => {
            // 如果启用了点击分组行展开，触发展开/收起
            if (props.clickGroupedRowToExpand && props.onGroupExpand) {
                props.onGroupExpand(!expanded, groupKey, e);
            }
            // 调用 onGroupedRow 的 onClick（如果存在）
            if (groupOnClick) {
                groupOnClick(e);
            }
        };

        const rowCls = classnames(
            `${props.prefixCls}-row-section`,
            {
                [`${props.prefixCls}-row-section-on`]: expanded,
            },
            groupClassName
        );

        // 渲染分组行，返回 <tr> 元素
        return h(
            'tr',
            {
                class: rowCls,
                style: groupStyle || {},
                role: 'row',
                'aria-level': 1,
                'aria-expanded': expanded,
                onClick: handleGroupRowClick,
                ...restGroupRowProps,
            },
            [
                h(
                    'td',
                    {
                        colspan: colSpan,
                        class: `${props.prefixCls}-row-cell`,
                    },
                    [
                        h(
                            'div',
                            {
                                class: `${props.prefixCls}-section-inner`,
                            },
                            [
                                // 渲染展开图标（如果存在）
                                props.renderExpandIcon ? props.renderExpandIcon(groupRecord, false, groupKey) : null,
                                // 渲染分组内容
                                groupSectionContent,
                            ]
                        ),
                    ]
                ),
            ]
        );
    }

    // 如果是展开行（expandedRow）
    if (item?.expandedRow) {
        if (!props.expandedRowRender) {
            return null;
        }
        const record = item.record || item;
        const rowIndex = item.index ?? index;

        // 展开行不需要 cellWidths，但需要正确的 colspan
        // 排除 scrollbar 列
        const filteredColumns = (props.columns || []).filter((col: ColumnProps) => !isScrollbarColumn(col));
        const colSpan = filteredColumns.length || props.columns?.length || 0;

        return h(
            'tr',
            {
                class: `${props.prefixCls}-row-expand ${props.prefixCls}-row`,
                role: 'row',
            },
            [
                h(
                    'td',
                    {
                        colspan: colSpan,
                        class: `${props.prefixCls}-row-cell`,
                    },
                    [
                        h(
                            'div',
                            {
                                class: `${props.prefixCls}-expand-inner`,
                            },
                            [
                                typeof props.expandedRowRender === 'function'
                                    ? props.expandedRowRender(record, rowIndex, true)
                                    : null,
                            ]
                        ),
                    ]
                ),
            ]
        );
    }

    const record = item.record || item;
    const rowIndex = item.index ?? index;
    const level = item.level ?? 0;

    const getRecordKey = (r: any, key?: string | number | ((r: any) => string | number)) => {
        if (typeof key === 'function') {
            return key(r);
        }
        if (typeof key === 'string' || typeof key === 'number') {
            return get(r, key, '');
        }
        return get(r, 'key', '');
    };

    const key = getRecordKey(record, props.rowKey);
    const expanded = props.expandedRowKeys?.includes(key) || false;
    const selected = props.selectedRowKeysSet?.has(key) || false;
    const disabled = props.disabledRowKeysSet?.has(key) || false;
    const expandable = props.rowExpandable ? props.rowExpandable(record) : false;

    const rowProps = props.onRow ? props.onRow(record, rowIndex) : {};
    const { className, style, onClick, onDoubleClick, onMouseEnter, onMouseLeave, ...restRowProps } = rowProps as any;

    const rowClass = classnames(
        `${props.prefixCls}-row`,
        {
            [`${props.prefixCls}-row-selected`]: selected,
            [`${props.prefixCls}-row-disabled`]: disabled,
            [`${props.prefixCls}-row-expanded`]: expanded,
        },
        className
    );

    const cells: any[] = [];
    const cellWidths = getCellWidths.value;
    const firstDataColumnIndex = getFirstDataColumnIndex.value;
    const BodyCell = getBodyCellComponent.value;

    // 获取列的插槽名称（用于作用域插槽），与 Table.vue 中的 getColumnSlotName 一致
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

    (props.columns || []).forEach((column: ColumnProps, columnIndex: number) => {
        // 跳过 scrollbar 列
        if (isScrollbarColumn(column)) {
            return;
        }

        // 如果是 expanded column 且不需要显示，渲染空单元格
        if (isExpandedColumn(column) && !expandable) {
            cells.push(
                h(TableCell, {
                    key: columnIndex,
                    colIndex: columnIndex,
                    column: column,
                    record: record,
                    index: rowIndex,
                    prefixCls: props.prefixCls,
                    component: BodyCell,
                    expandable: false,
                })
            );
            return;
        }

        const expandableProps: any = {};
        if (expandable && columnIndex === firstDataColumnIndex) {
            expandableProps.renderExpandIcon = props.renderExpandIcon;
            expandableProps.expandable = true;
            if (props.hideExpandedColumn || false) {
                expandableProps.expandIcon = props.expandIcon != null ? props.expandIcon : true;
            }
        } else {
            expandableProps.expandable = false;
        }

        if (level != null && columnIndex === firstDataColumnIndex) {
            expandableProps.indent = level;
            const isBool = typeof props.expandIcon === 'boolean';
            const hasExpandIcon = props.expandIcon !== false || (!isBool && props.expandIcon !== null);
            // 如果 expandIcon 为空，不需要 indent
            if (!expandable && props.hideExpandedColumn && hasExpandIcon) {
                expandableProps.indent = level + 1;
            }
        }

        const fixedLeft = isFixedLeft(column) ? Math.round(arrayAdd(cellWidths, 0, columnIndex)) : false;
        const lastFixedLeft = isLastLeftFixed(props.columns || [], column);
        const fixedRight = isFixedRight(column) ? Math.round(arrayAdd(cellWidths, columnIndex + 1)) : false;
        const firstFixedRight = isFirstFixedRight(props.columns || [], column);

        // 确保固定列在虚拟滚动中也能正确显示层级
        // 当有固定列时，需要确保 z-index 正确设置
        // 这个值会在 TableCell 组件中用于样式计算

        const diyProps: any = {};
        if (!item.expandedRow) {
            const cellWidth = cellWidths[columnIndex];
            const columnWidth = typeof column.width === 'number' ? column.width : cellWidth;

            if (cellWidth && cellWidth > 0) {
                diyProps.width = cellWidth;
            } else if (columnWidth && columnWidth > 0) {
                diyProps.width = columnWidth;
            } else {
                diyProps.width = 80;
            }
        }

        const columnSlotName = getColumnSlotName(column);
        const hasSlot = columnSlotName && props.slots && !!props.slots[columnSlotName];
        let cellSlots: any = null;
        if (hasSlot && columnSlotName && props.slots[columnSlotName]) {
            // 获取列的文本值，用于插槽
            const getColumnValue = (r: any, col: ColumnProps): any => {
                if (col.dataIndex) {
                    return get(r, col.dataIndex, '');
                }
                return r;
            };
            const textValue = getColumnValue(record, column);
            const slotFn = props.slots[columnSlotName];
            // 使用闭包捕获值，创建一个函数在 Vue 渲染时调用
            // 注意：这个函数会在 TableCell 渲染 slot 时被调用，此时处于正确的渲染上下文
            // 我们使用闭包捕获的值，而不是 slotProps（虽然 slotProps 也会被传递，但我们使用自己的值）
            const capturedText = textValue;
            const capturedRecord = record;
            const capturedIndex = rowIndex;
            cellSlots = {
                [columnSlotName]: () => {
                    // 在渲染时调用 slot 函数，使用闭包捕获的值
                    return slotFn({
                        text: capturedText,
                        record: capturedRecord,
                        index: capturedIndex,
                    });
                },
            };
        }

        cells.push(
            h(
                TableCell,
                {
                    key: `${columnIndex}-${rowIndex}`, // 使用更稳定的 key
                    colIndex: columnIndex,
                    column: column,
                    record: record,
                    index: rowIndex,
                    prefixCls: props.prefixCls,
                    component: BodyCell,
                    hideExpandedColumn: props.hideExpandedColumn,
                    indentSize: props.indentSize || (props.size === 'small' ? 12 : props.size === 'middle' ? 16 : 16),
                    selected: selected,
                    expanded: expanded,
                    disabled: disabled,
                    fixedLeft: fixedLeft,
                    lastFixedLeft: lastFixedLeft,
                    fixedRight: fixedRight,
                    firstFixedRight: firstFixedRight,
                    firstDataColumnIndex: firstDataColumnIndex,
                    expandIcon: props.expandIcon,
                    columnSlotName: columnSlotName,
                    hasSlot: hasSlot,
                    ...expandableProps,
                    ...diyProps,
                },
                cellSlots || {}
            )
        );
    });

    const rowStyle: CSSProperties = {
        ...style,
    };

    const rowEvents: any = {};
    if (onClick) rowEvents.onClick = onClick;
    if (onDoubleClick) rowEvents.onDblclick = onDoubleClick;
    if (onMouseEnter) rowEvents.onMouseenter = onMouseEnter;
    if (onMouseLeave) rowEvents.onMouseleave = onMouseLeave;

    return h(
        'tr',
        {
            class: rowClass,
            style: rowStyle,
            role: 'row',
            'data-row-key': key,
            'aria-rowindex': rowIndex + 1,
            'aria-expanded': expandable ? expanded : undefined,
            'aria-level': level != null ? level + 1 : undefined,
            ...rowEvents,
            ...restRowProps,
        },
        cells
    );
};

/**
 * 使用二分查找优化可见范围计算
 * 参考 react-window 的实现
 */
const getOffsetForIndex = (index: number): number => {
    if (index <= 0) {
        return 0;
    }

    let offset = 0;
    // 优化：对于小索引，直接计算；对于大索引，可以考虑缓存
    const maxIndex = Math.min(index, allData.value.length);

    for (let i = 0; i < maxIndex; i++) {
        offset += getItemSize(i);
    }
    return offset;
};

const findNearestItem = (offset: number): number => {
    const dataLength = allData.value.length;
    if (dataLength === 0) {
        return 0;
    }

    let left = 0;
    let right = dataLength - 1;
    let bestGuess = 0;

    // 如果 offset 小于等于 0，直接返回 0
    if (offset <= 0) {
        return 0;
    }

    // 如果 offset 大于总高度，返回最后一个索引
    const totalHeight = getOffsetForIndex(dataLength);
    if (offset >= totalHeight) {
        return dataLength - 1;
    }

    while (left <= right) {
        const currentGuess = Math.floor((left + right) / 2);
        const currentOffset = getOffsetForIndex(currentGuess);
        const itemSize = getItemSize(currentGuess);

        // 检查 offset 是否在当前项的范围内
        if (currentOffset <= offset && currentOffset + itemSize > offset) {
            return currentGuess;
        }

        if (currentOffset <= offset) {
            // offset 在当前项之后，向右查找
            left = currentGuess + 1;
            bestGuess = currentGuess;
        } else {
            // offset 在当前项之前，向左查找
            right = currentGuess - 1;
        }
    }

    return Math.min(bestGuess, dataLength - 1);
};

/**
 * 完全按照 CellSizeAndPositionManager.getVisibleCellRange 的算法实现
 * 参考 react-window 和 react-virtualized 的实现
 */
const updateVisibleItems = (currentScrollTop: number) => {
    if (!containerRef.value || allData.value.length === 0) {
        return;
    }

    const containerHeight = containerRef.value.clientHeight;
    // 如果容器高度为 0，说明还没有渲染完成，延迟计算
    if (containerHeight === 0) {
        nextTick(() => {
            if (containerRef.value && containerRef.value.clientHeight > 0) {
                updateVisibleItems(currentScrollTop);
            }
        });
        return;
    }

    const overscanCount = get(props.virtualized, 'overscanCount', 5) as number;

    // 完全按照 CellSizeAndPositionManager.getVisibleCellRange 的算法
    const containerSize = containerHeight;
    let offset = currentScrollTop;
    const maxOffset = offset + containerSize;

    // 使用二分查找找到可见范围的起始索引
    const start = findNearestItem(offset);

    // 获取起始项的位置和大小
    const startOffset = getOffsetForIndex(start);
    const startItemSize = getItemSize(start);

    // offset 更新为起始项的底部位置（即下一项的顶部位置）
    offset = startOffset + startItemSize;

    // 从 start 开始，累加后续项的高度，直到超过 maxOffset
    let stop = start;
    while (offset < maxOffset && stop < allData.value.length - 1) {
        stop++;
        const itemSize = getItemSize(stop);
        offset += itemSize;
    }

    // 确保索引在有效范围内
    const startIndex = Math.max(0, Math.min(start, allData.value.length - 1));
    const endIndex = Math.max(startIndex, Math.min(stop, allData.value.length - 1));

    // 应用 overscan
    const overscanStartIndex = Math.max(0, startIndex - overscanCount);
    const overscanStopIndex = Math.min(allData.value.length - 1, endIndex + overscanCount);

    // 只有在可见范围真正发生变化时才更新，避免不必要的重新渲染
    const currentRange = visibleRange.value;
    const hasChanged =
        currentRange.overscanStartIndex !== overscanStartIndex ||
        currentRange.overscanStopIndex !== overscanStopIndex ||
        currentRange.startIndex !== startIndex ||
        currentRange.endIndex !== endIndex;

    if (hasChanged) {
        visibleRange.value = {
            startIndex,
            endIndex,
            overscanStartIndex,
            overscanStopIndex,
        };

        emit('items-rendered', {
            overscanStartIndex,
            overscanStopIndex,
            visibleStartIndex: startIndex,
            visibleStopIndex: endIndex,
        });
    }
};

/**
 * 暴露类似 react-window List 的 API
 * Scroll to the specified item
 * @param index - The index of the item to scroll to
 * @param align - Alignment option: 'auto' | 'smart' | 'center' | 'end' | 'start'
 */
const scrollToItem = (index: number, align: 'auto' | 'smart' | 'center' | 'end' | 'start' = 'auto') => {
    if (!containerRef.value || index < 0 || index >= allData.value.length) {
        return;
    }

    // 计算目标项的顶部位置
    const targetTop = getOffsetForIndex(index);
    const containerHeight = containerRef.value.clientHeight;
    const itemHeight = getItemSize(index);
    const currentScrollTop = containerRef.value.scrollTop;
    const visibleTop = currentScrollTop;
    const visibleBottom = currentScrollTop + containerHeight;
    const itemTop = targetTop;
    const itemBottom = targetTop + itemHeight;

    // 检查项目是否已经在可见范围内
    const isAlreadyVisible = itemTop >= visibleTop && itemBottom <= visibleBottom;
    if (isAlreadyVisible && align === 'auto') {
        return; // 已经可见，不需要滚动
    }

    let finalScrollTop = currentScrollTop;

    // 根据 align 参数调整滚动位置
    switch (align) {
        case 'start':
            finalScrollTop = itemTop;
            break;
        case 'center':
            finalScrollTop = itemTop - (containerHeight - itemHeight) / 2;
            break;
        case 'end':
            finalScrollTop = itemBottom - containerHeight;
            break;
        case 'smart': {
            // 如果目标项在可见范围内，不滚动
            if (isAlreadyVisible) {
                return;
            }
            // 如果目标项距离可见区域小于一个视口，滚动尽可能少
            const viewportDistance = Math.min(Math.abs(itemTop - visibleTop), Math.abs(itemBottom - visibleBottom));
            if (viewportDistance < containerHeight) {
                // 滚动尽可能少以确保项目可见
                if (itemTop < visibleTop) {
                    finalScrollTop = itemTop;
                } else {
                    finalScrollTop = itemBottom - containerHeight;
                }
            } else {
                // 如果距离超过一个视口，居中显示
                finalScrollTop = itemTop - (containerHeight - itemHeight) / 2;
            }
            break;
        }
        case 'auto':
        default: {
            // auto: 滚动尽可能少以确保项目可见
            if (itemTop < visibleTop) {
                finalScrollTop = itemTop;
            } else if (itemBottom > visibleBottom) {
                finalScrollTop = itemBottom - containerHeight;
            } else {
                // 已经可见，不滚动
                return;
            }
            break;
        }
    }

    // 确保滚动位置有效
    const maxScrollTop = Math.max(0, containerRef.value.scrollHeight - containerHeight);
    finalScrollTop = Math.max(0, Math.min(maxScrollTop, finalScrollTop));

    // 只有在位置真正变化时才滚动
    if (finalScrollTop !== currentScrollTop) {
        containerRef.value.scrollTop = finalScrollTop;
        // 直接设置 scrollTop 不会触发 scroll 事件，需要手动更新可见项
        scrollTop.value = finalScrollTop;
        updateVisibleItems(finalScrollTop);
    }
};

defineExpose({
    /**
     * 暴露 containerRef，供 Table.vue 在虚拟滚动时访问滚动容器
     * 用于 handleWheelNonPassive 等需要直接操作滚动容器的场景
     */
    containerRef,
    /**
     * Scroll to the specified offset (scrollTop)
     * @param scrollOffset - The offset to scroll to
     */
    scrollTo: (scrollOffset: number) => {
        if (containerRef.value) {
            containerRef.value.scrollTop = scrollOffset;
            scrollTop.value = scrollOffset;
            updateVisibleItems(scrollOffset);
        }
    },
    /**
     * Scroll to the specified item
     * @param index - The index of the item to scroll to
     * @param align - Alignment option: 'auto' | 'smart' | 'center' | 'end' | 'start'
     */
    scrollToItem,
    // 保持向后兼容的别名
    scrollToOffset: (offset: number) => {
        if (containerRef.value) {
            containerRef.value.scrollTop = offset;
            scrollTop.value = offset;
            updateVisibleItems(offset);
        }
    },
    scrollToTop: () => {
        if (containerRef.value) {
            containerRef.value.scrollTop = 0;
            scrollTop.value = 0;
            updateVisibleItems(0);
        }
    },
});

let scrollTimeout: NodeJS.Timeout | null = null;
const scrollDebounceDelay = 16; // 约 60fps

const handleScroll = (e: Event) => {
    const target = e.target as HTMLElement;
    const newScrollTop = target.scrollTop;
    const newScrollLeft = target.scrollLeft;

    if (props.onScroll) {
        const prevTop = scrollTop.value;
        props.onScroll({
            scrollOffset: newScrollTop,
            scrollDirection: newScrollTop > prevTop ? 'forward' : 'backward',
        });
    }

    scrollTop.value = newScrollTop;
    scrollLeft.value = newScrollLeft;

    if (props.handleBodyScroll) {
        props.handleBodyScroll(e);
    }

    // 使用防抖来优化性能，避免频繁计算
    if (scrollTimeout) {
        clearTimeout(scrollTimeout);
    }

    scrollTimeout = setTimeout(() => {
        // 计算可见项
        updateVisibleItems(newScrollTop);
        scrollTimeout = null;
    }, scrollDebounceDelay);
};

const handleWheel = (e: WheelEvent) => {
    if (props.handleWheel) {
        props.handleWheel(e);
    }
};

let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
    // 使用 nextTick 确保 DOM 已经完全渲染
    nextTick(() => {
        // 如果容器已准备好，直接初始化
        if (containerRef.value && containerRef.value.clientHeight > 0) {
            updateVisibleItems(containerRef.value.scrollTop || 0);
            return;
        }

        // 否则使用 requestAnimationFrame 等待渲染
        requestAnimationFrame(() => {
            if (containerRef.value && containerRef.value.clientHeight > 0) {
                updateVisibleItems(containerRef.value.scrollTop || 0);
            } else if (containerRef.value && typeof ResizeObserver !== 'undefined') {
                // 使用 ResizeObserver 监听容器大小变化
                resizeObserver = new ResizeObserver(() => {
                    if (containerRef.value && containerRef.value.clientHeight > 0) {
                        updateVisibleItems(containerRef.value.scrollTop || 0);
                        resizeObserver?.disconnect();
                        resizeObserver = null;
                    }
                });
                resizeObserver.observe(containerRef.value);
            }
        });
    });
});

onUnmounted(() => {
    if (resizeObserver) {
        resizeObserver.disconnect();
        resizeObserver = null;
    }
    if (scrollTimeout) {
        clearTimeout(scrollTimeout);
        scrollTimeout = null;
    }
    // 清理缓存
    itemSizeCache.clear();
});

watch(
    () => allData.value,
    (newData) => {
        if (newData && newData.length > 0) {
            // 清空缓存，因为数据源变化了
            itemSizeCache.clear();

            // 使用 nextTick 确保 DOM 已经更新
            nextTick(() => {
                // 如果容器还没有初始化，先尝试初始化
                if (!containerRef.value || containerRef.value.clientHeight === 0) {
                    // 使用 requestAnimationFrame 等待容器渲染
                    requestAnimationFrame(() => {
                        if (containerRef.value && containerRef.value.clientHeight > 0) {
                            // 容器已准备好，计算可见范围
                            updateVisibleItems(containerRef.value.scrollTop || 0);
                        } else {
                            // 容器还未准备好，设置一个初始可见范围
                            // 这样 virtualizedData 就不会为空
                            visibleRange.value = {
                                startIndex: 0,
                                endIndex: Math.min(9, newData.length - 1),
                                overscanStartIndex: 0,
                                overscanStopIndex: Math.min(14, newData.length - 1),
                            };
                        }
                    });
                } else {
                    // 容器已存在，更新可见项
                    updateVisibleItems(containerRef.value.scrollTop || 0);
                }
            });
        } else if (newData && newData.length === 0) {
            // 数据为空时，重置可见范围
            visibleRange.value = {
                startIndex: -1,
                endIndex: -1,
                overscanStartIndex: -1,
                overscanStopIndex: -1,
            };
            // 清空缓存
            itemSizeCache.clear();
        }
    },
    { immediate: true }
);

const cachedScrollTop = ref(0);

watch(
    () => props.dataSource,
    () => {
        if (containerRef.value) {
            // 保存当前滚动位置
            cachedScrollTop.value = containerRef.value.scrollTop;
            nextTick(() => {
                // 恢复滚动位置
                containerRef.value!.scrollTop = cachedScrollTop.value;
                updateVisibleItems(cachedScrollTop.value);
            });
        }
    }
);

// 监听 expandedRowKeys 变化，保持滚动位置（展开/收起时）
watch(
    () => props.expandedRowKeys,
    (newKeys, oldKeys) => {
        // 只有在实际发生变化时才处理
        if (containerRef.value && JSON.stringify(newKeys) !== JSON.stringify(oldKeys)) {
            // 保存当前滚动位置
            const currentScrollTop = containerRef.value.scrollTop;
            cachedScrollTop.value = currentScrollTop;

            // 清空缓存，因为展开/收起会改变数据结构
            itemSizeCache.clear();

            nextTick(() => {
                if (containerRef.value) {
                    containerRef.value.scrollTop = currentScrollTop;
                    updateVisibleItems(currentScrollTop);
                }
            });
        }
    },
    { deep: true }
);
</script>
