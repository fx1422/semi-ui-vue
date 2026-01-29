<template>
    <div
        :id="`semiTabPanel${itemKey}`"
        ref="tabPaneRef"
        role="tabpanel"
        :aria-labelledby="`semiTab${itemKey}`"
        :class="classNames"
        :style="style"
        :aria-hidden="active ? 'false' : 'true'"
        :tabindex="tabIndex || 0"
        x-semi-prop="children"
    >
        <CSSAnimation :motion="hasMotion" :animationState="active ? 'enter' : 'leave'" :startClassName="startClassName">
            <template #default="{ animationClassName, animationEventsNeedBind }">
                <div
                    :class="[cssClasses.TABS_PANE_MOTION_OVERLAY, animationClassName]"
                    x-semi-prop="children"
                    v-bind="animationEventsNeedBind"
                >
                    <slot v-if="shouldRender"></slot>
                </div>
            </template>
        </CSSAnimation>
    </div>
</template>

<script lang="ts" setup>
import { computed, inject, ref, watch } from 'vue';
import { cssClasses } from '@douyinfe/semi-foundation/tabs/constants';
import { TabsContextKey } from './context';
import type { TabPaneProps, PlainTab } from './interface';
import CSSAnimation from '../_cssAnimation/index.vue';

defineOptions({
    name: 'TabPane',
});

const props = defineProps<TabPaneProps>();

const tabPaneRef = ref<HTMLDivElement>();
const _active = ref(false);

const context = inject(TabsContextKey, {});

const active = computed(() => context.activeKey === props.itemKey);

if (active.value) {
    _active.value = true;
}

watch(active, (isActive) => {
    if (isActive) {
        _active.value = true;
    }
});

const classNames = computed(() => {
    return [
        props.className,
        {
            [cssClasses.TABS_PANE_INACTIVE]: !active.value,
            [cssClasses.TABS_PANE_ACTIVE]: active.value,
            [cssClasses.TABS_PANE]: true,
        },
    ];
});

const shouldRender = computed(() => {
    const { lazyRender } = context;
    return lazyRender ? _active.value : true;
});

const getDirection = (activeKey: string, itemKey: string, panes: Array<PlainTab>, lastActiveKey: string): boolean => {
    if (itemKey && activeKey && Array.isArray(panes) && panes.length) {
        const activeIndex = panes.findIndex((pane) => pane.itemKey === activeKey);
        const itemIndex = panes.findIndex((pane) => pane.itemKey === itemKey);
        const lastActiveIndex = panes.findIndex((pane) => pane.itemKey === lastActiveKey);

        if (activeIndex === itemIndex) {
            return lastActiveIndex > activeIndex;
        } else {
            return itemIndex < activeIndex;
        }
    }

    return false;
};

const startClassName = computed(() => {
    const direction = getDirection(context.activeKey, props.itemKey, context.panes || [], context.prevActiveKey);
    if (context.tabPosition === 'top') {
        if (direction) {
            return cssClasses.TABS_PANE_ANIMATE_RIGHT_SHOW;
        } else {
            return cssClasses.TABS_PANE_ANIMATE_LEFT_SHOW;
        }
    } else {
        if (direction) {
            return cssClasses.TABS_PANE_ANIMATE_BOTTOM_SHOW;
        } else {
            return cssClasses.TABS_PANE_ANIMATE_TOP_SHOW;
        }
    }
});

const isActivatedBecauseOtherTabPaneRemoved = computed(() => {
    return !(context.panes || []).find((tabPane) => tabPane.itemKey === context.prevActiveKey);
});

const hasMotion = computed(() => {
    return (
        context.tabPaneMotion &&
        active.value &&
        !isActivatedBecauseOtherTabPaneRemoved.value &&
        !context.forceDisableMotion
    );
});

defineExpose({
    tabPaneRef,
});
</script>
