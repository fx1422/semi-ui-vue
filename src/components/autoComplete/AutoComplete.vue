<template>
    <Popover
        ref="optionsRef"
        :mouseEnterDelay="mouseEnterDelay"
        :mouseLeaveDelay="mouseLeaveDelay"
        :autoAdjustOverflow="autoAdjustOverflow"
        trigger="custom"
        :motion="motion"
        :visible="state.visible"
        :content="optionListContent"
        :position="position"
        :zIndex="zIndex"
        :stopPropagation="stopPropagation"
        :getPopupContainer="getPopupContainer"
        :rePosKey="state.rePosKey"
    >
        <component :is="renderInput()" />
    </Popover>
</template>

<script setup lang="ts">
import {
    reactive,
    ref,
    computed,
    onMounted,
    onUnmounted,
    watch,
    nextTick,
    h,
    useSlots,
    Fragment,
    isVNode,
    getCurrentInstance,
} from 'vue';
import classNames from 'classnames';
import { isEqual } from 'lodash-es';
import { strings, cssClasses } from '@douyinfe/semi-foundation/autoComplete/constants';
import AutoCompleteFoundation, {
    type AutoCompleteAdapter,
    type StateOptionItem,
} from '@douyinfe/semi-foundation/autoComplete/foundation';
import { numbers as popoverNumbers } from '@douyinfe/semi-foundation/popover/constants';
import { getUuidShort } from '@douyinfe/semi-foundation/utils/uuid';
import Spin from '../spin';
import Popover from '../popover';
import Input from '../input';
import Option from './Option.vue';
import type { AutoCompleteProps, AutoCompleteItems } from './interface';

defineOptions({
    name: 'AutoComplete',
});

const props = withDefaults(defineProps<AutoCompleteProps>(), {
    stopPropagation: true,
    motion: true,
    zIndex: popoverNumbers.DEFAULT_Z_INDEX,
    position: 'bottomLeft',
    data: () => [],
    showClear: false,
    size: 'default',
    defaultActiveFirstOption: false,
    dropdownMatchSelectWidth: true,
    loading: false,
    maxHeight: 300,
    validateStatus: 'default',
    autoFocus: false,
    emptyContent: null,
    onChangeWithObject: false,
    onSelectWithObject: false,
});

const emit = defineEmits<{
    focus: [e: FocusEvent];
    blur: [e: FocusEvent];
    change: [value: string | number | AutoCompleteItems];
    search: [inputValue: string];
    select: [value: AutoCompleteItems];
    clear: [];
    dropdownVisibleChange: [visible: boolean];
    keydown: [e: KeyboardEvent];
}>();

const prefixCls = cssClasses.PREFIX;

const triggerRef = ref<HTMLDivElement>();
const optionsRef = ref<any>();
let clickOutsideHandler: ((e: Event) => void) | null = null;
const optionListId = ref('');

interface StateType {
    dropdownMinWidth: null | number;
    inputValue: string | undefined | number;
    options: StateOptionItem[];
    visible: boolean;
    focusIndex: number;
    selection: Map<any, any>;
    rePosKey: number;
    keyboardEventSet?: {
        onKeyDown?: (e: KeyboardEvent) => void;
    };
}

const state = reactive<StateType>({
    dropdownMinWidth: null,
    inputValue: '',
    options: [],
    visible: false,
    focusIndex: props.defaultActiveFirstOption ? 0 : -1,
    selection: new Map(),
    rePosKey: 1,
});

const slots = useSlots();

