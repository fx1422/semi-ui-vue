<template>
    <Popover
        :visible="isOpenInternal"
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
        :click-to-hide="false"
        :click-trigger-to-hide="false"
        :disable-focus-listener="props.multiple && Boolean(props.filterTreeNode)"
        :guard-focus="false"
        :return-focus-on-close="false"
        @update:visible="handlePopoverVisibleUpdate"
        @visible-change="handleDropdownVisibleChange"
        @click-out-side="handleClickOutside"
    >
        <template #content>
            <div
                ref="optionsContainerRef"
                :class="popoverCls"
                :style="dropdownStyle"
                role="listbox"
                @keydown="handleKeyDown"
                @mousedown="handleDropdownMouseDown"
            >
                <slot name="top">
                    <component :is="props.topSlot" v-if="props.topSlot" />
                </slot>
                <Item
                    :active-keys="activeKeys"
                    :selected-keys="selectedKeys"
                    :separator="props.separator"
                    :loaded-keys="loadedKeys"
                    :loading-keys="loadingKeys"
                    :on-item-click="handleItemClick"
                    :on-item-hover="handleItemHover"
                    :show-next="props.showNext"
                    :on-item-checkbox-click="handleItemCheckboxClick"
                    :on-list-scroll="handleListScroll"
                    :searchable="searchable"
                    :keyword="inputValue"
                    :empty="isEmpty"
                    :empty-content="props.emptyContent"
                    :load-data="props.loadData"
                    :data="renderData"
                    :multiple="props.multiple"
                    :checked-keys="checkedKeys"
                    :half-checked-keys="halfCheckedKeys"
                    :filter-render="props.filterRender"
                    :virtualize="props.virtualizeInSearch"
                    :expand-icon="props.expandIcon"
                    @mouse-down-in-dropdown="handleMouseDownInDropdown"
                />
                <slot name="bottom">
                    <component :is="props.bottomSlot" v-if="props.bottomSlot" />
                </slot>
            </div>
        </template>

        <div
            :id="props.id"
            ref="triggerRef"
            :class="selectionCls"
            :style="props.style"
            tabindex="0"
            :aria-label="props['aria-label'] || 'Cascader'"
            :aria-labelledby="props['aria-labelledby']"
            :aria-describedby="props['aria-describedby']"
            :aria-errormessage="props['aria-errormessage']"
            :aria-invalid="props['aria-invalid']"
            :aria-required="props['aria-required']"
            role="combobox"
            @click="handleTriggerClick"
            @keydown="handleKeyDown"
            @focus="handleFocus"
            @blur="handleBlur"
            @mouseenter="handleMouseEnter"
            @mouseleave="handleMouseLeave"
        >
            <template v-if="useCustomTrigger">
                <component :is="customTriggerRender" />
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
                    <!-- Single Selection -->
                    <template v-if="!props.multiple">
                        <template v-if="props.filterTreeNode">
                            <!-- Search Wrapper for filterable cascader -->
                            <div :class="searchWrapperCls">
                                <span :class="selectionTextCls">
                                    <template v-if="displayPath.length > 0">
                                        <slot name="display" :selected="displayPath" :index="0">
                                            {{ displayText }}
                                        </slot>
                                    </template>
                                    <template v-else>{{ props.placeholder }}</template>
                                </span>
                                <Input
                                    v-if="showInput"
                                    ref="inputRef"
                                    :value="inputValue"
                                    :class="`${prefixCls}-input ${prefixCls}-input-single`"
                                    :size="props.size"
                                    :disabled="props.disabled"
                                    borderless
                                    @input="(e: Event) => handleInputChange((e.target as HTMLInputElement).value)"
                                    @keydown="handleInputKeyDown"
                                    @blur="handleInputBlur"
                                />
                            </div>
                        </template>
                        <template v-else>
                            <span :class="selectionTextCls">
                                <template v-if="displayPath.length > 0">
                                    <slot name="display" :selected="displayPath" :index="0">
                                        {{ displayText }}
                                    </slot>
                                </template>
                                <template v-else>{{ props.placeholder }}</template>
                            </span>
                        </template>
                    </template>

                    <!-- Multiple Selection -->
                    <template v-else>
                        <!-- Multiple Selection with TagInput (searchable) -->
                        <TagInput
                            v-if="showFilterInput"
                            ref="inputRef"
                            :value="tagInputValues"
                            :class="tagInputCls"
                            :size="props.size"
                            :disabled="props.disabled"
                            :max-tag-count="props.maxTagCount"
                            :show-rest-tags-popover="props.showRestTagsPopover"
                            :rest-tags-popover-props="props.restTagsPopoverProps"
                            :render-tag-item="renderTagItem"
                            :input-value="inputValue"
                            :placeholder="props.placeholder"
                            @input-change="(value: string, e: Event) => handleInputChange(value)"
                            @key-down="handleInputKeyDown"
                            @remove="handleTagRemove"
                            @focus="handleInputFocus"
                            @blur="handleInputBlur"
                        />
                        <template v-else>
                            <TagGroup
                                v-if="realKeys.size > 0"
                                :max-tag-count="props.maxTagCount"
                                :rest-count="overflowItemCount"
                                :show-popover="props.showRestTagsPopover"
                                :popover-props="props.restTagsPopoverProps"
                                :size="props.size === 'default' ? 'large' : props.size"
                            >
                                <template v-for="(item, index) in tagsForTagGroup" :key="item.key">
                                    <Tag
                                        :closable="true"
                                        :disabled="item.data.disabled"
                                        :tag-key="item.key"
                                        :class="`${prefixCls}-selection-tag`"
                                        @close="handleTagClose"
                                    >
                                        <slot name="tag" :item="item" :index="index">
                                            {{ item.data[props.displayProp] }}
                                        </slot>
                                    </Tag>
                                </template>
                            </TagGroup>
                            <span v-else :class="[`${prefixCls}-selection-placeholder`]">
                                {{ props.placeholder }}
                            </span>
                        </template>
                    </template>
                </div>

                <div v-if="props.suffix" :class="suffixWrapperCls" x-semi-prop="suffix">
                    <component :is="props.suffix" />
                </div>

                <div v-if="showClearBtn" :class="`${prefixCls}-clearbtn`" @click.stop="handleClear">
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
import { ref, computed, watch, onMounted, onUnmounted, nextTick, markRaw, h, useSlots } from 'vue';
import classNames from 'classnames';
import { isEqual } from 'lodash-es';
import { cssClasses, strings } from '@douyinfe/semi-foundation/cascader/constants';
import CascaderFoundation, {
    type CascaderAdapter,
    type BasicCascaderProps,
} from '@douyinfe/semi-foundation/cascader/foundation';
import { calcMergeType } from '@douyinfe/semi-foundation/cascader/util';
import { normalizeKeyList, calcCheckedKeys } from '@douyinfe/semi-foundation/tree/treeUtil';
import type { Position } from '../popover/interface';
import { IconClear, IconChevronDown } from '../icons';
import Popover from '../popover';
import Input from '../input';
import TagInput from '../tagInput';
import { Tag, TagGroup } from '../tag';
import Item from './Item.vue';
import type { CascaderProps, CascaderEmits, Entity, Entities, Data, TriggerRenderProps } from './interface';
import { useFoundation } from '../_utils';

