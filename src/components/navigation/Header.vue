<template>
    <div :class="wrapCls" :style="style">
        <component :is="linkComponent" v-bind="linkProps">
            <i v-if="hasLogo" :class="`${cssClasses.PREFIX}-header-logo`">
                <slot name="logo">
                    <component :is="logo" v-if="typeof logo === 'object'" />
                    <template v-else-if="logo">{{ logo }}</template>
                </slot>
            </i>
            <span v-if="hasText && !navContext?.isCollapsed" :class="`${cssClasses.PREFIX}-header-text`">
                <slot name="text">
                    <component :is="text" v-if="typeof text === 'object'" />
                    <template v-else>{{ text }}</template>
                </slot>
            </span>
            <slot></slot>
        </component>
    </div>
</template>

<script setup lang="ts">
import { computed, inject, useSlots } from 'vue';
import classNames from 'classnames';
import { cssClasses } from '@douyinfe/semi-foundation/navigation/constants';
import isNullOrUndefined from '@douyinfe/semi-foundation/utils/isNullOrUndefined';
import type { NavHeaderProps } from './interface';
import { NavContextKey } from './context';
import type { CSSProperties } from 'vue';

defineOptions({
    name: 'NavHeader',
});

const props = withDefaults(defineProps<NavHeaderProps & { style?: CSSProperties }>(), {
    prefixCls: cssClasses.PREFIX,
});

const slots = useSlots();
const navContext = inject(NavContextKey, null);

const hasLogo = computed(() => {
    return Boolean(slots.logo || props.logo);
});

const hasText = computed(() => {
    return Boolean(slots.text || !isNullOrUndefined(props.text));
});

const wrapCls = computed(() =>
    classNames(props.className, `${cssClasses.PREFIX}-header`, {
        [`${cssClasses.PREFIX}-header-collapsed`]: navContext?.isCollapsed,
    })
);

const linkComponent = computed(() => {
    return typeof props.link === 'string' ? 'a' : 'div';
});

const linkProps = computed(() => {
    if (typeof props.link === 'string') {
        return {
            class: `${props.prefixCls}-header-link`,
            href: props.link,
            ...props.linkOptions,
        };
    }
    return {};
});
</script>
