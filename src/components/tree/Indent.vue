<template>
    <span
        aria-hidden="true"
        :class="[
            `${prefixcls}-indent`,
            {
                [`${prefixcls}-indent-show-line`]: showLine,
            },
        ]"
    >
        <span
            v-for="(_, i) in level"
            :key="i"
            :class="[
                baseClassName,
                {
                    [`${baseClassName}-end`]: isEnd[i],
                },
            ]"
        />
    </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface IndentProps {
    prefixcls: string;
    level: number;
    isEnd: boolean[];
    showLine: boolean;
}

const props = defineProps<IndentProps>();

const baseClassName = computed(() => `${props.prefixcls}-indent-unit`);
</script>
