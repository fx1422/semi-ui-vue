<template>
    <Dropdown
        :visible="mergedVisible"
        :trigger="trigger"
        :position="position"
        :class="`${prefixCls}-column-filter-dropdown`"
        :render="renderDropdownContent"
        v-bind="filterDropdownProps"
        @visible-change="handleFilterDropdownVisibleChange"
    >
        <div v-if="!customFilterIcon" :class="filterIconCls">
            <span>&#8203;</span>
            <IconFilter
                role="button"
                aria-label="Filter data with this column"
                aria-haspopup="listbox"
                tabindex="-1"
                size="default"
            />
        </div>
        <component :is="customFilterIcon" v-else />
    </Dropdown>
</template>

<script setup lang="ts">
import { ref, computed, watch, h, isVNode, nextTick } from 'vue';
import { isEqual } from 'lodash-es';
import classnames from 'classnames';
import { cssClasses } from '@douyinfe/semi-foundation/table/constants';
import Dropdown, { DropdownMenu, DropdownItem } from '../dropdown';
import Checkbox from '../checkbox';
import Radio from '../radio';
import { IconFilter } from '../icons';
import type { Filter, FilterIcon, OnFilterDropdownVisibleChange } from './interface';

defineOptions({
    name: 'SemiColumnFilter',
});

interface RenderFilterDropdownProps {
    tempFilteredValue?: any[];
    setTempFilteredValue?: (value: any[]) => void;
    confirm?: (props?: { filteredValue?: any[]; closeDropdown?: boolean }) => void;
    clear?: (props?: { closeDropdown?: boolean }) => void;
    close?: () => void;
    filters?: Filter[];
}

interface Props {
    prefixCls?: string;
    filteredValue?: any[];
    filterIcon?: FilterIcon;
    filterDropdownProps?: any;
    onSelect?: (data: { value?: any; filteredValue: any[]; included?: boolean; domEvent?: Event }) => void;
    filterDropdownVisible?: boolean;
    renderFilterDropdown?: (props: RenderFilterDropdownProps & { initialFocusRef?: any }) => any;
    onFilterDropdownVisibleChange?: OnFilterDropdownVisibleChange;
    filters?: Filter[];
    filterMultiple?: boolean;
    level?: number;
}

const props = withDefaults(defineProps<Props>(), {
    prefixCls: cssClasses.PREFIX,
    filterMultiple: true,
    level: 0,
    filters: () => [],
    filteredValue: () => [],
});

const emit = defineEmits<{
    (e: 'select', data: { value?: any; filteredValue: any[]; included?: boolean; domEvent?: Event }): void;
}>();

const isFilterDropdownVisibleControlled = computed(() => typeof props.filterDropdownVisible !== 'undefined');

const tempFilteredValue = ref<any[]>(props.filteredValue || []);
const dropdownVisible = ref<boolean>(props.filterDropdownVisible ?? false);
const mergedVisible = computed<boolean>(() => {
    if (isFilterDropdownVisibleControlled.value) {
        return Boolean(props.filterDropdownVisible);
    }
    return dropdownVisible.value;
});

watch(
    () => props.filterDropdownVisible,
    (newVal) => {
        if (typeof newVal !== 'undefined') {
            dropdownVisible.value = newVal;
        }
    }
);

watch(
    () => props.filteredValue,
    (newVal) => {
        tempFilteredValue.value = newVal || [];
    },
    { deep: true }
);

const trigger = computed(() => 'click');
const position = computed(() => 'bottom');

const filterIconCls = computed(() =>
    classnames(`${props.prefixCls}-column-filter`, {
        on: (props.filteredValue || []).length > 0,
    })
);

const customFilterIcon = computed(() => {
    if (typeof props.filterIcon === 'function') {
        return () => props.filterIcon((props.filteredValue || []).length > 0);
    }
    if (props.filterIcon && props.filterIcon !== true && props.filterIcon !== false) {
        return () => props.filterIcon;
    }
    return null;
});

const isFilterChecked = (value: any) => {
    return (props.filteredValue || []).includes(value);
};

