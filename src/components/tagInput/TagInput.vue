<template>
    <div
        ref="tagInputRef"
        :class="tagInputCls"
        :style="props.style"
        :aria-disabled="props.disabled"
        :aria-label="props['aria-label']"
        :aria-invalid="props.validateStatus === 'error'"
        v-bind="getDataAttr()"
        @mouseenter="handleInputMouseEnter"
        @mouseleave="handleInputMouseLeave"
        @click="handleClick"
    >
        <div
            v-if="prefixNode"
            :id="props.insetLabelId"
            :class="prefixWrapperCls"
            x-semi-prop="prefix,insetLabel"
            @mousedown="handlePreventMouseDown"
            @click="handleClickPrefixOrSuffix"
        >
            <component :is="prefixNode" />
        </div>

        <div :class="wrapperCls">
            <template v-if="active && draggable && tagsArray.length > 0">
                <Sortable
                    :items="tagsArray"
                    :onSortEnd="onSortEnd"
                    :renderItem="renderSortTag"
                    :prefix="prefixCls"
                    :container="SortContainer"
                    :dragOverlayCls="`${prefixCls}-right-item-drag-item-move`"
                    direction="horizontal"
                />
            </template>
            <template v-else>
                <template v-for="(tag, index) in visibleTags" :key="getTagKey(tag, index)">
                    <component :is="renderTag(tag, index)" />
                </template>
                <Popover
                    v-if="restTags.length > 0 && props.showRestTagsPopover"
                    :content="restTagsNodes"
                    showArrow
                    trigger="hover"
                    position="top"
                    :autoAdjustOverflow="true"
                    v-bind="props.restTagsPopoverProps || {}"
                >
                    <span :class="restTagsCls">+{{ tagsArray.length - (props.maxTagCount || 0) }}</span>
                </Popover>
                <span v-else-if="restTags.length > 0" :class="restTagsCls">
                    +{{ tagsArray.length - (props.maxTagCount || 0) }}
                </span>
            </template>

            <Input
                ref="inputRef"
                :class="inputCls"
                :disabled="props.disabled"
                :value="state.inputValue"
                :size="props.size"
                :placeholder="tagsArray.length === 0 ? props.placeholder : ''"
                @keydown="handleKeyDown"
                @input="handleInput"
                @change="handleInputChange"
                @blur="handleInputBlur"
                @focus="handleInputFocus"
                @compositionstart="handleInputCompositionStart"
                @compositionend="handleInputCompositionEnd"
            />
        </div>

        <div
            v-if="props.showClear"
            :class="clearCls"
            role="button"
            tabindex="0"
            aria-label="Clear TagInput value"
            @click="handleClearBtn"
            @keypress="handleClearEnterPress"
        >
            <component :is="props.clearIcon" v-if="props.clearIcon" />
            <IconClear v-else />
        </div>

        <div
            v-if="suffixNode"
            :class="suffixWrapperCls"
            x-semi-prop="suffix"
            @mousedown="handlePreventMouseDown"
            @click="handleClickPrefixOrSuffix"
        >
            <component :is="suffixNode" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick, h, VNode } from 'vue';
import cls from 'classnames';
import { noop, isString, isNull, isUndefined, isFunction, isArray, isNumber, isEqual } from 'lodash-es';
import TagInputFoundation, { TagInputAdapter, OnSortEndProps } from '@douyinfe/semi-foundation/tagInput/foundation';
import { cssClasses } from '@douyinfe/semi-foundation/tagInput/constants';
import getSplitedArray from '@douyinfe/semi-foundation/tagInput/utils/getSplitedArray';
import {
    useFoundation,
    useBaseComponent,
    isSemiIcon,
    normalizeKeyboardEvent,
    isEnterPressed,
    KEY_CODE,
} from '../_utils';
import Input from '../input/Input.vue';
import TagItem from './TagItem.vue';
import Popover from '../popover/Popover.vue';
import Sortable, { RenderItemProps } from '../_sortable/Sortable.vue';
import { IconClear, IconHandle } from '../icons';
import { TagInputProps, TagInputState } from './interface';

defineOptions({
    name: 'TagInput',
});

const prefixCls = cssClasses.PREFIX;

const props = withDefaults(defineProps<TagInputProps>(), {
    showClear: false,
    addOnBlur: false,
    allowDuplicates: true,
    showRestTagsPopover: true,
    autoFocus: false,
    draggable: false,
    expandRestTagsOnClick: true,
    showContentTooltip: true,
    separator: ',',
    size: 'default',
    validateStatus: 'default',
    onBlur: noop,
    onFocus: noop,
    onChange: noop,
    onInputChange: noop,
    onExceed: noop,
    onInputExceed: noop,
    onAdd: noop,
    onRemove: noop,
    onKeyDown: noop,
});

