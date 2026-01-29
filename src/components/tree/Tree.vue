<template>
    <div
        :aria-label="($attrs['aria-label'] as string) || undefined"
        :class="wrapperCls"
        :style="props.style"
        v-bind="getDataAttr()"
    >
        <div v-if="Boolean(filterTreeNode) && searchRender !== false" :class="inputWrapperCls" :style="searchStyle">
            <LocaleConsumer componentName="Tree">
                <template #default="locale">
                    <Input
                        ref="inputRef"
                        aria-label="Filter Tree"
                        :value="state.inputValue"
                        class="semi-tree-input"
                        :placeholder="searchPlaceholder || get(locale, 'searchPlaceholder')"
                        :showClear="showClear"
                        @change="handleSearchInput"
                        @input="handleSearchInput"
                    >
                        <template #prefix>
                            <IconSearch />
                        </template>
                    </Input>
                </template>
            </LocaleConsumer>
        </div>
        <div :class="listCls" v-bind="ariaAttr">
            <template v-if="noData">
                <TreeNode v-if="emptyContent" empty :emptyContent="emptyContent" />
                <LocaleConsumer v-else componentName="Tree">
                    <template #default="locale">
                        <TreeNode empty :emptyContent="(locale as any).emptyText" />
                    </template>
                </LocaleConsumer>
            </template>
            <component :is="renderNodeList" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { h, ref, computed, watch, provide, nextTick, reactive, onUnmounted, shallowRef, onMounted } from 'vue';

defineOptions({
    name: 'SemiTree',
});
import cls from 'classnames';
import TreeFoundation, { TreeAdapter } from '@douyinfe/semi-foundation/tree/foundation';
import {
    convertDataToEntities,
    flattenTreeData,
    calcExpandedKeysForValues,
    calcMotionKeys,
    convertJsonToData,
    findKeysForValues,
    calcCheckedKeys,
    calcExpandedKeys,
    filterTreeData,
    normalizeValue,
    updateKeys,
    calcDisabledKeys,
} from '@douyinfe/semi-foundation/tree/treeUtil';
import { cssClasses, strings } from '@douyinfe/semi-foundation/tree/constants';
import { isEmpty, isEqual, get, isFunction, pick, isUndefined } from 'lodash-es';
import { cloneDeep } from './treeUtil';
import Input from '../input';
import AutoSizer from './AutoSizer.vue';
import { TreeContextKey } from './treeContext';
import TreeNode from './TreeNode.vue';
import NodeList from './NodeList.vue';
import LocaleConsumer from '../locale';
import { IconSearch } from '../icons';
import { TreeProps, TreeState, FlattenNode, ScrollData, TreeNodeProps, TreeNodeData } from './interface';
import type { CSSProperties } from 'vue';
import { useBaseComponent } from '../_utils';

// Helper function to normalize tree data structure
function normalizeTreeData(data: any): any[] {
    if (!Array.isArray(data)) {
        return [];
    }

    return data.map((node) => {
        if (!node || typeof node !== 'object') {
            return node;
        }

        const normalizedNode = { ...node };

        // Ensure children is an array or undefined
        if (normalizedNode.children !== undefined) {
            if (Array.isArray(normalizedNode.children)) {
                normalizedNode.children = normalizeTreeData(normalizedNode.children);
            } else {
                // If children is not an array, remove it
                delete normalizedNode.children;
            }
        }

        return normalizedNode;
    });
}

const props = withDefaults(defineProps<TreeProps>(), {
    showClear: true,
    disabled: false,
    blockNode: true,
    multiple: false,
    filterTreeNode: false,
    autoExpandParent: false,
    treeNodeFilterProp: 'label',
    defaultExpandAll: false,
    expandAll: false,
    onChangeWithObject: false,
    motion: true,
    leafOnly: false,
    showFilteredOnly: false,
    showLine: false,
    expandAction: false,
    disableStrictly: false,
    draggable: false,
    autoExpandWhenDragEnter: true,
    checkRelation: 'related',
    autoMergeValue: true,
    searchRender: undefined,
});

const emit = defineEmits<{
    (e: 'expand', expandedKeys: string[], expandedOtherProps: any): void;
    (e: 'select', selectedKey: string, selected: boolean, selectedNode: any): void;
    (e: 'change', value: any): void;
    (e: 'search', input: string, filteredExpandedKeys: string[]): void;
    (e: 'contextMenu', event: MouseEvent, node: any): void;
    (e: 'doubleClick', event: MouseEvent, node: any): void;
    (e: 'load', loadedKeys: Set<string>, treeNode: any): void;
}>();

const prefixcls = cssClasses.PREFIX;

// Virtualization constants
const DEFAULT_VIRTUAL_ITEM_SIZE = 28;
const DEFAULT_VIRTUAL_HEIGHT = 270;
const VIRTUAL_BUFFER_SIZE = 2; // Buffer items for smooth scrolling

// Type definitions for internal use
interface DragNode {
    eventKey: string;
    data: TreeNodeData;
    pos: string;
    nodeInstance?: HTMLElement;
}

const inputRef = ref<InstanceType<typeof Input>>();
const dragNode = ref<DragNode | null>(null);
const virtualizedListRef = ref<HTMLDivElement>();
const virtualScrollTop = ref(0);