const handleFilterSelect = (filter: Filter, e: MouseEvent) => {
    if (e) {
        e.stopPropagation();
        // 仅阻止冒泡，避免 Dropdown 立即关闭；不要 preventDefault，以免影响 Checkbox 自身 click 行为
    }

    let values = [...(props.filteredValue || [])];
    const included = values.includes(filter.value);
    const idx = values.indexOf(filter.value);

    if (idx > -1) {
        values.splice(idx, 1);
    } else if (props.filterMultiple) {
        values.push(filter.value);
    } else {
        values = [filter.value];
    }

    if (props.onSelect) {
        props.onSelect({
            value: filter.value,
            filteredValue: values,
            included: !included,
            domEvent: e,
        });
    }
    emit('select', {
        value: filter.value,
        filteredValue: values,
        included: !included,
        domEvent: e,
    });
};

const confirm: RenderFilterDropdownProps['confirm'] = (confirmProps = {}) => {
    const newFilteredValue = confirmProps?.filteredValue || tempFilteredValue.value;
    if (!isEqual(newFilteredValue, props.filteredValue)) {
        if (props.onSelect) {
            props.onSelect({ filteredValue: newFilteredValue });
        }
        emit('select', { filteredValue: newFilteredValue });
    }
    if (confirmProps?.closeDropdown) {
        dropdownVisible.value = false;
    }
};

const clear: RenderFilterDropdownProps['clear'] = (clearProps: { closeDropdown?: boolean } = {}) => {
    tempFilteredValue.value = [];
    if (props.onSelect) {
        props.onSelect({ filteredValue: [] });
    }
    emit('select', { filteredValue: [] });
    if (clearProps.closeDropdown) {
        dropdownVisible.value = false;
    }
};

const close: RenderFilterDropdownProps['close'] = () => {
    dropdownVisible.value = false;
};

const handleFilterDropdownVisibleChange = (visible: boolean) => {
    // Tooltip/Dropdown 内部触发可见性变化时（例如 clickOutside/esc），非受控下同步回内部状态
    if (!isFilterDropdownVisibleControlled.value) {
        dropdownVisible.value = visible;
    }
    if (props.onFilterDropdownVisibleChange) {
        if (visible) {
            // 对齐 React 使用习惯：打开后立即 focus 输入框。
            // Vue 版本中 dropdown 内容通过 portal 挂载，visible-change 可能早于内容渲染完成，
            // 这里延后到 nextTick + rAF，确保内容已插入 DOM。
            nextTick(() => {
                requestAnimationFrame(() => props.onFilterDropdownVisibleChange?.(visible));
            });
        } else {
            props.onFilterDropdownVisibleChange(visible);
        }
    }
};

const renderFilterDropdownProps = computed<RenderFilterDropdownProps>(() => ({
    tempFilteredValue: tempFilteredValue.value,
    setTempFilteredValue: (value: any[]) => {
        tempFilteredValue.value = value;
    },
    confirm,
    clear,
    close,
    filters: props.filters,
}));

const renderDropdownContent = computed(() => {
    // 自定义筛选器：通过 render function 透传 Tooltip 的 initialFocusRef，
    // Tooltip 在打开时会调用 adapter.setInitialFocus，从而实现“打开后自动聚焦”（对齐 React demo）。
    if (typeof props.renderFilterDropdown === 'function') {
        return ({ initialFocusRef }: { initialFocusRef: any }) => {
            const component = props.renderFilterDropdown({
                ...renderFilterDropdownProps.value,
                initialFocusRef,
            });
            return isVNode(component) ? component : null;
        };
    }
    return h(DropdownMenu, {}, () =>
        props.filters.map((filter, index) =>
            h(
                DropdownItem,
                {
                    key: `${props.level}_${index}`,
                    onClick: (e: MouseEvent) => handleFilterSelect(filter, e),
                },
                () =>
                    props.filterMultiple
                        ? h(Checkbox, { checked: isFilterChecked(filter.value) }, () => filter.text)
                        : h(Radio, { checked: isFilterChecked(filter.value) }, () => filter.text)
            )
        )
    );
});
</script>
