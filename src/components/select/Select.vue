<template>
    <Popover
        v-model:visible="isOpen"
        trigger="custom"
        :position="props.position || 'bottomLeft'"
        :z-index="props.zIndex"
        :get-popup-container="props.getPopupContainer"
        :motion="props.motion"
        :auto-adjust-overflow="props.autoAdjustOverflow"
        :spacing="props.spacing"
        :margin="props.dropdownMargin"
        :stop-propagation="props.stopPropagation"
        :mouse-enter-delay="props.mouseEnterDelay"
        :mouse-leave-delay="props.mouseLeaveDelay"
        :after-close="handlePopoverAfterClose"
        :wrapper-class-name="`${prefixCls}-dropdown`"
        :disable-focus-listener="true"
        @visible-change="handleDropdownVisibleChange"
        @click-out-side="handleClickOutside"
    >
        <template #content>
            <div
                ref="optionsContainerRef"
                :class="optionListWrapperCls"
                :style="optionListWrapperStyle"
                @keydown="handleKeyDown"
            >
                <div v-if="slots.outerTopSlot" :class="`${prefixCls}-option-list-outer-top-slot`">
                    <slot name="outerTopSlot" />
                </div>

                <div
                    v-if="props.filter && props.searchPosition === 'dropdown'"
                    :class="`${prefixCls}-dropdown-search-wrapper`"
                >
                    <Input
                        ref="dropdownInputRef"
                        :value="inputValue"
                        :class="dropdownInputCls"
                        :placeholder="props.searchPlaceholder || '搜索'"
                        show-clear
                        @input="handleSearchInput"
                        @key-down="handleKeyDown"
                    >
                        <template #prefix>
                            <IconSearch />
                        </template>
                    </Input>
                </div>

                <div
                    ref="optionsRef"
                    :class="optionListCls"
                    :style="optionListStyle"
                    role="listbox"
                    :aria-multiselectable="props.multiple"
                    @scroll="handleListScroll"
                >
                    <div v-if="slots.innerTopSlot" :class="`${prefixCls}-option-list-inner-top-slot`">
                        <slot name="innerTopSlot" />
                    </div>

                    <Spin v-if="props.loading" />

                    <template v-else-if="props.virtualize && visibleOptions.length > 0">
                        <div
                            ref="virtualContainerRef"
                            :style="{
                                height: `${virtualHeight}px`,
                                width: virtualWidth,
                                overflow: 'auto',
                                position: 'relative',
                            }"
                            @scroll="handleVirtualScroll"
                        >
                            <div :style="{ height: `${totalHeight}px`, position: 'relative' }">
                                <div :style="{ transform: `translateY(${offsetY}px)` }">
                                    <template
                                        v-for="index in virtualVisibleIndices"
                                        :key="visibleOptions[index]?.value || index"
                                    >
                                        <!-- @ts-ignore - _inputCreateOnly is added by foundation layer -->
                                        <template
                                            v-if="
                                                visibleOptions[index] && (visibleOptions[index] as any)._inputCreateOnly
                                            "
                                        >
                                            <Option
                                                v-if="!props.renderCreateItem"
                                                :value="visibleOptions[index].value"
                                                :label="visibleOptions[index].label"
                                                :disabled="visibleOptions[index].disabled"
                                                :selected="visibleOptions[index]._selected"
                                                :focused="hasUserInteracted && focusIndex === index"
                                                show-tick
                                                :class-name="visibleOptions[index].className"
                                                :style="{
                                                    height: `${virtualItemSize}px`,
                                                    ...visibleOptions[index].style,
                                                }"
                                                @select="handleSelect"
                                                @mouseenter="() => handleOptionMouseEnter(index)"
                                            >
                                                <span :class="`${prefixCls}-create-tips`">创建</span>
                                                {{ visibleOptions[index].value }}
                                            </Option>

                                            <div
                                                v-else
                                                role="button"
                                                aria-label="Use the input box to create an optional item"
                                                :style="{ height: `${virtualItemSize}px` }"
                                                @click="(e) => handleSelect(visibleOptions[index], e)"
                                            >
                                                <component
                                                    :is="
                                                        props.renderCreateItem(
                                                            visibleOptions[index].value,
                                                            hasUserInteracted && focusIndex === index,
                                                            visibleOptions[index].style
                                                        )
                                                    "
                                                />
                                            </div>
                                        </template>

                                        <Option
                                            v-else-if="visibleOptions[index]"
                                            :value="visibleOptions[index].value"
                                            :label="visibleOptions[index].label"
                                            :disabled="visibleOptions[index].disabled"
                                            :children="visibleOptions[index].children"
                                            :selected="visibleOptions[index]._selected"
                                            :focused="hasUserInteracted && focusIndex === index"
                                            show-tick
                                            :render-option-item="props.renderOptionItem"
                                            :input-value="inputValue"
                                            :class-name="visibleOptions[index].className"
                                            :style="{
                                                height: `${virtualItemSize}px`,
                                                ...visibleOptions[index].style,
                                            }"
                                            @select="handleSelect"
                                            @mouseenter="() => handleOptionMouseEnter(index)"
                                        />
                                    </template>
                                </div>
                            </div>
                        </div>
                    </template>

                    <template v-else-if="optionsWithGroupLabels.length > 0">
                        <template
                            v-for="(item, index) in optionsWithGroupLabels"
                            :key="item.option._keyInJsx || item.option.value"
                        >
                            <OptionGroup
                                v-if="item.showGroupLabel && item.groupLabel"
                                :key="getGroupKey(item.groupLabel)"
                                :label="item.groupLabel.label"
                                :class-name="item.groupLabel.className"
                                :style="item.groupLabel.style"
                            />

                            <!-- @ts-ignore - _inputCreateOnly is added by foundation layer -->
                            <template v-if="(item.option as any)._inputCreateOnly">
                                <Option
                                    v-if="!props.renderCreateItem"
                                    :value="item.option.value"
                                    :label="item.option.label"
                                    :disabled="item.option.disabled"
                                    :selected="item.option._selected"
                                    :focused="hasUserInteracted && focusIndex === index"
                                    show-tick
                                    :class-name="item.option.className"
                                    :style="item.option.style"
                                    @select="handleSelect"
                                    @mouseenter="() => handleOptionMouseEnter(index)"
                                >
                                    <span :class="`${prefixCls}-create-tips`">创建</span>
                                    {{ item.option.value }}
                                </Option>

                                <div
                                    v-else
                                    role="button"
                                    aria-label="Use the input box to create an optional item"
                                    @click="(e) => handleSelect(item.option, e)"
                                >
                                    <component
                                        :is="
                                            props.renderCreateItem(
                                                item.option.value,
                                                hasUserInteracted && focusIndex === index,
                                                item.option.style
                                            )
                                        "
                                    />
                                </div>
                            </template>

                            <Option
                                v-else
                                :value="item.option.value"
                                :label="item.option.label"
                                :disabled="item.option.disabled"
                                :children="item.option.children"
                                :selected="item.option._selected"
                                :focused="hasUserInteracted && focusIndex === index"
                                show-tick
                                :render-option-item="props.renderOptionItem"
                                :input-value="inputValue"
                                :class-name="item.option.className"
                                :style="item.option.style"
                                @select="handleSelect"
                                @mouseenter="() => handleOptionMouseEnter(index)"
                            />
                        </template>
                    </template>

                    <Option v-else empty :empty-content="props.emptyContent" />

                    <div v-if="slots.innerBottomSlot" :class="`${prefixCls}-option-list-inner-bottom-slot`">
                        <slot name="innerBottomSlot" />
                    </div>
                </div>

                <div v-if="slots.outerBottomSlot" :class="`${prefixCls}-option-list-outer-bottom-slot`">
                    <slot name="outerBottomSlot" />
                </div>
            </div>
        </template>

        <div
            :id="props.id"
            ref="triggerRef"
            :name="props.name"
            :class="selectionCls"
            :style="props.style"
            tabindex="0"
            :aria-label="($attrs['aria-label'] as string) || undefined"
            :aria-labelledby="props['aria-labelledby']"
            :aria-describedby="props['aria-describedby']"
            @click="handleTriggerClick"
            @keydown="handleKeyDown"
            @focus="handleFocus"
            @blur="handleBlur"
            @mouseenter="handleMouseEnter"
            @mouseleave="handleMouseLeave"
        >
            <template v-if="useCustomTrigger">
                <component :is="customTriggerRender as any" />
            </template>

            <template v-else>
                <div v-if="slots.prefix || props.insetLabel" :id="props.insetLabelId" :class="prefixClasses">
                    <slot v-if="slots.prefix" name="prefix" />
                    <template v-else-if="props.insetLabel">{{ props.insetLabel }}</template>
                </div>

                <div :class="`${prefixCls}-selection`">
                    <div
                        :class="contentWrapperCls"
                        :style="props.ellipsisTrigger ? { width: '100%', minWidth: 0 } : undefined"
                    >
                        <template v-if="!props.multiple">
                            <span :class="singleSelectionTextCls">
                                <template v-if="selectedOptions.length > 0">
                                    <slot v-if="slots.selectedItem" name="selectedItem" :option="selectedOptions[0]" />
                                    <component
                                        :is="(props.renderSelectedItem as any)(selectedOptions[0])"
                                        v-else-if="typeof props.renderSelectedItem === 'function'"
                                    />
                                    <template v-else>
                                        {{ selectedOptions[0].label as any }}
                                    </template>
                                </template>
                                <template v-else>
                                    {{ props.placeholder }}
                                </template>
                            </span>
                            <Input
                                v-if="showFilterInput"
                                ref="inputRef"
                                :value="inputValue"
                                :class="`${prefixCls}-input ${prefixCls}-input-single`"
                                :size="mergedSize"
                                :disabled="props.disabled"
                                borderless
                                @input="handleSearchInput"
                                @key-down="handleKeyDown"
                                @blur="handleInputBlur"
                            />
                        </template>

                        <template v-else>
                            <template
                                v-if="
                                    selectedOptions.length > 0 &&
                                    (!props.maxTagCount || (props.expandRestTagsOnClick && isOpen))
                                "
                            >
                                <template v-for="(option, index) in selectedOptions" :key="option.value">
                                    <component :is="renderMultipleTag(option, index)" />
                                </template>
                            </template>
                            <template v-else-if="selectedOptions.length > 0 && props.ellipsisTrigger">
                                <component :is="renderCollapsedTags(selectedOptions, tagGroupMaxCount)" />
                            </template>
                            <template
                                v-else-if="
                                    selectedOptions.length > 0 &&
                                    props.maxTagCount &&
                                    !(props.expandRestTagsOnClick && isOpen) &&
                                    !props.ellipsisTrigger
                                "
                            >
                                <TagGroup
                                    :max-tag-count="tagGroupMaxCount"
                                    :rest-count="tagGroupRestCount"
                                    :show-popover="props.showRestTagsPopover"
                                    :popover-props="props.restTagsPopoverProps"
                                    size="large"
                                >
                                    <template v-for="(option, index) in tagsForTagGroup" :key="option.value">
                                        <component :is="renderMultipleTag(option, index)" />
                                    </template>
                                </TagGroup>
                            </template>
                            <span
                                v-else-if="!inputValue"
                                :class="[`${prefixCls}-selection-text`, `${prefixCls}-selection-placeholder`]"
                            >
                                {{ props.placeholder }}
                            </span>
                            <Input
                                v-if="showFilterInput"
                                ref="inputRef"
                                :value="inputValue"
                                :class="`${prefixCls}-input ${prefixCls}-input-multiple`"
                                :style="
                                    props.multiple && inputValue
                                        ? { width: `${inputValue.length * 16}px` }
                                        : props.multiple && props.allowCreate && !inputValue
                                          ? { width: '100px' }
                                          : { width: '2px' }
                                "
                                :size="mergedSize"
                                :disabled="props.disabled"
                                borderless
                                @input="handleSearchInput"
                                @key-down="handleKeyDown"
                                @focus="handleInputFocus"
                                @blur="handleInputBlur"
                            />
                        </template>
                    </div>
                </div>

                <div v-if="slots.suffix || shouldShowClear || props.showArrow" :class="`${prefixCls}-suffix`">
                    <slot v-if="slots.suffix" name="suffix" />
                    <IconClear v-if="shouldShowClear" :class="`${prefixCls}-clear`" @click.stop="handleClear" />
                    <div
                        v-else-if="props.showArrow"
                        :class="[`${prefixCls}-arrow`, { [`${prefixCls}-arrow-open`]: isOpen }]"
                    >
                        <component :is="props.arrowIcon" />
                    </div>
                </div>
            </template>
        </div>
        <!-- 隐藏组件，用于在 render 函数内收集 slot children -->
        <SlotCollector v-if="!props.optionList || props.optionList.length === 0" @collect="handleSlotCollect">
            <slot></slot>
        </SlotCollector>
    </Popover>