const emit = defineEmits<{
    'update:value': [value: string[]];
    'update:inputValue': [value: string];
    change: [value: string[]];
    add: [addedValue: string[]];
    remove: [removedValue: string, idx: number];
    blur: [e: FocusEvent];
    focus: [e: FocusEvent];
    inputChange: [value: string, e: Event];
    keydown: [e: KeyboardEvent];
}>();

const tagInputRef = ref<HTMLDivElement>();
const inputRef = ref<InstanceType<typeof Input>>();
const clickOutsideHandler = ref<((e: Event) => void) | null>(null);

const getInputElement = (): HTMLInputElement | null => {
    return inputRef.value?.$el?.querySelector('input') as HTMLInputElement | null;
};

const getInitialTagsArray = () => {
    if (isArray(props.value)) {
        return props.value;
    }
    if (props.value === null) {
        return [];
    }
    return props.defaultValue || [];
};

const state = ref<TagInputState>({
    tagsArray: getInitialTagsArray(),
    inputValue: props.inputValue || '',
    focusing: false,
    hovering: false,
    active: false,
    entering: false,
});

let isInitialized = false;
watch(
    () => props.value,
    (newValue, oldValue) => {
        if (isArray(newValue)) {
            state.value.tagsArray = newValue;
        } else if (newValue === null) {
            state.value.tagsArray = [];
        } else if (newValue === undefined) {
            if (
                !isInitialized &&
                oldValue === undefined &&
                (props.defaultValue || []).length > 0 &&
                state.value.tagsArray.length > 0 &&
                isEqual(state.value.tagsArray, props.defaultValue)
            ) {
                // 初始化时保持 defaultValue
            } else {
                state.value.tagsArray = [];
            }
        }
        isInitialized = true;
    },
    { immediate: true, deep: false }
);

watch(
    () => props.inputValue,
    (newValue) => {
        if (isString(newValue) || newValue === '') {
            state.value.inputValue = newValue || '';
        }
    },
    { immediate: true }
);

const { adapter: baseAdapter, getDataAttr } = useBaseComponent(props, state);

baseAdapter.getProps = () => {
    const filteredProps: Record<string, unknown> = {};
    Object.keys(props).forEach((key) => {
        const value = (props as any)[key];
        if (value !== undefined) {
            filteredProps[key] = value;
        }
    });
    return filteredProps as typeof props;
};

const originalGetStates = baseAdapter.getStates;
baseAdapter.getStates = () => {
    const states = originalGetStates();
    const inputElement = getInputElement();
    if (inputElement && inputElement.value !== states.inputValue) {
        states.inputValue = inputElement.value;
    }
    return states;
};

const adapter: TagInputAdapter = {
    ...baseAdapter,
    setInputValue: (inputValue: string) => {
        state.value.inputValue = inputValue;
        emit('update:inputValue', inputValue);
    },
    setTagsArray: (tagsArray: string[]) => {
        state.value.tagsArray = tagsArray;
        emit('update:value', tagsArray);
    },
    setFocusing: (focusing: boolean) => {
        state.value.focusing = focusing;
    },
    toggleFocusing: (focused: boolean) => {
        if (focused) {
            inputRef.value?.focus();
        } else {
            inputRef.value?.blur();
        }
        state.value.focusing = focused;
    },
    setHovering: (hovering: boolean) => {
        state.value.hovering = hovering;
    },
    setActive: (active: boolean) => {
        state.value.active = active;
    },
    setEntering: (entering: boolean) => {
        state.value.entering = entering;
    },
    getClickOutsideHandler: () => clickOutsideHandler.value,
    registerClickOutsideHandler: (cb: (e: Event) => void) => {
        const handler = (e: Event) => {
            const tagInputDom = tagInputRef.value;
            const target = e.target as Element;
            const path = (e as any).composedPath?.() || [target];
            if (tagInputDom && !tagInputDom.contains(target) && !path.includes(tagInputDom)) {
                cb(e);
            }
        };
        clickOutsideHandler.value = handler;
        document.addEventListener('click', handler, false);
    },
    unregisterClickOutsideHandler: () => {
        if (clickOutsideHandler.value) {
            document.removeEventListener('click', clickOutsideHandler.value);
            clickOutsideHandler.value = null;
        }
    },
    notifyBlur: (e: FocusEvent) => {
        emit('blur', e);
        props.onBlur(e);
    },
    notifyFocus: (e: FocusEvent) => {
        emit('focus', e);
        props.onFocus(e);
    },
    notifyInputChange: (v: string, e: Event) => {
        emit('inputChange', v, e);
        props.onInputChange(v, e);
    },
    notifyTagChange: (v: string[]) => {
        state.value.tagsArray = v;
        emit('change', v);
        emit('update:value', v);
        props.onChange(v);
    },
    notifyTagAdd: (v: string[]) => {
        emit('add', v);
        props.onAdd(v);
    },
    notifyTagRemove: (v: string, idx: number) => {
        emit('remove', v, idx);
        props.onRemove(v, idx);
    },
    notifyKeyDown: (e: KeyboardEvent) => {
        emit('keydown', e);
        props.onKeyDown(e);
    },
};

