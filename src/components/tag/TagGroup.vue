<script setup lang="ts">
import { computed, useSlots, VNode } from 'vue';
import classNames from 'classnames';
import { cssClasses } from '@douyinfe/semi-foundation/tag/constants';
import Tag from './Tag.vue';
import Popover from '../popover';
import Space from '../space';

const prefixCls = cssClasses.PREFIX;

interface TagGroupProps {
    style?: any;
    className?: string;
    maxTagCount?: number;
    restCount?: number;
    size?: 'small' | 'default' | 'large';
    showPopover?: boolean;
    popoverProps?: any;
    tagList?: VNode[];
}

const props = withDefaults(defineProps<TagGroupProps>(), {
    style: () => ({}),
    className: '',
    size: 'default',
    showPopover: false,
    popoverProps: () => ({}),
    tagList: () => [],
});

const emit = defineEmits<{
    (e: 'tagClose', tagContent: any, event: Event, tagKey?: string | number): void;
    (e: 'plusNMouseEnter', event: MouseEvent): void;
}>();

const slots = useSlots();

const groupCls = computed(() => {
    return classNames(
        {
            [`${prefixCls}-group`]: true,
            [`${prefixCls}-group-max`]: props.maxTagCount,
            [`${prefixCls}-group-small`]: props.size === 'small',
            [`${prefixCls}-group-large`]: props.size === 'large',
        },
        props.className
    );
});

const allChildren = computed(() => {
    const slotChildren = slots.default?.();
    if (slotChildren && slotChildren.length > 0) {
        const result: VNode[] = [];

        const flattenChildren = (vnodes: VNode[]) => {
            vnodes.forEach((child: VNode) => {
                if (!child) return;

                if (child.type?.toString().includes('Comment') || child.type?.toString().includes('v-cmt')) {
                    return;
                }

                if (child.type?.toString().includes('Fragment') || child.type?.toString().includes('v-fgt')) {
                    if (Array.isArray(child.children)) {
                        flattenChildren(child.children as VNode[]);
                    }
                } else {
                    result.push(child);
                }
            });
        };

        flattenChildren(slotChildren);
        if (result.length > 0) {
            return result;
        }
    }

    if (props.tagList && props.tagList.length > 0) {
        return props.tagList;
    }

    return [];
});

const displayTags = computed(() => {
    if (typeof props.maxTagCount === 'undefined') {
        return allChildren.value;
    }
    return allChildren.value.slice(0, props.maxTagCount);
});

const restTags = computed(() => {
    if (typeof props.maxTagCount === 'undefined') {
        return [];
    }
    return allChildren.value.slice(props.maxTagCount);
});

const restCount = computed(() => {
    if (typeof props.restCount !== 'undefined') {
        return props.restCount;
    }
    if (props.tagList && props.tagList.length > 0 && typeof props.maxTagCount !== 'undefined') {
        return props.tagList.length - props.maxTagCount;
    }
    return restTags.value.length;
});

const showRestTag = computed(() => {
    return typeof props.maxTagCount !== 'undefined' && restCount.value > 0;
});

function getTagKey(item: VNode, index: number) {
    return item.key ?? `tag-${index}`;
}

function handlePlusNMouseEnter(event: MouseEvent) {
    emit('plusNMouseEnter', event);
}

defineOptions({
    name: 'TagGroup',
});
</script>

<template>
    <div :class="groupCls" :style="style">
        <template v-for="(item, index) in displayTags" :key="getTagKey(item, index)">
            <component :is="item" v-if="item" />
        </template>

        <Popover
            v-if="showRestTag && showPopover"
            show-arrow
            trigger="hover"
            position="top"
            auto-adjust-overflow
            :class-name="`${prefixCls}-rest-group-popover`"
            v-bind="popoverProps"
        >
            <Tag
                :closable="false"
                :size="size"
                color="grey"
                :style="{ backgroundColor: 'transparent' }"
                @mouseenter="handlePlusNMouseEnter"
            >
                +{{ restCount }}
            </Tag>
            <template #content>
                <Space :spacing="2" wrap :style="{ maxWidth: '400px' }">
                    <template v-for="(item, index) in restTags" :key="getTagKey(item, index + (maxTagCount || 0))">
                        <component :is="item" />
                    </template>
                </Space>
            </template>
        </Popover>

        <Tag
            v-else-if="showRestTag && !showPopover"
            :closable="false"
            :size="size"
            color="grey"
            :style="{ backgroundColor: 'transparent' }"
            @mouseenter="handlePlusNMouseEnter"
        >
            +{{ restCount }}
        </Tag>
    </div>
</template>