// Helper function to fix value prop for TreeNodes from simple JSON data
function fixTreeNodeValues(treeData: any[]): any[] {
    return treeData.map((node) => {
        if (!node || typeof node !== 'object') return node;

        const fixedNode = { ...node };

        // If value is an object (has children), remove it to avoid prop type error
        if (fixedNode.value && typeof fixedNode.value === 'object') {
            delete fixedNode.value;
        }

        // Recursively fix children
        if (fixedNode.children && Array.isArray(fixedNode.children)) {
            fixedNode.children = fixTreeNodeValues(fixedNode.children);
        }

        return fixedNode;
    });
}

// Initialize tree data from props
const initialTreeData = props.treeDataSimpleJson
    ? fixTreeNodeValues(normalizeTreeData(convertJsonToData(props.treeDataSimpleJson)))
    : normalizeTreeData(props.treeData || []);

// Initialize key entities
const initialEntitiesMap =
    initialTreeData.length > 0 ? convertDataToEntities(initialTreeData, {}) : { keyEntities: {}, valueEntities: {} };

// Initialize flatten nodes
const initialFlattenNodes =
    initialTreeData.length > 0
        ? flattenTreeData(initialTreeData, new Set(props.expandedKeys), props.keyMaps || {})
        : [];

// State
const state = ref<TreeState>({
    inputValue: '',
    keyEntities: initialEntitiesMap.keyEntities,
    treeData: initialTreeData,
    flattenNodes: initialFlattenNodes,
    selectedKeys: [],
    checkedKeys: new Set(),
    halfCheckedKeys: new Set(),
    realCheckedKeys: new Set([]),
    motionKeys: new Set([]),
    motionType: 'hide',
    expandedKeys: new Set(props.expandedKeys),
    filteredKeys: new Set(),
    filteredExpandedKeys: new Set(),
    filteredShownKeys: new Set(),
    prevProps: null,
    loadedKeys: new Set(),
    loadingKeys: new Set(),
    cachedFlattenNodes: undefined,
    cachedKeyValuePairs: initialEntitiesMap.valueEntities,
    disabledKeys: new Set(),
    dragging: false,
    dragNodesKeys: new Set(),
    dragOverNodeKey: null,
    dropPosition: null,
});

const { adapter: baseAdapter, getDataAttr } = useBaseComponent(props, state);

const foundation = new TreeFoundation({
    ...baseAdapter,
    updateInputValue: (value: string) => {
        state.value.inputValue = value;
    },
    focusInput: () => {
        const { preventScroll } = props;
        if (inputRef.value) {
            (inputRef.value as any).focus({ preventScroll });
        }
    },
    updateState: (states: Partial<TreeState>) => {
        Object.assign(state.value, states);
    },
    notifyExpand: (expandedKeys: Set<string>, { expanded: bool, node }: any) => {
        emit('expand', [...expandedKeys], { expanded: bool, node });
        if (bool && props.loadData) {
            onNodeLoad(node);
        }
    },
    notifySelect: (selectKey: string, bool: boolean, node: any) => {
        emit('select', selectKey, bool, node);
    },
    notifyChange: (value: any) => {
        emit('change', value);
    },
    notifySearch: (input: string, filteredExpandedKeys: string[]) => {
        emit('search', input, filteredExpandedKeys);
    },
    notifyRightClick: (e: MouseEvent, node: any) => {
        emit('contextMenu', e, node);
    },
    notifyDoubleClick: (e: MouseEvent, node: any) => {
        emit('doubleClick', e, node);
    },
    cacheFlattenNodes: (bool: boolean) => {
        state.value.cachedFlattenNodes = bool ? cloneDeep(state.value.flattenNodes) : undefined;
    },
    setDragNode: (treeNode: DragNode) => {
        dragNode.value = treeNode;
    },
} as any as TreeAdapter);

/**
 * Patch Foundation's _isControlledComponent method for Tree component
 *
 * Tree component uses `value` prop for both single and multiple selection modes.
 *
 * This patch ensures correct controlled/uncontrolled behavior detection.
 * In Vue, prop keys exist even when not passed, so we need to check for undefined.
 *
 * Note: This is a temporary workaround until Foundation layer supports
 * custom control key configuration.
 */
const originalIsControlledComponent = (foundation as any)._isControlledComponent;
if (originalIsControlledComponent && typeof originalIsControlledComponent === 'function') {
    (foundation as any)._isControlledComponent = function (this: any, key: string = 'value'): boolean {
        const props = this.getProps();

        // For Tree component, check if 'value' prop has an actual value
        if (key === 'value') {
            const result = 'value' in props && props.value !== undefined;
            return result;
        }
        // For other keys, use original logic
        return key in props;
    };
}

// 防抖定时器 - 必须在 watch 之前声明，因为 watch 的 immediate: true 会立即执行
let updateStateTimer: ReturnType<typeof setTimeout> | null = null;

// Watch for prop changes (equivalent to getDerivedStateFromProps)
// 性能优化：分别监听不同类型的 props，减少不必要的深度监听
// 对于对象/数组类型的 props，使用 deep: true；对于原始类型，使用默认浅比较
watch(
    () => props.treeData,
    () => {
        updateStateFromProps();
    },
    { immediate: true, deep: true }
);

watch(
    () => props.treeDataSimpleJson,
    () => {
        updateStateFromProps();
    },
    { immediate: true, deep: true }
);

