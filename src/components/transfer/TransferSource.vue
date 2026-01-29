<template>
    <template v-if="slots[SLOT_NAMES.SOURCE_PANEL]">
        <RenderVNodes :vnodes="slots[SLOT_NAMES.SOURCE_PANEL](sourcePanelProps)" />
    </template>
    <component :is="transferProps.renderSourcePanel(sourcePanelProps)" v-else-if="transferProps.renderSourcePanel" />
    <section v-else :class="`${prefixCls}-left`">
        <div v-if="shouldShowFilter" role="search" aria-label="Transfer filter" :class="`${prefixCls}-filter`">
            <Input
                :prefix="iconSearch"
                :placeholder="locale.placeholder"
                showClear
                :value="inputValue"
                :disabled="disabled"
                v-bind="inputProps"
                @input="handleInput"
                @clear="handleClear"
            />
        </div>

        <TransferHeader
            :headerConfig="headerConfig"
            :disabled="disabled"
            :renderSourceHeader="transferProps.renderSourceHeader"
        >
            <template v-if="slots[SLOT_NAMES.SOURCE_HEADER]" #default="slotProps">
                <RenderVNodes :vnodes="slots[SLOT_NAMES.SOURCE_HEADER](slotProps)" />
            </template>
        </TransferHeader>

        <Spin v-if="loading" />
        <div v-else-if="noMatch" aria-label="empty" :class="cls(`${prefixCls}-empty`, `${prefixCls}-left-empty`)">
            {{ emptySearch }}
        </div>
        <div
            v-else-if="data.length === 0"
            aria-label="empty"
            :class="cls(`${prefixCls}-empty`, `${prefixCls}-left-empty`)"
        >
            {{ emptyLeft }}
        </div>

        <template v-else-if="type === strings.TYPE_TREE_TO_LIST">
            <Tree
                :key="`tree-${treeValues.join(',')}`"
                :ref="setTreeRef"
                :disabled="disabled"
                :treeData="dataSource as any"
                multiple
                disableStrictly
                :value="treeValues"
                defaultExpandAll
                leafOnly
                filterTreeNode
                :searchRender="false"
                :searchStyle="{ padding: 0 }"
                :style="{ flex: 1, overflow: 'overlay' }"
                v-bind="restTreeProps"
                @change="handleTreeChange"
            />
        </template>

        <div v-else :class="`${prefixCls}-left-list`" role="list" aria-label="Option list">
            <template v-for="(item, index) in visibleItems" :key="item.key || index">
                <div v-if="shouldRenderGroupTitle(item, index)" :class="`${prefixCls}-group-title`">
                    {{ item._parent?.title }}
                </div>

                <component :is="renderSourceItem(item)" v-if="slots[SLOT_NAMES.SOURCE_ITEM]" />
                <component :is="renderSourceItem(item)" v-else-if="transferProps.renderSourceItem" />
                <Checkbox
                    v-else
                    :disabled="item.disabled || disabled"
                    :class="cls(`${prefixCls}-item`, { [`${prefixCls}-item-disabled`]: item.disabled })"
                    :checked="selectedItems.has(item.key)"
                    role="listitem"
                    @change="methods.handleSelectOrRemove(item)"
                >
                    {{ item.label }}
                </Checkbox>
            </template>
        </div>
    </section>
</template>

<script setup lang="ts">
import { inject, computed, h, VNode, Fragment, defineComponent } from 'vue';
import cls from 'classnames';
import { omit } from 'lodash-es';
import { cssClasses, strings } from '@douyinfe/semi-foundation/transfer/constants';
import { IconSearch } from '../icons';
import Input from '../input/Input.vue';
import Spin from '../spin/Spin.vue';
import Checkbox from '../checkbox/Checkbox.vue';
import Tree from '../tree/Tree.vue';
import TransferHeader from './TransferHeader.vue';
import { TransferContextKey, SLOT_NAMES, ResolvedDataItem, HeaderConfig, SourcePanelProps } from './interface';

defineOptions({
    name: 'TransferSource',
});

const props = defineProps<{
    locale: any;
}>();

const context = inject(TransferContextKey);

if (!context) {
    throw new Error('TransferSource must be used within Transfer');
}

const { state, transferProps, foundation, methods, slots } = context;
const prefixCls = cssClasses.PREFIX;

const loading = computed(() => transferProps.loading);
const type = computed(() => transferProps.type);
const disabled = computed(() => transferProps.disabled);
const dataSource = computed(() => transferProps.dataSource);
const inputProps = computed(() => transferProps.inputProps);
const filter = computed(() => transferProps.filter);
const inputValue = computed(() => state.value.inputValue);
const searchResult = computed(() => state.value.searchResult);
const data = computed(() => state.value.data);
const selectedItems = computed(() => state.value.selectedItems);

const inSearchMode = computed(() => inputValue.value !== '');
const showNumber = computed(() => (inSearchMode.value ? searchResult.value.size : data.value.length));
const filterData = computed(() =>
    inSearchMode.value ? data.value.filter((item) => searchResult.value.has(item.key)) : data.value
);