defineOptions({
    name: 'Cascader',
});

const prefixCls = cssClasses.PREFIX;

const props = withDefaults(defineProps<CascaderProps>(), {
    borderless: false,
    leafOnly: false,
    arrowIcon: undefined,
    stopPropagation: true,
    motion: true,
    defaultOpen: false,
    zIndex: 1030,
    showClear: false,
    autoClearSearchValue: true,
    changeOnSelect: false,
    disableStrictly: false,
    autoMergeValue: true,
    multiple: false,
    filterTreeNode: false,
    filterLeafOnly: true,
    showRestTagsPopover: false,
    restTagsPopoverProps: () => ({}),
    separator: '/',
    size: 'default',
    treeNodeFilterProp: 'label',
    displayProp: 'label',
    treeData: () => [],
    showNext: strings.SHOW_NEXT_BY_CLICK,
    autoAdjustOverflow: true,
    searchPosition: strings.SEARCH_POSITION_TRIGGER,
    checkRelation: strings.RELATED,
    position: 'bottom',
    validateStatus: 'default',
    'aria-label': 'Cascader',
});

const emit = defineEmits<CascaderEmits>();

const slots = useSlots();

const triggerRef = ref<HTMLDivElement>();
const inputRef = ref<any>();
const optionsContainerRef = ref<HTMLDivElement>();

const isOpen = ref(props.defaultOpen || false);
const isOpenInternal = ref(props.defaultOpen || false);
const isFocus = ref(false);
const isInput = ref(false);
const isHovering = ref(false);
const rePosKey = ref(0);

const emptyContentMinWidth = ref<number | null>(null);
const dropdownMinWidth = ref<string | number | null>(null);
const disabledKeys = ref<Set<string>>(new Set());
const keyEntities = ref<Entities>({});
const selectedKeys = ref<Set<string>>(new Set());
const activeKeys = ref<Set<string>>(new Set());
const filteredKeys = ref<Set<string>>(new Set());
const inputValue = ref('');
const isSearching = ref(false);
const inputPlaceHolder = ref(props.searchPlaceholder || props.placeholder || '');
const checkedKeys = ref<Set<string>>(new Set());
const halfCheckedKeys = ref<Set<string>>(new Set());
const resolvedCheckedKeys = ref<Set<string>>(new Set());
const loadedKeys = ref<Set<string>>(new Set());
const loadingKeys = ref<Set<string>>(new Set());
const loading = ref(false);
const showInput = ref(false);

const loadingKeysRef = ref<Set<string> | null>(new Set());
const loadedKeysRef = ref<Set<string> | null>(new Set());
const prevProps = ref<Partial<BasicCascaderProps>>({});
const isClickingInDropdown = ref(false);

const mergeType = computed(() => calcMergeType(props.autoMergeValue, props.leafOnly));

const isEmpty = computed(() => {
    return !keyEntities.value || Object.keys(keyEntities.value).length === 0;
});

const searchable = computed(() => {
    return Boolean(props.filterTreeNode) && isSearching.value;
});

const showFilterInput = computed(() => {
    return Boolean(props.filterTreeNode) && props.searchPosition === strings.SEARCH_POSITION_TRIGGER;
});

const renderData = computed(() => {
    return foundation.getRenderData() as Array<Entity | Data>;
});

const realKeys = computed(() => {
    return mergeType.value === strings.NONE_MERGE_TYPE || props.checkRelation === strings.UN_RELATED
        ? checkedKeys.value
        : resolvedCheckedKeys.value;
});

const tagInputValues = computed(() => {
    return Array.from(realKeys.value).map((key) => {
        const entity = keyEntities.value[key];
        return entity ? entity.data[props.displayProp] : key;
    });
});

const tagsForTagGroup = computed(() => {
    return Array.from(realKeys.value)
        .map((key) => keyEntities.value[key])
        .filter(Boolean) as Entity[];
});

const overflowItemCount = computed(() => {
    if (!props.maxTagCount || realKeys.value.size <= props.maxTagCount) {
        return 0;
    }
    return realKeys.value.size - props.maxTagCount;
});

const tagInputCls = computed(() => {
    return classNames(`${prefixCls}-tagInput-wrapper`);
});

