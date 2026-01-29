<template>
    <!-- Custom Header Rendering via Slot -->
    <template v-if="$slots.default">
        <slot v-bind="props.headerConfig.type === 'left' ? headerProps : selectedHeaderProps" />
    </template>
    <!-- Custom Header Rendering via Render Function -->
    <component
        :is="renderSourceHeader(headerProps)"
        v-else-if="props.headerConfig.type === 'left' && renderSourceHeader"
    />
    <component
        :is="renderSelectedHeader(selectedHeaderProps)"
        v-else-if="props.headerConfig.type === 'right' && renderSelectedHeader"
    />
    <!-- Default Header Rendering -->
    <div v-else :class="headerCls">
        <span :class="`${prefixCls}-header-total`">{{ props.headerConfig.totalContent }}</span>
        <Button
            v-if="props.headerConfig.showButton"
            theme="borderless"
            :disabled="disabled"
            type="tertiary"
            size="small"
            :class="`${prefixCls}-header-all`"
            @click="props.headerConfig.onAllClick"
        >
            {{ props.headerConfig.allContent }}
        </Button>
    </div>
</template>

<script setup lang="ts">
import { computed, VNode } from 'vue';
import cls from 'classnames';
import { cssClasses } from '@douyinfe/semi-foundation/transfer/constants';
import Button from '../button/Button.vue';
import { HeaderConfig, SourceHeaderProps, SelectedHeaderProps } from './interface';

defineOptions({
    name: 'TransferHeader',
});

const props = defineProps<{
    headerConfig: HeaderConfig;
    disabled?: boolean;
    renderSourceHeader?: (props: SourceHeaderProps) => VNode;
    renderSelectedHeader?: (props: SelectedHeaderProps) => VNode;
}>();

const prefixCls = cssClasses.PREFIX;

const headerCls = computed(() =>
    cls({
        [`${prefixCls}-header`]: true,
        [`${prefixCls}-right-header`]: props.headerConfig.type === 'right',
        [`${prefixCls}-left-header`]: props.headerConfig.type === 'left',
    })
);

const headerProps = computed<SourceHeaderProps>(() => ({
    num: props.headerConfig.num!,
    showButton: props.headerConfig.showButton!,
    allChecked: props.headerConfig.allChecked!,
    onAllClick: props.headerConfig.onAllClick!,
}));

const selectedHeaderProps = computed<SelectedHeaderProps>(() => ({
    num: props.headerConfig.num!,
    showButton: props.headerConfig.showButton!,
    onClear: props.headerConfig.onAllClick!,
}));
</script>
