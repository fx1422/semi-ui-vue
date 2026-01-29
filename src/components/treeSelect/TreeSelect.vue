<template>
    <Popover
        :visible="isOpen"
        trigger="custom"
        :position="computedPosition"
        :z-index="props.zIndex"
        :get-popup-container="props.getPopupContainer"
        :motion="props.motion"
        :auto-adjust-overflow="props.autoAdjustOverflow"
        :margin="props.dropdownMargin"
        :stop-propagation="props.stopPropagation"
        :mouse-enter-delay="props.mouseEnterDelay"
        :mouse-leave-delay="props.mouseLeaveDelay"
        :after-close="handlePopoverAfterClose"
        :wrapper-class-name="`${prefixCls}-popover`"
        :re-pos-key="rePosKey"
        @update:visible="handlePopoverVisibleChange"
        @visible-change="handleDropdownVisibleChange"
        @click-out-side="handleClickOutside"
    >
        <template #content>
            <div ref="optionsContainerRef" :class="popoverCls" :style="dropdownStyle" @keydown="handleKeyDown">
                <component :is="props.outerTopSlot" v-if="props.outerTopSlot" />
                <div v-if="showSearchInput" :class="`${prefixTree}-search-wrapper`">
                    <Input
                        v-if="typeof props.searchRender !== 'function'"
                        :ref="
                            (el: any) => {
                                if (el) inputRef = el;
                            }
                        "
                        aria-label="Filter TreeSelect item"
                        :placeholder="props.searchPlaceholder || '搜索'"
                        :value="inputValue"
                        :prevent-scroll="props.preventScroll"
                        :show-clear="props.showSearchClear"
                        @input="handleSearchInput"
                    >
                        <template #prefix>
                            <IconSearch />
                        </template>
                    </Input>
                    <LocaleConsumer v-else-if="typeof props.searchRender === 'function'" component-name="TreeSelect">
                        <template #default="{ locale }: { locale?: { searchPlaceholder?: string } }">
                            <component
                                :is="
                                    () =>
                                        (props.searchRender as any)({
                                            showClear: props.showSearchClear,
                                            prefix: h(IconSearch),
                                            value: inputValue,
                                            preventScroll: props.preventScroll,
                                            onChange: handleInputChange,
                                            placeholder: props.searchPlaceholder || locale?.searchPlaceholder || '搜索',
                                        })
                                "
                            />
                        </template>
                    </LocaleConsumer>
                </div>
                <div :class="listCls" role="tree" :aria-multiselectable="props.multiple" :style="props.optionListStyle">
                    <component :is="renderTreeContent()" />
                </div>
                <component :is="props.outerBottomSlot" v-if="props.outerBottomSlot" />
            </div>
        </template>

        <div
            ref="triggerRef"
            :class="selectionCls"
            :style="props.style"
            :tabindex="props.disabled ? undefined : 0"
            role="combobox"
            :aria-disabled="props.disabled"
            aria-haspopup="tree"
            :aria-invalid="props['aria-invalid']"
            :aria-errormessage="props['aria-errormessage']"
            :aria-label="props['aria-label'] || 'TreeSelect'"
            :aria-labelledby="props['aria-labelledby']"
            :aria-describedby="props['aria-describedby']"
            :aria-required="props['aria-required']"
            v-bind="getDataAttr()"
            @click="handleClick"
            @keydown="handleKeyDown"
            @keypress="handleSelectionEnterPress"
            @mouseenter="handleMouseEnter"
            @mouseleave="handleMouseLeave"
        >
            <template v-if="useCustomTrigger">
                <slot
                    v-if="slots.trigger"
                    name="trigger"
                    :value="customTriggerValue"
                    :placeholder="props.placeholder"
                    :disabled="props.disabled"
                    :on-clear="handleClear"
                    :on-remove="removeTag"
                    :input-value="inputValue"
                    :on-search="handleSearch"
                    :on-change="handleInputChange"
                />
                <component :is="customTriggerRender" v-else />
            </template>

            <template v-else>
                <div
                    v-if="props.prefix || props.insetLabel"
                    :id="props.insetLabelId"
                    :class="prefixWrapperCls"
                    x-semi-prop="prefix,insetLabel"
                >
                    <component :is="props.prefix" v-if="props.prefix" />
                    <template v-else-if="props.insetLabel">{{ props.insetLabel }}</template>
                </div>

                <div :class="`${prefixCls}-selection`">
                    <component :is="renderSelectContent()" />
                </div>

                <div v-if="props.suffix" :class="suffixWrapperCls" x-semi-prop="suffix">
                    <component :is="props.suffix" />
                </div>

                <div
                    v-if="showClearBtn"
                    :class="`${prefixCls}-clearbtn`"
                    role="button"
                    tabindex="0"
                    aria-label="Clear TreeSelect value"
                    @click.stop="handleClear"
                    @keypress="handleClearEnterPress"
                >
                    <component :is="props.clearIcon || IconClear" />
                </div>

                <div v-else-if="!showClearBtn" :class="`${prefixCls}-arrow`">
                    <component :is="props.arrowIcon || IconChevronDown" />
                </div>
            </template>
        </div>
    </Popover>
</template>

<script setup lang="ts">
import { ref, computed, watch, markRaw, h, VNode, provide, nextTick, Fragment, onUnmounted, useSlots } from 'vue';
import classNames from 'classnames';
import { isEqual, isEmpty, get, isFunction, isUndefined, isNull, pick } from 'lodash-es';
import { cssClasses, strings } from '@douyinfe/semi-foundation/treeSelect/constants';
import { numbers as popoverNumbers } from '@douyinfe/semi-foundation/popover/constants';
import TreeSelectFoundation, {
    type TreeSelectAdapter,
    type BasicTreeSelectProps,
    type BasicTreeSelectInnerData,
} from '@douyinfe/semi-foundation/treeSelect/foundation';
import {
    convertDataToEntities,
    flattenTreeData,
    calcExpandedKeysForValues,
    calcMotionKeys,
    findKeysForValues,
    calcCheckedKeys,
    calcExpandedKeys,
    getValueOrKey,
    normalizeKeyList,
    calcDisabledKeys,
    normalizeValue,
    updateKeys,
    filterTreeData,
} from '@douyinfe/semi-foundation/tree/treeUtil';
import { cloneDeep } from '../tree/treeUtil';
import { IconChevronDown, IconClear, IconSearch } from '../icons';
import Popover from '../popover';
import Input from '../input';
import TagInput from '../tagInput';
import { Tag, TagGroup } from '../tag';
import CheckboxGroup from '../checkbox/CheckboxGroup.vue';
import NodeList from '../tree/NodeList.vue';
import TreeNode from '../tree/TreeNode.vue';
import AutoSizer from '../tree/AutoSizer.vue';
import { TreeContextKey } from '../tree/treeContext';
import LocaleConsumer from '../locale';
import type { TreeSelectProps, TreeSelectEmits, RenderSelectedItemInMultiple } from './interface';
import type { TreeNodeData, TreeNodeProps, FlattenNode } from '../tree/interface';
import { useFoundation, useBaseComponent, isSemiIcon } from '../_utils';
import { isString } from '../_utils';
import isEnterPress from '@douyinfe/semi-foundation/utils/isEnterPress';

defineOptions({
    name: 'TreeSelect',
});

const prefixCls = cssClasses.PREFIX;
const prefixTree = cssClasses.PREFIX_TREE;