// Force update when treeData changes
watch(
    () => props.treeData,
    () => {
        updateStateFromProps();
    },
    { immediate: true, deep: true }
);

watch(
    () => [
        props.expandedKeys,
        props.value,
        props.defaultValue,
        props.loadedKeys,
        props.autoExpandParent,
        props.expandAll,
        props.defaultExpandAll,
        props.defaultExpandedKeys,
        props.draggable,
        props.disableStrictly,
        props.checkRelation,
        props.multiple,
        props.onChangeWithObject,
        props.keyMaps,
        state.value.inputValue,
    ],
    () => {
        updateStateFromProps();
    },
    { immediate: true, deep: true }
);

/**
 * Helper: Check if a prop needs to be updated
 * 性能优化：先进行浅比较，只在必要时进行深度比较
 */
function needUpdate(name: string, prevProps: TreeProps | null): boolean {
    const firstInProps = !prevProps && name in props;
    if (firstInProps) {
        return true;
    }
    if (!prevProps) {
        return false;
    }
    const prevValue = (prevProps as any)[name];
    const currentValue = (props as any)[name];

    // 性能优化：对原始值使用浅比较，只在必要时使用深度比较
    if (prevValue === currentValue) {
        return false;
    }

    // 对于对象/数组，使用深度比较
    if (
        typeof prevValue === 'object' &&
        typeof currentValue === 'object' &&
        prevValue !== null &&
        currentValue !== null
    ) {
        return !isEqual(prevValue, currentValue);
    }

    return true;
}

/**
 * Helper: Check if treeData needs to be updated
 */
function needUpdateData(prevProps: TreeProps | null): boolean {
    const firstInProps = !prevProps && 'treeData' in props;
    const treeDataHasChange = prevProps && (prevProps as any).treeData !== props.treeData;
    return firstInProps || treeDataHasChange;
}

/**
 * Helper: Update tree data and entities
 */
function updateTreeDataAndEntities(
    newState: Partial<TreeState>,
    prevProps: TreeProps | null,
    keyMaps: any
): { treeData: any; keyEntities: any; valueEntities: any } {
    let treeData: any;
    let keyEntities = state.value.keyEntities || {};
    let valueEntities = state.value.cachedKeyValuePairs || {};

    const needUpdateTreeData = needUpdate('treeData', prevProps);
    const needUpdateSimpleJson = needUpdate('treeDataSimpleJson', prevProps);

    if (needUpdateTreeData || (props.draggable && needUpdateData(prevProps))) {
        treeData = normalizeTreeData(props.treeData);
        newState.treeData = treeData;
        const entitiesMap = convertDataToEntities(treeData, keyMaps);
        newState.keyEntities = { ...entitiesMap.keyEntities };
        keyEntities = newState.keyEntities;
        newState.cachedKeyValuePairs = { ...entitiesMap.valueEntities };
        valueEntities = newState.cachedKeyValuePairs;
    } else if (needUpdateSimpleJson) {
        treeData = fixTreeNodeValues(normalizeTreeData(convertJsonToData(props.treeDataSimpleJson)));
        newState.treeData = treeData;
        const entitiesMap = convertDataToEntities(treeData, keyMaps);
        newState.keyEntities = { ...entitiesMap.keyEntities };
        keyEntities = newState.keyEntities;
        newState.cachedKeyValuePairs = { ...entitiesMap.valueEntities };
        valueEntities = newState.cachedKeyValuePairs;
    }

    if (treeData && props.motion) {
        if (prevProps && props.motion) {
            newState.motionKeys = new Set([]);
            newState.motionType = null;
        }
    }

    return { treeData, keyEntities, valueEntities };
}

/**
 * Helper: Update expanded keys (non-searching state)
 */
function updateExpandedKeysNonSearching(
    newState: Partial<TreeState>,
    prevProps: TreeProps | null,
    treeData: any,
    keyEntities: any,
    valueEntities: any,
    isExpandControlled: boolean,
    dataUpdated: boolean
): void {
    const expandAllWhenDataChange = dataUpdated && props.expandAll;
    const needUpdateExpandedKeys = needUpdate('expandedKeys', prevProps);
    const needUpdateAutoExpandParent = prevProps && needUpdate('autoExpandParent', prevProps);

    // Check defaultExpandAll/expandAll first if this is the first render and no expandedKeys prop is provided
    if (!prevProps && !props.expandedKeys && (props.defaultExpandAll || props.expandAll)) {
        newState.expandedKeys = new Set(Object.keys(keyEntities));
    } else if (expandAllWhenDataChange) {
        newState.expandedKeys = new Set(Object.keys(keyEntities));
    } else if (needUpdateExpandedKeys || needUpdateAutoExpandParent) {
        newState.expandedKeys = calcExpandedKeys(props.expandedKeys, keyEntities, props.autoExpandParent || !prevProps);
        if (prevProps && props.motion && !treeData) {
            const { motionKeys, motionType } = calcMotionKeys(
                state.value.expandedKeys,
                newState.expandedKeys,
                keyEntities
            );
            newState.motionKeys = new Set(motionKeys);
            newState.motionType = motionType;
            if (motionType === 'hide') {
                newState.cachedFlattenNodes = cloneDeep(state.value.flattenNodes);
            }
        }
    } else if (!prevProps && props.defaultExpandedKeys) {
        newState.expandedKeys = calcExpandedKeys(props.defaultExpandedKeys, keyEntities);
    } else if (!prevProps && props.defaultValue) {
        newState.expandedKeys = calcExpandedKeysForValues(
            props.defaultValue,
            keyEntities,
            props.multiple,
            valueEntities
        );
    } else if (!prevProps && props.value) {
        newState.expandedKeys = calcExpandedKeysForValues(props.value, keyEntities, props.multiple, valueEntities);
    } else if (!isExpandControlled && dataUpdated && (props as any).value) {
        if (
            !(
                (state.value as TreeState).treeData &&
                (state.value as TreeState).treeData?.length > 0 &&
                (props as any).loadData
            )
        ) {
            newState.expandedKeys = calcExpandedKeysForValues(
                (props as any).value,
                keyEntities,
                (props as any).multiple,
                valueEntities
            );
        }
    }

    if (!newState.expandedKeys) {
        delete newState.expandedKeys;
    }
}