</template>

<script setup lang="ts">
import {
    ref,
    computed,
    watch,
    onMounted,
    onUnmounted,
    onUpdated,
    nextTick,
    useSlots,
    Fragment,
    h,
    defineComponent,
} from 'vue';
import classNames from 'classnames';
import { cssClasses, numbers } from '@douyinfe/semi-foundation/select/constants';
import SelectFoundation, { type SelectAdapter } from '@douyinfe/semi-foundation/select/foundation';
import EventManager from '@douyinfe/semi-foundation/utils/Event';
import { IconClear, IconChevronDown, IconSearch } from '../icons';
import Popover from '../popover';
import Input from '../input';
import Tag from '../tag';
import { TagGroup } from '../tag';
import Spin from '../spin';
import OverflowList from '../overflowList/OverflowList.vue';
import Space from '../space';
import Option from './Option.vue';
import OptionGroup from './OptionGroup.vue';
import { getOptionsFromGroup } from './utils';
import { useInputGroup } from '../input/context';
import type { SelectProps, SelectEmits, OptionProps, OptionGroupProps, SelectValue } from './interface';
import type { VNode } from 'vue';

const prefixCls = cssClasses.PREFIX;

const modelValue = defineModel<SelectValue>();

const props = withDefaults(defineProps<SelectProps>(), {
    stopPropagation: true,
    motion: true,
    borderless: false,
    zIndex: 1030,
    filter: false,
    multiple: false,
    disabled: false,
    defaultOpen: false,
    allowCreate: false,
    placeholder: '',
    onChangeWithObject: false,
    maxHeight: numbers.LIST_HEIGHT,
    dropdownMatchSelectWidth: true,
    defaultActiveFirstOption: true,
    showArrow: true,
    showClear: false,
    searchPosition: 'trigger',
    remote: false,
    autoAdjustOverflow: true,
    autoClearSearchValue: true,
    showRestTagsPopover: false,
    expandRestTagsOnClick: false,
    ellipsisTrigger: false,
    arrowIcon: () => IconChevronDown as any,
});

