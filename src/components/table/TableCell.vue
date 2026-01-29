<template>
    <component
        :is="CellComponent"
        v-if="cellProps.rowspan !== 0 && cellProps.colspan !== 0"
        :class="cellCls"
        :style="cellStyle"
        v-bind="cellProps"
        @click="handleClick"
    >
        <template v-if="useFullRender">
            <RenderVNode
                v-if="cellContent && cellContent !== 'selection' && typeof cellContent === 'function'"
                :render-fn="cellContent"
            />
            <span
                v-else-if="cellContent && cellContent !== 'selection' && typeof cellContent !== 'function'"
                :class="`${prefixCls}-cell-content`"
            >
                {{ cellContent }}
            </span>
        </template>
        <template v-else>
            <span
                v-if="indent > 0"
                :class="`${prefixCls}-row-indent indent-level-${indent}`"
                :style="{ paddingLeft: `${indentSize * indent}px` }"
            />
            <span v-if="shouldRenderExpandIcon && expandIconNode" style="display: inline-flex; align-items: center">
                <RenderVNode :render-fn="expandIconNode" />
                <slot
                    v-if="hasSlot && columnSlotName"
                    :name="columnSlotName"
                    :text="getColumnTextValue"
                    :record="record"
                    :index="index"
                />
                <RenderVNode
                    v-else-if="cellContent && cellContent !== 'selection' && typeof cellContent === 'function'"
                    :render-fn="cellContent"
                />
                <span
                    v-else-if="cellContent && cellContent !== 'selection' && typeof cellContent !== 'function'"
                    :class="`${prefixCls}-cell-content`"
                >
                    {{ cellContent }}
                </span>
            </span>
            <TableSelectionCell
                v-else-if="isSelectionColumn(column) && selectionCellProps"
                v-bind="selectionCellProps"
            />
            <slot
                v-else-if="hasSlot && columnSlotName"
                :name="columnSlotName"
                :text="getColumnTextValue"
                :record="record"
                :index="index"
            />
            <RenderVNode
                v-else-if="cellContent && cellContent !== 'selection' && typeof cellContent === 'function'"
                :render-fn="cellContent"
            />
            <span
                v-else-if="cellContent && cellContent !== 'selection' && typeof cellContent !== 'function'"
                :class="`${prefixCls}-cell-content`"
            >
                {{ cellContent }}
            </span>
        </template>
    </component>
</template>

<script setup lang="ts">
import { computed, defineComponent, isVNode, h } from 'vue';
import { getRTLAlign, getRTLFlexAlign } from '@douyinfe/semi-foundation/table/utils';
import { get, isFunction } from 'lodash-es';
import classnames from 'classnames';
import { cssClasses, numbers } from '@douyinfe/semi-foundation/table/constants';
import { isSelectionColumn, isExpandedColumn } from '@douyinfe/semi-foundation/table/utils';
import { useTableContext } from './table-context';
import TableSelectionCell from './TableSelectionCell.vue';
import type { ColumnProps, ExpandIcon } from './interface';
import type { CSSProperties } from 'vue';

const RenderVNode = defineComponent({
    name: 'RenderVNode',
    props: {
        renderFn: {
            type: Function,
            required: true,
        },
    },
    setup(props) {
        return () => {
            if (!props.renderFn) {
                return null;
            }
            const result = props.renderFn();

            if (result === null || result === undefined) {
                return null;
            }

            // 处理字符串和数字
            if (typeof result === 'string' || typeof result === 'number') {
                return String(result);
            }

            // 使用 isVNode 检查，确保是有效的 VNode
            if (isVNode(result)) {
                return result;
            }

            // 处理数组（可能是 VNode 数组）
            if (Array.isArray(result)) {
                return result;
            }

            // 如果 result 是对象但不是 VNode，返回 null 避免显示 [object Object]
            return null;
        };
    },
});

defineOptions({
    name: 'SemiTableCell',
});

interface Props {
    record?: Record<string, any>;
    prefixCls?: string;
    index?: number;
    fixedLeft?: boolean | number;
    lastFixedLeft?: boolean;
    fixedRight?: boolean | number;
    firstFixedRight?: boolean;
    indent?: number;
    indentSize?: number;
    column?: ColumnProps;
    expandIcon?: ExpandIcon;
    renderExpandIcon?: (record: Record<string, any>) => any;
    hideExpandedColumn?: boolean;
    component?: any;
    onClick?: (record: Record<string, any>, e: MouseEvent) => void;
    isSection?: boolean;
    width?: string | number;
    height?: string | number;
    selected?: boolean;
    expanded?: boolean;
    disabled?: boolean;
    expandable?: boolean;
    colIndex?: number;
    firstDataColumnIndex?: number;
    selectionCellProps?: any;
    columnSlotName?: string | null;
    hasSlot?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    indent: 0,
    indentSize: numbers.DEFAULT_INDENT_WIDTH,
    prefixCls: cssClasses.PREFIX,
    component: 'td',
    column: () => ({}),
    firstDataColumnIndex: 0,
});