/**
 * Helper: Update expanded keys (searching state)
 */
function updateExpandedKeysSearching(
    newState: Partial<TreeState>,
    prevProps: TreeProps | null,
    treeData: any,
    keyEntities: any,
    keyMaps: any
): void {
    let filteredState: any;
    if (treeData) {
        filteredState = filterTreeData({
            treeData,
            inputValue: state.value.inputValue,
            filterTreeNode: props.filterTreeNode,
            filterProps: props.treeNodeFilterProp,
            showFilteredOnly: props.showFilteredOnly,
            keyEntities: newState.keyEntities,
            prevExpandedKeys: [...state.value.filteredExpandedKeys],
            keyMaps: keyMaps,
        });
        newState.flattenNodes = filteredState.flattenNodes;
        newState.motionKeys = new Set([]);
        newState.filteredKeys = filteredState.filteredKeys;
        newState.filteredShownKeys = filteredState.filteredShownKeys;
        newState.filteredExpandedKeys = filteredState.filteredExpandedKeys;
    }

    if (props.expandedKeys) {
        newState.filteredExpandedKeys = calcExpandedKeys(
            props.expandedKeys,
            keyEntities,
            props.autoExpandParent || !prevProps
        );

        if (prevProps && props.motion) {
            const prevKeys = state.value ? state.value.filteredExpandedKeys : new Set([]);
            if (!treeData) {
                const motionResult = calcMotionKeys(prevKeys, newState.filteredExpandedKeys, keyEntities);

                let { motionKeys } = motionResult;
                const { motionType } = motionResult;
                if (props.showFilteredOnly) {
                    motionKeys = motionKeys.filter((key: string) => state.value.filteredShownKeys.has(key));
                }
                if (motionType === 'hide') {
                    newState.cachedFlattenNodes = cloneDeep(state.value.flattenNodes);
                }
                newState.motionKeys = new Set(motionKeys);
                newState.motionType = motionType;
            }
        }

        newState.flattenNodes = flattenTreeData(
            treeData || state.value.treeData,
            newState.filteredExpandedKeys || state.value.filteredExpandedKeys,
            keyMaps,
            props.showFilteredOnly && state.value.filteredShownKeys
        );
    }
}

/**
 * Helper: Update selected/checked state
 */
function updateSelectedState(
    newState: Partial<TreeState>,
    prevProps: TreeProps | null,
    treeData: any,
    keyEntities: any,
    valueEntities: any
): void {
    const withObject = props.onChangeWithObject;
    const isMultiple = props.multiple;

    if (!isMultiple) {
        if (needUpdate('value', prevProps)) {
            newState.selectedKeys = findKeysForValues(
                normalizeValue(props.value, withObject, props.keyMaps),
                valueEntities,
                isMultiple
            );
        } else if (!prevProps && props.defaultValue) {
            newState.selectedKeys = findKeysForValues(
                normalizeValue(props.defaultValue, withObject, props.keyMaps),
                valueEntities,
                isMultiple
            );
        } else if (treeData) {
            if (props.value) {
                newState.selectedKeys = findKeysForValues(
                    normalizeValue(props.value, withObject, props.keyMaps) || '',
                    valueEntities,
                    isMultiple
                );
            }
        }
    } else {
        let checkedKeyValues: any;
        if (needUpdate('value', prevProps)) {
            checkedKeyValues = findKeysForValues(
                normalizeValue(props.value, withObject, props.keyMaps),
                valueEntities,
                isMultiple
            );
        } else if (!prevProps && props.defaultValue) {
            checkedKeyValues = findKeysForValues(
                normalizeValue(props.defaultValue, withObject, props.keyMaps),
                valueEntities,
                isMultiple
            );
        } else if (treeData) {
            if (props.value) {
                checkedKeyValues = findKeysForValues(
                    normalizeValue(props.value, withObject, props.keyMaps) || [],
                    valueEntities,
                    isMultiple
                );
            } else {
                checkedKeyValues = updateKeys(
                    props.checkRelation === 'related' ? state.value.checkedKeys : state.value.realCheckedKeys,
                    keyEntities
                );
            }
        }

        if (checkedKeyValues) {
            if (props.checkRelation === 'unRelated') {
                newState.realCheckedKeys = new Set(checkedKeyValues);
            } else if (props.checkRelation === 'related') {
                const { checkedKeys, halfCheckedKeys } = calcCheckedKeys(checkedKeyValues, keyEntities);
                newState.checkedKeys = checkedKeys;
                newState.halfCheckedKeys = halfCheckedKeys;
            }
        }
    }
}