const adapter: AutoCompleteAdapter = {
    registerKeyDown: (cb: any): void => {
        state.keyboardEventSet = {
            onKeyDown: cb,
        };
    },
    unregisterKeyDown: (): void => {
        state.keyboardEventSet = {};
    },
    updateFocusIndex: (focusIndex: number): void => {
        state.focusIndex = focusIndex;
    },
    updateScrollTop: (index?: number) => {
        let optionClassName = `.${prefixCls}-option-selected`;
        if (index !== undefined) {
            optionClassName = `.${prefixCls}-option:nth-child(${index + 1})`;
        }

        const destNode = document.querySelector(
            `#${prefixCls}-${optionListId.value} ${optionClassName}`
        ) as HTMLDivElement;
        if (destNode) {
            const destParent = destNode.parentNode as HTMLDivElement;
            destParent.scrollTop =
                destNode.offsetTop - destParent.offsetTop - destParent.clientHeight / 2 + destNode.clientHeight / 2;
        }
    },
    getTriggerWidth: () => {
        const el = triggerRef.value;
        return el && el.getBoundingClientRect().width;
    },
    setOptionWrapperWidth: (width) => {
        state.dropdownMinWidth = width;
    },
    updateInputValue: (inputValue) => {
        state.inputValue = inputValue;
    },
    toggleListVisible: (isShow) => {
        state.visible = isShow;
    },
    updateOptionList: (optionList) => {
        // 性能优化：只在 options 真正变化时才更新，避免不必要的重新渲染
        if (state.options.length === optionList.length) {
            // 如果长度相同，比较选项的关键属性
            let isEqual = true;
            for (let i = 0; i < optionList.length; i++) {
                const current = state.options[i];
                const next = optionList[i];
                // 比较选项对象引用（如果相同则跳过）
                if (current === next) {
                    continue;
                }
                // 比较关键属性
                if (current?.value !== next?.value || current?.label !== next?.label || current?.show !== next?.show) {
                    isEqual = false;
                    break;
                }
            }
            if (isEqual) {
                return;
            }
        }
        state.options = optionList;
    },
    updateSelection: (selection) => {
        state.selection = selection;
    },
    notifySearch: (inputValue) => {
        emit('search', inputValue);
    },
    notifyChange: (value) => {
        // 如果 onChangeWithObject 为 true，且当前有选中的选项，则传递完整的对象
        if (props.onChangeWithObject && state.selection.size > 0) {
            const selectedOption = Array.from(state.selection.values())[0];
            emit('change', selectedOption as AutoCompleteItems);
        } else {
            emit('change', value);
        }
    },
    notifySelect: (option: StateOptionItem | string | number): void => {
        emit('select', option as AutoCompleteItems);
    },
    notifyDropdownVisibleChange: (isVisible: boolean): void => {
        emit('dropdownVisibleChange', isVisible);
    },
    notifyClear: () => {
        emit('clear');
    },
    notifyFocus: (event: FocusEvent) => {
        emit('focus', event);
    },
    notifyBlur: (event: FocusEvent) => {
        emit('blur', event);
    },
    notifyKeyDown: (e) => {
        emit('keydown', e);
    },
    rePositionDropdown: () => {
        state.rePosKey = state.rePosKey + 1;
    },
    registerClickOutsideHandler: (cb) => {
        const handler = (e: Event) => {
            const optionInstance = optionsRef.value;
            const triggerDom = triggerRef.value;
            const optionsDom = optionInstance?.$el;
            const target = e.target as Element;
            const path = ((e as any).composedPath && (e as any).composedPath()) || [target];
            if (
                optionsDom &&
                (!optionsDom.contains(target) || !optionsDom.contains(target.parentNode)) &&
                triggerDom &&
                !triggerDom.contains(target) &&
                !(path.includes(triggerDom) || path.includes(optionsDom))
            ) {
                cb(e);
            }
        };
        clickOutsideHandler = handler;
        document.addEventListener('mousedown', handler, false);
    },
    unregisterClickOutsideHandler: () => {
        if (clickOutsideHandler) {
            document.removeEventListener('mousedown', clickOutsideHandler, false);
        }
    },
    getState: (key: string) => (state as any)[key],
    getStates: () => state,
    getProp: (key: string) => (props as any)[key],
    getProps: () => {
        // 过滤掉 undefined 的 props，避免 Vue 3 中 "value" in props 总是 true 的问题
        // Foundation 使用 'value' in props 判断是否受控组件
        const filteredProps: Record<string, any> = {};
        for (const key in props) {
            if (Object.prototype.hasOwnProperty.call(props, key) && (props as any)[key] !== undefined) {
                filteredProps[key] = (props as any)[key];
            }
        }
        return filteredProps;
    },
    setState: (newState: Partial<StateType>, callback?: () => void) => {
        Object.assign(state, newState);
        if (callback) {
            nextTick(callback);
        }
    },
    // DefaultAdapter required methods
    getContext: (key: string) => {
        // Vue 没有 React Context，返回空值
        return undefined;
    },
    getContexts: () => {
        return {};
    },
    getCache: (key: string) => {
        return undefined;
    },
    getCaches: () => {
        return {};
    },
    setCache: (key: string, value: any) => {
        // 可以实现缓存设置，这里暂不实现
    },
    stopPropagation: (e: Event) => {
        e?.stopPropagation();
    },
    persistEvent: (event: Event) => {
        // Vue 3 不需要持久化事件
    },
};

const foundation = new AutoCompleteFoundation(adapter);

onMounted(() => {
    foundation.init();
    optionListId.value = getUuidShort();
    // 确保初始化时处理数据，即使数据为空数组也需要处理（使用 nextTick 确保在 init 之后）
    nextTick(() => {
        // 无论数据是否为空，都需要调用 handleDataChange 来更新 options
        // 这样空数据时才能正确显示空内容
        if (props.data !== undefined) {
            foundation.handleDataChange(props.data);
        }
    });
});