// 定义一个辅助组件，在 render 函数内收集 slot children
/**
 * SlotCollector 组件
 * 用于在 Vue 中收集 slot 内容。
 * 由于 Vue 的 slot机制与 React 不同，无法直接在 setup 中获取 slot 的 children 并进行处理，
 * 因此需要通过渲染一个隐藏的组件来收集 Option/OptionGroup 等子组件的信息。
 */
const SlotCollector = defineComponent({
    name: 'SlotCollector',
    emits: ['collect'],
    setup(_, { slots, emit }) {
        return () => {
            const children = slots.default?.() || [];
            emit('collect', children);
            return null;
        };
    },
});

const emit = defineEmits<SelectEmits>();
const slots = useSlots();

const inputGroupContext = useInputGroup();

const mergedSize = computed(() => {
    if (inputGroupContext.inputGroup?.size) {
        return inputGroupContext.inputGroup.size;
    }
    return props.size || 'default';
});

const slotChildren = ref<any[]>([]);

const handleSlotCollect = (children: any[]) => {
    slotChildren.value = children;
};

const triggerRef = ref<HTMLDivElement>();
const inputRef = ref<InstanceType<typeof Input>>();
const dropdownInputRef = ref<InstanceType<typeof Input>>();
const optionsContainerRef = ref<HTMLDivElement>();
const optionsRef = ref<HTMLDivElement>();
const virtualContainerRef = ref<HTMLDivElement>();

const isOpen = ref(props.defaultOpen || false);
const isFocus = ref(false);
const options = ref<OptionProps[]>([]);
const selections = ref(new Map());
const dropdownMinWidth = ref<string | number | null>(null);
const inputValue = ref('');
const focusIndex = ref(props.defaultActiveFirstOption ? 0 : -1);
const hasUserInteracted = ref(false);
const isHovering = ref(false);
const showInput = ref(false);
const isFullTags = ref(false);
const overflowItemCount = ref(0);

const virtualScrollTop = ref(0);

const eventManager = new EventManager();
const keyboardEventHandler = ref<((event: KeyboardEvent) => void) | null>(null);

// 计算有效值：优先级 modelValue > props.value > defaultValue
const effectiveValue = computed(() => {
    if (modelValue.value !== undefined) {
        return modelValue.value;
    }
    if (props.value !== undefined) {
        return props.value;
    }
    return props.defaultValue;
});

/**
 * SelectAdapter
 * 连接 Semi Foundation 核心逻辑与 Vue 组件的适配器。
 * 负责将 Foundation 的状态更新同步到 Vue 的响应式数据，
 * 并将 Vue 的事件转发给 Foundation。
 */
