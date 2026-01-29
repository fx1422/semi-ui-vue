<template>
    <component :is="stepComponent" v-bind="$attrs">
        <template v-for="(_, name) in $slots" #[name]="slotData">
            <slot :name="name" v-bind="slotData || {}" />
        </template>
    </component>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useStepsContext } from './context';
import BasicStep from './BasicStep.vue';
import FillStep from './FillStep.vue';
import NavStep from './NavStep.vue';

const context = useStepsContext();

const stepComponent = computed(() => {
    switch (context.type) {
        case 'fill':
            return FillStep;
        case 'basic':
            return BasicStep;
        case 'nav':
            return NavStep;
        default:
            return FillStep;
    }
});
</script>
