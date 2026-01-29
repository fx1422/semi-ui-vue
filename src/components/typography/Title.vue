<template>
    <Base
        :component="headingComponent"
        :heading="headingComponent"
        :type="type"
        :weight="weight"
        :code="code"
        :delete="deleteProp"
        :disabled="disabled"
        :ellipsis="ellipsis"
        :copyable="!!copyable"
        :mark="mark"
        :underline="underline"
        :strong="strong"
        :link="!!link"
        :link-options="typeof link === 'object' ? link : {}"
        :icon="icon"
        :className="className"
        :style="style"
    >
        <slot></slot>
    </Base>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Base from './Base.vue';
import type { CopyableConfig, TypographyBaseType, TitleHeading, TitleWeight } from './interface';
import { strings } from '@douyinfe/semi-foundation/typography/constants';

defineOptions({
    name: 'Title',
});

const props = withDefaults(
    defineProps<{
        className?: string;
        code?: boolean;
        component?: string;
        copyable?: CopyableConfig | boolean;
        delete?: boolean;
        disabled?: boolean;
        ellipsis?: any;
        icon?: any;
        link?: any;
        mark?: boolean;
        strong?: boolean;
        style?: any;
        type?: TypographyBaseType;
        underline?: boolean;
        heading?: TitleHeading;
        weight?: TitleWeight;
    }>(),
    {
        heading: 1,
        type: 'primary',
        code: false,
        delete: false,
        disabled: false,
        mark: false,
        underline: false,
        strong: false,
        link: false,
        ellipsis: undefined,
        copyable: false,
    }
);

const headingComponent = computed(() => {
    const { heading } = props;
    const validHeadings = strings.HEADING as readonly number[];
    return validHeadings.includes(heading) ? `h${heading}` : 'h1';
});

const deleteProp = props.delete;
</script>
