<template>
    <Base
        component="span"
        :type="props.type"
        :size="props.size"
        :weight="props.weight"
        :code="props.code"
        :delete="deleteProp"
        :disabled="props.disabled"
        :ellipsis="props.ellipsis"
        :copyable="!!props.copyable"
        :mark="props.mark"
        :underline="props.underline"
        :strong="props.strong"
        :link="!!props.link"
        :link-options="typeof props.link === 'object' ? props.link : {}"
        :icon="props.icon"
        :className="props.className"
        :style="props.style"
    >
        <slot></slot>
    </Base>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Base from './Base.vue';

defineOptions({
    name: 'Text',
});

const props = withDefaults(
    defineProps<{
        className?: string;
        code?: boolean;
        component?: string;
        copyable?: any;
        delete?: boolean;
        disabled?: boolean;
        ellipsis?: any;
        icon?: any;
        link?: any;
        mark?: boolean;
        strong?: boolean;
        style?: any;
        type?: 'primary' | 'secondary' | 'tertiary' | 'quaternary' | 'warning' | 'danger' | 'success';
        underline?: boolean;
        size?: 'normal' | 'small' | 'inherit';
        weight?: any;
    }>(),
    {
        type: 'primary',
        size: 'normal',
        code: false,
        delete: false,
        disabled: false,
        mark: false,
        underline: false,
        strong: false,
        link: false,
        copyable: false,
    }
);

const deleteProp = computed(() => props.delete);
</script>
