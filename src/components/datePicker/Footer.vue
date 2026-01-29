<template>
    <div :class="wrapCls">
        <Button theme="borderless" @click="handleCancel">
            {{ cancelText }}
        </Button>
        <Button theme="solid" @click="handleConfirm">
            {{ confirmText }}
        </Button>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { get } from 'lodash-es';
import classNames from 'classnames';
import Button from '../button/Button.vue';
import { cssClasses } from '@douyinfe/semi-foundation/datePicker/constants';
import type { FooterProps } from './interface';

defineOptions({
    name: 'DatePickerFooter',
    inheritAttrs: false,
});

const props = withDefaults(defineProps<FooterProps>(), {
    prefixCls: cssClasses.PREFIX,
    locale: undefined,
    onCancel: undefined,
    onConfirm: undefined,
});

const wrapCls = computed(() => classNames(`${props.prefixCls}-footer`));

const cancelText = computed(() => get(props.locale, 'footer.cancel', ''));
const confirmText = computed(() => get(props.locale, 'footer.confirm', ''));

const handleCancel = (e: MouseEvent) => {
    props.onCancel?.(e);
};

const handleConfirm = (e: MouseEvent) => {
    props.onConfirm?.(e);
};
</script>