const handleItemCheckboxClick = (item: Entity | Data) => {
    if (props.multiple && props.filterTreeNode) {
        isClickingInDropdown.value = true;
        setTimeout(() => {
            isClickingInDropdown.value = false;
        }, 500);
    }

    const preservedInputValue = props.multiple && props.filterTreeNode ? inputValue.value : '';
    const preservedFilteredKeys =
        props.multiple && props.filterTreeNode ? new Set(filteredKeys.value) : new Set<string>();

    const isControlled = props.modelValue !== undefined || props.value !== undefined;

    // 在受控模式下,只计算并 emit 新的 value,不更新内部状态
    // 等待父组件更新 prop 后,watch 会触发 foundation.handleValueChange 来更新内部状态
    if (isControlled && props.multiple) {
        const { key } = item;
        const prevCheckedStatus = checkedKeys.value.has(key);
        const { disableStrictly, max } = props;

        const curCheckedStatus = disableStrictly
            ? (foundation as any).calcCheckedStatus(!prevCheckedStatus, key)
            : !prevCheckedStatus;

        const { checkedKeys: curCheckedKeys, halfCheckedKeys: curHalfCheckedKeys } = disableStrictly
            ? (foundation as any).calcNonDisabledCheckedKeys(key, curCheckedStatus)
            : (foundation as any).calcCheckedKeys(key, curCheckedStatus);

        const mergeTypeValue = mergeType.value;
        const isLeafOnlyMerge = mergeTypeValue === strings.LEAF_ONLY_MERGE_TYPE;
        const isNoneMerge = mergeTypeValue === strings.NONE_MERGE_TYPE;

        const curResolvedCheckedKeys = new Set(
            normalizeKeyList(Array.from(curCheckedKeys), keyEntities.value, isLeafOnlyMerge)
        );

        if (typeof max === 'number') {
            if (!isNoneMerge) {
                if (resolvedCheckedKeys.value.size < curResolvedCheckedKeys.size && curResolvedCheckedKeys.size > max) {
                    const checkedEntities: Entity[] = [];
                    curResolvedCheckedKeys.forEach((itemKey: string) => {
                        const entity = keyEntities.value[itemKey];
                        if (entity) checkedEntities.push(entity);
                    });
                    if (props.onExceed) {
                        props.onExceed(checkedEntities);
                    }
                    return;
                }
            } else {
                if (checkedKeys.value.size < curCheckedKeys.size && curCheckedKeys.size > max) {
                    const checkedEntities: Entity[] = [];
                    curCheckedKeys.forEach((itemKey: string) => {
                        const entity = keyEntities.value[itemKey];
                        if (entity) checkedEntities.push(entity);
                    });
                    if (props.onExceed) {
                        props.onExceed(checkedEntities);
                    }
                    return;
                }
            }
        }

        // 构造 value: 将 resolvedCheckedKeys 转换为路径数组
        const valueToEmit: any[] = [];
        const keysToUse = isNoneMerge ? curCheckedKeys : curResolvedCheckedKeys;
        keysToUse.forEach((checkedKey: string) => {
            const entity = keyEntities.value[checkedKey];
            if (entity) {
                const valuePath = entity.path.map((pathKey: string) => {
                    const pathEntity = keyEntities.value[pathKey];
                    return pathEntity ? pathEntity.data.value : pathKey;
                });
                valueToEmit.push(valuePath);
            }
        });

        emit('update:modelValue', valueToEmit);
        emit('update:value', valueToEmit);
        emit('change', valueToEmit);

        // 在受控模式下,直接 return,不调用 foundation.onItemCheckboxClick
        // 等待父组件更新 prop,然后 watch 会调用 foundation.handleValueChange
        return;
    }

    foundation.onItemCheckboxClick(item);

    if (props.multiple && props.filterTreeNode && preservedInputValue && !inputValue.value) {
        inputValue.value = preservedInputValue;
        if (preservedFilteredKeys.size > 0) {
            filteredKeys.value = preservedFilteredKeys;
            isSearching.value = true;
            nextTick(() => {
                foundation.handleInputChange(preservedInputValue);
            });
        }
    }
};

const displayPath = computed(() => {
    if (selectedKeys.value.size === 0) {
        return [];
    }
    const selectedKey = Array.from(selectedKeys.value)[0];
    const entity = keyEntities.value[selectedKey];
    if (!entity) {
        return [];
    }
    return getItemPropPath(selectedKey, props.displayProp);
});

const displayText = computed(() => {
    // 如果使用插槽，返回空字符串，让插槽处理显示
    if (slots.display) {
        return '';
    }
    if (selectedKeys.value.size === 0) {
        return '';
    }
    const selectedKey = Array.from(selectedKeys.value)[0];
    const entity = keyEntities.value[selectedKey];
    if (!entity) {
        return '';
    }
    const path = displayPath.value;
    if (props.displayRender && typeof props.displayRender === 'function') {
        const rendered = props.displayRender(path, 0);
        // 如果 displayRender 返回 VNode，转换为字符串或返回空
        if (rendered && typeof rendered !== 'string') {
            return '';
        }
        return rendered as unknown as string;
    }
    return path.join(props.separator);
});

const getItemPropPath = (selectedKey: string, prop: string, entities?: Entities) => {
    const entitiesToUse = entities || keyEntities.value;
    const entity = entitiesToUse[selectedKey];
    if (!entity) {
        return [];
    }
    const keyPath = entity.path;
    return keyPath.map((key: string) => {
        const e = entitiesToUse[key];
        return e ? e.data[prop] : '';
    });
};

const useCustomTrigger = computed(() => {
    return typeof props.triggerRender === 'function';
});

const selectionCls = computed(() => {
    if (useCustomTrigger.value) {
        return classNames(props.className);
    }
    return classNames(prefixCls, props.className, {
        [`${prefixCls}-borderless`]: props.borderless,
        [`${prefixCls}-focus`]: isFocus.value || (isOpen.value && !isInput.value),
        [`${prefixCls}-disabled`]: props.disabled,
        [`${prefixCls}-single`]: !props.multiple,
        [`${prefixCls}-filterable`]: Boolean(props.filterTreeNode),
        [`${prefixCls}-error`]: props.validateStatus === 'error',
        [`${prefixCls}-warning`]: props.validateStatus === 'warning',
        [`${prefixCls}-small`]: props.size === 'small',
        [`${prefixCls}-large`]: props.size === 'large',
        [`${prefixCls}-with-prefix`]: props.prefix || props.insetLabel,
        [`${prefixCls}-with-suffix`]: props.suffix,
    });
});

const searchWrapperCls = computed(() => {
    return classNames({
        [`${prefixCls}-search-wrapper`]: true,
        [`${prefixCls}-search-wrapper-${props.size}`]: props.size !== 'default',
    });
});