/**
 * 执行实际的 state 更新逻辑
 */
function executeUpdateStateFromProps() {
    const prevProps = state.value.prevProps;
    const { keyMaps } = props;
    const isSearching = Boolean(props.filterTreeNode && state.value.inputValue && state.value.inputValue.length);

    // 性能优化：优化 prevProps 的更新方式
    // 只在首次初始化时创建，后续使用 Object.assign 更新，避免每次都创建新对象和深拷贝
    if (!prevProps) {
        // 首次初始化：创建 prevProps 并深拷贝 treeData
        const prevPropsToStore: any = { ...props };
        if (props.treeData) {
            prevPropsToStore.treeData = cloneDeep(props.treeData);
        }
        if (props.treeDataSimpleJson) {
            prevPropsToStore.treeDataSimpleJson = cloneDeep(props.treeDataSimpleJson);
        }
        state.value.prevProps = prevPropsToStore as any;
    } else {
        // 后续更新：使用 Object.assign 更新，只在 treeData 真正变化时才深拷贝
        const needUpdateTreeData = needUpdate('treeData', prevProps);
        const needUpdateSimpleJson = needUpdate('treeDataSimpleJson', prevProps);

        Object.assign(prevProps, props);

        // 只在 treeData 真正变化时才深拷贝
        if (needUpdateTreeData && props.treeData) {
            (prevProps as any).treeData = cloneDeep(props.treeData);
        }
        if (needUpdateSimpleJson && props.treeDataSimpleJson) {
            (prevProps as any).treeDataSimpleJson = cloneDeep(props.treeDataSimpleJson);
        }
    }

    const newState: Partial<TreeState> = {};
    const isExpandControlled = 'expandedKeys' in props;

    // Step 1: Update tree data and entities
    const { treeData, keyEntities, valueEntities } = updateTreeDataAndEntities(newState, prevProps, keyMaps);
    const dataUpdated = needUpdate('treeDataSimpleJson', prevProps) || needUpdate('treeData', prevProps);

    // Step 2: Update expanded keys and flatten nodes
    if (!isSearching) {
        updateExpandedKeysNonSearching(
            newState,
            prevProps,
            treeData,
            keyEntities,
            valueEntities,
            isExpandControlled,
            dataUpdated
        );

        // Update flatten nodes if needed
        if (treeData || newState.expandedKeys) {
            const flattenNodes = flattenTreeData(
                treeData || state.value.treeData,
                newState.expandedKeys || state.value.expandedKeys,
                keyMaps
            );
            newState.flattenNodes = flattenNodes;
        }
    } else {
        updateExpandedKeysSearching(newState, prevProps, treeData, keyEntities, keyMaps);
    }

    // Step 3: Update selected/checked state
    updateSelectedState(newState, prevProps, treeData, keyEntities, valueEntities);

    // Step 4: Update other states
    if (needUpdate('loadedKeys', prevProps)) {
        newState.loadedKeys = new Set(props.loadedKeys);
    }

    if (treeData && props.disableStrictly && props.checkRelation === 'related') {
        newState.disabledKeys = calcDisabledKeys(keyEntities, keyMaps);
    }

    // Step 5: Apply all updates to state
    Object.assign(state.value, newState);
}

/**
 * 防抖版本的 updateStateFromProps
 * 性能优化：使用 setTimeout(0) 防抖，批量处理多次更新
 */
function updateStateFromProps() {
    if (updateStateTimer) {
        clearTimeout(updateStateTimer);
    }
    updateStateTimer = setTimeout(() => {
        updateStateTimer = null;
        executeUpdateStateFromProps();
    }, 0);
}

/**
 * Search tree nodes by input value
 * @param value - Search keyword
 * @public
 */
function search(value: string) {
    // Ensure value is a string, handle cases where InputEvent is passed
    const searchValue = typeof value === 'string' ? value : String(value);
    foundation.handleInputChange(searchValue);
}

/**
 * Handle search input change (real-time)
 * Called on both @input (real-time) and @change (blur/enter) events
 * @param eventOrValue - Can be:
 *   - Event object from @input event
 *   - String value from @change event (first parameter)
 * @private
 */
function handleSearchInput(eventOrValue: Event | string, _event?: Event) {
    // @change passes (value: string, event: Event)
    // @input passes (event: Event)
    const value =
        typeof eventOrValue === 'string' ? eventOrValue : (eventOrValue.target as HTMLInputElement)?.value || '';
    foundation.handleInputChange(value);
}

/**
 * Scroll to a specific tree node
 * @param scrollData - Scroll configuration
 * @param scrollData.key - Node key to scroll to
 * @param scrollData.align - Alignment option: 'center' | 'start' | 'end' | 'smart' | 'auto' (default: 'center')
 * @public
 */