const { foundation } = useFoundation(TagInputFoundation, adapter);

const tagsArray = computed(() => state.value.tagsArray || []);
const focusing = computed(() => state.value.focusing || false);
const hovering = computed(() => state.value.hovering || false);
const active = computed(() => state.value.active || false);
const draggable = computed(() => props.draggable && active.value);

const tagInputCls = computed(() =>
    cls(prefixCls, props.className, {
        [`${prefixCls}-focus`]: focusing.value || active.value,
        [`${prefixCls}-disabled`]: props.disabled,
        [`${prefixCls}-hover`]: hovering.value && !props.disabled,
        [`${prefixCls}-error`]: props.validateStatus === 'error',
        [`${prefixCls}-warning`]: props.validateStatus === 'warning',
        [`${prefixCls}-small`]: props.size === 'small',
        [`${prefixCls}-large`]: props.size === 'large',
        [`${prefixCls}-with-prefix`]: !!props.prefix || !!props.insetLabel,
        [`${prefixCls}-with-suffix`]: !!props.suffix,
    })
);

const wrapperCls = computed(() => `${prefixCls}-wrapper`);
const inputCls = computed(() => cls(`${prefixCls}-wrapper-input`, `${prefixCls}-wrapper-input-${props.size}`));

const prefixNode = computed(() => {
    const labelNode = props.prefix || props.insetLabel;
    if (isNull(labelNode) || isUndefined(labelNode)) {
        return null;
    }
    return isString(labelNode) ? h('span', labelNode) : labelNode;
});

const suffixNode = computed(() => {
    if (isNull(props.suffix) || isUndefined(props.suffix)) {
        return null;
    }
    return isString(props.suffix) ? h('span', props.suffix) : props.suffix;
});

const prefixWrapperCls = computed(() => {
    const labelNode = props.prefix || props.insetLabel;
    return cls(`${prefixCls}-prefix`, {
        [`${prefixCls}-inset-label`]: props.insetLabel,
        [`${prefixCls}-prefix-text`]: labelNode && isString(labelNode),
        [`${prefixCls}-prefix-icon`]: labelNode && isSemiIcon(labelNode),
    });
});

const suffixWrapperCls = computed(() =>
    cls(`${prefixCls}-suffix`, {
        [`${prefixCls}-suffix-text`]: props.suffix && isString(props.suffix),
        [`${prefixCls}-suffix-icon`]: props.suffix && isSemiIcon(props.suffix),
    })
);

const clearCls = computed(() =>
    cls(`${prefixCls}-clearBtn`, {
        [`${prefixCls}-clearBtn-invisible`]:
            !hovering.value || (state.value.inputValue === '' && tagsArray.value.length === 0) || props.disabled,
    })
);

const visibleTags = computed(() => {
    if (
        (!active.value || !props.expandRestTagsOnClick) &&
        props.maxTagCount &&
        props.maxTagCount < tagsArray.value.length
    ) {
        return tagsArray.value.slice(0, props.maxTagCount);
    }
    return tagsArray.value;
});

const restTags = computed(() => {
    if (
        (!active.value || !props.expandRestTagsOnClick) &&
        props.maxTagCount &&
        props.maxTagCount < tagsArray.value.length
    ) {
        return tagsArray.value.slice(props.maxTagCount);
    }
    return [];
});

const restTagsCls = computed(() =>
    cls(`${prefixCls}-wrapper-n`, {
        [`${prefixCls}-wrapper-n-disabled`]: props.disabled,
    })
);

const restTagsNodes = computed(() => {
    return h(
        'div',
        { class: `${prefixCls}-rest-tags-popover-list` },
        restTags.value.map((tag, index) => {
            const actualIndex = (props.maxTagCount || 0) + index;
            return renderTag(tag, actualIndex);
        })
    );
});

const getTagKey = (value: string, index: number) => {
    return draggable.value ? value : `${index}${value}`;
};