const CellComponent = computed(() => props.component || 'td');
const tableContext = useTableContext();

const cellCls = computed(() => {
    const { column, fixedLeft, fixedRight, lastFixedLeft, firstFixedRight, isSection } = props;
    const { ellipsis } = column || {};
    const fixedLeftFlag = fixedLeft === true || typeof fixedLeft === 'number';
    const fixedRightFlag = fixedRight === true || typeof fixedRight === 'number';
    return classnames(`${props.prefixCls}-row-cell`, column.className, {
        // 兼容 offset=0 的场景（第一列固定最常见）
        [`${props.prefixCls}-cell-fixed-left`]: fixedLeftFlag,
        [`${props.prefixCls}-cell-fixed-right`]: fixedRightFlag,
        [`${props.prefixCls}-cell-fixed-left-last`]: lastFixedLeft,
        [`${props.prefixCls}-cell-fixed-right-first`]: firstFixedRight,
        [`${props.prefixCls}-cell-selection`]: isSelectionColumn(column),
        [`${props.prefixCls}-cell-expand`]: isExpandedColumn(column),
        [`${props.prefixCls}-cell-section`]: isSection,
        [`${props.prefixCls}-row-cell-ellipsis`]: ellipsis,
    });
});

const cellStyle = computed<CSSProperties>(() => {
    const style: CSSProperties = {};
    const direction = tableContext.direction ?? null;
    let directionValue: any = direction;
    if (typeof direction === 'object' && direction && 'value' in direction) {
        directionValue = (direction as any).value;
    }
    const isRTL = directionValue === 'rtl';
    const fixedLeftFlag = props.fixedLeft === true || typeof props.fixedLeft === 'number';
    const fixedRightFlag = props.fixedRight === true || typeof props.fixedRight === 'number';

    if (fixedLeftFlag || fixedRightFlag) {
        style.position = 'sticky';
        if (props.lastFixedLeft || props.firstFixedRight) {
            style.zIndex = 102;
        } else {
            style.zIndex = 101;
        }

        if (fixedLeftFlag) {
            const xPositionKey = isRTL ? 'right' : 'left';
            const offset = typeof props.fixedLeft === 'number' ? props.fixedLeft : 0;
            style[xPositionKey] = `${offset}px`;
        } else if (fixedRightFlag) {
            const xPositionKey = isRTL ? 'left' : 'right';
            const offset = typeof props.fixedRight === 'number' ? props.fixedRight : 0;
            style[xPositionKey] = `${offset}px`;
        }
    }

    if (props.width) {
        const widthValue = typeof props.width === 'number' ? `${props.width}px` : props.width;
        style.width = widthValue;
        style.flexShrink = 0;
        style.flexGrow = 0;
    }
    if (props.height) {
        style.height = typeof props.height === 'number' ? `${props.height}px` : props.height;
    }

    if (props.column?.align) {
        const textAlign = getRTLAlign(props.column.align, directionValue);
        const justifyContent = getRTLFlexAlign(props.column.align, directionValue);
        style.textAlign = textAlign;
        style.justifyContent = justifyContent;
    }

    return style;
});

// 用于存储 render 返回的对象（如果有 props）
const renderResult = computed(() => {
    const { column, record, index } = props;
    if (!column || !record || !column.render) {
        return null;
    }

    const value = column.dataIndex ? get(record, column.dataIndex) : record;

    // 构建 renderOptions，避免用户代码解构失败
    const renderOptions: any = {
        expandIcon: null,
        selection: null,
        indentText: null,
    };

    // 如果 useFullRender 为 true，填充实际值
    if (column.useFullRender === true) {
        renderOptions.expandIcon = expandIconNode.value ? expandIconNode.value() : null;

        // 添加 selection（如果存在 rowSelection）
        if (tableContext.renderSelection && record) {
            renderOptions.selection = tableContext.renderSelection(record, false);
        }

        // 添加 indentText
        if (props.indent && props.indentSize) {
            renderOptions.indentText = h('span', {
                style: { paddingLeft: `${props.indentSize * props.indent}px` },
                class: `${props.prefixCls}-row-indent indent-level-${props.indent}`,
            });
        }
    }

    const result = column.render(value, record, index || 0, renderOptions);

    // 如果 render 返回的是对象且包含 props 属性（行列合并场景）
    if (result && typeof result === 'object' && !isVNode(result) && 'props' in result) {
        return result;
    }

    return null;
});

