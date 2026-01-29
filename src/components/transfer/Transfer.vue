<template>
    <LocaleConsumer component-name="Transfer">
        <template #default="{ locale }">
            <div :class="transferCls" :style="props.style" v-bind="attrs">
                <TransferSource :locale="locale" />
                <TransferSelected :locale="locale" />
            </div>
        </template>
    </LocaleConsumer>
</template>

<script setup lang="ts">
import { ref, computed, watch, provide, useSlots, useAttrs } from 'vue';
import cls from 'classnames';
import { noop } from 'lodash-es';
import TransferFoundation, { TransferAdapter } from '@douyinfe/semi-foundation/transfer/foundation';
import { _generateDataByType, _generateSelectedItems } from '@douyinfe/semi-foundation/transfer/transferUtils';
import { cssClasses, strings } from '@douyinfe/semi-foundation/transfer/constants';
import { useFoundation } from '../_utils';
import LocaleConsumer from '../locale/LocaleConsumer.vue';
import TransferSource from './TransferSource.vue';
import TransferSelected from './TransferSelected.vue';
import {
    TransferProps,
    TransferState,
    ResolvedDataItem,
    SourcePanelProps,
    SelectedPanelProps,
    SourceHeaderProps,
    SelectedHeaderProps,
    Type,
    RenderSourceItemProps,
    RenderSelectedItemProps,
    SLOT_NAMES,
    TransferContextKey,
    TransferContext,
} from './interface';

defineOptions({
    name: 'Transfer',
});

const prefixCls = cssClasses.PREFIX;

const props = withDefaults(defineProps<TransferProps>(), {
    type: strings.TYPE_LIST as Type,
    dataSource: () => [],
    filter: true,
    onSearch: noop,
    onChange: noop,
    onSelect: noop,
    onDeselect: noop,
    defaultValue: () => [],
    emptyContent: () => ({}),
    showPath: false,
});

const emit = defineEmits<{
    change: [values: Array<string | number>, items: Array<any>];
    select: [item: any];
    deselect: [item: any];
    search: [sunInput: string];
}>();

const treeRef = ref<any>(null);

const state = ref<TransferState>({
    data: [],
    selectedItems: new Map(),
    searchResult: new Set(),
    inputValue: '',
});

const isDefaultValueInitialized = ref(false);

const initializeDefaultValue = (data: Array<ResolvedDataItem>) => {
    if (props.value === undefined && data.length > 0) {
        if (Boolean(props.defaultValue) && Array.isArray(props.defaultValue) && props.defaultValue.length > 0) {
            const newSelectedItems = _generateSelectedItems(props.defaultValue, data);
            state.value.selectedItems = newSelectedItems;
            if (!isDefaultValueInitialized.value) {
                isDefaultValueInitialized.value = true;
            }
        } else if (!isDefaultValueInitialized.value) {
            isDefaultValueInitialized.value = true;
        }
    }
};

watch(
    [() => props.dataSource, () => props.type],
    ([newDataSource, newType]) => {
        if (Boolean(newDataSource) && Array.isArray(newDataSource)) {
            const newData = _generateDataByType(newDataSource, newType || props.type);
            state.value.data = newData;
            if (props.value !== undefined) {
                if (Array.isArray(props.value)) {
                    const newSelectedItems = _generateSelectedItems(props.value, newData);
                    state.value.selectedItems = newSelectedItems;
                } else {
                    state.value.selectedItems = new Map();
                }
            } else {
                initializeDefaultValue(newData);
            }
        } else {
            state.value.data = [];
        }
    },
    { immediate: true }
);

watch(
    () => props.value,
    (newValue) => {
        if (props.value !== undefined) {
            if (Array.isArray(newValue) && state.value.data.length > 0) {
                const newSelectedItems = _generateSelectedItems(newValue, state.value.data);
                state.value.selectedItems = newSelectedItems;
            } else {
                state.value.selectedItems = new Map();
            }
        }
    },
    { immediate: true, flush: 'post' }
);