const adapter: SelectAdapter = {
    getState: (key: string) => {
        const stateMap = {
            isOpen: isOpen.value,
            isFocus: isFocus.value,
            options: options.value,
            selections: selections.value,
            dropdownMinWidth: dropdownMinWidth.value,
            inputValue: inputValue.value,
            focusIndex: focusIndex.value,
            isHovering: isHovering.value,
            showInput: showInput.value,
            isFullTags: isFullTags.value,
            overflowItemCount: overflowItemCount.value,
        };
        return stateMap[key];
    },
    getStates: () => ({
        isOpen: isOpen.value,
        isFocus: isFocus.value,
        options: options.value,
        selections: selections.value,
        dropdownMinWidth: dropdownMinWidth.value,
        inputValue: inputValue.value,
        focusIndex: focusIndex.value,
        isHovering: isHovering.value,
        showInput: showInput.value,
        isFullTags: isFullTags.value,
        overflowItemCount: overflowItemCount.value,
    }),
    getProp: (key: string) => {
        if (key === 'value') {
            return effectiveValue.value;
        }
        return props[key];
    },
    getProps: () => props,
    setState: (newState: any, callback?: () => void) => {
        if (newState.isOpen !== undefined) isOpen.value = newState.isOpen;
        if (newState.isFocus !== undefined) isFocus.value = newState.isFocus;
        if (newState.options !== undefined) options.value = newState.options;
        if (newState.selections !== undefined) selections.value = newState.selections;
        if (newState.inputValue !== undefined) inputValue.value = newState.inputValue;
        if (newState.focusIndex !== undefined) focusIndex.value = newState.focusIndex;
        if (newState.isHovering !== undefined) isHovering.value = newState.isHovering;
        if (newState.showInput !== undefined) showInput.value = newState.showInput;
        if (newState.isFullTags !== undefined) isFullTags.value = newState.isFullTags;
        if (newState.overflowItemCount !== undefined) overflowItemCount.value = newState.overflowItemCount;
        if (callback) nextTick(callback);
    },
    getContext: (_key: string) => null,
    getContexts: () => ({}),
    getCache: (_key: string) => null,
    getCaches: () => ({}),
    setCache: (_key: any, _value: any) => {},

    registerKeyDown: (handler: (event: KeyboardEvent) => void) => {
        keyboardEventHandler.value = handler;
    },
    unregisterKeyDown: () => {
        keyboardEventHandler.value = null;
    },
    updateFocusIndex: (index: number) => {
        hasUserInteracted.value = true;
        focusIndex.value = index;
    },

    updateInputValue: (value: string) => {
        inputValue.value = value;
    },
    toggleInputShow: (show: boolean, cb: () => void) => {
        showInput.value = show;
        nextTick(() => cb());
    },
    focusInput: () => {
        nextTick(() => {
            if (inputRef.value && typeof (inputRef.value as any).focus === 'function') {
                (inputRef.value as any).focus();
            }
        });
    },
    focusDropdownInput: () => {
        nextTick(() => {
            if (dropdownInputRef.value && typeof (dropdownInputRef.value as any).focus === 'function') {
                (dropdownInputRef.value as any).focus();
            }
        });
    },

    notifyMaxLimit: (option: OptionProps) => {
        emit('exceed', option);
    },
    getMaxLimit: () => props.max,
    registerClickOutsideHandler: () => {},
    unregisterClickOutsideHandler: () => {},
    rePositionDropdown: () => {},
    notifyDeselect: (value, option) => {
        delete option._parentGroup;
        emit('deselect', value, option);
    },

    getOptionsFromChildren: () => {
        const children = slotChildren.value;
        const { optionList } = props;

        if (optionList && optionList.length) {
            return optionList.map((itemOpt, index) => ({
                _show: true,
                _selected: false,
                _scrollIndex: index,
                ...itemOpt,
            }));
        } else {
            const result = getOptionsFromGroup(children);
            return result.options;
        }
    },
    updateOptions: (opts: OptionProps[]) => {
        // 性能优化：只在 options 真正变化时才更新，避免不必要的重新渲染
        // Foundation 层每次都会创建新数组，所以需要比较内容而不是引用
        if (options.value.length === opts.length) {
            // 如果长度相同，比较选项的关键属性（value、label、_show、_selected）
            let isEqual = true;
            for (let i = 0; i < opts.length; i++) {
                const current = options.value[i];
                const next = opts[i];
                // 比较选项对象引用（如果相同则跳过）
                if (current === next) {
                    continue;
                }
                // 比较关键属性
                if (
                    current?.value !== next?.value ||
                    current?.label !== next?.label ||
                    current?._show !== next?._show ||
                    current?._selected !== next?._selected
                ) {
                    isEqual = false;
                    break;
                }
            }
            if (isEqual) {
                return;
            }
        }
        options.value = opts;
    },
    openMenu: (cb?: () => void) => {
        isOpen.value = true;
        nextTick(() => {
            // 确保在 Popover 渲染后再执行回调
            requestAnimationFrame(() => {
                cb?.();
            });
        });
    },
    closeMenu: (cb?: () => void) => {
        isOpen.value = false;
        if (cb) {
            nextTick(() => cb());
        }
    },
    getTriggerWidth: () => {
        return triggerRef.value?.getBoundingClientRect().width || 0;
    },
    setOptionWrapperWidth: (width: number | string) => {
        // Foundation 层设置的宽度可能是数字（px）或字符串
        // 确保统一处理
        if (typeof width === 'number' && width > 0) {
            dropdownMinWidth.value = width;
        } else if (typeof width === 'string') {
            // 如果是字符串，尝试转换为数字（px 值）
            const numValue = parseFloat(width);
            if (!isNaN(numValue) && numValue > 0) {
                dropdownMinWidth.value = numValue;
            } else {
                dropdownMinWidth.value = width;
            }
        }
        // 如果 Foundation 设置的宽度为 0 或无效，在 Popover 渲染后重新计算
        if ((typeof width === 'number' && width === 0) || !width) {
            requestAnimationFrame(() => {
                nextTick(() => {
                    if (triggerRef.value && props.dropdownMatchSelectWidth) {
                        const triggerWidth = triggerRef.value.getBoundingClientRect().width || 0;
                        if (triggerWidth > 0) {
                            dropdownMinWidth.value = triggerWidth;
                        }
                    }
                });
            });
        }
    },
    updateSelection: (sels: Map<any, any>) => {
        selections.value = new Map(sels);
    },
    getSelections: () => new Map(selections.value),
    updateFocusState: (focus: boolean) => {
        isFocus.value = focus;
    },
    focusTrigger: () => {
        triggerRef.value?.focus();
    },

    notifyChange: (value) => {
        modelValue.value = value;
        emit('update:value', value);
        emit('change', value);
    },
    notifySelect: (value, option) => {
        delete option._parentGroup;
        emit('select', value, option);
    },
    notifyDropdownVisibleChange: (visible) => {
        emit('dropdownVisibleChange', visible);
    },
    notifySearch: (input, event) => {
        emit('search', input, event as any);
    },
    notifyCreate: (option) => {
        (emit as any)('create', option);
    },
    notifyMouseEnter: (e) => {
        emit('mouseEnter', e as any);
    },
    notifyMouseLeave: (e) => {
        emit('mouseLeave', e as any);
    },
    notifyClear: () => {
        emit('clear');
    },
    notifyFocus: (e) => {
        emit('focus', e as any);
    },
    notifyBlur: (e) => {
        emit('blur', e as any);
    },
    notifyListScroll: (e) => {
        emit('listScroll', e as any);
    },
    updateHovering: (hovering) => {
        isHovering.value = hovering;
    },
    updateScrollTop: (index?: number) => {
        let optionClassName;
        if ('renderOptionItem' in props) {
            optionClassName = `.${prefixCls}-option-custom-selected`;
            if (index !== undefined) {
                optionClassName = `.${prefixCls}-option-custom:nth-child(${index + 1})`;
            }
        } else {
            optionClassName = `.${prefixCls}-option-selected`;
            if (index !== undefined) {
                optionClassName = `.${prefixCls}-option:nth-child(${index + 1})`;
            }
        }

        const optionsContainer = optionsRef.value;
        if (!optionsContainer) return;

        const destNode = optionsContainer.querySelector(optionClassName) as HTMLDivElement;
        if (destNode) {
            /**
             * Scroll the first selected item into view.
             * The reason why ScrollIntoView is not used here is that it may cause page to move.
             */
            const destParent = destNode.parentNode as HTMLDivElement;
            if (destParent) {
                destParent.scrollTop =
                    destNode.offsetTop - destParent.offsetTop - destParent.clientHeight / 2 + destNode.clientHeight / 2;
            }
        }
    },
    updateOverflowItemCount: (count: number) => {
        overflowItemCount.value = count;
    },
    getContainer: () => optionsRef.value,
    getFocusableElements: (node: HTMLElement) => {
        if (!node) return [];

        const focusableSelectors = [
            'a[href]',
            'area[href]',
            'input:not([disabled]):not([type="hidden"])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            'button:not([disabled])',
            'iframe',
            'object',
            'embed',
            '[contenteditable]',
            '[tabindex]:not([tabindex^="-"])',
        ].join(',');

        return Array.from(node.querySelectorAll(focusableSelectors));
    },
    getActiveElement: () => document.activeElement,
    setIsFocusInContainer: (isFocusInContainer: boolean) => {
        isFocus.value = isFocusInContainer;
    },
    getIsFocusInContainer: () => {
        return isFocus.value;
    },
    on: (eventName, eventCallback) => {
        eventManager.on(eventName, eventCallback);
    },
    off: (eventName) => {
        eventManager.off(eventName);
    },
    emit: (eventName) => {
        eventManager.emit(eventName);
    },
    once: (eventName, eventCallback) => {
        eventManager.once(eventName, eventCallback);
    },

    stopPropagation: () => {},
    persistEvent: () => {},
};

