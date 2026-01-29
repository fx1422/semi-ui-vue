<template>
    <div :class="listsCls">
        <template v-if="isEmpty">
            <ul :class="[`${prefixCls}`, `${prefixCls}-empty`]">
                <span :class="`${prefixCls}-label`" x-semi-prop="emptyContent">
                    {{ emptyContent || '暂无数据' }}
                </span>
            </ul>
        </template>
        <template v-else>
            <template v-if="searchable">
                <ul :class="`${prefixCls}-list`">
                    <template v-if="filterRender">
                        <template v-for="item in data as Data[]" :key="item.key">
                            <component :is="getFilterRenderContent(item)" />
                        </template>
                    </template>
                    <template v-else-if="virtualize">
                        <div
                            ref="virtualListRef"
                            :class="`${prefixCls}-virtual-list`"
                            :style="virtualListStyle"
                            @scroll="handleVirtualScroll"
                        >
                            <div :style="virtualInnerStyle">
                                <ul :class="`${prefixCls}-list`" :style="virtualContentStyle">
                                    <li
                                        v-for="index in virtualVisibleIndices"
                                        :key="(data as Data[])[index]?.key || index"
                                        :class="getFlattenItemCls((data as Data[])[index])"
                                        role="menuitem"
                                        :style="{ height: `${virtualItemSize}px` }"
                                        @click="(e) => handleItemClick(e, (data as Data[])[index])"
                                        @keypress="(e) => handleItemEnterPress(e, (data as Data[])[index])"
                                    >
                                        <span :class="`${prefixCls}-label`">
                                            <template v-if="!multiple">
                                                <span
                                                    :class="`${prefixCls}-icon ${prefixCls}-icon-empty`"
                                                    aria-hidden="true"
                                                ></span>
                                            </template>
                                            <template v-else>
                                                <Checkbox
                                                    :checked="localCheckedKeys.has((data as Data[])[index]?.key)"
                                                    :indeterminate="
                                                        localHalfCheckedKeys.has((data as Data[])[index]?.key)
                                                    "
                                                    :disabled="(data as Data[])[index]?.disabled"
                                                    :class="`${prefixCls}-label-checkbox`"
                                                    @change="(e) => handleCheckboxChange(e, (data as Data[])[index])"
                                                />
                                            </template>
                                            <span v-html="highlightText((data as Data[])[index]?.searchText)"></span>
                                        </span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </template>
                    <template v-else>
                        <li
                            v-for="item in data as Data[]"
                            :key="item.key"
                            :class="getFlattenItemCls(item)"
                            role="menuitem"
                            @click="(e) => handleItemClick(e, item)"
                            @keypress="(e) => handleItemEnterPress(e, item)"
                        >
                            <span :class="`${prefixCls}-label`">
                                <template v-if="!multiple">
                                    <span
                                        :class="`${prefixCls}-icon ${prefixCls}-icon-empty`"
                                        aria-hidden="true"
                                    ></span>
                                </template>
                                <template v-else>
                                    <Checkbox
                                        :checked="localCheckedKeys.has(item.key)"
                                        :indeterminate="localHalfCheckedKeys.has(item.key)"
                                        :disabled="item.disabled"
                                        :class="`${prefixCls}-label-checkbox`"
                                        @change="(e) => handleCheckboxChange(e, item)"
                                    />
                                </template>
                                <span v-html="highlightText(item.searchText)"></span>
                            </span>
                        </li>
                    </template>
                </ul>
            </template>
            <template v-else>
                <CascaderPanel
                    :data="data as Entity[]"
                    :active-keys="activeKeys"
                    :selected-keys="selectedKeys"
                    :checked-keys="checkedKeys"
                    :half-checked-keys="halfCheckedKeys"
                    :loaded-keys="loadedKeys"
                    :loading-keys="loadingKeys"
                    :multiple="multiple"
                    :show-next="showNext"
                    :expand-icon="expandIcon"
                    :load-data="loadData"
                    :on-item-click="onItemClick"
                    :on-item-hover="onItemHover"
                    :on-item-checkbox-click="onItemCheckboxClick"
                    :on-list-scroll="onListScroll"
                    :panel-index="0"
                />
            </template>
        </template>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { CSSProperties } from 'vue';
import classNames from 'classnames';
import { cssClasses } from '@douyinfe/semi-foundation/cascader/constants';
import Checkbox from '../checkbox';
import isEnterPress from '@douyinfe/semi-foundation/utils/isEnterPress';
import { includes } from 'lodash-es';
import { useConfigContext } from '../configProvider/context';
import type { Entity, Data, CascaderItemProps, FilterRenderProps } from './interface';
import CascaderPanel from './CascaderPanel.vue';

defineOptions({
    name: 'CascaderItem',
});

const prefixCls = cssClasses.PREFIX_OPTION;

const props = defineProps<CascaderItemProps>();
const emit = defineEmits<{
    mouseDownInDropdown: [];
}>();

const isEmpty = computed(() => !props.data || props.data.length === 0);

const configContext = useConfigContext();
const direction = computed(() => {
    const dir = configContext.direction;
    return typeof dir === 'string' ? dir : dir?.value || 'ltr';
});

const localCheckedKeys = ref<Set<string>>(new Set());
const localHalfCheckedKeys = ref<Set<string>>(new Set());