onUnmounted(() => {
    foundation.destroy();
});

watch(
    () => props.data,
    (newData, oldData) => {
        // 即使数据为空，也需要调用 handleDataChange 来更新 options
        // 因为空数组和有值的数组是不同的状态
        if (!isEqual(newData, oldData)) {
            foundation.handleDataChange(newData);
        }
    },
    { immediate: false }
);

watch(
    () => props.value,
    (newValue, oldValue) => {
        if (newValue !== oldValue) {
            foundation.handleValueChange(newValue);
        }
    }
);

const onSelect = (option: StateOptionItem, optionIndex: number, e: MouseEvent | KeyboardEvent): void => {
    foundation.handleSelect(option, optionIndex);
};

const onSearch = (value: string | Event): void => {
    // 兼容 onInput 传递事件对象的情况
    let searchValue: string;
    if (value instanceof Event) {
        const target = value.target as HTMLInputElement;
        searchValue = target.value;
    } else {
        searchValue = value;
    }
    foundation.handleSearch(searchValue);
};

const onBlur = (e: FocusEvent): void => foundation.handleBlur(e);

const onFocus = (e: FocusEvent): void => foundation.handleFocus(e);

const onInputClear = (): void => foundation.handleClear();

const handleInputClick = (e: MouseEvent): void => foundation.handleInputClick(e as any);

const renderInput = () => {
    const useCustomTrigger = typeof props.triggerRender === 'function';

    const outerProps = {
        style: props.style,
        class: useCustomTrigger
            ? classNames(props.className)
            : classNames(
                  {
                      [prefixCls]: true,
                      [`${prefixCls}-disabled`]: props.disabled,
                  },
                  props.className
              ),
        onClick: handleInputClick,
        ref: triggerRef,
        id: props.id,
        ...state.keyboardEventSet,
        tabIndex: -1,
    };

    const innerProps = {
        disabled: props.disabled,
        placeholder: props.placeholder,
        autoFocus: props.autoFocus,
        value: typeof props.value !== 'undefined' ? props.value : state.inputValue,
        onInput: onSearch, // 使用 onInput 而不是 onChange，实时触发
        onChange: onSearch, // 保留 onChange 以兼容失焦场景
        onClear: onInputClear,
        ariaLabel: props.ariaLabel,
        ariaLabelledby: props.ariaLabelledby,
        ariaInvalid: props.ariaInvalid,
        ariaErrormessage: props.ariaErrormessage,
        ariaDescribedby: props.ariaDescribedby,
        ariaRequired: props.ariaRequired,
        suffix: props.suffix,
        prefix: props.prefix || props.insetLabel,
        insetLabelId: props.insetLabelId,
        showClear: props.showClear,
        validateStatus: props.validateStatus,
        size: props.size,
        onBlur: onBlur,
        onFocus: onFocus,
        clearIcon: props.clearIcon,
    };

    return h('div', outerProps, [
        typeof props.triggerRender === 'function'
            ? h(props.triggerRender, {
                  ...innerProps,
                  inputValue: (typeof props.value !== 'undefined' ? props.value : state.inputValue) as string,
                  value: Array.from(state.selection.values()),
                  componentName: 'AutoComplete',
                  componentProps: { ...props },
              })
            : h(Input, innerProps),
    ]);
};

const renderLoading = () => {
    const loadingWrapperCls = `${prefixCls}-loading-wrapper`;
    return h('div', { class: loadingWrapperCls }, [h(Spin)]);
};

const renderOption = (option: StateOptionItem, optionIndex: number) => {
    const isFocused = optionIndex === state.focusIndex;

    // 当使用 renderItem 时，option.label 是 VNode，需要保存原始 label
    // Foundation 层通过 ...item 保留了所有原始数据，label 只是被覆盖
    // 如果 option.label 是 VNode，说明使用了 renderItem，需要从原始数据中获取 label
    const isVNodeLabel =
        option.label && typeof option.label === 'object' && option.label !== null && 'type' in option.label;

    // 获取原始 label（在 renderItem 覆盖之前）
    // 当使用 renderItem 时，option 中包含原始的 item 数据，label 只是被覆盖
    // 我们需要从原始数据中获取 label（可能是 email 或其他字段）
    let originalLabel: any = option.label;
    if (isVNodeLabel) {
        const optionData = option as any;
        // 检查是否有原始的 label 字段（在 renderItem 覆盖之前）
        // 或者从其他属性中获取（如 email，这是 demo 中设置的原始 label）
        // 优先检查是否有 value 或其他标识字段
        originalLabel = optionData.email || optionData.label || option.value;
    }

    // 优先使用插槽（使用 instance.slots 如果可用）
    const instance = getCurrentInstance();
    const actualSlots = instance?.slots || slots;
    const slotContent = actualSlots.option ? actualSlots.option({ option, index: optionIndex }) : null;

    return h(
        Option,
        {
            showTick: false,
            onSelect: (v: StateOptionItem, e: MouseEvent | KeyboardEvent) => onSelect(v, optionIndex, e),
            focused: isFocused,
            onMouseEnter: () => foundation.handleOptionMouseEnter(optionIndex),
            key: option.key || String(option.value) + optionIndex,
            ...option,
            // 保存原始 label，供 handleClick 使用
            originalLabel: originalLabel,
        },
        {
            default: () => slotContent || option.label,
        }
    );
};