const foundation = new SelectFoundation(adapter);

const isInitialized = ref(false);

onMounted(() => {
    // 如果有 optionList，直接初始化
    if (props.optionList && props.optionList.length > 0) {
        foundation.init();
        isInitialized.value = true;
        // 初始化后，如果有默认值，需要应用
        nextTick(() => {
            if (effectiveValue.value !== undefined) {
                foundation?.handleValueChange(effectiveValue.value);
            }
        });
    }
    // 否则等待 SlotCollector 收集完成后再初始化
});

// 当 slot children 收集完成后，初始化 foundation
watch(
    slotChildren,
    () => {
        if (!isInitialized.value && slotChildren.value.length > 0) {
            nextTick(() => {
                foundation.init();
                isInitialized.value = true;
                // 初始化后，如果有默认值，需要应用
                nextTick(() => {
                    if (effectiveValue.value !== undefined) {
                        foundation?.handleValueChange(effectiveValue.value);
                    }
                });
            });
        }
    },
    { immediate: true }
);

onUnmounted(() => {
    foundation?.destroy();
});

watch(
    () => effectiveValue.value,
    (newValue, oldValue) => {
        // 只有在初始化完成后才处理值的变化
        if (isInitialized.value && newValue !== oldValue) {
            foundation?.handleValueChange(newValue);
        }
    },
    { deep: true }
);

watch(
    () => props.optionList,
    () => {
        foundation?.handleOptionListChange();
        nextTick(() => {
            if ('value' in props) {
                foundation?.handleValueChange(props.value);
            } else {
                foundation?.handleOptionListChangeHadDefaultValue();
            }
        });
    },
    { deep: true }
);

let previousSlotKeys: any[] = [];

const flattenSlotVNodes = (vnodes: VNode[]): VNode[] => {
    const result: VNode[] = [];
    vnodes.forEach((vnode: any) => {
        if (!vnode) return;
        if (vnode.type === Fragment) {
            const children = Array.isArray(vnode.children) ? vnode.children : [];
            result.push(...flattenSlotVNodes(children as VNode[]));
        } else if (vnode.type && typeof vnode.type === 'object') {
            result.push(vnode);
        }
    });
    return result;
};

onUpdated(() => {
    if (!props.optionList || props.optionList.length === 0) {
        const flattenedVNodes = flattenSlotVNodes(slotChildren.value);
        const currentSlotKeys = flattenedVNodes.map((vnode: any) => vnode.key || vnode.props?.value);

        let hasChanged = currentSlotKeys.length !== previousSlotKeys.length;
        if (!hasChanged) {
            for (let i = 0; i < currentSlotKeys.length; i++) {
                if (currentSlotKeys[i] !== previousSlotKeys[i]) {
                    hasChanged = true;
                    break;
                }
            }
        }

        if (hasChanged) {
            previousSlotKeys = currentSlotKeys;
            foundation?.handleOptionListChange();
            nextTick(() => {
                if (effectiveValue.value !== undefined) {
                    foundation?.handleValueChange(effectiveValue.value);
                } else {
                    foundation?.handleOptionListChangeHadDefaultValue();
                }
            });
        }
    }
});

const useCustomTrigger = computed(() => {
    return typeof props.triggerRender === 'function';
});

const selectionCls = computed(() => {
    if (useCustomTrigger.value) {
        return classNames(props.className);
    }
    return classNames(prefixCls, props.className, {
        [`${prefixCls}-borderless`]: props.borderless,
        [`${prefixCls}-open`]: isOpen.value,
        [`${prefixCls}-focus`]: isFocus.value,
        [`${prefixCls}-disabled`]: props.disabled,
        [`${prefixCls}-single`]: !props.multiple,
        [`${prefixCls}-multiple`]: props.multiple,
        [`${prefixCls}-filterable`]: Boolean(props.filter),
        [`${prefixCls}-small`]: mergedSize.value === 'small',
        [`${prefixCls}-large`]: mergedSize.value === 'large',
        [`${prefixCls}-error`]: props.validateStatus === 'error',
        [`${prefixCls}-warning`]: props.validateStatus === 'warning',
        [`${prefixCls}-no-arrow`]: !props.showArrow,
        [`${prefixCls}-with-prefix`]: slots.prefix || props.insetLabel,
        [`${prefixCls}-with-suffix`]: slots.suffix,
    });
});