const props = withDefaults(defineProps<TreeSelectProps>(), {
    borderless: false,
    searchPosition: strings.SEARCH_POSITION_DROPDOWN,
    arrowIcon: undefined,
    autoExpandParent: false,
    autoAdjustOverflow: true,
    stopPropagation: true,
    motion: true,
    motionExpand: true,
    expandAll: false,
    zIndex: popoverNumbers.DEFAULT_Z_INDEX,
    disableStrictly: false,
    multiple: false,
    filterTreeNode: false,
    size: 'default',
    treeNodeFilterProp: 'label',
    onChangeWithObject: false,
    treeNodeLabelProp: 'label',
    dropdownMatchSelectWidth: true,
    defaultOpen: false,
    showSearchClear: true,
    showClear: false,
    onVisibleChange: () => {},
    expandAction: false,
    clickToHide: true,
    searchAutoFocus: false,
    checkRelation: 'related',
    'aria-label': 'TreeSelect',
    showRestTagsPopover: false,
    restTagsPopoverProps: () => ({}),
    clickTriggerToHide: true,
    autoMergeValue: true,
});

const emit = defineEmits<TreeSelectEmits>();

const triggerRef = ref<HTMLDivElement>();
const inputRef = ref<any>();
const tagInputRef = ref<any>();
const optionsContainerRef = ref<HTMLDivElement>();
const clickOutsideHandler = ref<((e: Event) => void) | null>(null);

const isOpen = ref(props.defaultOpen || false);
const isFocus = ref(false);
const isHovering = ref(false);
const inputTriggerFocus = ref(false);
const rePosKey = ref(0);
const dropdownMinWidth = ref<number | string | null>(null);

const inputValue = ref('');
const keyEntities = ref<Record<string, any>>({});
const treeData = ref<TreeNodeData[]>([]);
const flattenNodes = ref<FlattenNode[]>([]);
const cachedFlattenNodes = ref<FlattenNode[] | undefined>(undefined);
const selectedKeys = ref<string[]>([]);
const checkedKeys = ref<Set<string>>(new Set());
const halfCheckedKeys = ref<Set<string>>(new Set());
const realCheckedKeys = ref<Set<string>>(new Set());
const disabledKeys = ref<Set<string>>(new Set());
const motionKeys = ref<Set<string>>(new Set());
const motionType = ref<'hide' | 'show' | null>('hide');
const expandedKeys = ref<Set<string>>(new Set(props.expandedKeys));
const filteredKeys = ref<Set<string>>(new Set());
const filteredExpandedKeys = ref<Set<string>>(new Set());
const filteredShownKeys = ref<Set<string>>(new Set());
const cachedKeyValuePairs = ref<Record<string, any>>({});
const loadedKeys = ref<Set<string>>(new Set());
const loadingKeys = ref<Set<string>>(new Set());
const prevProps = ref<Partial<BasicTreeSelectProps> | null>(null);

const state = ref({
    inputTriggerFocus: inputTriggerFocus.value,
    isOpen: isOpen.value,
    isFocus: isFocus.value,
    rePosKey: rePosKey.value,
    dropdownMinWidth: dropdownMinWidth.value,
    inputValue: inputValue.value,
    keyEntities: keyEntities.value,
    treeData: treeData.value,
    flattenNodes: flattenNodes.value,
    cachedFlattenNodes: cachedFlattenNodes.value,
    selectedKeys: selectedKeys.value,
    checkedKeys: checkedKeys.value,
    halfCheckedKeys: halfCheckedKeys.value,
    realCheckedKeys: realCheckedKeys.value,
    disabledKeys: disabledKeys.value,
    motionKeys: motionKeys.value,
    motionType: motionType.value,
    expandedKeys: expandedKeys.value,
    filteredKeys: filteredKeys.value,
    filteredExpandedKeys: filteredExpandedKeys.value,
    filteredShownKeys: filteredShownKeys.value,
    isHovering: isHovering.value,
    cachedKeyValuePairs: cachedKeyValuePairs.value,
    loadedKeys: loadedKeys.value,
    loadingKeys: loadingKeys.value,
    prevProps: prevProps.value,
});

const { adapter: baseAdapter, getDataAttr } = useBaseComponent(props, state);