const selectionTextCls = computed(() => {
    return classNames({
        [`${prefixCls}-selection-placeholder`]: !displayText.value,
        [`${prefixCls}-selection-text-hide`]: showInput.value && inputValue.value,
        [`${prefixCls}-selection-text-inactive`]: showInput.value && !inputValue.value,
    });
});

const prefixWrapperCls = computed(() => {
    return classNames(`${prefixCls}-prefix`, {
        [`${prefixCls}-inset-label`]: props.insetLabel,
    });
});

const suffixWrapperCls = computed(() => {
    return classNames(`${prefixCls}-suffix`);
});

const popoverCls = computed(() => {
    return classNames(props.dropdownClassName, `${prefixCls}-popover`);
});

// 下拉面板样式：确保宽度与输入框保持一致（与 Select 组件保持一致）
const dropdownStyle = computed(() => {
    const style: any = {
        ...props.dropdownStyle,
    };

    // Foundation 层会在打开下拉面板时通过 setEmptyContentMinWidth 设置宽度
    // 如果没有设置宽度，Foundation 会使用 getTriggerWidth() 获取实际宽度
    if (dropdownMinWidth.value) {
        // 确保宽度值是数字时添加 px 单位，字符串则直接使用
        const minWidthValue =
            typeof dropdownMinWidth.value === 'number' ? `${dropdownMinWidth.value}px` : dropdownMinWidth.value;
        style.minWidth = minWidthValue;
    }

    return style;
});

const computedPosition = computed<Position>(() => {
    return (props.position as Position) || 'bottomLeft';
});

const showClearBtn = computed(() => {
    const hasValue = selectedKeys.value.size > 0;
    return props.showClear && (inputValue.value || hasValue) && !props.disabled && (isOpen.value || isHovering.value);
});

const customTriggerRender = computed(() => {
    if (!useCustomTrigger.value) {
        return null;
    }
    let realValue: string | Set<string> | undefined;
    if (props.multiple) {
        const posSet = new Set<string>();
        Array.from(realKeys.value).forEach((key) => {
            const entity = keyEntities.value[key];
            if (entity?.pos) {
                posSet.add(entity.pos);
            }
        });
        realValue = posSet.size > 0 ? posSet : undefined;
    } else {
        const firstKey = Array.from(selectedKeys.value)[0];
        realValue = keyEntities.value[firstKey]?.pos;
    }
    return props.triggerRender!({
        componentProps: props,
        disabled: props.disabled || false,
        value: realValue,
        inputValue: inputValue.value,
        placeholder: inputPlaceHolder.value,
        onSearch: handleInputChange,
        onChange: handleInputChange,
        onClear: handleClear,
        onRemove: handleTagRemoveInTrigger,
    });
});