const prefixClasses = computed(() => {
    const labelNode = slots.prefix || props.insetLabel;
    const isString = typeof labelNode === 'string';

    return classNames({
        [`${prefixCls}-prefix`]: true,
        [`${prefixCls}-inset-label`]: props.insetLabel,
        [`${prefixCls}-prefix-text`]: labelNode && isString,
        [`${prefixCls}-prefix-icon`]: labelNode && !isString,
    });
});

const tagSize = computed(() => {
    return mergedSize.value === 'small' ? 'small' : 'large';
});

const selectedOptions = computed(() => {
    return Array.from(selections.value.values());
});

const visibleOptions = computed(() => {
    return options.value.filter((opt) => opt._show);
});

const virtualItemSize = computed(() => {
    return props.virtualize?.itemSize || 32;
});

const virtualHeight = computed(() => {
    return props.virtualize?.height || numbers.LIST_HEIGHT;
});

const virtualWidth = computed(() => {
    return props.virtualize?.width || '100%';
});

const totalHeight = computed(() => {
    return visibleOptions.value.length * virtualItemSize.value;
});

const virtualVisibleCount = computed(() => {
    return Math.ceil(virtualHeight.value / virtualItemSize.value) + 2;
});

const virtualStartIndex = computed(() => {
    const startIndex = Math.floor(virtualScrollTop.value / virtualItemSize.value);
    return Math.max(0, startIndex - 1);
});

const virtualEndIndex = computed(() => {
    return Math.min(visibleOptions.value.length, virtualStartIndex.value + virtualVisibleCount.value);
});

const virtualVisibleIndices = computed(() => {
    const indices: number[] = [];
    for (let i = virtualStartIndex.value; i < virtualEndIndex.value; i++) {
        indices.push(i);
    }
    return indices;
});

const offsetY = computed(() => {
    return virtualStartIndex.value * virtualItemSize.value;
});

function getGroupKey(parentGroup: OptionGroupProps): string {
    if (typeof parentGroup.label === 'string' || typeof parentGroup.label === 'number') {
        return String(parentGroup.label);
    }
    return `group-${JSON.stringify(parentGroup.label)}`;
}

const optionsWithGroupLabels = computed(() => {
    const result: Array<{
        option: OptionProps;
        showGroupLabel: boolean;
        groupLabel?: OptionGroupProps;
    }> = [];

    const renderedGroups = new Set<string>();

    visibleOptions.value.forEach((option) => {
        let showGroupLabel = false;
        let groupLabel: OptionGroupProps | undefined;

        if (option._parentGroup) {
            const groupKey = getGroupKey(option._parentGroup);
            if (!renderedGroups.has(groupKey)) {
                showGroupLabel = true;
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { key: _key, ref: _ref, ...safeGroupLabel } = option._parentGroup as any;
                groupLabel = safeGroupLabel;
                renderedGroups.add(groupKey);
            }
        }

        result.push({
            option,
            showGroupLabel,
            groupLabel,
        });
    });

    return result;
});

const showFilterInput = computed(() => {
    // allowCreate 模式下需要显示输入框以便创建新选项
    if (props.allowCreate) return true;
    if (!props.filter) return false;
    if (props.searchPosition !== 'trigger') return false;
    if (props.multiple) return true;
    return showInput.value || isOpen.value;
});

const shouldShowClear = computed(() => {
    return (
        props.showClear &&
        (selections.value.size > 0 || inputValue.value) &&
        !props.disabled &&
        (isHovering.value || isOpen.value)
    );
});

const singleSelectionTextCls = computed(() => {
    const showInputInTrigger = props.searchPosition === 'trigger';
    const hasSelection = selectedOptions.value.length > 0;
    const renderText = hasSelection ? selectedOptions.value[0].label : '';

    return classNames({
        [`${prefixCls}-selection-text`]: true,
        [`${prefixCls}-selection-placeholder`]: !renderText && renderText !== 0,
        [`${prefixCls}-selection-text-hide`]: inputValue.value && showInput.value && showInputInTrigger,
        [`${prefixCls}-selection-text-inactive`]: !inputValue.value && showInput.value && showInputInTrigger,
    });
});

