<template>
    <Base
        component="p"
        :className="paragraphClasses"
        :type="type"
        :size="size"
        :spacing="spacing"
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
        :style="style"
    >
        <slot></slot>
    </Base>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import classNames from 'classnames';
import { cssClasses } from '@douyinfe/semi-foundation/typography/constants';
import Base from './Base.vue';
import type { CopyableConfig, TypographyBaseType, TypographyBaseSize, TypographyBaseSpacing } from './interface';

defineOptions({
    name: 'Paragraph',
});

const prefixCls = cssClasses.PREFIX;

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
        size?: TypographyBaseSize;
        spacing?: TypographyBaseSpacing;
    }>(),
    {
        type: 'primary',
        size: 'normal',
        spacing: 'normal',
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

const paragraphClasses = computed(() => {
    return classNames(props.className, `${prefixCls}-paragraph`);
});

const deleteProp = props.delete;
</script>