const adapter: CascaderAdapter = markRaw({
    getState: (key: string) => {
        const stateMap: Record<string, any> = {
            emptyContentMinWidth: emptyContentMinWidth.value,
            isOpen: isOpen.value,
            rePosKey: rePosKey.value,
            keyEntities: keyEntities.value,
            selectedKeys: selectedKeys.value,
            activeKeys: activeKeys.value,
            filteredKeys: filteredKeys.value,
            inputValue: inputValue.value,
            isSearching: isSearching.value,
            inputPlaceHolder: inputPlaceHolder.value,
            isHovering: isHovering.value,
            checkedKeys: checkedKeys.value,
            halfCheckedKeys: halfCheckedKeys.value,
            resolvedCheckedKeys: resolvedCheckedKeys.value,
            loadedKeys: loadedKeys.value,
            loadingKeys: loadingKeys.value,
            loading: loading.value,
            showInput: showInput.value,
            disabledKeys: disabledKeys.value,
        };
        return stateMap[key];
    },
    getStates: () => ({
        emptyContentMinWidth: emptyContentMinWidth.value,
        isOpen: isOpen.value,
        rePosKey: rePosKey.value,
        keyEntities: keyEntities.value,
        selectedKeys: selectedKeys.value,
        activeKeys: activeKeys.value,
        filteredKeys: filteredKeys.value,
        inputValue: inputValue.value,
        isSearching: isSearching.value,
        inputPlaceHolder: inputPlaceHolder.value,
        prevProps: prevProps.value as BasicCascaderProps,
        isHovering: isHovering.value,
        checkedKeys: checkedKeys.value,
        halfCheckedKeys: halfCheckedKeys.value,
        resolvedCheckedKeys: resolvedCheckedKeys.value,
        loadedKeys: loadedKeys.value,
        loadingKeys: loadingKeys.value,
        loading: loading.value,
        showInput: showInput.value,
        disabledKeys: disabledKeys.value,
    }),
    getProp: (key: string) => (props as any)[key],
    getProps: () =>
        ({
            ...props,
            triggerRender: props.triggerRender
                ? (renderProps: any) => props.triggerRender!(renderProps as TriggerRenderProps)
                : undefined,
        }) as any,
    setState: (newState: any, callback?: () => void) => {
        // #region agent log
        const stateKeys = Object.keys(newState).filter((k) => newState[k] !== undefined);
        fetch('http://127.0.0.1:7242/ingest/d92dbb99-53f2-4117-89b1-9cce9a52f626', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                location: 'Cascader.vue:583',
                message: 'setState called',
                data: { stateKeysCount: stateKeys.length, stateKeys },
                timestamp: Date.now(),
                sessionId: 'debug-session',
                runId: 'run1',
                hypothesisId: 'D',
            }),
        }).catch(() => {});
        // #endregion
        if (newState.emptyContentMinWidth !== undefined) emptyContentMinWidth.value = newState.emptyContentMinWidth;
        if (newState.isOpen !== undefined) isOpen.value = newState.isOpen;
        if (newState.rePosKey !== undefined) rePosKey.value = newState.rePosKey;
        if (newState.keyEntities !== undefined) keyEntities.value = newState.keyEntities;
        if (newState.selectedKeys !== undefined) selectedKeys.value = newState.selectedKeys;
        if (newState.activeKeys !== undefined) activeKeys.value = newState.activeKeys;
        if (newState.filteredKeys !== undefined) filteredKeys.value = newState.filteredKeys;
        if (newState.inputValue !== undefined) inputValue.value = newState.inputValue;
        if (newState.isSearching !== undefined) isSearching.value = newState.isSearching;
        if (newState.inputPlaceHolder !== undefined) inputPlaceHolder.value = newState.inputPlaceHolder;
        if (newState.isHovering !== undefined) isHovering.value = newState.isHovering;
        if (newState.checkedKeys !== undefined) {
            console.log('[Cascader] setState updating checkedKeys', {
                old: Array.from(checkedKeys.value),
                new: Array.from(newState.checkedKeys),
            });
            checkedKeys.value = newState.checkedKeys;
        }
        if (newState.halfCheckedKeys !== undefined) halfCheckedKeys.value = newState.halfCheckedKeys;
        if (newState.resolvedCheckedKeys !== undefined) resolvedCheckedKeys.value = newState.resolvedCheckedKeys;
        if (newState.loadedKeys !== undefined) loadedKeys.value = newState.loadedKeys;
        if (newState.loadingKeys !== undefined) loadingKeys.value = newState.loadingKeys;
        if (newState.loading !== undefined) loading.value = newState.loading;
        if (newState.showInput !== undefined) showInput.value = newState.showInput;
        if (newState.disabledKeys !== undefined) disabledKeys.value = newState.disabledKeys;
        if (callback) nextTick(callback);
    },
    getContext: (_key: string) => null,
    getContexts: () => ({}),
    getCache: (_key: string) => null,
    getCaches: () => ({}),
    setCache: (_key: any, _value: any) => {},
    updateInputValue: (value: string) => {
        inputValue.value = value;
    },
    updateInputPlaceHolder: (value: string) => {
        inputPlaceHolder.value = value;
    },
    focusInput: () => {
        if (props.filterTreeNode && !props.multiple) {
            showInput.value = true;
        }
        nextTick(() => {
            if (inputRef.value) {
                if (typeof inputRef.value.focus === 'function') {
                    inputRef.value.focus({ preventScroll: props.preventScroll });
                } else if (inputRef.value.$el && inputRef.value.$el.querySelector) {
                    const inputEl = inputRef.value.$el.querySelector('input');
                    if (inputEl) {
                        inputEl.focus({ preventScroll: props.preventScroll });
                    }
                }
            }
        });
    },
    blurInput: () => {
        if (props.filterTreeNode && !props.multiple) {
            showInput.value = false;
        }
        nextTick(() => {
            if (inputRef.value) {
                if (typeof inputRef.value.blur === 'function') {
                    inputRef.value.blur();
                } else if (inputRef.value.$el && inputRef.value.$el.querySelector) {
                    const inputEl = inputRef.value.$el.querySelector('input');
                    if (inputEl) {
                        inputEl.blur();
                    }
                }
            }
        });
    },
    registerClickOutsideHandler: (cb: (e: any) => void) => {
        const clickOutsideHandler = (e: Event) => {
            const target = e.target as Element;
            const path = e.composedPath && e.composedPath();
            const optionsDom = optionsContainerRef.value;
            const triggerDom = triggerRef.value;
            if (
                optionsDom &&
                !optionsDom.contains(target) &&
                triggerDom &&
                !triggerDom.contains(target) &&
                !(path && (path.includes(triggerDom) || path.includes(optionsDom)))
            ) {
                cb(e);
            }
        };
        document.addEventListener('mousedown', clickOutsideHandler, false);
        return () => {
            document.removeEventListener('mousedown', clickOutsideHandler, false);
        };
    },
    unregisterClickOutsideHandler: () => {},
    rePositionDropdown: () => {
        rePosKey.value = rePosKey.value + 1;
    },
    updateStates: (states: any) => {
        Object.keys(states).forEach((key) => {
            if (key === 'emptyContentMinWidth') emptyContentMinWidth.value = states[key];
            if (key === 'isOpen') isOpen.value = states[key];
            if (key === 'rePosKey') rePosKey.value = states[key];
            if (key === 'keyEntities') keyEntities.value = states[key];
            if (key === 'selectedKeys') selectedKeys.value = states[key];
            if (key === 'activeKeys') {
                if (props.multiple && states[key] instanceof Set) {
                    const newActiveKeys = new Set(activeKeys.value);
                    states[key].forEach((key: string) => newActiveKeys.add(key));
                    activeKeys.value = newActiveKeys;
                } else {
                    activeKeys.value = states[key];
                }
            }
            if (key === 'filteredKeys') filteredKeys.value = states[key];
            if (key === 'inputValue') inputValue.value = states[key];
            if (key === 'isSearching') isSearching.value = states[key];
            if (key === 'inputPlaceHolder') inputPlaceHolder.value = states[key];
            if (key === 'isHovering') isHovering.value = states[key];
            if (key === 'checkedKeys') {
                checkedKeys.value = states[key];
            }
            if (key === 'halfCheckedKeys') {
                halfCheckedKeys.value = states[key];
            }
            if (key === 'resolvedCheckedKeys') {
                resolvedCheckedKeys.value = states[key];
            }
            if (key === 'loadedKeys') loadedKeys.value = states[key];
            if (key === 'loadingKeys') loadingKeys.value = states[key];
            if (key === 'loading') loading.value = states[key];
            if (key === 'showInput') showInput.value = states[key];
            if (key === 'disabledKeys') disabledKeys.value = states[key];
        });
    },
    openMenu: () => {
        isOpen.value = true;
        isOpenInternal.value = true;
    },
    closeMenu: (cb?: () => void) => {
        if (props.multiple && props.filterTreeNode && isClickingInDropdown.value) {
            if (cb) nextTick(cb);
            return;
        }
        isOpen.value = false;
        isOpenInternal.value = false;
        if (cb) nextTick(cb);
    },
    updateSelection: (selectedKeysValue: Set<string>) => {
        selectedKeys.value = selectedKeysValue;
    },
    notifyChange: (value: any) => {
        emit('update:modelValue', value);
        emit('update:value', value);
        emit('change', value);
    },
    notifySelect: (selected: string | number | Array<string | number>) => {
        emit('select', selected);
    },
    notifyOnSearch: (input: string) => {
        emit('search', input);
    },
    notifyFocus: (e: any) => {
        emit('focus', e);
    },
    notifyBlur: (e: any) => {
        emit('blur', e);
    },
    notifyDropdownVisibleChange: (visible: boolean) => {
        emit('dropdownVisibleChange', visible);
    },
    toggleHovering: (bool: boolean) => {
        isHovering.value = bool;
    },
    notifyLoadData: (selectedOpt: any[], callback: (data?: any) => void) => {
        if (props.loadData) {
            props
                .loadData(selectedOpt)
                .then(() => {
                    // In React 18, need setTimeout to ensure treeData update before loading/loadedKeys update
                    setTimeout(() => {
                        callback();
                        loading.value = false;
                    }, 0);
                })
                .catch(() => {
                    loading.value = false;
                });
        } else {
            callback();
        }
    },
    notifyOnLoad: (newLoadedKeys: Set<string>, data: any) => {
        if (props.onLoad) {
            props.onLoad(newLoadedKeys, data);
        }
    },
    notifyListScroll: (e: any, panel: any) => {
        if (props.onListScroll) {
            props.onListScroll(e, panel);
        }
    },
    notifyOnExceed: (data: Entity[]) => {
        if (props.onExceed) {
            props.onExceed(data);
        }
    },
    notifyClear: () => {
        emit('clear');
    },
    toggleInputShow: (show: boolean, cb: () => void) => {
        showInput.value = show;
        nextTick(cb);
    },
    updateFocusState: (focus: boolean) => {
        isFocus.value = focus;
    },
    updateLoadingKeyRefValue: (keys: Set<string>) => {
        loadingKeysRef.value = keys;
    },
    getLoadingKeyRefValue: () => {
        return loadingKeysRef.value || new Set();
    },
    updateLoadedKeyRefValue: (keys: Set<string>) => {
        loadedKeysRef.value = keys;
    },
    getLoadedKeyRefValue: () => {
        return loadedKeysRef.value || new Set();
    },
    setEmptyContentMinWidth: (minWidth: number) => {
        emptyContentMinWidth.value = minWidth;
        // 同时更新 dropdownMinWidth，用于下拉面板宽度同步
        if (minWidth > 0) {
            dropdownMinWidth.value = minWidth;
        }
    },
    getTriggerWidth: () => {
        const el = triggerRef.value;
        return el ? el.getBoundingClientRect().width : 0;
    },
    stopPropagation: () => {},
    persistEvent: () => {},
    updateSearching: (searching: boolean) => {
        isSearching.value = searching;
    },
});