function scrollTo(scrollData: ScrollData) {
    if (!scrollData || !scrollData.key) {
        console.warn('[Tree] scrollTo: key is required');
        return;
    }
    const { key, align = 'center' } = scrollData;
    const { flattenNodes } = state.value;
    if (!flattenNodes || flattenNodes.length === 0) {
        return;
    }
    if (key) {
        const index = flattenNodes.findIndex((node: FlattenNode) => {
            return node && node.key === key;
        });
        if (index >= 0 && props.virtualize && virtualizedListRef.value) {
            const itemSize = Number(props.virtualize.itemSize || DEFAULT_VIRTUAL_ITEM_SIZE);
            // If height is a string (e.g., '100%'), get actual height from DOM
            let height: number;
            if (typeof props.virtualize.height === 'string') {
                height = virtualizedListRef.value.offsetHeight || DEFAULT_VIRTUAL_HEIGHT;
            } else {
                height = Number(props.virtualize.height || DEFAULT_VIRTUAL_HEIGHT);
            }
            let scrollPosition = index * itemSize;

            // Handle different alignment options
            if (align === 'center') {
                scrollPosition = scrollPosition - height / 2 + itemSize / 2;
            } else if (align === 'end') {
                scrollPosition = scrollPosition - height + itemSize;
            }
            // 'start' doesn't need adjustment, 'auto' and 'smart' use 'start' behavior

            virtualizedListRef.value.scrollTop = Math.max(0, scrollPosition);
        }
    }
}

// Virtualization computed properties
const totalVirtualHeight = computed(() => {
    const { flattenNodes } = state.value;
    const itemSize = props.virtualize?.itemSize || DEFAULT_VIRTUAL_ITEM_SIZE;
    return flattenNodes.length * itemSize;
});

const virtualItemSize = computed(() => props.virtualize?.itemSize || DEFAULT_VIRTUAL_ITEM_SIZE);

const virtualHeight = computed(() => props.virtualize?.height || DEFAULT_VIRTUAL_HEIGHT);

const virtualVisibleCount = computed(() => {
    // If height is a string (e.g., '100%'), get actual height from DOM
    let height: number;
    if (typeof virtualHeight.value === 'string') {
        // For string heights, get actual height from DOM element
        // This requires the parent to have offsetHeight as per API docs
        height = virtualizedListRef.value?.offsetHeight || DEFAULT_VIRTUAL_HEIGHT;
    } else {
        height = Number(virtualHeight.value) || DEFAULT_VIRTUAL_HEIGHT;
    }
    const itemSize = Number(virtualItemSize.value);
    return Math.ceil(height / itemSize) + VIRTUAL_BUFFER_SIZE;
});

const virtualStartIndex = computed(() => {
    return Math.max(0, Math.floor(virtualScrollTop.value / virtualItemSize.value) - 1); // -1 for top buffer
});

const virtualEndIndex = computed(() => {
    const { flattenNodes } = state.value;
    return Math.min(flattenNodes.length, virtualStartIndex.value + virtualVisibleCount.value);
});

const virtualVisibleIndices = computed(() => {
    const indices: number[] = [];
    for (let i = virtualStartIndex.value; i < virtualEndIndex.value; i++) {
        indices.push(i);
    }
    return indices;
});

const virtualOffsetY = computed(() => {
    return virtualStartIndex.value * virtualItemSize.value;
});

/**
 * Handle virtual list scroll event
 * Updates visible range of nodes for performance optimization
 * @param event - Scroll event
 * @private
 */
function handleVirtualScroll(event: Event) {
    const target = event.target as HTMLElement;
    virtualScrollTop.value = target.scrollTop;
}

/**
 * Render search input component
 * @param locale - Locale object for internationalization
 * @returns VNode or null if search is disabled
 * @private
 */
function renderSearchInput(locale: any) {
    const { searchClassName, searchRender, searchPlaceholder, showClear } = props;
    if (searchRender === false) {
        return null;
    }
    const inputcls = cls(`${prefixcls}-input`);
    const { inputValue } = state.value;
    const inputProps = {
        value: inputValue,
        className: inputcls,
        onChange: (value: string) => search(value),
        prefix: h(IconSearch),
        showClear,
        placeholder: searchPlaceholder || get(locale, 'searchPlaceholder'),
    };
    if (isFunction(searchRender)) {
        return searchRender({ ...inputProps });
    }
    return h(Input, {
        'aria-label': 'Filter Tree',
        ref: inputRef,
        ...inputProps,
    });
}

/**
 * Get required props for tree nodes
 * @returns Object containing node state information
 * @private
 */
function getTreeNodeRequiredProps() {
    const { expandedKeys, selectedKeys, checkedKeys, halfCheckedKeys, keyEntities, filteredKeys } = state.value;
    return {
        expandedKeys: expandedKeys || new Set(),
        selectedKeys: selectedKeys || [],
        checkedKeys: checkedKeys || new Set(),
        halfCheckedKeys: halfCheckedKeys || new Set(),
        filteredKeys: filteredKeys || new Set(),
        keyEntities,
    };
}

/**
 * Handle node selection event
 * @param e - Mouse or keyboard event
 * @param treeNode - Selected tree node
 * @private
 */
function onNodeSelect(e: MouseEvent | KeyboardEvent, treeNode: TreeNodeProps) {
    foundation.handleNodeSelect(e, treeNode);
}

/**
 * Handle async node loading
 * @param data - Node data to load
 * @returns Promise that resolves when loading completes
 * @private
 */
