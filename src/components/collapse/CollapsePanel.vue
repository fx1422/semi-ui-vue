<template>
    <div :class="itemCls" v-bind="restProps">
        <div
            role="button"
            :tabIndex="0"
            :class="headerCls"
            :aria-disabled="disabled"
            :aria-expanded="active ? 'true' : 'false'"
            :aria-owns="ariaID"
            @click="handleClick"
        >
            <template v-if="showArrow && iconPosLeft">
                <span ref="headerExpandIconTriggerRef" aria-hidden="true" :class="iconCls">
                    <component :is="activeIcon" />
                </span>
            </template>

            <template v-if="typeof header === 'string'">
                <span>{{ header }}</span>
                <span :class="`${prefixCls}-header-right`">
                    <span>
                        <slot name="extra"></slot>
                    </span>
                    <template v-if="showArrow && !iconPosLeft">
                        <span ref="headerExpandIconTriggerRef" aria-hidden="true" :class="iconCls">
                            <component :is="activeIcon" />
                        </span>
                    </template>
                </span>
            </template>

            <template v-else>
                <component :is="header" v-if="isVNode(header)" />
                <template v-else>{{ header }}</template>
                <template v-if="showArrow && !iconPosLeft">
                    <span ref="headerExpandIconTriggerRef" aria-hidden="true" :class="iconCls">
                        <component :is="activeIcon" />
                    </span>
                </template>
            </template>
        </div>

        <Collapsible
            v-if="hasChildren"
            :lazyRender="lazyRender"
            :isOpen="active"
            :keepDOM="keepDOM"
            :motion="motion"
            :reCalcKey="reCalcKey"
            @motion-end="handleMotionEnd"
        >
            <div :id="ariaID" :class="contentCls" :aria-hidden="!active">
                <div :class="`${prefixCls}-content-wrapper`">
                    <slot></slot>
                </div>
            </div>
        </Collapsible>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, isVNode, useSlots, inject } from 'vue';
import classNames from 'classnames';
import { cssClasses } from '@douyinfe/semi-foundation/collapse/constants';
import { getUuidShort } from '@douyinfe/semi-foundation/utils/uuid';
import { IconChevronDown, IconChevronUp } from '../icons';
import Collapsible from '../collapsible/Collapsible.vue';
import type { CollapsePanelProps } from './interface';
import { CollapseContextKey, type CollapseContextValue } from './context';

const prefixCls = cssClasses.PREFIX;

const props = withDefaults(defineProps<CollapsePanelProps>(), {
    showArrow: true,
    disabled: false,
});

const slots = useSlots();

const headerExpandIconTriggerRef = ref<HTMLElement>();
const ariaID = ref('');

onMounted(() => {
    ariaID.value = getUuidShort({});
});

const injectedContext = inject(CollapseContextKey);

const contextRef = computed<CollapseContextValue>(() => {
    if (!injectedContext) {
        return {
            activeSet: new Set(),
            clickHeaderToExpand: true,
            keepDOM: false,
            expandIconPosition: 'right',
            onClick: () => {},
            motion: false,
            lazyRender: false,
        };
    }
    return 'value' in injectedContext ? injectedContext.value : (injectedContext as CollapseContextValue);
});

const active = computed(() => {
    return contextRef.value.activeSet?.has(props.itemKey) || false;
});

const hasChildren = computed(() => !!slots.default);

const iconPosLeft = computed(() => {
    return contextRef.value.expandIconPosition === 'left';
});

const expandIconEnable = computed(() => hasChildren.value && !props.disabled);

const lazyRender = computed(() => contextRef.value.lazyRender);
const keepDOM = computed(() => contextRef.value.keepDOM);
const motion = computed(() => {
    const motionValue = contextRef.value.motion;
    return typeof motionValue === 'boolean' ? motionValue : Boolean(motionValue);
});

const activeIcon = computed(() => {
    let expandIcon = contextRef.value.expandIcon;
    let collapseIcon = contextRef.value.collapseIcon;

    if (typeof expandIcon === 'undefined') {
        expandIcon = IconChevronDown;
    }
    if (typeof collapseIcon === 'undefined') {
        collapseIcon = IconChevronUp;
    }

    if (!expandIconEnable.value) {
        return expandIcon;
    }

    return active.value ? collapseIcon : expandIcon;
});

const itemCls = computed(() => {
    return classNames(props.className, {
        [`${prefixCls}-item`]: true,
    });
});

const headerCls = computed(() => {
    return classNames({
        [`${prefixCls}-header`]: true,
        [`${prefixCls}-header-disabled`]: props.disabled,
        [`${prefixCls}-header-iconLeft`]: iconPosLeft.value,
    });
});

const contentCls = computed(() => {
    return classNames({
        [`${prefixCls}-content`]: true,
    });
});

const iconCls = computed(() => {
    return classNames([`${prefixCls}-header-icon`, { [`${prefixCls}-header-iconDisabled`]: !expandIconEnable.value }]);
});

const restProps = computed(() => {
    const { style, ...rest } = props;
    return { style: style as any, ...rest };
});

const handleClick = (e: MouseEvent) => {
    if (props.disabled) return;

    const ctx = contextRef.value;
    if (ctx.clickHeaderToExpand || headerExpandIconTriggerRef.value?.contains(e.target as HTMLElement)) {
        ctx.onClick?.(props.itemKey, e);
    }
};

const handleMotionEnd = () => {
    props.onMotionEnd?.();
};
</script>
