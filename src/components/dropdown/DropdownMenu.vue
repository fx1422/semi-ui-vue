<template>
    <ul role="menu" aria-orientation="vertical" :class="menuClass" :style="props.style" @keydown="handleKeyDown">
        <slot></slot>
    </ul>
</template>

<script setup lang="ts" name="DropdownMenu">
import { computed, onMounted, ref } from 'vue';
import classnames from 'classnames';
import { cssClasses } from '@douyinfe/semi-foundation/dropdown/constants';
import DropdownMenuFoundation from '@douyinfe/semi-foundation/dropdown/menuFoundation';
import { useDropdownContext } from './context';
import type { DropdownMenuProps } from './interface';

const props = defineProps<DropdownMenuProps>();

const prefixCls = cssClasses.PREFIX;
const context = useDropdownContext();

let foundation: DropdownMenuFoundation;

const menuClass = computed(() => classnames(`${prefixCls}-menu`, props.className));

const adapter = {
    getContext: (key: string) => {
        return (context as any)[key];
    },
};

const handleKeyDown = (e: KeyboardEvent) => {
    if (foundation) {
        foundation.onMenuKeydown(e);
    }
};

onMounted(() => {
    foundation = new DropdownMenuFoundation(adapter);
});
</script>
