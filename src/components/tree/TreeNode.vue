<template>
    <ul v-if="empty" :class="wrapperCls">
        <li :class="`${prefixcls}-label ${prefixcls}-label-empty`" x-semi-prop="emptyContent">
            {{ emptyContent }}
        </li>
    </ul>
    <li
        v-else
        ref="refNode"
        :class="nodeCls"
        role="treeitem"
        :aria-disabled="isDisabled"
        :aria-checked="checked"
        :aria-selected="selected"
        :aria-setsize="setsize"
        :aria-posinset="posinset"
        :aria-expanded="expanded"
        :aria-level="level + 1"
        :data-key="eventKey"
        :style="style"
        :draggable="draggableAttr"
        @click="onClick"
        @keypress="handleliEnterPress"
        @contextmenu="onContextMenu"
        @dblclick="onDoubleClick"
        @dragstart="onDragStart"
        @dragenter="onDragEnter"
        @dragover="onDragOver"
        @dragleave="onDragLeave"
        @drop="onDrop"
        @dragend="onDragEnd"
    >
        <Indent :showLine="showLine" :prefixcls="prefixcls" :level="level" :isEnd="isEnd" />
        <RenderVNode :render-fn="renderArrow" />
        <span :class="labelCls">
            <div v-if="multiple" role="none" @click.stop="onCheck">
                <Checkbox
                    aria-label="Toggle the checked state of checkbox"
                    :value="eventKey"
                    :checked="checked"
                    :indeterminate="halfChecked"
                    :disabled="Boolean(isDisabled)"
                />
            </div>
            <RenderVNode :render-fn="renderIcon" />
            <span :class="`${prefixcls}-label-text`">
                <RenderVNode :render-fn="renderLabel" />
            </span>
        </span>
    </li>
</template>

<script setup lang="ts">
import { h, computed, ref, inject, defineComponent } from 'vue';

defineOptions({
    name: 'SemiTreeNode',
});
import cls from 'classnames';
import { cssClasses } from '@douyinfe/semi-foundation/tree/constants';
import isEnterPress from '@douyinfe/semi-foundation/utils/isEnterPress';
import { debounce, isFunction, get, isEmpty } from 'lodash-es';
import { IconTreeTriangleDown, IconFile, IconFolder, IconFolderOpen } from '../icons';
import Checkbox from '../checkbox';
import Spin from '../spin';
import { TreeNodeProps } from './interface';
import Highlight from '../highlight';
import Indent from './Indent.vue';
import { TreeContextKey, TreeContextValue } from './treeContext';

// Helper component to render dynamic content - calls render function in proper render context
const RenderVNode = defineComponent({
    props: {
        renderFn: {
            type: Function,
            default: null,
        },
    },
    render() {
        if (!this.renderFn) {
            return null;
        }
        // Call the render function in this component's render context
        const result = this.renderFn();
        if (result === null || result === undefined) {
            return null;
        }
        // For strings and numbers, return them directly - Vue will create text nodes
        if (typeof result === 'string' || typeof result === 'number') {
            return String(result);
        }
        // For VNodes and other objects, return as-is
        return result;
    },
});

const props = withDefaults(defineProps<TreeNodeProps>(), {
    level: 0,
    empty: false,
    style: () => ({}),
});

const prefixcls = cssClasses.PREFIX_OPTION;
const context = inject<TreeContextValue>(TreeContextKey);
const refNode = ref<HTMLElement>();

// Expose context properties to template
const multiple = computed(() => context?.multiple);

const debounceSelect = debounce(onSelect, 500, {
    leading: true,
    trailing: false,
});

function onSelect(e: MouseEvent | KeyboardEvent) {
    context?.onNodeSelect?.(e, props);
}

function onExpand(e: MouseEvent | KeyboardEvent) {
    e?.stopPropagation?.();
    (e as any).nativeEvent?.stopImmediatePropagation?.();
    context?.onNodeExpand?.(e, props);
}

function onCheck(e: MouseEvent | KeyboardEvent) {
    if (isDisabled.value) {
        return;
    }
    e.stopPropagation();
    (e as any).nativeEvent?.stopImmediatePropagation?.();
    context?.onNodeCheck?.(e, props);
}

function handleCheckEnterPress(e: KeyboardEvent) {
    if (isEnterPress(e)) {
        onCheck(e);
    }
}