const noMatch = computed(() => inSearchMode.value && searchResult.value.size === 0);
const emptySearch = computed(() => transferProps.emptyContent?.search ?? props.locale.emptySearch);
const emptyLeft = computed(() => transferProps.emptyContent?.left ?? props.locale.emptyLeft);

const shouldShowFilter = computed(() => {
    if (typeof filter.value === 'boolean') {
        return filter.value;
    }
    return true;
});

const iconSearch = h(IconSearch);

const filterDataAllDisabled = computed(() => {
    let allDisabled = true;
    for (const item of filterData.value) {
        if (!item.disabled) {
            allDisabled = false;
            break;
        }
    }
    return allDisabled;
});

const leftContainsNotInSelected = computed(() => {
    return Boolean(
        filterData.value.find((f) => {
            if (f.disabled) return false;
            return !selectedItems.value.has(f.key);
        })
    );
});

const totalText = computed(() => props.locale.total.replace('${total}', `${showNumber.value}`));

const headerConfig = computed<HeaderConfig>(() => ({
    totalContent: totalText.value,
    allContent: leftContainsNotInSelected.value ? props.locale.selectAll : props.locale.clearSelectAll,
    onAllClick: () => foundation.handleAll(leftContainsNotInSelected.value),
    type: 'left',
    showButton: type.value !== strings.TYPE_TREE_TO_LIST && !filterDataAllDisabled.value,
    num: showNumber.value,
    allChecked: !leftContainsNotInSelected.value,
}));

const treeValues = computed(() => {
    const { values } = foundation.getValuesAndItemsFromMap(selectedItems.value);
    return [...values];
});
const restTreeProps = computed(() => omit(transferProps.treeProps, ['value', 'ref', 'onChange']));

const handleTreeChange = (value: any) => {
    const valueArray = Array.isArray(value) ? value : value ? [value] : [];
    // 过滤掉 data 中不存在的值，避免 foundation 层处理 undefined node
    const validValues = valueArray.filter((val: any) => {
        return data.value.some((item: ResolvedDataItem) => item.value === val);
    });
    foundation.handleSelect(validValues);
};

const setTreeRef = (el: any) => {
    if (context.treeRef) {
        context.treeRef.value = el;
    }
};

const visibleItems = computed(() => filterData.value);

const shouldRenderGroupTitle = (item: ResolvedDataItem, index: number) => {
    const parentGroup = item._parent;
    if (!parentGroup) return false;

    if (index === 0) return true;
    const prevItem = visibleItems.value[index - 1];
    return prevItem._parent?.title !== parentGroup.title;
};

const handleInput = (e: Event) => {
    methods.handleInputChange((e.target as HTMLInputElement).value);
};

const handleClear = () => {
    methods.handleInputChange('');
};

const renderSourceItem = (item: ResolvedDataItem): VNode => {
    const itemProps = {
        ...item,
        checked: selectedItems.value.has(item.key),
        onChange: () => methods.handleSelectOrRemove(item),
    };

    if (slots[SLOT_NAMES.SOURCE_ITEM]) {
        const slotResult = slots[SLOT_NAMES.SOURCE_ITEM](itemProps);
        // 如果插槽返回的是数组或 Fragment，需要包装在一个 div 中
        if (Array.isArray(slotResult)) {
            return h('div', { key: item.key }, slotResult);
        }
        // 如果返回的是 Fragment，也需要包装
        if (slotResult && typeof slotResult === 'object' && slotResult.type === Fragment) {
            return h('div', { key: item.key }, slotResult);
        }
        return slotResult;
    }

    if (transferProps.renderSourceItem) {
        const renderResult = transferProps.renderSourceItem(itemProps);
        // 同样处理 render 函数返回的结果
        if (Array.isArray(renderResult)) {
            return h('div', { key: item.key }, renderResult);
        }
        if (renderResult && typeof renderResult === 'object' && renderResult.type === Fragment) {
            return h('div', { key: item.key }, renderResult);
        }
        return renderResult;
    }

    // 默认渲染（不应该到达这里，因为模板中有 else 分支）
    return h('div', { key: item.key });
};

const RenderVNodes = defineComponent({
    props: {
        vnodes: {
            type: Array as () => VNode[],
            required: true,
        },
    },
    setup(props) {
        return () => props.vnodes;
    },
});

const sourcePanelProps = computed<SourcePanelProps>(() => {
    const { values } = foundation.getValuesAndItemsFromMap(selectedItems.value);
    return {
        loading: loading.value,
        noMatch: noMatch.value,
        filterData: filterData.value,
        sourceData: data.value,
        propsDataSource: dataSource.value,
        allChecked: !leftContainsNotInSelected.value,
        showNumber: showNumber.value,
        inputValue: inputValue.value,
        selectedItems: selectedItems.value,
        value: values,
        onSelect: foundation.handleSelect.bind(foundation),
        onAllClick: () => foundation.handleAll(leftContainsNotInSelected.value),
        onSearch: methods.handleInputChange,
        onSelectOrRemove: (item: ResolvedDataItem) => methods.handleSelectOrRemove(item),
    };
});
</script>
