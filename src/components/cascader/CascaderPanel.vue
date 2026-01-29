<template>
    <ul :key="firstItemKey" role="menu" :class="`${prefixCls}-list`" @scroll="handleListScroll">
        <li
            v-for="item in data"
            :id="`cascaderItem-${item.key}`"
            :key="item.key"
            :class="getItemCls(item)"
            role="menuitem"
            :aria-expanded="isActive(item.key)"
            :aria-haspopup="hasExpandIcon(item)"
            :aria-disabled="item.data.disabled"
            :aria-owns="item.parentKey ? `cascaderItem-${item.parentKey}` : undefined"
            @click="(e) => handleItemClick(e, item)"
            @keypress="(e) => handleItemEnterPress(e, item)"
            @mouseenter="(e) => handleItemHover(e, item)"
        >
            <span :class="`${prefixCls}-label`">
                <template v-if="isSelected(item.key) && !multiple">
                    <IconTick :class="`${prefixCls}-icon ${prefixCls}-icon-active`" />
                </template>
                <template v-else-if="!isSelected(item.key) && !multiple">
                    <span :class="`${prefixCls}-icon ${prefixCls}-icon-empty`" aria-hidden="true"></span>
                </template>
                <template v-else-if="multiple">
                    <Checkbox
                        :key="item.key + '-' + checkedKeys.has(item.key)"
                        :checked="checkedKeys.has(item.key)"
                        :indeterminate="halfCheckedKeys.has(item.key)"
                        :disabled="item.data.disabled"
                        :class="`${prefixCls}-label-checkbox`"
                        :aria-label="item.key"
                        @click="(e) => handleCheckboxChange(e, item)"
                    />
                </template>
                <span>{{ item.data.label }}</span>
            </span>
            <template v-if="hasExpandIcon(item)">
                <template v-if="isLoading(item.key)">
                    <Spin :class="`${prefixCls}-spin-icon`" />
                </template>
                <template v-else>
                    <component
                        :is="expandIcon || IconChevronRight"
                        :class="`${prefixCls}-icon ${prefixCls}-icon-expand ${prefixCls}-icon-left`"
                    />
                </template>
            </template>
        </li>
    </ul>
    <CascaderPanel
        v-if="activeChildItem && activeChildItem.children && activeChildItem.children.length > 0"
        :data="activeChildItem.children"
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
        :panel-index="panelIndex + 1"
    />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import classNames from 'classnames';
import { cssClasses } from '@douyinfe/semi-foundation/cascader/constants';
import { IconChevronRight, IconTick } from '../icons';
import Checkbox from '../checkbox';
import Spin from '../spin';
import isEnterPress from '@douyinfe/semi-foundation/utils/isEnterPress';
import type { Entity } from './interface';

defineOptions({
    name: 'CascaderPanel',
});

const prefixCls = cssClasses.PREFIX_OPTION;

interface CascaderPanelProps {
    data: Entity[];
    activeKeys: Set<string>;
    selectedKeys: Set<string>;
    checkedKeys: Set<string>;
    halfCheckedKeys: Set<string>;
    loadedKeys: Set<string>;
    loadingKeys: Set<string>;
    multiple: boolean;
    showNext: 'click' | 'hover';
    expandIcon?: any;
    loadData?: (selectOptions: any[]) => Promise<void>;
    onItemClick: (e: MouseEvent | KeyboardEvent, item: Entity) => void;
    onItemHover: (e: MouseEvent, item: Entity) => void;
    onItemCheckboxClick: (item: Entity) => void;
    onListScroll: (e: UIEvent, ind: number) => void;
    panelIndex: number;
}

const props = defineProps<CascaderPanelProps>();

const firstItemKey = computed(() => {
    return props.data.length > 0 ? props.data[0].key : 'empty';
});

const activeChildItem = computed(() => {
    // 优先展示 activeKeys 中最后加入的（最近交互的）项
    // 解决多选模式下，可能存在多个同级 active key 导致展示错误子菜单的问题
    const activeKeysList = Array.from(props.activeKeys);
    for (let i = activeKeysList.length - 1; i >= 0; i--) {
        const key = activeKeysList[i];
        const item = props.data.find((d) => d.key === key);
        if (item) {
            const { children } = item.data;
            const hasChild = Boolean(children) && children.length;
            if (hasChild) {
                return item;
            }
        }
    }
    return undefined;
});

const getItemCls = (item: Entity) => {
    const active = props.activeKeys.has(item.key);
    const selected = props.selectedKeys.has(item.key);
    return classNames(prefixCls, {
        [`${prefixCls}-active`]: active && !selected,
        [`${prefixCls}-select`]: selected && !props.multiple,
        [`${prefixCls}-disabled`]: item.data.disabled,
    });
};

const isActive = (key: string) => {
    return props.activeKeys.has(key);
};

const isSelected = (key: string) => {
    return props.selectedKeys.has(key);
};

const isLoading = (key: string) => {
    return props.loadingKeys.has(key) && !props.loadedKeys.has(key);
};

const hasExpandIcon = (item: Entity): boolean => {
    const { children, isLeaf } = item.data;
    const hasChild = Boolean(children && children.length);
    return hasChild || Boolean(props.loadData && !isLeaf);
};

const handleItemClick = (e: MouseEvent | KeyboardEvent, item: Entity) => {
    if (item.data.disabled) {
        return;
    }
    props.onItemClick(e, item);
};

const handleItemEnterPress = (e: KeyboardEvent, item: Entity) => {
    if (isEnterPress(e)) {
        handleItemClick(e, item);
    }
};

const handleItemHover = (e: MouseEvent, item: Entity) => {
    if (item.data.disabled) {
        return;
    }
    if (props.showNext === 'hover') {
        props.onItemHover(e, item);
    }
};

const handleCheckboxChange = (e: any, item: Entity) => {
    e.stopPropagation();
    if (e.nativeEvent && typeof e.nativeEvent.stopImmediatePropagation === 'function') {
        e.nativeEvent.stopImmediatePropagation();
    }
    props.onItemCheckboxClick(item);
};

const handleListScroll = (e: Event) => {
    props.onListScroll(e as UIEvent, props.panelIndex);
};
</script>