const renderTag = (value: string, index: number, sortableHandle?: any): VNode => {
    const { size, disabled, renderTagItem, showContentTooltip, draggable: isDraggable } = props;
    const showIconHandler = active.value && isDraggable;

    const onClose = () => {
        if (!disabled) {
            foundation.handleTagClose(index);
        }
    };

    // 如果有自定义渲染函数
    if (isFunction(renderTagItem)) {
        const customRender = renderTagItem(value, index, onClose);
        return h(TagItem, {
            value,
            index,
            prefixCls,
            size,
            disabled,
            showContentTooltip,
            showIconHandler,
            draggable: draggable.value,
            sortableHandle,
            customRender,
            onClose,
        });
    }

    // 默认渲染
    return h(TagItem, {
        value,
        index,
        prefixCls,
        size,
        disabled,
        showContentTooltip,
        showIconHandler,
        draggable: draggable.value,
        sortableHandle,
        onClose,
    });
};

const renderSortTag = (props: RenderItemProps): VNode => {
    const { id: item, sortableHandle } = props;
    const index = tagsArray.value.indexOf(item as string);
    return renderTag(item as string, index, sortableHandle);
};

const SortContainer = (props: any) => {
    return h('div', {
        class: `${prefixCls}-sortable-list`,
        style: { flexWrap: 'nowrap', overflow: 'hidden' },
        ...props,
    });
};

const handleInput = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const value = target.value;
    const previousValue = state.value.inputValue;

    if (isNumber(props.maxLength)) {
        const valueArr = getSplitedArray(value, props.separator);
        const inputArr = getSplitedArray(previousValue, props.separator);
        const maxLen = Math.max(valueArr.length, inputArr.length);

        for (let i = 0; i < maxLen; i++) {
            if (!isUndefined(valueArr[i]) && valueArr[i].length > props.maxLength) {
                const inputElement = getInputElement();
                if (inputElement) {
                    inputElement.value = previousValue;
                }
                if (isFunction(props.onInputExceed)) {
                    props.onInputExceed(value);
                }
                return;
            }
        }
    }

    const inputEvent = {
        ...e,
        target: {
            ...target,
            value: value,
        },
    } as any;

    foundation.handleInputChange(inputEvent);

    nextTick(() => {
        const inputElement = getInputElement();
        if (inputElement) {
            if (state.value.inputValue === previousValue && inputElement.value !== previousValue) {
                inputElement.value = previousValue;
            } else if (inputElement.value !== state.value.inputValue) {
                inputElement.value = state.value.inputValue;
            }
        }
    });
};

const handleInputChange = (value: string, e: Event) => {
    state.value.inputValue = value;
    const inputEvent = {
        ...e,
        target: {
            ...(e.target as any),
            value: value,
        },
    } as any;
    foundation.handleInputChange(inputEvent);
};

const handleKeyDown = (e: KeyboardEvent) => {
    const normalizedEvent = normalizeKeyboardEvent(e);

    const target = e.target as HTMLInputElement;
    if (target && target.tagName === 'INPUT') {
        state.value.inputValue = target.value;
    }

    if (isEnterPressed(normalizedEvent)) {
        normalizedEvent.preventDefault();
    }

    foundation.handleKeyDown(normalizedEvent);
};

const handleInputFocus = (e: FocusEvent) => {
    foundation.handleInputFocus(e);
};

const handleInputBlur = (e: FocusEvent) => {
    foundation.handleInputBlur(e);
};

const handleInputCompositionStart = (e: CompositionEvent) => {
    foundation.handleInputCompositionStart(e as any);
};

const handleInputCompositionEnd = (e: CompositionEvent) => {
    foundation.handleInputCompositionEnd(e as any);
};

const handleClearBtn = (e: MouseEvent) => {
    foundation.handleClearBtn(e as any);
};

const handleClearEnterPress = (e: KeyboardEvent) => {
    foundation.handleClearEnterPress(e as any);
};

const handleInputMouseEnter = () => {
    foundation.handleInputMouseEnter();
};

const handleInputMouseLeave = () => {
    foundation.handleInputMouseLeave();
};

const handleClick = (e?: MouseEvent) => {
    foundation.handleClick(e as any);
};

const handleClickPrefixOrSuffix = (e: MouseEvent) => {
    foundation.handleClickPrefixOrSuffix(e as any);
};

const handlePreventMouseDown = (e: MouseEvent) => {
    foundation.handlePreventMouseDown(e as any);
};

const onSortEnd = (callbackProps: OnSortEndProps) => {
    foundation.handleSortEnd(callbackProps);
};

const blur = () => {
    inputRef.value?.blur();
    foundation.clickOutsideCallBack();
};

const focus = () => {
    inputRef.value?.focus();
    if (!props.disabled) {
        foundation.handleClick();
    }
};

onMounted(() => {
    nextTick(() => {
        if (!props.disabled && props.autoFocus) {
            focus();
        }
        foundation.init();
    });
});

defineExpose({
    blur,
    focus,
});
</script>

<style scoped>
/* 修复拖拽时 tags 换行的问题 */
:deep(.semi-tagInput-container) {
    display: flex !important;
    flex-wrap: nowrap !important;
    overflow: hidden !important;
}
</style>