watch(
    [() => state.value.data, () => state.value.inputValue, () => props.filter],
    ([newData, inputValue, filter]) => {
        if (typeof inputValue === 'string' && inputValue !== '') {
            const filterFunc =
                typeof filter === 'function'
                    ? (item: any) => filter(inputValue, item)
                    : (item: any) => typeof item.label === 'string' && item.label.includes(inputValue);
            const searchData = newData.filter(filterFunc);
            const searchResult = new Set(searchData.map((item: any) => item.key));
            state.value.searchResult = searchResult;
        } else if (inputValue === '') {
            state.value.searchResult = new Set();
        }
    },
    { immediate: true }
);

const adapter: TransferAdapter<TransferProps, TransferState> = {
    getProps: () => props,
    getProp: (key: string) => (props as any)[key],
    getState: (key: string) => (state.value as any)[key],
    getStates: () => state.value,
    setState: (states: Partial<TransferState>, cb?: () => void) => {
        Object.assign(state.value, states);
        cb?.();
    },
    getContext: () => null,
    getContexts: () => ({}),
    getCache: () => null,
    getCaches: () => ({}),
    setCache: () => {},
    stopPropagation: (e: Event) => e?.stopPropagation(),
    persistEvent: () => {},
    getSelected: () => new Map(state.value.selectedItems),
    updateSelected: (selectedItems) => {
        state.value.selectedItems = new Map(selectedItems);
    },
    notifyChange: (values, items) => {
        emit('change', values, items);
        props.onChange?.(values, items);
    },
    notifySearch: (input) => {
        emit('search', input);
        props.onSearch?.(input);
    },
    notifySelect: (item) => {
        emit('select', item);
        props.onSelect?.(item);
    },
    notifyDeselect: (item) => {
        emit('deselect', item);
        props.onDeselect?.(item);
    },
    updateInput: (input) => {
        state.value.inputValue = input;
    },
    updateSearchResult: (searchResult) => {
        state.value.searchResult = searchResult;
    },
    searchTree: (keyword) => {
        if (treeRef.value && treeRef.value.search) {
            treeRef.value.search(keyword);
        }
    },
};

class VueTransferFoundation extends TransferFoundation {
    _isControlledComponent(key: string = 'value') {
        const props = this.getProps();
        const value = (props as any)[key];
        return value !== undefined;
    }
}

const { foundation } = useFoundation(VueTransferFoundation, adapter);

const handleInputChange = (value: string) => {
    foundation.handleInputChange(value, true);
};

const search = (value: string) => {
    foundation.handleInputChange(value, false);
};

const handleSelectOrRemove = (item: ResolvedDataItem) => {
    foundation.handleSelectOrRemove(item);
};

const handleSortEnd = (callbackProps: { oldIndex: number; newIndex: number }) => {
    foundation.handleSortEnd(callbackProps);
};

const transferCls = computed(() => {
    return cls(prefixCls, props.className, {
        [`${prefixCls}-disabled`]: props.disabled,
        [`${prefixCls}-custom-panel`]: props.renderSelectedPanel && props.renderSourcePanel,
    });
});

const attrs = useAttrs();
const slots = useSlots();

defineSlots<{
    [SLOT_NAMES.SOURCE_ITEM]: (props: RenderSourceItemProps) => any;
    [SLOT_NAMES.SELECTED_ITEM]: (props: RenderSelectedItemProps) => any;
    [SLOT_NAMES.SOURCE_PANEL]: (props: SourcePanelProps) => any;
    [SLOT_NAMES.SELECTED_PANEL]: (props: SelectedPanelProps) => any;
    [SLOT_NAMES.SOURCE_HEADER]: (props: SourceHeaderProps) => any;
    [SLOT_NAMES.SELECTED_HEADER]: (props: SelectedHeaderProps) => any;
}>();

const transferContext: TransferContext = {
    state,
    transferProps: props,
    foundation,
    methods: {
        handleInputChange,
        handleSelectOrRemove,
        handleSortEnd,
    },
    treeRef,
    slots,
};

provide(TransferContextKey, transferContext);

defineExpose({
    search,
    treeRef,
});
</script>
