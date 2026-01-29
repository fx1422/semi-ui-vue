<template>
    <div :class="metaCls" :style="style">
        <div v-if="avatar" :class="avatarCls">
            <slot name="avatar">
                {{ avatar }}
            </slot>
        </div>
        <div v-if="hasContent" :class="contentCls">
            <div v-if="hasTitle" :class="titleCls">
                <slot name="title">
                    {{ title }}
                </slot>
            </div>
            <div v-if="hasDescription" :class="descriptionCls">
                <slot name="description">
                    {{ description }}
                </slot>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import cls from 'classnames';
import { cssClasses } from '@douyinfe/semi-foundation/card/constants';
import type { VNode, CSSProperties } from 'vue';

interface MetaProps {
    avatar?: VNode;
    className?: string;
    description?: VNode | string;
    style?: CSSProperties;
    title?: VNode | string;
}

const prefixcls = cssClasses.PREFIX;

const props = withDefaults(defineProps<MetaProps>(), {});

const metaCls = computed(() => cls(`${prefixcls}-meta`, props.className));
const avatarCls = computed(() => `${prefixcls}-meta-avatar`);
const contentCls = computed(() => `${prefixcls}-meta-content`);
const titleCls = computed(() => `${prefixcls}-meta-title`);
const descriptionCls = computed(() => `${prefixcls}-meta-description`);

const hasTitle = computed(() => {
    return props.title !== undefined && props.title !== null && props.title !== '';
});

const hasDescription = computed(() => {
    return props.description !== undefined && props.description !== null && props.description !== '';
});

const hasContent = computed(() => {
    return hasTitle.value || hasDescription.value;
});
</script>