const cellProps = computed(() => {
    const { column, record, index } = props;
    const customProps = isFunction(column.onCell) ? column.onCell(record, index) : {};
    const renderProps = renderResult.value?.props || {};
    const mergedProps = { ...customProps, ...renderProps };
    const normalizedProps: Record<string, any> = {};
    for (const key in mergedProps) {
        if (key === 'rowSpan') {
            normalizedProps.rowspan = mergedProps[key];
        } else if (key === 'colSpan') {
            normalizedProps.colspan = mergedProps[key];
        } else {
            normalizedProps[key] = mergedProps[key];
        }
    }
    return normalizedProps;
});

const expandIconNode = computed(() => {
    if (props.renderExpandIcon && props.record) {
        const result = props.renderExpandIcon(props.record);
        if (typeof result === 'function') {
            return result;
        }
        return () => result;
    }
    return null;
});

const useFullRender = computed(() => props.column?.useFullRender === true);

const shouldRenderExpandIcon = computed(() => {
    // 如果使用 useFullRender，不单独渲染 expandIcon（在 render 函数中处理）
    if (useFullRender.value) {
        return false;
    }
    // 如果明确标记为不可展开，不渲染
    // 如果 expandable 是 undefined，也视为不可展开（默认行为）
    if (props.expandable !== true) {
        return false;
    }
    // 没有展开能力时，不渲染
    if (!props.renderExpandIcon || !props.record) {
        return false;
    }
    // 如果存在单独的展开列，只在展开列渲染
    if (isExpandedColumn(props.column)) {
        return true;
    }
    // hideExpandedColumn=true 时，将展开箭头渲染到首列（与 Semi 表格交互习惯一致）
    return Boolean(props.hideExpandedColumn && props.colIndex === props.firstDataColumnIndex);
});

const getColumnTextValue = computed(() => {
    const { column, record } = props;
    if (!column || !record) {
        return '';
    }
    if (column.dataIndex) {
        return get(record, column.dataIndex, '');
    }
    return record;
});

const cellContent = computed(() => {
    const { column, record, index } = props;
    if (!column) {
        return null;
    }

    if (isSelectionColumn(column)) {
        return 'selection';
    }

    if (isExpandedColumn(column)) {
        return null;
    }

    if (props.hasSlot && props.columnSlotName) {
        return null;
    }

    // 如果有 render 函数，返回一个渲染函数
    if (column.render) {
        const value = column.dataIndex ? get(record, column.dataIndex) : record;
        const useFullRender = column.useFullRender === true;

        // 返回一个函数，RenderVNode 组件会调用它
        return () => {
            // 构建 renderOptions，即使 useFullRender 为 false 也传递，避免用户代码解构失败
            const renderOptions: any = {};

            // 如果 useFullRender 为 true，传递 selection、expandIcon、indentText
            if (useFullRender) {
                renderOptions.expandIcon = expandIconNode.value ? expandIconNode.value() : null;

                // 添加 selection（如果存在 rowSelection）
                if (tableContext.renderSelection && record) {
                    renderOptions.selection = tableContext.renderSelection(record, false);
                }

                // 添加 indentText
                if (props.indent && props.indentSize) {
                    renderOptions.indentText = h('span', {
                        style: { paddingLeft: `${props.indentSize * props.indent}px` },
                        class: `${props.prefixCls}-row-indent indent-level-${props.indent}`,
                    });
                } else {
                    renderOptions.indentText = null;
                }
            } else {
                // 即使 useFullRender 为 false，也传递空对象，避免用户代码解构失败
                // 用户代码可以安全地解构：{ expandIcon, selection, indentText } = {} 或 options || {}
                renderOptions.expandIcon = null;
                renderOptions.selection = null;
                renderOptions.indentText = null;
            }

            const result = column.render!(value, record, index || 0, renderOptions);
            // 如果返回的是 { children, props } 对象，提取 children
            if (result && typeof result === 'object' && !isVNode(result) && 'children' in result) {
                return result.children;
            }
            return result;
        };
    }

    // 普通数据列，返回文本内容
    if (column.dataIndex) {
        const value = get(record, column.dataIndex, '');
        // 直接返回字符串，不使用函数
        return value;
    }

    return null;
});

const handleClick = (e: MouseEvent) => {
    if (props.onClick && props.record) {
        props.onClick(props.record, e);
    }
};
</script>