const adapter: TreeSelectAdapter = markRaw({
    ...baseAdapter,
    updateInputValue: (value: string) => {
        inputValue.value = value;
        state.value.inputValue = value;
    },
    registerClickOutsideHandler: (cb: (e: Event) => void) => {
        if (clickOutsideHandler.value) {
            document.removeEventListener('mousedown', clickOutsideHandler.value, false);
        }
        const handler = (e: Event) => {
            const optionsDom = optionsContainerRef.value;
            const triggerDom = triggerRef.value;
            const target = e.target as Element;
            const path = (e as any).composedPath?.() || [target];

            if (
                optionsDom &&
                (!optionsDom.contains(target) || !optionsDom.contains(target.parentNode as Element)) &&
                triggerDom &&
                !triggerDom.contains(target) &&
                !(path.includes(triggerDom) || path.includes(optionsDom))
            ) {
                cb(e);
            }
        };
        clickOutsideHandler.value = handler;
        document.addEventListener('mousedown', handler, false);
    },
    unregisterClickOutsideHandler: () => {
        if (clickOutsideHandler.value) {
            document.removeEventListener('mousedown', clickOutsideHandler.value, false);
            clickOutsideHandler.value = null;
        }
    },
    rePositionDropdown: () => {
        rePosKey.value = rePosKey.value + 1;
        state.value.rePosKey = rePosKey.value;
    },
    updateState: (states: Partial<BasicTreeSelectInnerData>) => {
        if (states.inputTriggerFocus !== undefined) {
            inputTriggerFocus.value = states.inputTriggerFocus;
            state.value.inputTriggerFocus = states.inputTriggerFocus;
        }
        if (states.isOpen !== undefined) {
            isOpen.value = states.isOpen;
            state.value.isOpen = states.isOpen;
        }
        // isFocus 不在 BasicTreeSelectInnerData 中，但我们需要维护它
        // 注意：isFocus 是一个独立的 ref，不存储在 state 中
        if (states.rePosKey !== undefined) {
            rePosKey.value = states.rePosKey;
            state.value.rePosKey = states.rePosKey;
        }
        if (states.dropdownMinWidth !== undefined) {
            dropdownMinWidth.value = states.dropdownMinWidth;
            state.value.dropdownMinWidth = states.dropdownMinWidth;
        }
        if (states.inputValue !== undefined) {
            inputValue.value = states.inputValue;
            state.value.inputValue = states.inputValue;
        }
        if (states.keyEntities !== undefined) {
            keyEntities.value = states.keyEntities;
            state.value.keyEntities = states.keyEntities;
        }
        if (states.treeData !== undefined) {
            treeData.value = states.treeData;
            state.value.treeData = states.treeData;
        }
        if (states.flattenNodes !== undefined) {
            flattenNodes.value = states.flattenNodes;
            state.value.flattenNodes = states.flattenNodes;
        }
        if (states.cachedFlattenNodes !== undefined) {
            cachedFlattenNodes.value = states.cachedFlattenNodes;
            state.value.cachedFlattenNodes = states.cachedFlattenNodes;
        }
        if (states.selectedKeys !== undefined) {
            selectedKeys.value = states.selectedKeys;
            state.value.selectedKeys = states.selectedKeys;
        }
        if (states.checkedKeys !== undefined) {
            checkedKeys.value = states.checkedKeys;
            state.value.checkedKeys = states.checkedKeys;
        }
        if (states.halfCheckedKeys !== undefined) {
            halfCheckedKeys.value = states.halfCheckedKeys;
            state.value.halfCheckedKeys = states.halfCheckedKeys;
        }
        if (states.realCheckedKeys !== undefined) {
            realCheckedKeys.value = states.realCheckedKeys;
            state.value.realCheckedKeys = states.realCheckedKeys;
        }
        if (states.disabledKeys !== undefined) {
            disabledKeys.value = states.disabledKeys;
            state.value.disabledKeys = states.disabledKeys;
        }
        if (states.motionKeys !== undefined) {
            motionKeys.value = states.motionKeys;
            state.value.motionKeys = states.motionKeys;
        }
        if (states.motionType !== undefined) {
            motionType.value = states.motionType as 'hide' | 'show' | null;
            state.value.motionType = states.motionType as any;
        }
        if (states.expandedKeys !== undefined) {
            expandedKeys.value = states.expandedKeys;
            state.value.expandedKeys = states.expandedKeys;
        }
        if (states.filteredKeys !== undefined) {
            filteredKeys.value = states.filteredKeys;
            state.value.filteredKeys = states.filteredKeys;
        }
        if (states.filteredExpandedKeys !== undefined) {
            filteredExpandedKeys.value = states.filteredExpandedKeys;
            state.value.filteredExpandedKeys = states.filteredExpandedKeys;
        }
        if (states.filteredShownKeys !== undefined) {
            filteredShownKeys.value = states.filteredShownKeys;
            state.value.filteredShownKeys = states.filteredShownKeys;
        }
        if (states.cachedKeyValuePairs !== undefined) {
            cachedKeyValuePairs.value = states.cachedKeyValuePairs;
            state.value.cachedKeyValuePairs = states.cachedKeyValuePairs;
        }
        if (states.loadedKeys !== undefined) {
            loadedKeys.value = states.loadedKeys;
            state.value.loadedKeys = states.loadedKeys;
        }
        if (states.loadingKeys !== undefined) {
            loadingKeys.value = states.loadingKeys;
            state.value.loadingKeys = states.loadingKeys;
        }
        if (states.isHovering !== undefined) {
            isHovering.value = states.isHovering;
            state.value.isHovering = states.isHovering;
        }
        if (states.prevProps !== undefined) {
            prevProps.value = states.prevProps;
            state.value.prevProps = states.prevProps;
        }
    },
    notifySelect: (selectedKey: string, selected: boolean, selectedNode: TreeNodeData) => {
        emit('select', selectedKey, selected, selectedNode);
    },
    notifySearch: (input: string, filteredExpandedKeys: string[], filteredNodes: TreeNodeData[]) => {
        emit('search', input, filteredExpandedKeys, filteredNodes);
    },
    cacheFlattenNodes: (bool: boolean) => {
        cachedFlattenNodes.value = bool ? cloneDeep(flattenNodes.value) : undefined;
        state.value.cachedFlattenNodes = cachedFlattenNodes.value;
    },
    openMenu: () => {
        isOpen.value = true;
        state.value.isOpen = true;
        emit('visibleChange', true);
    },
    closeMenu: (cb?: () => void) => {
        isOpen.value = false;
        state.value.isOpen = false;
        if (cb) {
            cb();
        }
        emit('visibleChange', false);
    },
    getTriggerWidth: () => {
        const el = triggerRef.value;
        return el ? el.getBoundingClientRect().width : 0;
    },
    setOptionWrapperWidth: (width: number | string | null) => {
        // Foundation 层设置的宽度可能是数字（px）或字符串
        // 确保统一处理（与 Select 保持一致）
        if (typeof width === 'number' && width > 0) {
            dropdownMinWidth.value = width;
            state.value.dropdownMinWidth = width;
        } else if (typeof width === 'string') {
            // 如果是字符串，尝试转换为数字（px 值）
            const numValue = parseFloat(width);
            if (!isNaN(numValue) && numValue > 0) {
                dropdownMinWidth.value = numValue;
                state.value.dropdownMinWidth = numValue;
            } else {
                dropdownMinWidth.value = width;
                state.value.dropdownMinWidth = width as any; // Foundation 类型定义是 number | null，但实际可能传入字符串
            }
        } else {
            dropdownMinWidth.value = width;
            state.value.dropdownMinWidth = width;
        }
        // 如果 Foundation 设置的宽度为 0 或无效，在 Popover 渲染后重新计算
        if ((typeof width === 'number' && width === 0) || !width) {
            requestAnimationFrame(() => {
                nextTick(() => {
                    if (triggerRef.value && props.dropdownMatchSelectWidth) {
                        const triggerWidth = triggerRef.value.getBoundingClientRect().width || 0;
                        if (triggerWidth > 0) {
                            dropdownMinWidth.value = triggerWidth;
                            state.value.dropdownMinWidth = triggerWidth;
                        }
                    }
                });
            });
        }
    },
    notifyClear: (e: MouseEvent | KeyboardEvent) => {
        emit('clear', e);
    },
    notifyChange: (
        value: TreeNodeData['value'] | Array<TreeNodeData['value']>,
        node: TreeNodeData[] | TreeNodeData,
        e: MouseEvent
    ) => {
        emit('change', value, node, e);
        const realValue = props.multiple ? (Array.isArray(value) ? value : [value]) : value;
        emit('update:modelValue', realValue as any);
        emit('update:value', realValue as any);
    },
    notifyChangeWithObject: (node: TreeNodeData[] | TreeNodeData, e: MouseEvent) => {
        emit('change', node as any, node, e);
        emit('update:modelValue', node as any);
        emit('update:value', node as any);
    },
    notifyExpand: (expandedKeys: Set<string>, expandedOtherProps: { expanded: boolean; node: TreeNodeData }) => {
        emit('expand', expandedKeys, expandedOtherProps);
        if (expandedOtherProps.expanded && props.loadData) {
            onNodeLoad(expandedOtherProps.node);
        }
    },
    notifyFocus: (e: MouseEvent | FocusEvent) => {
        emit('focus', e);
    },
    notifyBlur: (e: MouseEvent | FocusEvent) => {
        emit('blur', e);
    },
    toggleHovering: (bool: boolean) => {
        isHovering.value = bool;
        state.value.isHovering = bool;
    },
    notifyLoad: (newLoadedKeys: Set<string>, data: TreeNodeData) => {
        emit('load', newLoadedKeys, data);
    },
    updateInputFocus: (bool: boolean) => {
        if (bool) {
            if (inputRef.value) {
                const { preventScroll } = props;
                (inputRef.value as any).focus?.({ preventScroll });
            }
            if (tagInputRef.value) {
                (tagInputRef.value as any).focus?.();
            }
        } else {
            if (inputRef.value) {
                (inputRef.value as any).blur?.();
            }
            if (tagInputRef.value) {
                (tagInputRef.value as any).blur?.();
            }
        }
    },
    updateLoadKeys: (data: TreeNodeData, resolve: (value?: any) => void) => {
        const newState = (foundation as any).handleNodeLoad(loadedKeys.value, loadingKeys.value, data, resolve);
        if (newState && Object.keys(newState).length > 0) {
            if (newState.loadingKeys) {
                loadingKeys.value = newState.loadingKeys;
                state.value.loadingKeys = newState.loadingKeys;
            }
        }
    },
    updateIsFocus: (bool: boolean) => {
        isFocus.value = bool;
        state.value.isFocus = bool;
    },
});

const { foundation } = useFoundation(TreeSelectFoundation as any, adapter as any);

// Patch Foundation's _isControlledComponent method for TreeSelect component
const originalIsControlledComponent = (foundation as any)._isControlledComponent;
if (originalIsControlledComponent && typeof originalIsControlledComponent === 'function') {
    (foundation as any)._isControlledComponent = function (this: any, key: string = 'value'): boolean {
        const props = this.getProps();
        if (key === 'value') {
            return 'value' in props && props.value !== undefined;
        }
        return key in props;
    };
}