function onContextMenu(e: MouseEvent) {
    context?.onNodeRightClick?.(e, props);
}

function onClick(e: MouseEvent | KeyboardEvent) {
    const { expandAction } = context || {};
    if (expandAction === 'doubleClick') {
        debounceSelect(e);
        return;
    }
    onSelect(e);
    if (expandAction === 'click') {
        onExpand(e);
    }
}

function handleliEnterPress(e: KeyboardEvent) {
    if (isEnterPress(e)) {
        onClick(e);
    }
}

function onDoubleClick(e: MouseEvent) {
    const { expandAction, onNodeDoubleClick } = context || {};
    e.stopPropagation();
    (e as any).nativeEvent?.stopImmediatePropagation?.();
    if (isFunction(onNodeDoubleClick)) {
        onNodeDoubleClick(e, props);
    }
    if (expandAction === 'doubleClick') {
        onExpand(e);
    }
}

function onDragStart(e: DragEvent) {
    context?.onNodeDragStart?.(e, { ...props, nodeInstance: refNode.value });
    e.stopPropagation();

    try {
        // ie throw error
        // firefox-need-it
        e.dataTransfer?.setData('text/plain', '');
    } catch (error) {
        // empty
    }
}

function onDragEnter(e: DragEvent) {
    context?.onNodeDragEnter?.(e, { ...props, nodeInstance: refNode.value });
    e.preventDefault();
    e.stopPropagation();
}

function onDragOver(e: DragEvent) {
    context?.onNodeDragOver?.(e, { ...props, nodeInstance: refNode.value });
    e.preventDefault();
    e.stopPropagation();
}

function onDragLeave(e: DragEvent) {
    context?.onNodeDragLeave?.(e, { ...props, nodeInstance: refNode.value });
    e.stopPropagation();
}

function onDragEnd(e: DragEvent) {
    context?.onNodeDragEnd?.(e, { ...props, nodeInstance: refNode.value });
    e.stopPropagation();
}

function onDrop(e: DragEvent) {
    context?.onNodeDrop?.(e, { ...props, nodeInstance: refNode.value });
    e.preventDefault();
    e.stopPropagation();
}

function getNodeChildren() {
    const { children } = props;
    return children || [];
}

const isLeaf = computed(() => {
    const { isLeaf: propIsLeaf, loaded } = props;
    const { loadData } = context || {};
    const nodeChildren = getNodeChildren();
    const hasChildren = nodeChildren.length !== 0;

    // If propIsLeaf is explicitly set to true, it's a leaf
    if (propIsLeaf === true) {
        return true;
    }

    // If propIsLeaf is explicitly set to false, check if it should show expand icon
    // Only show expand icon if:
    // 1. Has loadData (can load children asynchronously), OR
    // 2. Already has children
    if (propIsLeaf === false) {
        // If has loadData or already has children, it's not a leaf
        if (loadData || hasChildren) {
            return false;
        }
        // If no loadData and no children, treat as leaf (no expand icon)
        return true;
    }

    // Otherwise, determine based on actual children and loadData
    // If loadData is provided and node is not loaded yet, it's not a leaf
    if (loadData && !loaded && !hasChildren) {
        return false;
    }

    // If no loadData, or already loaded, determine by actual children
    return (!loadData && !hasChildren) || (loadData && loaded && !hasChildren);
});

const isDisabled = computed(() => {
    const { disabled } = props;
    const { treeDisabled } = context || {};

    if (disabled === false) {
        return false;
    }

    return Boolean(treeDisabled || disabled);
});

function renderArrow() {
    const showIcon = !isLeaf.value;
    const { loading, expanded, showLine, expandIcon } = props;
    if (loading) {
        return h(Spin, { wrapperClassName: `${prefixcls}-spin-icon` });
    }
    if (showIcon) {
        if (expandIcon) {
            if (typeof expandIcon === 'function') {
                return expandIcon({
                    onClick: onExpand,
                    className: `${prefixcls}-expand-icon`,
                    expanded,
                });
            } else {
                return expandIcon;
            }
        }
        return h(IconTreeTriangleDown, {
            role: 'button',
            'aria-label': `${expanded ? 'Expand' : 'Collapse'} the tree item`,
            class: `${prefixcls}-expand-icon`,
            size: 'small',
            onClick: onExpand,
        });
    }
    if (showLine) {
        if (isLeaf.value) {
            return h('span', { class: cls(`${prefixcls}-switcher`) }, [
                h('span', { class: `${prefixcls}-switcher-leaf-line` }),
            ]);
        }
        return null;
    }
    return h('span', { class: `${prefixcls}-empty-icon` });
}