function onNodeLoad(data: TreeNodeData) {
    return new Promise((resolve) => {
        const { loadedKeys = new Set([]), loadingKeys = new Set([]) } = state.value;
        const newState = foundation.handleNodeLoad(loadedKeys, loadingKeys, data, resolve);
        Object.assign(state.value, newState);
    });
}

/**
 * Handle node checkbox check/uncheck
 * @param e - Mouse or keyboard event
 * @param treeNode - Checked tree node
 * @private
 */
function onNodeCheck(e: MouseEvent | KeyboardEvent, treeNode: TreeNodeProps) {
    foundation.handleNodeSelect(e, treeNode);
}

/**
 * Handle node expand/collapse
 * @param e - Mouse or keyboard event
 * @param treeNode - Tree node to expand/collapse
 * @private
 */
function onNodeExpand(e: MouseEvent | KeyboardEvent, treeNode: TreeNodeProps) {
    foundation.handleNodeExpand(e, treeNode);
}

/**
 * Handle node right-click context menu
 * @param e - Mouse event
 * @param treeNode - Right-clicked tree node
 * @private
 */
function onNodeRightClick(e: MouseEvent, treeNode: TreeNodeProps) {
    foundation.handleNodeRightClick(e, treeNode);
}

/**
 * Handle node double-click
 * @param e - Mouse event
 * @param treeNode - Double-clicked tree node
 * @private
 */
function onNodeDoubleClick(e: MouseEvent, treeNode: TreeNodeProps) {
    foundation.handleNodeDoubleClick(e, treeNode);
}

/**
 * Handle drag start event
 * @param e - Drag event
 * @param treeNode - Node being dragged
 * @private
 */
function onNodeDragStart(e: DragEvent, treeNode: TreeNodeProps) {
    foundation.handleNodeDragStart(e, treeNode);
}

function onNodeDragEnter(e: DragEvent, treeNode: TreeNodeProps) {
    foundation.handleNodeDragEnter(e, treeNode, dragNode.value);
}

function onNodeDragOver(e: DragEvent, treeNode: TreeNodeProps) {
    foundation.handleNodeDragOver(e, treeNode, dragNode.value);
}

function onNodeDragLeave(e: DragEvent, treeNode: TreeNodeProps) {
    foundation.handleNodeDragLeave(e, treeNode);
}

function onNodeDragEnd(e: DragEvent, treeNode: TreeNodeProps) {
    foundation.handleNodeDragEnd(e, treeNode);
}

function onNodeDrop(e: DragEvent, treeNode: TreeNodeProps) {
    foundation.handleNodeDrop(e, treeNode, dragNode.value);
}

/**
 * Render a single tree node
 * @param treeNode - Flattened tree node data
 * @param ind - Node index (optional, for virtualization)
 * @param style - Custom style (optional, for virtualization)
 * @returns VNode representing the tree node
 * @private
 */
function renderTreeNode(treeNode: FlattenNode, ind?: number, style?: CSSProperties) {
    if (!treeNode || !treeNode.key) {
        console.warn('[Tree] Invalid tree node:', treeNode);
        return null;
    }
    const { data, key } = treeNode;
    const treeNodeProps = foundation.getTreeNodeProps(key);
    if (!treeNodeProps) {
        return null;
    }
    const { keyMaps, showLine, expandIcon } = props;
    // Don't include 'key' as it's a reserved prop in Vue - eventKey is already in treeNodeProps
    const nodeProps: any = pick(treeNode, ['label', 'disabled', 'icon', 'isEnd']);
    const children = data[get(keyMaps, 'children', 'children')];

    // Handle children: set to empty array if undefined, so TreeNode can correctly determine isLeaf
    nodeProps.children = children || [];

    // Handle isLeaf: only pass it if explicitly set to true, or if explicitly false AND has children
    // If isLeaf is false but no children, don't pass it (let TreeNode compute based on actual children)
    const hasChildren = Boolean(children && children.length > 0);
    const isLeafValue = data?.isLeaf;

    if (isLeafValue === true) {
        nodeProps.isLeaf = true;
    } else if (isLeafValue === false && hasChildren) {
        nodeProps.isLeaf = false;
    }
    // If isLeaf is false but no children, or isLeaf is undefined, don't pass it

    // Remove isLeaf from data if it exists, to avoid incorrect override
    const { isLeaf: _isLeafFromData, ...dataWithoutIsLeaf } = data || {};

    // In non-multiple mode, map selected to active for proper styling
    const finalProps = {
        ...treeNodeProps,
        ...dataWithoutIsLeaf,
        ...nodeProps,
        showLine,
        data,
        expandIcon,
        style: isEmpty(style) ? {} : style,
    };

    // In non-multiple mode, active should be the same as selected
    if (!props.multiple) {
        finalProps.active = finalProps.selected;
    }

    return h(TreeNode, finalProps);
}

/**
 * Render the tree node list
 * Supports both normal and virtualized rendering modes
 * 性能优化：使用 computed 缓存渲染结果，减少不必要的重新渲染
 * @returns VNode or undefined if no nodes to render
 * @private
 */