const slots = useSlots();

const useCustomTrigger = computed(() => {
    return typeof props.triggerRender === 'function' || Boolean(slots.trigger);
});

const computedPosition = computed(() => {
    return (props.position as any) || 'bottomLeft';
});

const popoverCls = computed(() => {
    return classNames(props.dropdownClassName, `${prefixCls}-popover`);
});

const dropdownStyle = computed(() => {
    const style: any = { ...props.dropdownStyle };
    // Foundation 层会在打开下拉面板时通过 setOptionWrapperWidth 设置 dropdownMinWidth
    // 如果没有设置宽度，Foundation 会使用 getTriggerWidth() 获取实际宽度
    if (dropdownMinWidth.value) {
        // 确保宽度值是数字时添加 px 单位，字符串则直接使用
        const minWidthValue =
            typeof dropdownMinWidth.value === 'number' ? `${dropdownMinWidth.value}px` : dropdownMinWidth.value;
        style.minWidth = minWidthValue;
    }
    return style;
});

const listCls = computed(() => {
    return classNames(`${prefixTree}-option-list`, `${prefixTree}-option-list-block`);
});

const selectionCls = computed(() => {
    if (useCustomTrigger.value) {
        return classNames(props.className);
    }
    const isTriggerPositionSearch =
        props.searchPosition === strings.SEARCH_POSITION_TRIGGER && Boolean(props.filterTreeNode);
    const isEmptyTriggerSearch = isTriggerPositionSearch && isEmpty(checkedKeys.value);
    const isValueTriggerSearch = isTriggerPositionSearch && !isEmpty(checkedKeys.value);
    return classNames(
        prefixCls,
        {
            [`${prefixCls}-borderless`]: props.borderless,
            [`${prefixCls}-focus`]: isFocus.value,
            [`${prefixCls}-disabled`]: props.disabled,
            [`${prefixCls}-single`]: !props.multiple,
            [`${prefixCls}-multiple`]: props.multiple,
            [`${prefixCls}-multiple-tagInput-empty`]: props.multiple && isEmptyTriggerSearch,
            [`${prefixCls}-multiple-tagInput-notEmpty`]: props.multiple && isValueTriggerSearch,
            [`${prefixCls}-filterable`]: Boolean(props.filterTreeNode),
            [`${prefixCls}-error`]: props.validateStatus === 'error',
            [`${prefixCls}-warning`]: props.validateStatus === 'warning',
            [`${prefixCls}-small`]: props.size === 'small',
            [`${prefixCls}-large`]: props.size === 'large',
            [`${prefixCls}-with-prefix`]: props.prefix || props.insetLabel,
            [`${prefixCls}-with-suffix`]: props.suffix,
        },
        props.className
    );
});

const prefixWrapperCls = computed(() => {
    const labelNode = props.prefix || props.insetLabel;
    return classNames(`${prefixCls}-prefix`, {
        [`${prefixCls}-inset-label`]: props.insetLabel,
        [`${prefixCls}-prefix-text`]: labelNode && isString(labelNode),
        [`${prefixCls}-prefix-icon`]: labelNode && isSemiIcon(labelNode),
    });
});

const suffixWrapperCls = computed(() => {
    return classNames(`${prefixCls}-suffix`, {
        [`${prefixCls}-suffix-text`]: props.suffix && isString(props.suffix),
        [`${prefixCls}-suffix-icon`]: props.suffix && isSemiIcon(props.suffix),
    });
});

const hasValue = computed(() => {
    if (props.multiple) {
        if (props.checkRelation === 'related') {
            return Boolean(checkedKeys.value.size);
        } else if (props.checkRelation === 'unRelated') {
            return Boolean(realCheckedKeys.value.size);
        }
    } else {
        return Boolean(selectedKeys.value.length);
    }
    return false;
});

const showClearBtn = computed(() => {
    const triggerSearchHasInputValue = props.searchPosition === strings.SEARCH_POSITION_TRIGGER && inputValue.value;
    return (
        props.showClear &&
        (hasValue.value || triggerSearchHasInputValue) &&
        !props.disabled &&
        (isOpen.value || isHovering.value)
    );
});

const showSearchInput = computed(() => {
    return Boolean(props.filterTreeNode) && props.searchPosition === strings.SEARCH_POSITION_DROPDOWN;
});

const customTriggerValue = computed(() => {
    const triggerRenderKeys = props.multiple
        ? props.checkRelation === 'related'
            ? normalizeKeyList([...checkedKeys.value], keyEntities.value, props.leafOnly, true)
            : [...realCheckedKeys.value]
        : selectedKeys.value;
    return triggerRenderKeys.map((key: string) => {
        const entity = keyEntities.value[key];
        return entity?.data;
    });
});

const customTriggerRender = computed(() => {
    if (!useCustomTrigger.value || slots.trigger) {
        return null;
    }
    return props.triggerRender!({
        componentProps: props,
        disabled: props.disabled || false,
        value: customTriggerValue.value,
        inputValue: inputValue.value,
        placeholder: props.placeholder,
        onSearch: handleSearch,
        onChange: handleInputChange,
        onClear: handleClear,
        onRemove: removeTag,
    });
});