const { foundation } = useFoundation(CascaderFoundation, adapter);

watch(
    isOpen,
    (newValue, oldValue) => {
        if (!newValue && oldValue && props.multiple && props.filterTreeNode) {
            if (isClickingInDropdown.value) {
                isOpen.value = true;
                isOpenInternal.value = true;
                return;
            }
            const activeElement = document.activeElement;
            const optionsDom = optionsContainerRef.value;
            if (activeElement && optionsDom && optionsDom.contains(activeElement as HTMLElement)) {
                isOpen.value = true;
                isOpenInternal.value = true;
            }
        }
    },
    { flush: 'sync' }
);

watch(
    isOpen,
    (newValue) => {
        if (isOpenInternal.value !== newValue) {
            isOpenInternal.value = newValue;
        }
    },
    { flush: 'sync' }
);

const handleTriggerClick = (e: MouseEvent) => {
    foundation.handleClick(e);
};

const handleKeyDown = (e: KeyboardEvent) => {
    foundation.handleKeyDown(e);
};

const handleFocus = (e: FocusEvent) => {
    foundation.focus();
    emit('focus', e);
};

const handleBlur = (e: FocusEvent) => {
    foundation.blur();
    emit('blur', e);
};

const handleMouseEnter = () => {
    foundation.toggleHoverState(true);
};

const handleMouseLeave = () => {
    foundation.toggleHoverState(false);
};

const handleClear = (e: MouseEvent) => {
    e.stopPropagation();
    foundation.handleClear();
    emit('clear');
};

const handleInputChange = (inputValue: string) => {
    foundation.handleInputChange(inputValue);
};

const handlePopoverVisibleUpdate = (visible: boolean) => {
    if (!visible && props.multiple && props.filterTreeNode) {
        if (isClickingInDropdown.value) {
            return;
        }
        const activeElement = document.activeElement;
        const optionsDom = optionsContainerRef.value;
        if (activeElement && optionsDom && optionsDom.contains(activeElement as HTMLElement)) {
            return;
        }
    }
    isOpenInternal.value = visible;
    isOpen.value = visible;
};

const handleDropdownVisibleChange = (visible: boolean) => {
    if (!visible && props.multiple && props.filterTreeNode) {
        if (isClickingInDropdown.value) {
            isOpen.value = true;
            return;
        }
        const activeElement = document.activeElement;
        const optionsDom = optionsContainerRef.value;
        if (activeElement && optionsDom && optionsDom.contains(activeElement as HTMLElement)) {
            isOpen.value = true;
            return;
        }
        setTimeout(() => {
            if (isClickingInDropdown.value && !isOpen.value) {
                isOpen.value = true;
            }
        }, 0);
    }
    if (visible) {
        foundation.open();
        // 当下拉面板打开时，计算并设置下拉面板宽度（与 Select 组件保持一致）
        // Foundation 层会在 open() 时调用 _setEmptyContentMinWidth()，但可能此时 Popover 还未完全渲染
        // 所以我们需要在 Popover 完全渲染后再次确保宽度正确
        if (triggerRef.value) {
            requestAnimationFrame(() => {
                nextTick(() => {
                    const triggerWidth = triggerRef.value?.getBoundingClientRect().width || 0;
                    if (triggerWidth > 0) {
                        dropdownMinWidth.value = triggerWidth;
                    }
                });
            });
        }
    } else {
        foundation.close({} as any);
    }
    emit('dropdownVisibleChange', visible);
};

const handleClickOutside = (e: Event) => {
    if (props.multiple && props.filterTreeNode) {
        const target = e.target as HTMLElement;
        const optionsDom = optionsContainerRef.value;
        const isInsideDropdown = optionsDom && optionsDom.contains(target);
        if (isInsideDropdown) {
            return;
        }
    }
    foundation.close(e as any);
};

