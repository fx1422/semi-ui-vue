<template>
    <div :class="groupCls" role="list">
        <template v-for="(item, index) in renderAvatars" :key="index">
            <component :is="item" />
        </template>
    </div>
</template>

<script setup lang="ts">
import { computed, VNode, cloneVNode, h, useSlots, Fragment } from 'vue';
import { cssClasses } from '@douyinfe/semi-foundation/avatar/constants';
import { AvatarGroupProps } from './interface';
import Avatar from './Avatar.vue';

const prefixCls = cssClasses.PREFIX;
const slots = useSlots();

const props = withDefaults(defineProps<AvatarGroupProps>(), {
    size: 'medium',
    shape: 'circle',
    overlapFrom: 'start',
});

const getAllAvatars = (): VNode[] => {
    const defaultSlot = slots.default?.() || [];
    // Filter out comment nodes and fragments
    return defaultSlot
        .flatMap((node) => {
            if (node.type === Fragment) {
                return node.children as VNode[];
            }
            return node;
        })
        .filter((node) => typeof node.type === 'object');
};

const renderMoreAvatar = (restNumber: number, restAvatars: VNode[]): VNode => {
    const moreCls = `${prefixCls}-item-more`;

    // Simplify alt text generation to avoid invoking slots outside of render context
    const finalAlt = `+${restNumber}`;

    if (typeof props.renderMore === 'function') {
        const rendered = props.renderMore(restNumber, restAvatars);
        // Use cloneVNode to add a key safely, avoiding h(Fragment, ...) which can have type issues.
        return rendered ? cloneVNode(rendered, { key: '_more' }) : null;
    }

    return h(Avatar, { class: moreCls, alt: finalAlt, key: '_more' }, () => `+${restNumber}`);
};

const getMergeAvatars = (avatars: VNode[]): VNode[] => {
    const { maxCount } = props;
    if (!maxCount || avatars.length <= maxCount) {
        return avatars;
    }

    const normalAvatars = avatars.slice(0, maxCount);
    const restAvatars = avatars.slice(maxCount);
    const restNumber = avatars.length - maxCount;

    if (restNumber > 0) {
        const more = renderMoreAvatar(restNumber, restAvatars);
        normalAvatars.push(more);
    }
    return normalAvatars;
};

const groupCls = computed(() => `${prefixCls}-group`);

const renderAvatars = computed(() => {
    const avatars = getAllAvatars();
    const mergedAvatars = getMergeAvatars(avatars);

    return mergedAvatars.map((itm, index) => {
        const itemProps = (itm.props || {}) as Record<string, any>;
        const existingClass = itemProps.class || '';

        const className = [
            existingClass,
            {
                [`${prefixCls}-item-start-${index}`]: props.overlapFrom === 'start',
                [`${prefixCls}-item-end-${index}`]: props.overlapFrom === 'end',
            },
        ];

        return cloneVNode(itm, {
            ...itemProps,
            class: className,
            size: props.size,
            shape: props.shape,
        });
    });
});
</script>

<style scoped></style>