function needUpdate(name: string): boolean {
    const firstInProps = !prevProps.value && name in props;
    if (firstInProps) {
        return true;
    }
    if (!prevProps.value) {
        return false;
    }
    const prevValue = (prevProps.value as any)[name];
    const currentValue = (props as any)[name];
    // 性能优化：对于简单类型使用浅比较，只在必要时使用深度比较
    // 简单类型：undefined, null, string, number, boolean
    if (prevValue === currentValue) {
        return false;
    }
    // 对于复杂类型（对象、数组），使用深度比较
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

function updateTreeDataAndEntities(
    newState: any,
    keyMaps: any
): { treeData: any; keyEntities: any; valueEntities: any } {
    let treeData: any;
    let keyEntities = state.value.keyEntities || {};
    let valueEntities = state.value.cachedKeyValuePairs || {};

    const needUpdateTreeData = needUpdate('treeData');

    if (needUpdateTreeData) {
        treeData = props.treeData;
        newState.treeData = treeData;
        const entitiesMap = convertDataToEntities(treeData, keyMaps);
        newState.keyEntities = { ...entitiesMap.keyEntities };
        keyEntities = newState.keyEntities;
        newState.cachedKeyValuePairs = { ...entitiesMap.valueEntities };
        valueEntities = newState.cachedKeyValuePairs;
    }

    if (treeData && props.motion) {
        if (
            prevProps.value &&
            props.motion &&
            !isEqual(Object.keys(newState.keyEntities || {}), Object.keys((prevProps.value as any).keyEntities || {}))
        ) {
            newState.motionKeys = new Set([]);
            newState.motionType = null;
        }
    }

    return { treeData, keyEntities, valueEntities };
}

// 性能优化：防抖机制，避免短时间内频繁调用
let updateStateTimer: ReturnType<typeof setTimeout> | null = null;

function updateStateFromProps() {
    // 性能优化：防抖机制，将多个更新合并到同一个事件循环中
    if (updateStateTimer) {
        clearTimeout(updateStateTimer);
    }

    updateStateTimer = setTimeout(() => {
        updateStateTimer = null;
        executeUpdateStateFromProps();
    }, 0);
}

function executeUpdateStateFromProps() {
    const { keyMaps } = props;
    const withObject = props.onChangeWithObject;
    const newState: any = {
        prevProps: { ...props },
    };

    const {
        treeData: updatedTreeData,
        keyEntities: updatedKeyEntities,
        valueEntities,
    } = updateTreeDataAndEntities(newState, keyMaps);

    const needUpdateExpandedKeys = needUpdate('expandedKeys');
    const isSearching = Boolean(props.filterTreeNode && inputValue.value && inputValue.value.length);

    if (!isSearching) {
        if (needUpdateExpandedKeys || (prevProps.value && needUpdate('autoExpandParent'))) {
            newState.expandedKeys = calcExpandedKeys(
                props.expandedKeys,
                updatedKeyEntities,
                props.autoExpandParent || !prevProps.value
            );
            if (prevProps.value && props.motion && !updatedTreeData) {
                const { motionKeys, motionType } = calcMotionKeys(
                    expandedKeys.value,
                    newState.expandedKeys,
                    updatedKeyEntities
                );
                newState.motionKeys = new Set(motionKeys);
                newState.motionType = motionType;
                if (motionType === 'hide') {
                    newState.cachedFlattenNodes = cloneDeep(flattenNodes.value);
                }
            }
        } else if (
            (!prevProps.value && (props.defaultExpandAll || props.expandAll)) ||
            (updatedTreeData && props.expandAll)
        ) {
            newState.expandedKeys = new Set(Object.keys(updatedKeyEntities));
        } else if (!prevProps.value && props.defaultExpandedKeys) {
            newState.expandedKeys = calcExpandedKeys(props.defaultExpandedKeys, updatedKeyEntities);
        } else if (!prevProps.value && props.defaultValue) {
            newState.expandedKeys = calcExpandedKeysForValues(
                normalizeValue(props.defaultValue, withObject, keyMaps),
                updatedKeyEntities,
                props.multiple,
                valueEntities
            );
        } else if (!prevProps.value && props.value) {
            newState.expandedKeys = calcExpandedKeysForValues(
                normalizeValue(props.value, withObject, keyMaps),
                updatedKeyEntities,
                props.multiple,
                valueEntities
            );
        }

        if (!newState.expandedKeys) {
            delete newState.expandedKeys;
        }

        if (updatedTreeData || newState.expandedKeys) {
            const flattenNodesResult = flattenTreeData(
                updatedTreeData || treeData.value,
                newState.expandedKeys || expandedKeys.value,
                keyMaps
            );
            newState.flattenNodes = flattenNodesResult;
        }
    } else {
        let filteredState;
        // Re-filter when treeData changes, or when showFilteredOnly/filterTreeNode changes
        const needRefilter =
            updatedTreeData ||
            needUpdate('showFilteredOnly') ||
            needUpdate('filterTreeNode') ||
            needUpdate('treeNodeFilterProp');
        if (needRefilter) {
            filteredState = filterTreeData({
                treeData: updatedTreeData || treeData.value,
                inputValue: inputValue.value,
                filterTreeNode: props.filterTreeNode,
                filterProps: props.treeNodeFilterProp,
                showFilteredOnly: props.showFilteredOnly,
                keyEntities: newState.keyEntities || keyEntities.value,
                prevExpandedKeys: [...filteredExpandedKeys.value],
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
                updatedKeyEntities,
                props.autoExpandParent || !prevProps.value
            );
            if (prevProps.value && props.motion) {
                const prevKeys = prevProps.value ? filteredExpandedKeys.value : new Set([]);
                if (!updatedTreeData) {
                    const motionResult = calcMotionKeys(prevKeys, newState.filteredExpandedKeys, updatedKeyEntities);
                    let { motionKeys } = motionResult;
                    const { motionType } = motionResult;
                    if (props.showFilteredOnly) {
                        motionKeys = motionKeys.filter((key) => filteredShownKeys.value.has(key));
                    }
                    if (motionType === 'hide') {
                        newState.cachedFlattenNodes = cloneDeep(flattenNodes.value);
                    }
                    newState.motionKeys = new Set(motionKeys);
                    newState.motionType = motionType;
                }
            }
        }
        // Recalculate flattenNodes if not already set by filterTreeData
        if (!newState.flattenNodes && (updatedTreeData || newState.filteredExpandedKeys)) {
            newState.flattenNodes = flattenTreeData(
                updatedTreeData || treeData.value,
                newState.filteredExpandedKeys || filteredExpandedKeys.value,
                keyMaps,
                props.showFilteredOnly && (filteredShownKeys.value || newState.filteredShownKeys)
            );
        }
    }

    const isMultiple = props.multiple;
    if (!isMultiple) {
        if (needUpdate('value')) {
            newState.selectedKeys = findKeysForValues(
                normalizeValue(props.value, withObject, keyMaps),
                valueEntities,
                isMultiple
            );
        } else if (!prevProps.value && props.defaultValue) {
            newState.selectedKeys = findKeysForValues(
                normalizeValue(props.defaultValue, withObject, keyMaps),
                valueEntities,
                isMultiple
            );
        } else if (updatedTreeData) {
            if (props.value) {
                newState.selectedKeys = findKeysForValues(
                    normalizeValue(props.value, withObject, keyMaps) || '',
                    valueEntities,
                    isMultiple
                );
            } else {
                newState.selectedKeys = updateKeys(selectedKeys.value, updatedKeyEntities);
            }
        }
    } else {
        let checkedKeyValues;
        if (needUpdate('value')) {
            checkedKeyValues = findKeysForValues(
                normalizeValue(props.value, withObject, keyMaps),
                valueEntities,
                isMultiple
            );
        } else if (!prevProps.value && props.defaultValue) {
            checkedKeyValues = findKeysForValues(
                normalizeValue(props.defaultValue, withObject, keyMaps),
                valueEntities,
                isMultiple
            );
        } else if (updatedTreeData) {
            if (props.value) {
                checkedKeyValues = findKeysForValues(
                    normalizeValue(props.value, withObject, keyMaps) || [],
                    valueEntities,
                    isMultiple
                );
            } else {
                checkedKeyValues = updateKeys(
                    props.checkRelation === 'related' ? checkedKeys.value : realCheckedKeys.value,
                    updatedKeyEntities
                );
            }
        }

        if (checkedKeyValues) {
            if (props.checkRelation === 'unRelated') {
                newState.realCheckedKeys = new Set(checkedKeyValues);
            } else if (props.checkRelation === 'related') {
                const { checkedKeys: newCheckedKeys, halfCheckedKeys: newHalfCheckedKeys } = calcCheckedKeys(
                    checkedKeyValues,
                    updatedKeyEntities
                );
                newState.checkedKeys = newCheckedKeys;
                newState.halfCheckedKeys = newHalfCheckedKeys;
            }
        }
    }

    if (needUpdate('loadedKeys')) {
        newState.loadedKeys = new Set(props.loadedKeys);
    }

    if (needUpdate('treeData') || needUpdate('value')) {
        newState.rePosKey = rePosKey.value + 1;
    }

    if (updatedTreeData && props.disableStrictly && props.checkRelation === 'related') {
        newState.disabledKeys = calcDisabledKeys(updatedKeyEntities, keyMaps);
    }

    adapter.updateState(newState);
    // 性能优化：只在真正需要时才更新 prevProps，避免每次都创建新对象
    // 使用浅拷贝而不是深拷贝，减少内存开销
    if (!prevProps.value) {
        prevProps.value = { ...props } as any;
    } else {
        // 只更新变化的属性，而不是整个对象
        Object.assign(prevProps.value, props);
    }
}

watch(
    () => [
        props.treeData,
        props.expandedKeys,
        props.value,
        props.defaultValue,
        props.loadedKeys,
        props.autoExpandParent,
        props.expandAll,
        props.defaultExpandAll,
        props.defaultExpandedKeys,
        props.disableStrictly,
        props.checkRelation,
        props.multiple,
        props.onChangeWithObject,
        props.keyMaps,
        props.showFilteredOnly,
        props.filterTreeNode,
        props.treeNodeFilterProp,
        inputValue.value,
    ],
    () => {
        updateStateFromProps();
    },
    { immediate: true, deep: true }
);

watch(
    () => props.modelValue,
    (newVal) => {
        if (newVal !== undefined && newVal !== props.value) {
            updateStateFromProps();
        }
    },
    { deep: true }
);

function handleClick(e: MouseEvent) {
    (foundation as any).handleClick(e);
}

function handleClear(e: MouseEvent) {
    e.stopPropagation();
    (foundation as any).handleClear(e);
}

function handleClearEnterPress(e: KeyboardEvent) {
    if (isEnterPress(e)) {
        e.stopPropagation();
        (foundation as any).handleClearEnterPress(e);
    }
}

function handleMouseEnter(_e: MouseEvent) {
    (foundation as any).toggleHoverState(true);
}

function handleMouseLeave(_e: MouseEvent) {
    (foundation as any).toggleHoverState(false);
}

function handleKeyDown(e: KeyboardEvent) {
    (foundation as any).handleKeyDown(e);
}

function handleSelectionEnterPress(e: KeyboardEvent) {
    if (isEnterPress(e)) {
        (foundation as any).handleSelectionEnterPress(e);
    }
}

function handlePopoverVisibleChange(visible: boolean) {
    (foundation as any).handlePopoverVisibleChange(visible);
    // When searchPosition is 'trigger', focus input when dropdown opens
    if (visible && props.filterTreeNode && props.searchPosition === strings.SEARCH_POSITION_TRIGGER) {
        if (!props.multiple && inputRef.value) {
            // Single select mode - focus the input
            nextTick(() => {
                (inputRef.value as any)?.focus?.({ preventScroll: props.preventScroll });
            });
        } else if (props.multiple && tagInputRef.value) {
            // Multiple select mode - focus the tagInput (already handled by TagInput)
            // TagInput handles focus automatically
        }
    }
}

function handleDropdownVisibleChange(visible: boolean) {
    emit('visibleChange', visible);

    if (visible) {
        // 当下拉面板打开时，如果设置了 dropdownMatchSelectWidth，计算并设置下拉面板宽度
        // Foundation 层会在 open() 时调用 _setDropdownWidth()，但可能此时 Popover 还未完全渲染
        // 所以我们需要在 Popover 完全渲染后再次确保宽度正确（与 Select 保持一致）
        if (props.dropdownMatchSelectWidth && triggerRef.value) {
            // 使用 requestAnimationFrame + nextTick 确保 Popover 完全渲染后再计算宽度
            requestAnimationFrame(() => {
                nextTick(() => {
                    const triggerWidth = triggerRef.value?.getBoundingClientRect().width || 0;
                    if (triggerWidth > 0) {
                        dropdownMinWidth.value = triggerWidth;
                        state.value.dropdownMinWidth = triggerWidth;
                    }
                });
            });
        }
    }
}

function handleClickOutside(e: Event) {
    (foundation as any).handlerTriggerBlur(e);
    (foundation as any).close(e);
}

function handlePopoverAfterClose() {
    (foundation as any).handleAfterClose();
}

function handleSearch(value: string) {
    if (!isOpen.value) {
        (foundation as any).open();
    }
    (foundation as any).handleInputChange(value);
}

function handleInputChange(value: string) {
    (foundation as any).handleInputChange(value);
}

function handleSearchInput(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    handleInputChange(value);
}

function removeTag(key: string) {
    (foundation as any).removeTag(key);
}

function onNodeLoad(data: TreeNodeData) {
    return new Promise((resolve) => {
        (foundation as any).setLoadKeys(data, resolve);
    });
}

function onNodeSelect(e: MouseEvent | KeyboardEvent, treeNode: TreeNodeProps) {
    (foundation as any).handleNodeSelect(e, treeNode);
    // Clear inputValue when searchPosition is trigger in single-select mode to show selected text
    if (!props.multiple && props.filterTreeNode && props.searchPosition === strings.SEARCH_POSITION_TRIGGER) {
        // Directly clear inputValue and reset inputTriggerFocus to show selected text
        adapter.updateInputValue('');
        adapter.updateState({ inputTriggerFocus: false });
    }
}

function onNodeCheck(e: MouseEvent | KeyboardEvent, treeNode: TreeNodeProps) {
    // Handle checkbox clicks - this is called when clicking the checkbox or its label
    (foundation as any).handleNodeSelect(e, treeNode);
}

function onNodeExpand(e: MouseEvent | KeyboardEvent, treeNode: TreeNodeProps) {
    (foundation as any).handleNodeExpand(e, treeNode);
}

function getDataForKeyNotInKeyEntities(key: string) {
    return (foundation as any).getDataForKeyNotInKeyEntities(key);
}

function renderTreeContent() {
    const treeContextValue = {
        loadData: props.loadData,
        treeDisabled: props.disabled,
        motion: props.motionExpand,
        motionKeys: motionKeys.value,
        motionType: motionType.value,
        expandAction: props.expandAction,
        filterTreeNode: props.filterTreeNode,
        keyEntities: keyEntities.value,
        onNodeClick: onNodeSelect,
        onNodeDoubleClick: () => {},
        onNodeRightClick: () => {},
        onNodeExpand,
        onNodeSelect,
        onNodeCheck,
        renderTreeNode: renderTreeNode,
        multiple: props.multiple,
        showFilteredOnly: props.showFilteredOnly,
        isSearching: Boolean(inputValue.value),
        renderLabel: props.renderLabel,
        renderFullLabel: props.renderFullLabel,
        labelEllipsis: typeof props.labelEllipsis === 'undefined' ? Boolean(props.virtualize) : props.labelEllipsis,
    };

    const noData =
        isEmpty(flattenNodes.value) ||
        (props.showFilteredOnly && Boolean(inputValue.value) && !filteredKeys.value.size);
    if (noData) {
        return renderEmpty(treeContextValue);
    }

    const isExpandControlled = 'expandedKeys' in props;
    const renderNodeListContent = () => {
        if (!props.virtualize || isEmpty(props.virtualize)) {
            return h(NodeList, {
                flattenNodes: flattenNodes.value,
                flattenList: cachedFlattenNodes.value,
                motionKeys: props.motionExpand ? motionKeys.value : new Set([]),
                motionType: motionType.value,
                searchTargetIsDeep:
                    isExpandControlled &&
                    props.motionExpand &&
                    isEmpty(motionKeys.value) &&
                    !isEmpty(filteredKeys.value),
                onMotionEnd: () => {
                    adapter.rePositionDropdown();
                },
                renderTreeNode: renderTreeNode,
            });
        }

        // Virtual list implementation
        return h(
            AutoSizer,
            {
                defaultHeight: props.virtualize.height || 270,
                defaultWidth: props.virtualize.width || '100%',
            },
            {
                default: ({ height, width }: { height: number; width: number | string }) => {
                    // For Vue, we render all nodes with fixed height for now
                    // TODO: Implement proper virtual list when vue-virtual-list is available
                    return h(
                        'div',
                        {
                            class: `${prefixTree}-virtual-list`,
                            style: {
                                height: typeof height === 'number' ? `${height}px` : height,
                                width: typeof width === 'number' ? `${width}px` : width,
                                overflow: 'auto',
                            },
                        },
                        flattenNodes.value.map((treeNode, index) => {
                            const style = {
                                height: `${props.virtualize!.itemSize}px`,
                            };
                            return renderTreeNode(treeNode, index, style);
                        })
                    );
                },
            }
        );
    };

    if (props.multiple) {
        return h('div', { class: `${prefixTree}-wrapper` }, [
            h(
                CheckboxGroup,
                {
                    value: Array.from(props.checkRelation === 'related' ? checkedKeys.value : realCheckedKeys.value),
                    disabled: props.disabled,
                },
                {
                    default: () =>
                        h(TreeContextProvider, { value: treeContextValue }, { default: () => renderNodeListContent() }),
                }
            ),
        ]);
    } else {
        return h('div', { class: `${prefixTree}-wrapper` }, [
            h(TreeContextProvider, { value: treeContextValue }, { default: () => renderNodeListContent() }),
        ]);
    }
}

const TreeContextProvider = {
    name: 'TreeContextProvider',
    props: {
        value: {
            type: Object,
            required: true,
        },
    },
    setup(props: any, { slots }: any) {
        provide(TreeContextKey, props.value);
        return () => slots.default?.();
    },
};

function renderTreeNode(treeNode: FlattenNode, ind?: number, style?: any) {
    const { data, key } = treeNode;
    const treeNodeProps = (foundation as any).getTreeNodeProps(key);
    if (!treeNodeProps) {
        return null;
    }
    const nodeProps: any = pick(treeNode, ['key', 'label', 'disabled', 'isLeaf', 'icon', 'isEnd']);
    const children = data[get(props.keyMaps, 'children', 'children')];
    if (!isUndefined(children)) {
        nodeProps.children = children;
    }
    return h(TreeNode, {
        ...treeNodeProps,
        ...data,
        ...nodeProps,
        data: data,
        style: style,
        showLine: props.showLine,
        expandIcon: props.expandIcon,
    });
}

function renderEmpty(treeContextValue: any) {
    if (props.emptyContent === null) {
        return null;
    }
    if (props.emptyContent) {
        return h(
            TreeContextProvider,
            { value: treeContextValue },
            {
                default: () =>
                    h(TreeNode, {
                        empty: true,
                        emptyContent: props.emptyContent,
                    }),
            }
        );
    }
    return h(
        LocaleConsumer,
        {
            componentName: 'Tree',
        },
        {
            default: (locale: any) =>
                h(
                    TreeContextProvider,
                    { value: treeContextValue },
                    {
                        default: () =>
                            h(TreeNode, {
                                empty: true,
                                emptyContent: locale.emptyText || '暂无数据',
                            }),
                    }
                ),
        }
    );
}

function renderSelectContent() {
    const isTriggerPositionSearch = props.filterTreeNode && props.searchPosition === strings.SEARCH_POSITION_TRIGGER;
    if (isTriggerPositionSearch) {
        return props.multiple ? renderTagInput() : renderSingleTriggerSearch();
    }
    if (!props.multiple || !hasValue.value) {
        const renderText = (foundation as any).getRenderTextInSingle();
        const selectedKey = selectedKeys.value[0];
        const selectedItem = selectedKey
            ? keyEntities.value[selectedKey]?.data || getDataForKeyNotInKeyEntities(selectedKey)
            : null;

        if (slots.selectedItem && selectedItem) {
            return h(
                'span',
                {
                    class: classNames(`${prefixCls}-selection-content`, {
                        [`${prefixCls}-selection-placeholder`]: !selectedItem,
                    }),
                },
                slots.selectedItem({ option: selectedItem })
            );
        }

        return h(
            'span',
            {
                class: classNames(`${prefixCls}-selection-content`, {
                    [`${prefixCls}-selection-placeholder`]: !renderText,
                }),
            },
            renderText || props.placeholder
        );
    }
    return renderTagList();
}

function renderSingleTriggerSearch() {
    // Show span when inputValue is empty OR when inputTriggerFocus is false (to show selected text)
    const shouldShowSpan = !inputValue.value || !inputTriggerFocus.value;
    // Use Fragment to wrap multiple elements, filter out null values
    const children = [renderInput(), shouldShowSpan ? renderSingleTriggerSearchItem() : null].filter(Boolean);
    return h(Fragment, {}, children);
}

function renderSingleTriggerSearchItem() {
    const renderText = (foundation as any).getRenderTextInSingle();
    const selectedKey = selectedKeys.value[0];
    const selectedItem = selectedKey
        ? keyEntities.value[selectedKey]?.data || getDataForKeyNotInKeyEntities(selectedKey)
        : null;

    if (slots.selectedItem && selectedItem) {
        return h(
            'span',
            {
                class: classNames(`${prefixCls}-selection-TriggerSearchItem`, {
                    [`${prefixCls}-selection-TriggerSearchItem-disabled`]: props.disabled,
                }),
            },
            slots.selectedItem({ option: selectedItem })
        );
    }

    const displayText = renderText || props.placeholder;
    return h(
        'span',
        {
            class: classNames(`${prefixCls}-selection-TriggerSearchItem`, {
                [`${prefixCls}-selection-TriggerSearchItem-placeholder`]:
                    (inputTriggerFocus.value || !renderText) && !props.disabled,
                [`${prefixCls}-selection-TriggerSearchItem-disabled`]: props.disabled,
            }),
            style: {
                position: 'relative',
                lineHeight: 'inherit',
            },
            onClick: () => {
                // Focus input and trigger focus handler to clear inputValue and update inputTriggerFocus
                (foundation as any).handleInputTriggerFocus();
                nextTick(() => {
                    if (inputRef.value) {
                        const { preventScroll } = props;
                        (inputRef.value as any)?.focus?.({ preventScroll });
                    }
                });
            },
        },
        displayText
    );
}

function renderInput() {
    const isDropdownPositionSearch = props.searchPosition === strings.SEARCH_POSITION_DROPDOWN;
    const useCusSearch = typeof props.searchRender === 'function' || typeof props.searchRender === 'boolean';
    if (useCusSearch && !props.searchRender) {
        return null;
    }

    const baseInputProps = {
        value: inputValue.value,
        preventScroll: props.preventScroll,
    };

    const inputDropdownProps = {
        showClear: props.showSearchClear,
        prefix: h(IconSearch),
    };

    const inputTriggerProps = {
        autoFocus: props.searchAutoFocus,
        onFocus: () => {
            (foundation as any).handleInputTriggerFocus();
        },
        onBlur: () => {
            (foundation as any).handleInputTriggerBlur();
        },
        disabled: props.disabled,
    };

    const realInputProps = isDropdownPositionSearch ? inputDropdownProps : inputTriggerProps;
    const wrapperCls = classNames({
        [`${prefixTree}-search-wrapper`]: isDropdownPositionSearch,
        [`${prefixCls}-triggerSingleSearch-wrapper`]: !isDropdownPositionSearch && !props.multiple,
        [`${prefixCls}-triggerSingleSearch-upper`]: !isDropdownPositionSearch && inputTriggerFocus.value,
    });

    return h(
        'div',
        { class: wrapperCls },
        h(
            LocaleConsumer,
            {
                componentName: 'TreeSelect',
            },
            {
                default: (locale: any) => {
                    const placeholder = isDropdownPositionSearch
                        ? props.searchPlaceholder || locale.searchPlaceholder || '搜索'
                        : '';
                    if (useCusSearch) {
                        return (props.searchRender as any)({ ...realInputProps, ...baseInputProps, placeholder });
                    }
                    return h(Input, {
                        'aria-label': 'Filter TreeSelect item',
                        ref: inputRef,
                        placeholder,
                        class: classNames({
                            [`${prefixTree}-input`]: isDropdownPositionSearch,
                            [`${prefixCls}-inputTrigger`]: !isDropdownPositionSearch,
                        }),
                        ...baseInputProps,
                        ...realInputProps,
                        onInput: handleSearchInput,
                    });
                },
            }
        )
    );
}

function renderTagList() {
    const triggerRenderKeys = props.multiple
        ? props.autoMergeValue
            ? props.checkRelation === 'related'
                ? normalizeKeyList([...checkedKeys.value], keyEntities.value, props.leafOnly, true)
                : [...realCheckedKeys.value]
            : [...checkedKeys.value]
        : selectedKeys.value;

    const tagList: VNode[] = [];
    triggerRenderKeys.forEach((key: string, index: number) => {
        const entity = keyEntities.value[key];
        const item = entity && entity.key === key ? entity.data : getDataForKeyNotInKeyEntities(key);

        const onClose = (tagContent: any, e: MouseEvent) => {
            if (e && typeof (e as any).preventDefault === 'function') {
                (e as any).preventDefault();
            }
            removeTag(key);
        };

        // 优先使用插槽
        if (slots.selectedItem && item) {
            const slotContent = slots.selectedItem({
                option: item,
                index,
                disabled: props.disabled || item.disabled,
                onClose,
            });
            const isDisabled =
                props.disabled || item.disabled || (props.disableStrictly && disabledKeys.value.has(item.key));
            // 多选模式下，插槽内容自动包裹在 Tag 中
            tagList.push(
                h(
                    Tag,
                    {
                        closable: !isDisabled,
                        color: 'white',
                        visible: true,
                        size: props.size === 'small' ? 'small' : 'large',
                        onClose,
                        key: `tag-${key}-${index}`,
                    },
                    { default: () => slotContent }
                )
            );
            return;
        }

        // 使用 renderSelectedItem prop
        const renderSelectedItem = isFunction(props.renderSelectedItem)
            ? props.renderSelectedItem
            : (selectedItem: TreeNodeData) => ({
                  isRenderInTag: true,
                  content: get(selectedItem, get(props.keyMaps, 'label', props.treeNodeLabelProp), null),
              });
        const { content, isRenderInTag } = item
            ? (renderSelectedItem as RenderSelectedItemInMultiple)(item, { index, onClose })
            : ({ isRenderInTag: false, content: null } as any);

        if (isNull(content) || isUndefined(content)) {
            return;
        }
        const isDisabled =
            props.disabled || item.disabled || (props.disableStrictly && disabledKeys.value.has(item.key));
        if (isRenderInTag) {
            tagList.push(
                h(
                    Tag,
                    {
                        closable: !isDisabled,
                        color: 'white',
                        visible: true,
                        size: props.size === 'small' ? 'small' : 'large',
                        onClose,
                        key: `tag-${key}-${index}`,
                    },
                    { default: () => content }
                )
            );
        } else {
            tagList.push(content);
        }
    });

    return h(TagGroup, {
        maxTagCount: props.maxTagCount,
        tagList,
        size: 'large',
        mode: 'custom',
        showPopover: props.showRestTagsPopover,
        popoverProps: props.restTagsPopoverProps,
    });
}

function renderTagInput() {
    const triggerRenderKeys = props.autoMergeValue
        ? props.checkRelation === 'related'
            ? normalizeKeyList([...checkedKeys.value], keyEntities.value, props.leafOnly, true)
            : [...realCheckedKeys.value]
        : [...checkedKeys.value];

    const autoFocus =
        props.filterTreeNode && props.searchPosition === strings.SEARCH_POSITION_TRIGGER
            ? props.searchAutoFocus
            : undefined;

    return h(TagInput, {
        maxTagCount: props.maxTagCount,
        disabled: props.disabled,
        onInputChange: (v: string) => handleInputChange(v),
        ref: tagInputRef,
        placeholder: props.placeholder,
        value: triggerRenderKeys,
        inputValue: inputValue.value,
        size: props.size,
        showRestTagsPopover: props.showRestTagsPopover,
        restTagsPopoverProps: props.restTagsPopoverProps,
        autofocus: autoFocus,
        renderTagItem: (value: string, index: number, onClose: () => void) => renderTagItem(value, index, onClose),
        onRemove: (itemKey: string) => removeTag(itemKey),
        expandRestTagsOnClick: false,
        preventScroll: props.preventScroll,
    });
}

function renderTagItem(key: string, idx: number, onCloseCallback?: () => void) {
    const keyList = normalizeKeyList([key], keyEntities.value, props.leafOnly, true);
    const nodes = keyList.map(() =>
        keyEntities.value[key] && keyEntities.value[key].key === key
            ? keyEntities.value[key].data
            : getDataForKeyNotInKeyEntities(key)
    );
    const value = getValueOrKey(nodes, props.keyMaps);
    const tagCls = classNames(`${prefixCls}-selection-tag`, {
        [`${prefixCls}-selection-tag-disabled`]: props.disabled,
    });
    const nodeHaveData = !isEmpty(nodes) && !isEmpty(nodes[0]);
    const isDisableStrictlyNode = props.disableStrictly && nodeHaveData && disabledKeys.value.has(nodes[0].key);
    const closable = nodeHaveData && !nodes[0].disabled && !props.disabled && !isDisableStrictlyNode;
    const onClose = (tagChildren: any, e: MouseEvent) => {
        (e as any).preventDefault();
        removeTag(key);
        if (onCloseCallback) {
            onCloseCallback();
        }
    };
    const item = nodes[0];

    // 优先使用插槽
    if (slots.selectedItem && item) {
        const slotContent = slots.selectedItem({ option: item, index: idx, disabled: !closable, onClose });
        return h(
            Tag,
            {
                size: props.size === 'small' ? 'small' : 'large',
                key: `tag-${value}-${idx}`,
                color: 'white',
                class: tagCls,
                closable,
                onClose,
            },
            { default: () => slotContent }
        );
    }

    // 使用 renderSelectedItem prop
    const renderSelectedItem = isFunction(props.renderSelectedItem)
        ? props.renderSelectedItem
        : (selectedItem: TreeNodeData) => ({
              isRenderInTag: true,
              content: get(selectedItem, get(props.keyMaps, 'label', props.treeNodeLabelProp), null),
          });
    if (isFunction(renderSelectedItem)) {
        const { content, isRenderInTag } = item
            ? (renderSelectedItem as RenderSelectedItemInMultiple)(item, { index: idx, onClose })
            : ({ isRenderInTag: false, content: null } as any);
        if (isRenderInTag) {
            return h(
                Tag,
                {
                    size: props.size === 'small' ? 'small' : 'large',
                    key: `tag-${value}-${idx}`,
                    color: 'white',
                    class: tagCls,
                    closable,
                    onClose,
                },
                { default: () => content }
            );
        } else {
            return content;
        }
    }
    return h(
        Tag,
        {
            size: props.size === 'small' ? 'small' : 'large',
            key: `tag-${value}-${idx}`,
            color: 'white',
            class: tagCls,
            closable,
            onClose,
        },
        { default: () => value }
    );
}

defineExpose({
    open: () => (foundation as any).open(),
    close: () => (foundation as any).close(null),
    focus: () => (foundation as any).handleTriggerFocus(null),
    blur: () => (foundation as any).handlerTriggerBlur(null),
    search: (value: string) => {
        if (!isOpen.value) {
            (foundation as any).open();
        }
        (foundation as any).handleInputChange(value);
    },
});

onUnmounted(() => {
    // 清理防抖定时器
    if (updateStateTimer) {
        clearTimeout(updateStateTimer);
        updateStateTimer = null;
    }
    foundation?.destroy();
});
</script>
