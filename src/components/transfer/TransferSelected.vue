<template>
    <template v-if="slots[SLOT_NAMES.SELECTED_PANEL]">
        <RenderVNodes :vnodes="slots[SLOT_NAMES.SELECTED_PANEL](selectedPanelProps)" />
    </template>
    <component
        :is="transferProps.renderSelectedPanel(selectedPanelProps)"
        v-else-if="transferProps.renderSelectedPanel"
    />
    <section v-else :class="`${prefixCls}-right`">
        <TransferHeader
            :headerConfig="headerConfig"
            :disabled="disabled"
            :renderSelectedHeader="transferProps.renderSelectedHeader"
        >
            <template v-if="slots[SLOT_NAMES.SELECTED_HEADER]" #default="slotProps">
                <RenderVNodes :vnodes="slots[SLOT_NAMES.SELECTED_HEADER](slotProps)" />
            </template>
        </TransferHeader>

        <div
            v-if="selectedData.length === 0"
            aria-label="empty"
            :class="cls(`${prefixCls}-empty`, `${prefixCls}-right-empty`)"
        >
            {{ emptyRight }}
        </div>

        <Sortable
            v-else-if="draggable"
            :items="sortItems"
            :renderItem="renderSortItemWrapper"
            :prefix="`${prefixCls}-right-item`"
            :dragOverlayCls="`${prefixCls}-right-item-drag-item-move`"
            :handle="`.${prefixCls}-right-item-handle`"
            @sort-end="methods.handleSortEnd"
        />

        <div v-else :class="`${prefixCls}-right-list`" role="list" aria-label="Selected list">
            <template v-for="item in selectedData" :key="item.key">
                <component :is="renderRightItem(item)" />
            </template>
        </div>
    </section>
</template>

<script setup lang="ts">
import { inject, computed, h, VNode, Fragment, defineComponent } from 'vue';
import cls from 'classnames';
import { cssClasses, strings } from '@douyinfe/semi-foundation/transfer/constants';
import { IconClose, IconHandle } from '../icons';
import { Sortable, type RenderItemProps } from '../_sortable';
import TransferHeader from './TransferHeader.vue';
import { TransferContextKey, SLOT_NAMES, ResolvedDataItem, HeaderConfig, SelectedPanelProps } from './interface';

defineOptions({
    name: 'TransferSelected',
});

const props = defineProps<{
    locale: any;
}>();

const context = inject(TransferContextKey);

if (!context) {
    throw new Error('TransferSelected must be used within Transfer');
}

const { state, transferProps, foundation, methods, slots } = context;
const prefixCls = cssClasses.PREFIX;

const selectedItems = computed(() => state.value.selectedItems);
const selectedData = computed(() => [...selectedItems.value.values()]);
const sortItems = computed(() => selectedData.value.map((item) => item.key));

const disabled = computed(() => transferProps.disabled);
const draggable = computed(() => transferProps.draggable);
const type = computed(() => transferProps.type);
const showPath = computed(() => transferProps.showPath);
const emptyContent = computed(() => transferProps.emptyContent);

const emptyRight = computed(() => emptyContent.value?.right ?? props.locale.emptyRight);

const selectedToken = computed(() => props.locale.selected);
const selectedText = computed(() => selectedToken.value.replace('${total}', `${selectedData.value.length}`));
const hasValidSelected = computed(() => selectedData.value.findIndex((item) => !item.disabled) !== -1);

const headerConfig = computed<HeaderConfig>(() => ({
    totalContent: selectedText.value,
    allContent: props.locale.clear,
    onAllClick: () => foundation.handleClear(),
    type: 'right',
    showButton: Boolean(selectedData.value.length) && hasValidSelected.value,
    num: selectedData.value.length,
}));

const renderRightItem = (item: ResolvedDataItem, sortableHandle?: any): VNode => {
    const onRemove = () => methods.handleSelectOrRemove(item);
    const itemProps = { ...item, onRemove, sortableHandle };

    if (slots[SLOT_NAMES.SELECTED_ITEM]) {
        const slotResult = slots[SLOT_NAMES.SELECTED_ITEM](itemProps);
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

    if (transferProps.renderSelectedItem) {
        const renderResult = transferProps.renderSelectedItem(itemProps);
        // 同样处理 render 函数返回的结果
        if (Array.isArray(renderResult)) {
            return h('div', { key: item.key }, renderResult);
        }
        if (renderResult && typeof renderResult === 'object' && renderResult.type === Fragment) {
            return h('div', { key: item.key }, renderResult);
        }
        return renderResult;
    }

    const rightItemCls = cls({
        [`${prefixCls}-item`]: true,
        [`${prefixCls}-right-item`]: true,
        [`${prefixCls}-right-item-draggable`]: draggable.value,
    });

    const shouldShowPath = type.value === strings.TYPE_TREE_TO_LIST && showPath.value === true;
    const label = shouldShowPath ? foundation._generatePath(item) : item.label;

    const DragHandle = sortableHandle
        ? sortableHandle(() =>
              h(IconHandle, {
                  role: 'button',
                  'aria-label': 'Drag and sort',
                  class: `${prefixCls}-right-item-drag-handler`,
              })
          )
        : null;

    return h(
        'div',
        {
            role: 'listitem',
            class: rightItemCls,
            key: item.key,
        },
        [
            draggable.value && sortableHandle ? h(DragHandle) : null,
            h('div', { class: `${prefixCls}-right-item-text` }, label),
            h(IconClose, {
                onClick: onRemove,
                'aria-disabled': item.disabled,
                class: cls(`${prefixCls}-item-close-icon`, {
                    [`${prefixCls}-item-close-icon-disabled`]: item.disabled,
                }),
            }),
        ]
    );
};

const renderSortItemWrapper = (props: RenderItemProps): VNode => {
    const { id, sortableHandle } = props;
    const item = selectedData.value.find((item) => item.key === id);
    if (!item) {
        // 返回一个空的 div 而不是 null，避免 component :is 错误
        return h('div', { style: { display: 'none' } });
    }
    const result = renderRightItem(item, sortableHandle);
    // 确保返回的是单个 VNode，而不是数组
    if (Array.isArray(result)) {
        return h('div', { key: item.key }, result);
    }
    return result;
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

const selectedPanelProps = computed<SelectedPanelProps>(() => ({
    length: selectedData.value.length,
    selectedData: selectedData.value,
    onClear: () => foundation.handleClear(),
    onRemove: (item: ResolvedDataItem) => methods.handleSelectOrRemove(item),
    onSortEnd: (props: { oldIndex: number; newIndex: number }) => methods.handleSortEnd(props),
}));
</script>