watch(
    () => [props.checkedKeys, props.halfCheckedKeys],
    ([newKeys, newHalfKeys]) => {
        localCheckedKeys.value = new Set(newKeys as Set<string>);
        localHalfCheckedKeys.value = new Set(newHalfKeys as Set<string>);
    },
    { deep: true, immediate: true }
);

const listsCls = computed(() => {
    return classNames({
        [`${prefixCls}-lists`]: true,
        [`${prefixCls}-lists-rtl`]: direction.value === 'rtl',
        [`${prefixCls}-lists-empty`]: isEmpty.value,
    });
});

const getFlattenItemCls = (item: Data) => {
    const selected = props.selectedKeys.has(item.key);
    return classNames(prefixCls, {
        [`${prefixCls}-flatten`]: true,
        [`${prefixCls}-disabled`]: item.disabled,
        [`${prefixCls}-select`]: selected && !props.multiple,
    });
};

const handleItemClick = (e: MouseEvent | KeyboardEvent, item: Entity | Data) => {
    if (item.data.disabled || ('disabled' in item && item.disabled)) {
        return;
    }
    props.onItemClick(e, item);
};

const handleItemEnterPress = (e: KeyboardEvent, item: Entity | Data) => {
    if (isEnterPress(e)) {
        handleItemClick(e, item);
    }
};

const handleCheckboxChange = (e: any, item: Entity | Data) => {
    e.stopPropagation();
    if (e.nativeEvent && typeof e.nativeEvent.stopImmediatePropagation === 'function') {
        e.nativeEvent.stopImmediatePropagation();
    }
    props.onItemCheckboxClick(item);
};

const handleCheckboxMouseDown = (e: MouseEvent) => {
    e.stopPropagation();
    emit('mouseDownInDropdown');
};

const highlightText = (searchText: any[]) => {
    if (!props.keyword || !searchText) {
        return searchText.map((item) => (typeof item === 'string' ? item : String(item))).join('');
    }
    const content: string[] = [];
    searchText.forEach((item, idx) => {
        const itemStr = typeof item === 'string' ? item : String(item);
        if (includes(itemStr, props.keyword)) {
            const parts = itemStr.split(props.keyword);
            parts.forEach((part, index) => {
                if (index > 0) {
                    content.push(`<span class="${prefixCls}-label-highlight">${props.keyword}</span>`);
                }
                content.push(part);
            });
        } else {
            content.push(itemStr);
        }
        if (idx !== searchText.length - 1) {
            content.push(props.separator);
        }
    });
    return content.join('');
};

const virtualListRef = ref<HTMLDivElement>();
const virtualScrollTop = ref(0);

const virtualItemSize = computed(() => {
    return props.virtualize?.itemSize || 32;
});

const virtualHeight = computed(() => {
    if (typeof props.virtualize?.height === 'string') {
        return virtualListRef.value?.offsetHeight || 300;
    }
    return props.virtualize?.height || 300;
});

const virtualWidth = computed(() => {
    return props.virtualize?.width || '100%';
});

const totalVirtualHeight = computed(() => {
    const dataArray = props.data as Data[];
    return dataArray.length * virtualItemSize.value;
});

const virtualVisibleCount = computed(() => {
    return Math.ceil(virtualHeight.value / virtualItemSize.value) + 2;
});

const virtualStartIndex = computed(() => {
    const startIndex = Math.floor(virtualScrollTop.value / virtualItemSize.value);
    return Math.max(0, startIndex - 1);
});

const virtualEndIndex = computed(() => {
    const dataArray = props.data as Data[];
    return Math.min(dataArray.length, virtualStartIndex.value + virtualVisibleCount.value);
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

const virtualListStyle = computed<CSSProperties>(() => {
    const heightStyle =
        typeof props.virtualize?.height === 'string' ? props.virtualize.height : `${virtualHeight.value}px`;
    const widthStyle = typeof virtualWidth.value === 'string' ? virtualWidth.value : `${virtualWidth.value}px`;
    return {
        height: heightStyle,
        width: widthStyle,
        overflow: 'auto',
        position: 'relative',
    };
});

const virtualInnerStyle = computed<CSSProperties>(() => {
    return {
        height: `${totalVirtualHeight.value}px`,
        position: 'relative',
    };
});

const virtualContentStyle = computed<CSSProperties>(() => {
    return {
        transform: `translateY(${virtualOffsetY.value}px)`,
    };
});

const handleVirtualScroll = (event: Event) => {
    const target = event.target as HTMLElement;
    virtualScrollTop.value = target.scrollTop;
};

const getFilterRenderContent = (item: Data) => {
    if (!props.filterRender) {
        return null;
    }
    const selected = props.selectedKeys.has(item.key);
    const className = classNames(prefixCls, {
        [`${prefixCls}-flatten`]: true,
        [`${prefixCls}-disabled`]: item.disabled,
        [`${prefixCls}-select`]: selected && !props.multiple,
    });
    const filterProps: FilterRenderProps = {
        className,
        inputValue: props.keyword,
        disabled: item.disabled,
        data: item.pathData || [],
        checkStatus: {
            checked: props.checkedKeys.has(item.key),
            halfChecked: props.halfCheckedKeys.has(item.key),
        },
        selected,
        onClick: (e: MouseEvent) => handleItemClick(e, item),
        onCheck: (e: MouseEvent) => handleCheckboxChange(e, item),
    };
    return props.filterRender(filterProps);
};
</script>