const optionListContent = computed(() => {
    const listCls = classNames(
        {
            [`${prefixCls}-option-list`]: true,
        },
        props.dropdownClassName
    );

    // 扁平化插槽 VNode，处理 Fragment
    const flattenSlotVNodes = (vnodes: any[]): any[] => {
        const result: any[] = [];
        vnodes.forEach((vnode: any) => {
            if (!vnode) return;
            if (vnode.type === Fragment && Array.isArray(vnode.children)) {
                result.push(...flattenSlotVNodes(vnode.children));
            } else if (vnode && vnode.type && typeof vnode.type !== 'symbol') {
                result.push(vnode);
            }
        });
        return result;
    };

    // 提取插槽内容的辅助函数
    const extractSlotContent = (slotContent: any): any => {
        if (!slotContent) return null;

        // 如果是数组，扁平化并过滤
        if (Array.isArray(slotContent)) {
            const flattened = flattenSlotVNodes(slotContent);
            // 过滤掉注释节点和无效节点
            const validNodes = flattened.filter((node) => {
                if (!node || node === null || node === undefined) return false;
                if (node.type && typeof node.type === 'symbol' && node.type.toString() === 'Symbol(Comment)')
                    return false;
                return true;
            });
            return validNodes.length > 0 ? validNodes[0] : null;
        }

        // 如果是 Fragment，扁平化处理
        if (slotContent.type === Fragment && Array.isArray(slotContent.children)) {
            const flattened = flattenSlotVNodes(slotContent.children);
            const validNodes = flattened.filter((node) => {
                if (!node || node === null || node === undefined) return false;
                if (node.type && typeof node.type === 'symbol' && node.type.toString() === 'Symbol(Comment)')
                    return false;
                return true;
            });
            return validNodes.length > 0 ? validNodes[0] : slotContent;
        }

        // 其他情况直接返回
        return slotContent;
    };

    const style = {
        maxHeight: props.maxHeight,
        minWidth: state.dropdownMinWidth,
        ...props.dropdownStyle,
    };

    // 处理加载状态
    if (props.loading) {
        return h(
            'div',
            {
                class: listCls,
                role: 'listbox',
                style,
                id: `${prefixCls}-${optionListId.value}`,
            },
            renderLoading()
        );
    }

    // 处理空状态
    if (state.options.length === 0) {
        const instance = getCurrentInstance();
        // 优先使用 instance.slots，因为 useSlots() 可能不包含所有插槽
        const actualSlots = instance?.slots || slots;

        let emptyContent: any = null;

        // 优先使用插槽
        if (actualSlots.empty) {
            const slotContent = actualSlots.empty();
            emptyContent = extractSlotContent(slotContent);
        }

        // 如果没有插槽或插槽解析失败，使用 props.emptyContent
        if (!emptyContent && props.emptyContent) {
            emptyContent = props.emptyContent;
        }

        // 如果还是没有内容，使用默认占位符
        if (!emptyContent) {
            emptyContent = h(
                'div',
                {
                    style: {
                        padding: '12px',
                        textAlign: 'center',
                        color: 'var(--semi-color-text-2)',
                    },
                },
                '暂无数据'
            );
        }

        return h(
            'div',
            {
                class: listCls,
                role: 'listbox',
                style,
                id: `${prefixCls}-${optionListId.value}`,
            },
            emptyContent
        );
    }

    // 处理有选项的情况
    const optionsNode = state.options.filter((option) => option.show).map((option, i) => renderOption(option, i));

    return h(
        'div',
        {
            class: listCls,
            role: 'listbox',
            style,
            id: `${prefixCls}-${optionListId.value}`,
        },
        optionsNode
    );
});

defineExpose({
    foundation,
});
</script>