const handlePopoverAfterClose = () => {
    foundation.updateSearching(false);
};

const handleItemClick = (e: MouseEvent | KeyboardEvent, item: Entity | Data) => {
    foundation.handleItemClick(e, item);
};

const handleItemHover = (e: MouseEvent, item: Entity) => {
    foundation.handleItemHover(e, item);
};

const handleListScroll = (e: UIEvent, ind: number) => {
    foundation.handleListScroll(e, ind);
};

const renderTagItem = (tagValue: string, index: number, onClose: () => void) => {
    const entity = Object.values(keyEntities.value).find((e) => e.data[props.displayProp] === tagValue);
    if (!entity) {
        return h('span', { key: `empty-${index}` });
    }
    const isDisabled =
        props.disabled || entity.data.disabled || (props.disableStrictly && disabledKeys.value.has(entity.key));
    const tagCls = classNames(`${prefixCls}-selection-tag`, {
        [`${prefixCls}-selection-tag-disabled`]: isDisabled,
    });

    // 优先使用插槽
    if (slots.tag) {
        const slotContent = slots.tag({ item: entity, index });
        // 检查插槽内容是否是 Tag 组件，如果是，直接返回
        // 否则包裹在 Tag 中
        if (slotContent && typeof slotContent === 'object' && 'type' in slotContent) {
            // 如果插槽返回的是 VNode，检查是否是 Tag 组件
            const vnode = slotContent as any;
            if (vnode.type && (vnode.type === Tag || vnode.type.name === 'Tag' || vnode.type.__name === 'Tag')) {
                // 插槽返回的是 Tag 组件，直接返回，但需要添加关闭处理
                const originalOnClose = vnode.props?.onClose;
                return h(
                    vnode.type,
                    {
                        ...vnode.props,
                        key: vnode.key || `tag-${entity.key}-${index}`,
                        tagKey: entity.key,
                        closable: true,
                        disabled: isDisabled,
                        onClose: (e: MouseEvent) => {
                            if (e && typeof e.preventDefault === 'function') {
                                e.preventDefault();
                            }
                            if (e && typeof e.stopPropagation === 'function') {
                                e.stopPropagation();
                            }
                            foundation.handleTagRemoveByKey(entity.key);
                            if (originalOnClose && typeof originalOnClose === 'function') {
                                originalOnClose(e);
                            }
                            onClose();
                        },
                    },
                    vnode.children
                );
            }
        }
        // 插槽返回的是内容，包裹在 Tag 中
        return h(
            Tag,
            {
                size: props.size === 'default' ? 'large' : props.size,
                key: `tag-${entity.key}-${index}`,
                color: 'white',
                tagKey: entity.key,
                className: tagCls,
                closable: true,
                disabled: isDisabled,
                onClose: (e: MouseEvent) => {
                    if (e && typeof e.preventDefault === 'function') {
                        e.preventDefault();
                    }
                    if (e && typeof e.stopPropagation === 'function') {
                        e.stopPropagation();
                    }
                    foundation.handleTagRemoveByKey(entity.key);
                    onClose();
                },
            },
            () => slotContent
        );
    }

    // 其次使用 displayRender prop
    if (props.displayRender && typeof props.displayRender === 'function') {
        const rendered = props.displayRender(entity, index);
        return rendered || h('span', { key: `rendered-${entity.key}-${index}` });
    }

    // 默认显示
    return h(
        Tag,
        {
            size: props.size === 'default' ? 'large' : props.size,
            key: `tag-${entity.key}-${index}`,
            color: 'white',
            tagKey: entity.key,
            className: tagCls,
            closable: true,
            disabled: isDisabled,
            onClose: (e: MouseEvent) => {
                if (e && typeof e.preventDefault === 'function') {
                    e.preventDefault();
                }
                if (e && typeof e.stopPropagation === 'function') {
                    e.stopPropagation();
                }
                foundation.handleTagRemoveByKey(entity.key);
                onClose();
            },
        },
        () => entity.data[props.displayProp]
    );
};

const handleTagClose = (...args: any[]) => {
    const e = args[1] as MouseEvent;
    const tagKey = args[2] as string;
    const item = tagKey ? Object.values(keyEntities.value).find((entity) => entity.key === tagKey) : undefined;

    if (e && typeof e.preventDefault === 'function') {
        e.preventDefault();
    }
    if (e && typeof e.stopPropagation === 'function') {
        e.stopPropagation();
    }
    if (item) {
        foundation.handleTagRemoveByKey(item.key);
    }
};

const handleTagRemove = (value: string) => {
    const entity = Object.values(keyEntities.value).find((e) => e.data[props.displayProp] === value);
    if (entity) {
        foundation.handleTagRemoveByKey(entity.key);
    }
};

const handleInputKeyDown = (e: KeyboardEvent) => {
    foundation.handleKeyDown(e);
};

const handleDropdownMouseDown = (_e?: MouseEvent) => {
    if (props.multiple && props.filterTreeNode) {
        isClickingInDropdown.value = true;
        setTimeout(() => {
            isClickingInDropdown.value = false;
        }, 500);
        setTimeout(() => {
            isClickingInDropdown.value = false;
        }, 500);
    }
};

const handleMouseDownInDropdown = () => {
    handleDropdownMouseDown();
};