const renderNodeList = computed(() => {
    // 确保依赖 checkedKeys 和 realCheckedKeys，以便在选中状态变化时重新渲染
    const { flattenNodes, cachedFlattenNodes, motionKeys, motionType, checkedKeys, realCheckedKeys } = state.value;
    const { virtualize, motion } = props;

    if (isEmpty(flattenNodes)) {
        return undefined;
    }
    if (!virtualize || isEmpty(virtualize)) {
        return h(NodeList, {
            flattenNodes,
            flattenList: cachedFlattenNodes,
            motionKeys: motion ? motionKeys : new Set([]),
            motionType,
            renderTreeNode,
        });
    }

    // Virtualized rendering - custom implementation similar to Select component
    const itemSize = virtualize.itemSize || DEFAULT_VIRTUAL_ITEM_SIZE;
    const height = virtualize.height || DEFAULT_VIRTUAL_HEIGHT;
    const width = virtualize.width || '100%';

    // Handle height: if string, use as-is; if number, add 'px'
    const heightStyle = typeof height === 'string' ? height : `${height}px`;
    // Handle width: if string, use as-is; if number, add 'px'
    const widthStyle = typeof width === 'string' ? width : `${width}px`;

    return h(
        'div',
        {
            ref: virtualizedListRef,
            class: `${prefixcls}-virtual-list`,
            style: {
                height: heightStyle,
                width: widthStyle,
                overflow: 'auto',
                position: 'relative',
            },
            onScroll: handleVirtualScroll,
        },
        [
            h(
                'div',
                {
                    style: {
                        height: `${totalVirtualHeight.value}px`,
                        position: 'relative',
                    },
                },
                [
                    h(
                        'div',
                        {
                            style: {
                                transform: `translateY(${virtualOffsetY.value}px)`,
                            },
                        },
                        virtualVisibleIndices.value.map((index: number) => {
                            return renderTreeNode(flattenNodes[index], index, {
                                height: `${itemSize}px`,
                            });
                        })
                    ),
                ]
            ),
        ]
    );
});

// Provide context - use reactive object instead of computed to allow proper method access
const treeContext = reactive({
    get treeDisabled() {
        return props.disabled;
    },
    get treeIcon() {
        return props.icon;
    },
    get motion() {
        return props.motion;
    },
    get motionKeys() {
        return state.value.motionKeys;
    },
    get motionType() {
        return state.value.motionType;
    },
    get filterTreeNode() {
        return props.filterTreeNode;
    },
    get keyEntities() {
        return state.value.keyEntities;
    },
    onNodeClick: null,
    onNodeExpand,
    onNodeSelect,
    onNodeCheck,
    onNodeRightClick,
    onNodeDoubleClick,
    renderTreeNode,
    onNodeDragStart,
    onNodeDragEnter,
    onNodeDragOver,
    onNodeDragLeave,
    onNodeDragEnd,
    onNodeDrop,
    get expandAction() {
        return props.expandAction;
    },
    get directory() {
        return props.directory;
    },
    get multiple() {
        return props.multiple;
    },
    get showFilteredOnly() {
        return props.showFilteredOnly;
    },
    get isSearching() {
        return Boolean(state.value.inputValue);
    },
    get loadData() {
        return props.loadData;
    },
    onNodeLoad,
    get renderLabel() {
        return props.renderLabel;
    },
    get draggable() {
        return props.draggable;
    },
    get renderFullLabel() {
        return props.renderFullLabel;
    },
    get dragOverNodeKey() {
        return state.value.dragOverNodeKey;
    },
    get dropPosition() {
        return state.value.dropPosition;
    },
    get labelEllipsis() {
        return typeof props.labelEllipsis === 'undefined' ? props.virtualize : props.labelEllipsis;
    },
});

provide(TreeContextKey, treeContext);

// Computed properties
const wrapperCls = computed(() => cls(`${prefixcls}-wrapper`, props.className));
const inputWrapperCls = computed(() => cls(`${prefixcls}-search-wrapper`, props.searchClassName));
const listCls = computed(() =>
    cls(`${prefixcls}-option-list`, {
        [`${prefixcls}-option-list-block`]: props.blockNode,
    })
);

const noData = computed(() => {
    const searchNoRes = Boolean(state.value.inputValue) && !state.value.filteredKeys.size;
    // 在初始化过程中，如果有treeDataSimpleJson或treeData但keyEntities为空，不要显示no data
    const hasDataProps = props.treeDataSimpleJson || props.treeData;
    const isInitializing = hasDataProps && isEmpty(state.value.keyEntities);
    return (!isInitializing && isEmpty(state.value.keyEntities)) || (props.showFilteredOnly && searchNoRes);
});

const ariaAttr = computed(() => {
    const attr: any = {
        role: noData.value ? 'none' : 'tree',
    };
    if (attr.role === 'tree') {
        attr['aria-multiselectable'] = props.multiple ? true : false;
    }
    return attr;
});

// 组件挂载后强制更新一次，确保数据正确渲染
onMounted(() => {
    // 确保在下一个tick中更新状态
    nextTick(() => {
        updateStateFromProps();
    });

    // 如果有treeDataSimpleJson，额外延迟一次更新以确保数据转换完成
    if (props.treeDataSimpleJson) {
        setTimeout(() => {
            updateStateFromProps();
        }, 10);
    }
});

// 清理防抖定时器
onUnmounted(() => {
    if (updateStateTimer) {
        clearTimeout(updateStateTimer);
        updateStateTimer = null;
    }
});

defineExpose({
    search,
    scrollTo,
});
</script>
