<template>
    <div v-if="customRender" :key="`custom-${tagKey}`" :class="itemWrapperCls">
        <component :is="dragHandleComponent" v-if="showDragHandle" />
        <component :is="customRender" />
    </div>
    <Tag
        v-else
        :key="`tag-${tagKey}`"
        :class="tagCls"
        color="white"
        :size="size === 'small' ? 'small' : 'large'"
        type="light"
        :onClose="handleClose"
        :closable="!disabled"
        :visible="true"
        :aria-label="`${!disabled ? 'Closable ' : ''}Tag: ${value}`"
    >
        <component :is="dragHandleComponent" v-if="showDragHandle" />
        <Paragraph :class="typoCls" :ellipsis="{ showTooltip: showContentTooltip, rows: 1 }">
            {{ value }}
        </Paragraph>
    </Tag>
</template>

<script setup lang="ts">
import { computed, h, type VNode } from 'vue';
import cls from 'classnames';
import Tag from '../tag/Tag.vue';
import { Paragraph } from '../typography';
import { IconHandle } from '../icons';
import type { ShowTooltip } from '../typography/interface';

interface TagItemProps {
    value: string;
    index: number;
    prefixCls: string;
    size?: 'small' | 'default' | 'large';
    disabled?: boolean;
    showContentTooltip?: boolean | ShowTooltip;
    showIconHandler?: boolean;
    draggable?: boolean;
    sortableHandle?: any;
    customRender?: VNode | null;
    onClose: () => void;
}

const props = withDefaults(defineProps<TagItemProps>(), {
    size: 'default',
    disabled: false,
    showContentTooltip: true,
    showIconHandler: false,
    draggable: false,
});

const tagCls = computed(() =>
    cls(`${props.prefixCls}-wrapper-tag`, {
        [`${props.prefixCls}-wrapper-tag-size-${props.size}`]: props.size,
        [`${props.prefixCls}-wrapper-tag-icon`]: props.showIconHandler,
    })
);

const typoCls = computed(() =>
    cls(`${props.prefixCls}-wrapper-typo`, {
        [`${props.prefixCls}-wrapper-typo-disabled`]: props.disabled,
    })
);

const itemWrapperCls = computed(() =>
    cls({
        [`${props.prefixCls}-drag-item`]: props.showIconHandler,
        [`${props.prefixCls}-wrapper-tag-icon`]: props.showIconHandler,
    })
);

const tagKey = computed(() => {
    return props.draggable ? props.value : `${props.index}${props.value}`;
});

const showDragHandle = computed(() => props.showIconHandler && props.sortableHandle);

const dragHandleComponent = computed(() => {
    if (!showDragHandle.value) return null;
    return props.sortableHandle(() => h(IconHandle, { class: `${props.prefixCls}-drag-handler` }));
});

const handleClose = () => {
    if (!props.disabled) {
        props.onClose();
    }
};
</script>