const handleInputBlur = (e: FocusEvent) => {
    if (props.multiple && props.filterTreeNode && isOpen.value) {
        if (isClickingInDropdown.value) {
            e.preventDefault?.();
            e.stopPropagation?.();
            requestAnimationFrame(() => {
                if (isOpen.value && inputRef.value) {
                    if (typeof inputRef.value.focus === 'function') {
                        inputRef.value.focus();
                    } else if (inputRef.value.$el && inputRef.value.$el.querySelector) {
                        const inputEl = inputRef.value.$el.querySelector('input');
                        if (inputEl) {
                            inputEl.focus();
                        }
                    }
                }
            });
            return;
        }
        setTimeout(() => {
            if (isClickingInDropdown.value) {
                if (isOpen.value && inputRef.value) {
                    if (typeof inputRef.value.focus === 'function') {
                        inputRef.value.focus();
                    } else if (inputRef.value.$el && inputRef.value.$el.querySelector) {
                        const inputEl = inputRef.value.$el.querySelector('input');
                        if (inputEl) {
                            inputEl.focus();
                        }
                    }
                }
                return;
            }
            const relatedTarget = (e.relatedTarget as HTMLElement) || document.activeElement;
            const optionsDom = optionsContainerRef.value;
            const isFocusMovingToDropdown = relatedTarget && optionsDom && optionsDom.contains(relatedTarget);
            if (isFocusMovingToDropdown) {
                if (isOpen.value && inputRef.value) {
                    if (typeof inputRef.value.focus === 'function') {
                        inputRef.value.focus();
                    } else if (inputRef.value.$el && inputRef.value.$el.querySelector) {
                        const inputEl = inputRef.value.$el.querySelector('input');
                        if (inputEl) {
                            inputEl.focus();
                        }
                    }
                }
                return;
            }
            foundation.blur();
        }, 0);
    } else {
        foundation.blur();
    }
};

const handleInputFocus = (_e: FocusEvent) => {
    foundation.focus();
};

const search = (value: string) => {
    handleInputChange(value);
};

const close = () => {
    foundation.close({} as any);
};

const open = () => {
    foundation.open();
};

const focus = () => {
    foundation.focus();
};

const blur = () => {
    foundation.blur();
};

const handleTagRemoveInTrigger = (pos: string) => {
    foundation.handleTagRemoveInTrigger(pos);
};

defineExpose({
    search,
    close,
    open,
    focus,
    blur,
    handleTagRemoveInTrigger,
});

onMounted(() => {
    prevProps.value = props as unknown as BasicCascaderProps;
    foundation.init();
    // 处理初始值：优先使用 modelValue，其次 value，最后 defaultValue
    if (props.modelValue !== undefined) {
        nextTick(() => {
            foundation.handleValueChange(props.modelValue);
            syncValueToCheckedKeys(props.modelValue as any[]);
        });
    } else if (props.value !== undefined) {
        nextTick(() => {
            foundation.handleValueChange(props.value);
            syncValueToCheckedKeys(props.value as any[]);
        });
    } else if (props.defaultValue !== undefined) {
        nextTick(() => {
            foundation.handleValueChange(props.defaultValue);
        });
    }
});

onUnmounted(() => {
    foundation?.destroy();
});

const syncValueToCheckedKeys = (value: any[]) => {
    if (props.multiple && Array.isArray(value)) {
        const newCheckedKeys = new Set<string>();
        const newHalfCheckedKeys = new Set<string>();

        // 将 value 路径转换为 keys
        value.forEach((valuePath: any) => {
            if (Array.isArray(valuePath)) {
                // 找到对应的 entity
                let currentEntities = Object.values(keyEntities.value).filter((e) => !e.parent);
                for (let i = 0; i < valuePath.length; i++) {
                    const value = valuePath[i];
                    const entity = currentEntities.find((e) => e.data.value === value);
                    if (entity) {
                        if (i === valuePath.length - 1) {
                            // 最后一个节点,添加到 checkedKeys
                            newCheckedKeys.add(entity.key);
                        }
                        // 准备下一层
                        if (entity.children) {
                            currentEntities = entity.children;
                        }
                    }
                }
            }
        });

        // 计算完整的 checkedKeys 和 halfCheckedKeys
        const result = calcCheckedKeys(Array.from(newCheckedKeys), keyEntities.value);

        checkedKeys.value = result.checkedKeys;
        halfCheckedKeys.value = result.halfCheckedKeys;

        const isLeafOnlyMerge = mergeType.value === strings.LEAF_ONLY_MERGE_TYPE;
        resolvedCheckedKeys.value = new Set(
            normalizeKeyList(Array.from(result.checkedKeys), keyEntities.value, isLeafOnlyMerge)
        );
    }
};

watch(
    () => props.modelValue,
    (newValue, oldValue) => {
        if (newValue !== undefined) {
            foundation.handleValueChange(newValue);

            // 在多选模式下,手动更新 checkedKeys 以确保 UI 同步
            if (props.multiple && Array.isArray(newValue)) {
                nextTick(() => {
                    syncValueToCheckedKeys(newValue);
                });
            }
        }
    },
    { deep: true }
);

watch(
    () => props.value,
    (newValue) => {
        if (newValue !== undefined) {
            foundation.handleValueChange(newValue);
        }
    },
    { deep: true }
);

watch(
    () => props.treeData,
    () => {
        foundation.collectOptions(false);
    },
    { deep: true }
);

watch(
    () => props.defaultValue,
    (newValue) => {
        if (newValue !== undefined && props.modelValue === undefined && props.value === undefined) {
            foundation.handleValueChange(newValue);
        }
    },
    { deep: true }
);

watch(
    () => props.searchPlaceholder,
    (newValue) => {
        if (newValue !== undefined) {
            inputPlaceHolder.value = newValue || props.placeholder || '';
        }
    }
);

watch(
    () => props.placeholder,
    (newValue) => {
        if (newValue !== undefined && !props.searchPlaceholder) {
            inputPlaceHolder.value = newValue || '';
        }
    }
);

// 优化：移除深度监听整个 props 对象，改为在组件挂载时初始化 prevProps
// Foundation 层定义了 prevProps 但实际上并未使用，因此可以简化
// 如果未来需要 prevProps，可以在具体的 watch 中按需更新
onMounted(() => {
    prevProps.value = props as unknown as BasicCascaderProps;
});

watch(
    () => [props.treeData, props.value, props.multiple],
    ([newTreeData, newValue, newMultiple], [oldTreeData, oldValue]) => {
        if (newMultiple) {
            return;
        }
        let isOptionsChanged = false;
        if (!isEqual(oldTreeData, newTreeData)) {
            isOptionsChanged = true;
            foundation.collectOptions();
        }
        if (oldValue !== newValue && !isOptionsChanged && newValue !== undefined) {
            foundation.handleValueChange(newValue as any);
        }
    },
    { deep: true }
);
</script>