const optionListWrapperStyle = computed(() => {
    const style: any = {
        ...props.dropdownStyle,
    };

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

const optionListWrapperCls = computed(() => {
    const isEmpty = !options.value.length || !options.value.some((item) => item._show);
    return classNames(
        {
            [`${prefixCls}-option-list-wrapper`]: !(isEmpty && props.emptyContent === null),
        },
        props.dropdownClassName
    );
});

const optionListStyle = computed(() => {
    const style: any = {};
    if (props.maxHeight) {
        style.maxHeight = typeof props.maxHeight === 'number' ? `${props.maxHeight}px` : props.maxHeight;
    }
    return style;
});

const optionListCls = computed(() => {
    return classNames({
        [`${prefixCls}-option-list`]: true,
        [`${prefixCls}-option-list-chosen`]: selections.value.size > 0,
    });
});

const dropdownInputCls = computed(() => {
    return classNames(`${prefixCls}-dropdown-input`, {
        [`${prefixCls}-dropdown-input-multiple`]: props.multiple,
        [`${prefixCls}-dropdown-input-single`]: !props.multiple,
    });
});

const contentWrapperCls = computed(() => {
    return classNames(`${prefixCls}-content-wrapper`, {
        [`${prefixCls}-content-wrapper-one-line`]: props.maxTagCount && !isOpen.value,
        [`${prefixCls}-content-wrapper-empty`]: !selectedOptions.value.length,
    });
});

const tagsForTagGroup = computed(() => {
    if (!props.maxTagCount) {
        return selectedOptions.value;
    }

    if (props.showRestTagsPopover) {
        return selectedOptions.value;
    }

    return selectedOptions.value.slice(0, props.maxTagCount);
});

const tagGroupMaxCount = computed(() => {
    if (!props.maxTagCount) {
        return undefined;
    }
    return props.maxTagCount;
});

const tagGroupRestCount = computed(() => {
    if (!props.maxTagCount) {
        return undefined;
    }

    if (props.showRestTagsPopover) {
        return undefined;
    }

    return selectedOptions.value.length - props.maxTagCount;
});

const customTriggerRender = computed(() => {
    if (!props.triggerRender || typeof props.triggerRender !== 'function') {
        return null;
    }

    const triggerProps: any = {
        value: selectedOptions.value,
        inputValue: inputValue.value,
        onSearch: (value: string) => {
            foundation?.handleInputChange(value, {} as any);
        },
        onChange: (value: string) => {
            foundation?.handleInputChange(value, {} as any);
        },
        onRemove: (item: OptionProps) => {
            foundation?.removeTag({ label: item.label, value: item.value });
        },
        onClear: (event?: MouseEvent) => {
            foundation?.handleClearClick(event as any);
        },
        disabled: props.disabled,
        placeholder: props.placeholder,
        componentProps: { ...props },
    };

    const result = props.triggerRender(triggerProps);
    return result;
});

function renderMultipleTag(option: OptionProps, index: number, isCollapse = false) {
    const disabled = option.disabled || props.disabled;

    const handleClose = (tagContent: any, e?: MouseEvent) => {
        if (e && typeof e.preventDefault === 'function') {
            e.preventDefault();
        }
        foundation?.removeTag({ label: option.label, value: option.value });
    };

    // 优先使用插槽
    if (slots.selectedItem) {
        const slotContent = slots.selectedItem({
            option,
            index,
            disabled,
            onClose: handleClose,
        });

        // 如果插槽返回的是数组，取第一个元素
        const content = Array.isArray(slotContent) ? slotContent[0] : slotContent;

        // 检查是否需要包裹在 Tag 中
        // 如果插槽内容已经是 Tag 组件，直接返回
        if (content && typeof content === 'object' && 'type' in content) {
            const componentType = (content.type as any)?.__name || (content.type as any)?.name;
            if (componentType === 'Tag' || componentType === 'SemiTag') {
                return content;
            }
        }

        // 否则包裹在默认 Tag 中
        return h(
            Tag,
            {
                closable: !disabled,
                disabled,
                color: 'white',
                size: tagSize.value,
                onClose: handleClose,
                class: isCollapse ? `${prefixCls}-content-wrapper-collapse-tag` : undefined,
            },
            {
                default: () => content,
            }
        );
    }

    // 如果没有插槽，使用 renderSelectedItem
    if (typeof props.renderSelectedItem === 'function') {
        const result = (props.renderSelectedItem as any)(option, {
            index,
            disabled,
            onClose: handleClose,
        });

        if (result && typeof result === 'object' && 'isRenderInTag' in result) {
            const { isRenderInTag, content } = result;

            if (isRenderInTag) {
                return h(
                    Tag,
                    {
                        closable: !disabled,
                        disabled,
                        color: 'white',
                        size: tagSize.value,
                        onClose: handleClose,
                        class: isCollapse ? `${prefixCls}-content-wrapper-collapse-tag` : undefined,
                    },
                    {
                        default: () => content,
                    }
                );
            } else {
                return content;
            }
        }

        return h(
            Tag,
            {
                closable: !disabled,
                disabled,
                color: 'white',
                size: tagSize.value,
                onClose: handleClose,
                class: isCollapse ? `${prefixCls}-content-wrapper-collapse-tag` : undefined,
            },
            {
                default: () => result,
            }
        );
    }

    // 默认渲染
    return h(
        Tag,
        {
            closable: !disabled,
            disabled,
            color: 'white',
            size: tagSize.value,
            onClose: handleClose,
            class: isCollapse ? `${prefixCls}-content-wrapper-collapse-tag` : undefined,
        },
        {
            default: () => option.label,
        }
    );
}

/**
 * 渲染 +N 标签
 * 当选中项超过 maxTagCount 时显示
 * @param n 剩余标签数量
 * @param restTags 剩余的标签数据
 */
function renderNTag(n: number, restTags: OptionProps[]) {
    const nTag = h(
        Tag,
        {
            closable: false,
            size: mergedSize.value || 'large',
            color: 'grey',
            class: `${prefixCls}-content-wrapper-collapse-tag`,
            key: `_+${n}`,
            style: { marginRight: 0, flexShrink: 0 },
        },
        {
            default: () => `+${n}`,
        }
    );

    if (props.showRestTagsPopover) {
        return h(
            Popover,
            {
                showArrow: true,
                trigger: 'hover',
                position: 'top',
                autoAdjustOverflow: true,
                ...props.restTagsPopoverProps,
                key: `_+${n}_Popover`,
            },
            {
                default: () => nTag,
                content: () =>
                    h(
                        Space,
                        {
                            spacing: 2,
                            wrap: true,
                            style: { maxWidth: '400px' },
                        },
                        {
                            default: () => restTags.map((tag, index) => renderMultipleTag(tag, index)),
                        }
                    ),
            }
        );
    }

    return nTag;
}

function renderOverflow(items: OptionProps[], index: number) {
    const isCollapse = true;
    return items.length && items[0] ? renderMultipleTag(items[0], index, isCollapse) : null;
}

function handleOverflow(items: OptionProps[]) {
    const { maxTagCount } = props;
    const newOverFlowItemCount =
        selections.value.size - (maxTagCount || 0) > 0
            ? selections.value.size - (maxTagCount || 0) + items.length - 1
            : items.length - 1;

    if (overflowItemCount.value !== newOverFlowItemCount) {
        foundation?.updateOverflowItemCount(selections.value.size, newOverFlowItemCount);
    }
}

/**
 * 渲染 ellipsisTrigger 模式下的折叠标签
 * 用于在空间不足时将多个标签合并显示
 * @param selections 当前选中的所有选项
 * @param length 限制显示的标签数量
 */
function renderCollapsedTags(selections: OptionProps[], length: number | undefined) {
    const selectedItems = selections.map((option) => ({
        label: option.label,
        option,
    }));
    const normalTags = typeof length === 'number' ? selectedItems.slice(0, length) : selectedItems;

    const children: VNode[] = [
        h(OverflowList, {
            items: normalTags,
            key: String(selections.length),
            itemKey: (item: any) => item.option?.value || item.label,
            renderMode: 'collapse',
            collapseFrom: 'end',
            overflowRenderer: (overflowItems: any[]) => {
                if (overflowItems.length > 0 && overflowItems[0]?.option) {
                    return renderOverflow([overflowItems[0].option], (length || 0) - 1);
                }
                return null;
            },
            onOverflow: (overflowItems: any[]) => {
                const options = overflowItems.map((item) => item.option).filter(Boolean);
                handleOverflow(options);
            },
            visibleItemRenderer: (item: any, index: number) => {
                return renderMultipleTag(item.option, index);
            },
            style: {
                display: 'flex',
                flexWrap: 'nowrap',
                alignItems: 'center',
                width: '100%',
                minWidth: 0,
            },
        }),
    ];

    if (overflowItemCount.value > 0) {
        const restTags = selections.slice(selections.length - overflowItemCount.value);
        children.push(renderNTag(overflowItemCount.value, restTags) as VNode);
    }

    return h(
        'div',
        {
            class: `${prefixCls}-content-wrapper-collapse`,
            style: {
                display: 'flex',
                flexWrap: 'nowrap',
                alignItems: 'center',
                overflow: 'hidden',
                width: '100%',
                minWidth: 0,
            },
        },
        children
    );
}

function handleTriggerClick(event?: MouseEvent) {
    if (props.disabled) return;
    foundation?.handleClick(event as any);
}

function handleSelect(option: OptionProps, event: MouseEvent) {
    const optionIndex = options.value.findIndex((opt) => opt.value === option.value);
    foundation?.onSelect(option, optionIndex >= 0 ? optionIndex : 0, event);
}

function handleClear(event: MouseEvent) {
    event.stopPropagation();
    foundation?.handleClearClick(event as any);
}

function handleSearchInput(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    foundation?.handleInputChange(value, event);
}

function handleKeyDown(event: KeyboardEvent) {
    if (keyboardEventHandler.value) {
        keyboardEventHandler.value(event);
    }
}

function handleFocus(_event: FocusEvent) {
    isFocus.value = true;
    foundation?.handleTriggerFocus(_event);
}

function handleBlur(_event: FocusEvent) {
    isFocus.value = false;
    foundation?.handleTriggerBlur(_event);
}

function handleInputFocus(event: FocusEvent) {
    if (props.multiple && Boolean(props.filter)) {
        isFocus.value = true;
    }
    event.stopPropagation();
}

function handleInputBlur(event: FocusEvent) {
    foundation?.handleInputBlur(event);
}

function handleMouseEnter(event: MouseEvent) {
    foundation?.handleMouseEnter(event as any);
}

function handleMouseLeave(event: MouseEvent) {
    foundation?.handleMouseLeave(event as any);
}

function handleOptionMouseEnter(index: number) {
    hasUserInteracted.value = true;
    focusIndex.value = index;
}

function handleListScroll(event: any) {
    foundation?.handleListScroll(event);
}

/**
 * 处理下拉菜单显示状态变化
 * @param visible 是否可见
 */
function handleDropdownVisibleChange(visible: boolean) {
    isOpen.value = visible;

    if (visible) {
        // 修复虚拟滚动下，再次打开下拉框内容为空白的问题
        // 原因是上次滚动的 scrollTop 状态残留，导致计算出的 visibleIndices 偏移，而 DOM 重新渲染后 scrollTop 为 0
        if (props.virtualize) {
            virtualScrollTop.value = 0;
        }

        // 当下拉面板打开时，如果设置了 dropdownMatchSelectWidth，计算并设置下拉面板宽度
        // Foundation 层会在 open() 时调用 _setDropdownWidth()，但可能此时 Popover 还未完全渲染
        // 所以我们需要在 Popover 完全渲染后再次确保宽度正确
        if (props.dropdownMatchSelectWidth && triggerRef.value) {
            // 使用 requestAnimationFrame + nextTick 确保 Popover 完全渲染后再计算宽度
            requestAnimationFrame(() => {
                nextTick(() => {
                    const triggerWidth = triggerRef.value?.getBoundingClientRect().width || 0;
                    if (triggerWidth > 0) {
                        dropdownMinWidth.value = triggerWidth;
                    }
                });
            });
        }

        if (props.searchPosition === 'dropdown' && props.filter) {
            nextTick(() => {
                if (dropdownInputRef.value && typeof (dropdownInputRef.value as any).focus === 'function') {
                    (dropdownInputRef.value as any).focus();
                }
            });
        }

        if (props.virtualize && selections.value.size > 0) {
            nextTick(() => {
                scrollToSelectedInVirtualList();
            });
        }
    } else {
        hasUserInteracted.value = false;
        isFullTags.value = false;
        if (!props.ellipsisTrigger) {
            overflowItemCount.value = 0;
        }
    }

    emit('dropdownVisibleChange', visible);
}

function scrollToSelectedInVirtualList() {
    if (!props.virtualize || !virtualContainerRef.value) {
        return;
    }

    let minItemIndex = -1;
    selections.value.forEach((item: any) => {
        const itemIndex = item._scrollIndex;
        if (typeof itemIndex === 'number' && itemIndex >= 0) {
            minItemIndex = minItemIndex !== -1 && minItemIndex < itemIndex ? minItemIndex : itemIndex;
        }
    });

    if (minItemIndex !== -1) {
        const scrollPosition = minItemIndex * virtualItemSize.value - virtualHeight.value / 2;
        virtualContainerRef.value.scrollTop = Math.max(0, scrollPosition);
    }
}

function handlePopoverAfterClose() {
    foundation?.handlePopoverClose();
}

function handleClickOutside(_e: MouseEvent) {
    if (isOpen.value && !props.disabled) {
        foundation?.close();
    }
}

function handleVirtualScroll(event: Event) {
    const target = event.target as HTMLElement;
    virtualScrollTop.value = target.scrollTop;
}

defineExpose({
    clearInput: () => {
        inputValue.value = '';
    },
    selectAll: () => {
        foundation?.selectAll();
    },
    deselectAll: () => {
        foundation?.handleClearClick({} as any);
    },
    focus: () => {
        foundation?.focus();
    },
    close: () => {
        foundation?.close();
    },
    open: () => {
        foundation?.open();
    },
    search: (value: string, event?: any) => {
        foundation?.handleInputChange(value, event || {});
    },
});
</script>