function renderIcon() {
    const { directory, treeIcon } = context || {};
    const { expanded, icon, data } = props;
    if (icon) {
        return icon;
    }
    if (treeIcon) {
        return typeof treeIcon === 'function' ? treeIcon(props) : treeIcon;
    }
    if (directory) {
        const hasChild = !isLeaf.value;
        if (!hasChild) {
            return h(IconFile, { class: `${prefixcls}-item-icon` });
        } else {
            return expanded
                ? h(IconFolderOpen, { class: `${prefixcls}-item-icon` })
                : h(IconFolder, { class: `${prefixcls}-item-icon` });
        }
    }
    return null;
}

function renderLabel() {
    const { renderLabel } = context || {};
    const { label, keyword, data, filtered, treeNodeFilterProp } = props;
    if (isFunction(renderLabel)) {
        return renderLabel(label, data, keyword);
    } else if (typeof label === 'string' && filtered && keyword) {
        return h(Highlight, {
            highlightClassName: `${prefixcls}-highlight`,
            component: 'span',
            sourceString: label,
            searchWords: [keyword],
        });
    } else {
        return label;
    }
}

const wrapperCls = computed(() =>
    cls(prefixcls, {
        [`${prefixcls}-empty`]: true,
    })
);

const nodeCls = computed(() => {
    const { eventKey, expanded, selected, checked, level, active } = props;
    const { multiple, draggable, renderFullLabel, dragOverNodeKey, dropPosition, labelEllipsis } = context || {};
    const isEndNode = props.isEnd?.length > 0 ? props.isEnd[props.isEnd.length - 1] : false;
    const disabled = isDisabled.value;
    const dragOver = dragOverNodeKey === eventKey && dropPosition === 0;
    const dragOverGapTop = dragOverNodeKey === eventKey && dropPosition === -1;
    const dragOverGapBottom = dragOverNodeKey === eventKey && dropPosition === 1;

    return cls(prefixcls, {
        [`${prefixcls}-level-${level + 1}`]: true,
        [`${prefixcls}-fullLabel-level-${level + 1}`]: renderFullLabel,
        [`${prefixcls}-collapsed`]: !expanded,
        [`${prefixcls}-disabled`]: Boolean(disabled),
        // Both -selected and -active can be set (same as React version)
        [`${prefixcls}-selected`]: selected,
        [`${prefixcls}-active`]: !multiple && active,
        [`${prefixcls}-ellipsis`]: labelEllipsis,
        [`${prefixcls}-drag-over`]: !disabled && dragOver,
        [`${prefixcls}-draggable`]: !disabled && draggable && !renderFullLabel,
        [`${prefixcls}-fullLabel-draggable`]: !disabled && draggable && renderFullLabel,
        [`${prefixcls}-fullLabel-drag-over-gap-top`]: !disabled && dragOverGapTop && renderFullLabel,
        [`${prefixcls}-fullLabel-drag-over-gap-bottom`]: !disabled && dragOverGapBottom && renderFullLabel,
        [`${prefixcls}-tree-node-last-leaf`]: isEndNode,
    });
});

const labelCls = computed(() => {
    const { eventKey } = props;
    const { dragOverNodeKey, dropPosition } = context || {};
    const disabled = isDisabled.value;
    const dragOverGapTop = dragOverNodeKey === eventKey && dropPosition === -1;
    const dragOverGapBottom = dragOverNodeKey === eventKey && dropPosition === 1;
    return cls(`${prefixcls}-label`, {
        [`${prefixcls}-drag-over-gap-top`]: !disabled && dragOverGapTop,
        [`${prefixcls}-drag-over-gap-bottom`]: !disabled && dragOverGapBottom,
    });
});

const setsize = computed(() => get(props, ['data', 'children', 'length']));
const posinset = computed(() => (typeof props.pos === 'string' ? Number(props.pos.split('-')[props.level + 1]) + 1 : 1));

const draggableAttr = computed(() => {
    const { draggable } = context || {};
    return (!isDisabled.value && draggable) || undefined;
});
</script>
